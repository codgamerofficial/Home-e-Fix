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
  onFailure?: (error: any) => void;
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
 * Display Razorpay Checkout modal popup.
 */
export async function displayRazorpayCheckout(options: RazorpayOptions) {
  const isLoaded = await loadRazorpayScript();
  if (!isLoaded) {
    alert("Razorpay SDK failed to load. Please check your internet connection.");
    return;
  }

  const razorpayConfig = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_placeholder",
    amount: options.amount * 100, // Amount in paise
    currency: options.currency || "INR",
    name: options.name || APP_CONFIG.name,
    description: options.description || "Home Service Booking Payment",
    image: "https://images.unsplash.com/photo-1621905252507-b35492cc74b4?w=150&q=80",
    order_id: options.orderId,
    handler: function (response: any) {
      options.onSuccess(response.razorpay_payment_id || `pay_${Date.now()}`);
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
  paymentObject.open();
}

declare global {
  interface Window {
    Razorpay: any;
  }
}
