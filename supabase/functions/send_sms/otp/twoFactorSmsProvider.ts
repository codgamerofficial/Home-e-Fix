import type { OtpDeliveryProvider, SendOtpParams, OtpDeliveryResult } from "./otpProvider.ts";

/**
 * 2Factor.in SMS Delivery Provider Adapter
 *
 * Supports both:
 * 1. Current Official 2Factor v4 JSON POST OTP API:
 *    POST https://2factor.in/API/V1/OTP/SEND
 *    Headers: { "X-API-Key": "<API_KEY>", "Content-Type": "application/json" }
 *    Body: { "to": "+919XXXXXXXXX", "template": "<TEMPLATE>", "var1": "<OTP>" }
 *
 * 2. Classic 2Factor REST GET Fallback:
 *    GET https://2factor.in/API/V1/:api_key/SMS/:phone/:otp/:template
 *
 * Security & Reliability Invariants:
 * - ZERO logging of raw OTPs or API Keys.
 * - Phone numbers redacted in logs (+91******3210).
 * - Fails safely; never fakes success.
 */
export class TwoFactorSmsProvider implements OtpDeliveryProvider {
  readonly name = "2factor";

  async sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult> {
    const apiKey = Deno.env.get("TWOFACTOR_API_KEY");
    const templateId = Deno.env.get("TWOFACTOR_TEMPLATE_ID");
    const senderId = Deno.env.get("TWOFACTOR_SENDER_ID");

    const rawDigits = params.phone.replace(/\D/g, "");
    const clean10Digits =
      rawDigits.length === 12 && rawDigits.startsWith("91")
        ? rawDigits.slice(2)
        : rawDigits.length === 11 && rawDigits.startsWith("0")
        ? rawDigits.slice(1)
        : rawDigits;

    const maskedPhone = `+91******${clean10Digits.slice(-4)}`;

    if (!apiKey) {
      console.error(
        `[2FACTOR SMS ERROR] TWOFACTOR_API_KEY is not configured in Supabase secrets. ` +
        `Cannot deliver OTP to ${maskedPhone}.`
      );
      return {
        success: false,
        errorCode: "SMS_PROVIDER_CONFIG_MISSING",
        error: "SMS provider credentials are not configured on the server. Please contact platform operations.",
      };
    }

    // ── ATTEMPT 1: POST https://2factor.in/API/V1/OTP/SEND ──
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const postBody: Record<string, string> = {
        to: `+91${clean10Digits}`,
        var1: params.otp,
      };
      if (templateId) {
        postBody.template = templateId;
        postBody.template_name = templateId;
      }
      if (senderId) {
        postBody.sender = senderId;
      }

      const postRes = await fetch("https://2factor.in/API/V1/OTP/SEND", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-API-Key": apiKey,
          "x-api-key": apiKey,
        },
        body: JSON.stringify(postBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const postData: any = await postRes.json().catch(() => ({}));

      if (postRes.ok && postData?.Status === "Success") {
        console.info(
          `[2FACTOR SMS DELIVERED] Dispatched OTP via JSON POST to ${maskedPhone}. SessionId: ${postData?.Details}`
        );
        return {
          success: true,
          providerMessageId: postData.Details,
          messageId: postData.Details,
        };
      }
    } catch (err: any) {
      console.warn(`[2FACTOR JSON POST FAIL] Attempting GET fallback for ${maskedPhone}: ${err?.message}`);
    }

    // ── ATTEMPT 2: GET https://2factor.in/API/V1/:api_key/SMS/... ──
    try {
      let endpoint = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${encodeURIComponent(clean10Digits)}/${encodeURIComponent(params.otp)}`;
      if (templateId) {
        endpoint += `/${encodeURIComponent(templateId)}`;
      }
      if (senderId) {
        endpoint += `?sender=${encodeURIComponent(senderId)}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      const response = await fetch(endpoint, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      const data = await response.json().catch(() => ({}));

      if (!response.ok || data?.Status !== "Success") {
        const errorDetail = data?.Details || `HTTP status ${response.status}`;
        console.error(
          `[2FACTOR SMS REJECTED] Delivery failed for ${maskedPhone}. Reason: ${errorDetail}`
        );
        return {
          success: false,
          errorCode: "SMS_PROVIDER_FAILED",
          error: `SMS provider delivery failed: ${errorDetail}`,
        };
      }

      console.info(
        `[2FACTOR SMS DELIVERED] Dispatched OTP via GET fallback to ${maskedPhone}. SessionId: ${data?.Details}`
      );

      return {
        success: true,
        providerMessageId: data.Details,
        messageId: data.Details,
      };
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      const message = isTimeout ? "SMS provider timed out" : err?.message || "Network error";
      console.error(`[2FACTOR SMS EXCEPTION] Delivery exception for ${maskedPhone}: ${message}`);
      return {
        success: false,
        errorCode: isTimeout ? "SMS_PROVIDER_TIMEOUT" : "SMS_PROVIDER_NETWORK_ERROR",
        error: "Failed to connect to 2Factor SMS gateway.",
      };
    }
  }
}
