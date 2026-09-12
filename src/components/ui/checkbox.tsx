import * as React from "react";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: React.ReactNode;
  description?: string;
  error?: string;
}

const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, description, error, id, checked, ...props }, ref) => {
    const generatedId = React.useId();
    const checkboxId = id || generatedId;

    return (
      <div className="space-y-1">
        <label
          htmlFor={checkboxId}
          className={cn(
            "inline-flex items-start gap-3 cursor-pointer select-none",
            props.disabled && "cursor-not-allowed opacity-50",
            className
          )}
        >
          <div className="relative flex items-center justify-center mt-0.5">
            <input
              type="checkbox"
              id={checkboxId}
              ref={ref}
              checked={checked}
              className="peer sr-only"
              {...props}
            />
            <div
              className={cn(
                "h-5 w-5 rounded-md border-2 border-border bg-surface transition-all duration-200",
                "peer-checked:bg-accent peer-checked:border-accent",
                "peer-focus-visible:ring-2 peer-focus-visible:ring-ring peer-focus-visible:ring-offset-2",
                error && "border-error"
              )}
            />
            <Check className="pointer-events-none absolute h-3.5 w-3.5 text-white opacity-0 transition-opacity duration-150 peer-checked:opacity-100 stroke-3" />
          </div>
          {(label || description) && (
            <div className="space-y-0.5">
              {label && (
                <span className="text-sm font-medium text-foreground block leading-snug">
                  {label}
                </span>
              )}
              {description && (
                <span className="text-xs text-foreground-muted block leading-relaxed">
                  {description}
                </span>
              )}
            </div>
          )}
        </label>
        {error && <p className="text-xs text-error pl-8">{error}</p>}
      </div>
    );
  }
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
