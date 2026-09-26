import { useState, useEffect, useMemo } from "react";
import {
  Sliders,
  DollarSign,
  Shield,
  Save,
  RotateCcw,
  CheckCircle2,
  Package,
  Wrench,
  Search,
  Edit,
  Info,
  Check,
  Percent,
  TrendingUp,
  Tag,
  Clock,
  Layers,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogContent,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  dbRepository,
  type PricingConfig,
  type ServicePricingItem,
  type ServiceMaterialRule,
  type VisitFeePolicy,
  type MaterialProcurementRule,
  DEFAULT_PRICING_CONFIG,
} from "@/services/db/repository";
import { formatCurrency } from "@/lib/utils";

export default function PricingCMS() {
  const [config, setConfig] = useState<PricingConfig>(DEFAULT_PRICING_CONFIG);
  const [servicePricings, setServicePricings] = useState<ServicePricingItem[]>([]);
  const [materialRules, setMaterialRules] = useState<ServiceMaterialRule[]>([]);
  const [activeTab, setActiveTab] = useState<"global" | "services" | "materials">("global");

  // Filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Editing modals
  const [editingPricing, setEditingPricing] = useState<ServicePricingItem | null>(null);
  const [editingMaterial, setEditingMaterial] = useState<ServiceMaterialRule | null>(null);

  const [notificationMsg, setNotificationMsg] = useState("");

  const showNotification = (msg: string) => {
    setNotificationMsg(msg);
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  const loadData = () => {
    setConfig(dbRepository.getPricingConfig());
    setServicePricings(dbRepository.getServicePricings());
    setMaterialRules(dbRepository.getMaterialRules());
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSaveGlobalConfig = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    dbRepository.savePricingConfig(config);
    showNotification("Global pricing rules and platform commission parameters saved successfully!");
  };

  const handleResetGlobalConfig = () => {
    setConfig(DEFAULT_PRICING_CONFIG);
    dbRepository.savePricingConfig(DEFAULT_PRICING_CONFIG);
    showNotification("Pricing parameters restored to platform defaults.");
  };

  const handleResetServiceBenchmarks = () => {
    if (window.confirm("Are you sure you want to reset all 80 services to standard Kolkata market benchmark rates?")) {
      const reset = dbRepository.resetServicePricings();
      setServicePricings(reset);
      showNotification("All 80 service rate cards reset to benchmark defaults!");
    }
  };

  const handleResetMaterialRules = () => {
    if (window.confirm("Are you sure you want to reset all material procurement rules to standard defaults?")) {
      const reset = dbRepository.resetMaterialRules();
      setMaterialRules(reset);
      showNotification("All material procurement rules reset to standard policies!");
    }
  };

  const handleSaveServicePricing = () => {
    if (!editingPricing) return;
    const updated = dbRepository.saveServicePricing(editingPricing);
    setServicePricings((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setEditingPricing(null);
    showNotification(`Rate card for "${updated.serviceName}" updated successfully!`);
  };

  const handleToggleServiceActive = (item: ServicePricingItem) => {
    const updated = { ...item, isActive: !item.isActive };
    dbRepository.saveServicePricing(updated);
    setServicePricings((prev) =>
      prev.map((p) => (p.id === updated.id ? updated : p))
    );
    showNotification(`${updated.serviceName} marked as ${updated.isActive ? "Active" : "Inactive"}.`);
  };

  const handleSaveMaterialRule = () => {
    if (!editingMaterial) return;
    const updated = dbRepository.saveMaterialRule(editingMaterial);
    setMaterialRules((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    setEditingMaterial(null);
    showNotification(`Material procurement policy for "${updated.serviceName}" updated!`);
  };

  // Filtered lists
  const filteredServices = useMemo(() => {
    return servicePricings.filter((svc) => {
      const matchCat = selectedCategory === "all" || svc.categorySlug === selectedCategory;
      const matchQuery =
        !searchQuery ||
        svc.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (svc.subCategory && svc.subCategory.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchCat && matchQuery;
    });
  }, [servicePricings, selectedCategory, searchQuery]);

  const filteredMaterials = useMemo(() => {
    return materialRules.filter((rule) => {
      const matchCat = selectedCategory === "all" || rule.categorySlug === selectedCategory;
      const matchQuery =
        !searchQuery ||
        rule.serviceName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rule.notes?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchQuery;
    });
  }, [materialRules, selectedCategory, searchQuery]);

  // Summary statistics
  const totalServicesCount = servicePricings.length;
  const activeServicesCount = servicePricings.filter((s) => s.isActive).length;
  const avgCustomerPrice = servicePricings.length > 0
    ? Math.round(servicePricings.reduce((sum, s) => sum + s.customerPrice, 0) / servicePricings.length)
    : 0;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary flex items-center gap-2">
            <Sliders className="h-6 w-6 text-accent" />
            Pricing & Material Rules Engine
          </h1>
          <p className="text-sm text-foreground-secondary mt-0.5">
            Admin configuration for Kolkata market visiting fees, taxes, partner splits, and 80 service rate cards
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "global" && (
            <>
              <Button variant="outline" size="sm" onClick={handleResetGlobalConfig} className="h-9 gap-1 text-xs">
                <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
              </Button>
              <Button variant="accent" size="sm" onClick={() => handleSaveGlobalConfig()} className="h-9 gap-1.5 shadow-glow font-bold text-xs">
                <Save className="h-4 w-4" /> Save Global Rules
              </Button>
            </>
          )}
          {activeTab === "services" && (
            <Button variant="outline" size="sm" onClick={handleResetServiceBenchmarks} className="h-9 gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Benchmark Overrides
            </Button>
          )}
          {activeTab === "materials" && (
            <Button variant="outline" size="sm" onClick={handleResetMaterialRules} className="h-9 gap-1.5 text-xs text-amber-700 border-amber-300 hover:bg-amber-50">
              <RotateCcw className="h-3.5 w-3.5" /> Reset Material Policies
            </Button>
          )}
        </div>
      </div>

      {/* Success Notification Banner */}
      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {notificationMsg}
        </div>
      )}

      {/* Metric Cards Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-surface border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Package className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-primary">{totalServicesCount}</div>
            <div className="text-xs text-foreground-muted font-medium">Configured Services</div>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <Check className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-emerald-700">{activeServicesCount}</div>
            <div className="text-xs text-foreground-muted font-medium">Live Active Services</div>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/15 text-accent-dark flex items-center justify-center shrink-0">
            <DollarSign className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-primary">{formatCurrency(avgCustomerPrice)}</div>
            <div className="text-xs text-foreground-muted font-medium">Average Labour Rate</div>
          </div>
        </Card>

        <Card className="p-4 bg-surface border-border flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
            <Percent className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xl font-bold text-amber-700">{config.partnerLabourSplitPercent}%</div>
            <div className="text-xs text-foreground-muted font-medium">Partner Payout Split</div>
          </div>
        </Card>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-border space-x-1">
        <button
          onClick={() => setActiveTab("global")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "global"
              ? "border-accent text-accent"
              : "border-transparent text-foreground-muted hover:text-primary"
          }`}
        >
          <Sliders className="h-4 w-4" /> Global Pricing & Policies
        </button>
        <button
          onClick={() => setActiveTab("services")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "services"
              ? "border-accent text-accent"
              : "border-transparent text-foreground-muted hover:text-primary"
          }`}
        >
          <Tag className="h-4 w-4" /> Service Rate Cards ({servicePricings.length})
        </button>
        <button
          onClick={() => setActiveTab("materials")}
          className={`px-4 py-2.5 text-sm font-bold border-b-2 transition-colors flex items-center gap-2 ${
            activeTab === "materials"
              ? "border-accent text-accent"
              : "border-transparent text-foreground-muted hover:text-primary"
          }`}
        >
          <Wrench className="h-4 w-4" /> Material & Spare Parts Rules ({materialRules.length})
        </button>
      </div>

      {/* TAB 1: Global Pricing & Platform Parameters */}
      {activeTab === "global" && (
        <form onSubmit={handleSaveGlobalConfig} className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Visiting Fee & Policy */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-accent" /> Visiting Fee & Inspection Policy
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1.5">
                  Platform Visiting Fee Policy
                </label>
                <select
                  value={config.visitFeePolicy}
                  onChange={(e) =>
                    setConfig({ ...config, visitFeePolicy: e.target.value as VisitFeePolicy })
                  }
                  className="w-full h-10 px-3 rounded-lg border border-border bg-surface text-primary text-sm font-medium focus:ring-2 focus:ring-accent"
                >
                  <option value="waived_on_service">Waived on service (Free inspection if work is completed)</option>
                  <option value="charged_on_decline">Charged only if service is declined after visit</option>
                  <option value="fixed">Fixed inspection fee (Always applied)</option>
                  <option value="free">Zero visiting fee (Completely free across all visits)</option>
                </select>
                <span className="text-[11px] text-foreground-muted mt-1 block">
                  Defines consumer billing rules when technician arrives at customer doorstep.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Standard Inspection / Visit Fee (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={config.standardVisitFee}
                  onChange={(e) =>
                    setConfig({ ...config, standardVisitFee: Number(e.target.value) || 0 })
                  }
                />
                <span className="text-[11px] text-foreground-muted">
                  Standard visiting charge shown before service quote.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Waiver Minimum Labour Bill Threshold (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={config.waiverThreshold}
                  onChange={(e) =>
                    setConfig({ ...config, waiverThreshold: Number(e.target.value) || 0 })
                  }
                />
                <span className="text-[11px] text-foreground-muted">
                  Visiting fee waived if customer's final labour bill meets or exceeds this amount.
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Surcharges & SLAs */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <Clock className="h-5 w-5 text-accent" /> Priority Surcharges & Peak Hours
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Emergency Priority Dispatch Surcharge (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={config.emergencySurcharge}
                  onChange={(e) =>
                    setConfig({ ...config, emergencySurcharge: Number(e.target.value) || 0 })
                  }
                />
                <span className="text-[11px] text-foreground-muted">
                  Instant 45-minute arrival guarantee SLA window.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Night / Peak Hours Surcharge (₹)
                </label>
                <Input
                  type="number"
                  min="0"
                  value={config.nightPeakSurcharge}
                  onChange={(e) =>
                    setConfig({ ...config, nightPeakSurcharge: Number(e.target.value) || 0 })
                  }
                />
                <span className="text-[11px] text-foreground-muted">
                  Applied for late evening and night booking slots (post 8:00 PM).
                </span>
              </div>
            </div>
          </div>

          {/* Card 3: Partner Payout & Platform Revenue Share */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <Percent className="h-5 w-5 text-accent" /> Labour Revenue Split & Commissions
            </h3>

            <div className="space-y-4 text-sm">
              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Technician Direct Labour Revenue Share (%)
                </label>
                <Input
                  type="number"
                  min="50"
                  max="95"
                  value={config.partnerLabourSplitPercent}
                  onChange={(e) =>
                    setConfig({
                      ...config,
                      partnerLabourSplitPercent: Number(e.target.value) || 80,
                    })
                  }
                />
                <div className="mt-2 p-3 bg-muted/30 rounded-xl text-xs flex justify-between items-center">
                  <span className="text-foreground-secondary font-medium">Technician Share:</span>
                  <span className="font-bold text-emerald-700">{config.partnerLabourSplitPercent}%</span>
                </div>
                <div className="mt-1 p-3 bg-muted/30 rounded-xl text-xs flex justify-between items-center">
                  <span className="text-foreground-secondary font-medium">Platform Margin:</span>
                  <span className="font-bold text-primary">{100 - config.partnerLabourSplitPercent}%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 4: Taxes & GST Compliance */}
          <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
            <h3 className="font-bold text-base text-primary flex items-center gap-2">
              <Shield className="h-5 w-5 text-accent" /> GST & Tax Configuration
            </h3>

            <div className="space-y-4 text-sm">
              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border">
                <div>
                  <span className="text-xs font-bold text-primary block">Enable GST Tax on Invoices</span>
                  <span className="text-[11px] text-foreground-muted block">Calculate and display GST on checkout and bills</span>
                </div>
                <input
                  type="checkbox"
                  checked={config.taxEnabled}
                  onChange={(e) => setConfig({ ...config, taxEnabled: e.target.checked })}
                  className="h-4 w-4 rounded text-accent focus:ring-accent"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Applicable GST Rate (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="28"
                  disabled={!config.taxEnabled}
                  value={config.gstRatePercent}
                  onChange={(e) =>
                    setConfig({ ...config, gstRatePercent: Number(e.target.value) || 18 })
                  }
                />
                <span className="text-[11px] text-foreground-muted">
                  Standard 18% GST on platform convenience and taxable services.
                </span>
              </div>

              <div>
                <label className="text-xs font-bold text-foreground-secondary block mb-1">
                  Tax Bill Display Label
                </label>
                <Input
                  type="text"
                  disabled={!config.taxEnabled}
                  value={config.taxLabel}
                  onChange={(e) => setConfig({ ...config, taxLabel: e.target.value })}
                />
              </div>
            </div>
          </div>
        </form>
      )}

      {/* TAB 2: Service Rate Cards (80 Services) */}
      {activeTab === "services" && (
        <div className="space-y-4">
          {/* Search & Category Filter Toolbar */}
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <Input
                  placeholder="Search 80 services..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div className="flex gap-1 bg-surface border border-border p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCategory === "all" ? "bg-accent text-white" : "text-foreground-secondary hover:text-primary"
                  }`}
                >
                  All ({servicePricings.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("electrical")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCategory === "electrical" ? "bg-accent text-white" : "text-foreground-secondary hover:text-primary"
                  }`}
                >
                  Electrical ({servicePricings.filter((s) => s.categorySlug === "electrical").length})
                </button>
                <button
                  onClick={() => setSelectedCategory("plumbing")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCategory === "plumbing" ? "bg-accent text-white" : "text-foreground-secondary hover:text-primary"
                  }`}
                >
                  Plumbing ({servicePricings.filter((s) => s.categorySlug === "plumbing").length})
                </button>
              </div>
            </div>
            <div className="text-xs text-foreground-muted font-medium">
              Showing {filteredServices.length} of {servicePricings.length} services
            </div>
          </div>

          {/* Rate Cards Table */}
          <div className="border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-foreground-secondary uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Service & Subcategory</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Kolkata Benchmark</th>
                    <th className="py-3 px-4">Customer Rate</th>
                    <th className="py-3 px-4">Partner Payout</th>
                    <th className="py-3 px-4">Platform Margin</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredServices.map((svc) => {
                    const margin = svc.customerPrice - svc.partnerPayout;
                    const marginPct = svc.customerPrice > 0 ? Math.round((margin / svc.customerPrice) * 100) : 0;
                    return (
                      <tr key={svc.id} className="hover:bg-muted/15 transition-colors">
                        <td className="py-3 px-4">
                          <div className="font-bold text-primary">{svc.serviceName}</div>
                          <div className="text-[11px] text-foreground-muted">{svc.subCategory || "General Maintenance"}</div>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {svc.categorySlug}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="text-foreground-secondary font-mono">
                            ₹{svc.benchmarkMin} – ₹{svc.benchmarkMax}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-primary font-mono">
                            ₹{svc.customerPrice}
                          </span>
                          {svc.discountPercentage ? (
                            <span className="ml-1.5 text-[10px] text-emerald-600 font-bold">
                              ({svc.discountPercentage}% off)
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold text-emerald-700 font-mono">
                            ₹{svc.partnerPayout}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary font-mono">
                            ₹{margin}
                          </span>
                          <span className="text-[10px] text-foreground-muted ml-1">
                            ({marginPct}%)
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <button
                            onClick={() => handleToggleServiceActive(svc)}
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold transition-colors ${
                              svc.isActive
                                ? "bg-emerald-100 text-emerald-800 hover:bg-emerald-200"
                                : "bg-muted text-foreground-muted hover:bg-muted/80"
                            }`}
                          >
                            {svc.isActive ? "Active" : "Paused"}
                          </button>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingPricing(svc)}
                            className="h-7 px-2 text-xs font-semibold gap-1 text-primary hover:text-accent"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredServices.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-foreground-muted">
                        No services found matching your search.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: Material & Spare Parts Rules */}
      {activeTab === "materials" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-foreground-muted" />
                <Input
                  placeholder="Search spare parts rules..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 text-xs"
                />
              </div>
              <div className="flex gap-1 bg-surface border border-border p-1 rounded-lg shrink-0">
                <button
                  onClick={() => setSelectedCategory("all")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCategory === "all" ? "bg-accent text-white" : "text-foreground-secondary hover:text-primary"
                  }`}
                >
                  All ({materialRules.length})
                </button>
                <button
                  onClick={() => setSelectedCategory("electrical")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCategory === "electrical" ? "bg-accent text-white" : "text-foreground-secondary hover:text-primary"
                  }`}
                >
                  Electrical ({materialRules.filter((m) => m.categorySlug === "electrical").length})
                </button>
                <button
                  onClick={() => setSelectedCategory("plumbing")}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-colors ${
                    selectedCategory === "plumbing" ? "bg-accent text-white" : "text-foreground-secondary hover:text-primary"
                  }`}
                >
                  Plumbing ({materialRules.filter((m) => m.categorySlug === "plumbing").length})
                </button>
              </div>
            </div>
            <div className="text-xs text-foreground-muted font-medium">
              Showing {filteredMaterials.length} of {materialRules.length} rules
            </div>
          </div>

          <div className="border border-border rounded-xl bg-surface overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/40 border-b border-border text-foreground-secondary uppercase tracking-wider text-[10px] font-bold">
                  <tr>
                    <th className="py-3 px-4">Service Name</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Procurement Policy</th>
                    <th className="py-3 px-4">Max Markup</th>
                    <th className="py-3 px-4">Pre-Approval</th>
                    <th className="py-3 px-4">Warranty</th>
                    <th className="py-3 px-4">Notes</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredMaterials.map((rule) => {
                    const ruleLabel = {
                      customer_provided_allowed: "Customer Can Provide",
                      technician_can_supply: "Technician Supplied",
                      mandatory_customer_provided: "Customer Only",
                      mandatory_technician_supplied: "Company Sourced Only",
                    }[rule.procurementRule] || rule.procurementRule;

                    return (
                      <tr key={rule.id} className="hover:bg-muted/15 transition-colors">
                        <td className="py-3 px-4 font-bold text-primary">
                          {rule.serviceName}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                            {rule.categorySlug}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-semibold text-primary">
                            {ruleLabel}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-accent">
                          {rule.markupPercent}%
                        </td>
                        <td className="py-3 px-4">
                          {rule.requiresPreApproval ? (
                            <Badge variant="secondary" className="text-[10px] bg-amber-50 text-amber-800 border-amber-200">
                              Required {">"} ₹500
                            </Badge>
                          ) : (
                            <span className="text-foreground-muted">Auto-approved</span>
                          )}
                        </td>
                        <td className="py-3 px-4 font-medium text-emerald-700">
                          {rule.warrantyDays} Days
                        </td>
                        <td className="py-3 px-4 text-[11px] text-foreground-muted max-w-xs truncate">
                          {rule.notes || "Genuine branded spares with receipt"}
                        </td>
                        <td className="py-3 px-4 text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setEditingMaterial(rule)}
                            className="h-7 px-2 text-xs font-semibold gap-1 text-primary hover:text-accent"
                          >
                            <Edit className="h-3.5 w-3.5" /> Edit
                          </Button>
                        </td>
                      </tr>
                    );
                  })}
                  {filteredMaterials.length === 0 && (
                    <tr>
                      <td colSpan={8} className="py-8 text-center text-foreground-muted">
                        No material rules found.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Edit Service Pricing */}
      {editingPricing && (
        <Dialog open={true} onClose={() => setEditingPricing(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-primary">
                Edit Rate Card: {editingPricing.serviceName}
              </DialogTitle>
              <DialogDescription className="text-xs text-foreground-muted">
                Adjust customer price, partner payout, benchmark range, and availability.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground-secondary block mb-1">
                    Customer Price (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingPricing.customerPrice}
                    onChange={(e) => {
                      const val = Number(e.target.value) || 0;
                      const partnerSplit = Math.round(val * ((config.partnerLabourSplitPercent || 80) / 100));
                      setEditingPricing({
                        ...editingPricing,
                        customerPrice: val,
                        partnerPayout: partnerSplit,
                      });
                    }}
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground-secondary block mb-1">
                    Partner Payout (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingPricing.partnerPayout}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        partnerPayout: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground-secondary block mb-1">
                    Benchmark Min (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingPricing.benchmarkMin}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        benchmarkMin: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground-secondary block mb-1">
                    Benchmark Max (₹)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    value={editingPricing.benchmarkMax}
                    onChange={(e) =>
                      setEditingPricing({
                        ...editingPricing,
                        benchmarkMax: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-foreground-secondary block mb-1">
                  Discount Percentage (%)
                </label>
                <Input
                  type="number"
                  min="0"
                  max="70"
                  value={editingPricing.discountPercentage || 0}
                  onChange={(e) =>
                    setEditingPricing({
                      ...editingPricing,
                      discountPercentage: Number(e.target.value) || 0,
                    })
                  }
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border">
                <span className="font-bold text-primary">Service Active on Marketplace</span>
                <input
                  type="checkbox"
                  checked={editingPricing.isActive}
                  onChange={(e) =>
                    setEditingPricing({ ...editingPricing, isActive: e.target.checked })
                  }
                  className="h-4 w-4 rounded text-accent focus:ring-accent"
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingPricing(null)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleSaveServicePricing} className="font-bold">
                Save Rate Card
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* MODAL: Edit Material Rule */}
      {editingMaterial && (
        <Dialog open={true} onClose={() => setEditingMaterial(null)}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="text-lg font-bold text-primary">
                Material Policy: {editingMaterial.serviceName}
              </DialogTitle>
              <DialogDescription className="text-xs text-foreground-muted">
                Configure spare parts sourcing, markup caps, customer consent, and warranty duration.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2 text-xs">
              <div>
                <label className="font-bold text-foreground-secondary block mb-1">
                  Procurement Policy
                </label>
                <select
                  value={editingMaterial.procurementRule}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      procurementRule: e.target.value as MaterialProcurementRule,
                    })
                  }
                  className="w-full h-9 px-3 rounded-lg border border-border bg-surface text-primary text-xs font-medium focus:ring-2 focus:ring-accent"
                >
                  <option value="customer_provided_allowed">Customer Can Provide (Or Technician Supplies)</option>
                  <option value="technician_can_supply">Technician Sourced with Company Warranty</option>
                  <option value="mandatory_customer_provided">Customer Must Provide Spares</option>
                  <option value="mandatory_technician_supplied">Technician Mandatory (Genuine OEM Parts)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-foreground-secondary block mb-1">
                    Max Material Markup (%)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="50"
                    value={editingMaterial.markupPercent}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        markupPercent: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
                <div>
                  <label className="font-bold text-foreground-secondary block mb-1">
                    Warranty Duration (Days)
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="365"
                    value={editingMaterial.warrantyDays}
                    onChange={(e) =>
                      setEditingMaterial({
                        ...editingMaterial,
                        warrantyDays: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-muted/20 rounded-xl border border-border">
                <div>
                  <span className="font-bold text-primary block">Pre-Approval Required</span>
                  <span className="text-[10px] text-foreground-muted block">
                    Customer must verify and accept in-app quote before technician installs parts exceeding ₹500
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={editingMaterial.requiresPreApproval}
                  onChange={(e) =>
                    setEditingMaterial({
                      ...editingMaterial,
                      requiresPreApproval: e.target.checked,
                    })
                  }
                  className="h-4 w-4 rounded text-accent focus:ring-accent"
                />
              </div>

              <div>
                <label className="font-bold text-foreground-secondary block mb-1">
                  Policy Notes & Verification Guidelines
                </label>
                <Input
                  type="text"
                  value={editingMaterial.notes || ""}
                  onChange={(e) =>
                    setEditingMaterial({ ...editingMaterial, notes: e.target.value })
                  }
                />
              </div>
            </div>

            <DialogFooter className="gap-2">
              <Button variant="outline" size="sm" onClick={() => setEditingMaterial(null)}>
                Cancel
              </Button>
              <Button variant="accent" size="sm" onClick={handleSaveMaterialRule} className="font-bold">
                Save Material Rule
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
