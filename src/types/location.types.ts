/**
 * Location, Geolocation, and Geocoding Domain Types for Home-e-Fix
 */

export interface GeoCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

export interface ReverseGeocodedAddress {
  houseNumber?: string;
  building?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  locality?: string;
  district?: string;
  city?: string;
  state?: string;
  country?: string;
  postcode?: string;
  pincode?: string;
  displayName: string;
  isApproximate?: boolean;
  accuracyMeters?: number;
}

export type LocationSource = "gps" | "manual" | "search" | "saved_address";

export interface ConfirmedLocation {
  latitude?: number;
  longitude?: number;
  accuracy?: number;
  houseFlat?: string;
  building?: string;
  streetRoad?: string;
  locality: string;
  neighbourhood?: string;
  city: string;
  district?: string;
  state: string;
  pincode: string;
  country: string;
  formattedAddress: string;
  source: LocationSource;
  confirmed: boolean;
  timestamp: number;
}

export type LocationStatus =
  | "idle"
  | "requesting_permission"
  | "detecting"
  | "reverse_geocoding"
  | "awaiting_confirmation"
  | "confirmed"
  | "permission_denied"
  | "error";

export type GeolocationErrorCode =
  | "PERMISSION_DENIED"
  | "POSITION_UNAVAILABLE"
  | "TIMEOUT"
  | "NOT_SUPPORTED"
  | "UNKNOWN";

export interface GeolocationError {
  code: GeolocationErrorCode;
  message: string;
  userFriendlyMessage: string;
}

export interface GeocodeSearchResult {
  placeId: string;
  displayName: string;
  latitude: number;
  longitude: number;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  country: string;
  rawAddress?: Record<string, string>;
}
