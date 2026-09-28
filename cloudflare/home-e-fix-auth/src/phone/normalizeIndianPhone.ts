/**
 * Canonical Indian Phone Normalization for Cloudflare Worker
 *
 * Rules:
 * - Indian country code +91
 * - Exactly 10 mobile digits
 * - First digit must be 6, 7, 8 or 9
 * - Strips whitespace, hyphens, parentheses, prefixes (0, 91, +91)
 * - Returns canonical: +91XXXXXXXXXX
 */

export interface PhoneNormalizationResult {
  valid: boolean;
  e164: string | null;
  reason?: string;
}

export function validateIndianPhone(input: string): PhoneNormalizationResult {
  if (!input || typeof input !== "string" || input.trim() === "") {
    return { valid: false, e164: null, reason: "Enter a valid Indian mobile number." };
  }

  let digits = input.replace(/\D/g, "");

  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    digits = digits.slice(1);
  }

  if (digits.length !== 10) {
    return { valid: false, e164: null, reason: "Enter a valid Indian mobile number." };
  }

  if (!/^[6-9][0-9]{9}$/.test(digits)) {
    return { valid: false, e164: null, reason: "Enter a valid Indian mobile number." };
  }

  return { valid: true, e164: `+91${digits}` };
}

export function normalizeIndianPhone(input: string): string {
  const result = validateIndianPhone(input);
  if (!result.valid || !result.e164) {
    throw new Error(result.reason || "Enter a valid Indian mobile number.");
  }
  return result.e164;
}

export function maskIndianPhone(phone: string): string {
  try {
    const normalized = normalizeIndianPhone(phone);
    return `+91******${normalized.slice(-4)}`;
  } catch {
    return "+91******0000";
  }
}
