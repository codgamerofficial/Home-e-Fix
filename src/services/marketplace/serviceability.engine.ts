import type {
  ServiceabilityCheckParams,
  ServiceabilityCheckResult,
} from "@/types/marketplace.types";

/**
 * Internal Dispatch Regions (Used strictly for backend professional routing)
 * NEVER exposed as a customer booking restriction.
 */
export interface InternalDispatchRegion {
  code: string;
  name: string;
  pincodePrefixes: string[];
  samplePincodes: string[];
  emergencySupported: boolean;
}

export const INTERNAL_DISPATCH_REGIONS: Record<string, InternalDispatchRegion> = {
  KOL_EAST_SL: {
    code: "KOL_EAST_SL",
    name: "East Kolkata & Salt Lake",
    pincodePrefixes: ["700064", "700091", "700098", "700106"],
    samplePincodes: ["700064", "700091", "700098", "700106"],
    emergencySupported: true,
  },
  KOL_NEWTOWN: {
    code: "KOL_NEWTOWN",
    name: "New Town & Rajarhat",
    pincodePrefixes: ["700156", "700160", "700135", "700136"],
    samplePincodes: ["700156", "700160", "700135", "700136"],
    emergencySupported: true,
  },
  KOL_SOUTH: {
    code: "KOL_SOUTH",
    name: "South Kolkata",
    pincodePrefixes: [
      "700019", "700026", "700027", "700029", "700031", "700032",
      "700033", "700034", "700040", "700047", "700068", "700084", "700092"
    ],
    samplePincodes: ["700019", "700027", "700032", "700034", "700047", "700084"],
    emergencySupported: true,
  },
  KOL_CENTRAL: {
    code: "KOL_CENTRAL",
    name: "Central Kolkata",
    pincodePrefixes: ["700001", "700012", "700013", "700016", "700017", "700071", "700072", "700073"],
    samplePincodes: ["700001", "700016", "700071"],
    emergencySupported: true,
  },
  KOL_NORTH: {
    code: "KOL_NORTH",
    name: "North Kolkata",
    pincodePrefixes: ["700002", "700003", "700004", "700005", "700006", "700028", "700037", "700050"],
    samplePincodes: ["700004", "700006", "700028", "700037"],
    emergencySupported: true,
  },
};

/**
 * Determine internal dispatch hub based on pincode or locality.
 * Used internally for professional matching and capacity routing.
 */
function resolveInternalDispatchHub(pincode: string): string {
  const cleanPin = pincode.replace(/\D/g, "").slice(0, 6);
  for (const [code, region] of Object.entries(INTERNAL_DISPATCH_REGIONS)) {
    if (region.pincodePrefixes.includes(cleanPin)) {
      return code;
    }
  }

  // Fallback internal routing based on standard Kolkata postal series
  if (cleanPin.startsWith("7000") || cleanPin.startsWith("7001")) {
    const last3 = parseInt(cleanPin.slice(3), 10);
    if (last3 >= 64 && last3 <= 110) return "KOL_EAST_SL";
    if (last3 >= 130 && last3 <= 165) return "KOL_NEWTOWN";
    if (last3 >= 19 && last3 <= 48) return "KOL_SOUTH";
    if (last3 <= 18) return "KOL_CENTRAL";
    return "KOL_NORTH";
  }

  return "KOL_GENERAL";
}

/**
 * Known Kolkata locality keywords to support flexible address checking
 */
const KOLKATA_LOCALITY_KEYWORDS = [
  "kolkata", "calcutta", "salt lake", "saltlake", "bidhannagar", "new town", "newtown",
  "rajarhat", "ballygunge", "alipore", "behala", "jadavpur", "tollygunge",
  "park street", "garia", "dum dum", "dumdum", "lake gardens", "gariahat",
  "shyambazar", "bowbazar", "dalhousie", "kasba", "naktala", "kankurgachi",
  "maniktala", "ultadanga", "barasat", "sonarpur", "howrah"
];

/**
 * Centralized Serviceability Engine
 *
 * CRITICAL BUSINESS RULE:
 * Home-e-Fix currently serves ALL OF KOLKATA.
 * Operational hubs (KOL_EAST_SL, KOL_SOUTH, etc.) are strictly internal dispatch infrastructure
 * and MUST NEVER be used to restrict customer booking eligibility.
 */
export const serviceabilityEngine = {
  /**
   * Primary serviceability validation function.
   * Checks whether the target address is within Kolkata's active coverage.
   */
  checkServiceability(params: ServiceabilityCheckParams): ServiceabilityCheckResult {
    const rawPin = params.pincode || params.postalCode || "";
    const cleanPin = rawPin.replace(/\D/g, "").slice(0, 6);

    const rawCity = (params.city || "").trim().toLowerCase();
    const rawState = (params.state || "").trim().toLowerCase();

    // 1. PIN code check: 700xxx is the authoritative Kolkata Postal Division
    const isKolkataPin = cleanPin.startsWith("700");

    const isExplicitlyOutside =
      rawCity.includes("outside") ||
      rawCity.includes("not serviceable") ||
      rawCity.includes("delhi") ||
      rawCity.includes("mumbai") ||
      rawCity.includes("bangalore");

    // 2. City name check
    const isKolkataCity =
      !isExplicitlyOutside &&
      (rawCity === "kolkata" ||
        rawCity === "calcutta" ||
        rawCity === "new town" ||
        rawCity === "newtown" ||
        rawCity === "bidhannagar" ||
        rawCity === "salt lake" ||
        KOLKATA_LOCALITY_KEYWORDS.some(
          (kw) => rawCity === kw || (kw.length > 4 && rawCity.includes(kw))
        ));

    // 3. State check: West Bengal
    const isWestBengalState =
      rawState === "west bengal" ||
      rawState === "wb" ||
      rawState === ""; // Default to true if unstated in localized form

    // Decision: Address is serviceable if PIN starts with 700 OR city/locality is Kolkata
    const isServiceable =
      !isExplicitlyOutside &&
      (isKolkataPin || (isKolkataCity && (isWestBengalState || !params.state)));

    const internalHub = resolveInternalDispatchHub(cleanPin || "700001");

    if (!isServiceable) {
      return {
        isServiceable: false,
        serviceable: false,
        cityName: params.city || "Outside Kolkata",
        city: params.city || "Outside Kolkata",
        localityName: "Area not yet serviceable",
        coverage: "OUT_OF_BOUNDS",
        zoneCode: "OUT_OF_BOUNDS",
        internalHubCode: "OUT_OF_BOUNDS",
        pincode: cleanPin,
        postalCode: cleanPin,
        isEmergencySupported: false,
        availableCapacityNow: false,
        earliestSlot: "None",
        message: "Home-e-Fix is not currently available at this location.",
        reason: "Home-e-Fix is not currently available at this location. Currently available in Kolkata only.",
      };
    }

    const isEmergencyEligible = Boolean(params.isEmergencyRequested);

    return {
      isServiceable: true,
      serviceable: true,
      cityName: "Kolkata",
      city: "Kolkata",
      localityName: params.city || "Kolkata",
      coverage: "ALL_KOLKATA",
      zoneCode: internalHub, // Internal dispatch zone
      internalHubCode: internalHub,
      pincode: cleanPin || "700001",
      postalCode: cleanPin || "700001",
      isEmergencySupported: true,
      availableCapacityNow: true,
      earliestSlot: isEmergencyEligible ? "Within 2 Hours" : "Tomorrow, 09:00 AM - 11:00 AM",
      message: "Home-e-Fix currently serves all areas across Kolkata.",
    };
  },

  /**
   * Convenience backward-compatible wrapper for pincode lookups.
   */
  checkPincode(pincode: string, isEmergencyRequested = false): ServiceabilityCheckResult {
    const cleanPin = (pincode || "").replace(/\D/g, "").slice(0, 6);
    const isKolkataPin = cleanPin.startsWith("700");
    return this.checkServiceability({
      pincode: cleanPin,
      postalCode: cleanPin,
      city: isKolkataPin ? "Kolkata" : "Outside Kolkata",
      state: isKolkataPin ? "West Bengal" : "",
      isEmergencyRequested,
    });
  },

  /**
   * Internal inspection helper for admin dispatch monitoring.
   */
  getAllDispatchRegions(): InternalDispatchRegion[] {
    return Object.values(INTERNAL_DISPATCH_REGIONS);
  },
};
