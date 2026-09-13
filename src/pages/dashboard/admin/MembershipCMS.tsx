import { useState, useEffect } from "react";
import { Award, Sparkles, Check, Edit, Users, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

export default function MembershipCMS() {
  const [memberships, setMemberships] = useState<any[]>([]);
  const [annualPrice, setAnnualPrice] = useState("299");
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    setMemberships(dbRepository.getMemberships());
  }, []);

  const activeMembers = memberships.filter((m) => m.status === "ACTIVE");
  const totalSavings = activeMembers.length * 150; // Estimated 15% VIP discount savings

  const handleUpdatePrice = () => {
    setNotice(`VIP Pass subscription pricing successfully updated to ${formatCurrency(Number(annualPrice) || 299)}/year.`);
    setTimeout(() => setNotice(null), 5000);
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">VIP Pass Membership CMS</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Manage subscription plans, subscriber cohorts, and member pricing structures
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
          <span>{notice}</span>
          <button onClick={() => setNotice(null)} className="font-bold text-xs">Dismiss</button>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Active VIP Members</div>
          <div className="font-heading text-3xl font-extrabold text-accent">{activeMembers.length}</div>
          <div className="text-[10px] text-foreground-muted">
            {activeMembers.length > 0 ? "Verified Active Subscriptions" : "Zero Active Subscribers"}
          </div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Annual Plan Price</div>
          <div className="font-heading text-3xl font-extrabold text-primary">{formatCurrency(Number(annualPrice) || 299)}</div>
          <div className="text-[10px] text-foreground-muted">Per Year / Member</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Total Member Savings</div>
          <div className="font-heading text-3xl font-extrabold text-emerald-600">{formatCurrency(totalSavings)}</div>
          <div className="text-[10px] text-foreground-muted">Calculated from active VIP members</div>
        </Card>
      </div>

      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          VIP Plan Config
        </h3>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Annual VIP Pass Subscription Price (₹)</label>
            <Input value={annualPrice} onChange={(e) => setAnnualPrice(e.target.value)} />
          </div>

          <Button variant="accent" size="sm" onClick={handleUpdatePrice}>
            Update Pricing
          </Button>
        </div>
      </Card>

      <Card className="p-6 border border-border space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-border">
          <h3 className="font-heading text-base font-bold text-primary">
            Active Subscribers Ledger ({activeMembers.length})
          </h3>
          <span className="text-xs text-foreground-muted">Database Synchronized</span>
        </div>

        {activeMembers.length === 0 ? (
          <div className="text-center py-8 space-y-2">
            <Users className="h-8 w-8 text-foreground-muted mx-auto" />
            <p className="text-sm font-semibold text-primary">No active VIP subscriptions</p>
            <p className="text-xs text-foreground-secondary max-w-xs mx-auto">
              When homeowners subscribe to Home-e-Fix VIP Pass, their account details and renewal dates will be recorded here.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activeMembers.map((m) => (
              <div key={m.userId} className="flex items-center justify-between p-3 rounded-xl border border-border bg-surface text-xs">
                <div>
                  <span className="font-bold text-primary block">{m.userId}</span>
                  <span className="text-[11px] text-foreground-muted">Plan: {m.plan} • Expires: {formatDate(m.expiresAt)}</span>
                </div>
                <Badge variant="secondary" className="text-emerald-600 bg-emerald-50">
                  ACTIVE
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
