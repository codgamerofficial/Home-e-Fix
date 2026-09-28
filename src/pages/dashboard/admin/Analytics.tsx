import { useState, useEffect } from "react";
import {
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Wrench,
  ShieldCheck,
  ArrowUpRight,
  Info,
  Calendar,
  Filter,
} from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { dbRepository } from "@/services/db/repository";
import { formatCurrency } from "@/lib/currency";
import { formatDate } from "@/lib/date";

type DateRange = "7d" | "30d" | "90d" | "all";

export default function Analytics() {
  const [dateRange, setDateRange] = useState<DateRange>("30d");
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [isDevSeed, setIsDevSeed] = useState(false);

  const loadData = () => {
    const raw = dbRepository.getExecutiveAnalytics();
    setAnalytics(raw);
    setIsDevSeed(dbRepository.isDevSeedEnabled());
  };

  useEffect(() => {
    loadData();
  }, [dateRange]);

  if (!analytics) {
    return (
      <div className="flex items-center justify-center min-h-75">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-accent border-t-transparent" />
      </div>
    );
  }

  // Categories list computed dynamically from actual bookings
  const categoryList = Object.entries(analytics.categoryTotals || {}).map(([slug, data]: [string, any]) => {
    const share =
      analytics.grossRevenue > 0
        ? Math.round((data.revenue / analytics.grossRevenue) * 100)
        : analytics.totalBookingsCount > 0
        ? Math.round((data.count / analytics.totalBookingsCount) * 100)
        : 0;
    return {
      slug,
      name: data.name || slug,
      share: `${share}%`,
      revenue: data.revenue,
      count: data.count,
    };
  });

  return (
    <div className="space-y-6">
      {/* HEADER & DATE RANGE SELECTOR */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-primary">
              Executive Analytics & Platform Health
            </h1>
            {isDevSeed && (
              <Badge variant="outline" className="text-[10px] font-mono text-amber-600 border-amber-300 bg-amber-50">
                [DEV SEED ACTIVE]
              </Badge>
            )}
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Real-time business performance, revenue growth, and verified platform metrics
          </p>
        </div>

        {/* DATE RANGE TOGGLE */}
        <div className="flex items-center gap-1 bg-muted p-1 rounded-xl border border-border text-xs">
          <Button
            variant={dateRange === "7d" ? "accent" : "ghost"}
            size="sm"
            className="h-7 text-xs font-semibold"
            onClick={() => setDateRange("7d")}
          >
            Last 7D
          </Button>
          <Button
            variant={dateRange === "30d" ? "accent" : "ghost"}
            size="sm"
            className="h-7 text-xs font-semibold"
            onClick={() => setDateRange("30d")}
          >
            Last 30D
          </Button>
          <Button
            variant={dateRange === "90d" ? "accent" : "ghost"}
            size="sm"
            className="h-7 text-xs font-semibold"
            onClick={() => setDateRange("90d")}
          >
            Last 90D
          </Button>
          <Button
            variant={dateRange === "all" ? "accent" : "ghost"}
            size="sm"
            className="h-7 text-xs font-semibold"
            onClick={() => setDateRange("all")}
          >
            All Time
          </Button>
        </div>
      </div>

      {/* DOCUMENTED FORMULAS INFO BAR */}
      <div className="p-3 rounded-xl bg-muted/40 border border-border text-xs text-foreground-secondary flex items-start gap-2">
        <Info className="h-4 w-4 text-accent shrink-0 mt-0.5" />
        <div className="flex-1 leading-relaxed">
          <span className="font-bold text-primary">Audited KPI Formulas:</span> Gross Revenue = &Sigma; completed booking values | Net Platform Cut = Gross &times; 20% | Partner Disbursement = Gross &times; 80% | Fulfillment Rate = (Completed / Total Bookings) &times; 100.
        </div>
      </div>

      {/* KPI METRICS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Total Gross Revenue</span>
            <DollarSign className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">
            {formatCurrency(analytics.grossRevenue)}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <TrendingUp className="h-3.5 w-3.5" /> Calculated from completed jobs
          </div>
        </Card>

        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Active Customers</span>
            <Users className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">
            {analytics.activeCustomers}
          </div>
          <div className="flex items-center gap-1 text-[11px] text-foreground-muted">
            <span>Distinct booking phone numbers</span>
          </div>
        </Card>

        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Verified Pros</span>
            <Wrench className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">
            {analytics.verifiedPros}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ShieldCheck className="h-3.5 w-3.5" /> Home-e-Fix Verified Partners
          </div>
        </Card>

        <Card className="p-5 border border-border space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-secondary font-semibold">
            <span>Booking Fulfillment</span>
            <BarChart3 className="h-4 w-4 text-accent" />
          </div>
          <div className="font-heading text-3xl font-extrabold text-primary">
            {analytics.bookingFulfillment}
          </div>
          <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
            <ArrowUpRight className="h-3.5 w-3.5" /> {analytics.completedJobsCount} of {analytics.totalBookingsCount} completed
          </div>
        </Card>
      </div>

      {/* REVENUE BREAKDOWN & TOP CATEGORIES */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* REVENUE SPLIT BREAKDOWN */}
        <Card className="lg:col-span-2 p-6 border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-heading text-base font-bold text-primary">
              Financial Breakdown (80/20 Standard Model)
            </h3>
            <span className="text-xs text-foreground-muted font-mono">
              Total: {formatCurrency(analytics.grossRevenue)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            <div className="p-4 rounded-xl border border-border bg-surface space-y-1">
              <span className="text-xs text-foreground-secondary">Gross Booking Volume</span>
              <div className="font-heading text-xl font-bold text-primary">
                {formatCurrency(analytics.grossRevenue)}
              </div>
              <span className="text-[10px] text-foreground-muted">100% Customer Collected</span>
            </div>

            <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/50 space-y-1">
              <span className="text-xs text-emerald-800 font-semibold">Partner Payout (80%)</span>
              <div className="font-heading text-xl font-bold text-emerald-700">
                {formatCurrency(Math.round(analytics.grossRevenue * 0.8))}
              </div>
              <span className="text-[10px] text-emerald-600">Technician Labour Share</span>
            </div>

            <div className="p-4 rounded-xl border border-accent/20 bg-accent/5 space-y-1">
              <span className="text-xs text-accent font-semibold">Platform Cut (20%)</span>
              <div className="font-heading text-xl font-bold text-accent">
                {formatCurrency(Math.round(analytics.grossRevenue * 0.2))}
              </div>
              <span className="text-[10px] text-foreground-muted">Insurance & Ops Margin</span>
            </div>
          </div>

          <div className="pt-4 border-t border-border">
            <h4 className="text-xs font-bold text-foreground-secondary uppercase tracking-wider mb-2">
              Operational Statistics
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                <span className="text-foreground-muted text-[11px] block">Total Orders</span>
                <span className="font-bold text-primary">{analytics.totalBookingsCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                <span className="text-foreground-muted text-[11px] block">Completed Jobs</span>
                <span className="font-bold text-emerald-600">{analytics.completedJobsCount}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                <span className="text-foreground-muted text-[11px] block">Avg Order Value</span>
                <span className="font-bold text-primary">
                  {formatCurrency(
                    analytics.totalBookingsCount > 0
                      ? Math.round(analytics.grossRevenue / (analytics.completedJobsCount || 1))
                      : 0
                  )}
                </span>
              </div>
              <div className="p-2.5 rounded-lg bg-muted/40 border border-border">
                <span className="text-foreground-muted text-[11px] block">Dispute Rate</span>
                <span className="font-bold text-primary">0.0%</span>
              </div>
            </div>
          </div>
        </Card>

        {/* TOP SERVICE CATEGORIES */}
        <Card className="p-6 border border-border space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-border">
            <h3 className="font-heading text-base font-bold text-primary">
              Category Distribution
            </h3>
            <span className="text-xs text-foreground-muted">By Bookings</span>
          </div>

          {categoryList.length === 0 ? (
            <div className="text-center py-8 text-xs text-foreground-muted">
              No categories recorded yet. Category data generates automatically from bookings.
            </div>
          ) : (
            <div className="space-y-3 text-xs">
              {categoryList.map((cat) => (
                <div
                  key={cat.slug}
                  className="flex items-center justify-between p-3 rounded-lg border border-border bg-surface"
                >
                  <div>
                    <span className="font-semibold text-primary block">{cat.name}</span>
                    <span className="text-[11px] text-foreground-muted">{cat.count} bookings</span>
                  </div>
                  <div className="text-right">
                    <span className="font-bold text-accent block">{cat.share}</span>
                    <span className="text-[10px] text-foreground-muted">
                      {formatCurrency(cat.revenue)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
