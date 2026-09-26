import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { geolocationService } from "@/services/location/geolocationService";
import { geocodingService } from "@/services/location/geocodingService";
import { serviceAreaService, type ServiceAreaValidationResult } from "@/services/location/serviceAreaService";
import { addressService } from "@/services/location/addressService";
import type {
  LocationStatus,
  LocationSource,
  ReverseGeocodedAddress,
  GeolocationError,
} from "@/types/location.types";
import type { Address } from "@/types/address.types";

/**
 * Canonical helper for formatting user location label across headers, hero, and cards.
 * Prevents redundant "Kolkata, Kolkata" labels.
 */
export function formatLocationLabel(location?: {
  locality?: string | null;
  city?: string | null;
} | null): string {
  if (!location) return "Select location";
  const locality = location.locality?.trim();
  const city = location.city?.trim();

  if (locality && city) {
    if (locality.toLowerCase() === city.toLowerCase()) {
      return city;
    }
    return `${locality}, ${city}`;
  }
  if (locality) return locality;
  if (city) return city;
  return "Select location";
}

export interface HeaderLocationResult {
  display: string;
  short: string;
  full: string;
}

/**
 * Compact location formatter for responsive header pills.
 * Formats "Salt Lake, Kolkata" or compact "Salt Lake" with full string for tooltips.
 */
export function formatHeaderLocation(location?: {
  locality?: string | null;
  city?: string | null;
} | null): HeaderLocationResult {
  if (!location) {
    return { display: "Select location", short: "Select location", full: "Select location" };
  }
  const locality = location.locality?.trim();
  const city = location.city?.trim();

  if (locality && city) {
    if (locality.toLowerCase() === city.toLowerCase()) {
      return { display: city, short: city, full: city };
    }
    const full = `${locality}, ${city}`;
    // Clean formatting for standard Kolkata hubs to avoid awkward truncations like "Salt Lake & Sect..."
    if (locality.toLowerCase() === "salt lake & sector v") {
      return { display: "Salt Lake, Kolkata", short: "Salt Lake", full };
    }
    const short = locality.length > 18 ? `${locality.slice(0, 16)}…` : locality;
    const display = full.length > 24 ? short : full;
    return { display, short, full };
  }

  if (locality) {
    const short = locality.length > 18 ? `${locality.slice(0, 16)}…` : locality;
    return { display: locality, short, full: locality };
  }

  if (city) {
    return { display: city, short: city, full: city };
  }

  return { display: "Select location", short: "Select location", full: "Select location" };
}

export interface CurrentLocationState {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  houseFlat?: string;
  building?: string;
  street?: string;
  addressLine1?: string;
  addressLine2?: string;
  locality: string;
  neighbourhood?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
  source: LocationSource;
  confirmed: boolean;
  timestamp: number;
  formattedAddress: string;
  serviceability?: ServiceAreaValidationResult;
}

interface LocationStore {
  // Canonical location state
  currentLocation: CurrentLocationState;

  // Ephemeral detected location awaiting user confirmation
  draftDetectedLocation: CurrentLocationState | null;

  // Operation status and UX states
  status: LocationStatus;
  isDetecting: boolean;
  error: string | null;
  accuracyWarning: string | null;
  isLocationSheetOpen: boolean;

  // Backward-compatible properties
  city: string;
  locality: string;
  pincode: string;
  formattedAddress: string;

  // Actions
  detectCurrentLocation: () => Promise<CurrentLocationState>;
  confirmDetectedLocation: (options?: {
    customDetails?: Partial<CurrentLocationState>;
    saveLabel?: "HOME" | "WORK" | "OTHER";
    userId?: string;
    fullName?: string;
    phone?: string;
  }) => Promise<void>;
  cancelDetection: () => void;
  setManualLocation: (
    locality: string,
    pincode?: string,
    formattedAddress?: string,
    additional?: Partial<CurrentLocationState>
  ) => void;
  selectSavedAddress: (address: Address) => void;
  setLocation: (locality: string, pincode?: string, formattedAddress?: string) => void;
  clearLocation: () => void;
  openLocationSheet: () => void;
  closeLocationSheet: () => void;
  toggleLocationSheet: () => void;
}

const DEFAULT_LOCATION: CurrentLocationState = {
  city: "Kolkata",
  locality: "",
  pincode: "",
  state: "West Bengal",
  country: "India",
  formattedAddress: "Kolkata, West Bengal",
  source: "manual",
  confirmed: false,
  timestamp: Date.now(),
};

export const useLocationStore = create<LocationStore>()(
  persist(
    (set, get) => ({
      currentLocation: { ...DEFAULT_LOCATION },
      draftDetectedLocation: null,
      status: "idle",
      isDetecting: false,
      error: null,
      accuracyWarning: null,
      isLocationSheetOpen: false,

      // Aliases
      city: "Kolkata",
      locality: "",
      pincode: "",
      formattedAddress: "Kolkata, West Bengal",

      /**
       * Real Browser GPS Detection Pipeline:
       * GPS -> Coords -> Accuracy Check -> Reverse Geocoding -> Service Area -> Awaiting Confirmation.
       */
      detectCurrentLocation: async (): Promise<CurrentLocationState> => {
        set({
          status: "requesting_permission",
          isDetecting: true,
          error: null,
          accuracyWarning: null,
        });

        try {
          // 1. Request real coordinates from browser with high accuracy and 0 maximumAge
          set({ status: "detecting" });
          const coords = await geolocationService.getCurrentCoordinates({
            enableHighAccuracy: true,
            maximumAge: 0,
            timeout: 15000,
          });

          // 2. Evaluate accuracy
          const accuracyEval = geolocationService.evaluateAccuracy(coords.accuracy);
          if (accuracyEval.isLowAccuracy) {
            set({ accuracyWarning: accuracyEval.advice || "Device location may be approximate." });
          }

          // 3. Perform real reverse geocoding via OpenStreetMap Nominatim
          set({ status: "reverse_geocoding" });
          const geocoded: ReverseGeocodedAddress = await geocodingService.reverseGeocode(
            coords.latitude,
            coords.longitude,
            coords.accuracy
          );

          // 4. Validate Home-e-Fix service territory
          const serviceCheck = serviceAreaService.validateServiceArea({
            latitude: coords.latitude,
            longitude: coords.longitude,
            city: geocoded.city,
            locality: geocoded.locality,
            pincode: geocoded.pincode,
          });

          // 5. Construct draft location representation
          const detectedLocality = geocoded.locality || geocoded.neighbourhood || geocoded.city || "Current Location";
          const detectedCity = geocoded.city || "Kolkata";
          const detectedPincode = geocoded.pincode || "";

          const formattedAddress = [
            geocoded.houseNumber ? `#${geocoded.houseNumber}` : null,
            geocoded.building,
            geocoded.road,
            detectedLocality,
            detectedCity,
            detectedPincode ? `PIN - ${detectedPincode}` : null,
          ]
            .filter(Boolean)
            .join(", ") || geocoded.displayName;

          const draft: CurrentLocationState = {
            latitude: coords.latitude,
            longitude: coords.longitude,
            accuracy: coords.accuracy,
            houseFlat: geocoded.houseNumber,
            building: geocoded.building,
            street: geocoded.road,
            locality: detectedLocality,
            neighbourhood: geocoded.neighbourhood,
            city: detectedCity,
            district: geocoded.district,
            state: geocoded.state || "West Bengal",
            pincode: detectedPincode,
            country: geocoded.country || "India",
            source: "gps",
            confirmed: false,
            timestamp: Date.now(),
            formattedAddress,
            serviceability: serviceCheck,
          };

          set({
            draftDetectedLocation: draft,
            status: "awaiting_confirmation",
            isDetecting: false,
          });

          return draft;
        } catch (err: any) {
          const geoError = err as GeolocationError;
          const userMsg =
            geoError.userFriendlyMessage ||
            err.message ||
            "Unable to detect your location. Please enter your address manually.";

          set({
            status: geoError.code === "PERMISSION_DENIED" ? "permission_denied" : "error",
            isDetecting: false,
            error: userMsg,
            draftDetectedLocation: null,
          });

          throw err;
        }
      },

      /**
       * User confirms the detected location.
       */
      confirmDetectedLocation: async (options) => {
        const { draftDetectedLocation } = get();
        if (!draftDetectedLocation) return;

        const merged: CurrentLocationState = {
          ...draftDetectedLocation,
          ...options?.customDetails,
          confirmed: true,
          timestamp: Date.now(),
        };

        // Revalidate service area if user adjusted PIN code or locality
        if (options?.customDetails?.pincode || options?.customDetails?.locality) {
          merged.serviceability = serviceAreaService.validateServiceArea({
            pincode: merged.pincode,
            city: merged.city,
            locality: merged.locality,
            latitude: merged.latitude,
            longitude: merged.longitude,
          });
        }

        // If user opted to save to their address book
        if (options?.saveLabel && options?.userId) {
          try {
            await addressService.saveAddress(options.userId, {
              customer_id: options.userId,
              user_id: options.userId,
              label: options.saveLabel,
              title: options.saveLabel,
              full_name: options.fullName || "Customer",
              recipient_name: options.fullName || "Customer",
              phone: options.phone || null,
              house_flat: merged.houseFlat || "",
              building: merged.building || null,
              street: merged.street || merged.locality,
              address_line_1: merged.street || merged.locality,
              area: merged.locality,
              locality: merged.locality,
              city: merged.city,
              state: merged.state,
              pincode: merged.pincode || "700001",
              postal_code: merged.pincode || "700001",
              country: merged.country,
              latitude: merged.latitude || null,
              longitude: merged.longitude || null,
              place_id: null,
              is_default: false,
              formatted_address: merged.formattedAddress,
            });
          } catch (e) {
            console.warn("Could not save address to user record", e);
          }
        }

        set({
          currentLocation: merged,
          city: merged.city,
          locality: merged.locality,
          pincode: merged.pincode,
          formattedAddress: merged.formattedAddress,
          draftDetectedLocation: null,
          status: "confirmed",
          error: null,
        });
      },

      cancelDetection: () => {
        set({
          draftDetectedLocation: null,
          status: "idle",
          isDetecting: false,
          error: null,
          accuracyWarning: null,
        });
      },

      setManualLocation: (locality, pincode = "", formattedAddress, additional) => {
        const cleanLocality = locality.trim();
        const cleanPin = pincode.trim();
        const city = additional?.city || "Kolkata";

        const serviceCheck = serviceAreaService.validateServiceArea({
          pincode: cleanPin,
          city,
          locality: cleanLocality,
        });

        const newLoc: CurrentLocationState = {
          ...DEFAULT_LOCATION,
          ...additional,
          locality: cleanLocality,
          pincode: cleanPin,
          city,
          formattedAddress:
            formattedAddress ||
            (cleanLocality
              ? `${cleanLocality}, ${city}${cleanPin ? ` - ${cleanPin}` : ""}`
              : `${city}, West Bengal`),
          source: "manual",
          confirmed: true,
          timestamp: Date.now(),
          serviceability: serviceCheck,
        };

        set({
          currentLocation: newLoc,
          locality: cleanLocality,
          pincode: cleanPin,
          city,
          formattedAddress: newLoc.formattedAddress,
          status: "confirmed",
          draftDetectedLocation: null,
          error: null,
        });
      },

      selectSavedAddress: (address: Address) => {
        const locality = address.locality || address.area || address.city || "Kolkata";
        const pin = address.pincode || address.postal_code || "";
        const city = address.city || "Kolkata";

        const serviceCheck = serviceAreaService.validateServiceArea({
          pincode: pin,
          city,
          locality,
          latitude: address.latitude || undefined,
          longitude: address.longitude || undefined,
        });

        const fullAddr =
          address.formatted_address ||
          address.fullAddress ||
          `${address.streetAddress || address.address_line_1}, ${locality}, ${city} - ${pin}`;

        const loc: CurrentLocationState = {
          latitude: address.latitude || undefined,
          longitude: address.longitude || undefined,
          houseFlat: address.house_flat,
          building: address.building || undefined,
          street: address.street || address.streetAddress,
          locality,
          city,
          state: address.state || "West Bengal",
          pincode: pin,
          country: address.country || "India",
          source: "saved_address",
          confirmed: true,
          timestamp: Date.now(),
          formattedAddress: fullAddr,
          serviceability: serviceCheck,
        };

        set({
          currentLocation: loc,
          locality,
          pincode: pin,
          city,
          formattedAddress: fullAddr,
          status: "confirmed",
          draftDetectedLocation: null,
          error: null,
        });
      },

      // Backward compatible setter
      setLocation: (locality, pincode = "", formattedAddress) => {
        get().setManualLocation(locality, pincode, formattedAddress);
      },

      clearLocation: () => {
        set({
          currentLocation: { ...DEFAULT_LOCATION },
          draftDetectedLocation: null,
          status: "idle",
          isDetecting: false,
          error: null,
          accuracyWarning: null,
          city: "Kolkata",
          locality: "",
          pincode: "",
          formattedAddress: "Kolkata, West Bengal",
        });
      },

      openLocationSheet: () => set({ isLocationSheetOpen: true }),
      closeLocationSheet: () => set({ isLocationSheetOpen: false }),
      toggleLocationSheet: () =>
        set((state) => ({ isLocationSheetOpen: !state.isLocationSheetOpen })),
    }),
    {
      name: "homeefix-location-v3",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currentLocation: state.currentLocation,
        city: state.city,
        locality: state.locality,
        pincode: state.pincode,
        formattedAddress: state.formattedAddress,
      }),
    }
  )
);
