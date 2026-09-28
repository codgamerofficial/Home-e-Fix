/**
 * Vercel Edge Function: /api/auth/request-otp
 *
 * Notice: Phone OTP authentication is temporarily disabled in favor of Google OAuth.
 * Returns 410 Gone with explicit direction to use Google OAuth.
 */

export const config = {
  runtime: "edge",
};

export default async function handler(req: Request): Promise<Response> {
  const origin = req.headers.get("origin") || "*";

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": origin,
        "Access-Control-Allow-Methods": "POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-turnstile-token",
        "Access-Control-Max-Age": "86400",
      },
    });
  }

  return new Response(
    JSON.stringify({
      success: false,
      code: "PHONE_OTP_DISABLED",
      error: "Phone OTP authentication is temporarily disabled. Please use Google Sign-In.",
    }),
    {
      status: 410,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": origin,
      },
    }
  );
}
