/**
 * HOME-E-FIX: AUTHORITATIVE CENTRAL PRICING & TAX CALCULATION ENGINE
 *
 * Mathematical Invariants:
 * 1. Integer Paise Arithmetic: All internal financial calculations are performed in integer paise
 *    (1 INR = 100 paise) to eliminate JavaScript IEEE-754 floating-point rounding errors.
 * 2. Taxable Value Rule (CGST Act Section 15):
 *    taxable_value = gross_service_amount + mandatory_fees - discounts
 * 3. Tax Calculation:
 *    tax = Math.round(taxable_value * tax_rate)
 *    Intra-State: CGST = Math.round(tax / 2), SGST = tax - CGST
 *    Inter-State: IGST = tax, CGST = 0, SGST = 0
 * 4. Reconciliation Invariant:
 *    final_total === taxable_value + tax + materials
 *    NEVER calculate taxes on gross undiscounted price while simultaneously applying a discount!
 */

import type { PricingCalculationResult } from "@/types/marketplace.types";
import { RATE_CARD_POLICIES } from "@/constants/services";
import { DEFAULT_PRICING_CONFIG, dbRepository, type PricingConfig } from "@/services/db/repository";
import { BUSINESS_TAX_CONFIG, resolveTaxSplitPolicy } from "@/config/tax.config";

export function toPaise(rupees: number | undefined | null): number {
  if (rupees === undefined || rupees === null || isNaN(Number(rupees))) return 0;
  return Math.round(Number(rupees) * 100);
}

export function fromPaise(paise: number | undefined | null): number {
  if (paise === undefined || paise === null || isNaN(Number(paise))) return 0;
  return Number((Number(paise) / 100).toFixed(2));
}

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
  customerState?: string;
  placeOfSupplyState?: string;
  isGstRegisteredOverride?: boolean;
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

export const pricingEngine = {
  /**
   * Authoritative calculation service.
   * Single source of truth for booking, invoice, checkout, and receipt totals.
   */
  calculate(input: PricingInput): PricingCalculationResult {
    let basePaise = 0;
    let qty = 1;
    let unitPricePaise = 0;
    let itemsMaterialsPaise = 0;

    if (input.items && input.items.length > 0) {
      qty = input.items.reduce((sum, item) => sum + Math.max(1, item.quantity || 1), 0);
      basePaise = input.items.reduce((sum, item) => {
        const itemPrice = item.variantPrice !== undefined && item.variantPrice > 0 ? item.variantPrice : item.basePrice;
        return sum + toPaise(itemPrice) * Math.max(1, item.quantity || 1);
      }, 0);
      unitPricePaise = input.items.length === 1
        ? toPaise(input.items[0].variantPrice ?? input.items[0].basePrice)
        : Math.round(basePaise / qty);
      itemsMaterialsPaise = input.items.reduce((sum, item) => sum + toPaise(item.materialsTotal || 0), 0);
    } else {
      qty = Math.max(1, input.quantity || 1);
      const unit = input.variantPrice !== undefined && input.variantPrice > 0
        ? input.variantPrice
        : (input.basePrice ?? 0);
      unitPricePaise = toPaise(unit);
      basePaise = unitPricePaise * qty;
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

    const addonsPaise = toPaise(input.addonsTotal || 0);
    const materialsPaise = toPaise(input.materialsTotal || 0) + itemsMaterialsPaise;
    const emergencyFeePaise = input.isEmergency ? toPaise(activeConfig.emergencySurcharge ?? 499) : 0;
    const nightFeePaise = input.isNightSlot
      ? toPaise(activeConfig.nightPeakSurcharge ?? RATE_CARD_POLICIES?.nightPeakSurcharge?.fee ?? 150)
      : 0;
    const safetyFeePaise = input.isPlusMember ? 0 : toPaise(activeConfig.safetyFee ?? 0);

    const grossLabourPaise = basePaise + addonsPaise + emergencyFeePaise + nightFeePaise;
    let discountMembershipPaise = 0;

    // Home-e-Fix PLUS: 20% discount on labour
    if (input.isPlusMember) {
      discountMembershipPaise = Math.round(grossLabourPaise * 0.2);
    }

    const netLabourAfterPlusPaise = grossLabourPaise - discountMembershipPaise;
    let discountCouponPaise = 0;
    const activeCouponCode = input.couponCode?.trim().toUpperCase();

    if (activeCouponCode && VERIFIED_COUPONS[activeCouponCode]) {
      const c = VERIFIED_COUPONS[activeCouponCode];
      const minBillPaise = toPaise(c.minBill);
      if (netLabourAfterPlusPaise >= minBillPaise) {
        if (c.type === "FLAT") {
          discountCouponPaise = toPaise(c.value);
        } else if (c.type === "PERCENTAGE") {
          const calculated = Math.round((netLabourAfterPlusPaise * c.value) / 100);
          const maxDiscountPaise = c.maxDiscount ? toPaise(c.maxDiscount) : undefined;
          discountCouponPaise = maxDiscountPaise ? Math.min(calculated, maxDiscountPaise) : calculated;
        }
      }
    }

    // Cap total discounts to gross labor
    const totalDiscountPaise = Math.min(grossLabourPaise, discountMembershipPaise + discountCouponPaise);

    // Standardized Taxable Base: Net Labour + Safety Fee
    const taxableAmountPaise = Math.max(0, grossLabourPaise - totalDiscountPaise + safetyFeePaise);

    // Tax Determination
    const gstRatePercent = activeConfig.taxEnabled !== false
      ? (activeConfig.gstRatePercent ?? BUSINESS_TAX_CONFIG.defaultGstRatePercent)
      : 0;

    const customerState = input.placeOfSupplyState || input.customerState || "West Bengal";
    const taxPolicy = resolveTaxSplitPolicy(
      customerState,
      gstRatePercent,
      input.isGstRegisteredOverride ?? (activeConfig.taxEnabled !== false)
    );

    let taxTotalPaise = 0;
    let cgstPaise = 0;
    let sgstPaise = 0;
    let igstPaise = 0;

    if (activeConfig.taxEnabled !== false && gstRatePercent > 0) {
      taxTotalPaise = Math.round((taxableAmountPaise * gstRatePercent) / 100);
      if (taxPolicy.supplyType === "INTRA_STATE") {
        cgstPaise = Math.round(taxTotalPaise / 2);
        sgstPaise = taxTotalPaise - cgstPaise;
        igstPaise = 0;
      } else {
        igstPaise = taxTotalPaise;
        cgstPaise = 0;
        sgstPaise = 0;
      }
    }

    // Final grand total payable: Taxable Value + Total Tax + Materials
    const totalPayablePaise = taxableAmountPaise + taxTotalPaise + materialsPaise;
    const totalPayableInr = fromPaise(totalPayablePaise);

    // Dynamic Split: Partner share (default 80%), platform remainder, 100% materials to partner
    const splitRatio = Math.min(0.95, Math.max(0.5, (activeConfig.partnerLabourSplitPercent ?? 80) / 100));
    const partnerLabourShare = Math.round(fromPaise(Math.round(netLabourAfterPlusPaise * splitRatio) + materialsPaise));
    const platformFee = Math.round(fromPaise(Math.max(0, Math.round(netLabourAfterPlusPaise * (1 - splitRatio)))));

    // Base package subtotal and net subtotal
    const baseAmountInr = fromPaise(basePaise);
    const subtotalPaise = Math.max(0, netLabourAfterPlusPaise - discountCouponPaise + materialsPaise);
    const subtotalInr = fromPaise(subtotalPaise);

    return {
      baseAmount: baseAmountInr,
      baseAmountPaise: basePaise,
      selectedVariantPrice: fromPaise(unitPricePaise),
      quantity: qty,
      addonsAmount: fromPaise(addonsPaise),
      materialsAmount: fromPaise(materialsPaise),
      emergencyFee: fromPaise(emergencyFeePaise),
      nightFee: fromPaise(nightFeePaise),
      safetyFee: fromPaise(safetyFeePaise),
      subtotal: subtotalInr,
      discountCoupon: fromPaise(discountCouponPaise),
      discountMembership: fromPaise(discountMembershipPaise),
      totalDiscount: fromPaise(totalDiscountPaise),
      taxableAmount: fromPaise(taxableAmountPaise),
      taxableAmountPaise,
      taxRatePercent: gstRatePercent,
      isGstApplicable: taxPolicy.isGstApplicable,
      supplyType: taxPolicy.supplyType,
      cgstAmount: fromPaise(cgstPaise),
      cgstPaise,
      sgstAmount: fromPaise(sgstPaise),
      sgstPaise,
      igstAmount: fromPaise(igstPaise),
      igstPaise,
      taxGst: fromPaise(taxTotalPaise),
      taxGstPaise: taxTotalPaise,
      couponCode: activeCouponCode,
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
  customerState?: string;
  placeOfSupplyState?: string;
  isGstRegisteredOverride?: boolean;
}

export function calculateBookingPrice(params: CalculateBookingPriceParams): PricingCalculationResult {
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
    customerState: params.customerState,
    placeOfSupplyState: params.placeOfSupplyState,
    isGstRegisteredOverride: params.isGstRegisteredOverride,
    configOverride: params.tax
      ? { taxEnabled: params.tax.enabled, gstRatePercent: params.tax.ratePercent }
      : undefined,
  });
}

/**
 * Creates a frozen, immutable commercial pricing snapshot for a confirmed booking.
 * This snapshot MUST be used for generating invoices and payment receipts without recalculating.
 */
export function createCommercialPricingSnapshot(
  pricing: PricingCalculationResult,
  metadata?: {
    serviceId?: string;
    serviceName?: string;
    variantId?: string;
    variantName?: string;
    packageId?: string;
    packageName?: string;
  }
) {
  return {
    pricingVersion: "2026.1",
    frozenAt: new Date().toISOString(),
    currency: "INR",
    serviceId: metadata?.serviceId,
    serviceName: metadata?.serviceName,
    variantId: metadata?.variantId,
    variantName: metadata?.variantName,
    packageId: metadata?.packageId,
    packageName: metadata?.packageName,
    basePrice: pricing.baseAmount,
    basePricePaise: pricing.baseAmountPaise,
    quantity: pricing.quantity,
    safetyFee: pricing.safetyFee,
    emergencyFee: pricing.emergencyFee,
    nightFee: pricing.nightFee || 0,
    materialsAmount: pricing.materialsAmount,
    discountCoupon: pricing.discountCoupon,
    discountMembership: pricing.discountMembership,
    totalDiscount: pricing.totalDiscount,
    couponCode: pricing.couponCode || null,
    taxableValue: pricing.taxableAmount,
    taxableValuePaise: pricing.taxableAmountPaise,
    taxRatePercent: pricing.taxRatePercent,
    isGstApplicable: pricing.isGstApplicable,
    supplyType: pricing.supplyType,
    cgstAmount: pricing.cgstAmount,
    cgstPaise: pricing.cgstPaise,
    sgstAmount: pricing.sgstAmount,
    sgstPaise: pricing.sgstPaise,
    igstAmount: pricing.igstAmount,
    igstPaise: pricing.igstPaise,
    totalTax: pricing.taxGst,
    totalTaxPaise: pricing.taxGstPaise,
    grandTotal: pricing.totalPayableInr,
    grandTotalPaise: pricing.totalPayablePaise,
  };
}
