import type { OtpDeliveryProvider, SendOtpParams, OtpDeliveryResult } from "./otpProvider.ts";

/**
 * Production OTP Delivery Provider Adapter
 *
 * PRODUCTION SAFETY INVARIANTS:
 * 1. NEVER logs OTP codes or full phone numbers in production logs.
 * 2. Requires server-side environment secrets (e.g. SMS_PROVIDER_API_KEY).
 * 3. Never claims SMS delivery succeeds unless an authorized SMS gateway successfully accepts the request.
 * 4. Easily replaceable with any DLT-registered Indian SMS gateway.
 */
export class ProductionOtpProvider implements OtpDeliveryProvider {
  readonly name = "production";

  async sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult> {
    const apiKey = Deno.env.get("SMS_PROVIDER_API_KEY");
    const senderId = Deno.env.get("SMS_PROVIDER_SENDER_ID");
    const templateId = Deno.env.get("SMS_PROVIDER_TEMPLATE_ID");
    const gatewayUrl = Deno.env.get("SMS_PROVIDER_GATEWAY_URL");

    if (!apiKey) {
      const maskedPhone = params.phone.replace(/(\+\d{2})\d+(\d{2})/, "$1 •••• $2");
      console.error(
        `[PRODUCTION SMS ERROR] SMS_PROVIDER_API_KEY is not configured in Supabase secrets. ` +
        `Cannot deliver OTP to ${maskedPhone}.`
      );
      return {
        success: false,
        error: "SMS provider credentials are not configured on the server. Please contact platform operations.",
      };
    }

    try {
      // Production SMS Gateway HTTP Dispatch (DLT Compliant)
      // Example payload structure for Indian SMS gateways
      const endpoint = gatewayUrl || "https://api.sms-provider.internal/v1/send";
      const payload = {
        sender: senderId || "HOMEFX",
        template_id: templateId,
        recipient: params.phone,
        otp: params.otp,
        message: `Your Home-e-Fix verification OTP is ${params.otp}. Valid for 5 minutes. Please do not share this code with anyone. - Home-e-Fix`,
      };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `[PRODUCTION SMS GATEWAY FAILURE] Status: ${response.status} | Details: ${errorText.slice(0, 100)}`
        );
        return {
          success: false,
          error: `SMS provider gateway rejected delivery with HTTP ${response.status}`,
        };
      }

      const data = await response.json().catch(() => ({}));
      return {
        success: true,
        messageId: data.messageId || data.id || `sms-tx-${Date.now()}`,
      };
    } catch (err: any) {
      console.error("[PRODUCTION SMS EXCEPTION]", { message: err?.message });
      return {
        success: false,
        error: "Failed to connect to production SMS gateway.",
      };
    }
  }
}
