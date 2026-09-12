import { Link } from "react-router";
import { Check, Crown, Shield, Zap, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function MembershipPublic() {
  const perks = [
    {
      title: "Priority Booking Dispatch",
      description: "Jump to the front of the queue during peak hours, festivals, and emergency calls.",
      icon: Zap,
    },
    {
      title: "Annual Home Health Check",
      description: "Complimentary 360° inspection covering electrical wiring, plumbing, and AC units.",
      icon: Shield,
    },
    {
      title: "15% Discount on Labour",
      description: "Instant direct savings on every technician service visit all year round.",
      icon: Sparkles,
    },
    {
      title: "Extended 60-Day Warranty",
      description: "Double the peace of mind with 2x the standard 30-day post-service warranty.",
      icon: Crown,
    },
    {
      title: "Exclusive Member Deals",
      description: "Access seasonal deals, spare part discounts, and VIP customer concierge desk.",
      icon: Check,
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container-app space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            VIP Protection Plan
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            Home-e-Fix <span className="text-accent">PLUS</span>
          </h1>
          <p className="text-foreground-secondary text-base md:text-lg">
            Unlock priority dispatch, annual home health audits, extended warranties, and exclusive member savings.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {/* Monthly */}
          <div className="rounded-3xl border border-border bg-surface p-8 shadow-sm hover:shadow-md transition-all flex flex-col justify-between">
            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
                  Flexible Plan
                </span>
                <h3 className="text-2xl font-bold text-primary mt-1">Monthly Pass</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-primary">₹99</span>
                <span className="text-foreground-secondary text-sm">/ month</span>
              </div>
              <p className="text-sm text-foreground-secondary">
                Great for trying out membership benefits on immediate home repair projects.
              </p>

              <ul className="space-y-3 pt-4 border-t border-border text-sm">
                {[
                  "Priority technician assignment",
                  "10% discount on labour rates",
                  "Standard 45-day warranty",
                  "Cancel anytime with 1 click",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-foreground-secondary">
                    <Check className="h-4 w-4 text-success shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Button variant="outline" className="w-full" size="lg" asChild>
                <Link to={ROUTES.APP_MEMBERSHIP}>Get Monthly Pass</Link>
              </Button>
            </div>
          </div>

          {/* Annual Best Value */}
          <div className="relative rounded-3xl border-2 border-accent bg-surface p-8 shadow-xl shadow-accent/10 flex flex-col justify-between">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-accent text-white text-xs font-black uppercase tracking-wider shadow-md">
              Most Popular • Save 20%
            </div>

            <div className="space-y-6">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-accent">
                  Full Year Peace of Mind
                </span>
                <h3 className="text-2xl font-bold text-primary mt-1">Annual PLUS</h3>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-extrabold text-primary">₹999</span>
                <span className="text-foreground-secondary text-sm">/ year</span>
              </div>
              <p className="text-sm text-foreground-secondary">
                Complete all-season home maintenance protection for owners and tenants.
              </p>

              <ul className="space-y-3 pt-4 border-t border-border text-sm">
                {[
                  "Top-tier priority technician assignment",
                  "Free Annual Home Health Check (Value ₹999)",
                  "15% flat discount on labour charges",
                  "Extended 60-day service warranty",
                  "Dedicated VIP customer support desk",
                  "Exclusive member-only flash coupons",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2.5 text-foreground">
                    <Check className="h-4 w-4 text-accent shrink-0 font-bold" />
                    <span className="font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-8">
              <Button variant="accent" className="w-full shadow-glow" size="lg" asChild>
                <Link to={ROUTES.APP_MEMBERSHIP} className="gap-2">
                  Join Home-e-Fix PLUS <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="space-y-8 pt-8">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              All Exclusive Privileges Included
            </h2>
            <p className="text-sm text-foreground-secondary">
              Engineered to save you money, time, and stress on routine home fixes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {perks.map((perk) => {
              const Icon = perk.icon;
              return (
                <div
                  key={perk.title}
                  className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3"
                >
                  <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h4 className="text-lg font-bold text-primary">{perk.title}</h4>
                  <p className="text-sm text-foreground-secondary leading-relaxed">
                    {perk.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
