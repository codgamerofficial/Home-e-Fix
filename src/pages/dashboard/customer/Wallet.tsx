import { useState } from "react";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

const TRANSACTIONS = [
  {
    id: "tx-1",
    type: "credit",
    amount: 100,
    title: "On-Time Guarantee Credit",
    date: "Aug 02, 2026",
    status: "success",
  },
  {
    id: "tx-2",
    type: "debit",
    amount: 150,
    title: "Paid for Switch Installation (HEF-659103)",
    date: "Jul 28, 2026",
    status: "success",
  },
  {
    id: "tx-3",
    type: "credit",
    amount: 550,
    title: "Added Money via UPI",
    date: "Jul 20, 2026",
    status: "success",
  },
];

export default function Wallet() {
  const [balance, setBalance] = useState(500);
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState("500");

  const handleAddMoney = (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(addAmount);
    if (val > 0) {
      setBalance((prev) => prev + val);
      setShowAddMoneyModal(false);
      alert(`Successfully added ${formatCurrency(val)} to Home-e-Fix Wallet!`);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">My Home-e-Fix Wallet</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          1-tap instant checkouts, instant refunds, and cashback credits
        </p>
      </div>

      {/* WALLET BALANCE BANNER */}
      <div className="rounded-3xl gradient-hero text-white p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1 text-xs font-semibold text-white">
              <WalletIcon className="h-3.5 w-3.5 text-accent" /> Available Balance
            </div>
            <div className="font-heading text-4xl sm:text-5xl font-extrabold text-white">
              {formatCurrency(balance)}
            </div>
            <p className="text-xs text-white/80">
              Used automatically at checkout for extra savings
            </p>
          </div>

          <Button
            variant="accent"
            size="lg"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setShowAddMoneyModal(true)}
            className="font-bold shadow-lg bg-yellow-400 text-primary hover:bg-yellow-300"
          >
            Add Money to Wallet
          </Button>
        </div>
      </div>

      {/* ADD MONEY FORM MODAL */}
      {showAddMoneyModal && (
        <Card className="p-6 border border-accent/30 bg-accent/5 space-y-4">
          <h4 className="font-heading text-sm font-bold text-primary">
            Add Funds to Wallet
          </h4>
          <form onSubmit={handleAddMoney} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">
                Amount (₹)
              </label>
              <Input
                type="number"
                value={addAmount}
                onChange={(e) => setAddAmount(e.target.value)}
                placeholder="500"
                min="100"
              />
            </div>

            <div className="flex gap-2">
              {[200, 500, 1000, 2000].map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setAddAmount(amt.toString())}
                  className="px-3 py-1 rounded-lg border border-border bg-background text-xs font-semibold text-primary hover:border-accent"
                >
                  + ₹{amt}
                </button>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button variant="ghost" size="sm" onClick={() => setShowAddMoneyModal(false)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" type="submit">
                Proceed to Pay
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* TRANSACTION HISTORY */}
      <Card className="p-6 border border-border/80 space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-3 border-b border-border">
          Transaction History
        </h3>

        <div className="space-y-3">
          {TRANSACTIONS.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface">
              <div className="flex items-center gap-3">
                <div
                  className={`h-9 w-9 rounded-full flex items-center justify-center ${
                    tx.type === "credit" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                  }`}
                >
                  {tx.type === "credit" ? <ArrowDownLeft className="h-4 w-4" /> : <ArrowUpRight className="h-4 w-4" />}
                </div>
                <div>
                  <h5 className="font-heading text-xs font-bold text-primary">{tx.title}</h5>
                  <p className="text-[10px] text-foreground-muted">{tx.date}</p>
                </div>
              </div>

              <div
                className={`font-heading text-sm font-bold ${
                  tx.type === "credit" ? "text-emerald-600" : "text-primary"
                }`}
              >
                {tx.type === "credit" ? "+" : "-"} {formatCurrency(tx.amount)}
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
