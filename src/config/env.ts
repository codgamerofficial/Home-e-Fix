import { z } from "zod";

/**
 * Zod schema for validating runtime environment variables.
 * Enforces strict type boundaries and distinguishes configured vs unconfigured external services.
 */
const envSchema = z.object({
  // Supabase Database & Auth (Mandatory)
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL").optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10, "VITE_SUPABASE_ANON_KEY must be a valid key").optional(),
  VITE_SUPABASE_AUTH_CALLBACK_URL: z.string().url().optional(),

  // API Base
  VITE_API_BASE_URL: z.string().default("/api"),

  // Payment Gateway (Razorpay)
  VITE_RAZORPAY_KEY_ID: z.string().optional(),

  // Google OAuth
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),

  // Map Service
  VITE_MAP_API_KEY: z.string().optional(),
  VITE_MAPMYINDIA_MAP_API_KEY: z.string().optional(),
  VITE_MAPMYINDIA_CLIENT_ID: z.string().optional(),

  // Application Mode
  MODE: z.enum(["development", "production", "test"]).default("development"),
});

/**
 * Safe parsed environment variables with fallback flags.
 */
function parseEnv() {
  const rawEnv = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_AUTH_CALLBACK_URL: import.meta.env.VITE_SUPABASE_AUTH_CALLBACK_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL,
    VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_MAP_API_KEY: import.meta.env.VITE_MAP_API_KEY,
    VITE_MAPMYINDIA_MAP_API_KEY: import.meta.env.VITE_MAPMYINDIA_MAP_API_KEY,
    VITE_MAPMYINDIA_CLIENT_ID: import.meta.env.VITE_MAPMYINDIA_CLIENT_ID,
    MODE: import.meta.env.MODE || "development",
  };

  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    console.error("[Home-e-Fix Env Validation Failed]:", result.error.format());
    return rawEnv as z.infer<typeof envSchema>;
  }

  return result.data;
}

export const ENV = parseEnv();

/**
 * Helper to check if a specific external service integration is truly configured.
 */
export function isServiceConfigured(service: "supabase" | "razorpay" | "maps" | "google_oauth" | "otp"): boolean {
  switch (service) {
    case "supabase":
      return Boolean(
        ENV.VITE_SUPABASE_URL &&
        ENV.VITE_SUPABASE_ANON_KEY &&
        !ENV.VITE_SUPABASE_URL.includes("placeholder")
      );
    case "razorpay":
      return Boolean(
        ENV.VITE_RAZORPAY_KEY_ID &&
        !ENV.VITE_RAZORPAY_KEY_ID.includes("placeholder")
      );
    case "maps":
      return Boolean(
        (ENV.VITE_MAP_API_KEY && !ENV.VITE_MAP_API_KEY.includes("placeholder")) ||
        (ENV.VITE_MAPMYINDIA_MAP_API_KEY && !ENV.VITE_MAPMYINDIA_MAP_API_KEY.includes("placeholder"))
      );
    case "google_oauth":
      return Boolean(
        ENV.VITE_GOOGLE_CLIENT_ID &&
        !ENV.VITE_GOOGLE_CLIENT_ID.includes("placeholder")
      );
    case "otp":
      // In production, OTP requires configured Supabase Phone Auth provider or external SMS gateway
      return isServiceConfigured("supabase");
    default:
      return false;
  }
}
