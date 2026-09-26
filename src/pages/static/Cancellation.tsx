import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Clock, ShieldAlert, CheckCircle2, AlertTriangle, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function Cancellation() {
  return (
    <div className="space-y-8 py-8 sm:py-12 max-w-4xl mx-auto px-4">
      <div className="space-y-3 text-center">
        <Badge variant="accent" className="px-3 py-1 text-xs">Policy & Consumer Protection</Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">
          Cancellation & Rescheduling Policy
        </h1>
        <p className="text-xs text-foreground-secondary">
          Transparent, fair rules designed for Kolkata homeowners and independent professionals.
        </p>
      </div>

      <Card className="p-6 sm:p-10 border border-border space-y-8 text-xs sm:text-sm text-foreground-secondary leading-relaxed shadow-sm">
        {/* Policy Highlights */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-border">
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Free Cancellation
            </span>
            <p className="text-xs text-emerald-700">
              Up to 2 hours before scheduled slot: Zero cancellation penalty.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 space-y-1">
            <span className="font-bold text-amber-800 text-sm flex items-center gap-1.5">
              <Clock className="h-4 w-4 text-amber-600" /> Free Rescheduling
            </span>
            <p className="text-xs text-amber-700">
              Reschedule anytime up to 1 hour before arrival at no extra cost.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="font-bold text-blue-800 text-sm flex items-center gap-1.5">
              <ShieldAlert className="h-4 w-4 text-blue-600" /> Proactive Protection
            </span>
            <p className="text-xs text-blue-700">
              If professional delays beyond 30 mins, cancel with full refund + ₹50 voucher.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            1. Cancellation Windows & Fees
          </h3>
          <p>
            We understand that schedules change unexpectedly. To maintain fairness for both customers and travelling service professionals across Kolkata, Home-e-Fix applies the following window rules:
          </p>
          <div className="border border-border rounded-xl overflow-hidden mt-2">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/40 border-b border-border font-bold text-primary">
                <tr>
                  <th className="py-2.5 px-4">Cancellation Timing</th>
                  <th className="py-2.5 px-4">Standard Booking</th>
                  <th className="py-2.5 px-4">Home-e-Fix PLUS Members</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                <tr>
                  <td className="py-2.5 px-4 font-medium text-primary">{">"} 2 Hours before slot</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">100% Free Cancellation</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">100% Free Cancellation</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-primary">Within 2 Hours of slot</td>
                  <td className="py-2.5 px-4 text-foreground-secondary">₹49 Doorstep Travel Contribution</td>
                  <td className="py-2.5 px-4 text-emerald-700 font-bold">Free (1 waiver/month)</td>
                </tr>
                <tr>
                  <td className="py-2.5 px-4 font-medium text-primary">Technician Arrived at Doorstep</td>
                  <td className="py-2.5 px-4 text-foreground-secondary">Visiting Fee (₹199 inspection charge)</td>
                  <td className="py-2.5 px-4 text-foreground-secondary">Visiting Fee (₹149 discounted)</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            2. Instant Rescheduling
          </h3>
          <p>
            Rather than cancelling, homeowners can modify their appointment date and time slot directly in the Home-e-Fix App or Website under <strong>My Bookings</strong> up to 1 hour prior to the original appointment.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            3. Cancellations by Home-e-Fix or Professional
          </h3>
          <p>
            In the rare event that a technician is unable to attend due to unforeseen vehicle breakdown or extreme Kolkata monsoon waterlogging, we immediately re-assign an alternative top-rated technician or issue an instant 100% refund plus a ₹50 goodwill convenience credit.
          </p>
        </section>

        <div className="pt-4 flex items-center justify-between border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.HOME} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Back to Home
            </Link>
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link to={ROUTES.REFUND}>View Refund Policy &rarr;</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
