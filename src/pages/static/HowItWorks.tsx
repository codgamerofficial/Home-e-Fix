import { Link } from "react-router";
import { CheckCircle2, ShieldCheck, Clock, CreditCard, Sparkles, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Choose Your Service",
      description:
        "Select from 15+ specialized home repair categories with upfront, transparent pricing. No hidden fees or surprise estimates.",
      icon: Sparkles,
    },
    {
      number: "02",
      title: "Match With a Verified Pro",
      description:
        "Our intelligent dispatch system matches you with background-verified, skill-certified technicians in your immediate locality.",
      icon: ShieldCheck,
    },
    {
      number: "03",
      title: "Live Tracking & Seamless Fix",
      description:
        "Track your technician's arrival live with exact ETA, OTP verification at arrival, and genuine OEM spare parts warranty.",
      icon: Clock,
    },
    {
      number: "04",
      title: "Digital Invoice & Cashless Pay",
      description:
        "Pay securely via UPI, cards, or wallet only after full job satisfaction, backed by our 30-day Home-e-Fix Service Warranty.",
      icon: CreditCard,
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container-app space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            Simple • Reliable • Transparent
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            How <span className="text-accent">Home-e-Fix</span> Works
          </h1>
          <p className="text-foreground-secondary text-base md:text-lg">
            Experience hassle-free home maintenance in 4 effortless steps. From booking to guaranteed quality service.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => {
            const Icon = step.icon;
            return (
              <div
                key={step.number}
                className="relative rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-2xl font-black text-accent/30 font-mono">
                      {step.number}
                    </span>
                    <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-primary">{step.title}</h3>
                  <p className="text-sm text-foreground-secondary leading-relaxed">
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* The Home-e-Fix Promise Section */}
        <div className="rounded-3xl border border-border bg-muted/40 p-8 md:p-12 space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              The Home-e-Fix Promise
            </h2>
            <p className="text-sm text-foreground-secondary">
              Every service visit is backed by our standard consumer protection commitment.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4">
            {[
              "Verified Professionals",
              "Transparent Pricing",
              "Genuine Materials",
              "Digital Invoice",
              "Service Warranty",
              "Live Booking Updates",
              "Customer Support",
              "Cashless Payment",
            ].map((promise) => (
              <div
                key={promise}
                className="flex items-center gap-2.5 p-3.5 rounded-xl bg-surface border border-border text-xs md:text-sm font-semibold text-primary"
              >
                <CheckCircle2 className="h-4 w-4 text-success shrink-0" />
                <span>{promise}</span>
              </div>
            ))}
          </div>

          <div className="text-center pt-6">
            <Button variant="accent" size="lg" asChild>
              <Link to={ROUTES.SERVICES} className="gap-2">
                Explore All Services <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
