import { useState } from "react";
import { MembershipCard } from "@/components/ui/membership-card";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Award, ShieldCheck, Check } from "lucide-react";
import { displayRazorpayCheckout } from "@/lib/razorpay";
import { useAuthStore } from "@/store/auth.store";

export default function Membership() {
  const { user } = useAuthStore();
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribeVIP = async () => {
    await displayRazorpayCheckout({
      amount: 299,
      currency: "INR",
      name: "Home-e-Fix VIP Pass",
      description: "6-Month VIP Pass Subscription",
      customerName: user?.fullName || "Valued Customer",
      customerEmail: user?.email || "customer@homeefix.com",
      customerPhone: user?.phone || "+91 98765 43210",
      onSuccess: () => {
        setIsSubscribed(true);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">VIP Pass Membership</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Enjoy extra 15% discount on all bookings, free inspection visits, and priority dispatches
        </p>
      </div>

      {/* MEMBERSHIP CARD PRIMITIVE */}
      <MembershipCard
        isSubscribed={isSubscribed}
        onSubscribe={handleSubscribeVIP}
      />

      {/* SAVINGS SUMMARY */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-5 rounded-2xl border border-border bg-surface text-center space-y-1">
          <Sparkles className="mx-auto h-6 w-6 text-accent mb-1" />
          <div className="font-heading text-2xl font-bold text-primary">₹1,450</div>
          <div className="text-xs text-foreground-secondary">Total Saved This Year</div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface text-center space-y-1">
          <Award className="mx-auto h-6 w-6 text-accent mb-1" />
          <div className="font-heading text-2xl font-bold text-primary">12</div>
          <div className="text-xs text-foreground-secondary">VIP Bookings Completed</div>
        </div>

        <div className="p-5 rounded-2xl border border-border bg-surface text-center space-y-1">
          <ShieldCheck className="mx-auto h-6 w-6 text-accent mb-1" />
          <div className="font-heading text-2xl font-bold text-primary">Dec 2026</div>
          <div className="text-xs text-foreground-secondary">Membership Renewal Date</div>
        </div>
      </div>
    </div>
  );
}
