import { serviceabilityEngine } from "@/services/marketplace/serviceability.engine";

export interface ServiceAreaValidationInput {
  pincode?: string;
  city?: string;
  state?: string;
  latitude?: number;
  longitude?: number;
  locality?: string;
}

export interface ServiceAreaValidationResult {
  isServiceable: boolean;
  city: string;
  locality: string;
  pincode: string;
  zoneCode: string;
  message: string;
  reason?: string;
  requiresPincodeClarification?: boolean;
}

// Greater Kolkata Metropolitan bounding box [minLat, maxLat, minLng, maxLng]
const KOLKATA_BOUNDS = {
  minLat: 22.35,
  maxLat: 22.85,
  minLng: 88.15,
  maxLng: 88.60,
};

export class ServiceAreaService {
  /**
   * Checks if coordinates fall within Greater Kolkata Metropolitan boundaries.
   */
  isWithinKolkataCoordinates(lat?: number, lng?: number): boolean {
    if (typeof lat !== "number" || typeof lng !== "number") return false;
    return (
      lat >= KOLKATA_BOUNDS.minLat &&
      lat <= KOLKATA_BOUNDS.maxLat &&
      lng >= KOLKATA_BOUNDS.minLng &&
      lng <= KOLKATA_BOUNDS.maxLng
    );
  }

  /**
   * Validates if a detected or entered location is within Home-e-Fix's active service zones.
   */
  validateServiceArea(input: ServiceAreaValidationInput): ServiceAreaValidationResult {
    const rawPin = input.pincode ? input.pincode.replace(/\D/g, "").slice(0, 6) : "";
    const city = (input.city || "").trim();
    const locality = (input.locality || "").trim();

    // 1. PIN code check if provided
    if (rawPin.length === 6) {
      const pinResult = serviceabilityEngine.checkPincode(rawPin);
      if (pinResult.isServiceable) {
        return {
          isServiceable: true,
          city: "Kolkata",
          locality: locality || city || "Kolkata",
          pincode: rawPin,
          zoneCode: pinResult.zoneCode,
          message: "Home-e-Fix currently serves all areas across Kolkata.",
        };
      }
    }

    // 2. Coordinate boundary check if coordinates are present
    if (input.latitude && input.longitude) {
      const inBounds = this.isWithinKolkataCoordinates(input.latitude, input.longitude);
      if (inBounds) {
        return {
          isServiceable: true,
          city: "Kolkata",
          locality: locality || city || "Kolkata",
          pincode: rawPin || "700001",
          zoneCode: "KOL_CENTRAL",
          message: "Location detected within Kolkata service territory.",
        };
      }
    }

    // 3. Fallback City check
    const normalizedCity = city.toLowerCase();
    const isKolkataCity =
      normalizedCity.includes("kolkata") ||
      normalizedCity.includes("calcutta") ||
      normalizedCity.includes("bidhannagar") ||
      normalizedCity.includes("salt lake") ||
      normalizedCity.includes("new town") ||
      normalizedCity.includes("howrah");

    if (isKolkataCity) {
      return {
        isServiceable: true,
        city: "Kolkata",
        locality: locality || city || "Kolkata",
        pincode: rawPin || "700001",
        zoneCode: "KOL_CENTRAL",
        message: "Home-e-Fix currently serves all areas across Kolkata.",
      };
    }

    // Location is definitively outside coverage
    return {
      isServiceable: false,
      city: city || "Outside Coverage",
      locality: locality || "Outside Coverage",
      pincode: rawPin,
      zoneCode: "OUT_OF_BOUNDS",
      message: "Home-e-Fix isn't available in this area yet.",
      reason: `Home-e-Fix is currently operational across the Kolkata Metropolitan region. We are expanding to ${city || "your area"} soon!`,
    };
  }
}

export const serviceAreaService = new ServiceAreaService();
