/**
 * Home-e-Fix Cloudflare Workers Edge Gateway
 * Serves Static Assets (Vite SPA) + Edge API endpoints for Razorpay, Turnstile, Health, OTP Relay, and AI Assistant.
 * Built for Cloudflare Workers Static Assets architecture.
 */

export interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  ENVIRONMENT?: string;
  OTP_PROVIDER_MODE?: "development" | "production";
  SMS_GATEWAY_URL?: string;
  SMS_GATEWAY_API_KEY?: string;
  SMS_GATEWAY_SENDER_ID?: string;
  SMS_GATEWAY_DLT_TEMPLATE_ID?: string;
  RAZORPAY_KEY_ID?: string;
  RAZORPAY_KEY_SECRET?: string;
  RAZORPAY_WEBHOOK_SECRET?: string;
  SUPABASE_URL?: string;
  SUPABASE_SECRET_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_ANON_KEY?: string;
  OTP_RESEND_COOLDOWN_SECONDS?: string;
  OTP_MAX_REQUESTS_PER_HOUR?: string;
  TWOFACTOR_API_KEY?: string;
  TWOFACTOR_TEMPLATE_ID?: string;
  TWOFACTOR_SENDER_ID?: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_HOSTNAMES?: string;
  ALLOWED_ORIGINS?: string;
}

import { handleRequestOtp } from "../cloudflare/home-e-fix-auth/src/routes/requestOtp";

// In-memory idempotency and rate limiting caches (Worker instance lifecycle)
const PROCESSED_WEBHOOK_IDS = new Set<string>();
const IP_RATE_LIMITS = new Map<string, number[]>();

// In-memory Edge OTP store (stores SHA-256 hash, never plaintext)
interface EdgeOtpRecord {
  otpHash: string;
  expiresAt: string;
  resendAvailableAt: string;
  attemptCount: number;
  maxAttempts: number;
  verifiedAt: string | null;
}
const EDGE_OTP_STORE = new Map<string, EdgeOtpRecord>();

/**
 * Structured Observability Logging (Safe & Searchable JSON)
 * Never logs OTP values, passwords, secret keys, or KYC document contents.
 */
function logInfo(event: string, meta: Record<string, unknown> = {}) {
  console.log(JSON.stringify({ timestamp: new Date().toISOString(), level: "INFO", event, ...meta }));
}

function logError(event: string, meta: Record<string, unknown> = {}) {
  console.error(JSON.stringify({ timestamp: new Date().toISOString(), level: "ERROR", event, ...meta }));
}

/**
 * Sliding window IP-based rate limiting helper
 */
function checkRateLimit(key: string, maxHits = 15, windowSeconds = 60): boolean {
  const now = Date.now();
  const windowMs = windowSeconds * 1000;
  const timestamps = (IP_RATE_LIMITS.get(key) || []).filter((t) => now - t < windowMs);

  if (timestamps.length >= maxHits) {
    return false; // Limit exceeded
  }

  timestamps.push(now);
  IP_RATE_LIMITS.set(key, timestamps);

  // Prune map if it grows too large
  if (IP_RATE_LIMITS.size > 5000) {
    const oldestKey = IP_RATE_LIMITS.keys().next().value;
    if (oldestKey) IP_RATE_LIMITS.delete(oldestKey);
  }

  return true;
}

/**
 * Computes a secure SHA-256 hash using native Web Crypto API
 */
async function hashString(input: string): Promise<string> {
  const enc = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(input));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

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
 * Evaluates origin against allowed whitelist (prevents wildcard CORS on sensitive routes)
 */
function resolveCorsOrigin(requestOrigin: string | null, customOrigins?: string): string {
  if (!requestOrigin) return "*";

  // Allow local development ports
  if (
    requestOrigin.startsWith("http://localhost:") ||
    requestOrigin.startsWith("http://127.0.0.1:") ||
    requestOrigin.endsWith(".pages.dev") ||
    requestOrigin.endsWith(".workers.dev") ||
    requestOrigin === "https://home-e-fix.com" ||
    requestOrigin === "https://www.home-e-fix.com"
  ) {
    return requestOrigin;
  }

  if (customOrigins) {
    const allowed = customOrigins.split(",").map((o) => o.trim());
    if (allowed.includes(requestOrigin)) return requestOrigin;
  }

  return "https://home-e-fix.com";
}

/**
 * Injects standard production security headers and Content Security Policy (CSP)
 */
function applySecurityHeaders(headers: Headers, isAsset = false) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "SAMEORIGIN");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");

  if (!isAsset) {
    headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' https://challenges.cloudflare.com https://checkout.razorpay.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' data: blob: https:; connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.razorpay.com https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com https://api.razorpay.com; base-uri 'self'; form-action 'self';"
    );
  }
}

function jsonResponse(data: unknown, status = 200, origin = "*"): Response {
  const headers = new Headers({
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature, x-turnstile-token",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Cache-Control": "private, no-store, no-cache, must-revalidate",
    "Pragma": "no-cache",
  });
  applySecurityHeaders(headers, true);
  return new Response(JSON.stringify(data), { status, headers });
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const requestOrigin = request.headers.get("Origin");
    const safeOrigin = resolveCorsOrigin(requestOrigin, env.ALLOWED_ORIGINS);
    const clientIp = request.headers.get("CF-Connecting-IP") || "127.0.0.1";

    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      const corsHeaders = new Headers({
        "Access-Control-Allow-Origin": safeOrigin,
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature, x-turnstile-token",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Max-Age": "86400",
      });
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    // ── API ROUTES ──
    if (pathname.startsWith("/api/")) {
      // 0. Canonical Production Health Check
      if ((pathname === "/api/health" || pathname === "/api/system/health") && request.method === "GET") {
        return jsonResponse({
          ok: true,
          status: "healthy",
          service: "home-e-fix-auth",
          timestamp: new Date().toISOString(),
          edge: "cloudflare-workers",
          environment: env.ENVIRONMENT || "production",
          dependencies: {
            turnstile: (env.TURNSTILE_SECRET || env.TURNSTILE_SECRET_KEY) ? "configured" : "unconfigured",
            supabase: env.SUPABASE_URL ? "configured" : "unconfigured",
            smsProvider: (env.TWOFACTOR_API_KEY || env.SMS_GATEWAY_URL) ? "configured" : "development_fallback",
          },
        }, 200, safeOrigin);
      }

      // 0.1 Request OTP Endpoint (Temporarily Disabled in favor of Google OAuth)
      if (pathname === "/api/auth/request-otp" && (request.method === "POST" || request.method === "GET")) {
        return jsonResponse({
          success: false,
          code: "PHONE_OTP_DISABLED",
          error: "Phone OTP authentication is temporarily disabled in favor of Google OAuth. Please use Google Sign-In.",
        }, 410, safeOrigin);
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
              name: "Supabase Database, Auth & KYC Storage",
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
            otpService: {
              name: "Home-e-Fix OTP Edge Service",
              status: "ACTIVE",
              mode: env.OTP_PROVIDER_MODE || "development",
              smsGateway: env.SMS_GATEWAY_URL ? "CONFIGURED" : "DEVELOPMENT_PROVIDER",
            },
          },
        }, 200, safeOrigin);
      }

      // 3. Edge Professional Phone OTP - Request OTP
      if (pathname === "/api/otp/send" && request.method === "POST") {
        // Enforce IP Rate Limiting (max 5 OTP requests per 5 minutes per IP)
        if (!checkRateLimit(`otp_send_ip_${clientIp}`, 5, 300)) {
          logError("rate_limit_exceeded_otp_ip", { ip: clientIp });
          return jsonResponse({ error: "Too many OTP requests from this connection. Please wait." }, 429, safeOrigin);
        }

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON request body" }, 400, safeOrigin);
        }

        const { phone, purpose = "professional_registration", turnstileToken } = body;
        if (!phone || typeof phone !== "string") {
          return jsonResponse({ error: "Valid mobile number is required." }, 400, safeOrigin);
        }

        // Normalize Indian Mobile Number
        const digits = phone.replace(/\D/g, "");
        const cleanPhone = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
        if (!/^[6-9][0-9]{9}$/.test(cleanPhone)) {
          return jsonResponse({ error: "Please enter a valid 10-digit Indian mobile number." }, 400, safeOrigin);
        }
        const normalizedPhone = `+91${cleanPhone}`;

        // Validate Turnstile token if provided or configured
        const candidateTurnstileToken = turnstileToken || request.headers.get("x-turnstile-token");
        const turnstileSecretKey = env.TURNSTILE_SECRET || env.TURNSTILE_SECRET_KEY;
        if (turnstileSecretKey && candidateTurnstileToken && candidateTurnstileToken !== "dev_turnstile_bypass_token") {
          try {
            const formData = new URLSearchParams();
            formData.append("secret", turnstileSecretKey);
            formData.append("response", candidateTurnstileToken);
            if (clientIp) formData.append("remoteip", clientIp);

            const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
              method: "POST",
              headers: { "Content-Type": "application/x-www-form-urlencoded" },
              body: formData.toString(),
            });
            const cfData: any = await cfRes.json();
            if (!cfData.success) {
              logError("otp_turnstile_rejected", { phoneMasked: `+91 ••••••${cleanPhone.slice(-4)}` });
              return jsonResponse({ error: "Turnstile security challenge failed. Please complete the captcha." }, 403, safeOrigin);
            }
          } catch (err: any) {
            logError("otp_turnstile_error", { error: err.message });
          }
        }

        // Enforce Per-Phone Rate Limiting (max 5 OTP requests per hour per phone)
        if (!checkRateLimit(`otp_send_phone_${normalizedPhone}`, 5, 3600)) {
          logError("rate_limit_exceeded_otp_phone", { phoneMasked: `+91 ••••••${cleanPhone.slice(-4)}` });
          return jsonResponse({ error: "Too many OTP requests for this phone number. Please wait an hour." }, 429, safeOrigin);
        }

        const mode = (env.OTP_PROVIDER_MODE || "development").toLowerCase();
        const isProd = env.ENVIRONMENT === "production";

        // Hard safety check: never permit development OTP in production
        if (isProd && mode === "development") {
          logError("fatal_security_config", { detail: "Development OTP mode attempted in production environment" });
          return jsonResponse({ error: "OTP service unavailable." }, 500, safeOrigin);
        }

        // Generate cryptographically secure 6-digit numeric OTP
        const uintArray = new Uint32Array(1);
        crypto.getRandomValues(uintArray);
        const otpCode = String(100000 + (uintArray[0] % 900000));
        const otpHash = await hashString(otpCode);

        const now = Date.now();
        const expiresAt = new Date(now + 5 * 60 * 1000).toISOString();
        const resendAvailableAt = new Date(now + 45 * 1000).toISOString();

        // Enforce cooldown if an active OTP already exists
        const recordKey = `${normalizedPhone}:${purpose}`;
        const existing = EDGE_OTP_STORE.get(recordKey);
        if (existing && new Date(existing.resendAvailableAt).getTime() > now) {
          const waitSeconds = Math.ceil((new Date(existing.resendAvailableAt).getTime() - now) / 1000);
          return jsonResponse({ error: `Please wait ${waitSeconds}s before requesting a new OTP.` }, 429, safeOrigin);
        }

        // Store hashed OTP
        EDGE_OTP_STORE.set(recordKey, {
          otpHash,
          expiresAt,
          resendAvailableAt,
          attemptCount: 0,
          maxAttempts: 5,
          verifiedAt: null,
        });

        if (mode === "development") {
          logInfo("otp_dispatched_dev", {
            phoneMasked: `+91 ••••••${cleanPhone.slice(-4)}`,
            purpose,
          });

          return jsonResponse({
            success: true,
            message: `OTP sent to +91 ••••••${cleanPhone.slice(-4)}`,
            resendAvailableAt,
            expiresAt,
            devOtp: otpCode, // Only returned in local development mode
          }, 200, safeOrigin);
        }

        // Production: Dispatch SMS via configured Gateway
        const smsGatewayUrl = env.SMS_GATEWAY_URL;
        const smsApiKey = env.SMS_GATEWAY_API_KEY;
        if (!smsGatewayUrl || !smsApiKey) {
          logError("sms_gateway_unconfigured", { detail: "Production SMS gateway missing credentials" });
          return jsonResponse({ error: "SMS delivery service temporarily unconfigured." }, 502, safeOrigin);
        }

        try {
          const smsRes = await fetch(smsGatewayUrl, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${smsApiKey}`,
            },
            body: JSON.stringify({
              sender: env.SMS_GATEWAY_SENDER_ID || "HEFFIX",
              template_id: env.SMS_GATEWAY_DLT_TEMPLATE_ID,
              phone: normalizedPhone,
              otp: otpCode,
            }),
          });

          if (!smsRes.ok) {
            logError("sms_gateway_failed", { status: smsRes.status });
            return jsonResponse({ error: "Failed to dispatch SMS through telecom provider." }, 502, safeOrigin);
          }

          logInfo("otp_dispatched_production", {
            phoneMasked: `+91 ••••••${cleanPhone.slice(-4)}`,
            purpose,
          });

          return jsonResponse({
            success: true,
            message: `OTP sent to +91 ••••••${cleanPhone.slice(-4)}`,
            resendAvailableAt,
            expiresAt,
          }, 200, safeOrigin);
        } catch (err: any) {
          logError("sms_dispatch_exception", { error: err.message });
          return jsonResponse({ error: "SMS dispatch network error.", details: err.message }, 502, safeOrigin);
        }
      }

      // 4. Edge Professional Phone OTP - Verify OTP
      if (pathname === "/api/otp/verify" && request.method === "POST") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ verified: false, error: "Invalid JSON request body" }, 400, safeOrigin);
        }

        const { phone, code, purpose = "professional_registration" } = body;
        if (!phone || !code || typeof code !== "string" || !/^[0-9]{6}$/.test(code.trim())) {
          return jsonResponse({ verified: false, error: "Valid 6-digit numeric OTP required." }, 400, safeOrigin);
        }

        const digits = phone.replace(/\D/g, "");
        const cleanPhone = digits.length === 12 && digits.startsWith("91") ? digits.slice(2) : digits;
        const normalizedPhone = `+91${cleanPhone}`;

        const recordKey = `${normalizedPhone}:${purpose}`;
        const record = EDGE_OTP_STORE.get(recordKey);

        if (!record) {
          return jsonResponse({ verified: false, error: "No active OTP request found. Request a new OTP." }, 404, safeOrigin);
        }

        // Replay Attack Prevention
        if (record.verifiedAt) {
          return jsonResponse({ verified: false, error: "This OTP has already been used. Request a new OTP." }, 400, safeOrigin);
        }

        // Expiry check (5 minutes)
        if (new Date(record.expiresAt).getTime() < Date.now()) {
          return jsonResponse({ verified: false, error: "This OTP has expired. Request a new OTP." }, 400, safeOrigin);
        }

        // Brute-force attempt limits (max 5 attempts)
        if (record.attemptCount >= record.maxAttempts) {
          return jsonResponse({ verified: false, error: "Maximum attempts exceeded. Request a new OTP." }, 429, safeOrigin);
        }

        record.attemptCount++;
        const candidateHash = await hashString(code.trim());

        if (candidateHash !== record.otpHash) {
          const remaining = record.maxAttempts - record.attemptCount;
          return jsonResponse({
            verified: false,
            error: "That OTP is incorrect. Please check and try again.",
            remainingAttempts: remaining,
          }, 400, safeOrigin);
        }

        // Invalidate OTP immediately upon success
        record.verifiedAt = new Date().toISOString();

        // Generate cryptographically random verification token
        const tokenBytes = new Uint8Array(24);
        crypto.getRandomValues(tokenBytes);
        const verificationToken = Array.from(tokenBytes).map((b) => b.toString(16).padStart(2, "0")).join("");

        logInfo("otp_verified_successfully", {
          phoneMasked: `+91 ••••••${cleanPhone.slice(-4)}`,
          purpose,
        });

        return jsonResponse({
          success: true,
          verified: true,
          phone: normalizedPhone,
          purpose,
          verificationToken,
          verifiedAt: record.verifiedAt,
        }, 200, safeOrigin);
      }

      // 5. Create Razorpay Order
      if (
        (pathname === "/api/payments/razorpay/create-order" || pathname === "/api/payment/create-order") &&
        request.method === "POST"
      ) {
        if (!checkRateLimit(`pay_order_${clientIp}`, 10, 60)) {
          return jsonResponse({ error: "Too many payment order requests. Please wait." }, 429, safeOrigin);
        }

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON request body" }, 400, safeOrigin);
        }

        const { booking_id, purpose = "BOOKING", topup_amount, total_amount, customer_name, customer_email } = body;

        let amountInr = 0;
        if (purpose === "WALLET_TOPUP") {
          const parsed = Number(topup_amount);
          if (!parsed || parsed < 50 || parsed > 50000) {
            return jsonResponse({ error: "Wallet top-up amount must be between ₹50 and ₹50,000." }, 400, safeOrigin);
          }
          amountInr = parsed;
        } else if (purpose === "MEMBERSHIP") {
          amountInr = 299; // VIP Pass authoritative price
        } else {
          const parsed = Number(total_amount);
          if (!parsed || parsed <= 0) {
            return jsonResponse({ error: "Invalid booking amount. Must be greater than zero." }, 400, safeOrigin);
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
            500,
            safeOrigin
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
              rzpRes.status || 400,
              safeOrigin
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
          }, 200, safeOrigin);
        } catch (err: any) {
          return jsonResponse(
            {
              error: "Failed to connect to Razorpay Payment Gateway.",
              details: err.message,
            },
            502,
            safeOrigin
          );
        }
      }

      // 6. Verify Razorpay Payment Signature
      if (
        (pathname === "/api/payments/razorpay/verify-payment" || pathname === "/api/payment/verify") &&
        request.method === "POST"
      ) {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ verified: false, error: "Invalid JSON request body" }, 400, safeOrigin);
        }

        const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, purpose } = body;

        if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
          return jsonResponse(
            {
              verified: false,
              error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
            },
            400,
            safeOrigin
          );
        }

        const keySecret = env.RAZORPAY_KEY_SECRET;
        if (!keySecret) {
          return jsonResponse(
            {
              verified: false,
              error: "Server missing RAZORPAY_KEY_SECRET for signature verification.",
            },
            500,
            safeOrigin
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
            400,
            safeOrigin
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
        }, 200, safeOrigin);
      }

      // 7. Razorpay Webhook Handler (Raw Payload HMAC + Idempotency)
      if (pathname === "/api/webhooks/razorpay" && request.method === "POST") {
        const rawBody = await request.text();
        const sigHeader = request.headers.get("x-razorpay-signature");
        const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET || env.RAZORPAY_KEY_SECRET;

        if (sigHeader && webhookSecret) {
          const isValid = await verifyHmacSha256(webhookSecret, rawBody, sigHeader);
          if (!isValid) {
            return jsonResponse({ error: "Invalid Razorpay webhook signature." }, 400, safeOrigin);
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
          return jsonResponse({ status: "already_processed", idempotent: true }, 200, safeOrigin);
        }
        PROCESSED_WEBHOOK_IDS.add(eventId);

        if (PROCESSED_WEBHOOK_IDS.size > 10000) {
          const firstKey = PROCESSED_WEBHOOK_IDS.values().next().value;
          if (firstKey) PROCESSED_WEBHOOK_IDS.delete(firstKey);
        }

        return jsonResponse({ status: "ok", received: true, event: body.event }, 200, safeOrigin);
      }

      // 8. Cloudflare Turnstile Verification
      if (pathname === "/api/turnstile/verify" && request.method === "POST") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ success: false, error: "Invalid JSON request body" }, 400, safeOrigin);
        }

        const token = body.token || request.headers.get("x-turnstile-token");
        const action = body.action;

        if (!token || typeof token !== "string" || token.length === 0 || token.length > 2048) {
          return jsonResponse({ success: false, verified: false, error: "Valid Turnstile token is required." }, 400, safeOrigin);
        }

        const turnstileSecret = env.TURNSTILE_SECRET || env.TURNSTILE_SECRET_KEY;
        if (!turnstileSecret) {
          return jsonResponse({ success: true, verified: true, bypass: true, action }, 200, safeOrigin);
        }

        // Test mode / development bypass token
        if (token === "dev_turnstile_bypass_token" || token.startsWith("1x00000000000000000000AA")) {
          return jsonResponse({ success: true, verified: true, bypass: true, action }, 200, safeOrigin);
        }

        try {
          const formData = new URLSearchParams();
          formData.append("secret", turnstileSecret);
          formData.append("response", token);
          if (clientIp) formData.append("remoteip", clientIp);

          const cfRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
            method: "POST",
            headers: { "Content-Type": "application/x-www-form-urlencoded" },
            body: formData.toString(),
          });

          const cfData: any = await cfRes.json();
          if (!cfRes.ok || !cfData.success) {
            logError("turnstile_verification_failed", {
              errorCodes: cfData["error-codes"],
              clientIp,
              action,
            });
            return jsonResponse(
              {
                success: false,
                verified: false,
                error: "Security verification challenge failed. Please complete the captcha.",
                errorCodes: cfData["error-codes"],
              },
              403,
              safeOrigin
            );
          }

          if (action && cfData.action && cfData.action !== action) {
            logError("turnstile_action_mismatch", {
              expected: action,
              actual: cfData.action,
            });
            return jsonResponse(
              {
                success: false,
                verified: false,
                error: `Security verification action mismatch. Expected: ${action}.`,
              },
              403,
              safeOrigin
            );
          }

          const allowedHostnames = (
            env.TURNSTILE_HOSTNAMES ||
            "home-e-fix.vercel.app,localhost,127.0.0.1"
          )
            .split(",")
            .map((h: string) => h.trim().toLowerCase())
            .filter(Boolean);

          if (allowedHostnames.length > 0 && cfData.hostname) {
            const cfHost = cfData.hostname.toLowerCase();
            const isHostAllowed = allowedHostnames.some(
              (h: string) => h === cfHost || cfHost.endsWith(`.${h}`)
            );
            if (!isHostAllowed) {
              logError("turnstile_hostname_mismatch", {
                allowed: allowedHostnames,
                actual: cfData.hostname,
              });
              return jsonResponse(
                {
                  success: false,
                  verified: false,
                  error: `Security verification hostname mismatch. Host: ${cfData.hostname}.`,
                },
                403,
                safeOrigin
              );
            }
          }

          logInfo("turnstile_verified_successfully", {
            action: cfData.action || action,
            hostname: cfData.hostname,
          });

          return jsonResponse({
            success: true,
            verified: true,
            action: cfData.action || action,
            hostname: cfData.hostname,
            challenge_ts: cfData.challenge_ts,
          }, 200, safeOrigin);
        } catch (err: any) {
          logError("turnstile_upstream_error", { error: err.message });
          return jsonResponse(
            { success: false, verified: false, error: "Turnstile verification service error.", details: err.message },
            500,
            safeOrigin
          );
        }
      }

      // 9. AI Service Assistant with Strict Guardrails
      if (pathname === "/api/ai/assistant" && request.method === "POST") {
        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON request body" }, 400, safeOrigin);
        }

        const userPrompt = body.message || (Array.isArray(body.messages) && body.messages[body.messages.length - 1]?.content);
        const category = body.category;
        if (!userPrompt) {
          return jsonResponse({ error: "Message prompt is required." }, 400, safeOrigin);
        }

        // Guardrails check: AI cannot perform transactional actions directly
        const promptLower = String(userPrompt).toLowerCase();
        if (promptLower.includes("refund") && (promptLower.includes("process") || promptLower.includes("give me"))) {
          return jsonResponse({
            reply: "As Home-e-Fix Assistant, I cannot directly initiate refunds. Please raise a refund or cancellation request directly from your booking card in 'My Bookings', or connect with our support team.",
          }, 200, safeOrigin);
        }

        return jsonResponse({
          reply: `Thank you for contacting Home-e-Fix! For ${category || "home services"}, our verified technicians in Kolkata carry calibrated tools and offer a 30-day workmanship warranty. Standard visits start at ₹199, and emergency dispatches arrive within 2 hours subject to zone capacity.`,
        }, 200, safeOrigin);
      }

      // 10. Private KYC Signed Upload URL Generator
      if (pathname === "/api/kyc/upload-url" && request.method === "POST") {
        const supabaseUrl = env.SUPABASE_URL;
        const serviceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

        if (!supabaseUrl || !serviceRoleKey) {
          return jsonResponse({ error: "Storage service is temporarily unavailable." }, 503, safeOrigin);
        }

        let body: any = {};
        try {
          body = await request.json();
        } catch {
          return jsonResponse({ error: "Invalid JSON request payload." }, 400, safeOrigin);
        }

        const { docType, fileName, fileSize, mimeType, userId: clientUserId } = body;
        const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
        const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);
        const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

        if (!fileSize || typeof fileSize !== "number" || fileSize > MAX_FILE_SIZE_BYTES) {
          return jsonResponse({ error: "File size must be 10 MB or less." }, 400, safeOrigin);
        }

        if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
          return jsonResponse({ error: "Please upload a PDF, JPG, JPEG, PNG, or WEBP file." }, 400, safeOrigin);
        }

        const rawExt = typeof fileName === "string" ? fileName.split(".").pop()?.toLowerCase() : "";
        if (!rawExt || !ALLOWED_EXTENSIONS.has(rawExt)) {
          return jsonResponse({ error: "Invalid file extension. Allowed formats: .pdf, .jpg, .jpeg, .png, .webp" }, 400, safeOrigin);
        }

        const authHeader = request.headers.get("authorization") || "";
        const token = authHeader.replace(/^Bearer\s+/i, "").trim();
        let authenticatedUserId: string | null = null;

        if (token) {
          try {
            const userRes = await fetch(`${supabaseUrl}/auth/v1/user`, {
              headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${token}`,
              },
            });
            if (userRes.ok) {
              const uData: any = await userRes.json();
              authenticatedUserId = uData?.id || null;
            }
          } catch {
            // fallback
          }
        }

        const finalUserId = authenticatedUserId || clientUserId;
        if (!finalUserId) {
          return jsonResponse({ error: "Please sign in before uploading your documents." }, 401, safeOrigin);
        }

        const CATEGORY_MAP: Record<string, string> = {
          IDENTITY_DOCUMENT: "government-id",
          identity_document: "government-id",
          BANK_DOCUMENT: "bank-proof",
          bank_document: "bank-proof",
          SKILL_CERTIFICATE: "certification",
          skill_certificate: "certification",
          PROFESSIONAL_CERTIFICATE: "certification",
          professional_certificate: "certification",
          PROFILE_PHOTO: "profile-photo",
          profile_photo: "profile-photo",
        };
        const folder = CATEGORY_MAP[docType] || "documents";
        const uniqueId = `doc_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        const storagePath = `${finalUserId}/${folder}/${uniqueId}.${rawExt}`;

        try {
          const signRes = await fetch(
            `${supabaseUrl}/storage/v1/object/upload/sign/professional-kyc/${storagePath}`,
            {
              method: "POST",
              headers: {
                apikey: serviceRoleKey,
                Authorization: `Bearer ${serviceRoleKey}`,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({ upsert: true }),
            }
          );

          if (!signRes.ok) {
            const errText = await signRes.text();
            logError("kyc_sign_error", { errText });
            return jsonResponse({ error: "We couldn't initialize document upload right now. Please try again." }, 500, safeOrigin);
          }

          const signData: any = await signRes.json();
          const signedUrl = `${supabaseUrl}/storage/v1${signData.url}`;
          const tokenMatch = signedUrl.match(/[?&]token=([^&]+)/);
          const uploadToken = tokenMatch ? tokenMatch[1] : "";

          return jsonResponse({
            success: true,
            storagePath,
            signedUrl,
            token: uploadToken,
          }, 200, safeOrigin);
        } catch (err: any) {
          logError("kyc_upload_exception", { error: err.message });
          return jsonResponse({ error: "Failed to generate upload URL. Please try again." }, 500, safeOrigin);
        }
      }

      return jsonResponse({ error: `Endpoint ${pathname} not found on edge worker` }, 404, safeOrigin);
    }

    // ── STATIC ASSETS (SPA FALLBACK & EDGE CDN CACHING) ──
    const assetResponse = await env.ASSETS.fetch(request);
    const responseHeaders = new Headers(assetResponse.headers);

    const isAsset =
      pathname.startsWith("/assets/") ||
      pathname.endsWith(".js") ||
      pathname.endsWith(".css") ||
      pathname.endsWith(".webp") ||
      pathname.endsWith(".png") ||
      pathname.endsWith(".svg") ||
      pathname.endsWith(".woff2");

    applySecurityHeaders(responseHeaders, isAsset);

    if (isAsset) {
      // Fingerprinted assets: cache for 1 year immutable
      responseHeaders.set("Cache-Control", "public, max-age=31536000, immutable");
    } else {
      // HTML documents: must revalidate so clients get updates immediately
      responseHeaders.set("Cache-Control", "public, max-age=0, must-revalidate");
    }

    return new Response(assetResponse.body, {
      status: assetResponse.status,
      statusText: assetResponse.statusText,
      headers: responseHeaders,
    });
  },
};
