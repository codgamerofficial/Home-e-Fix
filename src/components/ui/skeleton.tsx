import * as React from "react";
import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "pulse" | "shimmer";
}

function Skeleton({ className, variant = "pulse", ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "rounded-xl bg-muted/70",
        variant === "pulse" ? "animate-pulse" : "shimmer",
        className
      )}
      {...props}
    />
  );
}

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn("rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-xs", className)}>
      <Skeleton className="h-6 w-1/3 rounded-md" />
      <Skeleton className="h-4 w-3/4 rounded-md" />
      <Skeleton className="h-24 w-full rounded-xl" />
      <div className="flex justify-between pt-2">
        <Skeleton className="h-8 w-20 rounded-lg" />
        <Skeleton className="h-8 w-24 rounded-lg" />
      </div>
    </div>
  );
}

function AvatarSkeleton({ size = "md", className }: { size?: "sm" | "md" | "lg"; className?: string }) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-14 w-14",
  };

  return <Skeleton className={cn("rounded-full shrink-0", sizeClasses[size], className)} />;
}

function TextSkeleton({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4 rounded-md",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

function TableRowSkeleton({ columns = 4 }: { columns?: number }) {
  return (
    <tr className="border-b border-border/60">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full rounded-md" />
        </td>
      ))}
    </tr>
  );
}

export { Skeleton, CardSkeleton, AvatarSkeleton, TextSkeleton, TableRowSkeleton };
