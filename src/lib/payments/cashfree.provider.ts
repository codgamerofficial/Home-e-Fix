import type { PaymentProvider, CreateOrderParams, OrderResult, VerifyPaymentParams, VerifyResult, WebhookResult } from "./types";

export class CashfreeProvider implements PaymentProvider {
  name = "CASHFREE" as const;
  private clientId: string;
  private clientSecret: string;
  private env: "sandbox" | "production";
  private apiVersion: string;

  constructor(
    clientId: string,
    clientSecret: string,
    env: "sandbox" | "production" = "sandbox",
    apiVersion = "2025-01-01"
  ) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.env = env;
    this.apiVersion = apiVersion;
  }

  private getBaseUrl(): string {
    return this.env === "production"
      ? "https://api.cashfree.com/pg"
      : "https://sandbox.cashfree.com/pg";
  }

  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Cashfree credentials are not configured.");
    }

    const orderId = `cf_${params.purpose.toLowerCase()}_${params.bookingId || Date.now()}`;
    const amountInr = params.amountInr;

    const res = await fetch(`${this.getBaseUrl()}/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-client-id": this.clientId,
        "x-client-secret": this.clientSecret,
        "x-api-version": this.apiVersion,
      },
      body: JSON.stringify({
        order_id: orderId,
        order_amount: amountInr,
        order_currency: params.currency || "INR",
        customer_details: {
          customer_id: params.customerEmail.replace(/[^a-zA-Z0-9_-]/g, "") || "cust_hef",
          customer_name: params.customerName,
          customer_email: params.customerEmail,
          customer_phone: params.customerPhone || "9999999999",
        },
        order_meta: {
          return_url: `${window.location.origin}/app/bookings/${params.bookingId}?order_id={order_id}`,
        },
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.message || "Cashfree order creation failed.");
    }

    return {
      success: true,
      orderId: data.order_id || orderId,
      amountInr,
      amountPaise: Math.round(amountInr * 100),
      currency: data.order_currency || "INR",
      receipt: orderId,
      keyId: this.clientId,
    };
  }

  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error("Cashfree credentials missing.");
    }

    const res = await fetch(`${this.getBaseUrl()}/orders/${params.orderId}`, {
      method: "GET",
      headers: {
        "x-client-id": this.clientId,
        "x-client-secret": this.clientSecret,
        "x-api-version": this.apiVersion,
      },
    });

    const data = await res.json();
    const isPaid = data.order_status === "PAID";

    return {
      verified: isPaid,
      orderId: params.orderId,
      paymentId: params.paymentId || data.cf_order_id,
      status: isPaid ? "SUCCESS" : "FAILED",
      bookingId: params.bookingId,
      purpose: params.purpose || "BOOKING",
      verifiedAt: new Date().toISOString(),
      error: isPaid ? undefined : "Cashfree transaction status is not PAID",
    };
  }

  verifyWebhookSignature(_rawBody: string, _signature: string): boolean {
    return Boolean(this.clientSecret);
  }

  async handleWebhook(rawBody: string): Promise<WebhookResult> {
    const payload = JSON.parse(rawBody);
    return {
      received: true,
      event: payload.type || "PAYMENT_UPDATE",
      bookingId: payload.data?.order?.order_id,
      paymentId: payload.data?.payment?.cf_payment_id,
      status: payload.data?.payment?.payment_status === "SUCCESS" ? "SUCCESS" : "PENDING",
    };
  }
}
