import test from "node:test";
import assert from "node:assert/strict";
import { normalizeIndianPhone, isValidIndianPhone, validateIndianPhone, maskIndianPhone } from "../src/lib/phone";
import { verifyTurnstileToken } from "../cloudflare/home-e-fix-auth/src/security/turnstile";
import { checkPhoneRateLimit, checkIpRateLimit } from "../cloudflare/home-e-fix-auth/src/security/rateLimit";
import { TwoFactorSmsProvider } from "../cloudflare/home-e-fix-auth/src/sms/TwoFactorSmsProvider";
import { DevelopmentSmsProvider } from "../cloudflare/home-e-fix-auth/src/sms/DevelopmentSmsProvider";
import worker, { type Env } from "../worker/index";

test("Phase 3 - Phone Format: Canonical Indian Mobile Normalization", () => {
  // Test valid Indian inputs
  assert.equal(normalizeIndianPhone("9876543210"), "+919876543210");
  assert.equal(normalizeIndianPhone("+919876543210"), "+919876543210");
  assert.equal(normalizeIndianPhone("919876543210"), "+919876543210");
  assert.equal(normalizeIndianPhone("09876543210"), "+919876543210");
  assert.equal(normalizeIndianPhone("+91 98765 43210"), "+919876543210");
  assert.equal(normalizeIndianPhone("+91-98765-43210"), "+919876543210");
  assert.equal(normalizeIndianPhone("(+91) 9876543210"), "+919876543210");

  // Rejection of invalid phone formats
  assert.throws(() => normalizeIndianPhone("1234567890"), /valid Indian mobile number/);
  assert.throws(() => normalizeIndianPhone("5123456789"), /valid Indian mobile number/);
  assert.throws(() => normalizeIndianPhone("12345"), /exactly 10 digits/);
  assert.throws(() => normalizeIndianPhone(""), /valid mobile number/);
  assert.throws(() => normalizeIndianPhone("abcdefghij"), /valid Indian mobile number|exactly 10 digits/);

  // Helper boolean check
  assert.equal(isValidIndianPhone("9876543210"), true);
  assert.equal(isValidIndianPhone("5123456789"), false);

  // Structured validation object check
  const validRes = validateIndianPhone("9876543210");
  assert.equal(validRes.valid, true);
  assert.equal(validRes.e164, "+919876543210");

  const invalidRes = validateIndianPhone("12345");
  assert.equal(invalidRes.valid, false);
  assert.equal(invalidRes.e164, null);
  assert.ok(invalidRes.reason);

  // Masking
  assert.equal(maskIndianPhone("9876543210"), "+91******3210");
});

test("Phase 5 - Turnstile Server Validation: Action & Hostname", async () => {
  // Missing secret fails closed
  const missingSecret = await verifyTurnstileToken("sample-token", "customer_otp", "");
  assert.equal(missingSecret.success, false);

  // Empty token fails closed
  const emptyToken = await verifyTurnstileToken("", "customer_otp", "secret-key");
  assert.equal(emptyToken.success, false);
});

test("Phase 15 - Rate Limiting: Per-phone Cooldown and Hourly Limits", () => {
  const testPhone = "+919876500001";

  // First request succeeds
  const r1 = checkPhoneRateLimit(testPhone, 60, 5);
  assert.equal(r1.allowed, true);

  // Immediate second request within 60s cooldown fails with 429 reason
  const r2 = checkPhoneRateLimit(testPhone, 60, 5);
  assert.equal(r2.allowed, false);
  assert.match(r2.reason || "", /Please wait \d+s before requesting a new OTP/);

  // IP rate limiting test
  const testIp = "203.0.113.42";
  for (let i = 0; i < 10; i++) {
    const res = checkIpRateLimit(testIp, 10, 300);
    assert.equal(res.allowed, true);
  }
  // 11th request exceeds limit
  const exceeded = checkIpRateLimit(testIp, 10, 300);
  assert.equal(exceeded.allowed, false);
  assert.match(exceeded.reason || "", /Too many OTP requests from this connection/);
});

test("Phase 11 & 12 - SMS Providers: 2Factor and Development Safe Mode", async () => {
  // Development provider throws fatal error in production
  assert.throws(() => {
    new DevelopmentSmsProvider("production");
  }, /FATAL/);

  // Development provider in dev returns simulated success
  const devProvider = new DevelopmentSmsProvider("development");
  const devRes = await devProvider.sendOtp({ phone: "+919876543210", otp: "123456" });
  assert.equal(devRes.success, true);
  assert.ok(devRes.providerMessageId);

  // 2Factor provider missing API key fails safely
  const twoFactor = new TwoFactorSmsProvider({ apiKey: "" });
  const twoRes = await twoFactor.sendOtp({ phone: "+919876543210", otp: "123456" });
  assert.equal(twoRes.success, false);
  assert.equal(twoRes.errorCode, "SMS_PROVIDER_CONFIG_MISSING");
});

test("Phase 7 & 23 - Cloudflare Worker: Health Check & Request OTP Validation", async () => {
  const testEnv: Env = {
    ASSETS: {
      fetch: async () => new Response("OK", { status: 200 }),
    },
    ENVIRONMENT: "production",
    TURNSTILE_SECRET: "test_secret_123",
    SUPABASE_URL: "https://uzlarcvmhshwgtvtxcsh.supabase.co",
    SUPABASE_SERVICE_ROLE_KEY: "test_service_key",
    ALLOWED_ORIGINS: "https://home-e-fix.vercel.app",
  };

  // 1. Health check endpoint
  const healthReq = new Request("http://localhost:8787/api/health", { method: "GET" });
  const healthRes = await worker.fetch(healthReq, testEnv);
  assert.equal(healthRes.status, 200);
  const healthData = (await healthRes.json()) as any;
  assert.equal(healthData.ok, true);
  assert.equal(healthData.service, "home-e-fix-auth");
  assert.equal(healthData.dependencies.turnstile, "configured");
  assert.equal(healthData.dependencies.supabase, "configured");

  // 2. Request OTP - returns 410 Gone informing of Google OAuth migration
  const disabledOtpReq = new Request("http://localhost:8787/api/auth/request-otp", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      phone: "9876543210",
      role: "customer",
      action: "customer_otp",
      turnstileToken: "tok",
    }),
  });
  const disabledOtpRes = await worker.fetch(disabledOtpReq, testEnv);
  assert.equal(disabledOtpRes.status, 410);
  const disabledData = (await disabledOtpRes.json()) as any;
  assert.equal(disabledData.code, "PHONE_OTP_DISABLED");
  assert.match(disabledData.error, /Google Sign-In/);
});
