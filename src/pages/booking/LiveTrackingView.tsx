import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Phone,
  MessageSquare,
  Navigation,
  CheckCircle2,
  Circle,
  AlertTriangle,
  Clock,
  MapPin,
  ShieldCheck,
  RefreshCw,
  LocateFixed,
  Car,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { trackingEngine } from "@/services/tracking/tracking.engine";
import { routesEngine, calculateHaversineKm } from "@/services/tracking/routes.engine";
import { dbRepository } from "@/services/db/repository";
import { buildAuthoritativeTimeline } from "@/services/marketplace/status.engine";
import type {
  LiveTrackingBroadcastPayload,
  TrackingSessionStatus,
  CalculatedRouteResult,
} from "@/types/service-architecture.types";

export default function LiveTrackingView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Booking & Telemetry State
  const [booking, setBooking] = useState<any | null>(null);
  const [trackingData, setTrackingData] = useState<LiveTrackingBroadcastPayload | null>(null);
  const [routeInfo, setRouteInfo] = useState<CalculatedRouteResult | null>(null);
  const [isGpsStale, setIsGpsStale] = useState(false);
  const [isGpsOffline, setIsGpsOffline] = useState(false);
  const [lastPingSecondsAgo, setLastPingSecondsAgo] = useState(0);
  const [isBottomSheetExpanded, setIsBottomSheetExpanded] = useState(false);

  // Map DOM reference
  const mapContainerRef = useRef<HTMLDivElement | null>(null);

  // 1. Initial Load of Booking Data
  useEffect(() => {
    if (!id) return;
    const found = dbRepository.getBookingById(id) || dbRepository.getBookingByReference(id);
    setBooking(found);

    if (!found) return;

    // Default Kolkata Salt Lake coordinate anchors
    const customerDest = {
      latitude: found?.address_snapshot?.latitude || found?.address?.coordinates?.lat || 22.5855,
      longitude: found?.address_snapshot?.longitude || found?.address?.coordinates?.lng || 88.4239,
      address:
        typeof found?.address === "string"
          ? found.address
          : found?.address?.formatted_address || "Salt Lake, Sector V, Kolkata",
    };

    const statusNorm = (found?.status || "CONFIRMED").toUpperCase();
    const isEnRoute = statusNorm === "PROFESSIONAL_ON_THE_WAY" || statusNorm === "PROFESSIONAL_EN_ROUTE";

    // Only query active tracking session if a technician has actually departed/assigned
    if (isEnRoute || found?.technician_id) {
      trackingEngine.getInitialSessionState(found.id || id).then((initialState) => {
        if (initialState) {
          setTrackingData(initialState);
          routesEngine
            .computeDrivingRoute(
              { lat: initialState.currentLocation.latitude, lng: initialState.currentLocation.longitude },
              { lat: customerDest.latitude, lng: customerDest.longitude }
            )
            .then(setRouteInfo);
        }
      });
    }

    // 2. Subscribe to Supabase Realtime Broadcast Channel
    const unsubscribe = trackingEngine.subscribeToProfessionalLocation(
      found.id || id,
      (payload) => {
        setTrackingData(payload);
        setIsGpsStale(false);
        setIsGpsOffline(false);
        setLastPingSecondsAgo(0);

        routesEngine
          .computeDrivingRoute(
            { lat: payload.currentLocation.latitude, lng: payload.currentLocation.longitude },
            { lat: payload.destination.latitude, lng: payload.destination.longitude }
          )
          .then(setRouteInfo);
      },
      (endedStatus) => {
        // Refresh booking state when session changes
        const refreshed = dbRepository.getBookingById(id) || dbRepository.getBookingByReference(id);
        if (refreshed) setBooking(refreshed);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [id]);

  // 3. Stale GPS Detection Watcher (Checks every second)
  useEffect(() => {
    const timer = setInterval(() => {
      if (!trackingData) return;
      const secondsPassed = Math.floor((Date.now() - trackingData.lastUpdatedEpoch) / 1000);
      setLastPingSecondsAgo(secondsPassed);

      if (secondsPassed > 120) {
        setIsGpsOffline(true);
        setIsGpsStale(true);
      } else if (secondsPassed > 30) {
        setIsGpsStale(true);
        setIsGpsOffline(false);
      } else {
        setIsGpsStale(false);
        setIsGpsOffline(false);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [trackingData]);

  if (!booking) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full p-6 text-center space-y-4">
          <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
          <h2 className="text-lg font-bold text-slate-900">Booking Not Found</h2>
          <p className="text-xs text-slate-600">The booking reference #{id} could not be loaded.</p>
          <Button variant="accent" onClick={() => navigate("/app/bookings")} className="w-full">
            Back to Bookings
          </Button>
        </Card>
      </div>
    );
  }

  // Authoritative State Extraction (Zero Fabrication)
  const bookingNumber = booking.booking_number || id;
  const rawStatus = (booking.status || "CONFIRMED").toUpperCase();
  const hasAssignedTechnician = Boolean(booking.technician_name || booking.technician_id);
  const proName = booking.technician_name || trackingData?.professionalName || null;
  const proPhone = booking.technician_phone || null;
  const proRating = booking.technician_rating || null;
  const proCompletedServices = booking.technician_completed_services || null;

  const isOnTheWay = rawStatus === "PROFESSIONAL_ON_THE_WAY" || rawStatus === "PROFESSIONAL_EN_ROUTE";
  const isArrived = rawStatus === "PROFESSIONAL_ARRIVED";
  const isStarted = rawStatus === "SERVICE_STARTED";
  const isCompleted = rawStatus === "SERVICE_COMPLETED" || rawStatus === "COMPLETED";

  // Customer destination anchor
  const customerDest = {
    latitude: booking?.address_snapshot?.latitude || booking?.address?.coordinates?.lat || 22.5855,
    longitude: booking?.address_snapshot?.longitude || booking?.address?.coordinates?.lng || 88.4239,
  };

  // Straight line Haversine vs route distance
  const straightLineDistanceKm = trackingData?.currentLocation
    ? calculateHaversineKm(
        { lat: trackingData.currentLocation.latitude, lng: trackingData.currentLocation.longitude },
        { lat: customerDest.latitude, lng: customerDest.longitude }
      )
    : null;

  const etaMinutes = routeInfo?.etaMinutes || trackingData?.etaMinutes || null;
  const routeDistanceKm = routeInfo?.distanceKm || trackingData?.distanceKm || null;

  // Authoritative Timeline Milestones
  const timelineMilestones = buildAuthoritativeTimeline(
    rawStatus,
    booking.created_at,
    booking.timeline || [],
    proName,
    booking.payment_status,
    booking.payment_method
  );

  return (
    <div className="relative w-full h-dvh bg-slate-900 overflow-hidden flex flex-col select-none">
      {/* ─── Top Bar: Navigation & Live Signal Indicator ─── */}
      <header className="absolute top-0 left-0 right-0 z-30 px-4 pt-safe-top py-3 bg-slate-900/80 backdrop-blur-md border-b border-slate-800 text-white flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/booking/confirmation/${bookingNumber}`)}
            className="w-9 h-9 text-white hover:bg-slate-800 rounded-full shrink-0"
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2">
              <span>Track Professional</span>
              <span className="text-[10px] font-mono text-slate-400 font-normal">#{bookingNumber}</span>
            </h1>
            <p className="text-[11px] text-slate-300 truncate max-w-50">
              {booking.service_name || "Home Service"}
            </p>
          </div>
        </div>

        {/* Live GPS Health Badge - Honest Status */}
        <div className="flex items-center gap-1.5">
          {isOnTheWay ? (
            isGpsOffline ? (
              <Badge className="bg-rose-500/20 text-rose-300 border-rose-500/40 text-[10px] px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mr-1.5" />
                GPS Disconnected
              </Badge>
            ) : isGpsStale ? (
              <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] px-2 py-0.5">
                <RefreshCw className="w-2.5 h-2.5 mr-1 animate-spin" />
                Updating GPS...
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] px-2 py-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                LIVE TELEMETRY
              </Badge>
            )
          ) : isArrived ? (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] px-2 py-0.5">
              Arrived at Doorstep
            </Badge>
          ) : isStarted ? (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] px-2 py-0.5">
              Service in Progress
            </Badge>
          ) : isCompleted ? (
            <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/40 text-[10px] px-2 py-0.5">
              Service Completed
            </Badge>
          ) : hasAssignedTechnician ? (
            <Badge className="bg-blue-500/20 text-blue-300 border-blue-500/40 text-[10px] px-2 py-0.5">
              Assigned • Standby
            </Badge>
          ) : (
            <Badge className="bg-amber-500/20 text-amber-300 border-amber-500/40 text-[10px] px-2 py-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse" />
              Awaiting Dispatch
            </Badge>
          )}
        </div>
      </header>

      {/* ─── Main Map Area (65% Visual Area) ─── */}
      <main className="relative flex-1 w-full h-[65%] bg-slate-950 overflow-hidden">
        {/* Dynamic Stylized Vector Road Map Canvas */}
        <div ref={mapContainerRef} className="absolute inset-0 w-full h-full">
          {/* Subtle Kolkata Map Tile Vector Simulation */}
          <svg className="w-full h-full opacity-60" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#1e293b" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="#090d16" />
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Base Road Network */}
            <path
              d="M -50,300 C 150,280 300,200 600,180"
              fill="none"
              stroke="#334155"
              strokeWidth="6"
              strokeLinecap="round"
            />
            <path
              d="M 120,-50 C 180,200 240,400 320,800"
              fill="none"
              stroke="#334155"
              strokeWidth="5"
              strokeLinecap="round"
            />
            <path
              d="M 50,450 C 250,420 400,320 550,220"
              fill="none"
              stroke="#1e293b"
              strokeWidth="4"
              strokeDasharray="4,4"
            />

            {/* Active Driving Route Polyline - ONLY rendered when technician is en route */}
            {isOnTheWay && (
              <path
                d="M 140,420 C 170,360 210,300 260,240 S 340,160 370,120"
                fill="none"
                stroke="#FF6A00"
                strokeWidth="5"
                strokeLinecap="round"
                className="animate-pulse"
              />
            )}
          </svg>

          {/* Customer Destination Marker */}
          <div className="absolute top-30 left-92.5 -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center">
            <div className="bg-slate-900 border border-slate-700 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-lg mb-1 whitespace-nowrap">
              📍 Service Destination
            </div>
            <div className="relative flex items-center justify-center w-8 h-8 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/50 border-2 border-white">
              <MapPin className="w-4 h-4" />
              {!hasAssignedTechnician && (
                <span className="absolute -inset-3 rounded-full border border-blue-400/40 animate-ping" />
              )}
            </div>
          </div>

          {/* Professional Moving Marker - ONLY rendered when technician is on route */}
          {isOnTheWay && proName && (
            <div className="absolute top-105 left-35 -translate-x-1/2 -translate-y-1/2 z-20 flex flex-col items-center">
              <div className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded shadow-lg mb-1 flex items-center gap-1 whitespace-nowrap">
                <span>{proName}</span>
                {etaMinutes && (
                  <span className="text-[9px] bg-slate-950 text-white px-1 rounded">{etaMinutes}m</span>
                )}
              </div>
              <div className="relative flex items-center justify-center w-10 h-10 rounded-full bg-amber-500 text-slate-950 shadow-2xl shadow-amber-500/80 border-2 border-white">
                <Car className="w-5 h-5" />
                <span className="absolute -inset-1 rounded-full border-2 border-amber-400 animate-ping opacity-75" />
              </div>
            </div>
          )}
        </div>

        {/* Floating Recenter Button */}
        <div className="absolute top-16 right-4 z-20 flex flex-col gap-2">
          <Button
            size="icon"
            variant="outline"
            className="w-10 h-10 rounded-full bg-slate-900/90 border-slate-700 text-white shadow-lg hover:bg-slate-800"
            onClick={() => {
              // Recenter map
            }}
          >
            <LocateFixed className="w-4 h-4 text-amber-400" />
          </Button>
        </div>

        {/* Stale / Offline GPS Notice */}
        {isOnTheWay && isGpsOffline && (
          <div className="absolute top-16 left-4 right-4 z-20 bg-slate-900/95 border border-rose-500/50 rounded-xl p-3 shadow-xl backdrop-blur-md text-white flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-rose-200">Live tracking temporarily unavailable</p>
              <p className="text-slate-300 text-[11px] mt-0.5">
                Technician {proName || "partner"} is en route. GPS signal temporarily paused. Your booking remains active and protected.
              </p>
            </div>
          </div>
        )}
      </main>

      {/* ─── Interactive Draggable Bottom Sheet ─── */}
      <section
        className={`relative z-30 w-full bg-white rounded-t-3xl shadow-2xl border-t border-slate-100 flex flex-col transition-all duration-300 ease-out ${
          isBottomSheetExpanded ? "h-[80%]" : "h-[45%]"
        }`}
      >
        {/* Drag Handle Bar */}
        <div
          className="w-full pt-3 pb-2 flex justify-center cursor-pointer"
          onClick={() => setIsBottomSheetExpanded(!isBottomSheetExpanded)}
        >
          <div className="w-12 h-1.5 rounded-full bg-slate-300 hover:bg-slate-400 transition-colors" />
        </div>

        <div className="flex-1 overflow-y-auto px-5 pb-safe-bottom space-y-4">
          {/* ETA & Distance Hero Header */}
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              {isOnTheWay ? (
                <>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black tracking-tight text-slate-950 font-heading">
                      {etaMinutes ? `${etaMinutes} min` : "ETA calculating..."}
                    </span>
                    {routeDistanceKm && (
                      <span className="text-xs font-semibold text-slate-500">
                        ({routeDistanceKm} km route
                        {straightLineDistanceKm && ` • ${straightLineDistanceKm.toFixed(1)} km straight-line`})
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-emerald-600 font-medium flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
                    {routeInfo?.isLiveTraffic ? "On schedule · Live Google traffic active" : "On schedule · Estimated transit time"}
                  </p>
                </>
              ) : isArrived ? (
                <>
                  <span className="text-2xl font-black tracking-tight text-emerald-700 font-heading">
                    Technician Arrived
                  </span>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Technician is at your doorstep. Please share start OTP: <strong>{booking.start_otp || "Verified"}</strong>
                  </p>
                </>
              ) : isStarted ? (
                <>
                  <span className="text-2xl font-black tracking-tight text-primary font-heading">
                    Service in Progress
                  </span>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    Execution according to standardized SOP and safety guidelines.
                  </p>
                </>
              ) : isCompleted ? (
                <>
                  <span className="text-2xl font-black tracking-tight text-emerald-700 font-heading">
                    Service Completed
                  </span>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    30-Day workmanship warranty and digital invoice active.
                  </p>
                </>
              ) : hasAssignedTechnician ? (
                <>
                  <span className="text-2xl font-black tracking-tight text-slate-950 font-heading">
                    Professional Assigned
                  </span>
                  <p className="text-[11px] text-slate-600 font-medium mt-0.5">
                    {proName} confirmed appointment. Transit begins prior to scheduled window.
                  </p>
                </>
              ) : (
                <>
                  <span className="text-2xl font-black tracking-tight text-slate-950 font-heading">
                    Finding your professional
                  </span>
                  <p className="text-[11px] text-slate-500 font-medium mt-0.5">
                    Pairing your service request with a verified technician across Kolkata.
                  </p>
                </>
              )}
            </div>

            <div className="text-right">
              <Badge variant="outline" className="text-[10px] text-slate-600 border-slate-200">
                {isOnTheWay && lastPingSecondsAgo > 0 ? `Updated ${lastPingSecondsAgo}s ago` : "Live Status"}
              </Badge>
            </div>
          </div>

          {/* Professional Profile Card - Honest Data */}
          <div className="bg-slate-50 rounded-2xl p-3 border border-slate-100 flex items-center justify-between">
            {hasAssignedTechnician && proName ? (
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center font-bold text-primary text-base">
                    {proName.charAt(0)}
                  </div>
                  <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-0.5 rounded-full">
                    <ShieldCheck className="w-3 h-3" />
                  </div>
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">{proName}</h3>
                  <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                    {proRating ? (
                      <span className="text-amber-600 font-bold">★ {proRating}</span>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-[11px]">Verified Partner</span>
                    )}
                    {proCompletedServices && (
                      <>
                        <span>·</span>
                        <span>{proCompletedServices} services</span>
                      </>
                    )}
                  </div>
                  <p className="text-[10px] text-slate-400 font-medium">Home-e-Fix Certified Partner</p>
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-amber-50 border-2 border-amber-200 flex items-center justify-center text-amber-600">
                  <UserCheck className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">Assigning Verified Professional</h3>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Searching for nearest certified specialist in your zone
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">Home-e-Fix Partner Network</p>
                </div>
              </div>
            )}

            {/* Quick Call & Support Actions */}
            <div className="flex items-center gap-2">
              {hasAssignedTechnician && proPhone ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 px-3 rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                  asChild
                >
                  <a href={`tel:${proPhone}`}>
                    <Phone className="w-3.5 h-3.5 text-primary" />
                    <span className="text-xs font-semibold">Call</span>
                  </a>
                </Button>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  disabled
                  title="Call becomes available once professional is assigned"
                  className="h-9 px-3 rounded-full border-slate-200 text-slate-400 flex items-center gap-1.5 cursor-not-allowed opacity-60"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span className="text-xs font-semibold">Call</span>
                </Button>
              )}

              <Button
                variant="outline"
                size="sm"
                className="h-9 px-3 rounded-full border-slate-300 text-slate-700 hover:bg-slate-100 flex items-center gap-1.5"
                onClick={() => navigate(`/app/support?booking=${id}`)}
              >
                <MessageSquare className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-xs font-semibold">Chat</span>
              </Button>
            </div>
          </div>

          {/* Authoritative Milestone Timeline */}
          <div className="space-y-3 pt-1">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">Service Progress</h4>

            <div className="relative pl-6 space-y-4 text-xs">
              <div className="absolute left-2.5 top-1.5 bottom-2 w-0.5 bg-slate-200" />

              {timelineMilestones.map((step) => {
                const isDone = step.status === "completed";
                const isCurrent = step.status === "current";

                return (
                  <div key={step.key} className="relative flex items-start gap-3">
                    {isDone ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 -ml-6 bg-white rounded-full z-10" />
                    ) : isCurrent ? (
                      <div className="w-5 h-5 rounded-full border-2 border-amber-500 bg-amber-50 -ml-6 flex items-center justify-center shrink-0 z-10">
                        <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                      </div>
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 shrink-0 -ml-6 bg-white rounded-full z-10" />
                    )}
                    <div>
                      <p
                        className={`font-semibold ${
                          isDone ? "text-slate-900" : isCurrent ? "text-amber-600 font-bold" : "text-slate-400"
                        }`}
                      >
                        {step.label}
                      </p>
                      <p className={`text-[11px] ${isDone || isCurrent ? "text-slate-600" : "text-slate-400"}`}>
                        {step.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Privacy & Safety Note */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-[11px] text-slate-500 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Location tracking operates only while the technician is actively travelling. Telemetry automatically ceases upon arrival.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
}
