import { useState } from "react";
import { Wallet as WalletIcon, Plus, ArrowUpRight, ArrowDownLeft, ShieldCheck, Sparkles, CheckCircle2, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";
import { useWalletStore } from "@/store/wallet.store";
import { displayRazorpayCheckout } from "@/lib/razorpay";
import { useAuthStore } from "@/store/auth.store";

export default function Wallet() {
  const { balance, transactions, addFunds } = useWalletStore();
  const { user } = useAuthStore();
  const [showAddMoneyModal, setShowAddMoneyModal] = useState(false);
  const [addAmount, setAddAmount] = useState("500");
  const [isProcessing, setIsProcessing] = useState(false);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const handleProceedToPay = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = Number(addAmount);
    if (!val || val < 50) return;

    setIsProcessing(true);

    displayRazorpayCheckout({
      amount: val,
      name: "Home-e-Fix Wallet Top-up",
      description: `Add ${formatCurrency(val)} to Home-e-Fix Cash Balance`,
      customerName: user?.fullName || "Kolkata Customer",
      customerEmail: user?.email || "customer@homeefix.com",
      customerPhone: user?.phone || "+91 98300 12345",
      onSuccess: (paymentId) => {
        addFunds(val, "Razorpay UPI / Cards", paymentId);
        setIsProcessing(false);
        setShowAddMoneyModal(false);
        setSuccessNotice(`Successfully added ${formatCurrency(val)} to your Home-e-Fix Wallet!`);
        setTimeout(() => setSuccessNotice(null), 6000);
      },
      onFailure: (err) => {
        setIsProcessing(false);
        console.warn("Wallet Topup Failed:", err);
      },
    });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">My Home-e-Fix Wallet</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          1-tap instant checkouts, instant refunds, and cashback credits
        </p>
      </div>

      {/* SUCCESS NOTIFICATION BANNER */}
      {successNotice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="h-5 w-5 text-emerald-500 shrink-0" />
            <span className="text-xs sm:text-sm font-semibold">{successNotice}</span>
          </div>
          <button
            onClick={() => setSuccessNotice(null)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-bold px-2 py-0.5"
          >
            Dismiss
          </button>
        </div>
      )}

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
            <p className="text-xs text-white/80 flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-amber-400 inline" /> Used automatically at checkout for instant savings
            </p>
          </div>

          <Button
            variant="accent"
            size="lg"
            leftIcon={<Plus className="h-5 w-5" />}
            onClick={() => setShowAddMoneyModal(true)}
            className="font-bold shadow-lg bg-yellow-400 text-primary hover:bg-yellow-300 transition-all cursor-pointer"
          >
            Add Money to Wallet
          </Button>
        </div>
      </div>

      {/* ADD MONEY FORM MODAL */}
      {showAddMoneyModal && (
        <Card className="p-6 border border-accent/30 bg-surface space-y-4 shadow-2xl">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-accent" />
              <h4 className="font-heading text-base font-bold text-primary">
                Add Funds to Wallet via Razorpay
              </h4>
            </div>
            <Badge variant="accent" className="text-[10px]">
              🔒 100% Secure Payment
            </Badge>
          </div>

          <form onSubmit={handleProceedToPay} className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1.5 block">
                Enter Amount (₹)
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-foreground-secondary">
                  ₹
                </span>
                <Input
                  type="number"
                  value={addAmount}
                  onChange={(e) => setAddAmount(e.target.value)}
                  placeholder="500"
                  min="50"
                  className="pl-8 text-base font-bold"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[11px] font-semibold text-foreground-muted">
                Quick Select Amount
              </label>
              <div className="flex flex-wrap gap-2">
                {[200, 500, 1000, 2000, 5000].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => setAddAmount(amt.toString())}
                    className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                      addAmount === amt.toString()
                        ? "border-accent bg-accent/15 text-accent"
                        : "border-border bg-background text-primary hover:border-accent/50"
                    }`}
                  >
                    + ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-border">
              <p className="text-[11px] text-foreground-secondary">
                Supports UPI, GPay, PhonePe, Paytm, Cards & NetBanking
              </p>
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  type="button"
                  onClick={() => setShowAddMoneyModal(false)}
                  className="w-full sm:w-auto"
                >
                  Cancel
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  type="submit"
                  disabled={isProcessing}
                  className="w-full sm:w-auto font-bold px-6"
                >
                  {isProcessing ? "Opening Payment Gateway..." : "Proceed to Pay"}
                </Button>
              </div>
            </div>
          </form>
        </Card>
      )}

      {/* TRANSACTION HISTORY */}
      <Card className="p-6 border border-border/80 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <h3 className="font-heading text-base font-bold text-primary">
            Transaction History
          </h3>
          <Badge variant="outline" className="text-[11px]">
            {transactions.length} Transactions
          </Badge>
        </div>

        <div className="space-y-3">
          {transactions.map((tx) => (
            <div key={tx.id} className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-surface hover:border-accent/40 transition-colors">
              <div className="flex items-center gap-3">
                <div
                  className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 ${
                    tx.type === "credit" ? "bg-emerald-500/10 text-emerald-500" : "bg-rose-500/10 text-rose-500"
                  }`}
                >
                  {tx.type === "credit" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                </div>
                <div>
                  <h5 className="font-heading text-xs sm:text-sm font-bold text-primary">{tx.title}</h5>
                  <div className="flex items-center gap-2 text-[10px] text-foreground-muted mt-0.5">
                    <span>{tx.date}</span>
                    {tx.paymentId && <span className="font-mono text-accent">ID: {tx.paymentId}</span>}
                  </div>
                </div>
              </div>

              <div
                className={`font-heading text-sm sm:text-base font-extrabold ${
                  tx.type === "credit" ? "text-emerald-500" : "text-primary"
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
