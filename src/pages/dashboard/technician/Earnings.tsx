import { useState, useEffect } from "react";
import { DollarSign, ArrowUpRight, Award, Wallet, Calendar, Download, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function Earnings() {
  const [completedJobs, setCompletedJobs] = useState<any[]>([]);
  const [payouts, setPayouts] = useState<any[]>([]);
  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutAmount, setPayoutAmount] = useState("");
  const [payoutSuccessMsg, setPayoutSuccessMsg] = useState("");

  const loadEarningsData = () => {
    const allBookings = dbRepository.getBookings();
    const completed = allBookings.filter(
      (b) => b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED"
    );
    setCompletedJobs(completed);
    setPayouts(dbRepository.getPayouts());
  };

  useEffect(() => {
    loadEarningsData();
  }, []);

  // Compute metrics from actual bookings
  const now = new Date();
  const todayStr = now.toISOString().split("T")[0];

  const totalCompletedGross = completedJobs.reduce(
    (sum, b) => sum + (Number(b.subtotal) || Number(b.total_amount) || 0),
    0
  );
  const totalPartnerEarnings = Math.round(totalCompletedGross * 0.8);

  // Today's earnings
  const todayEarnings = completedJobs
    .filter((b) => b.scheduled_date === todayStr || (b.completed_at && b.completed_at.startsWith(todayStr)))
    .reduce((sum, b) => sum + Math.round((Number(b.subtotal) || Number(b.total_amount) || 0) * 0.8), 0);

  // Completed payouts
  const disbursedPayouts = payouts
    .filter((p) => p.status === "approved" || p.status === "transferred")
    .reduce((sum, p) => sum + p.amount, 0);

  const availableForPayout = Math.max(0, totalPartnerEarnings - disbursedPayouts);

  const handleRequestPayout = (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number(payoutAmount) || availableForPayout;
    if (amt <= 0 || amt > availableForPayout) return;

    const newPayout = dbRepository.requestPayout(
      "pro-seed-1",
      "Suresh Reddy",
      amt,
      "HDFC Bank (**** 4891)"
    );
    setPayouts([newPayout, ...payouts]);
    setShowPayoutModal(false);
    setPayoutAmount("");
    setPayoutSuccessMsg(`Instant payout request of ${formatCurrency(amt)} submitted successfully.`);
    setTimeout(() => setPayoutSuccessMsg(""), 5000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Technician Earnings</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track real daily job payouts calculated at 80% partner labour share and request bank settlements.
          </p>
        </div>

        <Button
          variant="accent"
          size="default"
          leftIcon={<DollarSign className="h-4 w-4" />}
          onClick={() => {
            setPayoutAmount(String(availableForPayout));
            setShowPayoutModal(true);
          }}
          disabled={availableForPayout <= 0}
          className="font-bold shadow-lg"
        >
          Request Bank Payout
        </Button>
      </div>

      {payoutSuccessMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {payoutSuccessMsg}
        </div>
      )}

      {/* STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Today&apos;s Earnings</div>
          <div className="font-heading text-3xl font-bold text-accent">{formatCurrency(todayEarnings)}</div>
          <div className="text-[10px] text-foreground-muted">
            {completedJobs.filter((b) => b.scheduled_date === todayStr).length} Jobs Completed Today
          </div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Total Lifetime Earnings</div>
          <div className="font-heading text-3xl font-bold text-primary">{formatCurrency(totalPartnerEarnings)}</div>
          <div className="text-[10px] text-foreground-muted">{completedJobs.length} Completed Jobs</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Disbursed to Bank</div>
          <div className="font-heading text-3xl font-bold text-emerald-600">{formatCurrency(disbursedPayouts)}</div>
          <div className="text-[10px] text-foreground-muted">Settled to Linked Account</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Available for Payout</div>
          <div className="font-heading text-3xl font-bold text-primary">{formatCurrency(availableForPayout)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">
            {availableForPayout > 0 ? "Ready to Transfer" : "No Unsettled Balance"}
          </div>
        </Card>
      </div>

      {/* INSTANT PAYOUT MODAL */}
      {showPayoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="p-6 border border-accent/30 bg-surface space-y-4 max-w-md w-full shadow-2xl">
            <h4 className="font-heading text-base font-bold text-primary">Request Bank Settlement</h4>
            <p className="text-xs text-foreground-secondary">
              Transfer available earnings to your linked bank account:{" "}
              <span className="font-bold text-primary">HDFC Bank (•••• 4891)</span>.
            </p>

            <form onSubmit={handleRequestPayout} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-foreground-secondary block mb-1">
                  Payout Amount (₹)
                </label>
                <Input
                  type="number"
                  min="1"
                  max={availableForPayout}
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  placeholder="Enter amount"
                  required
                />
                <span className="text-[10px] text-foreground-muted mt-1 block">
                  Available for settlement: {formatCurrency(availableForPayout)}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button variant="ghost" size="sm" type="button" onClick={() => setShowPayoutModal(false)}>
                  Cancel
                </Button>
                <Button variant="accent" size="sm" type="submit" className="font-bold">
                  Confirm Payout
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* JOB PAYOUT HISTORY LOG */}
      <Card className="p-6 border border-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-heading text-base font-bold text-primary">
            Job Payout History ({completedJobs.length})
          </h3>
          <span className="text-xs text-foreground-muted">80% Labour Split</span>
        </div>

        {completedJobs.length === 0 ? (
          <div className="text-center py-10 space-y-2">
            <AlertCircle className="h-10 w-10 text-foreground-muted mx-auto" />
            <p className="text-sm font-semibold text-primary">No completed jobs yet</p>
            <p className="text-xs text-foreground-secondary max-w-xs mx-auto">
              Completed jobs will automatically appear here with their respective net payouts.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {completedJobs.map((job) => {
              const subtotal = Number(job.subtotal) || Number(job.total_amount) || 0;
              const payout = Math.round(subtotal * 0.8);
              return (
                <div
                  key={job.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <h5 className="font-heading text-xs font-bold text-primary">{job.service_name}</h5>
                      {job.is_dev_seed && (
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-300 text-amber-600 bg-amber-50">
                          [DEV SEED]
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-foreground-secondary">
                      Customer: {job.customer_name} • Ref: {job.booking_number} • {formatDate(job.completed_at || job.scheduled_date)}
                    </p>
                  </div>

                  <div className="text-right">
                    <div className="font-heading text-sm font-bold text-primary">
                      {formatCurrency(payout)}
                    </div>
                    <span className="text-[10px] text-emerald-600 font-semibold block">
                      Net Payout (80%)
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      {/* PAYOUT REQUESTS LEDGER */}
      {payouts.length > 0 && (
        <Card className="p-6 border border-border space-y-4">
          <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
            Bank Settlement Records
          </h3>
          <div className="space-y-2 text-xs">
            {payouts.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface"
              >
                <div>
                  <span className="font-bold text-primary block">{p.bank}</span>
                  <span className="text-foreground-muted text-[11px]">
                    Ref: {p.id} • {p.requestedAt ? formatDate(p.requestedAt) : "Recent"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-primary text-sm block">
                    {formatCurrency(p.amount)}
                  </span>
                  <Badge
                    variant="outline"
                    className={`text-[10px] capitalize ${
                      p.status === "approved" || p.status === "transferred"
                        ? "text-emerald-600 border-emerald-200 bg-emerald-50"
                        : "text-amber-600 border-amber-200 bg-amber-50"
                    }`}
                  >
                    {p.status === "approved" ? "✓ Settled" : "⏳ Under Processing"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
