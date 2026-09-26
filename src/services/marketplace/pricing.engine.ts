import type { PricingCalculationResult } from "@/types/marketplace.types";
import { RATE_CARD_POLICIES } from "@/constants/services";
import { DEFAULT_PRICING_CONFIG, dbRepository, type PricingConfig } from "@/services/db/repository";

export interface PricingItemInput {
  basePrice: number;
  variantPrice?: number;
  quantity?: number;
  materialsTotal?: number;
  isEligibleForPlusDiscount?: boolean;
  serviceId?: string;
  serviceName?: string;
}

export interface PricingInput {
  basePrice?: number;
  variantPrice?: number;
  quantity?: number;
  items?: PricingItemInput[];
  addonsTotal?: number;
  materialsTotal?: number;
  isEmergency?: boolean;
  isNightSlot?: boolean;
  couponCode?: string;
  isPlusMember?: boolean;
  configOverride?: Partial<PricingConfig>;
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
    let baseAmount = 0;
    let qty = 1;
    let unitPrice = 0;
    let itemsMaterialsAmount = 0;

    if (input.items && input.items.length > 0) {
      qty = input.items.reduce((sum, item) => sum + Math.max(1, item.quantity || 1), 0);
      baseAmount = input.items.reduce((sum, item) => {
        const itemPrice = item.variantPrice !== undefined && item.variantPrice > 0 ? item.variantPrice : item.basePrice;
        return sum + itemPrice * Math.max(1, item.quantity || 1);
      }, 0);
      unitPrice = input.items.length === 1 ? (input.items[0].variantPrice ?? input.items[0].basePrice) : Math.round(baseAmount / qty);
      itemsMaterialsAmount = input.items.reduce((sum, item) => sum + (item.materialsTotal || 0), 0);
    } else {
      qty = Math.max(1, input.quantity || 1);
      unitPrice = input.variantPrice !== undefined && input.variantPrice > 0
        ? input.variantPrice
        : (input.basePrice ?? 0);
      baseAmount = unitPrice * qty;
    }

    let activeConfig: PricingConfig = DEFAULT_PRICING_CONFIG;
    try {
      if (typeof window !== "undefined" && typeof localStorage !== "undefined" && dbRepository?.getPricingConfig) {
        activeConfig = { ...DEFAULT_PRICING_CONFIG, ...dbRepository.getPricingConfig() };
      }
    } catch {
      activeConfig = DEFAULT_PRICING_CONFIG;
    }
    if (input.configOverride) {
      activeConfig = { ...activeConfig, ...input.configOverride };
    }

    const addonsAmount = Math.max(0, input.addonsTotal || 0);
    const materialsAmount = Math.max(0, (input.materialsTotal || 0) + itemsMaterialsAmount);
    const emergencyFee = input.isEmergency ? (activeConfig.emergencySurcharge ?? 499) : 0;
    const nightFee = input.isNightSlot ? (activeConfig.nightPeakSurcharge ?? RATE_CARD_POLICIES?.nightPeakSurcharge?.fee ?? 150) : 0;
    const safetyFee = input.isPlusMember ? 0 : (activeConfig.safetyFee ?? 0);

    const grossLabour = baseAmount + addonsAmount + emergencyFee + nightFee;
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
    // Dynamic GST: taxable services (labour + safety fee)
    const taxableLabour = Math.max(0, netLabourAfterPlus - discountCoupon + safetyFee);
    const taxRate = activeConfig.taxEnabled !== false ? ((activeConfig.gstRatePercent ?? 18) / 100) : 0;
    const taxGst = Math.round(taxableLabour * taxRate);

    const totalPayableInr = subtotal + safetyFee + taxGst;
    const totalPayablePaise = totalPayableInr * 100;

    // Dynamic Split: configured partner split (default 80%), platform remainder, 100% materials to technician
    const splitRatio = Math.min(0.95, Math.max(0.5, (activeConfig.partnerLabourSplitPercent ?? 80) / 100));
    const partnerLabourShare = Math.round(netLabourAfterPlus * splitRatio) + materialsAmount;
    const platformFee = Math.max(0, Math.round(netLabourAfterPlus * (1 - splitRatio)));

    return {
      baseAmount,
      selectedVariantPrice: unitPrice,
      quantity: qty,
      addonsAmount,
      materialsAmount,
      emergencyFee,
      nightFee,
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

export interface CalculateBookingPriceParams {
  items: Array<{
    serviceId?: string;
    serviceName?: string;
    basePrice?: number;
    unitPrice?: number;
    quantity: number;
    materialsTotal?: number;
  }>;
  membership?: { isActive: boolean; discountPercentage?: number };
  visitingFee?: number;
  materials?: number;
  tax?: { enabled: boolean; ratePercent: number };
  discount?: number;
  surcharge?: number;
  isEmergency?: boolean;
  isNightSlot?: boolean;
  couponCode?: string;
}

export function calculateBookingPrice(params: CalculateBookingPriceParams) {
  return pricingEngine.calculate({
    items: params.items.map((i) => ({
      serviceId: i.serviceId,
      serviceName: i.serviceName,
      basePrice: i.basePrice ?? i.unitPrice ?? 0,
      variantPrice: i.unitPrice,
      quantity: i.quantity,
      materialsTotal: i.materialsTotal,
    })),
    materialsTotal: params.materials,
    isPlusMember: Boolean(params.membership?.isActive),
    isEmergency: params.isEmergency,
    isNightSlot: params.isNightSlot,
    couponCode: params.couponCode,
    configOverride: params.tax
      ? { taxEnabled: params.tax.enabled, gstRatePercent: params.tax.ratePercent }
      : undefined,
  });
}

