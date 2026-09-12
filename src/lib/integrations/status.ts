import { isServiceConfigured, ENV } from "@/config/env";

export interface ServiceStatus {
  name: string;
  key: "supabase" | "razorpay" | "maps" | "google_oauth" | "otp";
  isConfigured: boolean;
  requiredEnvVars: string[];
  description: string;
  unconfiguredMessage: string;
  setupInstructionsUrl?: string;
}

export const INTEGRATION_SERVICES: Record<string, ServiceStatus> = {
  supabase: {
    name: "PostgreSQL Database & Auth (Supabase)",
    key: "supabase",
    isConfigured: isServiceConfigured("supabase"),
    requiredEnvVars: ["VITE_SUPABASE_URL", "VITE_SUPABASE_ANON_KEY"],
    description: "Authoritative relational PostgreSQL database, authentication, storage & realtime.",
    unconfiguredMessage: "Supabase database connection is not configured. Real database queries cannot execute.",
    setupInstructionsUrl: "https://supabase.com/dashboard",
  },
  razorpay: {
    name: "Payment Gateway (Razorpay)",
    key: "razorpay",
    isConfigured: isServiceConfigured("razorpay"),
    requiredEnvVars: ["VITE_RAZORPAY_KEY_ID", "RAZORPAY_KEY_SECRET"],
    description: "Server-side order creation, checkout payment modal, and signature reconciliation.",
    unconfiguredMessage: "Razorpay is not configured. Real payment cannot be completed until valid credentials are added.",
    setupInstructionsUrl: "https://dashboard.razorpay.com",
  },
  maps: {
    name: "Geolocation & Maps (Google Maps / MapmyIndia)",
    key: "maps",
    isConfigured: isServiceConfigured("maps"),
    requiredEnvVars: ["VITE_MAP_API_KEY"],
    description: "Reverse geocoding, address autocomplete, and professional navigation tracking.",
    unconfiguredMessage: "Map service is not configured. Manual address entry is required.",
  },
  google_oauth: {
    name: "Google OAuth Social Login",
    key: "google_oauth",
    isConfigured: isServiceConfigured("google_oauth"),
    requiredEnvVars: ["VITE_GOOGLE_CLIENT_ID"],
    description: "OAuth 2.0 social sign-in for customers and professionals.",
    unconfiguredMessage: "Google OAuth is not configured. Please use email or phone authentication.",
  },
  otp: {
    name: "SMS OTP Provider",
    key: "otp",
    isConfigured: isServiceConfigured("otp"),
    requiredEnvVars: ["VITE_SUPABASE_URL", "TWILIO_OR_MSG91_CONFIG"],
    description: "Transactional SMS OTP dispatch for two-factor verification.",
    unconfiguredMessage: "OTP provider is not configured. Production SMS verification is unavailable.",
  },
};

/**
 * Returns a list of all unconfigured critical services.
 */
export function getUnconfiguredServices(): ServiceStatus[] {
  return Object.values(INTEGRATION_SERVICES).filter((service) => !service.isConfigured);
}

/**
 * Throws a typed ConfigurationError if a service is invoked when unconfigured.
 */
export function assertServiceConfigured(key: "supabase" | "razorpay" | "maps" | "otp") {
  const service = INTEGRATION_SERVICES[key];
  if (!service || !service.isConfigured) {
    const errorMsg = service ? service.unconfiguredMessage : `Service ${key} is not configured.`;
    throw new Error(`[Configuration Required]: ${errorMsg}`);
  }
}
