import type { OtpDeliveryProvider, SendOtpParams, OtpDeliveryResult } from "./otpProvider.ts";
import { DevelopmentOtpProvider } from "./developmentOtpProvider.ts";
import { ProductionOtpProvider } from "./productionOtpProvider.ts";

/**
 * Authoritative OTP Service for Supabase Send SMS Auth Hook
 * Manages provider selection and enforces hard safety constraints.
 */
export class OtpService {
  private provider: OtpDeliveryProvider;
  private readonly mode: "development" | "production";

  constructor() {
    const rawMode = (Deno.env.get("OTP_PROVIDER_MODE") || "development").toLowerCase();
    const envName = (Deno.env.get("ENVIRONMENT") || Deno.env.get("DENO_ENV") || "").toLowerCase();
    const isProductionEnv = envName === "production" || envName === "prod";

    // ── HARD PRODUCTION SAFETY CHECK ──
    // If the deployment environment is marked production, NEVER allow development OTP mode.
    if (isProductionEnv && rawMode === "development") {
      const errorMsg =
        "FATAL SECURITY CONFIGURATION: Development OTP mode (OTP_PROVIDER_MODE=development) " +
        "is strictly prohibited in production environment.";
      console.error(errorMsg);
      throw new Error(errorMsg);
    }

    if (rawMode === "production" || isProductionEnv) {
      this.mode = "production";
      this.provider = new ProductionOtpProvider();
    } else {
      this.mode = "development";
      this.provider = new DevelopmentOtpProvider();
    }
  }

  getMode(): "development" | "production" {
    return this.mode;
  }

  async sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult> {
    return this.provider.sendOtp(params);
  }
}

export const otpService = new OtpService();
