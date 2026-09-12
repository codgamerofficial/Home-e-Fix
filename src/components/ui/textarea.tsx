import * as React from "react";
import { cn } from "@/lib/utils";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  helperText?: string;
  error?: string;
  maxCharacters?: number;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      className,
      label,
      helperText,
      error,
      id,
      value,
      maxCharacters,
      rows = 4,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const textareaId = id || generatedId;
    const currentLength = typeof value === "string" ? value.length : 0;

    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label
            htmlFor={textareaId}
            className="text-sm font-medium text-foreground block"
          >
            {label}
          </label>
        )}
        <div className="relative w-full">
          <textarea
            id={textareaId}
            ref={ref}
            rows={rows}
            value={value}
            maxLength={maxCharacters}
            className={cn(
              "flex w-full rounded-xl border bg-surface p-3 text-sm font-body font-medium",
              "text-foreground placeholder:text-muted-foreground",
              "transition-colors duration-200 resize-y",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-1",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-error focus:ring-error"
                : "border-border hover:border-foreground-muted",
              className
            )}
            {...props}
          />
        </div>
        <div className="flex items-center justify-between text-xs">
          {error ? (
            <p className="text-error font-medium">{error}</p>
          ) : helperText ? (
            <p className="text-foreground-muted">{helperText}</p>
          ) : (
            <span />
          )}
          {maxCharacters && (
            <span className="text-foreground-muted text-[11px] font-mono">
              {currentLength}/{maxCharacters}
            </span>
          )}
        </div>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
