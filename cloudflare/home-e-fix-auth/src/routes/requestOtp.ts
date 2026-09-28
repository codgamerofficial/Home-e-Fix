import type { Env, RequestOtpBody, ErrorResponse, RequestOtpResponse } from "../types/auth";
import { normalizeIndianPhone, maskIndianPhone } from "../phone/normalizeIndianPhone";
import { verifyTurnstileToken } from "../security/turnstile";
import { checkPhoneRateLimit, checkIpRateLimit } from "../security/rateLimit";

function jsonResp(data: unknown, status = 200, origin = "*"): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, x-turnstile-token",
      "Cache-Control": "no-store, max-age=0",
    },
  });
}

export async function handleRequestOtp(
  request: Request,
  env: Env,
  origin: string,
  clientIp: string
): Promise<Response> {
  const startTime = Date.now();
  const requestId = `req-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  // 1. Parse JSON body
  let body: Partial<RequestOtpBody> = {};
  try {
    body = await request.json();
  } catch {
    return jsonResp(
      { error: "Invalid request payload.", code: "INVALID_REQUEST" } satisfies ErrorResponse,
      400,
      origin
    );
  }

  const { phone, role, action, turnstileToken } = body;

  // 2. Validate role
  if (role !== "customer" && role !== "professional") {
    return jsonResp(
      { error: "Invalid registration role specified.", code: "INVALID_ROLE" } satisfies ErrorResponse,
      400,
      origin
    );
  }

  // 3. Validate action matches role
  const expectedAction = role === "customer" ? "customer_otp" : "professional_otp";
  if (action !== expectedAction) {
    return jsonResp(
      { error: "Security action mismatch for role.", code: "ACTION_MISMATCH" } satisfies ErrorResponse,
      400,
      origin
    );
  }

  // 4. Validate and Normalize Indian Phone
  let normalizedPhone: string;
  try {
    normalizedPhone = normalizeIndianPhone(phone || "");
  } catch (err: any) {
    return jsonResp(
      { error: "Enter a valid Indian mobile number.", code: "INVALID_PHONE" } satisfies ErrorResponse,
      400,
      origin
    );
  }

  const phoneMasked = maskIndianPhone(normalizedPhone);

  // 5. Verify Turnstile Token (Server-Side)
  const candidateToken = turnstileToken || request.headers.get("x-turnstile-token") || "";
  const turnstileSecret = env.TURNSTILE_SECRET || env.TURNSTILE_SECRET_KEY || "";

  const turnstileResult = await verifyTurnstileToken(
    candidateToken,
    expectedAction,
    turnstileSecret,
    clientIp,
    env.TURNSTILE_HOSTNAMES
  );

  if (!turnstileResult.success) {
    console.warn(`[Turnstile Rejected] ${phoneMasked} action: ${expectedAction}`);
    return jsonResp(
      {
        error: "Security verification failed. Please try again.",
        code: "TURNSTILE_FAILED",
      } satisfies ErrorResponse,
      403,
      origin
    );
  }

  // 6. Rate Limiting Checks
  // IP limit
  const ipCheck = checkIpRateLimit(clientIp, 10, 300);
  if (!ipCheck.allowed) {
    console.warn(`[Rate Limit Exceeded: IP] IP: ${clientIp}`);
    return jsonResp(
      {
        error: "Too many OTP requests from this connection. Please wait and try again.",
        code: "RATE_LIMITED",
      } satisfies ErrorResponse,
      429,
      origin
    );
  }

  // Phone cooldown & hourly limit
  const cooldownSec = parseInt(env.OTP_RESEND_COOLDOWN_SECONDS || "60", 10);
  const maxHourly = parseInt(env.OTP_MAX_REQUESTS_PER_HOUR || "5", 10);

  const phoneCheck = checkPhoneRateLimit(normalizedPhone, cooldownSec, maxHourly);
  if (!phoneCheck.allowed) {
    console.warn(`[Rate Limit Exceeded: Phone] ${phoneMasked}: ${phoneCheck.reason}`);
    return jsonResp(
      {
        error: phoneCheck.reason || "Too many OTP requests. Please wait and try again.",
        code: "RATE_LIMITED",
      } satisfies ErrorResponse,
      429,
      origin
    );
  }

  // 7. Request Supabase Auth OTP
  // Supabase Auth generates OTP and fires the configured Send SMS Hook (which calls 2Factor)
  const supabaseUrl = env.SUPABASE_URL || "https://uzlarcvmhshwgtvtxcsh.supabase.co";
  const supabaseKey =
    env.SUPABASE_SERVICE_ROLE_KEY ||
    env.SUPABASE_SECRET_KEY ||
    env.SUPABASE_ANON_KEY;

  if (!supabaseKey) {
    console.error("[Auth Gateway Fatal] Missing Supabase API Key credentials.");
    return jsonResp(
      {
        error: "We couldn't send the OTP right now. Please try again shortly.",
        code: "SERVER_ERROR",
      } satisfies ErrorResponse,
      500,
      origin
    );
  }

  try {
    const suRes = await fetch(`${supabaseUrl}/auth/v1/otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
      },
      body: JSON.stringify({
        phone: normalizedPhone,
        channel: "sms",
        data: {
          role,
        },
      }),
    });

    const suData: any = await suRes.json().catch(() => ({}));

    if (!suRes.ok) {
      const suMsg = suData?.msg || suData?.message || suData?.error_description || "";
      console.error(
        `[Supabase Auth OTP Failed] Status: ${suRes.status} | Phone: ${phoneMasked} | Msg: ${suMsg}`
      );

      if (suRes.status === 429) {
        return jsonResp(
          {
            error: "Too many OTP requests. Please wait before trying again.",
            code: "RATE_LIMITED",
          } satisfies ErrorResponse,
          429,
          origin
        );
      }

      if (suRes.status === 400 && suMsg.toLowerCase().includes("phone")) {
        return jsonResp(
          {
            error: "Enter a valid Indian mobile number.",
            code: "INVALID_PHONE",
          } satisfies ErrorResponse,
          400,
          origin
        );
      }

      return jsonResp(
        {
          error: "We couldn't send the OTP right now. Please try again shortly.",
          code: "SMS_PROVIDER_FAILED",
        } satisfies ErrorResponse,
        502,
        origin
      );
    }

    const latency = Date.now() - startTime;
    console.info(
      JSON.stringify({
        requestId,
        timestamp: new Date().toISOString(),
        route: "/api/auth/request-otp",
        role,
        phoneMasked,
        turnstileStatus: "verified",
        turnstileAction: expectedAction,
        latencyMs: latency,
        status: "success",
      })
    );

    return jsonResp(
      {
        success: true,
        message: `OTP sent to ${phoneMasked}`,
        resendCooldownSeconds: cooldownSec,
        phoneMasked,
      } satisfies RequestOtpResponse,
      200,
      origin
    );
  } catch (err: any) {
    console.error(`[Supabase Auth Network Exception] Phone: ${phoneMasked}`, err?.message);
    return jsonResp(
      {
        error: "We couldn't send the OTP right now. Please try again shortly.",
        code: "SERVER_ERROR",
      } satisfies ErrorResponse,
      500,
      origin
    );
  }
}
