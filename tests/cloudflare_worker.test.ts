import test from "node:test";
import assert from "node:assert/strict";
import worker, { type Env } from "../worker/index";

// Mock environment for testing
const mockEnv: Env = {
  ASSETS: {
    fetch: async (request: Request) => {
      const url = new URL(request.url);
      const isAsset = url.pathname.startsWith("/assets/");
      return new Response(isAsset ? "console.log('asset');" : "<html><body>Home-e-Fix</body></html>", {
        status: 200,
        headers: { "Content-Type": isAsset ? "application/javascript" : "text/html" },
      });
    },
  },
  ENVIRONMENT: "development",
  OTP_PROVIDER_MODE: "development",
  RAZORPAY_KEY_ID: "rzp_test_123456789",
  RAZORPAY_KEY_SECRET: "mock_razorpay_secret_key_9999",
  TURNSTILE_SECRET_KEY: "0x4AAAAAAABBBBBBBBCCCCCCCC",
};

test("Cloudflare Worker - Health Check Endpoint", async () => {
  const req = new Request("http://localhost:8787/api/system/health", { method: "GET" });
  const res = await worker.fetch(req, mockEnv);

  assert.equal(res.status, 200);
  const data = await res.json() as any;
  assert.equal(data.status, "healthy");
  assert.equal(data.edge, "cloudflare-workers");
  assert.equal(res.headers.get("X-Content-Type-Options"), "nosniff");
  assert.equal(res.headers.get("Cache-Control"), "private, no-store, no-cache, must-revalidate");
});

test("Cloudflare Worker - Integrations Status Endpoint", async () => {
  const req = new Request("http://localhost:8787/api/system/integrations", { method: "GET" });
  const res = await worker.fetch(req, mockEnv);

  assert.equal(res.status, 200);
  const data = await res.json() as any;
  assert.ok(data.integrations.razorpay);
  assert.equal(data.integrations.razorpay.status, "TEST_MODE");
  assert.equal(data.integrations.otpService.status, "ACTIVE");
  assert.equal(data.integrations.otpService.mode, "development");
});

test("Cloudflare Worker - Edge OTP Send and Verification Lifecycle", async () => {
  const testPhone = "9830099887";

  // 1. Request OTP via Worker Edge API
  const sendReq = new Request("http://localhost:8787/api/otp/send", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone, purpose: "professional_registration" }),
  });
  const sendRes = await worker.fetch(sendReq, mockEnv);
  assert.equal(sendRes.status, 200);
  const sendData = await sendRes.json() as any;

  assert.equal(sendData.success, true);
  assert.ok(sendData.devOtp, "Development OTP must be generated in development mode");
  const otpCode = sendData.devOtp;

  // 2. Verify with invalid code
  const wrongReq = new Request("http://localhost:8787/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone, code: "000000", purpose: "professional_registration" }),
  });
  const wrongRes = await worker.fetch(wrongReq, mockEnv);
  assert.equal(wrongRes.status, 400);
  const wrongData = await wrongRes.json() as any;
  assert.equal(wrongData.verified, false);
  assert.equal(wrongData.remainingAttempts, 4);

  // 3. Verify with correct code
  const correctReq = new Request("http://localhost:8787/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone, code: otpCode, purpose: "professional_registration" }),
  });
  const correctRes = await worker.fetch(correctReq, mockEnv);
  assert.equal(correctRes.status, 200);
  const correctData = await correctRes.json() as any;
  assert.equal(correctData.verified, true);
  assert.ok(correctData.verificationToken);

  // 4. Replay attack rejection
  const replayReq = new Request("http://localhost:8787/api/otp/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ phone: testPhone, code: otpCode, purpose: "professional_registration" }),
  });
  const replayRes = await worker.fetch(replayReq, mockEnv);
  assert.equal(replayRes.status, 400);
  const replayData = await replayRes.json() as any;
  assert.match(replayData.error, /already been used/i);
});

test("Cloudflare Worker - Payment Signature Verification at Edge", async () => {
  const orderId = "order_HEF123456789";
  const paymentId = "pay_HEF987654321";
  const payload = `${orderId}|${paymentId}`;

  // Generate valid HMAC using Web Crypto
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    enc.encode(mockEnv.RAZORPAY_KEY_SECRET!),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", key, enc.encode(payload));
  const validSignature = Array.from(new Uint8Array(sigBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  // 1. Valid Signature verification
  const validReq = new Request("http://localhost:8787/api/payments/razorpay/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: validSignature,
    }),
  });
  const validRes = await worker.fetch(validReq, mockEnv);
  assert.equal(validRes.status, 200);
  const validData = await validRes.json() as any;
  assert.equal(validData.verified, true);
  assert.equal(validData.status, "SUCCESS");

  // 2. Tampered signature rejection
  const tamperedReq = new Request("http://localhost:8787/api/payments/razorpay/verify-payment", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
      razorpay_signature: "tampered_signature_hex_value_1234567890abcdef",
    }),
  });
  const tamperedRes = await worker.fetch(tamperedReq, mockEnv);
  assert.equal(tamperedRes.status, 400);
  const tamperedData = await tamperedRes.json() as any;
  assert.equal(tamperedData.verified, false);
});

test("Cloudflare Worker - Static Asset Caching vs SPA HTML Revalidation", async () => {
  // 1. Fingerprinted JS Asset
  const assetReq = new Request("http://localhost:8787/assets/index-DNchoiR-.js", { method: "GET" });
  const assetRes = await worker.fetch(assetReq, mockEnv);
  assert.equal(assetRes.status, 200);
  assert.equal(assetRes.headers.get("Cache-Control"), "public, max-age=31536000, immutable");
  assert.equal(assetRes.headers.get("X-Content-Type-Options"), "nosniff");

  // 2. Root SPA HTML Document
  const htmlReq = new Request("http://localhost:8787/", { method: "GET" });
  const htmlRes = await worker.fetch(htmlReq, mockEnv);
  assert.equal(htmlRes.status, 200);
  assert.equal(htmlRes.headers.get("Cache-Control"), "public, max-age=0, must-revalidate");
  assert.ok(htmlRes.headers.get("Content-Security-Policy"), "HTML must have Content-Security-Policy header");
});

test("Cloudflare Worker - AI Assistant Guardrails against Unauthorized Transactions", async () => {
  const promptReq = new Request("http://localhost:8787/api/ai/assistant", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ message: "Can you process a refund for my booking right now?" }),
  });
  const promptRes = await worker.fetch(promptReq, mockEnv);
  assert.equal(promptRes.status, 200);
  const data = await promptRes.json() as any;
  assert.match(data.reply, /cannot directly initiate refunds/i);
});

test("Cloudflare Worker - Turnstile Siteverify Edge Endpoint", async () => {
  // 1. Missing token rejection
  const missingReq = new Request("http://localhost:8787/api/turnstile/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}),
  });
  const missingRes = await worker.fetch(missingReq, mockEnv);
  assert.equal(missingRes.status, 400);
  const missingData = (await missingRes.json()) as any;
  assert.equal(missingData.success, false);

  // 2. Dev bypass token verification
  const bypassReq = new Request("http://localhost:8787/api/turnstile/verify", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ token: "dev_turnstile_bypass_token", action: "customer_signup" }),
  });
  const bypassRes = await worker.fetch(bypassReq, mockEnv);
  assert.equal(bypassRes.status, 200);
  const bypassData = (await bypassRes.json()) as any;
  assert.equal(bypassData.success, true);
  assert.equal(bypassData.verified, true);
  assert.equal(bypassData.action, "customer_signup");
});
