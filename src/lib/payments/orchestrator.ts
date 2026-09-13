import type { CreateOrderParams, OrderResult, VerifyPaymentParams, VerifyResult } from "./types";
import { CLIENT_ENV } from "@/lib/env/client";

/**
 * Payment Orchestrator Client Interface
 * Client-safe facade that delegates authoritative calculations and signature checks to the backend server.
 */
export const paymentOrchestrator = {
  /**
   * Request server-authoritative order creation via secure API endpoint.
   */
  async createOrder(params: CreateOrderParams): Promise<OrderResult> {
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        booking_id: params.bookingId,
        purpose: params.purpose,
        total_amount: params.amountInr,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || "Payment order creation failed.");
    }

    return {
      success: true,
      orderId: data.order_id,
      amountInr: data.amount,
      amountPaise: data.amount_paise,
      currency: data.currency,
      receipt: data.receipt,
      keyId: data.key_id || CLIENT_ENV.VITE_RAZORPAY_KEY_ID || "",
    };
  },

  /**
   * Submit cryptographic payment verification payload to backend.
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyResult> {
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        razorpay_order_id: params.orderId,
        razorpay_payment_id: params.paymentId,
        razorpay_signature: params.signature,
        booking_id: params.bookingId,
        purpose: params.purpose,
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      return {
        verified: false,
        orderId: params.orderId,
        paymentId: params.paymentId,
        status: "FAILED",
        purpose: params.purpose || "BOOKING",
        error: data.error || "Payment signature verification failed.",
      };
    }

    return {
      verified: true,
      orderId: data.order_id,
      paymentId: data.payment_id,
      status: "SUCCESS",
      bookingId: data.booking_id,
      purpose: data.purpose,
      verifiedAt: data.verified_at,
    };
  },
};
