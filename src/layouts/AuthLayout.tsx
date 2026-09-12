import { Outlet, Link } from "react-router";
import { Logo } from "@/components/shared/Logo";
import { NotificationToast } from "@/components/shared/NotificationToast";
import { NetworkStatusBanner } from "@/components/shared/NetworkStatusBanner";
import {
  ShieldCheck,
  Tag,
  Award,
  FileText,
  Clock,
  CreditCard,
  Zap,
} from "lucide-react";
import { ROUTES } from "@/constants/routes";

const TRUST_BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Verified Professionals",
    description: "Background-checked & skill-tested technicians",
  },
  {
    icon: Tag,
    title: "Transparent Pricing",
    description: "Upfront estimates with zero hidden charges",
  },
  {
    icon: Award,
    title: "Service Warranty",
    description: "Guaranteed warranty on eligible home services",
  },
  {
    icon: FileText,
    title: "Digital Invoices",
    description: "Itemized tax receipts for every completed booking",
  },
  {
    icon: Clock,
    title: "Live Booking Updates",
    description: "Step-by-step dispatch, arrival & progress tracking",
  },
  {
    icon: CreditCard,
    title: "Cashless Payment",
    description: "Convenient UPI, card, or post-service payment",
  },
];

/**
 * AuthLayout — Premium 42% / 58% Desktop Two-Column Brand & Auth Experience.
 * Strict adherence to Home-e-Fix brand palette:
 * Navy (#0B2341), Orange (#FF6A00), Background (#F8FAFC), Dark (#071525).
 * Completely eliminates fabricated statistics and unverified claims.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh bg-background dark:bg-[#071525] text-gray-900 dark:text-gray-100 selection:bg-orange-500 selection:text-white">
      <NetworkStatusBanner />

      {/* ─── LEFT BRAND & TRUST PANEL (Desktop 42%) ─── */}
      <div className="hidden lg:flex lg:w-[44%] xl:w-[42%] flex-col justify-between bg-primary text-white p-10 xl:p-14 relative overflow-hidden border-r border-white/10 shadow-2xl">
        {/* Subtle warm atmospheric lighting (Non-overwhelming, clean) */}
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-[#FF6A00]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        {/* Top: Logo with White Text variant for crisp legibility */}
        <div className="relative z-10">
          <Logo size="lg" linkToHome={true} textColor="light" />

          <div className="mt-8 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 border border-white/15 text-[#FF6A00] text-xs font-semibold tracking-wide">
              <span>Home-e-Fix Promise</span>
            </div>

            <h1 className="text-2xl xl:text-3xl font-extrabold text-white tracking-tight leading-snug">
              Your trusted partner for a better home.
            </h1>

            <p className="text-sm xl:text-base text-slate-300 font-normal leading-relaxed">
              Book verified professionals for repairs, maintenance, cleaning and more—with transparent pricing and dependable service.
            </p>
          </div>

          {/* Genuine Trust Benefit Cards */}
          <div className="mt-8 grid grid-cols-2 gap-3">
            {TRUST_BENEFITS.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="p-3.5 rounded-xl bg-white/6 border border-white/10 hover:bg-white/9 transition-colors"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className="w-4 h-4 text-[#FF6A00] shrink-0" />
                    <span className="text-xs font-bold text-white leading-none">
                      {b.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-tight">
                    {b.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Operational Emergency Note */}
          <div className="mt-5 p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center gap-2.5 text-xs text-orange-200">
            <Zap className="w-4 h-4 text-[#FF6A00] shrink-0" />
            <span>Emergency assistance available across operational service areas.</span>
          </div>
        </div>

        {/* Bottom: Legal Copyright */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex items-center justify-between text-xs text-slate-400">
          <span>&copy; {new Date().getFullYear()} Home-e-Fix Technologies India</span>
          <div className="flex items-center gap-3">
            <Link to={ROUTES.PRIVACY} className="hover:text-white transition-colors">
              Privacy
            </Link>
            <span>&bull;</span>
            <Link to={ROUTES.TERMS} className="hover:text-white transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </div>

      {/* ─── RIGHT AUTHENTICATION PANEL (Desktop 58%) ─── */}
      <div className="flex flex-1 flex-col justify-center items-center px-4 py-8 sm:px-8 lg:px-12 xl:px-16 overflow-y-auto">
        <div className="w-full max-w-135">
          {/* Mobile Header: Clean Home-e-Fix Logo */}
          <div className="mb-6 lg:hidden flex justify-center">
            <Logo size="md" linkToHome={true} textColor="auto" />
          </div>

          {/* Child Auth Page (Login, Register, ForgotPassword) */}
          <Outlet />

          {/* Mobile Compact Trust Badges */}
          <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 lg:hidden text-center">
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-3">
              The Home-e-Fix Guarantee
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-slate-600 dark:text-slate-300">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#FF6A00]" /> Verified Pros
              </span>
              <span className="flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-[#FF6A00]" /> Upfront Pricing
              </span>
              <span className="flex items-center gap-1">
                <Award className="w-3.5 h-3.5 text-[#FF6A00]" /> Service Warranty
              </span>
            </div>
            <div className="mt-4 text-[11px] text-slate-400 flex justify-center gap-3">
              <Link to={ROUTES.PRIVACY} className="hover:underline">Privacy</Link>
              <span>&bull;</span>
              <Link to={ROUTES.TERMS} className="hover:underline">Terms</Link>
              <span>&bull;</span>
              <Link to={ROUTES.SUPPORT} className="hover:underline">Help & Support</Link>
            </div>
          </div>
        </div>
      </div>

      <NotificationToast />
    </div>
  );
}
