import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
  linkToHome?: boolean;
  textColor?: "auto" | "light" | "dark";
}

const sizeConfig = {
  sm: { icon: "h-8 w-8", text: "text-lg", tagline: "text-[9px]" },
  md: { icon: "h-10 w-10", text: "text-xl", tagline: "text-[10px]" },
  lg: { icon: "h-12 w-12", text: "text-2xl", tagline: "text-[11px]" },
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
      : "text-foreground dark:text-white";

  const taglineColor =
    textColor === "light"
      ? "text-white/80"
      : textColor === "dark"
      ? "text-slate-600"
      : "text-foreground-secondary dark:text-slate-300";

  const logoContent = (
    <div className={cn("flex items-center gap-2.5 group select-none", className)}>
      {/* Icon Mark - Orange Circle with House Icon */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-2xl",
          "bg-accent hover:bg-accent-dark transition-all duration-300",
          "shadow-md group-hover:shadow-glow-orange group-hover:scale-105 shrink-0",
          config.icon
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[62%] w-[62%]"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* Text Branding */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading font-extrabold tracking-tight",
              config.text,
              mainTextColor
            )}
          >
            Home-e-<span className="text-accent font-black">Fix</span>
          </span>
          {size !== "sm" && (
            <span
              className={cn(
                "mt-1 font-bold uppercase tracking-[0.18em]",
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
      <Link to={ROUTES.HOME} className="focus:outline-hidden inline-block">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
