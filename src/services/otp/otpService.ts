import type {
  IOtpProvider,
  OtpPurpose,
  OtpRecord,
  SendOtpResponse,
  VerifyOtpResponse,
  OtpProviderMode,
} from "./otp.types";
import { DevelopmentOtpProvider, hashOtp } from "./developmentOtpProvider";
import { ProductionOtpProvider } from "./productionOtpProvider";
import { normalizeIndianPhone, validateIndianPhone, type PhoneNormalizationResult } from "@/lib/phone";

export class OtpService {
  private provider: IOtpProvider;
  private readonly mode: OtpProviderMode;

  // In-memory / storage-resilient OTP records cache (stores hashed OTP only)
  private records = new Map<string, OtpRecord>();

  // Rate-limiting tracker: phone -> timestamp[]
  private rateLimits = new Map<string, number[]>();

  constructor() {
    // Determine configured mode
    const envMode = (
      typeof import.meta !== "undefined" && import.meta.env?.VITE_OTP_PROVIDER_MODE
    )?.toLowerCase();

    // Enforce safety check: If production build, force production mode
    const isProd = typeof import.meta !== "undefined" && import.meta.env?.PROD;

    if (isProd || envMode === "production") {
      this.mode = "production";
      this.provider = new ProductionOtpProvider();
    } else {
      this.mode = "development";
      this.provider = new DevelopmentOtpProvider();
    }
  }

  /**
   * Normalizes an Indian mobile number into canonical E.164 format (+91XXXXXXXXXX).
   * Validates that the number has exactly 10 digits starting with 6, 7, 8, or 9.
   */
  normalizeIndianPhone(input: string): string {
    return normalizeIndianPhone(input);
  }

  /**
   * Validates and returns structured result { valid, e164, reason }
   */
  validateIndianPhone(input: string): PhoneNormalizationResult {
    return validateIndianPhone(input);
  }

  /**
   * Check rate-limiting: maximum 5 OTP requests per phone per rolling hour.
   */
  private checkRateLimit(normalizedPhone: string): void {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const history = this.rateLimits.get(normalizedPhone) || [];

    // Filter to last hour
    const recent = history.filter((timestamp) => timestamp > oneHourAgo);

    if (recent.length >= 5) {
      throw new Error("Too many OTP requests for this number. Please wait an hour before trying again.");
    }

    recent.push(now);
    this.rateLimits.set(normalizedPhone, recent);
  }

  /**
   * Dispatches an OTP to the given phone number for a specific purpose.
   */
  async sendOtp(phoneInput: string, purpose: OtpPurpose): Promise<SendOtpResponse> {
    const normalizedPhone = this.normalizeIndianPhone(phoneInput);
    this.checkRateLimit(normalizedPhone);

    const recordKey = `${normalizedPhone}:${purpose}`;
    const existing = this.records.get(recordKey);

    // Enforce resend cooldown (45 seconds)
    if (existing && new Date(existing.resendAvailableAt).getTime() > Date.now()) {
      const waitSeconds = Math.ceil(
        (new Date(existing.resendAvailableAt).getTime() - Date.now()) / 1000
      );
      throw new Error(`Please wait ${waitSeconds}s before requesting a new OTP.`);
    }

    // Dispatch through active provider (Development or Production)
    const result = await this.provider.sendOtp(normalizedPhone, purpose);
    const phoneHash = await hashOtp(normalizedPhone);

    const record: OtpRecord = {
      id: `otp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      phoneHash,
      normalizedPhone,
      purpose,
      otpHash: result.otpHash,
      expiresAt: result.expiresAt.toISOString(),
      attemptCount: 0,
      maxAttempts: 5,
      resendAvailableAt: result.resendAvailableAt.toISOString(),
      verifiedAt: null,
      createdAt: new Date().toISOString(),
    };

    this.records.set(recordKey, record);

    return {
      success: true,
      message: `OTP sent to ${normalizedPhone.slice(0, 5)}******${normalizedPhone.slice(-2)}`,
      resendAvailableAt: record.resendAvailableAt,
      expiresAt: record.expiresAt,
      devOtp: result.devOtp, // Only populated in development mode
    };
  }

  /**
   * Verifies an OTP submitted by the user.
   * Enforces attempt limits, 5-minute expiration, and one-time-use invalidation.
   */
  async verifyOtp(
    phoneInput: string,
    otpCode: string,
    purpose: OtpPurpose
  ): Promise<VerifyOtpResponse> {
    const normalizedPhone = this.normalizeIndianPhone(phoneInput);
    const cleanOtp = otpCode.trim();

    if (!/^[0-9]{6}$/.test(cleanOtp)) {
      return {
        success: false,
        message: "Please enter a valid 6-digit numeric OTP.",
        error: "INVALID_FORMAT",
      };
    }

    const recordKey = `${normalizedPhone}:${purpose}`;
    const record = this.records.get(recordKey);

    if (!record) {
      return {
        success: false,
        message: "No active OTP request found for this number. Please request a new OTP.",
        error: "NOT_FOUND",
      };
    }

    // 1. Check if already verified (Replay prevention)
    if (record.verifiedAt) {
      return {
        success: false,
        message: "This OTP has already been used. Please request a new OTP.",
        error: "ALREADY_VERIFIED",
      };
    }

    // 2. Check expiration (5 minutes)
    if (new Date(record.expiresAt).getTime() < Date.now()) {
      return {
        success: false,
        message: "This OTP has expired. Please request a new OTP.",
        error: "EXPIRED",
      };
    }

    // 3. Check attempt limits (max 5 attempts)
    if (record.attemptCount >= record.maxAttempts) {
      return {
        success: false,
        message: "Maximum verification attempts exceeded. Please request a new OTP.",
        error: "MAX_ATTEMPTS_EXCEEDED",
        remainingAttempts: 0,
      };
    }

    // Increment attempt counter
    record.attemptCount += 1;

    // 4. Verify candidate hash against stored hash
    const isValid = await this.provider.verifyOtp(cleanOtp, record.otpHash);

    if (!isValid) {
      const remaining = record.maxAttempts - record.attemptCount;
      return {
        success: false,
        message:
          remaining > 0
            ? `That OTP is incorrect. You have ${remaining} attempt(s) remaining.`
            : "That OTP is incorrect. Maximum attempts exceeded. Please request a new OTP.",
        error: "INVALID_OTP",
        remainingAttempts: remaining,
      };
    }

    // 5. Successful Verification: Mark verified & invalidate for future replay
    record.verifiedAt = new Date().toISOString();

    return {
      success: true,
      message: "Phone number verified successfully.",
      phoneVerified: true,
    };
  }

  /**
   * Check if a phone number was successfully verified for a specific purpose.
   */
  isPhoneVerified(phoneInput: string, purpose: OtpPurpose): boolean {
    try {
      const normalized = this.normalizeIndianPhone(phoneInput);
      const record = this.records.get(`${normalized}:${purpose}`);
      return Boolean(record && record.verifiedAt);
    } catch {
      return false;
    }
  }

  /**
   * Masks a phone number for user-facing display (e.g. +91 ******1234)
   */
  maskPhone(phoneInput: string): string {
    try {
      const normalized = this.normalizeIndianPhone(phoneInput);
      const last4 = normalized.slice(-4);
      return `+91 ******${last4}`;
    } catch {
      return "+91 ******XXXX";
    }
  }

  getMode(): OtpProviderMode {
    return this.mode;
  }
}

export const otpService = new OtpService();
