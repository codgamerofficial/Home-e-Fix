import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: React.ReactNode;
  description?: string;
  size?: "sm" | "md";
  className?: string;
  id?: string;
}

const sizeConfig = {
  sm: {
    track: "w-8 h-4.5",
    thumb: "h-3.5 w-3.5",
    translate: "translate-x-3.5",
  },
  md: {
    track: "w-11 h-6",
    thumb: "h-5 w-5",
    translate: "translate-x-5",
  },
};

export function Switch({
  checked,
  onCheckedChange,
  disabled = false,
  label,
  description,
  size = "md",
  className,
  id,
}: SwitchProps) {
  const generatedId = React.useId();
  const switchId = id || generatedId;
  const config = sizeConfig[size];

  return (
    <div className={cn("inline-flex items-center justify-between gap-4", className)}>
      {(label || description) && (
        <label
          htmlFor={switchId}
          className={cn(
            "space-y-0.5 cursor-pointer select-none",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          {label && (
            <span className="text-sm font-medium text-foreground block">
              {label}
            </span>
          )}
          {description && (
            <span className="text-xs text-foreground-muted block">
              {description}
            </span>
          )}
        </label>
      )}

      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onCheckedChange(!checked)}
        className={cn(
          "relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-smooth",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-50",
          checked ? "bg-accent shadow-glow" : "bg-muted",
          config.track
        )}
      >
        <span
          className={cn(
            "pointer-events-none block rounded-full bg-white shadow-md transition-transform duration-200 ease-smooth",
            config.thumb,
            checked ? config.translate : "translate-x-0"
          )}
        />
      </button>
    </div>
  );
}
