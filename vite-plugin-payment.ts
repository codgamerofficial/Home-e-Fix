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

/**
 * Vite Plugin: Home-e-Fix Local Payment Server
 * Implements real server-side Razorpay Order creation and HMAC-SHA256 signature verification.
 */
export function paymentServerPlugin(): Plugin {
  return {
    name: "home-e-fix-payment-server",
    configureServer(server) {
      loadEnvFile(server.config.root);

      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith("/api/payment/")) {
          return next();
        }

        const url = new URL(req.url, "http://localhost:5173");
        const pathname = url.pathname;

        // Common JSON response helper
        const sendJson = (statusCode: number, data: any) => {
          res.writeHead(statusCode, {
            "Content-Type": "application/json",
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
            "Access-Control-Allow-Methods": "POST, OPTIONS",
          });
          res.end(JSON.stringify(data));
        };

        if (req.method === "OPTIONS") {
          return sendJson(200, { ok: true });
        }

        // Parse JSON Body
        let body: any = {};
        try {
          const buffers: Buffer[] = [];
          for await (const chunk of req) {
            buffers.push(typeof chunk === "string" ? Buffer.from(chunk) : chunk);
          }
          const raw = Buffer.concat(buffers).toString("utf-8");
          if (raw) {
            body = JSON.parse(raw);
          }
        } catch (e: any) {
          return sendJson(400, { error: "Invalid JSON request body", details: e.message });
        }

        const keyId = process.env.RAZORPAY_KEY_ID || process.env.VITE_RAZORPAY_KEY_ID || "";
        const keySecret = process.env.RAZORPAY_KEY_SECRET || "";

        // 1. CREATE ORDER ENDPOINT
        if (pathname === "/api/payment/create-order" && req.method === "POST") {
          const { booking_id, purpose = "BOOKING", topup_amount, total_amount, customer_name, customer_email } = body;

          // Determine server-authoritative amount
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
            // BOOKING
            const parsed = Number(total_amount);
            if (!parsed || parsed <= 0) {
              return sendJson(400, { error: "Invalid booking amount. Must be greater than zero." });
            }
            amountInr = parsed;
          }

          const amountPaise = Math.round(amountInr * 100);
          const receipt = `${purpose.toLowerCase()}_${booking_id || Date.now()}`;

          // Check credentials
          if (!keyId || !keySecret) {
            return sendJson(500, {
              error: "Razorpay credentials not configured. Please set RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET in .env.",
              code: "GATEWAY_CONFIG_MISSING",
            });
          }

          try {
            // Call official Razorpay Orders API
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
              console.error("[Home-e-Fix Payment Server] Razorpay Orders API Error:", rzpData);
              return sendJson(rzpRes.status || 400, {
                error: rzpData.error?.description || "Razorpay order creation failed",
                code: rzpData.error?.code || "RAZORPAY_API_ERROR",
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
            console.error("[Home-e-Fix Payment Server] Network error calling Razorpay:", err);
            return sendJson(502, {
              error: "Failed to connect to Razorpay Payment Gateway.",
              details: err.message,
            });
          }
        }

        // 2. VERIFY PAYMENT ENDPOINT
        if (pathname === "/api/payment/verify" && req.method === "POST") {
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

          // Cryptographic HMAC-SHA256 verification
          const generatedSignature = crypto
            .createHmac("sha256", keySecret)
            .update(`${razorpay_order_id}|${razorpay_payment_id}`)
            .digest("hex");

          const isValid = generatedSignature === razorpay_signature;

          if (!isValid) {
            console.error(
              `[Home-e-Fix Payment Server] Signature Mismatch! Expected: ${generatedSignature}, Received: ${razorpay_signature}`
            );
            return sendJson(400, {
              verified: false,
              error: "Payment signature verification failed. The transaction response may be tampered.",
            });
          }

          console.log(`[Home-e-Fix Payment Server] ✅ Payment Verified Successfully for Order: ${razorpay_order_id}, Payment: ${razorpay_payment_id}`);

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

        // 3. WEBHOOK ENDPOINT
        if (pathname === "/api/payment/webhook" && req.method === "POST") {
          const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET || "";
          const sigHeader = req.headers["x-razorpay-signature"] as string;

          if (sigHeader && webhookSecret) {
            const rawBody = JSON.stringify(body);
            const expectedSig = crypto
              .createHmac("sha256", webhookSecret)
              .update(rawBody)
              .digest("hex");

            if (expectedSig !== sigHeader) {
              return sendJson(400, { error: "Invalid webhook signature" });
            }
          }

          console.log(`[Home-e-Fix Payment Server] Received Webhook Event: ${body.event}`);
          return sendJson(200, { status: "ok", received: true });
        }

        // Not found
        return sendJson(404, { error: `Endpoint ${pathname} not found on Payment Server` });
      });
    },
  };
}
