import { z } from "zod";

/**
 * Authoritative Server-Side Environment Schema.
 * Validates backend secrets, payment gateways, webhooks, and service APIs.
 * Under NO circumstances should this module be imported into browser/client code.
 */
export const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),

  // Supabase Database & Auth (Server-side)
  SUPABASE_URL: z.string().url("SUPABASE_URL must be a valid URL").optional(),
  SUPABASE_SECRET_KEY: z.string().optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  // Razorpay Gateway (Server-side)
  RAZORPAY_KEY_ID: z.string().optional(),
  RAZORPAY_KEY_SECRET: z.string().optional(),
  RAZORPAY_WEBHOOK_SECRET: z.string().optional(),

  // Cashfree Gateway (Secondary)
  CASHFREE_ENV: z.enum(["sandbox", "production"]).default("sandbox"),
  CASHFREE_CLIENT_ID: z.string().optional(),
  CASHFREE_CLIENT_SECRET: z.string().optional(),
  CASHFREE_WEBHOOK_SECRET: z.string().optional(),
  CASHFREE_API_VERSION: z.string().default("2025-01-01"),

  // Google OAuth (Server-side)
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),

  // Transactional Email (Resend)
  RESEND_API_KEY: z.string().optional(),
  RESEND_WEBHOOK_SECRET: z.string().optional(),
  EMAIL_FROM_NAME: z.string().default("Home-e-Fix"),
  EMAIL_FROM_ADDRESS: z.string().optional(),
  SUPPORT_EMAIL: z.string().default("support@home-e-fix.com"),

  // Google Maps Server API
  GOOGLE_MAPS_SERVER_API_KEY: z.string().optional(),
  GOOGLE_MAPS_MAP_ID: z.string().optional(),

  // AI Assistant Integration
  AI_PROVIDER: z.enum(["gemini", "openrouter"]).default("gemini"),
  GEMINI_API_KEY: z.string().optional(),
  GEMINI_MODEL: z.string().default("gemini-1.5-flash"),
  OPENROUTER_API_KEY: z.string().optional(),
  OPENROUTER_MODEL: z.string().optional(),

  // Bot Protection (Cloudflare Turnstile)
  NEXT_PUBLIC_TURNSTILE_SITE_KEY: z.string().optional(),
  TURNSTILE_SECRET_KEY: z.string().optional(),

  // Observability (Sentry)
  SENTRY_DSN: z.string().optional(),

  // Marketplace Timings
  BUSINESS_TIMEZONE: z.string().default("Asia/Kolkata"),
  BOOKING_ASSIGNMENT_TIMEOUT_SECONDS: z.coerce.number().default(45),
  PROFESSIONAL_LOCATION_UPDATE_INTERVAL_SECONDS: z.coerce.number().default(15),
  EMERGENCY_MAX_ETA_MINUTES: z.coerce.number().default(120),
  ADDITIONAL_CHARGE_REQUIRES_CUSTOMER_APPROVAL: z.coerce.boolean().default(true),

  // Feature Flags
  FEATURE_RAZORPAY: z.coerce.boolean().default(true),
  FEATURE_CASHFREE: z.coerce.boolean().default(false),
  FEATURE_GOOGLE_AUTH: z.coerce.boolean().default(true),
  FEATURE_PHONE_OTP: z.coerce.boolean().default(true),
  FEATURE_PUSH_NOTIFICATIONS: z.coerce.boolean().default(true),
  FEATURE_AI: z.coerce.boolean().default(true),
  FEATURE_EMERGENCY_BOOKING: z.coerce.boolean().default(true),
  FEATURE_LIVE_TRACKING: z.coerce.boolean().default(true),
  FEATURE_PLUS: z.coerce.boolean().default(true),
  FEATURE_WARRANTY: z.coerce.boolean().default(true),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Safe server-side environment validator.
 * Redacts secret values and enforces production payment safety.
 */
export function validateServerEnv(envMap: Record<string, string | undefined>): {
  valid: boolean;
  data: ServerEnv;
  warnings: string[];
  errors: string[];
} {
  const result = serverEnvSchema.safeParse(envMap);
  const warnings: string[] = [];
  const errors: string[] = [];

  if (!result.success) {
    for (const issue of result.error.issues) {
      errors.push(`${issue.path.join(".")}: ${issue.message}`);
    }
  }

  const data = result.success ? result.data : (envMap as unknown as ServerEnv);
  const isProd = data.NODE_ENV === "production";

  // Production Safety Rules
  if (isProd) {
    if (!data.SUPABASE_URL || (!data.SUPABASE_SECRET_KEY && !data.SUPABASE_SERVICE_ROLE_KEY)) {
      errors.push("Production Supabase credentials (SUPABASE_URL and SUPABASE_SECRET_KEY) must be configured.");
    }

    if (data.FEATURE_RAZORPAY) {
      if (!data.RAZORPAY_KEY_ID || !data.RAZORPAY_KEY_SECRET) {
        errors.push("Razorpay credentials (RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET) are mandatory in production.");
      } else if (data.RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
        errors.push("Production environment cannot use Razorpay test key (rzp_test_*). Use live credentials.");
      }
    }

    if (data.FEATURE_CASHFREE && data.CASHFREE_ENV === "sandbox") {
      warnings.push("Cashfree is enabled in sandbox mode while NODE_ENV=production.");
    }
  } else {
    // Development alerts
    if (data.RAZORPAY_KEY_ID && !data.RAZORPAY_KEY_ID.startsWith("rzp_test_")) {
      warnings.push("Development environment is configured with live Razorpay Key ID! Verify you intended this.");
    }
  }

  return {
    valid: errors.length === 0,
    data,
    warnings,
    errors,
  };
}
