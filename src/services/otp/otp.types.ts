/**
 * OTP Domain Types for Home-e-Fix
 */

export type OtpPurpose =
  | "professional_registration"
  | "professional_phone_change"
  | "professional_login"
  | "customer_login";

export type OtpProviderMode = "development" | "production";

export interface OtpRecord {
  id: string;
  phoneHash: string;
  normalizedPhone: string;
  purpose: OtpPurpose;
  otpHash: string;
  expiresAt: string; // ISO UTC
  attemptCount: number;
  maxAttempts: number;
  resendAvailableAt: string; // ISO UTC
  verifiedAt?: string | null;
  createdAt: string;
}

export interface SendOtpRequest {
  phone: string;
  purpose: OtpPurpose;
}

export interface SendOtpResponse {
  success: boolean;
  message: string;
  resendAvailableAt: string; // ISO UTC
  expiresAt: string; // ISO UTC
  devOtp?: string; // Strictly populated in local development mode
}

export interface VerifyOtpRequest {
  phone: string;
  otp: string;
  purpose: OtpPurpose;
}

export interface VerifyOtpResponse {
  success: boolean;
  message: string;
  error?: string;
  phoneVerified?: boolean;
  remainingAttempts?: number;
}

export interface IOtpProvider {
  sendOtp(phone: string, purpose: OtpPurpose): Promise<{
    success: boolean;
    otpHash: string;
    expiresAt: Date;
    resendAvailableAt: Date;
    devOtp?: string;
  }>;
  verifyOtp(submittedOtp: string, expectedHash: string): Promise<boolean>;
  getProviderStatus(): { mode: OtpProviderMode; isReady: boolean };
}
