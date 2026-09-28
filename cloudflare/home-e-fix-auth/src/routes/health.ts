import type { Env } from "../types/auth";

export function handleHealthCheck(env: Env, origin: string): Response {
  const isTurnstileConfigured = Boolean(env.TURNSTILE_SECRET || env.TURNSTILE_SECRET_KEY);
  const isSupabaseConfigured = Boolean(env.SUPABASE_URL);
  const isTwoFactorConfigured = Boolean(env.TWOFACTOR_API_KEY);

  const data = {
    ok: true,
    service: "home-e-fix-auth",
    environment: env.ENVIRONMENT || env.APP_ENV || "production",
    dependencies: {
      turnstile: isTurnstileConfigured ? "configured" : "unconfigured",
      supabase: isSupabaseConfigured ? "configured" : "unconfigured",
      smsProvider: isTwoFactorConfigured ? "configured" : "development_fallback",
    },
    timestamp: new Date().toISOString(),
  };

  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Cache-Control": "no-store, max-age=0",
    },
  });
}
