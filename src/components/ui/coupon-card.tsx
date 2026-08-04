import React from "react";
import { Tag, Check, Copy } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface CouponCardProps {
  code: string;
  title: string;
  description: string;
  discountAmount?: number;
  discountPercentage?: number;
  minOrderAmount?: number;
  expiresAt?: string;
  applied?: boolean;
  onApply?: (code: string) => void;
  onRemove?: (code: string) => void;
  className?: string;
}

export function CouponCard({
  code = "FIXHOME20",
  title = "20% OFF on Plumbing & AC Repair",
  description = "Valid on orders above ₹499. Max discount ₹150.",
  discountPercentage = 20,
  minOrderAmount = 499,
  applied = false,
  onApply,
  onRemove,
  className,
}: CouponCardProps) {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card
      className={cn(
        "relative overflow-hidden border border-dashed transition-all duration-200",
        applied
          ? "border-accent bg-accent/5 ring-1 ring-accent"
          : "border-border bg-surface hover:border-foreground-muted",
        className
      )}
    >
      {/* Decorative Ticket Notches */}
      <div className="absolute -left-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background border-r border-border" />
      <div className="absolute -right-3 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-background border-l border-border" />

      <CardContent className="p-5 pl-6 pr-6 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-heading text-xs font-bold text-accent tracking-widest uppercase bg-accent/10 px-2.5 py-1 rounded-md border border-accent/20">
                {code}
              </span>
              <button
                type="button"
                onClick={handleCopy}
                className="text-foreground-muted hover:text-foreground p-1 transition-colors cursor-pointer"
                title="Copy code"
              >
                {copied ? <Check className="h-3.5 w-3.5 text-success" /> : <Copy className="h-3.5 w-3.5" />}
              </button>
            </div>
            <h4 className="font-heading text-sm font-semibold text-primary pt-1">
              {title}
            </h4>
          </div>

          <Tag className="h-5 w-5 text-accent shrink-0" />
        </div>

        <p className="text-xs text-foreground-secondary leading-relaxed">
          {description}
        </p>

        {/* Footer Action */}
        <div className="flex items-center justify-between pt-2 border-t border-border/50 text-xs">
          {minOrderAmount && (
            <span className="text-foreground-muted">
              Min. Order: {formatCurrency(minOrderAmount)}
            </span>
          )}

          {applied ? (
            <Button
              size="sm"
              variant="outline"
              className="text-xs h-7 text-error border-error/30 hover:bg-error-light"
              onClick={() => onRemove?.(code)}
            >
              Remove
            </Button>
          ) : (
            <Button
              size="sm"
              variant="accent"
              className="text-xs h-7"
              onClick={() => onApply?.(code)}
            >
              Apply Code
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
