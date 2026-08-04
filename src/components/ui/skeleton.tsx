import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Whether to use pulse animation (default) or shimmer effect.
   */
  variant?: "pulse" | "shimmer";
}

function Skeleton({ className, variant = "pulse", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-lg bg-muted",
        variant === "pulse" ? "animate-pulse" : "shimmer",
        className
      )}
      {...props}
    />
  );
}

export { Skeleton };
