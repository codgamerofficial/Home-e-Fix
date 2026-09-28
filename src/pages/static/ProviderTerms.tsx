import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Wrench, ShieldCheck, CheckCircle2, Award, ArrowLeft } from "lucide-react";
import { Link } from "react-router";
import { ROUTES } from "@/constants/routes";
import { Button } from "@/components/ui/button";

export default function ProviderTerms() {
  return (
    <div className="space-y-8 py-8 sm:py-12 max-w-4xl mx-auto px-4">
      <div className="space-y-3 text-center">
        <Badge variant="accent" className="px-3 py-1 text-xs">Partner Agreement</Badge>
        <h1 className="font-heading text-3xl sm:text-4xl font-extrabold text-primary">
          Service Partner & Technician Agreement
        </h1>
        <p className="text-xs text-foreground-secondary">
          Operating standards, safety protocols, revenue sharing, and quality guidelines for Home-e-Fix Kolkata Professionals.
        </p>
      </div>

      <Card className="p-6 sm:p-10 border border-border space-y-8 text-xs sm:text-sm text-foreground-secondary leading-relaxed shadow-sm">
        {/* Core Principles */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pb-6 border-b border-border">
          <div className="p-4 rounded-2xl bg-orange-50 border border-orange-200 space-y-1">
            <span className="font-bold text-orange-800 text-sm flex items-center gap-1.5">
              <Award className="h-4 w-4 text-[#FF6A00]" /> 80%+ Direct Payout
            </span>
            <p className="text-xs text-orange-700">
              Transparent rate cards with daily or weekly direct bank transfer.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-blue-50 border border-blue-200 space-y-1">
            <span className="font-bold text-blue-800 text-sm flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-blue-600" /> Free Tool & Accidental Cover
            </span>
            <p className="text-xs text-blue-700">
              ₹2,00,000 accidental cover while on active dispatch for verified pros.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1">
            <span className="font-bold text-emerald-800 text-sm flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Kolkata Local Hubs
            </span>
            <p className="text-xs text-emerald-700">
              Work within your preferred 5–8 km neighborhood radius without long commutes.
            </p>
          </div>
        </div>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            1. Independent Contractor Relationship
          </h3>
          <p>
            Service professionals on Home-e-Fix operate as independent contractors. You retain the freedom to accept or decline job dispatches based on your availability, while upholding platform service quality and customer safety standards.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            2. Partner Verification & Application Review
          </h3>
          <p>
            Before receiving active customer job dispatches, every professional application undergoes administrative review:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-foreground-secondary">
            <li>Google account sign-in & verified mobile contact number</li>
            <li>Detailed trade specialty, experience history, and skill declaration</li>
            <li>Operational service area hubs and active working hours selection</li>
            <li>Optional trade diplomas or skill certifications (Zero Government-ID / Aadhaar / PAN upload required)</li>
            <li>Explicit administrative approval by Home-e-Fix operations</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            3. Spare Parts & Material Rules
          </h3>
          <p>
            When supplying spare parts (pipes, valves, MCBs, capacitors), technicians must strictly supply genuine branded components with valid tax invoices. Markups are capped according to the Admin Pricing CMS (10% to 15% maximum), and customers must approve all in-app quotes above ₹500 before installation.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            4. Service Quality & Rework Responsibility
          </h3>
          <p>
            Home-e-Fix provides homeowners with a 30-day rework warranty. If a quality issue is verified within this period, the assigned technician agrees to inspect and rectify the issue without levying additional labour charges.
          </p>
        </section>

        <section className="space-y-3">
          <h3 className="font-heading text-base font-bold text-primary flex items-center gap-2">
            5. Zero Tolerance Policy
          </h3>
          <p>
            Home-e-Fix maintains zero tolerance for offline cash bargaining, harassment, substance use during duty, or deliberate bypass of safety gear. Violations result in immediate suspension and forfeiture of platform access.
          </p>
        </section>

        <div className="pt-4 flex items-center justify-between border-t border-border">
          <Button variant="outline" size="sm" asChild>
            <Link to={ROUTES.BECOME_A_PROFESSIONAL} className="gap-1.5">
              <ArrowLeft className="h-4 w-4" /> Become a Partner
            </Link>
          </Button>
          <Button variant="accent" size="sm" asChild>
            <Link to={ROUTES.TERMS}>Customer Terms &rarr;</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}
