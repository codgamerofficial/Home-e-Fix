import { BarChart3, TrendingUp, Users, DollarSign, Wrench, ShieldCheck, ArrowUpRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency } from "@/lib/utils";

export default function Analytics() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Executive Analytics & Overview</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Real-time business performance, revenue growth, and platform health KPIs
        </p>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Total Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">
            {formatCurrency(4280000)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" /> +24.5% vs last month
          </div>
        </Card>

        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Active Customers</span>
            <Users className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">14,820</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" /> +1,240 new this month
          </div>
        </Card>

        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Verified Pros</span>
            <Wrench className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">1,240</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" /> 98.4% On-time Rate
          </div>
        </Card>

        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Booking Fulfillment</span>
            <BarChart3 className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">98.4%</div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" /> 8,940 jobs completed
          </div>
        </Card>
      </div>

      {/* REVENUE BREAKDOWN & TOP CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6 border border-border space-y-4">
          <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
            Monthly Revenue Trend (2026)
          </h3>
          <div className="h-64 flex items-end justify-between gap-2 pt-6 px-2">
            {[
              { month: "Jan", rev: "₹28L", height: "h-32" },
              { month: "Feb", rev: "₹31L", height: "h-36" },
              { month: "Mar", rev: "₹34L", height: "h-40" },
              { month: "Apr", rev: "₹38L", height: "h-48" },
              { month: "May", rev: "₹40L", height: "h-52" },
              { month: "Jun", rev: "₹42L", height: "h-60" },
            ].map((bar) => (
              <div key={bar.month} className="flex-1 flex flex-col items-center gap-2 group">
                <span className="text-[10px] font-bold text-accent opacity-0 group-hover:opacity-100 transition-opacity">
                  {bar.rev}
                </span>
                <div className={`w-full ${bar.height} rounded-t-xl bg-accent/80 hover:bg-accent transition-all shadow-md`} />
                <span className="text-xs font-semibold text-foreground-secondary">{bar.month}</span>
              </div>
            ))}
          </div>
        </Card>

        <Card className="p-6 border border-border space-y-4">
          <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
            Top Service Categories
          </h3>

          <div className="space-y-3 text-xs">
            {[
              { name: "AC Repair & Servicing", share: "38%", amount: "₹16.2L" },
              { name: "Plumbing Services", share: "24%", amount: "₹10.2L" },
              { name: "Electrical Repairs", share: "18%", amount: "₹7.7L" },
              { name: "Home Deep Cleaning", share: "12%", amount: "₹5.1L" },
              { name: "Carpentry & Furniture", share: "8%", amount: "₹3.4L" },
            ].map((cat) => (
              <div key={cat.name} className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-surface">
                <span className="font-semibold text-primary">{cat.name}</span>
                <div className="text-right">
                  <span className="font-bold text-accent block">{cat.share}</span>
                  <span className="text-[10px] text-foreground-muted">{cat.amount}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
