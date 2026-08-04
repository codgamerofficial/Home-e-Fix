import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ShieldCheck, Lock } from "lucide-react";

export default function Privacy() {
  return (
    <div className="space-y-8 py-8 max-w-4xl mx-auto">
      <div className="space-y-3 text-center">
        <Badge variant="accent" className="px-3 py-1 text-xs">Data Protection</Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">Privacy Policy</h1>
        <p className="text-xs text-foreground-secondary">Last updated: August 01, 2026</p>
      </div>

      <Card className="p-6 sm:p-10 border border-border space-y-6 text-xs sm:text-sm text-foreground-secondary leading-relaxed">
        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">1. Information We Collect</h3>
          <p>
            We collect personal information necessary to deliver doorstep home services, including your name, contact phone number, email address, service location coordinates, and payment preferences.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">2. How We Use Your Data</h3>
          <p>
            Your information is strictly used to dispatch background-verified technicians to your address, provide real-time booking SMS/push notifications, process payments, and improve platform service quality.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">3. Data Security & Encryption</h3>
          <p>
            We employ bank-grade SSL/TLS encryption and 256-bit data protection. Your payment details are processed through PCI-DSS compliant gateways like Razorpay and are never stored on our servers.
          </p>
        </section>

        <section className="space-y-2">
          <h3 className="font-heading text-base font-bold text-primary">4. Your Data Rights</h3>
          <p>
            You have the right to inspect, update, or request full deletion of your profile data at any time through your Customer Account Settings or by emailing <span className="font-bold text-primary">privacy@homeefix.com</span>.
          </p>
        </section>
      </Card>
    </div>
  );
}
