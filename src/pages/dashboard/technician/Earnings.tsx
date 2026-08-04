import { useState } from "react";
import { DollarSign, ArrowUpRight, Award, Wallet, Calendar, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

const EARNINGS_HISTORY = [
  { id: "e-1", date: "Today, Aug 04", jobName: "Split AC Foam Jet Wash", customer: "Priya Sharma", payout: 450, tip: 50 },
  { id: "e-2", date: "Aug 03, 2026", jobName: "Bathroom Tap Leakage", customer: "Anand Verma", payout: 220, tip: 20 },
  { id: "e-3", date: "Aug 02, 2026", jobName: "Switchboard & MCB Repair", customer: "Vikram Malhotra", payout: 180, tip: 0 },
  { id: "e-4", date: "Aug 01, 2026", jobName: "3-Seater Sofa Shampooing", customer: "Sneha Reddy", payout: 720, tip: 100 },
];

export default function Earnings() {
  const [showPayoutModal, setShowPayoutModal] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">Technician Earnings</h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Track daily job payouts, customer tips, and request bank payouts
          </p>
        </div>

        <Button
          variant="accent"
          size="default"
          leftIcon={<DollarSign className="h-4 w-4" />}
          onClick={() => setShowPayoutModal(true)}
          className="font-bold shadow-lg"
        >
          Request Instant Payout
        </Button>
      </div>

      {/* STATS BANNER */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Today&apos;s Earnings</div>
          <div className="font-heading text-3xl font-bold text-accent">{formatCurrency(1850)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">4 Jobs Completed</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">This Week</div>
          <div className="font-heading text-3xl font-bold text-primary">{formatCurrency(12400)}</div>
          <div className="text-[10px] text-foreground-muted">26 Jobs Completed</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Tips Received</div>
          <div className="font-heading text-3xl font-bold text-emerald-600">{formatCurrency(350)}</div>
          <div className="text-[10px] text-foreground-muted">100% Retained</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Available for Payout</div>
          <div className="font-heading text-3xl font-bold text-primary">{formatCurrency(4850)}</div>
          <div className="text-[10px] text-emerald-600 font-bold">Ready to Transfer</div>
        </Card>
      </div>

      {/* INSTANT PAYOUT MODAL */}
      {showPayoutModal && (
        <Card className="p-6 border border-accent/30 bg-accent/5 space-y-4 max-w-md">
          <h4 className="font-heading text-sm font-bold text-primary">Instant Bank Payout Request</h4>
          <p className="text-xs text-foreground-secondary">
            Transfer available balance <span className="font-bold text-primary">{formatCurrency(4850)}</span> to your linked HDFC Bank account (**** 4891).
          </p>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="ghost" size="sm" onClick={() => setShowPayoutModal(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="sm"
              onClick={() => {
                setShowPayoutModal(false);
                alert("Instant Payout request of ₹4,850 submitted! Funds will reflect within 15 minutes.");
              }}
            >
              Confirm Payout
            </Button>
          </div>
        </Card>
      )}

      {/* EARNINGS LOG */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Job Payout History
        </h3>

        <div className="space-y-3">
          {EARNINGS_HISTORY.map((item) => (
            <div key={item.id} className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface">
              <div>
                <h5 className="font-heading text-xs font-bold text-primary">{item.jobName}</h5>
                <p className="text-[11px] text-foreground-secondary">Customer: {item.customer} • {item.date}</p>
              </div>

              <div className="text-right">
                <div className="font-heading text-sm font-bold text-primary">
                  {formatCurrency(item.payout + item.tip)}
                </div>
                {item.tip > 0 && (
                  <span className="text-[10px] text-emerald-600 font-semibold block">
                    (Includes {formatCurrency(item.tip)} tip)
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
