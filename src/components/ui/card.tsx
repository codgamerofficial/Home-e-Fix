import * as React from "react";
import { cn } from "@/lib/utils";

/* ─── Card Props ─── */
export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "outline" | "elevated" | "accent";
  radius?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
  hover?: boolean;
  interactive?: boolean;
}

const variantStyles: Record<NonNullable<CardProps["variant"]>, string> = {
  default: "border border-border bg-surface shadow-card",
  glass: "liquid-glass shadow-lg border border-white/20 dark:border-white/10 text-foreground",
  outline: "border-2 border-border bg-transparent shadow-none",
  elevated: "border border-border/80 bg-surface shadow-md hover:shadow-lg",
  accent: "border border-accent/30 bg-accent/5 text-foreground shadow-sm",
};

const radiusStyles: Record<NonNullable<CardProps["radius"]>, string> = {
  sm: "rounded-lg",
  md: "rounded-xl",
  lg: "rounded-2xl",
  xl: "rounded-3xl",
  "2xl": "rounded-[28px]",
  full: "rounded-full",
};

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      className,
      variant = "default",
      radius = "lg",
      hover = false,
      interactive = false,
      ...props
    },
    ref
  ) => (
    <div
      ref={ref}
      className={cn(
        "relative text-foreground transition-all duration-300 ease-smooth",
        variantStyles[variant],
        radiusStyles[radius],
        (hover || interactive) &&
          "hover:shadow-card-hover hover:-translate-y-1 cursor-pointer active:scale-[0.99]",
        className
      )}
      {...props}
    />
  )
);
Card.displayName = "Card";

/* ─── CardHeader ─── */
const CardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
));
CardHeader.displayName = "CardHeader";

/* ─── CardTitle ─── */
const CardTitle = React.forwardRef<
  HTMLHeadingElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "font-heading text-lg md:text-xl font-bold leading-snug tracking-tight text-primary",
      className
    )}
    {...props}
  />
));
CardTitle.displayName = "CardTitle";

/* ─── CardDescription ─── */
const CardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-foreground-secondary leading-relaxed", className)}
    {...props}
  />
));
CardDescription.displayName = "CardDescription";

/* ─── CardContent ─── */
const CardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
));
CardContent.displayName = "CardContent";

/* ─── CardFooter ─── */
const CardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0 border-t border-border/50 mt-4", className)}
    {...props}
  />
));
CardFooter.displayName = "CardFooter";

export { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter };
