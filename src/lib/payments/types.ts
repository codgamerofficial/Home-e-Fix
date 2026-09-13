/**
 * Universal Payment Provider Contract for Home-e-Fix
 * Standardizes multi-gateway routing (Razorpay, Cashfree) and webhook processing.
 */

export interface CreateOrderParams {
  bookingId?: string;
  amountInr: number;
  currency?: string;
  purpose: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
}

export interface OrderResult {
  success: boolean;
  orderId: string;
  amountInr: number;
  amountPaise: number;
  currency: string;
  receipt: string;
  keyId: string;
  paymentRecordId?: string;
}

export interface VerifyPaymentParams {
  orderId: string;
  paymentId: string;
  signature: string;
  bookingId?: string;
  purpose?: string;
}

export interface VerifyResult {
  verified: boolean;
  orderId: string;
  paymentId: string;
  status: "SUCCESS" | "FAILED";
  bookingId?: string | null;
  purpose: string;
  verifiedAt?: string;
  error?: string;
}

export interface WebhookResult {
  received: boolean;
  event: string;
  bookingId?: string;
  paymentId?: string;
  status?: string;
}

export interface PaymentProvider {
  name: "RAZORPAY" | "CASHFREE";
  createOrder(params: CreateOrderParams): Promise<OrderResult>;
  verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult>;
  verifyWebhookSignature(rawBody: string, signature: string): boolean;
  handleWebhook(rawBody: string, signature: string): Promise<WebhookResult>;
}
