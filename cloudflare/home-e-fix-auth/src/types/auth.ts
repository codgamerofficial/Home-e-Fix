export type UserRole = "customer" | "professional";

export type TurnstileAction = "customer_otp" | "professional_otp";

export interface RequestOtpBody {
  phone: string;
  role: UserRole;
  action: TurnstileAction;
  turnstileToken: string;
}

export interface RequestOtpResponse {
  success: boolean;
  message: string;
  resendCooldownSeconds: number;
  phoneMasked: string;
}

export interface ErrorResponse {
  error: string;
  code?: string;
}

export interface TurnstileVerificationResult {
  success: boolean;
  action?: string;
  hostname?: string;
  error?: string;
}

export interface Env {
  ENVIRONMENT?: string;
  APP_ENV?: string;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  SUPABASE_SERVICE_ROLE_KEY?: string;
  SUPABASE_SECRET_KEY?: string;
  TURNSTILE_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  TURNSTILE_HOSTNAMES?: string;
  ALLOWED_ORIGINS?: string;
  SMS_PROVIDER?: string;
  TWOFACTOR_API_KEY?: string;
  TWOFACTOR_TEMPLATE_ID?: string;
  TWOFACTOR_SENDER_ID?: string;
  OTP_RESEND_COOLDOWN_SECONDS?: string;
  OTP_MAX_REQUESTS_PER_HOUR?: string;
}
