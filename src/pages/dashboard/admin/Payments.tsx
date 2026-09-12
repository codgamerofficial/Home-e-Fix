import { useState, useEffect } from "react";
import { DollarSign, Check, ArrowDownRight, ArrowUpRight, RefreshCw, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function Payments() {
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [notificationMsg, setNotificationMsg] = useState("");

  const loadData = () => {
    const all = dbRepository.getBookings();
    setCompletedBookings(
      all.filter((b) => b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED")
    );
    setPayouts(dbRepository.getPayouts());
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalGross = completedBookings.reduce(
    (sum, b) => sum + (Number(b.total_amount) || 0),
    0
  );
  const techPayouts = Math.round(totalGross * 0.8);
  const platformMargin = Math.round(totalGross * 0.2);

  const handleApprovePayout = (payoutId: string, amount: number, techName: string) => {
    dbRepository.approvePayout(payoutId);
    loadData();
    setNotificationMsg(`Approved settlement of ${formatCurrency(amount)} to ${techName}.`);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Financial Ledger & Payouts</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Real collections ledger with automated 80/20 platform splits and partner bank disbursements
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-9 gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh Ledger
        </Button>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          {notificationMsg}
        </div>
      )}

      {/* FINANCIAL STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Total Gross Collections</div>
          <div className="font-heading text-3xl font-extrabold text-primary">{formatCurrency(totalGross)}</div>
          <div className="text-[10px] text-foreground-muted">
            {completedBookings.length} Completed Bookings Collected
          </div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Technician Payouts (80%)</div>
          <div className="font-heading text-3xl font-extrabold text-emerald-600">{formatCurrency(techPayouts)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Partner Labour Share</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Platform Commission (20%)</div>
          <div className="font-heading text-3xl font-extrabold text-accent">{formatCurrency(platformMargin)}</div>
          <div className="text-[10px] text-foreground-muted">Insurance & Ops Margin</div>
        </Card>
      </div>

      {/* PAYOUT QUEUE */}
      <Card className="p-6 border border-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-heading text-base font-bold text-primary">
            Technician Bank Settlement Queue ({payouts.length})
          </h3>
          <span className="text-xs text-foreground-muted">NEFT / IMPS Direct Gateway</span>
        </div>

        {payouts.length === 0 ? (
          <div className="py-8 text-center text-xs text-foreground-muted">
            No bank payout settlement requests currently in queue.
          </div>
        ) : (
          <div className="space-y-3">
            {payouts.map((payout) => (
              <div
                key={payout.id}
                className="flex items-center justify-between p-4 rounded-xl border border-border bg-surface text-xs"
              >
                <div>
                  <h4 className="font-heading font-bold text-primary text-sm">{payout.techName}</h4>
                  <p className="text-[11px] text-foreground-secondary">
                    Account: {payout.bank} • Ref: {payout.id}
                  </p>
                  {payout.requestedAt && (
                    <span className="text-[10px] text-foreground-muted block mt-0.5">
                      Requested: {formatDate(payout.requestedAt)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-4">
                  <span className="font-heading font-bold text-base text-primary">
                    {formatCurrency(payout.amount)}
                  </span>
                  {payout.status === "pending" ? (
                    <Button
                      variant="accent"
                      size="sm"
                      onClick={() => handleApprovePayout(payout.id, payout.amount, payout.techName)}
                      className="font-bold text-xs"
                    >
                      Approve Payout
                    </Button>
                  ) : (
                    <Badge variant="secondary" className="text-emerald-700 bg-emerald-50 border-emerald-200">
                      ✓ Transferred
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
