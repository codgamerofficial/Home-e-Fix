import { useState } from "react";
import { Bell, Shield, Smartphone, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TechnicianSettings() {
  const [soundAlerts, setSoundAlerts] = useState(true);
  const [autoNavigate, setAutoNavigate] = useState(true);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">App & Account Settings</h1>
        <p className="text-sm text-foreground-secondary">
          Configure notification alarms, GPS map preferences, and security settings.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-surface p-6 space-y-6 shadow-sm max-w-2xl">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-primary flex items-center gap-2">
              <Bell className="h-4 w-4 text-accent" /> High Priority Job Alerts
            </h4>
            <p className="text-xs text-foreground-secondary">
              Play loud audio siren when high-value emergency job is dispatched nearby.
            </p>
          </div>
          <input
            type="checkbox"
            checked={soundAlerts}
            onChange={(e) => setSoundAlerts(e.target.checked)}
            className="h-5 w-5 accent-accent"
          />
        </div>

        <div className="border-t border-border pt-4 flex items-center justify-between">
          <div className="space-y-0.5">
            <h4 className="font-bold text-sm text-primary flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-accent" /> Auto-Open Google Maps
            </h4>
            <p className="text-xs text-foreground-secondary">
              Directly launch GPS turn-by-turn navigation upon accepting customer job.
            </p>
          </div>
          <input
            type="checkbox"
            checked={autoNavigate}
            onChange={(e) => setAutoNavigate(e.target.checked)}
            className="h-5 w-5 accent-accent"
          />
        </div>
      </div>
    </div>
  );
}
