import { DollarSign, Check, ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const MOCK_PAYOUTS = [
  { id: "p-1", techName: "Suresh Reddy", bank: "HDFC Bank (**** 4891)", amount: 4850, status: "pending" },
  { id: "p-2", techName: "Mahesh Kumar", bank: "ICICI Bank (**** 1204)", amount: 3200, status: "approved" },
];

export default function Payments() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Financial Ledger & Payouts</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Review 80/20 platform revenue splits and approve technician bank payouts
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Total Gross Collections</div>
          <div className="font-heading text-3xl font-extrabold text-primary">{formatCurrency(4280000)}</div>
          <div className="text-[10px] text-foreground-muted">Gross Booking Value</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Technician Payouts (80%)</div>
          <div className="font-heading text-3xl font-extrabold text-emerald-600">{formatCurrency(3424000)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Disbursed to Pros</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Platform Commission (20%)</div>
          <div className="font-heading text-3xl font-extrabold text-accent">{formatCurrency(856000)}</div>
          <div className="text-[10px] text-foreground-muted">Net Platform Revenue</div>
        </Card>
      </div>

      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Technician Bank Payout Queue
        </h3>

        <div className="space-y-3">
          {MOCK_PAYOUTS.map((payout) => (
            <div key={payout.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface text-xs">
              <div>
                <h4 className="font-heading font-bold text-primary">{payout.techName}</h4>
                <p className="text-[11px] text-foreground-secondary">{payout.bank}</p>
              </div>

              <div className="flex items-center gap-4">
                <span className="font-heading font-bold text-base text-accent">
                  {formatCurrency(payout.amount)}
                </span>
                {payout.status === "pending" ? (
                  <Button variant="accent" size="sm" onClick={() => alert(`Approved ${formatCurrency(payout.amount)} payout!`)}>
                    Approve Payout
                  </Button>
                ) : (
                  <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                    ✓ Transferred
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
