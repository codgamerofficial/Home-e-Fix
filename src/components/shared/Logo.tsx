import { Link } from "react-router";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
  linkToHome?: boolean;
}

const sizeConfig = {
  sm: { icon: "h-7 w-7", text: "text-lg" },
  md: { icon: "h-9 w-9", text: "text-xl" },
  lg: { icon: "h-12 w-12", text: "text-2xl" },
};

export function Logo({
  size = "md",
  variant = "full",
  className,
  linkToHome = true,
}: LogoProps) {
  const config = sizeConfig[size];

  const logoContent = (
    <div className={cn("flex items-center gap-2", className)}>
      {/* Icon Mark */}
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl",
          "bg-linear-to-br from-accent to-accent-dark",
          "shadow-md",
          config.icon
        )}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          className="h-[60%] w-[60%]"
          stroke="white"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          <polyline points="9 22 9 12 15 12 15 22" />
        </svg>
      </div>

      {/* Text */}
      {variant === "full" && (
        <div className="flex flex-col leading-none">
          <span
            className={cn(
              "font-heading font-bold tracking-tight",
              config.text
            )}
          >
            <span className="text-foreground dark:text-white">Home-e-</span>
            <span className="text-accent font-extrabold">Fix</span>
          </span>
          {size !== "sm" && (
            <span className="text-[0.6rem] font-bold uppercase tracking-[0.15em] text-foreground-secondary dark:text-foreground-muted">
              Fixing Homes. Earning Trust.
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (linkToHome) {
    return (
      <Link to={ROUTES.HOME} className="focus:outline-none">
        {logoContent}
      </Link>
    );
  }

  return logoContent;
}
