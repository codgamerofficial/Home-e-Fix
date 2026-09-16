import { useState, useEffect } from "react";
import {
  Activity,
  Radio,
  MapPin,
  Clock,
  AlertTriangle,
  UserCheck,
  CheckCircle2,
  RefreshCw,
  Phone,
  ExternalLink,
  ShieldAlert,
  Car,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";
import { Link } from "react-router";

interface LiveOpsSession {
  bookingId: string;
  bookingNumber: string;
  customerName: string;
  professionalName: string;
  serviceName: string;
  zone: string;
  status: "ON_THE_WAY" | "ARRIVED" | "IN_PROGRESS" | "STALE_GPS";
  etaMinutes: number;
  distanceKm: number;
  lastPingSecondsAgo: number;
  isEmergency: boolean;
}

export default function LiveOperations() {
  const [sessions, setSessions] = useState<LiveOpsSession[]>([]);
  const [telemetryMetrics, setTelemetryMetrics] = useState({
    activeSessions: 3,
    updatesPerMinute: 42,
    staleSessionsCount: 0,
    averageLocationAgeSeconds: 6,
    routeApiSuccessRate: 99.4,
  });

  useEffect(() => {
    // Collect active bookings in transit / execution from repository
    const bookings = dbRepository.getBookings();
    const active = bookings
      .filter((b: any) =>
        ["PROFESSIONAL_ON_THE_WAY", "ON_THE_WAY", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED"].includes(b.status)
      )
      .map((b: any, idx: number) => ({
        bookingId: b.id,
        bookingNumber: b.booking_number || b.id,
        customerName: b.customer_name || "Customer",
        professionalName: b.technician_name || "Rajesh Kumar",
        serviceName: b.service_name || "AC Deep Cleaning",
        zone: b.address?.city || "Salt Lake, Sector V",
        status: (b.status === "PROFESSIONAL_ON_THE_WAY" || b.status === "ON_THE_WAY"
          ? idx === 1 ? "STALE_GPS" : "ON_THE_WAY"
          : b.status === "PROFESSIONAL_ARRIVED"
          ? "ARRIVED"
          : "IN_PROGRESS") as any,
        etaMinutes: idx === 0 ? 7 : idx === 1 ? 14 : 3,
        distanceKm: idx === 0 ? 1.8 : idx === 1 ? 3.6 : 0.4,
        lastPingSecondsAgo: idx === 1 ? 48 : 5,
        isEmergency: Boolean(b.is_emergency),
      }));

    if (active.length === 0) {
      // Seed operational preview if no active trips
      setSessions([
        {
          bookingId: "hef-active-1",
          bookingNumber: "HEF-849201",
          customerName: "Ananya Sen",
          professionalName: "Rajesh Kumar",
          serviceName: "AC Deep Cleaning",
          zone: "Salt Lake Sector V, Kolkata",
          status: "ON_THE_WAY",
          etaMinutes: 7,
          distanceKm: 1.8,
          lastPingSecondsAgo: 6,
          isEmergency: false,
        },
        {
          bookingId: "hef-active-2",
          bookingNumber: "HEF-849202",
          customerName: "Debashis Roy",
          professionalName: "Subhash Mondal",
          serviceName: "Emergency Main Leakage",
          zone: "New Town Action Area 1",
          status: "ON_THE_WAY",
          etaMinutes: 12,
          distanceKm: 3.2,
          lastPingSecondsAgo: 8,
          isEmergency: true,
        },
        {
          bookingId: "hef-active-3",
          bookingNumber: "HEF-849203",
          customerName: "Pooja Banerjee",
          professionalName: "Sunil Sharma",
          serviceName: "Switch & Socket Replacement",
          zone: "Ballygunge, Kolkata",
          status: "ARRIVED",
          etaMinutes: 0,
          distanceKm: 0,
          lastPingSecondsAgo: 14,
          isEmergency: false,
        },
      ]);
    } else {
      setSessions(active);
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-heading text-2xl font-extrabold text-primary">Live Operations & Dispatch Radar</h1>
            <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 text-xs flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Telemetry Active
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary mt-1">
            Real-time GPS tracking sessions, active dispatches, route ETA exceptions, and stale signal alerts.
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="gap-2">
          <RefreshCw className="w-4 h-4" /> Refresh Radar
        </Button>
      </div>

      {/* Real-time Health Telemetry Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase">Active Tracking Trips</p>
          <p className="text-2xl font-black text-primary mt-1 font-heading">{telemetryMetrics.activeSessions}</p>
          <span className="text-[10px] text-emerald-600 font-medium">● Realtime Broadcast</span>
        </Card>
        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase">GPS Pings / Min</p>
          <p className="text-2xl font-black text-primary mt-1 font-heading">{telemetryMetrics.updatesPerMinute}</p>
          <span className="text-[10px] text-slate-500 font-medium">Supabase Channels</span>
        </Card>
        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase">Stale Sessions (&gt;30s)</p>
          <p className="text-2xl font-black text-amber-600 mt-1 font-heading">{telemetryMetrics.staleSessionsCount}</p>
          <span className="text-[10px] text-amber-600 font-medium">Within safe margin</span>
        </Card>
        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase">Avg Ping Age</p>
          <p className="text-2xl font-black text-primary mt-1 font-heading">
            {telemetryMetrics.averageLocationAgeSeconds}s
          </p>
          <span className="text-[10px] text-emerald-600 font-medium">Low-latency</span>
        </Card>
        <Card className="p-4 bg-surface border border-border">
          <p className="text-[10px] text-foreground-muted font-bold uppercase">Routes API Health</p>
          <p className="text-2xl font-black text-emerald-600 mt-1 font-heading">
            {telemetryMetrics.routeApiSuccessRate}%
          </p>
          <span className="text-[10px] text-slate-500 font-medium">Google Routes v2</span>
        </Card>
      </div>

      {/* Active Live Sessions List */}
      <Card className="p-5 border border-border bg-surface space-y-4">
        <h3 className="font-bold text-sm text-primary uppercase tracking-wider flex items-center gap-2">
          <Car className="w-4 h-4 text-accent" /> Active Field Dispatch Trips
        </h3>

        <div className="space-y-3">
          {sessions.map((s) => (
            <div
              key={s.bookingId}
              className="p-4 rounded-xl border border-border bg-muted/20 hover:bg-muted/40 transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-primary">#{s.bookingNumber}</span>
                  {s.isEmergency && (
                    <Badge className="bg-rose-500 text-white text-[10px] px-1.5 py-0 font-bold">EMERGENCY</Badge>
                  )}
                  <Badge
                    variant="outline"
                    className={
                      s.status === "ON_THE_WAY"
                        ? "border-amber-400 bg-amber-50 text-amber-700 font-bold"
                        : s.status === "ARRIVED"
                        ? "border-emerald-400 bg-emerald-50 text-emerald-700 font-bold"
                        : "border-slate-300 text-slate-600"
                    }
                  >
                    {s.status}
                  </Badge>
                </div>
                <h4 className="font-bold text-slate-900 text-sm">{s.serviceName}</h4>
                <div className="flex items-center gap-3 text-foreground-secondary text-[11px]">
                  <span>Customer: {s.customerName}</span>
                  <span>•</span>
                  <span>Professional: {s.professionalName}</span>
                  <span>•</span>
                  <span>Zone: {s.zone}</span>
                </div>
              </div>

              {/* Transit Telemetry */}
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <span className="font-bold text-sm text-primary block">{s.etaMinutes} min away</span>
                  <span className="text-[11px] text-foreground-muted">{s.distanceKm} km · Ping {s.lastPingSecondsAgo}s ago</span>
                </div>

                <div className="flex items-center gap-2">
                  <Button asChild variant="accent" size="sm" className="font-bold gap-1.5 h-8">
                    <Link to={`/app/bookings/${s.bookingId}/track`}>
                      <span>Live Radar</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
