import { Outlet } from "react-router";
import { Logo } from "@/components/shared/Logo";
import { NotificationToast } from "@/components/shared/NotificationToast";

/**
 * Auth layout — centered card with brand styling.
 * Used for Login, Register, Forgot Password pages.
 */
export function AuthLayout() {
  return (
    <div className="flex min-h-dvh">
      {/* Left: Brand Panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center bg-radial from-[#07172E] via-primary-dark to-[#030914] relative overflow-hidden p-12 border-r border-white/10">
        {/* Decorative ambient lighting */}
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-blue-500/20 blur-3xl" />

        <div className="relative z-10 max-w-lg text-center space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-accent/15 border border-accent/30 text-accent text-xs font-bold shadow-md">
            <span>✨ India's #1 Doorstep Home Services</span>
          </div>

          <Logo size="lg" linkToHome={false} />

          <p className="text-base sm:text-lg text-white/90 font-medium leading-relaxed">
            Your trusted partner for 50+ professional home services. 
            Background-verified technicians, transparent upfront pricing, and guaranteed satisfaction.
          </p>

          {/* Feature Badge Cards */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
              <span className="text-accent font-bold text-sm block">🛡️ 30-Day Warranty</span>
              <span className="text-[11px] text-white/70">Free re-visit if not satisfied</span>
            </div>
            <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 text-left backdrop-blur-md">
              <span className="text-accent font-bold text-sm block">⚡ 60-Min Dispatch</span>
              <span className="text-[11px] text-white/70">Express doorstep assistance</span>
            </div>
          </div>

          {/* Stats */}
          <div className="pt-6 flex items-center justify-around border-t border-white/10">
            {[
              { value: "100K+", label: "Happy Customers" },
              { value: "500+", label: "Verified Pros" },
              { value: "4.9 ★", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-extrabold text-white tracking-wide">
                  {stat.value}
                </div>
                <div className="text-xs font-semibold text-accent mt-0.5">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form Area */}
      <div className="flex flex-1 flex-col items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="mb-8 lg:hidden">
            <Logo size="lg" />
          </div>

          <Outlet />
        </div>
      </div>

      <NotificationToast />
    </div>
  );
}
