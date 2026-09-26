import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { verifyWebhookSignature } from "./webhookVerifier.ts";
import { otpService } from "./otp/otpService.ts";

/**
 * Supabase Send SMS Auth Hook Edge Function
 *
 * Official Supabase Reference:
 * https://supabase.com/docs/guides/auth/auth-hooks/send-sms-hook
 *
 * Incoming Request Payload:
 * {
 *   "user": {
 *     "id": "uuid",
 *     "phone": "+91XXXXXXXXXX",
 *     ...
 *   },
 *   "sms": {
 *     "otp": "123456"
 *   }
 * }
 *
 * Expected Response:
 * HTTP 200 OK with empty object: {}
 */

const jsonResponse = (data: unknown, status = 200) =>
  new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });

Deno.serve(async (req: Request) => {
  // 1. Enforce POST method only
  if (req.method !== "POST") {
    return jsonResponse({ error: { message: "Method not allowed" } }, 405);
  }

  try {
    const rawBody = await req.text();
    const hookSecret = Deno.env.get("SEND_SMS_HOOK_SECRET");
    const mode = otpService.getMode();

    // 2. Webhook Signature Verification
    if (hookSecret) {
      const verification = await verifyWebhookSignature(req.headers, rawBody, hookSecret);
      if (!verification.isValid) {
        console.warn("[SEND SMS HOOK] Webhook verification failed:", verification.error);
        return jsonResponse(
          { error: { message: verification.error || "Webhook signature verification failed" } },
          401
        );
      }
    } else if (mode === "production") {
      // In production, missing hook secret is a critical fatal misconfiguration
      console.error("[SEND SMS HOOK FATAL] SEND_SMS_HOOK_SECRET is missing in production environment.");
      return jsonResponse(
        { error: { message: "Server misconfiguration: Webhook secret not found" } },
        500
      );
    } else {
      console.warn(
        "[SEND SMS HOOK DEV NOTICE] SEND_SMS_HOOK_SECRET is not set. Allowing request in local development mode."
      );
    }

    // 3. Parse JSON Payload
    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return jsonResponse({ error: { message: "Invalid JSON payload" } }, 400);
    }

    const phone = payload?.user?.phone;
    const otp = payload?.sms?.otp;

    if (!phone || !otp) {
      return jsonResponse(
        { error: { message: "Payload missing required user.phone or sms.otp fields" } },
        400
      );
    }

    // 4. Dispatch via OtpService (Development console log or Production Gateway)
    const result = await otpService.sendOtp({ phone, otp });

    if (!result.success) {
      return jsonResponse(
        { error: { message: result.error || "Failed to dispatch SMS" } },
        500
      );
    }

    // 5. Successful Hook Response (Empty JSON object per Supabase specification)
    // NEVER returns the OTP to the caller or browser
    return jsonResponse({});
  } catch (err: any) {
    console.error("[SEND SMS HOOK EXCEPTION]", { message: err?.message });
    return jsonResponse(
      { error: { message: err?.message || "Internal server error in Send SMS Hook" } },
      500
    );
  }
});
