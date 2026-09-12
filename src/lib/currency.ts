/**
 * Centralized Indian Rupee Currency Utility for Home-e-Fix
 * Formats according to the Indian numbering system (Lakhs, Crores, etc.).
 */

export const CURRENCY_CODE = "INR";
export const CURRENCY_SYMBOL = "₹";

/**
 * Format a number as Indian Rupee currency (e.g., ₹999, ₹42,800, ₹4,28,000).
 */
export function formatCurrency(amount: number | null | undefined): string {
  const numeric = typeof amount === "number" ? amount : 0;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: CURRENCY_CODE,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numeric);
}

/**
 * Format compact Indian currency (e.g., ₹42.8L, ₹1.2Cr, ₹5.5K).
 */
export function formatCompactCurrency(amount: number | null | undefined): string {
  const val = typeof amount === "number" ? amount : 0;
  if (Math.abs(val) >= 10000000) {
    return `${CURRENCY_SYMBOL}${(val / 10000000).toFixed(1)}Cr`;
  }
  if (Math.abs(val) >= 100000) {
    return `${CURRENCY_SYMBOL}${(val / 100000).toFixed(1)}L`;
  }
  if (Math.abs(val) >= 1000) {
    return `${CURRENCY_SYMBOL}${(val / 1000).toFixed(1)}K`;
  }
  return formatCurrency(val);
}

/**
 * Parse string into numeric amount (e.g., "₹4,280" -> 4280).
 */
export function parseCurrency(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[^0-9.-]+/g, "");
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : val;
}
