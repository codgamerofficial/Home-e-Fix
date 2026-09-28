import { createClient } from "@supabase/supabase-js";
import { ENV, isServiceConfigured } from "@/config/env";
import { logger } from "@/lib/observability/logger";

const supabaseUrl = ENV.VITE_SUPABASE_URL || "https://unconfigured.supabase.co";
const supabaseAnonKey = ENV.VITE_SUPABASE_ANON_KEY || "unconfigured-anon-key";

if (!isServiceConfigured("supabase")) {
  logger.warn(
    "[Supabase Boundary]: Real Supabase credentials are not detected. Configure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to connect to production PostgreSQL."
  );
}

/**
 * Authoritative Supabase client instance.
 */
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

type AuthChangeCallback = Parameters<typeof supabase.auth.onAuthStateChange>[0];
export type AuthChangeEvent = Parameters<AuthChangeCallback>[0];
export type Session = NonNullable<Parameters<AuthChangeCallback>[1]>;
export type SupabaseUser = Session["user"];

