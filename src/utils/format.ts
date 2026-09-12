export { formatCurrency, formatCompactCurrency, parseCurrency } from "@/lib/currency";
export { formatDate, formatTime, formatDateTime, formatRelativeTime, formatDuration, formatDateRange, parseDate, nowIso } from "@/lib/date";

/**
 * Format a number using Indian numbering system.
 */
export function formatNumber(num: number): string {
  return new Intl.NumberFormat("en-IN").format(num);
}

/**
 * Format file size in bytes to human-readable.
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Format a phone number with country code.
 */
export function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  }
  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2, 7)} ${digits.slice(7)}`;
  }
  return phone;
}

/**
 * Format a rating to one decimal place.
 */
export function formatRating(rating: number): string {
  return rating.toFixed(1);
}
