import { useState } from "react";
import { Settings, Shield, Globe, Database, Key } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SettingsCMS() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Platform Infrastructure Settings</h1>
        <p className="text-sm text-foreground-secondary">
          Manage operational hub boundaries, API integrations, and system-wide security toggles.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl">
        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <Globe className="h-5 w-5 text-accent" /> Active Operating Regions
          </h3>
          <p className="text-xs text-foreground-secondary">
            Primary launch region: Kolkata Metropolitan Area (KMA), including Salt Lake, New Town, Rajarhat, South Kolkata, Howrah.
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-success flex items-center gap-1">
              ✓ All 5 Regional Dispatch Nodes Online
            </span>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <h3 className="font-bold text-base text-primary flex items-center gap-2">
            <Shield className="h-5 w-5 text-accent" /> Security & Access Controls
          </h3>
          <p className="text-xs text-foreground-secondary">
            Multi-factor authentication (MFA) enabled on Super Admin actions and role-based policy enforcement (RLS).
          </p>
          <div className="pt-2">
            <span className="text-xs font-bold text-accent flex items-center gap-1">
              ✓ Supabase RLS Active
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
