export const APP_CONSTANTS = {
  /** Maximum file upload size in bytes (5MB) */
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  /** Allowed image MIME types */
  ALLOWED_IMAGE_TYPES: ["image/jpeg", "image/png", "image/webp"],
  /** Debounce delay for search inputs (ms) */
  SEARCH_DEBOUNCE_MS: 300,
  /** Toast auto-dismiss duration (ms) */
  TOAST_DURATION_MS: 4000,
  /** Session refresh interval (ms) — 14 minutes */
  SESSION_REFRESH_INTERVAL_MS: 14 * 60 * 1000,
  /** OTP resend cooldown (seconds) */
  OTP_RESEND_COOLDOWN_S: 30,
  /** Maximum addresses per user */
  MAX_ADDRESSES: 5,
} as const;
