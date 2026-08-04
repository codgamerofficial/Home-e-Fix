import { useState } from "react";
import { Award, Sparkles, Check, Edit } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { formatCurrency } from "@/lib/utils";

export default function MembershipCMS() {
  const [annualPrice, setAnnualPrice] = useState("299");

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">VIP Pass Membership CMS</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Manage subscription plans, member perks, and pricing structures
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Active VIP Members</div>
          <div className="font-heading text-3xl font-extrabold text-accent">3,420</div>
          <div className="text-[10px] text-emerald-600 font-bold">+18% growth this month</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Annual Plan Price</div>
          <div className="font-heading text-3xl font-extrabold text-primary">{formatCurrency(Number(annualPrice))}</div>
          <div className="text-[10px] text-foreground-muted">Per Year / Member</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Total Member Savings</div>
          <div className="font-heading text-3xl font-extrabold text-emerald-600">{formatCurrency(495000)}</div>
          <div className="text-[10px] text-foreground-muted">Delivered to VIP users</div>
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

          <Button variant="accent" size="sm" onClick={() => alert("VIP Pass subscription pricing updated!")}>
            Update Pricing
          </Button>
        </div>
      </Card>
    </div>
  );
}
