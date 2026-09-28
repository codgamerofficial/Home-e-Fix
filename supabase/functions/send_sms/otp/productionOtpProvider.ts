import { TwoFactorSmsProvider } from "./twoFactorSmsProvider.ts";

/**
 * Production OTP Provider
 * Defaults to TwoFactorSmsProvider for certified Indian mobile delivery.
 */
export class ProductionOtpProvider extends TwoFactorSmsProvider {}
