import { formatCurrency } from "@/lib/utils";

export interface ResolvedPriceView {
  label: string;
  priceFormatted: string;
  originalPriceFormatted?: string;
  discountLabel?: string;
  ctaText: string;
}

/**
 * Resolves standard pricing typography and metadata across all pricing models.
 * Complies with sections 15–23 of the Home-e-Fix service card spec.
 */
export function resolveServicePrice(service: any): ResolvedPriceView {
  if (!service) {
    return {
      label: "STARTING FROM",
      priceFormatted: "₹499",
      ctaText: "Book Now",
    };
  }

  const model = (service.pricingModel || service.pricing_model || "STARTING_FROM").toUpperCase();
  const basePrice = service.basePrice ?? service.base_price ?? service.price;
  const discountedPrice = service.discountedPrice ?? service.discounted_price;
  const minPrice = service.minPrice ?? service.min_price ?? service.price_min;
  const maxPrice = service.maxPrice ?? service.max_price ?? service.price_max;
  const unit =
    service.unit ||
    service.pricingUnit ||
    service.pricing_unit ||
    (typeof service.pricingLabel === "string" && service.pricingLabel.includes("per point")
      ? "point"
      : "");

  // Real active discount check: discount only valid if selling price < original price and explicitly active
  const hasRealDiscount = Boolean(
    service.discount_active !== false &&
    discountedPrice &&
    basePrice &&
    discountedPrice < basePrice
  );

  const sellingPrice = hasRealDiscount ? discountedPrice : (discountedPrice || basePrice || 0);

  // 1. QUOTE
  if (model === "QUOTE" || model === "REQUEST_QUOTE") {
    return {
      label: "GET A QUOTE",
      priceFormatted: "Get Estimate",
      ctaText: "Request Quote",
    };
  }

  // 2. INSPECTION REQUIRED
  if (model === "INSPECTION" || model === "INSPECTION_REQUIRED") {
    return {
      label: "INSPECTION REQUIRED",
      priceFormatted: basePrice ? formatCurrency(basePrice) : "Inspection Required",
      ctaText: "Book Inspection",
    };
  }

  // 3. RANGE
  if (model === "RANGE" || (minPrice && maxPrice && minPrice !== maxPrice)) {
    const low = minPrice || basePrice || 0;
    const high = maxPrice || 0;
    return {
      label: "PRICE RANGE",
      priceFormatted: `${formatCurrency(low)}–${formatCurrency(high)}`,
      ctaText: "Book Now",
    };
  }

  // 4. PER_UNIT
  if (model === "PER_UNIT" || model === "PER_POINT" || unit) {
    const resolvedUnit = unit ? ` / ${unit}` : "";
    return {
      label: "RATE",
      priceFormatted: `${formatCurrency(sellingPrice)}${resolvedUnit}`,
      originalPriceFormatted: hasRealDiscount ? formatCurrency(basePrice) : undefined,
      discountLabel: hasRealDiscount ? `Save ${formatCurrency(basePrice - sellingPrice)}` : undefined,
      ctaText: "Book Now",
    };
  }

  // 5. FIXED
  if (model === "FIXED") {
    return {
      label: "FIXED",
      priceFormatted: formatCurrency(sellingPrice),
      originalPriceFormatted: hasRealDiscount ? formatCurrency(basePrice) : undefined,
      discountLabel: hasRealDiscount
        ? `${Math.round(((basePrice - sellingPrice) / basePrice) * 100)}% OFF`
        : undefined,
      ctaText: "Book Now",
    };
  }

  // 6. STARTING FROM (Default)
  return {
    label: "STARTING FROM",
    priceFormatted: formatCurrency(sellingPrice),
    originalPriceFormatted: hasRealDiscount ? formatCurrency(basePrice) : undefined,
    discountLabel: hasRealDiscount
      ? `${Math.round(((basePrice - sellingPrice) / basePrice) * 100)}% OFF`
      : undefined,
    ctaText: "Book Now",
  };
}

/**
 * Clean formatting of duration respecting duration_min & duration_max.
 */
export function formatServiceDuration(service: any): string {
  const min = service.duration_min ?? service.durationMin;
  const max = service.duration_max ?? service.durationMax;
  const duration = service.duration ?? min ?? max ?? 30;

  if (min && max && min !== max) {
    return `${min}–${max} min`;
  }
  if (duration < 60) {
    return `${duration} min`;
  }
  const hours = Math.floor(duration / 60);
  const mins = duration % 60;
  return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
}

/**
 * Compact formatting for genuine warranty policy.
 */
export function formatCompactWarranty(service: any): string | null {
  const warranty = service.warranty || service.service_warranty || service.warranty_description;
  const days = service.warranty_days || service.warrantyDays;

  if (days) {
    return `${days}-day warranty`;
  }

  if (typeof warranty === "string" && warranty.trim()) {
    const lower = warranty.toLowerCase();
    if (lower.includes("90-day")) return "90-day warranty";
    if (lower.includes("30-day")) return "30-day warranty";
    if (lower.includes("24h") || lower.includes("24-hour")) return "24h cover";
    if (lower.includes("rework")) return "Rework guarantee";
    return warranty.length > 20 ? `${warranty.slice(0, 18)}…` : warranty;
  }

  return null;
}
