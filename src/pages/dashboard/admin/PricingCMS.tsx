import { useState, useEffect } from "react";
import { Sliders, DollarSign, ShieldAlert, Check, Save, RotateCcw, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { dbRepository, type PricingConfig } from "@/services/db/repository";

export default function PricingCMS() {
  const [config, setConfig] = useState<PricingConfig>({
    standardVisitFee: 199,
    emergencySurcharge: 499,
    partnerLabourSplitPercent: 80,
    gstRatePercent: 18,
  });

  const [savedMsg, setSavedMsg] = useState("");

  useEffect(() => {
    setConfig(dbRepository.getPricingConfig());
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    dbRepository.savePricingConfig(config);
    setSavedMsg("Pricing rules and commission parameters saved successfully!");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  const handleReset = () => {
    const defaults = {
      standardVisitFee: 199,
      emergencySurcharge: 499,
      partnerLabourSplitPercent: 80,
      gstRatePercent: 18,
    };
    setConfig(defaults);
    dbRepository.savePricingConfig(defaults);
    setSavedMsg("Pricing parameters restored to platform defaults.");
    setTimeout(() => setSavedMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Dynamic Pricing & Fee Engine</h1>
          <p className="text-sm text-foreground-secondary">
            Configure system-wide inspection fees, emergency dispatch surcharges, and partner payouts
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleReset} className="h-9 gap-1 text-xs">
            <RotateCcw className="h-3.5 w-3.5" /> Reset Defaults
          </Button>
          <Button variant="accent" size="sm" onClick={handleSave} className="h-9 gap-1.5 shadow-glow font-bold text-xs">
            <Save className="h-4 w-4" /> Save Rules
          </Button>
        </div>
      </div>

      {savedMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {savedMsg}
        </div>
      )}

      <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-accent" /> Base Fee Parameters
          </h3>

          <div className="space-y-3 text-sm">
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
                Waived automatically if service labour bill exceeds ₹500
              </span>
            </div>

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
                Instant 45-minute arrival guarantee SLA window
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <Sliders className="h-5 w-5 text-accent" /> Payout & Tax Breakdown
          </h3>

          <div className="space-y-3 text-sm">
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
              <span className="text-[11px] text-foreground-muted">
                Platform retains {100 - config.partnerLabourSplitPercent}% for insurance, escrow & support
              </span>
            </div>

            <div>
              <label className="text-xs font-bold text-foreground-secondary block mb-1">
                Applicable GST Rate (%)
              </label>
              <Input
                type="number"
                min="0"
                max="28"
                value={config.gstRatePercent}
                onChange={(e) =>
                  setConfig({ ...config, gstRatePercent: Number(e.target.value) || 18 })
                }
              />
              <span className="text-[11px] text-foreground-muted">
                Standard 18% GST on platform convenience and taxable services
              </span>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
