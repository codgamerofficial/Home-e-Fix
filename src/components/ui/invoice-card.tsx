import { Receipt, ShieldCheck } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export interface InvoiceItem {
  name: string;
  amount: number;
}

export interface InvoiceCardProps {
  items?: InvoiceItem[];
  subtotal?: number;
  discount?: number;
  tax?: number; // GST
  convenienceFee?: number;
  total?: number;
  couponCode?: string;
  isPaid?: boolean;
  className?: string;
}

export function InvoiceCard({
  items = [
    { name: "AC Deep Cleaning & Servicing", amount: 999 },
    { name: "Safety & Hygiene Charge", amount: 49 },
  ],
  subtotal = 1048,
  discount = 150,
  tax = 90,
  convenienceFee = 29,
  total = 1017,
  couponCode,
  isPaid = false,
  className,
}: InvoiceCardProps) {
  return (
    <Card className={cn("overflow-hidden border border-border bg-surface", className)}>
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Receipt className="h-5 w-5 text-accent" />
            <h3 className="font-heading font-semibold text-base text-primary">
              Payment Summary
            </h3>
          </div>
          {isPaid && (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success bg-success-light px-2.5 py-0.5 rounded-full border border-success/20">
              <ShieldCheck className="h-3.5 w-3.5" />
              Paid
            </span>
          )}
        </div>

        {/* Item Breakdown */}
        <div className="space-y-2.5 text-xs text-foreground-secondary">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between">
              <span>{item.name}</span>
              <span className="font-medium text-foreground">
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <span>Item Subtotal</span>
            <span className="font-medium text-foreground">
              {formatCurrency(subtotal)}
            </span>
          </div>

          {discount > 0 && (
            <div className="flex items-center justify-between text-success font-medium">
              <span>
                Discount {couponCode && `(${couponCode})`}
              </span>
              <span>- {formatCurrency(discount)}</span>
            </div>
          )}

          {convenienceFee > 0 && (
            <div className="flex items-center justify-between">
              <span>Convenience Fee</span>
              <span className="font-medium text-foreground">
                {formatCurrency(convenienceFee)}
              </span>
            </div>
          )}

          {tax > 0 && (
            <div className="flex items-center justify-between">
              <span>Taxes & GST (18%)</span>
              <span className="font-medium text-foreground">
                {formatCurrency(tax)}
              </span>
            </div>
          )}
        </div>

        <Separator />

        {/* Grand Total */}
        <div className="flex items-center justify-between pt-1">
          <div>
            <span className="font-heading text-base font-bold text-primary block">
              Grand Total
            </span>
            <span className="text-[11px] text-foreground-muted">
              Inclusive of all taxes
            </span>
          </div>
          <span className="font-heading text-xl font-bold text-accent">
            {formatCurrency(total)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
