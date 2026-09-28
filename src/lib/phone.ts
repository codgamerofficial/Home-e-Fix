/**
 * Canonical Indian Mobile Phone Normalization Utility
 *
 * Requirements:
 * - Indian country code +91
 * - Exactly 10 mobile digits
 * - First digit must be 6, 7, 8, or 9
 * - Strips whitespace, hyphens, brackets, and prefixes (0, 91, +91)
 * - Returns canonical E.164 string: +91XXXXXXXXXX
 * - Throws descriptive error on invalid phone numbers
 */

export interface PhoneNormalizationResult {
  valid: boolean;
  e164: string | null;
  reason?: string;
}

/**
 * Validates and normalizes an Indian mobile phone number into E.164 format.
 * Returns structured validation result: { valid, e164, reason }
 */
export function validateIndianPhone(input: string): PhoneNormalizationResult {
  if (!input || typeof input !== "string" || input.trim() === "") {
    return {
      valid: false,
      e164: null,
      reason: "Please enter a valid mobile number.",
    };
  }

  // Strip all non-digit characters (spaces, hyphens, parentheses, plus signs)
  let digits = input.replace(/\D/g, "");

  // If starts with Indian country code 91 and has 12 digits, strip leading 91
  if (digits.length === 12 && digits.startsWith("91")) {
    digits = digits.slice(2);
  } else if (digits.length === 11 && digits.startsWith("0")) {
    // If starts with leading 0 trunk prefix, strip 0
    digits = digits.slice(1);
  }

  // Must have exactly 10 digits
  if (digits.length !== 10) {
    return {
      valid: false,
      e164: null,
      reason: "Mobile number must be exactly 10 digits. Enter a valid Indian mobile number.",
    };
  }

  // First digit must be 6, 7, 8, or 9 (TRAI National Numbering Plan)
  if (!/^[6-9][0-9]{9}$/.test(digits)) {
    return {
      valid: false,
      e164: null,
      reason: "Please enter a valid Indian mobile number starting with 6, 7, 8, or 9.",
    };
  }

  return {
    valid: true,
    e164: `+91${digits}`,
  };
}

/**
 * Returns canonical E.164 string (+91XXXXXXXXXX) or throws descriptive error.
 */
export function normalizeIndianPhone(input: string): string {
  const result = validateIndianPhone(input);
  if (!result.valid || !result.e164) {
    throw new Error(result.reason || "Invalid Indian mobile number.");
  }
  return result.e164;
}

export function isValidIndianPhone(input: string): boolean {
  return validateIndianPhone(input).valid;
}

/**
 * Masks phone number for safe observability and privacy.
 * Example: +919876543210 -> +91******3210
 */
export function maskIndianPhone(phone: string): string {
  try {
    const normalized = normalizeIndianPhone(phone);
    const last4 = normalized.slice(-4);
    return `+91******${last4}`;
  } catch {
    return "+91******0000";
  }
}

/**
 * Formats canonical phone for user-friendly UI display.
 * Example: +919876543210 -> +91 98765 43210
 */
export function formatIndianPhoneDisplay(phone: string): string {
  try {
    const normalized = normalizeIndianPhone(phone);
    const digits = normalized.slice(3);
    return `+91 ${digits.slice(0, 5)} ${digits.slice(5)}`;
  } catch {
    return phone;
  }
}
