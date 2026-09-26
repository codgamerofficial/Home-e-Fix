import test from "node:test";
import assert from "node:assert/strict";
import { pricingEngine } from "../src/services/marketplace/pricing.engine";

test("Pricing Engine - Base calculation with standard GST and partner split (Transparent 0 junk fee policy)", () => {
  const result = pricingEngine.calculate({
    basePrice: 499,
    quantity: 1,
  });

  // Base: 499, Safety Fee: 0 (Home-e-Fix does not charge hidden junk fees)
  // Taxable: 499
  // GST 18%: Math.round(499 * 0.18) = 90
  // Total: 499 + 0 + 90 = 589
  assert.equal(result.baseAmount, 499);
  assert.equal(result.safetyFee, 0);
  assert.equal(result.taxGst, 90);
  assert.equal(result.totalPayableInr, 589);
  assert.equal(result.totalPayablePaise, 58900);

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
  // Safety fee: 0
  // Subtotal: 400
  // Taxable: 400
  // GST 18%: Math.round(400 * 0.18) = 72
  // Total: 400 + 72 = 472
  assert.equal(result.discountCoupon, 100);
  assert.equal(result.subtotal, 400);
  assert.equal(result.taxGst, 72);
  assert.equal(result.totalPayableInr, 472);
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
  // Safety fee: 0
  // Materials: 350 (passed 100% to partner)
  // Taxable services: 899
  // GST 18%: Math.round(899 * 0.18) = 162
  // Subtotal (services + materials): 899 + 350 = 1249
  // Total: 1249 + 0 + 162 = 1411
  assert.equal(result.emergencyFee, 499);
  assert.equal(result.materialsAmount, 350);
  assert.equal(result.subtotal, 1249);
  assert.equal(result.taxGst, 162);
  assert.equal(result.totalPayableInr, 1411);
  // Partner receives 80% of 899 (719) + 100% of 350 (350) = 1069
  assert.equal(result.partnerLabourShare, 1069);
});

test("Pricing Engine - Rate card night service surcharge (post 8 PM)", () => {
  const result = pricingEngine.calculate({
    basePrice: 500,
    quantity: 1,
    isNightSlot: true,
  });

  // Base: 500, Night Fee: 150
  // Gross labour: 500 + 150 = 650
  // Safety fee: 0
  // Subtotal: 650
  // Taxable services: 650
  // GST 18%: Math.round(650 * 0.18) = 117
  // Total: 650 + 117 = 767
  assert.equal(result.baseAmount, 500);
  assert.equal(result.nightFee, 150);
  assert.equal(result.safetyFee, 0);
  assert.equal(result.subtotal, 650);
  assert.equal(result.taxGst, 117);
  assert.equal(result.totalPayableInr, 767);
});

test("Pricing Engine - Dynamic config overrides (Tax disabled, custom partner split, custom surcharges)", () => {
  const result = pricingEngine.calculate({
    basePrice: 1000,
    quantity: 1,
    isEmergency: true,
    configOverride: {
      emergencySurcharge: 600,
      taxEnabled: false,
      partnerLabourSplitPercent: 85,
    },
  });

  // Base: 1000, Emergency: 600
  // Gross labour: 1600
  // Safety fee: 0
  // Tax disabled: 0
  // Total: 1600
  assert.equal(result.emergencyFee, 600);
  assert.equal(result.taxGst, 0);
  assert.equal(result.totalPayableInr, 1600);

  // Partner 85% split on 1600: Math.round(1600 * 0.85) = 1360
  // Platform fee: 1600 - 1360 = 240
  assert.equal(result.partnerLabourShare, 1360);
  assert.equal(result.platformFee, 240);
});

test("Pricing Engine - Configurable safety fee when explicitly enabled in CMS", () => {
  const result = pricingEngine.calculate({
    basePrice: 499,
    quantity: 1,
    configOverride: {
      safetyFee: 29,
    },
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
});

