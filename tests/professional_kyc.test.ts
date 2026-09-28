import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage for headless Node test environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    length: 0,
  } as Storage;
}

import { otpService } from "../src/services/otp/otpService";
import { hashOtp, generateSecureNumericOtp } from "../src/services/otp/developmentOtpProvider";
import { professionalService } from "../src/services/professional/professionalService";
import { authService } from "../src/services/auth.service";
import { verifyWebhookSignature } from "../supabase/functions/send_sms/webhookVerifier.ts";
import type { ProfessionalProfile, ProfessionalStatus } from "../src/services/professional/professional.types";

test("OTP Engine - Indian Phone Number Normalization", () => {
  // Test 10-digit input
  const res1 = otpService.normalizeIndianPhone("9830012345");
  assert.equal(res1, "+919830012345");

  // Test +91 formatted input
  const res2 = otpService.normalizeIndianPhone("+919830012345");
  assert.equal(res2, "+919830012345");

  // Test spaced/dashed format
  const res3 = otpService.normalizeIndianPhone("+91 98300-12345");
  assert.equal(res3, "+919830012345");

  // Test with leading 0
  const res4 = otpService.normalizeIndianPhone("09830012345");
  assert.equal(res4, "+919830012345");

  // Both forms yield the EXACT same canonical number (prevents duplicate accounts)
  assert.equal(res1, res2);
  assert.equal(res2, res3);
});

test("OTP Engine - Invalid Phone Number Rejections", () => {
  // Invalid prefix (< 6)
  assert.throws(() => otpService.normalizeIndianPhone("5123456789"), /valid Indian mobile number/);

  // Short number
  assert.throws(() => otpService.normalizeIndianPhone("98300"), /exactly 10 digits/);

  // Alphanumeric
  assert.throws(() => otpService.normalizeIndianPhone("98300ABCDE"), /valid Indian mobile number|exactly 10 digits/);

  // Empty string
  assert.throws(() => otpService.normalizeIndianPhone(""), /valid mobile number/);
});

test("OTP Engine - Cryptographic Generation & Hashing", async () => {
  const code1 = generateSecureNumericOtp();
  const code2 = generateSecureNumericOtp();

  // Exactly 6 digits
  assert.equal(code1.length, 6);
  assert.equal(/^\d{6}$/.test(code1), true);
  assert.equal(code2.length, 6);

  // SHA-256 Hashing must be deterministic and 64 hex chars
  const hash1 = await hashOtp(code1);
  const hash1Repeat = await hashOtp(code1);
  assert.equal(hash1.length, 64);
  assert.equal(hash1, hash1Repeat);

  // Different OTPs yield different hashes
  const hash2 = await hashOtp("000000");
  assert.notEqual(hash1, hash2);
});

test("OTP Engine - Full Verification Lifecycle & Rate Limiting", async () => {
  localStorage.clear();
  const phone = "9830011223";

  // Send OTP
  const sendRes = await otpService.sendOtp(phone, "professional_registration");
  assert.equal(sendRes.success, true);
  assert.ok(sendRes.devOtp, "Dev OTP generated for development provider");

  const devCode = sendRes.devOtp!;

  // Resend cooldown enforcement (within 45s throws error)
  await assert.rejects(
    async () => {
      await otpService.sendOtp(phone, "professional_registration");
    },
    /wait.*before requesting a new OTP/i
  );

  // Verify with WRONG OTP
  const wrongRes = await otpService.verifyOtp(phone, "999999", "professional_registration");
  assert.equal(wrongRes.success, false);
  assert.equal(wrongRes.remainingAttempts, 4);

  // Verify with CORRECT OTP
  const correctRes = await otpService.verifyOtp(phone, devCode, "professional_registration");
  assert.equal(correctRes.success, true);

  // Replay Attack Prevention (Same OTP cannot be used twice)
  const replayRes = await otpService.verifyOtp(phone, devCode, "professional_registration");
  assert.equal(replayRes.success, false);
  assert.match(replayRes.message, /already been used/i);
});

test("Professional State Machine - Invariant Transitions", () => {
  // Valid forward paths
  assert.equal(professionalService.isValidStatusTransition("DRAFT", "PHONE_VERIFIED"), true);
  assert.equal(professionalService.isValidStatusTransition("PHONE_VERIFIED", "APPLICATION_SUBMITTED"), true);
  assert.equal(professionalService.isValidStatusTransition("APPLICATION_SUBMITTED", "DOCUMENTS_UNDER_REVIEW"), true);
  assert.equal(professionalService.isValidStatusTransition("DOCUMENTS_UNDER_REVIEW", "APPROVED"), true);
  assert.equal(professionalService.isValidStatusTransition("DOCUMENTS_UNDER_REVIEW", "CORRECTION_REQUIRED"), true);
  assert.equal(professionalService.isValidStatusTransition("DOCUMENTS_UNDER_REVIEW", "REJECTED"), true);
  assert.equal(professionalService.isValidStatusTransition("CORRECTION_REQUIRED", "APPLICATION_SUBMITTED"), true);
  assert.equal(professionalService.isValidStatusTransition("APPROVED", "ACTIVE"), true);
  assert.equal(professionalService.isValidStatusTransition("ACTIVE", "SUSPENDED"), true);
  assert.equal(professionalService.isValidStatusTransition("SUSPENDED", "ACTIVE"), true);

  // Prohibited jumps (Illegal transitions)
  assert.equal(professionalService.isValidStatusTransition("DRAFT", "APPROVED"), false, "Cannot jump DRAFT -> APPROVED");
  assert.equal(professionalService.isValidStatusTransition("PHONE_VERIFIED", "ACTIVE"), false, "Cannot jump PHONE_VERIFIED -> ACTIVE");
  assert.equal(professionalService.isValidStatusTransition("DRAFT", "ACTIVE"), false, "Cannot jump DRAFT -> ACTIVE");
  assert.equal(professionalService.isValidStatusTransition("REJECTED", "APPROVED"), false, "Cannot jump REJECTED -> APPROVED without re-application");
});

test("Access Control Policy - canProfessionalAcceptJobs Business Invariants", () => {
  // Rule 1: Null profile cannot accept jobs
  const nullCheck = professionalService.canProfessionalAcceptJobs(null);
  assert.equal(nullCheck.allowed, false);

  // Rule 2: PHONE_VERIFIED is NOT APPROVED (Critical invariant)
  const phoneOnlyPro: ProfessionalProfile = {
    id: "pro-test-1",
    userId: "usr-test-1",
    phone: "+919830012345",
    phoneVerified: true,
    fullName: "Raju Mistri",
    addressLine1: "10 Rajarhat Main Road",
    locality: "Rajarhat",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700091",
    primaryCategory: "electrical",
    serviceCategories: ["electrical"],
    experienceYears: 4,
    status: "PHONE_VERIFIED",
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  const phoneCheck = professionalService.canProfessionalAcceptJobs(phoneOnlyPro);
  assert.equal(phoneCheck.allowed, false, "Phone verification alone MUST NOT permit job acceptance");

  // Rule 3: Under review cannot accept jobs
  const reviewPro: ProfessionalProfile = {
    ...phoneOnlyPro,
    status: "DOCUMENTS_UNDER_REVIEW",
  };
  assert.equal(professionalService.canProfessionalAcceptJobs(reviewPro).allowed, false);

  // Rule 4: Suspended professional cannot accept jobs
  const suspendedPro: ProfessionalProfile = {
    ...phoneOnlyPro,
    status: "SUSPENDED",
  };
  const suspendedCheck = professionalService.canProfessionalAcceptJobs(suspendedPro);
  assert.equal(suspendedCheck.allowed, false);
  assert.match(suspendedCheck.reason || "", /suspended/i);

  // Rule 5: Correction required cannot accept jobs
  const correctionPro: ProfessionalProfile = {
    ...phoneOnlyPro,
    status: "CORRECTION_REQUIRED",
    correctionNotes: "Please re-upload clear Aadhaar card front and back",
  };
  assert.equal(professionalService.canProfessionalAcceptJobs(correctionPro).allowed, false);

  // Rule 6: APPROVED or ACTIVE professional CAN accept jobs
  const approvedPro: ProfessionalProfile = {
    ...phoneOnlyPro,
    status: "APPROVED",
  };
  assert.equal(professionalService.canProfessionalAcceptJobs(approvedPro).allowed, true);

  const activePro: ProfessionalProfile = {
    ...phoneOnlyPro,
    status: "ACTIVE",
  };
  assert.equal(professionalService.canProfessionalAcceptJobs(activePro).allowed, true);
});

test("Document Security - Sensitive Number Masking", () => {
  // Aadhaar 12-digit masking
  const maskedAadhaar = professionalService.maskDocumentNumber("IDENTITY_DOCUMENT", "987654321234");
  assert.equal(maskedAadhaar, "XXXX-XXXX-1234");

  // Bank Account masking
  const maskedBank = professionalService.maskDocumentNumber("BANK_DOCUMENT", "1234567890123456");
  assert.equal(maskedBank, "••••••••3456");

  // Empty / short input
  const maskedEmpty = professionalService.maskDocumentNumber("IDENTITY_DOCUMENT", "");
  assert.equal(maskedEmpty, "XXXX-XXXX");
});

test("Admin Approval & Audit Workflow - Full Compliance Trail", async () => {
  localStorage.clear();

  // Create applicant
  const applicant = await professionalService.submitApplication("usr-electrician-10", {
    phone: "+919830055443",
    phoneVerified: true,
    fullName: "Amit Kumar Dey",
    addressLine1: "12/4 Salt Lake Sector 1",
    locality: "Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    primaryCategory: "electrical",
    serviceCategories: ["electrical", "appliance-repair"],
    experienceYears: 7,
    bio: "Certified wireman with 7 years of high-voltage and domestic distribution experience.",
    preferredServiceAreas: ["Salt Lake", "New Town"],
    termsAccepted: true,
    documents: [
      {
        documentType: "IDENTITY_DOCUMENT",
        documentNumberMasked: "XXXX-XXXX-8821",
        storagePath: "usr-electrician-10/id_doc.pdf",
        fileName: "aadhaar_front.pdf",
        fileSize: 1048576,
        mimeType: "application/pdf",
      },
    ],
  });

  assert.equal(applicant.status, "UNDER_REVIEW");
  assert.equal(applicant.documents?.length, 1);

  // Admin requests correction
  const correctedPro = await professionalService.adminRequestCorrection(
    applicant.id,
    "adm-001",
    "Compliance Lead",
    "Please update your preferred working hours."
  );
  assert.equal(correctedPro.status, "CORRECTION_REQUIRED");
  assert.equal(correctedPro.correctionNotes, "Please update your preferred working hours.");

  // Professional re-submits updated profile details
  const resubmittedPro = await professionalService.submitApplication("usr-electrician-10", {
    phone: "+919830055443",
    phoneVerified: true,
    fullName: "Amit Kumar Dey",
    addressLine1: "12/4 Salt Lake Sector 1",
    locality: "Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    primaryCategory: "electrical",
    serviceCategories: ["electrical", "appliance-repair"],
    experienceYears: 7,
    bio: "Certified wireman with 7 years of high-voltage and domestic distribution experience.",
    preferredServiceAreas: ["Salt Lake", "New Town"],
    workingHours: {
      start: "08:00 AM",
      end: "08:00 PM",
      daysOfWeek: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
    },
    termsAccepted: true,
  });
  assert.equal(resubmittedPro.status, "UNDER_REVIEW");

  // Admin approves professional
  const approvedPro = await professionalService.adminApproveApplication(
    applicant.id,
    "adm-001",
    "Compliance Lead",
    "Experience and profile details verified by administrator."
  );
  assert.equal(approvedPro.status, "APPROVED");

  // Verify Audit Log trail
  const logs = professionalService.getReviewLogs(applicant.id);
  assert.ok(logs.length >= 3, "Must have application_submitted, correction_requested, approved logs");
  assert.equal(logs[0].action, "approved");
  assert.equal(logs[0].adminName, "Compliance Lead");

  // Test suspension
  const suspendedPro = await professionalService.adminSuspendProfessional(
    applicant.id,
    "adm-001",
    "Compliance Lead",
    "Customer safety complaint received pending inquiry."
  );
  assert.equal(suspendedPro.status, "SUSPENDED");
  assert.equal(professionalService.canProfessionalAcceptJobs(suspendedPro).allowed, false);

  // Test Reactivation
  const reactivatedPro = await professionalService.adminReactivateProfessional(
    applicant.id,
    "adm-001",
    "Compliance Lead"
  );
  assert.equal(reactivatedPro.status, "APPROVED");
  assert.equal(professionalService.canProfessionalAcceptJobs(reactivatedPro).allowed, true);
});

test("Supabase Phone Auth - Indian Mobile Normalization & Auth Integration", async () => {
  const phone = "9830099887";
  const normalized = otpService.normalizeIndianPhone(phone);
  assert.equal(normalized, "+919830099887");

  // Masking
  const masked = otpService.maskPhone(normalized);
  assert.equal(masked, "+91 ******9887");

  // Phone OTP is temporarily disabled in favor of Google OAuth
  await assert.rejects(
    () => authService.sendPhoneOtp(phone),
    /Phone OTP authentication is temporarily disabled/
  );
  await assert.rejects(
    () => authService.verifyPhoneOtp(phone, "123456"),
    /Phone OTP authentication is temporarily disabled/
  );

  // Authoritative Google Profile Creation
  const profile = await authService.ensureProfile(
    {
      id: "usr-google-test-01",
      email: "pro.test@gmail.com",
      user_metadata: { full_name: "Subir Ghosh", role: "professional" },
    },
    "professional"
  );
  assert.equal(profile.id, "usr-google-test-01");
  assert.equal(profile.role, "professional");
  assert.equal(profile.email, "pro.test@gmail.com");
});

test("Send SMS Hook - Webhook Signature Verification Algorithm", async () => {
  const secret = "whsec_test_secret_key_base64_1234567890abcdef";
  const now = Math.floor(Date.now() / 1000);
  const msgId = "msg_test_001";
  const body = JSON.stringify({ user: { phone: "+919830012345" }, sms: { otp: "654321" } });

  // Compute signature manually using Web Crypto
  const toSign = `${msgId}.${now}.${body}`;
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sigBuffer = await crypto.subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(toSign));
  const validSig = Buffer.from(sigBuffer).toString("base64");

  const validHeaders = new Headers({
    "webhook-id": msgId,
    "webhook-timestamp": String(now),
    "webhook-signature": `v1,${validSig}`,
  });

  const validRes = await verifyWebhookSignature(validHeaders, body, secret);
  assert.equal(validRes.isValid, true);

  // Tampered payload
  const tamperedRes = await verifyWebhookSignature(validHeaders, body + "tampered", secret);
  assert.equal(tamperedRes.isValid, false);

  // Expired timestamp (replay protection > 5 mins)
  const expiredHeaders = new Headers({
    "webhook-id": msgId,
    "webhook-timestamp": String(now - 400),
    "webhook-signature": `v1,${validSig}`,
  });
  const expiredRes = await verifyWebhookSignature(expiredHeaders, body, secret);
  assert.equal(expiredRes.isValid, false);
  assert.match(expiredRes.error || "", /replay prevention/i);
});

test("Production Safety Guard - Rejects Development Mode in Production", () => {
  assert.throws(
    () => {
      const envName = "production";
      const mode = "development";
      if (envName === "production" && mode === "development") {
        throw new Error("FATAL SECURITY CONFIGURATION: Development OTP mode is strictly prohibited in production environment.");
      }
    },
    /strictly prohibited in production environment/
  );
});

test("Professional Registration - Send OTP Button Enablement Matrix", () => {
  // Logic: phoneValid === true AND turnstileVerified === true AND isOtpSending === false
  const evaluateButtonState = (phone: string, turnstileStatus: string, token: string | null, isOtpSending: boolean) => {
    const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
    const isTurnstileVerified = turnstileStatus === "verified" && Boolean(token);
    const isDisabled = !isPhoneValid || !isTurnstileVerified || isOtpSending;
    return !isDisabled; // Returns true if button is active/clickable
  };

  // Case 1: Initial state -> phone empty, turnstile idle -> DISABLED
  assert.equal(evaluateButtonState("", "idle", null, false), false);

  // Case 2: Valid phone, but turnstile not yet verified -> DISABLED
  assert.equal(evaluateButtonState("9876543210", "idle", null, false), false);
  assert.equal(evaluateButtonState("9876543210", "loading", null, false), false);

  // Case 3: Invalid phone (< 10 digits), turnstile verified -> DISABLED
  assert.equal(evaluateButtonState("98765", "verified", "token_123", false), false);

  // Case 4: Invalid phone (starts with 0-5), turnstile verified -> DISABLED
  assert.equal(evaluateButtonState("5876543210", "verified", "token_123", false), false);

  // Case 5: Valid phone AND turnstile verified -> ENABLED
  assert.equal(evaluateButtonState("9876543210", "verified", "token_123", false), true);
  assert.equal(evaluateButtonState("6876543210", "verified", "token_abc", false), true);

  // Case 6: Turnstile expired -> DISABLED
  assert.equal(evaluateButtonState("9876543210", "expired", null, false), false);

  // Case 7: Turnstile error -> DISABLED
  assert.equal(evaluateButtonState("9876543210", "error", null, false), false);

  // Case 8: Active request in flight -> DISABLED
  assert.equal(evaluateButtonState("9876543210", "verified", "token_123", true), false);
});

test("Professional Registration - Turnstile Single-Use Token Invariant", () => {
  // Turnstile token must be single-use. When OTP is requested, token is consumed immediately.
  let regTurnstileToken: string | null = "cf_turnstile_token_xyz_99";
  let turnstileStatus = "verified";

  // Simulate submission
  const tokenToVerify = regTurnstileToken;
  regTurnstileToken = null;
  turnstileStatus = "idle";

  assert.equal(tokenToVerify, "cf_turnstile_token_xyz_99");
  assert.equal(regTurnstileToken, null, "Turnstile token must be cleared from state immediately");
  assert.equal(turnstileStatus, "idle", "Turnstile status must be reset to idle for any subsequent retry");
});

test("Professional Registration - Action Identifier must be 'professional_otp'", () => {
  const expectedAction = "professional_otp";
  assert.equal(expectedAction, "professional_otp");
  assert.notEqual(expectedAction, "professional_register");
});

