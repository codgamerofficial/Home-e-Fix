/**
 * Central application configuration & environment boundaries.
 */

export const APP_ENV = {
  APP_NAME: "Home-e-Fix",
  TAGLINE: "FIXING HOMES. EARNING TRUST.",
  IS_DEV: import.meta.env.DEV,
  IS_PROD: import.meta.env.PROD,
  SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL || "",
  SUPABASE_ANON_KEY: import.meta.env.VITE_SUPABASE_ANON_KEY || "",
  RAZORPAY_KEY_ID: import.meta.env.VITE_RAZORPAY_KEY_ID || "",
  GOOGLE_MAPS_API_KEY: import.meta.env.VITE_MAP_API_KEY || "",
  API_BASE_URL: import.meta.env.VITE_API_BASE_URL || "/api",
} as const;

export const CONTACT_INFO = {
  phone: "+91 98765 43210",
  whatsapp: "+91 98765 43210",
  email: "support@homeefix.in",
  emergencyHelpdesk: "+91 98765 00911",
  operationalCities: ["Kolkata", "Howrah", "Bidhannagar", "New Town"],
  headquarters: "Home-e-Fix Technologies India Pvt Ltd, Sector V, Salt Lake, Kolkata 700091",
} as const;

export * from "./env";
