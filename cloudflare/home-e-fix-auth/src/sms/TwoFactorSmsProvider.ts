import type { SmsProvider, SendOtpParams, SmsSendResult } from "./SmsProvider";

export interface TwoFactorConfig {
  apiKey: string;
  templateId?: string;
  senderId?: string;
}

export class TwoFactorSmsProvider implements SmsProvider {
  readonly name = "2factor";

  constructor(private readonly config: TwoFactorConfig) {}

  async sendOtp(params: SendOtpParams): Promise<SmsSendResult> {
    const { apiKey, templateId, senderId } = this.config;

    const rawDigits = params.phone.replace(/\D/g, "");
    const clean10Digits =
      rawDigits.length === 12 && rawDigits.startsWith("91")
        ? rawDigits.slice(2)
        : rawDigits.length === 11 && rawDigits.startsWith("0")
        ? rawDigits.slice(1)
        : rawDigits;

    const masked = `+91******${clean10Digits.slice(-4)}`;

    if (!apiKey) {
      console.error(`[2Factor Error] Missing API Key. Cannot deliver to ${masked}`);
      return {
        success: false,
        errorCode: "SMS_PROVIDER_CONFIG_MISSING",
        error: "SMS provider credentials are not configured on the server.",
      };
    }

    // ── ATTEMPT 1: POST https://2factor.in/API/V1/OTP/SEND ──
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

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

      clearTimeout(timer);

      const postData: any = await postRes.json().catch(() => ({}));

      if (postRes.ok && postData?.Status === "Success") {
        return {
          success: true,
          providerMessageId: postData.Details,
        };
      }
    } catch {
      // Fall through to GET
    }

    // ── ATTEMPT 2: GET fallback ──
    try {
      let endpoint = `https://2factor.in/API/V1/${encodeURIComponent(apiKey)}/SMS/${encodeURIComponent(clean10Digits)}/${encodeURIComponent(params.otp)}`;
      if (templateId) {
        endpoint += `/${encodeURIComponent(templateId)}`;
      }
      if (senderId) {
        endpoint += `?sender=${encodeURIComponent(senderId)}`;
      }

      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 6000);

      const res = await fetch(endpoint, {
        method: "GET",
        signal: controller.signal,
      });

      clearTimeout(timer);

      const data: any = await res.json().catch(() => ({}));

      if (!res.ok || data?.Status !== "Success") {
        const detail = data?.Details || `HTTP status ${res.status}`;
        console.error(`[2Factor Rejected] ${masked}: ${detail}`);
        return {
          success: false,
          errorCode: "SMS_PROVIDER_FAILED",
          error: `SMS provider delivery failed: ${detail}`,
        };
      }

      return {
        success: true,
        providerMessageId: data.Details,
      };
    } catch (err: any) {
      const isTimeout = err?.name === "AbortError";
      return {
        success: false,
        errorCode: isTimeout ? "SMS_PROVIDER_TIMEOUT" : "SMS_PROVIDER_NETWORK_ERROR",
        error: "Failed to connect to 2Factor SMS gateway.",
      };
    }
  }
}
