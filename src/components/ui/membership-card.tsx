import { Crown, Check, Sparkles, ArrowRight } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export interface MembershipCardProps {
  planName?: string;
  price?: number;
  savingsTotal?: number;
  perks?: string[];
  isSubscribed?: boolean;
  onSubscribe?: () => void;
  className?: string;
}

export function MembershipCard({
  planName = "Home-e-Fix VIP Pass",
  price = 299,
  savingsTotal = 1450,
  perks = [
    "15% Extra OFF on all home services",
    "Free inspection & zero visit charges",
    "Priority booking & dedicated technician",
    "Free 30-day post-service warranty cover",
  ],
  isSubscribed = false,
  onSubscribe,
  className,
}: MembershipCardProps) {
  return (
    <Card
      className={cn(
        "relative overflow-hidden text-white border-0 shadow-xl",
        "bg-linear-to-br from-primary via-primary-light to-primary-dark",
        className
      )}
    >
      {/* Decorative Glow */}
      <div className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent/20 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-accent/10 blur-3xl pointer-events-none" />

      <CardContent className="p-6 space-y-5 relative z-10">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-glow">
              <Crown className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-accent">
                Exclusive Pass
              </span>
              <h3 className="font-heading text-lg font-bold text-white">
                {planName}
              </h3>
            </div>
          </div>

          {isSubscribed ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent bg-accent/10 border border-accent/30 px-3 py-1 rounded-full">
              <Sparkles className="h-3.5 w-3.5" />
              Active Member
            </span>
          ) : (
            <div className="text-right">
              <span className="font-heading text-2xl font-extrabold text-white">
                {formatCurrency(price)}
              </span>
              <span className="text-xs text-white/60 block">/ 6 Months</span>
            </div>
          )}
        </div>

        {/* Savings Highlight */}
        <div className="rounded-xl bg-white/10 backdrop-blur-md p-3.5 border border-white/15 flex items-center justify-between">
          <span className="text-xs text-white/80">Average Yearly Savings</span>
          <span className="font-heading text-base font-bold text-accent">
            Save up to {formatCurrency(savingsTotal)}
          </span>
        </div>

        {/* Perks Checklist */}
        <div className="space-y-2 text-xs">
          {perks.map((perk, i) => (
            <div key={i} className="flex items-center gap-2 text-white/90">
              <div className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-accent/20 text-accent">
                <Check className="h-3 w-3" />
              </div>
              <span>{perk}</span>
            </div>
          ))}
        </div>

        {/* Action Button */}
        {!isSubscribed && onSubscribe && (
          <div className="pt-2">
            <Button
              variant="accent"
              size="lg"
              className="w-full shadow-glow font-semibold"
              rightIcon={<ArrowRight className="h-4 w-4" />}
              onClick={onSubscribe}
            >
              Join VIP Club for {formatCurrency(price)}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
