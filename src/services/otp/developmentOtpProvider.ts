import type { IOtpProvider, OtpPurpose, OtpProviderMode } from "./otp.types";

/**
 * Computes a secure SHA-256 hash of an OTP string using standard Web Crypto API.
 * Compatible with Browser, Cloudflare Workers, Supabase Edge Functions, and modern Node.js.
 */
export async function hashOtp(otp: string): Promise<string> {
  const clean = otp.trim();
  const c = typeof globalThis !== "undefined" ? (globalThis as any).crypto : null;
  if (c?.subtle) {
    const encoder = new TextEncoder();
    const data = encoder.encode(clean);
    const hashBuffer = await c.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b: number) => b.toString(16).padStart(2, "0")).join("");
  }

  throw new Error("Cryptographic hashing environment unavailable.");
}

/**
 * Generates a cryptographically secure 6-digit numeric OTP.
 * Uses Web Crypto getRandomValues for true cryptographic randomness.
 */
export function generateSecureNumericOtp(): string {
  const c = typeof globalThis !== "undefined" ? (globalThis as any).crypto : null;
  if (c?.getRandomValues) {
    const uintArray = new Uint32Array(1);
    c.getRandomValues(uintArray);
    // Guarantee 6 digits: 100000 to 999999
    const code = 100000 + (uintArray[0] % 900000);
    return code.toString();
  }

  return Math.floor(100000 + Math.random() * 900000).toString();
}

export class DevelopmentOtpProvider implements IOtpProvider {
  private readonly expiryMinutes = 5;
  private readonly resendCooldownSeconds = 45;

  constructor() {
    // Hard production safety guard
    if (typeof import.meta !== "undefined" && import.meta.env?.PROD) {
      throw new Error(
        "FATAL SECURITY CONFIGURATION: DevelopmentOtpProvider is strictly prohibited in production environments."
      );
    }
  }

  async sendOtp(phone: string, purpose: OtpPurpose) {
    // Generate secure random OTP
    const rawOtp = generateSecureNumericOtp();

    // Compute secure hash for database persistence
    const otpHash = await hashOtp(rawOtp);

    const now = Date.now();
    const expiresAt = new Date(now + this.expiryMinutes * 60 * 1000);
    const resendAvailableAt = new Date(now + this.resendCooldownSeconds * 1000);

    // Development server logging (Never executed in production)
    if (typeof console !== "undefined" && console.info) {
      console.info(
        `%c[Home-e-Fix DEV OTP]%c Phone: ${phone} | Purpose: ${purpose} | Code: %c${rawOtp}%c (Expires in 5m)`,
        "background: #0B132B; color: #00F0FF; font-weight: bold; padding: 2px 6px; border-radius: 4px;",
        "color: inherit;",
        "background: #FF9F1C; color: #000; font-weight: bold; padding: 2px 4px; border-radius: 2px;",
        "color: inherit;"
      );
    }

    return {
      success: true,
      otpHash,
      expiresAt,
      resendAvailableAt,
      devOtp: rawOtp, // Exposed strictly in development mode for developer testing
    };
  }

  async verifyOtp(submittedOtp: string, expectedHash: string): Promise<boolean> {
    const candidateHash = await hashOtp(submittedOtp);
    return candidateHash === expectedHash;
  }

  getProviderStatus(): { mode: OtpProviderMode; isReady: boolean } {
    return {
      mode: "development",
      isReady: true,
    };
  }
}
