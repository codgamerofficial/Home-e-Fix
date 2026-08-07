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
  animated = true,
}: LogoProps) {
  const config = sizeConfig[size];

  const mainTextColor =
    textColor === "light"
      ? "text-white"
      : textColor === "dark"
      ? "text-slate-900"
      : "text-slate-900 dark:text-white";

  const taglineColor =
    textColor === "light"
      ? "text-white/80"
      : textColor === "dark"
      ? "text-slate-600"
      : "text-slate-600 dark:text-slate-300";

  const logoContent = (
    <div className={cn("flex items-center gap-3 group select-none relative", className)}>
      {/* Dynamic Emblem Logo Mark */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Outer Rotating Electric Glow Halo */}
        {animated && (
          <div className="absolute -inset-1 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 opacity-70 blur-xs group-hover:opacity-100 group-hover:blur-md transition-all duration-500 animate-pulse" />
        )}

        {/* Core Icon Container */}
        <div
          className={cn(
            "relative flex items-center justify-center rounded-2xl",
            "bg-gradient-to-br from-[#FF7A00] via-[#FF5500] to-[#CC3700]",
            "border border-white/30 shadow-lg shadow-orange-500/25",
            "group-hover:scale-105 group-hover:rotate-1 transition-all duration-300",
            config.icon
          )}
        >
          {/* Custom Unique House + Wrench + Spark Emblem SVG */}
          <svg
            viewBox="0 0 32 32"
            fill="none"
            className="h-[68%] w-[68%] drop-shadow-md"
            xmlns="http://www.w3.org/2000/svg"
          >
            {/* Roof Top */}
            <path
              d="M16 3L3 14H7V27C7 28.1 7.9 29 9 29H23C24.1 29 25 28.1 25 27V14H29L16 3Z"
              fill="white"
              fillOpacity="0.95"
            />
            {/* Wrench Cutout inside House */}
            <path
              d="M16 11C14.34 11 13 12.34 13 14C13 15.1 13.6 16.05 14.5 16.55V23C14.5 23.83 15.17 24.5 16 24.5C16.83 24.5 17.5 23.83 17.5 23V16.55C18.4 16.05 19 15.1 19 14C19 12.34 17.66 11 16 11ZM16 15C15.45 15 15 14.55 15 14C15 13.45 15.45 13 16 13C16.55 13 17 13.45 17 14C17 14.55 16.55 15 16 15Z"
              fill="#FF5500"
            />
            {/* Electric Spark Accent */}
            <path
              d="M21 7L18.5 11H21.5L19 15L23.5 9.5H20.5L21 7Z"
              fill="#FFD700"
            />
          </svg>

          {/* Mini Live Status Pulse Dot */}
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500 border-2 border-slate-900" />
          </span>
        </div>
      </div>

      {/* Text Branding */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading font-extrabold tracking-tight flex items-center gap-0.5",
              config.text,
              mainTextColor
            )}
          >
            <span>Home</span>
            <span className="text-accent/80 font-semibold">-e-</span>
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-orange-500 via-amber-400 to-orange-600 font-black drop-shadow-xs">
              Fix
            </span>
          </span>

          {size !== "sm" && (
            <span
              className={cn(
                "mt-1 font-bold uppercase tracking-[0.2em] flex items-center gap-1",
                config.tagline,
                taglineColor
              )}
            >
              <span>FIXING HOMES</span>
              <span className="h-1 w-1 rounded-full bg-accent inline-block" />
              <span className="text-accent font-extrabold">EARNING TRUST</span>
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

