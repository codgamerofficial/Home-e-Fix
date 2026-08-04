import { motion } from "framer-motion";
import { Link } from "react-router";
import { ShieldCheck, Award, Users, Heart, Sparkles, CheckCircle2, ArrowRight, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ROUTES } from "@/constants/routes";
import { APP_CONFIG } from "@/constants/services";

export default function About() {
  return (
    <div className="space-y-16 py-8">
      {/* HERO SECTION */}
      <section className="relative overflow-hidden rounded-3xl gradient-hero text-white p-8 sm:p-14 shadow-2xl">
        <div className="max-w-3xl space-y-6 relative z-10">
          <Badge variant="accent" className="px-3 py-1 text-xs font-bold uppercase tracking-wider bg-white/20 text-white">
            ✨ Our Story & Mission
          </Badge>

          <h1 className="font-heading text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Fixing Homes. <span className="gradient-text font-black">Earning Trust.</span>
          </h1>

          <p className="text-base sm:text-lg text-white/90 leading-relaxed">
            Home-e-Fix was founded with a singular mission: to make home repairs, maintenance, and improvements effortless, transparent, and completely reliable for every household in India.
          </p>

          <div className="flex flex-wrap gap-4 pt-4">
            <Link to={ROUTES.SERVICES}>
              <Button variant="accent" size="lg" className="font-bold shadow-glow" rightIcon={<ArrowRight className="h-5 w-5" />}>
                Explore Our Services
              </Button>
            </Link>
            <Link to={ROUTES.CONTACT}>
              <Button variant="outline" size="lg" className="text-white border-white/40 hover:bg-white/10">
                Contact Our Team
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* LIVE STATS RIBBON */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Happy Households", value: "50,000+" },
          { label: "Verified Professionals", value: "1,200+" },
          { label: "Average Star Rating", value: "4.9 ★" },
          { label: "On-Time Arrival Rate", value: "99.4%" },
        ].map((stat, idx) => (
          <Card key={idx} className="p-6 text-center border border-border space-y-1 shadow-sm hover:border-accent">
            <div className="font-heading text-3xl sm:text-4xl font-extrabold text-accent">{stat.value}</div>
            <div className="text-xs sm:text-sm font-semibold text-foreground-secondary">{stat.label}</div>
          </Card>
        ))}
      </section>

      {/* 4 PILLARS OF HOME-E-FIX */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <Badge variant="accent" className="px-3 py-1 text-xs">Why We Are Different</Badge>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-primary">
            The Home-e-Fix Promise
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Built on non-negotiable standards of quality, safety, and customer delight
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: ShieldCheck,
              title: "100% Background Verified",
              desc: "Every technician undergoes rigorous Aadhaar verification, police clearance, and technical skill testing.",
            },
            {
              icon: Award,
              title: "Upfront Honest Pricing",
              desc: "No hidden charges or unexpected surprise bills. Clear itemized pricing shared before work begins.",
            },
            {
              icon: Sparkles,
              title: "30-Day Service Guarantee",
              desc: "Complete peace of mind. If anything goes wrong within 30 days of service, we revisit and fix it for free.",
            },
            {
              icon: Heart,
              title: "30-Min Express Dispatch",
              desc: "Urgent leaks or electrical trips? Our nearest verified professional arrives at your doorstep in under 30 mins.",
            },
          ].map((pillar, idx) => (
            <Card key={idx} className="p-6 border border-border space-y-3 shadow-xs hover:shadow-md transition-all">
              <div className="h-12 w-12 rounded-2xl bg-accent/10 flex items-center justify-center text-accent">
                <pillar.icon className="h-6 w-6" />
              </div>
              <h3 className="font-heading text-base font-bold text-primary">{pillar.title}</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">{pillar.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* LEADERSHIP SHOWCASE */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-primary">
            Meet the Founders & Leadership
          </h2>
          <p className="text-xs sm:text-sm text-foreground-secondary">
            Passionate innovators transforming the home services ecosystem
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              name: "Vikram Malhotra",
              role: "Co-Founder & CEO",
              avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&q=80",
              bio: "Ex-Google Product Lead with 12+ years building consumer tech platforms.",
            },
            {
              name: "Ananya Rao",
              role: "Co-Founder & COO",
              avatar: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&q=80",
              bio: "Operations strategist formerly heading nationwide logistics networks.",
            },
            {
              name: "Rajesh Kumar",
              role: "VP of Quality & Training",
              avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&q=80",
              bio: "Master technician with 20+ years training tradesmen across India.",
            },
          ].map((leader, idx) => (
            <Card key={idx} className="p-6 text-center space-y-3 border border-border shadow-xs hover:border-accent">
              <div className="h-24 w-24 rounded-full overflow-hidden mx-auto border-2 border-accent shadow-md">
                <img src={leader.avatar} alt={leader.name} className="h-full w-full object-cover" />
              </div>
              <div>
                <h4 className="font-heading text-base font-bold text-primary">{leader.name}</h4>
                <span className="text-xs font-semibold text-accent block">{leader.role}</span>
              </div>
              <p className="text-xs text-foreground-secondary">{leader.bio}</p>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
