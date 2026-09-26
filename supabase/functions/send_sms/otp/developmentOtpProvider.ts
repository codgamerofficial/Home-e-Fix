import type { OtpDeliveryProvider, SendOtpParams, OtpDeliveryResult } from "./otpProvider.ts";

/**
 * Development OTP Delivery Provider
 *
 * SAFETY INVARIANTS:
 * 1. Writes OTP ONLY to server-side Edge Function development console logs.
 * 2. NEVER returns the OTP in an HTTP response.
 * 3. NEVER exposes the OTP to browser JavaScript or client storage.
 * 4. Enables zero-cost development and testing for Home-e-Fix phone authentication.
 */
export class DevelopmentOtpProvider implements OtpDeliveryProvider {
  readonly name = "development";

  async sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult> {
    const timestamp = new Date().toISOString();
    const masked = params.phone.replace(/(\+\d{2})(\d{2})\d+(\d{2})/, "$1 $2••••$3");

    // Server-side ONLY development log for developer inspection
    console.log(
      `\n=======================================================\n` +
      `[HOME-E-FIX DEVELOPMENT OTP HOOK]\n` +
      `Time:      ${timestamp}\n` +
      `Mobile:    ${params.phone} (${masked})\n` +
      `OTP Code:  ${params.otp}\n` +
      `Notice:    SERVER-SIDE LOG ONLY. Never expose in production.\n` +
      `=======================================================\n`
    );

    return {
      success: true,
      messageId: `dev-msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    };
  }
}
