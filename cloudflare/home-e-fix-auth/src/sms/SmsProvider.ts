export interface SendOtpParams {
  phone: string;
  otp: string;
  purpose?: string;
  locale?: string;
}

export interface SmsSendResult {
  success: boolean;
  providerMessageId?: string;
  errorCode?: string;
  error?: string;
}

export interface SmsProvider {
  readonly name: string;
  sendOtp(params: SendOtpParams): Promise<SmsSendResult>;
}
