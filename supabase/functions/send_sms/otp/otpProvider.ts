/**
 * OTP Delivery Provider Abstraction Interface
 * Used by the Supabase Send SMS Auth Hook Edge Function.
 */

export interface SendOtpParams {
  phone: string;
  otp: string;
}

export interface OtpDeliveryResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface OtpDeliveryProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<OtpDeliveryResult>;
}
