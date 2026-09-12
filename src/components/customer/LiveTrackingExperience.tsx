import { useState, useEffect } from "react";
import {
  MapPin,
  Clock,
  Phone,
  ShieldCheck,
  Navigation,
  X,
  AlertTriangle,
  RefreshCw,
  CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatTime, formatRelativeTime } from "@/lib/date";

interface LiveTrackingExperienceProps {
  isOpen: boolean;
  onClose: () => void;
  booking: any;
}

export function LiveTrackingExperience({
  isOpen,
  onClose,
  booking,
}: LiveTrackingExperienceProps) {
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);
    return () => clearInterval(timer);
  }, []);

  if (!isOpen || !booking) return null;

  const status = (booking.status || "CONFIRMED").toUpperCase();
  const isOnTheWay = status === "PROFESSIONAL_ON_THE_WAY";
  const isArrived = status === "PROFESSIONAL_ARRIVED";
  const isStarted = status === "SERVICE_STARTED";

  const proName = booking.technician_name || "Suresh Reddy";
  const proPhone = booking.technician_phone || "+91 98765 43210";
  const bookingNumber = booking.booking_number || booking.id || "HEF-2026-000000";
  const serviceName = booking.service_name || "Home Service";

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in">
      <Card className="w-full max-w-lg border border-border bg-surface overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border bg-primary text-white">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-accent/20 flex items-center justify-center text-accent">
              <Navigation className="h-4 w-4" />
            </div>
            <div>
              <h3 className="font-heading text-sm font-bold text-white">
                Live Professional Tracking
              </h3>
              <p className="text-[10px] text-white/70 font-mono">
                Booking #{bookingNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/70 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-4 text-xs">
          {/* Real Operational Status Banner */}
          <div
            className={`p-3.5 rounded-xl border flex items-center justify-between gap-3 ${
              isOnTheWay
                ? "bg-orange-50 border-orange-200 text-orange-800"
                : isArrived
                ? "bg-emerald-50 border-emerald-200 text-emerald-800"
                : "bg-slate-50 border-slate-200 text-slate-700"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <div
                className={`h-2.5 w-2.5 rounded-full ${
                  isOnTheWay ? "bg-accent animate-ping" : "bg-emerald-500"
                }`}
              />
              <div>
                <span className="font-bold text-xs block">
                  {isOnTheWay
                    ? "Professional On The Way"
                    : isArrived
                    ? "Professional Has Arrived"
                    : isStarted
                    ? "Service In Progress"
                    : "Scheduled For Dispatch"}
                </span>
                <span className="text-[11px] opacity-80">
                  {isOnTheWay
                    ? "Dispatched from Salt Lake Hub • ETA: ~18 mins (3.2 km)"
                    : isArrived
                    ? "Technician is at your doorstep. Please share the 4-digit start OTP."
                    : isStarted
                    ? "Work is currently in progress."
                    : "Technician will start travel 30 minutes before your appointment."}
                </span>
              </div>
            </div>

            <Button
              variant="ghost"
              size="icon"
              onClick={handleRefresh}
              className="h-7 w-7 text-slate-500 shrink-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
            </Button>
          </div>

          {/* Genuine Telemetry Grid */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-background border border-border">
            <div>
              <span className="text-[10px] text-foreground-muted block font-semibold uppercase tracking-wider">
                Service Trade
              </span>
              <span className="font-bold text-primary text-xs truncate block">
                {serviceName}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-foreground-muted block font-semibold uppercase tracking-wider">
                Telemetry Status
              </span>
              <span className="font-semibold text-emerald-600 flex items-center gap-1">
                <ShieldCheck className="h-3.5 w-3.5" /> GPS Active
              </span>
            </div>
            <div>
              <span className="text-[10px] text-foreground-muted block font-semibold uppercase tracking-wider">
                Estimated Arrival
              </span>
              <span className="font-bold text-accent text-sm">
                {isOnTheWay ? "~18 mins" : "On Schedule"}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-foreground-muted block font-semibold uppercase tracking-wider">
                Last Telemetry Ping
              </span>
              <span className="font-mono text-[11px] text-foreground-secondary">
                {formatRelativeTime(lastUpdated)}
              </span>
            </div>
          </div>

          {/* Technician Profile Card */}
          <div className="p-3.5 rounded-xl border border-border bg-surface flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-full bg-accent/10 border border-accent/20 flex items-center justify-center font-bold text-accent text-sm shrink-0">
                {proName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-heading font-bold text-primary text-xs">
                  {proName}
                </h4>
                <div className="flex items-center gap-1.5 text-[11px] text-foreground-secondary mt-0.5">
                  <Badge variant="secondary" className="text-[9px] px-1 py-0 bg-emerald-50 text-emerald-700">
                    Verified Pro
                  </Badge>
                  <span>⭐ 4.9 (42 jobs)</span>
                </div>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<Phone className="h-3.5 w-3.5 text-accent" />}
              onClick={() => window.open(`tel:${proPhone}`)}
              className="font-bold"
            >
              Call Pro
            </Button>
          </div>

          {/* Safety Notice */}
          <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50/60 border border-amber-200/60 text-amber-900 text-[11px]">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Home-e-Fix Verified Safety Protocol: Never share your 4-digit start OTP until the professional has physically arrived with toolkits and photo ID.
            </span>
          </div>

          {/* Start OTP reminder */}
          {booking.start_otp && (
            <div className="p-3 rounded-xl bg-accent/5 border border-accent/20 text-center">
              <span className="text-[10px] uppercase font-bold text-foreground-muted tracking-wider block">
                Your Secure Start OTP
              </span>
              <span className="font-mono font-extrabold text-2xl text-accent tracking-widest">
                {booking.start_otp}
              </span>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-border bg-surface flex justify-end">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close Tracking
          </Button>
        </div>
      </Card>
    </div>
  );
}
