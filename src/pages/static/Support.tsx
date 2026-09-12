import { Link } from "react-router";
import { Headphones, Phone, Mail, MessageSquare, HelpCircle, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import { CONTACT_INFO } from "@/config";

export default function Support() {
  const categories = [
    {
      title: "Booking & Scheduling",
      description: "How to reschedule, change address, or cancel an active service request.",
      icon: HelpCircle,
    },
    {
      title: "Pricing & Invoices",
      description: "Understanding labour rates, material procurement, and downloading tax receipts.",
      icon: FileText,
    },
    {
      title: "Home-e-Fix Warranty",
      description: "How to claim your 30-day rework warranty on completed jobs.",
      icon: MessageSquare,
    },
    {
      title: "Technician Dispatch",
      description: "Live tracking, OTP arrival verification, and pro background checks.",
      icon: Headphones,
    },
  ];

  return (
    <div className="py-12 md:py-20">
      <div className="container-app space-y-16">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/10 border border-accent/20 text-accent text-xs font-bold uppercase tracking-wider">
            24/7 Assistance
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold text-primary tracking-tight">
            How can we <span className="text-accent">help you</span> today?
          </h1>
          <p className="text-foreground-secondary text-base md:text-lg">
            Search our knowledge base or get in touch directly with our dedicated customer support team.
          </p>
        </div>

        {/* Contact Channels */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <a
            href={`tel:${CONTACT_INFO.phone}`}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all text-center space-y-3 block group"
          >
            <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Phone className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-primary">Call Helpline</h3>
            <p className="text-xs text-foreground-secondary">{CONTACT_INFO.phone}</p>
            <span className="text-xs font-semibold text-accent block">7 AM – 11 PM Everyday</span>
          </a>

          <a
            href={`mailto:${CONTACT_INFO.email}`}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all text-center space-y-3 block group"
          >
            <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <Mail className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-primary">Email Support</h3>
            <p className="text-xs text-foreground-secondary">{CONTACT_INFO.email}</p>
            <span className="text-xs font-semibold text-accent block">Response within 2 hours</span>
          </a>

          <Link
            to={ROUTES.APP_SUPPORT}
            className="rounded-2xl border border-border bg-surface p-6 shadow-sm hover:shadow-md hover:border-accent/40 transition-all text-center space-y-3 block group"
          >
            <div className="h-12 w-12 rounded-xl bg-accent/10 text-accent flex items-center justify-center mx-auto group-hover:scale-105 transition-transform">
              <MessageSquare className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-lg text-primary">Raise a Ticket</h3>
            <p className="text-xs text-foreground-secondary">Track resolution in real time</p>
            <span className="text-xs font-semibold text-accent block">Customer Portal →</span>
          </Link>
        </div>

        {/* FAQs Categories */}
        <div className="space-y-6">
          <h2 className="text-2xl font-bold text-primary text-center">Frequently Explored Topics</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-4xl mx-auto">
            {categories.map((cat) => {
              const Icon = cat.icon;
              return (
                <div
                  key={cat.title}
                  className="p-5 rounded-xl border border-border bg-surface flex items-start gap-4"
                >
                  <div className="h-10 w-10 rounded-lg bg-accent/10 text-accent flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-primary">{cat.title}</h4>
                    <p className="text-xs text-foreground-secondary mt-1">{cat.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
