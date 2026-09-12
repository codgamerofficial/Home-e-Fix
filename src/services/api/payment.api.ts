import { supabase } from "@/lib/supabase";

export interface CreateOrderParams {
  bookingId?: string;
  purpose: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
  topupAmount?: number;
  totalAmount?: number;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
}

export interface OrderResponse {
  success: boolean;
  order_id: string;
  amount: number;
  amount_paise: number;
  currency: string;
  receipt?: string;
  key_id?: string;
  error?: string;
  code?: string;
}

export interface VerifyPaymentParams {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
  booking_id?: string;
  purpose?: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
}

export interface VerifyPaymentResponse {
  verified: boolean;
  order_id?: string;
  payment_id?: string;
  status?: string;
  booking_id?: string;
  error?: string;
}

/**
 * Payment API Service
 * Coordinates server-side order creation and cryptographic signature verification.
 * Priority:
 * 1. Supabase Edge Functions (when deployed to production)
 * 2. Home-e-Fix Local Payment Server (/api/payment/*)
 */
export const paymentApi = {
  /**
   * Request server-side Razorpay Order creation.
   * NEVER trust client amount; amount is validated/computed by the server.
   */
  async createOrder(params: CreateOrderParams): Promise<OrderResponse> {
    // 1. Try Supabase Edge Function first if available
    try {
      const { data, error } = await supabase.functions.invoke("create-razorpay-order", {
        body: {
          booking_id: params.bookingId,
          purpose: params.purpose,
          topup_amount: params.topupAmount,
        },
      });

      if (!error && data?.order_id) {
        return {
          success: true,
          order_id: data.order_id,
          amount: data.amount,
          amount_paise: data.amount_paise,
          currency: data.currency || "INR",
          receipt: data.receipt,
          key_id: data.razorpay_key_id,
        };
      }
    } catch {
      // Supabase Edge Function not deployed or unreachable; fall back to payment server
    }

    // 2. Call Home-e-Fix Payment Server (/api/payment/create-order)
    const res = await fetch("/api/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        booking_id: params.bookingId,
        purpose: params.purpose,
        topup_amount: params.topupAmount,
        total_amount: params.totalAmount,
        customer_name: params.customerName,
        customer_email: params.customerEmail,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || `Payment gateway error (${res.status}): Order could not be created.`);
    }

    return {
      success: true,
      order_id: data.order_id,
      amount: data.amount,
      amount_paise: data.amount_paise,
      currency: data.currency,
      receipt: data.receipt,
      key_id: data.key_id,
    };
  },

  /**
   * Request server-side HMAC-SHA256 signature verification.
   * Only the server knows RAZORPAY_KEY_SECRET.
   */
  async verifyPayment(params: VerifyPaymentParams): Promise<VerifyPaymentResponse> {
    // 1. Try Supabase Edge Function first if available
    try {
      const { data, error } = await supabase.functions.invoke("verify-razorpay-payment", {
        body: {
          razorpay_order_id: params.razorpay_order_id,
          razorpay_payment_id: params.razorpay_payment_id,
          razorpay_signature: params.razorpay_signature,
          booking_id: params.booking_id,
          purpose: params.purpose,
        },
      });

      if (!error && data?.verified) {
        return {
          verified: true,
          order_id: data.order_id,
          payment_id: data.payment_id,
          status: data.status || "SUCCESS",
          booking_id: data.booking_id,
        };
      }
    } catch {
      // Supabase Edge Function not deployed or unreachable; fall back to payment server
    }

    // 2. Call Home-e-Fix Payment Server (/api/payment/verify)
    const res = await fetch("/api/payment/verify", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpay_order_id: params.razorpay_order_id,
        razorpay_payment_id: params.razorpay_payment_id,
        razorpay_signature: params.razorpay_signature,
        booking_id: params.booking_id,
        purpose: params.purpose,
      }),
    });

    const data = await res.json();

    if (!res.ok || !data.verified) {
      throw new Error(data.error || "Payment verification failed. Please contact customer support.");
    }

    return {
      verified: true,
      order_id: data.order_id,
      payment_id: data.payment_id,
      status: data.status || "SUCCESS",
      booking_id: data.booking_id,
    };
  },
};
