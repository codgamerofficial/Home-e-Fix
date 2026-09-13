import test from "node:test";
import assert from "node:assert/strict";
import crypto from "node:crypto";
import { RazorpayProvider } from "../src/lib/payments/razorpay.provider";

test("Payment Provider - Computes and verifies valid Razorpay HMAC signature", async () => {
  const secret = "test_razorpay_secret_key_12345";
  const orderId = "order_HEF123456789";
  const paymentId = "pay_HEF987654321";

  // Real Node crypto HMAC computation
  const expectedSig = crypto
    .createHmac("sha256", secret)
    .update(`${orderId}|${paymentId}`)
    .digest("hex");

  const provider = new RazorpayProvider("rzp_test_mockId", secret);

  const result = await provider.verifyPayment({
    orderId,
    paymentId,
    signature: expectedSig,
    purpose: "BOOKING",
    bookingId: "test_booking_1",
  });

  assert.equal(result.verified, true);
  assert.equal(result.status, "SUCCESS");
  assert.equal(result.orderId, orderId);
  assert.equal(result.paymentId, paymentId);
});

test("Payment Provider - Rejects tampered or mismatched Razorpay signature", async () => {
  const secret = "test_razorpay_secret_key_12345";
  const orderId = "order_HEF123456789";
  const paymentId = "pay_HEF987654321";
  const forgedSig = "tampered_signature_abcd1234efgh5678";

  const provider = new RazorpayProvider("rzp_test_mockId", secret);

  const result = await provider.verifyPayment({
    orderId,
    paymentId,
    signature: forgedSig,
    purpose: "BOOKING",
  });

  assert.equal(result.verified, false);
  assert.equal(result.status, "FAILED");
  assert.ok(result.error?.includes("Cryptographic signature mismatch"));
});
