import { APP_CONFIG } from "@/constants/services";
import { paymentApi, type OrderResponse } from "@/services/api/payment.api";

export interface RazorpayCheckoutOptions {
  /** The server-generated Razorpay order */
  order: OrderResponse;
  bookingId?: string;
  purpose?: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
  name?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (result: { paymentId: string; orderId: string; signature: string }) => void;
  onCancel?: (reason: string) => void;
  onFailure?: (errorMsg: string) => void;
}

/**
 * Loads the official Razorpay Checkout JavaScript SDK.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }

    const existingScript = document.querySelector('script[src="https://checkout.razorpay.com/v1/checkout.js"]');
    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(true));
      existingScript.addEventListener("error", () => resolve(false));
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Display Razorpay Checkout modal using a server-generated Order ID.
 * Strictly verifies the HMAC-SHA256 signature server-side before invoking onSuccess.
 */
export async function openRazorpayCheckout(options: RazorpayCheckoutOptions): Promise<void> {
  const isLoaded = await loadRazorpayScript();

  if (!isLoaded) {
    const errorMsg = "Unable to load Razorpay Payment Gateway SDK. Please check your internet connection.";
    options.onFailure ? options.onFailure(errorMsg) : options.onCancel?.(errorMsg);
    return;
  }

  const keyId = options.order.key_id || import.meta.env.VITE_RAZORPAY_KEY_ID;
  if (!keyId) {
    const errorMsg = "Razorpay Public Key is missing. Please configure VITE_RAZORPAY_KEY_ID.";
    options.onFailure ? options.onFailure(errorMsg) : options.onCancel?.(errorMsg);
    return;
  }

  if (!options.order.order_id) {
    const errorMsg = "Cannot open checkout without a server-generated order ID.";
    options.onFailure ? options.onFailure(errorMsg) : options.onCancel?.(errorMsg);
    return;
  }

  try {
    let paymentCompleted = false;

    const razorpayConfig = {
      key: keyId,
      amount: options.order.amount_paise,
      currency: options.order.currency || "INR",
      name: options.name || APP_CONFIG.name,
      description: options.description || "Home-e-Fix Verified Service Payment",
      order_id: options.order.order_id,
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150&q=80",
      handler: async function (response: {
        razorpay_payment_id: string;
        razorpay_order_id: string;
        razorpay_signature: string;
      }) {
        paymentCompleted = true;

        try {
          // Cryptographic signature verification strictly on the server
          const verifyResult = await paymentApi.verifyPayment({
            razorpay_order_id: response.razorpay_order_id,
            razorpay_payment_id: response.razorpay_payment_id,
            razorpay_signature: response.razorpay_signature,
            booking_id: options.bookingId,
            purpose: options.purpose || "BOOKING",
          });

          if (verifyResult.verified) {
            options.onSuccess({
              paymentId: response.razorpay_payment_id,
              orderId: response.razorpay_order_id,
              signature: response.razorpay_signature,
            });
          } else {
            options.onFailure?.(verifyResult.error || "Payment verification failed on server.");
          }
        } catch (verifyErr: any) {
          console.error("Payment verification request failed:", verifyErr);
          options.onFailure?.(
            verifyErr.message || "Server verification error. If funds were deducted, they will be reconciled automatically."
          );
        }
      },
      modal: {
        ondismiss: function () {
          if (!paymentCompleted) {
            const cancelMsg = "Payment was dismissed by user. No funds were charged.";
            options.onCancel?.(cancelMsg);
          }
        },
      },
      prefill: {
        name: options.customerName || "Home-e-Fix Customer",
        email: options.customerEmail || "customer@homeefix.com",
        contact: options.customerPhone || "+91 98300 00000",
      },
      theme: {
        color: "#FF6A00", // Home-e-Fix Signature Brand Accent
      },
    };

    const paymentObject = new window.Razorpay(razorpayConfig);

    paymentObject.on("payment.failed", function (response: any) {
      paymentCompleted = true;
      const errorMsg =
        response?.error?.description ||
        "Payment was declined by the bank or gateway. Please check your payment details and retry.";
      options.onFailure ? options.onFailure(errorMsg) : options.onCancel?.(errorMsg);
    });

    paymentObject.open();
  } catch (err: any) {
    console.error("Razorpay Checkout Modal Error:", err);
    options.onFailure?.(err.message || "Failed to initialize payment gateway modal.");
  }
}

/**
 * Backwards compatible helper for initiating server-verified payment in one call.
 */
export async function displayRazorpayCheckout(params: {
  amount: number;
  currency?: string;
  bookingId?: string;
  purpose?: "BOOKING" | "WALLET_TOPUP" | "MEMBERSHIP";
  name?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string) => void;
  onCancel?: (reason: string) => void;
  onFailure?: (errorMsg: string) => void;
}): Promise<void> {
  try {
    // 1. Create server-side order
    const order = await paymentApi.createOrder({
      bookingId: params.bookingId,
      purpose: params.purpose || "BOOKING",
      totalAmount: params.amount,
      topupAmount: params.amount,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
    });

    // 2. Open checkout with real server order
    await openRazorpayCheckout({
      order,
      bookingId: params.bookingId,
      purpose: params.purpose || "BOOKING",
      name: params.name,
      description: params.description,
      customerName: params.customerName,
      customerEmail: params.customerEmail,
      customerPhone: params.customerPhone,
      onSuccess: (res) => params.onSuccess(res.paymentId),
      onCancel: params.onCancel,
      onFailure: params.onFailure,
    });
  } catch (err: any) {
    console.error("Server-side payment order error:", err);
    params.onFailure ? params.onFailure(err.message) : params.onCancel?.(err.message);
  }
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
