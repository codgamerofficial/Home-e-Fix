import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { DollarSign, ShieldCheck, Clock, CheckCircle2, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function Refund() {
  return (
    <div className="space-y-8 py-8 sm:py-12 max-w-4xl mx-auto px-4">
      <div className="space-y-3 text-center">
        <Badge variant="accent" className="px-3 py-1 text-xs">Financial Security & Guarantees</Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">
          Refund & Reimbursement Policy
        </h1>
        <p className="text-xs text-foreground-secondary">
          Clear, fast, and compliant refund timelines governed by RBI and Indian E-Commerce standards.
        </p>
      </div>

      <Card className="p-6 sm:p-10 border border-border space-y-8 text-xs sm:text-sm text-foreground-secondary leading-relaxed shadow-sm">
        {/* Refund Timeline Matrix */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-border">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Instant Wallet Credit
            </span>
            <p className="text-xs text-emerald-700">
              Zero waiting time. Instantly usable for any future service across Kolkata.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="font-bold text-blue-800 text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-blue-600" /> UPI / Net Banking
            </span>
            <p className="text-xs text-blue-700">
              Processed within 24 to 48 banking hours directly to your source VPA.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-purple-50 border border-purple-200 space-y-1">
            <span className="font-bold text-purple-800 text-sm flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-purple-600" /> Credit / Debit Cards
            </span>
            <p className="text-xs text-purple-700">
              3 to 5 business days subject to issuing bank settlement schedules.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            1. Eligibility for Refunds
          </h3>
          <p>
            You are entitled to a full or partial refund under the following circumstances:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground-secondary">
            <li>Booking cancelled before technician arrival under our free cancellation window.</li>
            <li>Double payment or duplicate transaction due to network timeout or gateway failure.</li>
            <li>Technician unable to arrive within 45 minutes of scheduled emergency window without prior customer consent.</li>
            <li>Unsatisfactory service resolution verified under our 30-Day Home-e-Fix Warranty review.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            2. Pay-After-Service Safety
          </h3>
          <p>
            Because Home-e-Fix champions a customer-first policy, over 80% of our bookings are configured with <strong>Pay After Service</strong>. Customers only pay after verifying that switches, plumbing pipes, or appliances are functioning properly. This eliminates premature deductions entirely.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            3. Warranty Claim Reimbursements
          </h3>
          <p>
            If a repaired fixture fails within the 30-day warranty window, our priority is free technician re-inspection and resolution. If the problem cannot be resolved due to technical incompatibility, we provide a complete labour charge refund.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            4. How to Request a Refund
          </h3>
          <p>
            Initiate a refund directly from the <strong>Booking Details</strong> screen by clicking <em>&quot;Report an Issue / Request Refund&quot;</em> or email our Kolkata grievance desk at <strong>support@homeefix.in</strong> with your booking reference.
          </p>
        </section>

        <div className="pt-4 flex items-center justify-between border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.CANCELLATION} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Cancellation Policy
            </Link>
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link to={ROUTES.TERMS}>Terms of Service &rarr;</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
