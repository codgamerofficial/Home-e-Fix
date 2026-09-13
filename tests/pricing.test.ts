import test from "node:test";
import assert from "node:assert/strict";
import { pricingEngine } from "../src/services/marketplace/pricing.engine";

test("Pricing Engine - Base calculation with standard GST and partner split", () => {
  const result = pricingEngine.calculate({
    basePrice: 499,
    quantity: 1,
  });

  // Base: 499, Safety Fee: 29
  // Taxable: 499 + 29 = 528
  // GST 18%: Math.round(528 * 0.18) = 95
  // Total: 499 + 29 + 95 = 623
  assert.equal(result.baseAmount, 499);
  assert.equal(result.safetyFee, 29);
  assert.equal(result.taxGst, 95);
  assert.equal(result.totalPayableInr, 623);
  assert.equal(result.totalPayablePaise, 62300);

  // Partner 80/20 split on labour (499):
  // Partner share: Math.round(499 * 0.8) = 399
  // Platform fee: Math.round(499 * 0.2) = 100
  assert.equal(result.partnerLabourShare, 399);
  assert.equal(result.platformFee, 100);
});

test("Pricing Engine - PLUS Member gets 20% labour discount & waived safety fee", () => {
  const result = pricingEngine.calculate({
    basePrice: 1000,
    quantity: 1,
    isPlusMember: true,
  });

  // Gross Labour: 1000
  // PLUS Discount 20%: 200
  // Net Labour: 800
  // Safety fee waived: 0
  // Taxable: 800
  // GST 18%: Math.round(800 * 0.18) = 144
  // Total: 800 + 0 + 144 = 944
  assert.equal(result.safetyFee, 0);
  assert.equal(result.discountMembership, 200);
  assert.equal(result.subtotal, 800);
  assert.equal(result.taxGst, 144);
  assert.equal(result.totalPayableInr, 944);
  assert.equal(result.totalPayablePaise, 94400);
});

test("Pricing Engine - Flat Coupon FIRSTFIX100 validation and deduction", () => {
  const result = pricingEngine.calculate({
    basePrice: 500,
    quantity: 1,
    couponCode: "FIRSTFIX100",
  });

  // Gross Labour: 500
  // Coupon Discount: 100
  // Net Labour after coupon: 400
  // Safety fee: 29
  // Subtotal: 400
  // Taxable: 400 + 29 = 429
  // GST 18%: Math.round(429 * 0.18) = 77
  // Total: 400 + 29 + 77 = 506
  assert.equal(result.discountCoupon, 100);
  assert.equal(result.subtotal, 400);
  assert.equal(result.taxGst, 77);
  assert.equal(result.totalPayableInr, 506);
});

test("Pricing Engine - Emergency fee surcharge and approved materials", () => {
  const result = pricingEngine.calculate({
    basePrice: 400,
    quantity: 1,
    isEmergency: true,
    materialsTotal: 350,
  });

  // Emergency fee: 499
  // Gross labour: 400 + 499 = 899
  // Safety fee: 29
  // Materials: 350 (passed 100% to partner)
  // Taxable services: 899 + 29 = 928
  // GST 18%: Math.round(928 * 0.18) = 167
  // Subtotal (services + materials): 899 + 350 = 1249
  // Total: 1249 + 29 + 167 = 1445
  assert.equal(result.emergencyFee, 499);
  assert.equal(result.materialsAmount, 350);
  assert.equal(result.subtotal, 1249);
  assert.equal(result.taxGst, 167);
  assert.equal(result.totalPayableInr, 1445);
  // Partner receives 80% of 899 (719) + 100% of 350 (350) = 1069
  assert.equal(result.partnerLabourShare, 1069);
});
