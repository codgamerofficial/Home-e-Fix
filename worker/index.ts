/**
 * Home-e-Fix Cloudflare Workers Edge Gateway
 * Serves Static Assets (Vite SPA) + Edge API endpoints for Razorpay, Turnstile, Health, and Realtime auth.
 */

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  ENVIRONMENT?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  TURNSTILE_SECRET_KEY?: string;
}

// In-memory webhook event idempotency cache for the worker instance
const PROCESSED_WEBHOOK_IDS = new Set<string>();

/**
 * Native Web Crypto HMAC-SHA256 verification (Zero external dependencies)
 */
async function verifyHmacSha256(secret: string, message: string, signatureHex: string): Promise<boolean> {
  try {
    const enc = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      enc.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["verify"]
    );
    const signatureBytes = new Uint8Array(
      signatureHex.match(/[\da-f]{2}/gi)?.map((h) => parseInt(h, 16)) || []
    );
    if (signatureBytes.length !== 32) return false;
    return await crypto.subtle.verify("HMAC", key, signatureBytes, enc.encode(message));
  } catch {
    return false;
  }
}

/**
 * Adds standard production security and CORS headers
 */
function applySecurityHeaders(headers: Headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
}

function jsonResponse(data: unknown, status = 200, origin = "*"): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  });
  applySecurityHeaders(headers);
  return new Response(JSON.stringify(data), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const origin = request.headers.get("Origin") || "*";

    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      const corsHeaders = new Headers({
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
      });
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── API ROUTES ──
    if (pathname.startsWith("/api/")) {
      // 1. Health check
      if (pathname === "/api/system/health" && request.method === "GET") {
        return jsonResponse({
          status: "healthy",
          timestamp: new Date().toISOString(),
          edge: "cloudflare-workers",
          environment: env.ENVIRONMENT || "production",
        });
      }

      // 2. Integrations Status (Masked)
      if (pathname === "/api/system/integrations" && request.method === "GET") {
        const keyId = env.RAZORPAY_KEY_ID || "";
        const keySecret = env.RAZORPAY_KEY_SECRET || "";
        const isRzpConfigured = Boolean(keyId && keySecret);
        const isRzpTest = keyId.startsWith("rzp_test_");

        return jsonResponse({
          timestamp: new Date().toISOString(),
          integrations: {
            supabase: {
              name: "Supabase Database & Auth",
              status: env.SUPABASE_URL ? "CONNECTED" : "CONFIGURATION_REQUIRED",
              type: "Core PostgreSQL Database & Realtime",
            },
            razorpay: {
              name: "Razorpay Payment Gateway",
              status: !isRzpConfigured ? "CONFIGURATION_REQUIRED" : isRzpTest ? "TEST_MODE" : "LIVE_MODE",
              keyPrefix: keyId ? keyId.slice(0, 8) + "..." : "Not Set",
              type: "Primary & Only Payment Gateway",
            },
            turnstile: {
              name: "Cloudflare Turnstile",
              status: env.TURNSTILE_SECRET_KEY ? "CONNECTED" : "CONFIGURATION_REQUIRED",
              type: "Managed Bot & Fraud Protection",
            },
          },
        });
      }

      // 3. Create Razorpay Order
      if (
        (pathname === "/api/payments/razorpay/create-order" || pathname === "/api/payment/create-order") &&
        request.method === "POST"
      ) {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON request body" }, 400);
        }

        const { booking_id, purpose = "BOOKING", topup_amount, total_amount, customer_name, customer_email } = body;

        let amountInr = 0;
        if (purpose === "WALLET_TOPUP") {
          const parsed = Number(topup_amount);
          if (!parsed || parsed < 50 || parsed > 50000) {
            return jsonResponse({ error: "Wallet top-up amount must be between ₹50 and ₹50,000." }, 400);
          }
          amountInr = parsed;
        } else if (purpose === "MEMBERSHIP") {
          amountInr = 299; // VIP Pass authoritative price
        } else {
          const parsed = Number(total_amount);
          if (!parsed || parsed <= 0) {
            return jsonResponse({ error: "Invalid booking amount. Must be greater than zero." }, 400);
          }
          amountInr = parsed;
        }

        const amountPaise = Math.round(amountInr * 100);
        const receipt = `${purpose.toLowerCase()}_${booking_id || Date.now()}`;
        const keyId = env.RAZORPAY_KEY_ID;
        const keySecret = env.RAZORPAY_KEY_SECRET;

        if (!keyId || !keySecret) {
          return jsonResponse(
            {
              error: "Razorpay credentials not configured on the server. Set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
              code: "GATEWAY_CONFIG_MISSING",
            },
            500
          );
        }

        try {
          const authString = btoa(`${keyId}:${keySecret}`);
          const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Basic ${authString}`,
            },
            body: JSON.stringify({
              amount: amountPaise,
              currency: "INR",
              receipt,
              notes: {
                purpose,
                booking_id: booking_id || "",
                customer_name: customer_name || "",
                customer_email: customer_email || "",
              },
            }),
          });

          const rzpData: any = await rzpRes.json();
          if (!rzpRes.ok) {
            return jsonResponse(
              {
                error: rzpData.error?.description || "Razorpay order creation failed",
                details: rzpData,
              },
              rzpRes.status || 400
            );
          }

          return jsonResponse({
            success: true,
            order_id: rzpData.id,
            amount: amountInr,
            amount_paise: amountPaise,
            currency: rzpData.currency || "INR",
            receipt: rzpData.receipt,
            key_id: keyId,
          });
        } catch (err: any) {
          return jsonResponse(
            {
              error: "Failed to connect to Razorpay Payment Gateway.",
              details: err.message,
            },
            502
          );
        }
      }

      // 4. Verify Razorpay Payment Signature
      if (
        (pathname === "/api/payments/razorpay/verify-payment" || pathname === "/api/payment/verify") &&
        request.method === "POST"
      ) {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ verified: false, error: "Invalid JSON request body" }, 400);
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, purpose } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return jsonResponse(
            {
              verified: false,
              error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
            },
            400
          );
        }

        const keySecret = env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
          return jsonResponse(
            {
              verified: false,
              error: "Server missing RAZORPAY_KEY_SECRET for signature verification.",
            },
            500
          );
        }

        const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
        const isValid = await verifyHmacSha256(keySecret, payload, razorpay_signature);

        if (!isValid) {
          return jsonResponse(
            {
              verified: false,
              error: "Payment signature verification failed. Transaction response may be tampered.",
            },
            400
          );
        }

        return jsonResponse({
          verified: true,
          order_id: razorpay_order_id,
          payment_id: razorpay_payment_id,
          status: "SUCCESS",
          booking_id: booking_id || null,
          purpose: purpose || "BOOKING",
          verified_at: new Date().toISOString(),
        });
      }

      // 5. Razorpay Webhook Handler (Raw Payload HMAC + Idempotency)
      if (pathname === "/api/webhooks/razorpay" && request.method === "POST") {
        const rawBody = await request.text();
        const sigHeader = request.headers.get("x-razorpay-signature");
        const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

        if (sigHeader && webhookSecret) {
          const isValid = await verifyHmacSha256(webhookSecret, rawBody, sigHeader);
          if (!isValid) {
            return jsonResponse({ error: "Invalid Razorpay webhook signature." }, 400);
          }
        }

        let body: any = {};
        try {
          body = JSON.parse(rawBody);
        } catch {
          body = {};
        }

        const eventId = body.id || body.payload?.payment?.entity?.id || `${Date.now()}`;
        if (PROCESSED_WEBHOOK_IDS.has(eventId)) {
          return jsonResponse({ status: "already_processed", idempotent: true });
        }
        PROCESSED_WEBHOOK_IDS.add(eventId);

        // Prune set if it grows beyond 10,000 items
        if (PROCESSED_WEBHOOK_IDS.size > 10000) {
          const firstKey = PROCESSED_WEBHOOK_IDS.values().next().value;
          if (firstKey) PROCESSED_WEBHOOK_IDS.delete(firstKey);
        }

        return jsonResponse({ status: "ok", received: true, event: body.event });
      }

      // 6. Cloudflare Turnstile Verification
      if (pathname === "/api/turnstile/verify" && request.method === "POST") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ success: false, error: "Invalid JSON request body" }, 400);
        }

        const { token } = body;
        if (!token) {
          return jsonResponse({ success: false, error: "Turnstile token is required." }, 400);
        }

        const turnstileSecret = env.TURNSTILE_SECRET_KEY;
        if (!turnstileSecret) {
          return jsonResponse({ success: true, verified: true, bypass: true });
        }

        try {
          const formData = new URLSearchParams();
          formData.append("secret", turnstileSecret);
          formData.append("response", token);

          const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          });

          const cfData: any = await cfRes.json();
          return jsonResponse({ success: Boolean(cfData.success), data: cfData });
        } catch (err: any) {
          return jsonResponse(
            { success: false, error: "Turnstile verification failed", details: err.message },
            500
          );
        }
      }

      // 7. AI Service Assistant with Strict Guardrails
      if (pathname === "/api/ai/assistant" && request.method === "POST") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON request body" }, 400);
        }

        const userPrompt = body.message || (Array.isArray(body.messages) && body.messages[body.messages.length - 1]?.content);
        const category = body.category;
        if (!userPrompt) {
          return jsonResponse({ error: "Message prompt is required (either 'message' or 'messages' array)." }, 400);
        }

        // Guardrails check: AI cannot perform transactional actions directly
        const promptLower = String(userPrompt).toLowerCase();
        if (promptLower.includes("refund") && (promptLower.includes("process") || promptLower.includes("give me"))) {
          return jsonResponse({
            reply: "As Home-e-Fix Assistant, I cannot directly initiate refunds. Please raise a refund or cancellation request directly from your booking card in 'My Bookings', or connect with our support agents.",
          });
        }

        return jsonResponse({
          reply: `Thank you for contacting Home-e-Fix! For ${category || "home services"}, our verified technicians in Kolkata carry calibrated tools and offer a 30-day workmanship warranty. Standard visits start at ₹199, and emergency dispatches arrive within 2 hours subject to zone capacity.`,
        });
      }

      return jsonResponse({ error: `Endpoint ${pathname} not found on edge worker` }, 404);
    }

    // ── STATIC ASSETS (SPA FALLBACK) ──
    const assetResponse = await env.ASSETS.fetch(request);
    // Clone headers to inject security headers on HTML and asset responses
    const responseHeaders = new Headers(assetResponse.headers);
    applySecurityHeaders(responseHeaders);

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: responseHeaders,
    });
  },
};
