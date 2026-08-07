import { useState } from "react";
import { Wallet as WalletIcon, ShieldCheck, ArrowUpRight, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default function Wallet() {
  const [cashCollected, setCashCollected] = useState(1200);
  const [notice, setNotice] = useState<string | null>(null);

  const handleDepositCash = () => {
    setCashCollected(0);
    setNotice("✅ Successfully deposited ₹1,200 collected cash to Home-e-Fix Platform account!");
    setTimeout(() => setNotice(null), 6000);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Cash Collection & Wallet</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Manage cash collected from customers during Cash-on-Delivery bookings
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-center justify-between animate-in fade-in">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-bold text-xs">Dismiss</button>
        </div>
      )}

      <div className="rounded-3xl gradient-hero text-white p-6 sm:p-8 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="text-xs text-white/80 font-semibold mb-1">Cash In Hand (Collected from COD)</div>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
              {formatCurrency(cashCollected)}
            </div>
            <p className="text-xs text-white/70 mt-1">
              Platform Limit: ₹5,000 max cash holding before mandatory deposit
            </p>
          </div>

          {cashCollected > 0 && (
            <Button
              variant="accent"
              size="lg"
              onClick={handleDepositCash}
              className="font-bold shadow-lg bg-yellow-400 text-primary hover:bg-yellow-300"
            >
              Deposit Cash via UPI
            </Button>
          )}
        </div>
      </div>

      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Commission & Split Overview
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
            <span className="text-foreground-secondary">Technician Share</span>
            <div className="font-heading text-xl font-bold text-emerald-600">80%</div>
            <p className="text-[10px] text-foreground-muted">Directly credited to your account</p>
          </div>

          <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
            <span className="text-foreground-secondary">Platform Service Fee</span>
            <div className="font-heading text-xl font-bold text-primary">20%</div>
            <p className="text-[10px] text-foreground-muted">Covers insurance, lead generation & support</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
