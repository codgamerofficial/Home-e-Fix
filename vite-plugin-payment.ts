import type { Plugin } from "vite";
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";

/**
 * Loads key-value pairs from .env into process.env if not already present
 */
function loadEnvFile(root: string) {
  const envPath = path.resolve(root, ".env");
  if (!fs.existsSync(envPath)) return;
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim();
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

// In-memory idempotency cache for webhook events
const PROCESSED_WEBHOOK_IDS = new Set<string>();

/**
 * Vite Plugin: Home-e-Fix Local Payment & Integration Server
 * Implements server-side Razorpay Order creation, HMAC verification,
 * webhooks, integration health monitoring, and AI assistant routing.
 */
export function paymentServerPlugin(): Plugin {
  return {
    name: "home-e-fix-payment-server",
    configureServer(server) {
      loadEnvFile(server.config.root);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/")) {
          return next();
        }

        const url = new URL(req.url, "http://localhost:5173");
        const pathname = url.pathname;

        const sendJson = (statusCode: number, data: any) => {
          res.writeHead(statusCode, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization, x-razorpay-signature, x-webhook-signature",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          });
          res.end(JSON.stringify(data));
        };

        if (req.method === "OPTIONS") {
          return sendJson(200, { ok: true });
        }

        // Parse Raw and JSON Body
        let rawBody = "";
        let body: any = {};
        try {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }
          rawBody = Buffer.concat(buffers).toString("utf-8");
          if (rawBody && (req.headers["content-type"] || "").includes("application/json")) {
            body = JSON.parse(rawBody);
          }
        } catch (e: any) {
          return sendJson(400, { error: "Invalid JSON request body", details: e.message });
        }

        const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
        const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

        // ── 0. SYSTEM HEALTH CHECK ──
        if (pathname === "/api/system/health" && req.method === "GET") {
          return sendJson(200, {
            status: "healthy",
            timestamp: new Date().toISOString(),
            edge: "vite-dev-proxy",
            environment: process.env.NODE_ENV || "development",
          });
        }

        // ── 1. SYSTEM INTEGRATIONS HEALTH CHECK ──
        if (pathname === "/api/system/integrations" && req.method === "GET") {
          const getStatus = (configured: boolean, isTest?: boolean, disabled?: boolean) => {
            if (disabled) return "DISABLED";
            if (!configured) return "CONFIGURATION_REQUIRED";
            return isTest ? "TEST_MODE" : "LIVE_MODE";
          };

          const isRzpConfigured = Boolean(keyId && keySecret);
          const isRzpTest = keyId.startsWith("rzp_test_");

          const suUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const suKey = process.env.VITE_SUPABASE_ANON_KEY || process.env.SUPABASE_SECRET_KEY;

          const mapKey = process.env.MAPMYINDIA_MAP_API_KEY || process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.VITE_MAP_API_KEY;
          const resendKey = process.env.RESEND_API_KEY;
          const aiKey = process.env.GEMINI_API_KEY || process.env.OPENROUTER_API_KEY;
          const turnstileKey = process.env.TURNSTILE_SECRET_KEY;
          const sentryKey = process.env.SENTRY_DSN;

          return sendJson(200, {
            timestamp: new Date().toISOString(),
            integrations: {
              supabase: {
                name: "Supabase Database & Auth",
                status: suUrl && suKey ? "CONNECTED" : "CONFIGURATION_REQUIRED",
                type: "Core PostgreSQL Database & Realtime",
              },
              razorpay: {
                name: "Razorpay Payment Gateway",
                status: getStatus(isRzpConfigured, isRzpTest),
                keyPrefix: keyId ? keyId.slice(0, 8) + "..." : "Not Set",
                type: "Primary Payment Provider",
              },
              maps: {
                name: "Geolocation & Maps (Google / Mappls)",
                status: mapKey ? "CONNECTED" : "CONFIGURATION_REQUIRED",
                type: "Address Autocomplete & Geocoding",
              },
              resend: {
                name: "Resend Transactional Email",
                status: resendKey ? "CONNECTED" : "CONFIGURATION_REQUIRED",
                type: "Transactional Email Engine",
              },
              ai: {
                name: "Home-e-Fix AI Assistant (Gemini)",
                status: aiKey ? "CONNECTED" : "CONFIGURATION_REQUIRED",
                provider: process.env.AI_PROVIDER || "gemini",
                type: "Customer Service & Booking Assistant",
              },
              turnstile: {
                name: "Cloudflare Turnstile",
                status: turnstileKey ? "CONNECTED" : "CONFIGURATION_REQUIRED",
                type: "Bot & Fraud Protection",
              },
              sentry: {
                name: "Sentry Observability",
                status: sentryKey ? "CONNECTED" : "CONFIGURATION_REQUIRED",
                type: "Error & Performance Monitoring",
              },
            },
          });
        }

        // ── 2. CREATE ORDER ENDPOINT (RAZORPAY ONLY) ──
        if ((pathname === "/api/payment/create-order" || pathname === "/api/payments/razorpay/create-order") && req.method === "POST") {
          const { booking_id, purpose = "BOOKING", topup_amount, total_amount, customer_name, customer_email } = body;

          let amountInr = 0;
          if (purpose === "WALLET_TOPUP") {
            const parsed = Number(topup_amount);
            if (!parsed || parsed < 50 || parsed > 50000) {
              return sendJson(400, { error: "Wallet top-up amount must be between ₹50 and ₹50,000." });
            }
            amountInr = parsed;
          } else if (purpose === "MEMBERSHIP") {
            amountInr = 299; // VIP Pass authoritative price
          } else {
            const parsed = Number(total_amount);
            if (!parsed || parsed <= 0) {
              return sendJson(400, { error: "Invalid booking amount. Must be greater than zero." });
            }
            amountInr = parsed;
          }

          const amountPaise = Math.round(amountInr * 100);
          const receipt = `${purpose.toLowerCase()}_${booking_id || Date.now()}`;

          if (!keyId || !keySecret) {
            return sendJson(500, {
              error: "Razorpay credentials not configured on the server. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET.",
              code: "GATEWAY_CONFIG_MISSING",
            });
          }

          try {
            const authHeader = Buffer.from(`${keyId}:${keySecret}`).toString("base64");
            const rzpRes = await fetch("https://api.razorpay.com/v1/orders", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Basic ${authHeader}`,
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
              return sendJson(rzpRes.status || 400, {
                error: rzpData.error?.description || "Razorpay order creation failed",
                details: rzpData,
              });
            }

            return sendJson(200, {
              success: true,
              order_id: rzpData.id,
              amount: amountInr,
              amount_paise: amountPaise,
              currency: rzpData.currency || "INR",
              receipt: rzpData.receipt,
              key_id: keyId,
            });
          } catch (err: any) {
            return sendJson(502, {
              error: "Failed to connect to Razorpay Payment Gateway.",
              details: err.message,
            });
          }
        }

        // ── 3. VERIFY PAYMENT ENDPOINT (RAZORPAY ONLY) ──
        if ((pathname === "/api/payment/verify" || pathname === "/api/payments/razorpay/verify-payment") && req.method === "POST") {
          const { razorpay_order_id, razorpay_payment_id, razorpay_signature, booking_id, purpose } = body;

          if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
            return sendJson(400, {
              verified: false,
              error: "Missing required fields: razorpay_order_id, razorpay_payment_id, razorpay_signature",
            });
          }

          if (!keySecret) {
            return sendJson(500, {
              verified: false,
              error: "Server missing RAZORPAY_KEY_SECRET for signature verification.",
            });
          }

          const generatedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

          const isValid = generatedSignature === razorpay_signature;
          if (!isValid) {
            return sendJson(400, {
              verified: false,
              error: "Payment signature verification failed. Transaction response may be tampered.",
            });
          }

          return sendJson(200, {
            verified: true,
            order_id: razorpay_order_id,
            payment_id: razorpay_payment_id,
            status: "SUCCESS",
            booking_id: booking_id || null,
            purpose: purpose || "BOOKING",
            verified_at: new Date().toISOString(),
          });
        }

        // ── 4. RAZORPAY WEBHOOK ENDPOINT (RAW BODY & IDEMPOTENCY) ──
        if (pathname === "/api/webhooks/razorpay" && req.method === "POST") {
          const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
          const sigHeader = req.headers["x-razorpay-signature"] as string;

          if (sigHeader && webhookSecret) {
            const expectedSig = crypto
              .createHmac("sha256", webhookSecret)
              .update(rawBody)
              .digest("hex");

            if (expectedSig !== sigHeader) {
              return sendJson(400, { error: "Invalid Razorpay webhook signature." });
            }
          }

          const eventId = body.id || body.payload?.payment?.entity?.id || `${Date.now()}`;
          if (PROCESSED_WEBHOOK_IDS.has(eventId)) {
            return sendJson(200, { status: "already_processed", idempotent: true });
          }
          PROCESSED_WEBHOOK_IDS.add(eventId);

          return sendJson(200, { status: "ok", received: true, event: body.event });
        }

        // ── 5. CLOUDFLARE TURNSTILE BOT PROTECTION ENDPOINT ──
        if (pathname === "/api/turnstile/verify" && req.method === "POST") {
          const token = body.token || (req.headers["x-turnstile-token"] as string);
          const action = body.action;

          if (!token || typeof token !== "string" || token.length === 0 || token.length > 2048) {
            return sendJson(400, { success: false, verified: false, error: "Valid Turnstile token is required." });
          }

          const turnstileSecret = process.env.TURNSTILE_SECRET || process.env.TURNSTILE_SECRET_KEY;
          if (!turnstileSecret) {
            return sendJson(200, { success: true, verified: true, bypass: true, action });
          }

          // Test mode / development bypass token
          if (token === "dev_turnstile_bypass_token" || token.startsWith("1x00000000000000000000AA")) {
            return sendJson(200, { success: true, verified: true, bypass: true, action });
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
            if (!cfRes.ok || !cfData.success) {
              return sendJson(403, {
                success: false,
                verified: false,
                error: "Security verification challenge failed. Please complete the captcha.",
                errorCodes: cfData["error-codes"],
              });
            }

            if (action && cfData.action && cfData.action !== action) {
              return sendJson(403, {
                success: false,
                verified: false,
                error: `Security verification action mismatch. Expected: ${action}.`,
              });
            }

            const allowedHostnames = (
              process.env.TURNSTILE_HOSTNAMES ||
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
                return sendJson(403, {
                  success: false,
                  verified: false,
                  error: `Security verification hostname mismatch. Host: ${cfData.hostname}.`,
                });
              }
            }

            return sendJson(200, {
              success: true,
              verified: true,
              action: cfData.action || action,
              hostname: cfData.hostname,
              challenge_ts: cfData.challenge_ts,
            });
          } catch (err: any) {
            return sendJson(500, {
              success: false,
              verified: false,
              error: "Turnstile verification service error.",
              details: err.message,
            });
          }
        }

        // ── 6. AI SERVICE ASSISTANT WITH STRICT GUARDRAILS ──
        if (pathname === "/api/ai/assistant" && req.method === "POST") {
          const userPrompt = body.message || (Array.isArray(body.messages) && body.messages[body.messages.length - 1]?.content);
          const category = body.category;
          if (!userPrompt) {
            return sendJson(400, { error: "Message prompt is required (either 'message' or 'messages' array)." });
          }

          // Guardrails check: AI cannot perform transactional actions directly
          const promptLower = String(userPrompt).toLowerCase();
          if (promptLower.includes("refund") && (promptLower.includes("process") || promptLower.includes("give me"))) {
            return sendJson(200, {
              reply: "As Home-e-Fix Assistant, I cannot directly initiate refunds. Please raise a refund or cancellation request directly from your booking card in 'My Bookings', or connect with our support agents.",
            });
          }

          return sendJson(200, {
            reply: `Thank you for contacting Home-e-Fix! For ${category || "home services"}, our verified technicians in Kolkata carry calibrated tools and offer a 30-day workmanship warranty. Standard visits start at ₹199, and emergency dispatches arrive within 2 hours subject to zone capacity.`,
          });
        }

        // ── 7. PRIVATE KYC SIGNED UPLOAD URL GENERATOR ──
        if (pathname === "/api/kyc/upload-url" && req.method === "POST") {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !serviceRoleKey) {
            return sendJson(503, { error: "Storage service is temporarily unavailable." });
          }

          const { docType, fileName, fileSize, mimeType, userId: clientUserId } = body;
          const ALLOWED_MIME_TYPES = new Set(["application/pdf", "image/jpeg", "image/png", "image/webp"]);
          const ALLOWED_EXTENSIONS = new Set(["pdf", "jpg", "jpeg", "png", "webp"]);
          const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // 10MB

          if (!fileSize || typeof fileSize !== "number" || fileSize > MAX_FILE_SIZE_BYTES) {
            return sendJson(400, { error: "File size must be 10 MB or less." });
          }

          if (!mimeType || !ALLOWED_MIME_TYPES.has(mimeType)) {
            return sendJson(400, { error: "Please upload a PDF, JPG, JPEG, PNG, or WEBP file." });
          }

          const rawExt = typeof fileName === "string" ? fileName.split(".").pop()?.toLowerCase() : "";
          if (!rawExt || !ALLOWED_EXTENSIONS.has(rawExt)) {
            return sendJson(400, { error: "Invalid file extension. Allowed formats: .pdf, .jpg, .jpeg, .png, .webp" });
          }

          const authHeader = (req.headers["authorization"] as string) || "";
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
            return sendJson(401, { error: "Please sign in before uploading your documents." });
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
              console.error("[KYC Upload URL Error]", errText);
              return sendJson(500, { error: "We couldn't initialize document upload right now. Please try again." });
            }

            const signData: any = await signRes.json();
            const signedUrl = `${supabaseUrl}/storage/v1${signData.url}`;
            const tokenMatch = signedUrl.match(/[?&]token=([^&]+)/);
            const uploadToken = tokenMatch ? tokenMatch[1] : "";

            return sendJson(200, {
              success: true,
              storagePath,
              signedUrl,
              token: uploadToken,
            });
          } catch (err: any) {
            console.error("[KYC Upload URL Exception]", err);
            return sendJson(500, { error: "Failed to generate upload URL. Please try again." });
          }
        }

        // ── 9. ADMIN: LIST USERS ──
        if (pathname === "/api/admin/users" && req.method === "GET") {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !serviceRoleKey) {
            return sendJson(500, { error: "Supabase service credentials not configured" });
          }

          try {
            const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users?per_page=50`, {
              headers: {
                Authorization: `Bearer ${serviceRoleKey}`,
                apikey: serviceRoleKey,
              },
            });
            if (!listRes.ok) {
              const err = await listRes.text();
              return sendJson(listRes.status, { error: err });
            }
            const data: any = await listRes.json();
            const users = (data.users || []).map((u: any) => ({
              id: u.id,
              email: u.email,
              phone: u.phone,
              name: u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split("@")[0],
              role: u.app_metadata?.role || u.user_metadata?.role || "customer",
              createdAt: u.created_at,
              lastSignInAt: u.last_sign_in_at,
            }));
            return sendJson(200, { users });
          } catch (err: any) {
            return sendJson(500, { error: err.message });
          }
        }

        // ── 10. ADMIN: UPDATE USER ROLE ──
        if (pathname === "/api/admin/users/role" && req.method === "POST") {
          const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
          const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

          if (!supabaseUrl || !serviceRoleKey) {
            return sendJson(500, { error: "Supabase service credentials not configured" });
          }

          const { userId, role } = body || {};
          const validRoles = ["customer", "professional", "admin", "super_admin"];
          if (!userId || !role || !validRoles.includes(role)) {
            return sendJson(400, { error: "Invalid userId or role. Allowed roles: " + validRoles.join(", ") });
          }

          // Protected platform owner cannot be demoted
          const ownerId = "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";
          if (userId === ownerId && role !== "super_admin") {
            return sendJson(403, { error: "Platform owner account role cannot be changed from super_admin." });
          }

          try {
            const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${userId}`, {
              method: "PUT",
              headers: {
                Authorization: `Bearer ${serviceRoleKey}`,
                apikey: serviceRoleKey,
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                app_metadata: {
                  role,
                  roles: role === "super_admin" ? ["super_admin", "admin"] : [role],
                },
                user_metadata: {
                  role,
                },
              }),
            });

            if (!updateRes.ok) {
              const err = await updateRes.text();
              return sendJson(updateRes.status, { error: err });
            }

            const updatedUser: any = await updateRes.json();
            return sendJson(200, {
              success: true,
              userId: updatedUser.id,
              role,
            });
          } catch (err: any) {
            return sendJson(500, { error: err.message });
          }
        }

        return sendJson(404, { error: `Endpoint ${pathname} not found on server` });
      });
    },
  };
}
