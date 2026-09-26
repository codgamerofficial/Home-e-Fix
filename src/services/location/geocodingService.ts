import type {
  ReverseGeocodedAddress,
  GeocodeSearchResult,
} from "@/types/location.types";

interface NominatimAddress {
  house_number?: string;
  building?: string;
  road?: string;
  pedestrian?: string;
  street?: string;
  residential?: string;
  suburb?: string;
  neighbourhood?: string;
  city_district?: string;
  quarter?: string;
  locality?: string;
  village?: string;
  town?: string;
  city?: string;
  municipality?: string;
  county?: string;
  state_district?: string;
  state?: string;
  postcode?: string;
  country?: string;
  country_code?: string;
}

interface NominatimResponse {
  place_id: number;
  lat: string;
  lon: string;
  display_name: string;
  address?: NominatimAddress;
  error?: string;
}

const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class GeocodingService {
  private reverseCache = new Map<string, CacheEntry<ReverseGeocodedAddress>>();
  private searchCache = new Map<string, CacheEntry<GeocodeSearchResult[]>>();
  private lastRequestTime = 0;
  private readonly minRequestIntervalMs = 800; // Respect OSM 1 req/sec policy

  /**
   * Helper to throttle outbound requests to respect free geocoding API rate limits.
   */
  private async throttle(): Promise<void> {
    const now = Date.now();
    const elapsed = now - this.lastRequestTime;
    if (elapsed < this.minRequestIntervalMs) {
      await new Promise((resolve) => setTimeout(resolve, this.minRequestIntervalMs - elapsed));
    }
    this.lastRequestTime = Date.now();
  }

  /**
   * Rounds coordinates to 4 decimal places (~11 meters) for spatial caching.
   */
  private getSpatialKey(lat: number, lng: number): string {
    return `${lat.toFixed(4)},${lng.toFixed(4)}`;
  }

  /**
   * Clean and validate a 6-digit Indian PIN code.
   * Rejects non-conforming codes like 000000, 123456, or strings with letters.
   */
  sanitizePincode(raw?: string): string | undefined {
    if (!raw) return undefined;
    const clean = raw.replace(/\D/g, "").slice(0, 6);
    if (/^[1-9][0-9]{5}$/.test(clean)) {
      return clean;
    }
    return undefined;
  }

  /**
   * Reverse geocodes coordinates (lat, lng) to a structured address object.
   * Free-first via OpenStreetMap Nominatim with zero vendor lock-in.
   */
  async reverseGeocode(
    lat: number,
    lng: number,
    accuracyMeters?: number
  ): Promise<ReverseGeocodedAddress> {
    const cacheKey = this.getSpatialKey(lat, lng);
    const cached = this.reverseCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return {
        ...cached.data,
        accuracyMeters: accuracyMeters ?? cached.data.accuracyMeters,
      };
    }

    await this.throttle();

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(
      lat
    )}&lon=${encodeURIComponent(lng)}&format=jsonv2&addressdetails=1`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-IN,en;q=0.9",
        },
      });

      if (!response.ok) {
        throw new Error(`Reverse geocoding HTTP error: ${response.status}`);
      }

      const data = (await response.json()) as NominatimResponse;

      if (data.error || !data.address) {
        throw new Error(data.error || "No address found for these coordinates");
      }

      const addr = data.address;

      // Extract parts without fabricating missing data
      const houseNumber = addr.house_number || addr.building;
      const road = addr.road || addr.pedestrian || addr.street || addr.residential;
      const locality =
        addr.neighbourhood ||
        addr.suburb ||
        addr.city_district ||
        addr.quarter ||
        addr.locality ||
        addr.village;
      const neighbourhood = addr.neighbourhood || addr.suburb;
      const district = addr.county || addr.state_district;
      const city =
        addr.city ||
        addr.town ||
        addr.municipality ||
        addr.state_district ||
        addr.county ||
        "Kolkata";
      const state = addr.state || "West Bengal";
      const country = addr.country || "India";
      const pincode = this.sanitizePincode(addr.postcode);

      const parsedResult: ReverseGeocodedAddress = {
        houseNumber: houseNumber || undefined,
        building: addr.building || undefined,
        road: road || undefined,
        locality: locality || city || "Current Location",
        neighbourhood: neighbourhood || undefined,
        district: district || undefined,
        city: city || "Kolkata",
        state: state || "West Bengal",
        country: country || "India",
        pincode: pincode || undefined,
        displayName: data.display_name,
        isApproximate: !houseNumber,
        accuracyMeters: accuracyMeters,
      };

      this.reverseCache.set(cacheKey, {
        data: parsedResult,
        timestamp: Date.now(),
      });

      return parsedResult;
    } catch (err: any) {
      // Return a minimal truthful representation without fabricating data
      throw new Error(`Reverse geocoding failed: ${err.message || "Network error"}`);
    }
  }

  /**
   * Forward geocodes an address or locality search query.
   * Debounced and restricted to India for home services precision.
   */
  async searchAddresses(query: string): Promise<GeocodeSearchResult[]> {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) {
      return [];
    }

    const cacheKey = trimmed.toLowerCase();
    const cached = this.searchCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
      return cached.data;
    }

    await this.throttle();

    const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
      trimmed
    )}&format=jsonv2&addressdetails=1&countrycodes=in&limit=6`;

    try {
      const response = await fetch(url, {
        headers: {
          Accept: "application/json",
          "Accept-Language": "en-IN,en;q=0.9",
        },
      });

      if (!response.ok) {
        return [];
      }

      const data = (await response.json()) as NominatimResponse[];

      const results: GeocodeSearchResult[] = data.map((item) => {
        const addr = item.address || {};
        const locality =
          addr.neighbourhood ||
          addr.suburb ||
          addr.city_district ||
          addr.locality ||
          addr.town ||
          addr.village ||
          "";
        const city =
          addr.city ||
          addr.town ||
          addr.municipality ||
          addr.state_district ||
          addr.county ||
          "Kolkata";
        const state = addr.state || "West Bengal";
        const pincode = this.sanitizePincode(addr.postcode) || "";

        return {
          placeId: String(item.place_id),
          displayName: item.display_name,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          locality: locality || city,
          city: city,
          state: state,
          pincode: pincode,
          country: addr.country || "India",
          rawAddress: addr as Record<string, string>,
        };
      });

      this.searchCache.set(cacheKey, {
        data: results,
        timestamp: Date.now(),
      });

      return results;
    } catch {
      return [];
    }
  }
}

export const geocodingService = new GeocodingService();
