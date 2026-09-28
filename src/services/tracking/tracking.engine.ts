/**
 * HOME-E-FIX: REAL-TIME PROFESSIONAL TRACKING & TELEMETRY ENGINE
 * Implements Supabase Realtime Broadcast architecture for high-frequency GPS streaming
 * (Zero PostgreSQL write bottleneck per ping), with sampled milestone audit snapshots.
 */

import { supabase } from "@/lib/supabase";
import { routesEngine } from "./routes.engine";
import type {
  LocationCoordinates,
  LiveTrackingBroadcastPayload,
  TrackingSessionStatus,
  CalculatedRouteResult,
} from "@/types/service-architecture.types";

interface ActiveBroadcastSession {
  bookingId: string;
  professionalId: string;
  professionalName?: string;
  channel: any;
  lastCoords?: LocationCoordinates;
  lastSnapshotSavedEpoch: number;
}

const activeTransmitters = new Map<string, ActiveBroadcastSession>();

export const trackingEngine = {
  /**
   * Professional side: Start a live location session and connect to the Realtime Broadcast channel.
   */
  async startLocationSession(
    bookingId: string,
    professionalId: string,
    initialCoords: LocationCoordinates,
    destination: { latitude: number; longitude: number; address: string },
    professionalName?: string
  ): Promise<boolean> {
    try {
      const channelName = `booking:${bookingId}:tracking`;
      const channel = supabase.channel(channelName, {
        config: {
          broadcast: { self: false },
        },
      });

      await new Promise<void>((resolve, reject) => {
        channel.subscribe((status: string) => {
          if (status === "SUBSCRIBED") resolve();
          else if (status === "CHANNEL_ERROR") reject(new Error("Channel error"));
        });
      });

      activeTransmitters.set(bookingId, {
        bookingId,
        professionalId,
        professionalName,
        channel,
        lastCoords: initialCoords,
        lastSnapshotSavedEpoch: Date.now(),
      });

      // Compute initial route & ETA
      const route = await routesEngine.computeDrivingRoute(
        { lat: initialCoords.latitude, lng: initialCoords.longitude },
        { lat: destination.latitude, lng: destination.longitude }
      );

      // Persist / upsert session in database
      await supabase.from("professional_location_sessions").upsert(
        {
          booking_id: bookingId,
          professional_id: professionalId,
          status: "ON_THE_WAY",
          started_at: new Date().toISOString(),
          last_latitude: initialCoords.latitude,
          last_longitude: initialCoords.longitude,
          last_accuracy: initialCoords.accuracy,
          last_heading: initialCoords.heading,
          last_speed: initialCoords.speed,
          last_updated_at: new Date().toISOString(),
          eta_minutes: route.etaMinutes,
          distance_km: route.distanceKm,
        },
        { onConflict: "booking_id" }
      );

      // Initial broadcast
      await this.transmitLocationPing(bookingId, initialCoords, destination, "ON_THE_WAY", route);
      return true;
    } catch (err) {
      console.error("[trackingEngine] Failed to start location session:", err);
      return false;
    }
  },

  /**
   * Professional side: Transmit a high-frequency location ping across Supabase Realtime Broadcast.
   * Throttled to send lightweight JSON payload; only saves sampled snapshots to DB periodically.
   */
  async transmitLocationPing(
    bookingId: string,
    coords: LocationCoordinates,
    destination: { latitude: number; longitude: number; address: string },
    status: TrackingSessionStatus = "ON_THE_WAY",
    precomputedRoute?: CalculatedRouteResult
  ): Promise<void> {
    const transmitter = activeTransmitters.get(bookingId);
    if (!transmitter) return;

    // Calculate real driving ETA and route
    const route =
      precomputedRoute ||
      (await routesEngine.computeDrivingRoute(
        { lat: coords.latitude, lng: coords.longitude },
        { lat: destination.latitude, lng: destination.longitude }
      ));

    const payload: LiveTrackingBroadcastPayload = {
      bookingId,
      professionalId: transmitter.professionalId,
      professionalName: transmitter.professionalName || "Assigned Professional",
      status,
      currentLocation: coords,
      destination,
      etaMinutes: route.etaMinutes,
      distanceKm: route.distanceKm,
      lastUpdatedEpoch: Date.now(),
      isGpsStale: false,
    };

    // Broadcast in real-time over Supabase channel (zero DB writes!)
    await transmitter.channel.send({
      type: "broadcast",
      event: "location_update",
      payload,
    });

    transmitter.lastCoords = coords;

    // Sampled persistence: save snapshot every 60 seconds for audit / recovery
    const now = Date.now();
    if (now - transmitter.lastSnapshotSavedEpoch >= 60_000) {
      transmitter.lastSnapshotSavedEpoch = now;
      try {
        await supabase.from("professional_location_snapshots").insert({
          booking_id: bookingId,
          latitude: coords.latitude,
          longitude: coords.longitude,
          accuracy: coords.accuracy,
          heading: coords.heading,
          speed: coords.speed,
          recorded_at: new Date().toISOString(),
        });
      } catch (e) {
        // Non-blocking snapshot logging
      }
    }
  },

  /**
   * Professional side: Terminate location session upon arrival or completion.
   */
  async endLocationSession(bookingId: string, finalStatus: TrackingSessionStatus = "ARRIVED"): Promise<void> {
    const transmitter = activeTransmitters.get(bookingId);
    if (transmitter) {
      // Send terminal broadcast
      await transmitter.channel.send({
        type: "broadcast",
        event: "location_ended",
        payload: { bookingId, status: finalStatus },
      });

      await supabase.removeChannel(transmitter.channel);
      activeTransmitters.delete(bookingId);
    }

    // Mark session as ended in database
    await supabase
      .from("professional_location_sessions")
      .update({
        status: finalStatus,
        ended_at: new Date().toISOString(),
        last_updated_at: new Date().toISOString(),
      })
      .eq("booking_id", bookingId);
  },

  /**
   * Customer side: Subscribe to real-time professional location broadcast channel.
   * Returns an unsubscribe cleanup function.
   */
  subscribeToProfessionalLocation(
    bookingId: string,
    onLocationUpdate: (payload: LiveTrackingBroadcastPayload) => void,
    onSessionEnded: (status: TrackingSessionStatus) => void
  ): () => void {
    const channelName = `booking:${bookingId}:tracking`;
    const channel = supabase
      .channel(channelName)
      .on("broadcast", { event: "location_update" }, (event: { payload: LiveTrackingBroadcastPayload }) => {
        if (event.payload) {
          onLocationUpdate(event.payload);
        }
      })
      .on("broadcast", { event: "location_ended" }, (event: { payload: { status: TrackingSessionStatus } }) => {
        onSessionEnded(event.payload?.status || "TRACKING_ENDED");
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  },

  /**
   * Load last known snapshot / session state from database (useful when customer refreshes page).
   */
  async getInitialSessionState(bookingId: string): Promise<LiveTrackingBroadcastPayload | null> {
    try {
      const { data, error } = await supabase
        .from("professional_location_sessions")
        .select("*")
        .eq("booking_id", bookingId)
        .order("started_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error || !data || !data.last_latitude || !data.last_longitude) {
        return null;
      }

      const now = Date.now();
      const lastUpdated = new Date(data.last_updated_at || data.started_at).getTime();
      const isStale = now - lastUpdated > 60_000;

      return {
        bookingId,
        professionalId: data.professional_id,
        professionalName: data.professional_name || data.technician_name || "Assigned Professional",
        status: data.status,
        currentLocation: {
          latitude: Number(data.last_latitude),
          longitude: Number(data.last_longitude),
          accuracy: data.last_accuracy ? Number(data.last_accuracy) : 10,
          heading: data.last_heading ? Number(data.last_heading) : 0,
          speed: data.last_speed ? Number(data.last_speed) : 0,
          timestamp: lastUpdated,
        },
        destination: {
          latitude: 22.5726,
          longitude: 88.3639,
          address: "Salt Lake Sector V, Kolkata, West Bengal",
        },
        etaMinutes: data.eta_minutes || 12,
        distanceKm: data.distance_km ? Number(data.distance_km) : 2.4,
        lastUpdatedEpoch: lastUpdated,
        isGpsStale: isStale,
      };
    } catch {
      return null;
    }
  },
};
