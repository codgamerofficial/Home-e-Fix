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
      <div className="hidden lg:flex lg:w-1/2 flex-col items-center justify-center gradient-hero relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-accent blur-3xl" />
          <div className="absolute -bottom-20 -left-20 h-80 w-80 rounded-full bg-accent/50 blur-3xl" />
        </div>

        <div className="relative z-10 px-12 text-center">
          <Logo size="lg" linkToHome={false} />
          <p className="mt-6 max-w-md text-lg text-white/70 leading-relaxed">
            Your trusted partner for professional home services. 
            Verified technicians, transparent pricing, guaranteed satisfaction.
          </p>

          {/* Stats */}
          <div className="mt-10 flex items-center justify-center gap-8">
            {[
              { value: "10K+", label: "Happy Customers" },
              { value: "500+", label: "Verified Pros" },
              { value: "4.8", label: "Avg Rating" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-2xl font-bold text-accent">
                  {stat.value}
                </div>
                <div className="text-xs text-white/50">{stat.label}</div>
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
