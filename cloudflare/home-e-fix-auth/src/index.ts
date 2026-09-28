import type { Env } from "./types/auth";
import { handleRequestOtp } from "./routes/requestOtp";
import { handleHealthCheck } from "./routes/health";

function resolveAllowedOrigin(requestOrigin: string | null, customAllowed?: string): string {
  if (!requestOrigin) return "*";

  const allowedOrigins = [
    "https://home-e-fix.vercel.app",
    "https://home-e-fix.com",
    "https://www.home-e-fix.com",
  ];

  if (
    requestOrigin.startsWith("http://localhost:") ||
    requestOrigin.startsWith("http://127.0.0.1:") ||
    requestOrigin.endsWith(".vercel.app") ||
    requestOrigin.endsWith(".pages.dev") ||
    requestOrigin.endsWith(".workers.dev")
  ) {
    return requestOrigin;
  }

  if (customAllowed) {
    const list = customAllowed.split(",").map((s) => s.trim());
    if (list.includes(requestOrigin)) return requestOrigin;
  }

  if (allowedOrigins.includes(requestOrigin)) {
    return requestOrigin;
  }

  return "https://home-e-fix.vercel.app";
}

function applySecurityHeaders(headers: Headers) {
  headers.set("X-Content-Type-Options", "nosniff");
  headers.set("X-Frame-Options", "DENY");
  headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  headers.set("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const pathname = url.pathname;
    const originHeader = request.headers.get("Origin");
    const safeOrigin = resolveAllowedOrigin(originHeader, env.ALLOWED_ORIGINS);
    const clientIp =
      request.headers.get("CF-Connecting-IP") ||
      request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    // Handle CORS Preflight
    if (request.method === "OPTIONS") {
      const corsHeaders = new Headers({
        "Access-Control-Allow-Origin": safeOrigin,
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization, x-turnstile-token",
        "Access-Control-Max-Age": "86400",
      });
      applySecurityHeaders(corsHeaders);
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    let response: Response;

    if (pathname === "/api/auth/request-otp" && request.method === "POST") {
      response = await handleRequestOtp(request, env, safeOrigin, clientIp);
    } else if (pathname === "/api/health" && request.method === "GET") {
      response = handleHealthCheck(env, safeOrigin);
    } else {
      response = new Response(JSON.stringify({ error: "Endpoint not found" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": safeOrigin,
        },
      });
    }

    const finalHeaders = new Headers(response.headers);
    applySecurityHeaders(finalHeaders);

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: finalHeaders,
    });
  },
};
