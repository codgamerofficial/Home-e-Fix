import type { SmsProvider, SendOtpParams, SmsSendResult } from "./SmsProvider";

export class DevelopmentSmsProvider implements SmsProvider {
  readonly name = "development";

  constructor(private readonly appEnv?: string) {
    if (appEnv === "production") {
      throw new Error(
        "FATAL: DevelopmentSmsProvider cannot be initialized in production environment."
      );
    }
  }

  async sendOtp(params: SendOtpParams): Promise<SmsSendResult> {
    const masked = params.phone.replace(/(\+\d{2})(\d{2})\d+(\d{2})/, "$1 $2••••$3");
    console.log(
      `[DEV SMS] Mobile: ${masked} | Code: ${params.otp} | Purpose: ${params.purpose || "auth"}`
    );

    return {
      success: true,
      providerMessageId: `dev-${Date.now()}`,
    };
  }
}
