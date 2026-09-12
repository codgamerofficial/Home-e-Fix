/**
 * Production structured logging module for Home-e-Fix.
 * Adheres strictly to security & privacy principles:
 * Never logs passwords, OTPs, secret keys, tokens, or sensitive identity documents.
 */

type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = [
  "password",
  "otp",
  "token",
  "secret",
  "access_token",
  "refresh_token",
  "authorization",
  "cvv",
  "card_number",
  "pan",
  "aadhaar",
  "api_key",
  "razorpay_key_secret",
];

/**
 * Deeply scrubs sensitive values from log objects.
 */
function sanitize(obj: any): any {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === "string") {
    // Mask potential 6-digit OTPs in raw strings
    return obj.replace(/\b\d{6}\b/g, "******");
  }

  if (typeof obj !== "object") return obj;

  if (Array.isArray(obj)) {
    return obj.map(sanitize);
  }

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    const isSensitive = SENSITIVE_KEYS.some((sk) => key.toLowerCase().includes(sk));
    if (isSensitive) {
      sanitized[key] = "[REDACTED_SENSITIVE]";
    } else {
      sanitized[key] = sanitize(value);
    }
  }

  return sanitized;
}

export const logger = {
  debug(message: string, context?: Record<string, any>) {
    if (import.meta.env.DEV) {
      console.debug(`[DEBUG] ${message}`, context ? sanitize(context) : "");
    }
  },

  info(message: string, context?: Record<string, any>) {
    console.info(`[INFO] ${message}`, context ? sanitize(context) : "");
  },

  warn(message: string, context?: Record<string, any>) {
    console.warn(`[WARN] ${message}`, context ? sanitize(context) : "");
  },

  error(message: string, error?: unknown, context?: Record<string, any>) {
    const errorDetails = error instanceof Error
      ? { name: error.name, message: error.message, stack: error.stack }
      : error;

    console.error(`[ERROR] ${message}`, {
      error: sanitize(errorDetails),
      ...(context ? sanitize(context) : {}),
    });
  },
};
