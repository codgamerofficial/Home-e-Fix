import type { IOtpProvider, OtpPurpose, OtpProviderMode } from "./otp.types";
import { hashOtp } from "./developmentOtpProvider";

/**
 * Production OTP Provider Abstraction.
 * Routes through secure Supabase Edge Function or Cloudflare Worker SMS relay.
 * NEVER leaks SMS Gateway credentials, DLT templates, or Auth tokens to the frontend client.
 */
export class ProductionOtpProvider implements IOtpProvider {
  private readonly gatewayEndpoint: string;
  private readonly isConfigured: boolean;

  constructor() {
    // Read from environment if configured
    this.gatewayEndpoint =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_SMS_GATEWAY_URL) ||
      "/api/auth/sms-otp";

    this.isConfigured = Boolean(
      typeof import.meta !== "undefined" && import.meta.env?.VITE_SMS_GATEWAY_URL
    );
  }

  async sendOtp(phone: string, purpose: OtpPurpose) {
    if (!this.isConfigured) {
      throw new Error(
        "Production SMS gateway is not yet configured. Please set up a certified Indian SMS provider via Supabase Edge Functions or use OTP_PROVIDER_MODE=development."
      );
    }

    const response = await fetch(this.gatewayEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        phone,
        purpose,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      throw new Error(err.message || "Failed to dispatch SMS through production gateway.");
    }

    const data = await response.json();

    return {
      success: true,
      otpHash: data.otpHash,
      expiresAt: new Date(data.expiresAt),
      resendAvailableAt: new Date(data.resendAvailableAt),
      devOtp: undefined, // NEVER exposed in production
    };
  }

  async verifyOtp(submittedOtp: string, expectedHash: string): Promise<boolean> {
    const candidateHash = await hashOtp(submittedOtp);
    return candidateHash === expectedHash;
  }

  getProviderStatus(): { mode: OtpProviderMode; isReady: boolean } {
    return {
      mode: "production",
      isReady: this.isConfigured,
    };
  }
}
