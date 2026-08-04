import { useState } from "react";
import { Power, Clock, MapPin, ShieldCheck, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Availability() {
  const [isOnline, setIsOnline] = useState(true);
  const [serviceRadius, setServiceRadius] = useState(12);

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Duty Status & Availability</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Toggle online status to start receiving real-time job dispatch notifications
        </p>
      </div>

      {/* ONLINE / OFFLINE TOGGLE BANNER */}
      <Card className={`p-6 border transition-colors ${
        isOnline ? "border-emerald-500/30 bg-emerald-500/5" : "border-border bg-surface"
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white ${
              isOnline ? "bg-emerald-600 shadow-lg shadow-emerald-600/30 animate-pulse" : "bg-slate-400"
            }`}>
              <Power className="h-6 w-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-lg font-bold text-primary">
                  {isOnline ? "Online & Ready for Jobs" : "Offline"}
                </h3>
                <Badge variant={isOnline ? "secondary" : "outline"} className={isOnline ? "text-emerald-600 bg-emerald-50" : ""}>
                  {isOnline ? "🟢 Active" : "🔴 Inactive"}
                </Badge>
              </div>
              <p className="text-xs text-foreground-secondary mt-0.5">
                {isOnline ? "Receiving job requests within 12 km radius" : "Turn online when you are ready to accept service requests"}
              </p>
            </div>
          </div>

          <Button
            variant={isOnline ? "outline" : "accent"}
            size="default"
            onClick={() => setIsOnline(!isOnline)}
            className="font-bold"
          >
            {isOnline ? "Go Offline" : "Go Online Now"}
          </Button>
        </div>
      </Card>

      {/* SERVICE RADIUS CONFIG */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border flex items-center gap-2">
          <MapPin className="h-4 w-4 text-accent" /> Service Radius Range
        </h3>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-foreground-secondary">Maximum Travel Distance:</span>
            <span className="font-heading text-sm font-bold text-accent">{serviceRadius} km</span>
          </div>

          <input
            type="range"
            min="5"
            max="30"
            step="1"
            value={serviceRadius}
            onChange={(e) => setServiceRadius(Number(e.target.value))}
            className="w-full accent-accent cursor-pointer"
          />

          <div className="flex justify-between text-[10px] text-foreground-muted">
            <span>5 km (Local)</span>
            <span>15 km (City Center)</span>
            <span>30 km (Metropolitan)</span>
          </div>
        </div>
      </Card>
    </div>
  );
}
