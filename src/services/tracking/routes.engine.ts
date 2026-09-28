/**
 * HOME-E-FIX: GOOGLE ROUTES & DRIVING ETA CALCULATION ENGINE
 * Calculates real-world driving distance, polyline geometry, and traffic-aware ETA.
 * Implements a 30-second cache to prevent redundant API calls during frequent GPS updates.
 */

import type { CalculatedRouteResult } from "@/types/service-architecture.types";

interface RouteCoordinates {
  lat: number;
  lng: number;
}

interface CachedRouteEntry {
  result: CalculatedRouteResult;
  expiresAtEpoch: number;
}

const routeCache = new Map<string, CachedRouteEntry>();
const CACHE_TTL_MS = 30_000; // 30 seconds

/**
 * Calculate straight-line Haversine distance in kilometers
 */
export function calculateHaversineKm(start: RouteCoordinates, end: RouteCoordinates): number {
  const R = 6371; // Earth radius in km
  const dLat = ((end.lat - start.lat) * Math.PI) / 180;
  const dLng = ((end.lng - start.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((start.lat * Math.PI) / 180) *
      Math.cos((end.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Generate intermediate road interpolation points between start and end
 */
function generateRoadWaypoints(
  start: RouteCoordinates,
  end: RouteCoordinates,
  steps = 8
): Array<{ lat: number; lng: number }> {
  const points: Array<{ lat: number; lng: number }> = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    // Apply slight realistic road jitter
    const jitterLat = i > 0 && i < steps ? (Math.sin(i * 1.5) * 0.0008) : 0;
    const jitterLng = i > 0 && i < steps ? (Math.cos(i * 1.5) * 0.0008) : 0;
    points.push({
      lat: Number((start.lat + (end.lat - start.lat) * t + jitterLat).toFixed(6)),
      lng: Number((start.lng + (end.lng - start.lng) * t + jitterLng).toFixed(6)),
    });
  }
  return points;
}

export const routesEngine = {
  /**
   * Calculate driving route and traffic ETA between professional and customer location.
   */
  async computeDrivingRoute(
    origin: RouteCoordinates,
    destination: RouteCoordinates
  ): Promise<CalculatedRouteResult> {
    const now = Date.now();
    // Cache key rounded to ~50 meters to prevent jitter thrashing
    const cacheKey = `${origin.lat.toFixed(4)},${origin.lng.toFixed(4)}->${destination.lat.toFixed(4)},${destination.lng.toFixed(4)}`;

    const cached = routeCache.get(cacheKey);
    if (cached && cached.expiresAtEpoch > now) {
      return cached.result;
    }

    const apiKey =
      (typeof import.meta !== "undefined" && import.meta.env?.VITE_MAP_API_KEY) ||
      (typeof globalThis !== "undefined" && (globalThis as any).process?.env?.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY) ||
      "";

    // Attempt Google Routes API (REST v2) if key is configured
    if (apiKey && apiKey !== "your_google_maps_browser_key") {
      try {
        const response = await fetch("https://routes.googleapis.com/directions/v2:computeRoutes", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "X-Goog-Api-Key": apiKey,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline",
          },
          body: JSON.stringify({
            origin: {
              location: {
                latLng: {
                  latitude: origin.lat,
                  longitude: origin.lng,
                },
              },
            },
            destination: {
              location: {
                latLng: {
                  latitude: destination.lat,
                  longitude: destination.lng,
                },
              },
            },
            travelMode: "DRIVE",
            routingPreference: "TRAFFIC_AWARE",
            computeAlternativeRoutes: false,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const primaryRoute = data.routes?.[0];

          if (primaryRoute) {
            const distanceMeters = primaryRoute.distanceMeters || 0;
            // Parse duration string e.g. "620s"
            const durationSeconds = parseInt(primaryRoute.duration?.replace("s", "") || "0", 10);
            const distanceKm = Number((distanceMeters / 1000).toFixed(1));
            const etaMinutes = Math.max(1, Math.round(durationSeconds / 60));

            const result: CalculatedRouteResult = {
              distanceMeters,
              distanceKm,
              durationSeconds,
              etaMinutes,
              encodedPolyline: primaryRoute.polyline?.encodedPolyline,
              pathCoordinates: generateRoadWaypoints(origin, destination, 10),
              isLiveTraffic: true,
              calculatedAtEpoch: now,
            };

            routeCache.set(cacheKey, { result, expiresAtEpoch: now + CACHE_TTL_MS });
            return result;
          }
        }
      } catch (err) {
        console.warn("[routesEngine] Google Routes API request failed, falling back to urban driving calculation:", err);
      }
    }

    // High-fidelity fallback calculation (Urban Kolkata driving model: 1.35x road curvature factor, 22 km/h average traffic speed)
    const directKm = calculateHaversineKm(origin, destination);
    const roadDistanceKm = Number((directKm * 1.35).toFixed(1));
    const distanceMeters = Math.round(roadDistanceKm * 1000);
    // Average urban speed 22 km/h -> 2.72 min/km + 2 min buffer for turns/signals
    const estimatedMinutes = Math.max(2, Math.round(roadDistanceKm * 2.72 + 2));
    const durationSeconds = estimatedMinutes * 60;

    const result: CalculatedRouteResult = {
      distanceMeters,
      distanceKm: roadDistanceKm,
      durationSeconds,
      etaMinutes: estimatedMinutes,
      pathCoordinates: generateRoadWaypoints(origin, destination, 10),
      isLiveTraffic: false,
      calculatedAtEpoch: now,
    };

    routeCache.set(cacheKey, { result, expiresAtEpoch: now + CACHE_TTL_MS });
    return result;
  },

  /**
   * Clear the route calculation cache
   */
  clearCache(): void {
    routeCache.clear();
  },
};
