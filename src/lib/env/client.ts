import { z } from "zod";

/**
 * Authoritative Client-Side Environment Schema.
 * Validates only public/browser-safe variables.
 * Under no circumstances may server-only secrets be added here.
 */
const clientEnvSchema = z.object({
  // Supabase (Public)
  VITE_SUPABASE_URL: z.string().url("VITE_SUPABASE_URL must be a valid URL").optional(),
  VITE_SUPABASE_ANON_KEY: z.string().min(10, "VITE_SUPABASE_ANON_KEY must be a valid JWT").optional(),
  VITE_SUPABASE_AUTH_CALLBACK_URL: z.string().url().optional(),

  // API Gateway
  VITE_API_BASE_URL: z.string().default("/api"),

  // Payment Gateway Public Key
  VITE_RAZORPAY_KEY_ID: z.string().optional(),

  // Google OAuth Client ID (Public)
  VITE_GOOGLE_CLIENT_ID: z.string().optional(),

  // Browser Maps
  VITE_MAP_API_KEY: z.string().optional(),
  VITE_MAPMYINDIA_MAP_API_KEY: z.string().optional(),
  VITE_MAPMYINDIA_CLIENT_ID: z.string().optional(),

  // App Mode & Info
  MODE: z.enum(["development", "production", "test"]).default("development"),
});

function parseClientEnv() {
  const rawEnv = {
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY,
    VITE_SUPABASE_AUTH_CALLBACK_URL: import.meta.env.VITE_SUPABASE_AUTH_CALLBACK_URL,
    VITE_API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
    VITE_RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
    VITE_GOOGLE_CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID,
    VITE_MAP_API_KEY: import.meta.env.VITE_MAP_API_KEY || import.meta.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
    VITE_MAPMYINDIA_MAP_API_KEY: import.meta.env.VITE_MAPMYINDIA_MAP_API_KEY,
    VITE_MAPMYINDIA_CLIENT_ID: import.meta.env.VITE_MAPMYINDIA_CLIENT_ID,
    MODE: import.meta.env.MODE || "development",
  };

  const parsed = clientEnvSchema.safeParse(rawEnv);
  if (!parsed.success) {
    console.warn("[Home-e-Fix Client Env Notice]: Some external client variables are not set or in test mode.", parsed.error.format());
    return rawEnv as z.infer<typeof clientEnvSchema>;
  }
  return parsed.data;
}

export const CLIENT_ENV = parseClientEnv();

export function isClientServiceConfigured(service: "supabase" | "razorpay" | "maps" | "google_oauth"): boolean {
  switch (service) {
    case "supabase":
      return Boolean(
        CLIENT_ENV.VITE_SUPABASE_URL &&
        CLIENT_ENV.VITE_SUPABASE_ANON_KEY &&
        !CLIENT_ENV.VITE_SUPABASE_URL.includes("placeholder")
      );
    case "razorpay":
      return Boolean(
        CLIENT_ENV.VITE_RAZORPAY_KEY_ID &&
        !CLIENT_ENV.VITE_RAZORPAY_KEY_ID.includes("placeholder")
      );
    case "maps":
      return Boolean(
        (CLIENT_ENV.VITE_MAP_API_KEY && !CLIENT_ENV.VITE_MAP_API_KEY.includes("placeholder")) ||
        (CLIENT_ENV.VITE_MAPMYINDIA_MAP_API_KEY && !CLIENT_ENV.VITE_MAPMYINDIA_MAP_API_KEY.includes("placeholder"))
      );
    case "google_oauth":
      return Boolean(
        CLIENT_ENV.VITE_GOOGLE_CLIENT_ID &&
        !CLIENT_ENV.VITE_GOOGLE_CLIENT_ID.includes("placeholder")
      );
    default:
      return false;
  }
}
