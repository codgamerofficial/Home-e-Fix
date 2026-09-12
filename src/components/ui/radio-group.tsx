import * as React from "react";
import { cn } from "@/lib/utils";

interface RadioGroupContextValue {
  value?: string;
  name?: string;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

const RadioGroupContext = React.createContext<RadioGroupContextValue>({});

export interface RadioGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  value?: string;
  defaultValue?: string;
  name?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}

export function RadioGroup({
  value: controlledValue,
  defaultValue,
  name,
  onValueChange,
  disabled,
  className,
  children,
  ...props
}: RadioGroupProps) {
  const [uncontrolledValue, setUncontrolledValue] = React.useState(defaultValue);
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : uncontrolledValue;

  const handleChange = React.useCallback(
    (val: string) => {
      if (!isControlled) {
        setUncontrolledValue(val);
      }
      onValueChange?.(val);
    },
    [isControlled, onValueChange]
  );

  return (
    <RadioGroupContext.Provider
      value={{
        value: currentValue,
        name,
        onChange: handleChange,
        disabled,
      }}
    >
      <div
        role="radiogroup"
        className={cn("space-y-2", className)}
        {...props}
      >
        {children}
      </div>
    </RadioGroupContext.Provider>
  );
}

export interface RadioGroupItemProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type" | "onChange"> {
  value: string;
  label?: React.ReactNode;
  description?: string;
}

export const RadioGroupItem = React.forwardRef<HTMLInputElement, RadioGroupItemProps>(
  ({ className, value, label, description, id, disabled: itemDisabled, ...props }, ref) => {
    const context = React.useContext(RadioGroupContext);
    const generatedId = React.useId();
    const itemId = id || generatedId;

    const isChecked = context.value === value;
    const isDisabled = context.disabled || itemDisabled;

    return (
      <label
        htmlFor={itemId}
        className={cn(
          "flex items-start gap-3 rounded-xl border border-border bg-surface p-3.5 transition-all duration-200 cursor-pointer select-none",
          isChecked && "border-accent bg-accent/5 ring-1 ring-accent",
          isDisabled && "cursor-not-allowed opacity-50",
          className
        )}
      >
        <div className="relative flex items-center justify-center mt-0.5">
          <input
            type="radio"
            id={itemId}
            ref={ref}
            name={context.name}
            value={value}
            checked={isChecked}
            disabled={isDisabled}
            onChange={() => context.onChange?.(value)}
            className="sr-only"
            {...props}
          />
          <div
            className={cn(
              "h-4.5 w-4.5 rounded-full border-2 border-border bg-surface transition-all duration-200 flex items-center justify-center",
              isChecked && "border-accent"
            )}
          >
            {isChecked && (
              <div className="h-2 w-2 rounded-full bg-accent animate-scale-in" />
            )}
          </div>
        </div>

        {(label || description) && (
          <div className="space-y-0.5">
            {label && (
              <span className="text-sm font-semibold text-foreground block">
                {label}
              </span>
            )}
            {description && (
              <span className="text-xs text-foreground-secondary block">
                {description}
              </span>
            )}
          </div>
        )}
      </label>
    );
  }
);
RadioGroupItem.displayName = "RadioGroupItem";
