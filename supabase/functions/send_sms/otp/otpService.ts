import type { OtpDeliveryProvider, SendOtpParams, OtpDeliveryResult } from "./otpProvider.ts";
import { DevelopmentOtpProvider } from "./developmentOtpProvider.ts";
import { TwoFactorSmsProvider } from "./twoFactorSmsProvider.ts";

/**
 * Authoritative OTP Service for Supabase Send SMS Auth Hook
 * Selects provider (2Factor for Indian SMS, Development for local offline test)
 * and strictly blocks development bypass in production environments.
 */
export class OtpService {
  private provider: OtpDeliveryProvider;
  private readonly mode: "development" | "production";

  constructor() {
    const rawMode = (Deno.env.get("OTP_PROVIDER_MODE") || "").toLowerCase();
    const smsProvider = (Deno.env.get("SMS_PROVIDER") || "").toLowerCase();
    const envName = (
      Deno.env.get("ENVIRONMENT") ||
      Deno.env.get("DENO_ENV") ||
      Deno.env.get("APP_ENV") ||
      ""
    ).toLowerCase();
    const isProductionEnv = envName === "production" || envName === "prod";

    // ── HARD PRODUCTION SAFETY CHECK (Phase 12) ──
    // If the deployment environment is marked production, NEVER allow development OTP mode.
    if (isProductionEnv && (smsProvider === "development" || rawMode === "development")) {
      const errorMsg =
        "FATAL SECURITY CONFIGURATION: Development OTP mode (SMS_PROVIDER=development) " +
        "is strictly prohibited in production environment.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    // Default to 2factor in production, or when explicitly requested
    if (isProductionEnv || smsProvider === "2factor" || rawMode === "production") {
      this.mode = "production";
      this.provider = new TwoFactorSmsProvider();
    } else {
      this.mode = "development";
      this.provider = new DevelopmentOtpProvider();
    }
  }

  getMode(): "development" | "production" {
    return this.mode;
  }

  getProviderName(): string {
    return this.provider.name;
  }

  async sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult> {
    return this.provider.sendOtp(params);
  }
}

export const otpService = new OtpService();
