import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";
import { Sparkles, Wrench, ShieldCheck, Zap } from "lucide-react";

interface LogoProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "full" | "icon";
  className?: string;
  linkToHome?: boolean;
  textColor?: "auto" | "light" | "dark";
  animated?: boolean;
}

const sizeConfig = {
  sm: { icon: "h-8 w-8", text: "text-lg", tagline: "text-[9px]", badge: "px-2.5 py-1 text-[11px]" },
  md: { icon: "h-10 w-10", text: "text-xl", tagline: "text-[10px]", badge: "px-3.5 py-1.5 text-xs" },
  lg: { icon: "h-12 w-12", text: "text-2xl", tagline: "text-[11px]", badge: "px-4 py-2 text-sm" },
  xl: { icon: "h-16 w-16", text: "text-4xl", tagline: "text-xs", badge: "px-5 py-2.5 text-base" },
};

export function Logo({
  size = "md",
  variant = "full",
  className,
  linkToHome = true,
  textColor = "auto",
}: LogoProps) {
  const config = sizeConfig[size];

  const mainTextColor =
    textColor === "light"
      ? "text-white"
      : textColor === "dark"
      ? "text-slate-900"
      : "text-white dark:text-white";

  const taglineColor =
    textColor === "light"
      ? "text-white/80"
      : textColor === "dark"
      ? "text-slate-600"
      : "text-white/70 dark:text-slate-300";

  const logoContent = (
    <div className={cn("flex items-center gap-2.5 group select-none relative", className)}>
      {/* Iconic Circular Orange Badge with White House Contour */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-full shrink-0",
          "bg-[#FF5500] shadow-md shadow-orange-500/20",
          "group-hover:scale-105 transition-transform duration-200",
          config.icon
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[58%] w-[58%]"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* Clean Solid Text Branding */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading font-extrabold tracking-tight text-white",
              config.text,
              mainTextColor
            )}
          >
            Home-e-Fix
          </span>

          {size !== "sm" && (
            <span
              className={cn(
                "mt-1 font-bold uppercase tracking-[0.16em]",
                config.tagline,
                taglineColor
              )}
            >
              FIXING HOMES. EARNING TRUST.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to={ROUTES.HOME} className="focus:outline-hidden inline-block group">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}

/**
 * Catchy, Unique 3D Glassmorphic Pill Badge with Animated Logo
 */
export function LogoBadge({
  text = "✨ Kolkata's #1 Rated Home Services Platform",
  className,
}: {
  text?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-2.5 rounded-full border border-white/20",
        "bg-slate-900/60 backdrop-blur-xl px-4 py-1.5 text-white shadow-xl shadow-orange-500/10",
        "hover:border-accent/60 hover:bg-slate-900/80 transition-all duration-300 group cursor-pointer",
        className
      )}
    >
      {/* Animated Mini Emblem */}
      <div className="relative flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 shadow-md group-hover:scale-110 transition-transform">
        <Zap className="h-3.5 w-3.5 text-white fill-white animate-pulse" />
      </div>

      <span className="text-xs sm:text-sm font-semibold tracking-wide text-white/95 group-hover:text-white transition-colors">
        {text}
      </span>

      <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping shrink-0 ml-0.5" />
    </div>
  );
}

