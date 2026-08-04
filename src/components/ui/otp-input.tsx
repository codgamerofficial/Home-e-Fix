import * as React from "react";
import { cn } from "@/lib/utils";

export interface OtpInputProps {
  length?: number;
  value?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  disabled?: boolean;
  error?: string;
  autoFocus?: boolean;
  className?: string;
}

export function OtpInput({
  length = 6,
  value = "",
  onChange,
  onComplete,
  disabled = false,
  error,
  autoFocus = true,
  className,
}: OtpInputProps) {
  const [otp, setOtp] = React.useState<string[]>(() => {
    const initial = value.split("").slice(0, length);
    return Array.from({ length }, (_, i) => initial[i] || "");
  });

  const inputRefs = React.useRef<(HTMLInputElement | null)[]>([]);

  React.useEffect(() => {
    const updated = value.split("").slice(0, length);
    setOtp(Array.from({ length }, (_, i) => updated[i] || ""));
  }, [value, length]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    index: number
  ) => {
    const val = e.target.value;
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    // Use last entered char
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    const combined = newOtp.join("");
    onChange?.(combined);

    if (combined.length === length && newOtp.every((char) => char !== "")) {
      onComplete?.(combined);
    }

    // Auto-advance to next input
    if (val && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d+$/.test(pastedData)) return;

    const pastedChars = pastedData.slice(0, length).split("");
    const newOtp = Array.from({ length }, (_, i) => pastedChars[i] || "");
    setOtp(newOtp);

    const combined = newOtp.join("");
    onChange?.(combined);

    if (combined.length === length && newOtp.every((char) => char !== "")) {
      onComplete?.(combined);
    }

    // Focus last filled or next empty input
    const focusIndex = Math.min(pastedChars.length, length - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  return (
    <div className="space-y-2">
      <div
        className={cn("flex items-center justify-center gap-2 sm:gap-3", className)}
      >
        {Array.from({ length }).map((_, index) => (
          <input
            key={index}
            ref={(el) => {
              inputRefs.current[index] = el;
            }}
            type="text"
            inputMode="numeric"
            pattern="\d*"
            maxLength={1}
            value={otp[index]}
            disabled={disabled}
            autoFocus={autoFocus && index === 0}
            onChange={(e) => handleChange(e, index)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            onPaste={handlePaste}
            className={cn(
              "h-12 w-10 sm:h-14 sm:w-12 rounded-xl border bg-surface text-center font-heading text-xl font-bold text-foreground",
              "transition-all duration-200 shadow-xs",
              "focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/20",
              "disabled:cursor-not-allowed disabled:opacity-50",
              error
                ? "border-error focus:ring-error/20"
                : otp[index]
                ? "border-accent bg-accent/5"
                : "border-border hover:border-foreground-muted"
            )}
            aria-label={`Digit ${index + 1} of ${length}`}
          />
        ))}
      </div>
      {error && (
        <p className="text-center text-xs text-error font-medium">{error}</p>
      )}
    </div>
  );
}
