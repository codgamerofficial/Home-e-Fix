import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  value?: number; // 0 to 5
  max?: number;
  size?: "sm" | "md" | "lg";
  readOnly?: boolean;
  onChange?: (rating: number) => void;
  showValue?: boolean;
  reviewCount?: number;
  className?: string;
}

const sizeClasses = {
  sm: "h-3.5 w-3.5",
  md: "h-4 w-4",
  lg: "h-5 w-5",
};

export function Rating({
  value = 0,
  max = 5,
  size = "md",
  readOnly = true,
  onChange,
  showValue = false,
  reviewCount,
  className,
}: RatingProps) {
  const [hoverValue, setHoverValue] = React.useState<number | null>(null);

  const activeValue = hoverValue !== null ? hoverValue : value;

  const handleClick = (index: number) => {
    if (!readOnly && onChange) {
      onChange(index + 1);
    }
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5", className)}>
      <div className="flex items-center gap-0.5" role="img" aria-label={`Rating: ${value} out of ${max} stars`}>
        {Array.from({ length: max }).map((_, index) => {
          const starNumber = index + 1;
          const isFull = activeValue >= starNumber;
          const isHalf = !isFull && activeValue >= starNumber - 0.5;

          return (
            <button
              key={index}
              type="button"
              disabled={readOnly}
              onClick={() => handleClick(index)}
              onMouseEnter={() => !readOnly && setHoverValue(starNumber)}
              onMouseLeave={() => !readOnly && setHoverValue(null)}
              className={cn(
                "relative transition-transform duration-150 focus:outline-none",
                !readOnly && "cursor-pointer hover:scale-110"
              )}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  "transition-colors duration-150",
                  isFull
                    ? "fill-amber-400 text-amber-400"
                    : isHalf
                    ? "fill-amber-400/50 text-amber-400"
                    : "fill-muted/60 text-muted-foreground/30"
                )}
              />
            </button>
          );
        })}
      </div>

      {showValue && (
        <span className="font-medium text-foreground text-xs sm:text-sm">
          {value.toFixed(1)}
        </span>
      )}

      {reviewCount !== undefined && (
        <span className="text-xs text-foreground-muted">
          ({reviewCount.toLocaleString()})
        </span>
      )}
    </div>
  );
}
