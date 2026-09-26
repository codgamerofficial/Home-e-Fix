import { Link } from "react-router";
import { ShieldCheck, DollarSign, Calendar, Award, ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";

export default function BecomeProfessional() {
  const benefits = [
    {
      title: "Guaranteed Steady Income",
      description: "Earn up to ₹45,000 to ₹75,000 per month with daily payouts and transparent earnings breakdown.",
      icon: DollarSign,
    },
    {
      title: "Flexible Working Hours",
      description: "You control your availability. Turn the app online or offline based on your own schedule.",
      icon: Calendar,
    },
    {
      title: "Zero Lead Generation Fees",
      description: "We bring high-intent verified customers directly to you with accurate job descriptions and map navigation.",
      icon: ShieldCheck,
    },
    {
      title: "Free Safety & Skill Training",
      description: "Get certified in modern tools, electrical safety, smart home IoT, and customer communication.",
      icon: Award,
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container-app space-y-16">
        {/* Hero */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            For Skilled Technicians & Tradespeople
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            Grow Your Business with <span className="text-accent">Home-e-Fix</span>
          </h1>
          <p className="text-foreground-secondary text-base md:text-lg">
            Join Eastern India's fastest growing network of verified electricians, plumbers, carpenters, and appliance experts.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button variant="accent" size="lg" asChild>
              <Link to={ROUTES.PROFESSIONAL_ONBOARDING} className="gap-2">
                Apply as a Professional <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link to={ROUTES.PROFESSIONAL_JOBS}>Technician Login</Link>
            </Button>
          </div>
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {benefits.map((benefit) => {
            const Icon = benefit.icon;
            return (
              <div
                key={benefit.title}
                className="rounded-2xl border border-border bg-surface p-6 shadow-sm space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-lg font-bold text-primary">{benefit.title}</h3>
                  <p className="text-sm text-foreground-secondary leading-relaxed">
                    {benefit.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Onboarding Checklist */}
        <div className="rounded-3xl border border-border bg-surface p-8 md:p-12 space-y-6">
          <div className="max-w-xl space-y-2">
            <h2 className="text-2xl md:text-3xl font-bold text-primary">
              Simple 4-Step Verification
            </h2>
            <p className="text-sm text-foreground-secondary">
              Everything you need to complete onboarding and start receiving paid jobs.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4">
            {[
              { title: "1. Basic Details", desc: "Aadhaar Card, Mobile OTP & Trade Category" },
              { title: "2. Skill Assessment", desc: "Quick verification of experience and expertise" },
              { title: "3. Bank Verification", desc: "For direct instant daily earnings settlements" },
              { title: "4. Welcome Kit", desc: "Official badge, safety gear & app activation" },
            ].map((step) => (
              <div
                key={step.title}
                className="p-4 rounded-xl border border-border bg-muted/40 space-y-1.5"
              >
                <div className="flex items-center gap-2 text-accent font-bold text-sm">
                  <CheckCircle2 className="h-4 w-4" />
                  <span>{step.title}</span>
                </div>
                <p className="text-xs text-foreground-secondary">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
