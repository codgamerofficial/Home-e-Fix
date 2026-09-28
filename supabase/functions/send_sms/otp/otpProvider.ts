/**
 * Home-e-Fix SMS Provider Abstraction Interface
 * Used by Supabase Send SMS Auth Hook & Cloudflare Edge Services.
 *
 * Interface:
 * sendOtp({ phone, otp, purpose, locale })
 * -> { success: boolean, providerMessageId?: string, errorCode?: string, error?: string }
 */

export interface SendOtpParams {
  phone: string;
  otp: string;
  purpose?: string;
  locale?: string;
}

export interface OtpDeliveryResult {
  success: boolean;
  providerMessageId?: string;
  messageId?: string;
  errorCode?: string;
  error?: string;
}

export interface OtpDeliveryProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult>;
}
