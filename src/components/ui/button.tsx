import * as React from "react";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

/* ─── Variants ─── */

export type ButtonVariant =
  | "default"
  | "destructive"
  | "outline"
  | "secondary"
  | "ghost"
  | "link"
  | "accent";

export type ButtonSize = "sm" | "default" | "lg" | "icon";

const variantClasses: Record<ButtonVariant, string> = {
  default:
    "bg-primary text-white shadow-sm hover:bg-primary-light active:bg-primary-dark",
  destructive:
    "bg-error text-white shadow-sm hover:bg-error/90 active:bg-error/80",
  outline:
    "border border-border bg-surface text-foreground shadow-xs hover:bg-muted active:bg-muted/80",
  secondary:
    "bg-muted text-foreground shadow-xs hover:bg-muted/80 active:bg-muted/60",
  ghost:
    "text-foreground hover:bg-muted active:bg-muted/80",
  link:
    "text-accent underline-offset-4 hover:underline",
  accent:
    "bg-accent text-white shadow-sm hover:bg-accent-dark active:bg-accent-dark/90",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 rounded-md px-3 text-xs gap-1.5",
  default: "h-10 rounded-lg px-5 text-sm gap-2",
  lg: "h-12 rounded-lg px-8 text-base gap-2.5",
  icon: "h-10 w-10 rounded-lg",
};

/* ─── Props ─── */

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  asChild?: boolean;
}

/* ─── Component ─── */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "default",
      size = "default",
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          // Base styles
          "inline-flex items-center justify-center whitespace-nowrap font-medium",
          "transition-all duration-200 ease-smooth",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:pointer-events-none disabled:opacity-50",
          "cursor-pointer",
          // Variant & size
          variantClasses[variant],
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {isLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : leftIcon ? (
          <span className="shrink-0">{leftIcon}</span>
        ) : null}
        {children}
        {rightIcon && !isLoading && (
          <span className="shrink-0">{rightIcon}</span>
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
