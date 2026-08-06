import * as React from "react";
import { cn, getInitials } from "@/lib/utils";

/* ─── Avatar ─── */

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  size?: "sm" | "md" | "lg" | "xl";
}

const sizeClasses = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-12 w-12 text-base",
  xl: "h-16 w-16 text-lg",
};

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, size = "md", ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full",
        "bg-muted",
        sizeClasses[size],
        className
      )}
      {...props}
    />
  )
);
Avatar.displayName = "Avatar";

/* ─── AvatarImage ─── */

export interface AvatarImageProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {}

const AvatarImage = React.forwardRef<HTMLImageElement, AvatarImageProps>(
  ({ className, alt, ...props }, ref) => (
    <img
      ref={ref}
      alt={alt}
      className={cn(
        "aspect-square h-full w-full object-cover",
        className
      )}
      {...props}
    />
  )
);
AvatarImage.displayName = "AvatarImage";

/* ─── AvatarFallback ─── */

export interface AvatarFallbackProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  name?: string;
}

const AvatarFallback = React.forwardRef<HTMLSpanElement, AvatarFallbackProps>(
  ({ className, name, children, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "flex h-full w-full items-center justify-center rounded-full",
        "bg-accent font-bold text-white shadow-xs",
        className
      )}
      {...props}
    >
      {children || (name ? getInitials(name) : "?")}
    </span>
  )
);
AvatarFallback.displayName = "AvatarFallback";

export { Avatar, AvatarImage, AvatarFallback };
