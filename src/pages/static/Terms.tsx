import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, FileText } from "lucide-react";

export default function Terms() {
  return (
    <div className="space-y-8 py-8 max-w-4xl mx-auto">
      <div className="space-y-3 text-center">
        <Badge variant="accent" className="px-3 py-1 text-xs">Legal & Compliance</Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">Terms of Service</h1>
        <p className="text-xs text-foreground-secondary">Last updated: August 01, 2026</p>
      </div>

      <Card className="p-6 sm:p-10 border border-border space-y-6 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">1. Agreement to Terms</h3>
          <p>
            By accessing or using the Home-e-Fix application, website, or service platforms, you agree to be bound by these Terms of Service. If you do not agree to all terms, please refrain from using our services.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">2. Service Booking & Cancellation</h3>
          <p>
            Bookings are subject to technician availability. Free cancellations are permitted up to 2 hours prior to the scheduled time slot. Cancellations within 2 hours may incur a minimal doorstep convenience fee of ₹49.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">3. 30-Day Service Guarantee</h3>
          <p>
            Home-e-Fix offers a 30-day warranty on eligible repair and installation services. If the specific issue reoccurs within 30 days of service completion, a verified technician will inspect and re-service the appliance free of charge.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">4. Payments & Refunds</h3>
          <p>
            Payments can be processed via online UPI/cards or Cash-on-Delivery. Refunds for cancelled bookings or quality claims are credited back to your Home-e-Fix Wallet or source bank account within 3–5 business days.
          </p>
        </section>
      </Card>
    </div>
  );
}
