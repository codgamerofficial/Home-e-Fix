import type { PricingCalculationResult } from "@/types/marketplace.types";

export interface PricingInput {
  basePrice: number;
  variantPrice?: number;
  quantity?: number;
  addonsTotal?: number;
  materialsTotal?: number;
  isEmergency?: boolean;
  couponCode?: string;
  isPlusMember?: boolean;
}

const VERIFIED_COUPONS: Record<
  string,
  { type: "PERCENTAGE" | "FLAT"; value: number; minBill: number; maxDiscount?: number }
> = {
  FIRSTFIX100: { type: "FLAT", value: 100, minBill: 299 },
  HOMEEFIX20: { type: "PERCENTAGE", value: 20, minBill: 499, maxDiscount: 250 },
  PLUSMEMBER: { type: "FLAT", value: 150, minBill: 399 },
  FESTIVE50: { type: "FLAT", value: 50, minBill: 199 },
};

/**
 * Server-Authoritative Pricing Engine
 * Performs exact integer paise arithmetic to eliminate floating-point rounding errors.
 */
export const pricingEngine = {
  calculate(input: PricingInput): PricingCalculationResult {
    const qty = Math.max(1, input.quantity || 1);
    const unitPrice = input.variantPrice !== undefined && input.variantPrice > 0
      ? input.variantPrice
      : input.basePrice;

    const baseAmount = unitPrice * qty;
    const addonsAmount = Math.max(0, input.addonsTotal || 0);
    const materialsAmount = Math.max(0, input.materialsTotal || 0);
    const emergencyFee = input.isEmergency ? 499 : 0;
    const safetyFee = input.isPlusMember ? 0 : 29; // Waived for PLUS members

    const grossLabour = baseAmount + addonsAmount + emergencyFee;
    let discountMembership = 0;

    // Home-e-Fix PLUS: 20% discount on labour
    if (input.isPlusMember) {
      discountMembership = Math.round(grossLabour * 0.2);
    }

    const netLabourAfterPlus = grossLabour - discountMembership;
    let discountCoupon = 0;
    const activeCouponCode = input.couponCode?.trim().toUpperCase();

    if (activeCouponCode && VERIFIED_COUPONS[activeCouponCode]) {
      const c = VERIFIED_COUPONS[activeCouponCode];
      if (netLabourAfterPlus >= c.minBill) {
        if (c.type === "FLAT") {
          discountCoupon = c.value;
        } else if (c.type === "PERCENTAGE") {
          const calculated = Math.round((netLabourAfterPlus * c.value) / 100);
          discountCoupon = c.maxDiscount ? Math.min(calculated, c.maxDiscount) : calculated;
        }
      }
    }

    const subtotal = Math.max(0, netLabourAfterPlus - discountCoupon + materialsAmount);
    // GST: 18% on total taxable services (labour + safety fee)
    const taxableLabour = Math.max(0, netLabourAfterPlus - discountCoupon + safetyFee);
    const taxGst = Math.round(taxableLabour * 0.18);

    const totalPayableInr = subtotal + safetyFee + taxGst;
    const totalPayablePaise = totalPayableInr * 100;

    // Split: 80% labour to technician, 20% platform fee, 100% materials to technician
    const partnerLabourShare = Math.round(netLabourAfterPlus * 0.8) + materialsAmount;
    const platformFee = Math.round(netLabourAfterPlus * 0.2);

    return {
      baseAmount,
      selectedVariantPrice: unitPrice,
      quantity: qty,
      addonsAmount,
      materialsAmount,
      emergencyFee,
      safetyFee,
      subtotal,
      taxGst,
      couponCode: activeCouponCode,
      discountCoupon,
      discountMembership,
      totalPayableInr,
      totalPayablePaise,
      partnerLabourShare,
      platformFee,
    };
  },

  validateCoupon(code: string, subtotal: number): { valid: boolean; discount: number; message: string } {
    const cleanCode = code.trim().toUpperCase();
    const coupon = VERIFIED_COUPONS[cleanCode];

    if (!coupon) {
      return { valid: false, discount: 0, message: "Invalid coupon code." };
    }

    if (subtotal < coupon.minBill) {
      return {
        valid: false,
        discount: 0,
        message: `This coupon requires a minimum bill of ₹${coupon.minBill}.`,
      };
    }

    let discount = 0;
    if (coupon.type === "FLAT") {
      discount = coupon.value;
    } else {
      const calc = Math.round((subtotal * coupon.value) / 100);
      discount = coupon.maxDiscount ? Math.min(calc, coupon.maxDiscount) : calc;
    }

    return { valid: true, discount, message: `Coupon applied: Saved ₹${discount}!` };
  },
};
