import { useState, useEffect, useRef } from "react";
import {
  Navigation,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Radio,
  Pause,
  Play,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trackingEngine } from "@/services/tracking/tracking.engine";
import type { LocationCoordinates } from "@/types/service-architecture.types";

interface LiveLocationTransmitterProps {
  bookingId: string;
  professionalId: string;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  isActive: boolean;
  onSessionEnded?: () => void;
}

export function LiveLocationTransmitter({
  bookingId,
  professionalId,
  destination,
  isActive,
  onSessionEnded,
}: LiveLocationTransmitterProps) {
  const [isSharing, setIsSharing] = useState(isActive);
  const [lastCoords, setLastCoords] = useState<LocationCoordinates | null>(null);
  const [pingsSentCount, setPingsSentCount] = useState(0);
  const [gpsError, setGpsError] = useState<string | null>(null);
  const watchIdRef = useRef<number | null>(null);

  // Start / stop geolocation watcher based on sharing state
  useEffect(() => {
    if (!isSharing || !isActive) {
      if (watchIdRef.current !== null) {
        navigator.geolocation?.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      return;
    }

    if (!("geolocation" in navigator)) {
      setGpsError("Device does not support GPS Geolocation.");
      return;
    }

    // Initial session activation
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const initialCoords: LocationCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || 0,
          speed: pos.coords.speed || 0,
          timestamp: pos.timestamp,
        };
        setLastCoords(initialCoords);
        trackingEngine.startLocationSession(bookingId, professionalId, initialCoords, destination);
      },
      (err) => {
        setGpsError(`Location error: ${err.message}. Please enable location permissions.`);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );

    // Watch position for continuous real foreground updates
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords: LocationCoordinates = {
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
          heading: pos.coords.heading || 0,
          speed: pos.coords.speed || 0,
          timestamp: pos.timestamp,
        };
        setLastCoords(coords);
        setPingsSentCount((c) => c + 1);
        setGpsError(null);

        // Transmit over Supabase Realtime Broadcast
        trackingEngine.transmitLocationPing(bookingId, coords, destination, "ON_THE_WAY");
      },
      (err) => {
        console.warn("[Transmitter] Watch position warning:", err.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000,
      }
    );

    watchIdRef.current = watchId;

    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [isSharing, isActive, bookingId, professionalId, destination]);

  const toggleSharing = () => {
    setIsSharing((prev) => !prev);
  };

  const openGoogleMapsNav = () => {
    const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.latitude},${destination.longitude}&travelmode=driving`;
    window.open(mapsUrl, "_blank", "noopener,noreferrer");
  };

  if (!isActive) return null;

  return (
    <Card className="border-amber-400/40 bg-linear-to-br from-amber-500/10 via-amber-500/5 to-transparent p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="relative">
            <Radio className="w-5 h-5 text-amber-600 animate-pulse" />
            <span className="absolute -inset-1 rounded-full border border-amber-500 animate-ping opacity-70" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>LIVE LOCATION SHARING</span>
              <Badge className={isSharing ? "bg-emerald-600 text-white text-[9px] px-1.5" : "bg-slate-400 text-white text-[9px]"}>
                {isSharing ? "ACTIVE" : "PAUSED"}
              </Badge>
            </h4>
            <p className="text-[10px] text-slate-500">
              Customer can see your live progress on their map
            </p>
          </div>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={toggleSharing}
          className="h-8 text-xs font-semibold px-2.5 rounded-lg border-amber-300 hover:bg-amber-100"
        >
          {isSharing ? (
            <>
              <Pause className="w-3.5 h-3.5 mr-1 text-amber-700" /> Pause
            </>
          ) : (
            <>
              <Play className="w-3.5 h-3.5 mr-1 text-emerald-700" /> Resume
            </>
          )}
        </Button>
      </div>

      {gpsError ? (
        <div className="bg-rose-50 border border-rose-200 rounded-lg p-2.5 text-xs text-rose-700 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
          <span>{gpsError}</span>
        </div>
      ) : lastCoords ? (
        <div className="grid grid-cols-3 gap-2 bg-white/80 backdrop-blur rounded-xl p-2.5 border border-amber-200 text-center text-[11px]">
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-semibold">Coordinates</p>
            <p className="font-mono font-bold text-slate-700">
              {lastCoords.latitude.toFixed(4)}, {lastCoords.longitude.toFixed(4)}
            </p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-semibold">Accuracy</p>
            <p className="font-bold text-slate-700">±{Math.round(lastCoords.accuracy || 10)}m</p>
          </div>
          <div>
            <p className="text-[9px] text-slate-400 uppercase font-semibold">Pings Sent</p>
            <p className="font-bold text-emerald-600">{pingsSentCount}</p>
          </div>
        </div>
      ) : (
        <p className="text-[11px] text-slate-500 italic">Acquiring device GPS fix...</p>
      )}

      {/* External Google Navigation SDK / Maps Action */}
      <div className="pt-1 flex items-center gap-2">
        <Button
          variant="accent"
          size="sm"
          onClick={openGoogleMapsNav}
          className="w-full h-9 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm"
        >
          <Navigation className="w-4 h-4" />
          <span>Open in Google Maps Navigation</span>
          <ExternalLink className="w-3 h-3 opacity-70" />
        </Button>
      </div>
    </Card>
  );
}
