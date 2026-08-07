import { APP_CONFIG } from "@/constants/services";

export interface RazorpayOptions {
  amount: number;
  currency?: string;
  orderId?: string;
  name?: string;
  description?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  onSuccess: (paymentId: string) => void;
  onCancel?: (reason: string) => void;
  onFailure?: (errorMsg: string) => void;
}

/**
 * Razorpay Payment Gateway integration SDK loader.
 */
export function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Display Razorpay Checkout modal popup with explicit success, cancel, and error handling.
 */
export async function displayRazorpayCheckout(options: RazorpayOptions) {
  const isLoaded = await loadRazorpayScript();
  const testKey = import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_TM55pOM1Y37yUO";

  if (!isLoaded) {
    // If SDK fails to load, trigger cancel or fallback error
    if (options.onFailure) {
      options.onFailure("Payment SDK failed to load. Please check your internet connection.");
    } else if (options.onCancel) {
      options.onCancel("Payment cancelled.");
    }
    return;
  }

  try {
    let paymentCompleted = false;

    const razorpayConfig = {
      key: testKey,
      amount: options.amount * 100, // Amount in paise
      currency: options.currency || "INR",
      name: options.name || APP_CONFIG.name,
      description: options.description || "Home Service Booking Payment",
      image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150&q=80",
      order_id: options.orderId,
      handler: function (response: any) {
        paymentCompleted = true;
        const paymentId = response.razorpay_payment_id || `pay_${Date.now()}`;
        options.onSuccess(paymentId);
      },
      modal: {
        ondismiss: function () {
          if (!paymentCompleted) {
            const cancelMsg = "Payment was cancelled by user. No funds were charged.";
            if (options.onCancel) {
              options.onCancel(cancelMsg);
            }
          }
        },
      },
      prefill: {
        name: options.customerName || "Customer",
        email: options.customerEmail || "customer@homeefix.com",
        contact: options.customerPhone || "+91 98765 43210",
      },
      theme: {
        color: "#FF6A00", // Home-e-Fix Electric Orange Accent
      },
    };

    const paymentObject = new window.Razorpay(razorpayConfig);

    paymentObject.on("payment.failed", function (response: any) {
      paymentCompleted = true;
      const errorMsg =
        response?.error?.description ||
        "Payment failed. Please check your card/bank details and try again.";
      if (options.onFailure) {
        options.onFailure(errorMsg);
      } else if (options.onCancel) {
        options.onCancel(errorMsg);
      }
    });

    paymentObject.open();
  } catch (err: any) {
    console.warn("Razorpay Checkout Exception:", err);
    if (options.onFailure) {
      options.onFailure("Payment gateway error occurred. Please try again.");
    } else if (options.onCancel) {
      options.onCancel("Payment cancelled.");
    }
  }
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
