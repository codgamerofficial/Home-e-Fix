/**
 * HOME-E-FIX: CANONICAL SERVICE & VARIANT RESOLVER
 * Authoritative single source of truth for:
 * 1. Canonical service lookup by service_id or slug across all categories & database
 * 2. Canonical variant/package definitions with exact prices, durations & warranties
 * 3. Service-specific inclusions and exclusions
 *
 * Prevents hard-coded fallbacks (e.g. Split AC), stale cart contamination, and price discrepancies.
 */

import { CATEGORY_SERVICES_MAP, SERVICE_CATEGORIES, POPULAR_SERVICES } from "@/constants/services";
import { dbRepository } from "@/services/db/repository";
import { catalogueEngine } from "@/services/marketplace/catalogue.engine";

export interface CanonicalServiceVariant {
  id: string;
  serviceId: string;
  name: string;
  description: string;
  price: number;
  pricingType: "fixed" | "starting_from" | "range" | "quote" | "inspection_required";
  durationMin: number;
  durationMax: number;
  durationLabel: string;
  warrantyDays: number;
  warrantyType?: string;
  warrantyDescription?: string;
  isActive: boolean;
  sortOrder: number;
}

export interface CanonicalService {
  id: string;
  slug: string;
  name: string;
  categorySlug: string;
  categoryName: string;
  subCategory?: string;
  shortDescription: string;
  fullDescription?: string;
  basePrice: number;
  discountedPrice?: number;
  pricingType: "fixed" | "starting_from" | "range" | "quote" | "inspection_required";
  duration: number;
  durationMinutes: number;
  durationLabel?: string;
  warrantyDays: number;
  warranty?: string;
  sparesPolicy?: string;
  visitingCharge?: string;
  requiresMaterials?: boolean;
  requires_materials?: boolean;
  imageUrl?: string;
  image?: string;
  thumbnail?: string;
  rating?: number;
  reviewCount: number;
  isPopular?: boolean;
  isEmergencyEligible?: boolean;
  isActive: boolean;
  inclusions?: string[];
  exclusions?: string[];
  faqs?: { question: string; answer: string }[];
  variants?: CanonicalServiceVariant[];
}

/**
 * Standardize slug format for resilient matching
 */
function normalizeSlug(slug: string): string {
  return (slug || "")
    .trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/[^a-z0-9-]/g, "");
}

/**
 * Get all available services across all catalogs and categories
 */
export function getAllAvailableServices(): any[] {
  const serviceMap = new Map<string, any>();

  // 1. Load from dbRepository (which reflects live CMS/admin updates)
  try {
    const dbServices = dbRepository.getAllServices();
    if (Array.isArray(dbServices)) {
      dbServices.forEach((s) => {
        if (s && (s.id || s.slug)) {
          serviceMap.set(s.id || s.slug, s);
        }
      });
    }
  } catch {
    // Repository fallback
  }

  // 2. Load from CATEGORY_SERVICES_MAP across all categories
  Object.entries(CATEGORY_SERVICES_MAP).forEach(([catKey, list]) => {
    if (Array.isArray(list)) {
      const parentCat = SERVICE_CATEGORIES.find((c) => c.slug === catKey);
      list.forEach((svc) => {
        if (svc && (svc.id || svc.slug)) {
          const existing = serviceMap.get(svc.id || svc.slug);
          if (!existing) {
            serviceMap.set(svc.id || svc.slug, {
              ...svc,
              categorySlug: svc.category?.slug || catKey,
              categoryName: svc.category?.name || parentCat?.name || "Service",
            });
          }
        }
      });
    }
  });

  // 3. Load from POPULAR_SERVICES
  if (Array.isArray(POPULAR_SERVICES)) {
    POPULAR_SERVICES.forEach((svc) => {
      if (svc && (svc.id || svc.slug)) {
        const existing = serviceMap.get(svc.id || svc.slug);
        if (!existing) {
          serviceMap.set(svc.id || svc.slug, svc);
        }
      }
    });
  }

  // 4. Load from catalogueEngine ARCHITECTURAL_SERVICES
  if (catalogueEngine?.ARCHITECTURAL_SERVICES) {
    catalogueEngine.ARCHITECTURAL_SERVICES.forEach((s) => {
      if (s && (s.id || s.slug)) {
        const existing = serviceMap.get(s.id || s.slug);
        if (!existing) {
          serviceMap.set(s.id || s.slug, {
            ...s,
            categorySlug: s.missionCategory || "general",
            categoryName: s.name,
            duration: s.durationMin || 45,
            durationMinutes: s.durationMin || 45,
          });
        }
      }
    });
  }

  return Array.from(serviceMap.values());
}

/**
 * Authoritative Canonical Service Lookup
 * Resolves by service_id (e.g. "elec-1", "uuid") or slug (e.g. "switch-socket-repair-replacement").
 * Returns undefined if service is not found or inactive.
 * NEVER returns a default fallback service (such as Split AC).
 */
export function resolveCanonicalService(identifier: string): CanonicalService | undefined {
  if (!identifier || typeof identifier !== "string" || !identifier.trim()) {
    return undefined;
  }

  const raw = identifier.trim();
  const normalized = normalizeSlug(raw);
  const allServices = getAllAvailableServices();

  // 1. Exact ID match (Canonical identity)
  let matched = allServices.find((s) => s.id === raw);

  // 2. Exact slug match
  if (!matched) {
    matched = allServices.find((s) => s.slug === raw || normalizeSlug(s.slug) === normalized);
  }

  // 3. Resilient partial/alias match for well-known catalog mappings
  if (!matched) {
    // E.g. "switch-socket-repair-replacement" <-> "switch-socket-replacement"
    if (normalized.includes("switch") && normalized.includes("socket")) {
      matched = allServices.find(
        (s) =>
          s.id === "elec-1" ||
          s.slug === "switch-socket-repair-replacement" ||
          s.slug === "switch-socket-replacement"
      );
    } else if (normalized.includes("foam-jet") || (normalized.includes("split-ac") && normalized.includes("service"))) {
      matched = allServices.find(
        (s) =>
          s.slug === "ac-servicing" ||
          s.slug === "split-ac-foam-jet-servicing" ||
          s.slug === "split-ac-foam-jet-deep-servicing"
      );
    }
  }

  if (!matched) {
    return undefined;
  }

  // Check if service is explicitly inactive
  if (matched.isActive === false || matched.is_active === false) {
    return undefined;
  }

  const categorySlug =
    matched.categorySlug || matched.category?.slug || matched.missionCategory || "electrical";
  const parentCat = SERVICE_CATEGORIES.find((c) => c.slug === categorySlug);
  const categoryName = matched.categoryName || matched.category?.name || parentCat?.name || "Service";

  const basePrice = Number(matched.discountedPrice ?? matched.basePrice ?? 99);
  const duration = Number(matched.durationMinutes || matched.duration || 30);
  const warrantyDays = typeof matched.warrantyDays === "number" ? matched.warrantyDays : (categorySlug === "electrical" || categorySlug === "ac" ? 30 : 0);

  const canonical: CanonicalService = {
    id: matched.id || `srv-${matched.slug}`,
    slug: matched.slug || normalized,
    name: matched.name || "Home Service",
    categorySlug,
    categoryName,
    subCategory: matched.subCategory || "General",
    shortDescription:
      matched.shortDescription ||
      matched.description ||
      "Professional home repair and maintenance service.",
    fullDescription: matched.fullDescription,
    basePrice,
    discountedPrice: matched.discountedPrice,
    pricingType: matched.pricingType || (matched.pricingModel ? matched.pricingModel.toLowerCase() : "fixed"),
    duration,
    durationMinutes: duration,
    durationLabel: `${duration}–${duration + 15} mins`,
    warrantyDays,
    warranty: matched.warranty || (warrantyDays > 0 ? `${warrantyDays}-Day Rework Warranty` : "Standard Terms"),
    sparesPolicy: matched.sparesPolicy || "Extra at actuals",
    visitingCharge: matched.visitingCharge || "Waived if service availed",
    requiresMaterials: Boolean(matched.requiresMaterials || matched.requires_materials || matched.sparesPolicy?.toLowerCase().includes("extra")),
    imageUrl: matched.imageUrl || matched.image || matched.thumbnail,
    thumbnail: matched.thumbnail || matched.imageUrl,
    rating: matched.rating,
    reviewCount: matched.reviewCount || 0,
    isPopular: Boolean(matched.isPopular || matched.is_featured),
    isEmergencyEligible: Boolean(matched.isEmergencyEligible),
    isActive: true,
    faqs: matched.faqs,
  };

  return canonical;
}

/**
 * Generate canonical packages/variants for a service.
 * Enforces requirement:
 * Each variant has:
 * - id
 * - serviceId
 * - name
 * - description
 * - price
 * - pricingType
 * - durationMin
 * - durationMax
 * - durationLabel
 * - warrantyDays
 * - isActive
 * - sortOrder
 *
 * For Switch/Socket Repair (base ₹69):
 * 1. Standard Single Unit: ₹69 (30–45 mins)
 * 2. Dual Unit Combo (Save 15%): ₹117 (60–80 mins)
 * 3. Family Pack (3+ Units, Save 25%): ₹155 (90–120 mins)
 */
export function getCanonicalVariants(service: CanonicalService | any): CanonicalServiceVariant[] {
  if (!service) return [];

  const serviceId = service.id || `srv-${service.slug}`;
  const basePrice = Number(service.discountedPrice ?? service.basePrice ?? 99);
  const baseDuration = Number(service.durationMinutes || service.duration || 30);
  const warrantyDays = typeof service.warrantyDays === "number" ? service.warrantyDays : 30;

  // If explicit variants exist in database/service definition, sanitize and use them
  if (Array.isArray(service.variants) && service.variants.length > 0) {
    return service.variants.map((v: any, index: number) => ({
      id: v.id || `${serviceId}-v${index + 1}`,
      serviceId,
      name: v.name,
      description: v.description || `${v.name} service package`,
      price: Number(v.price || basePrice),
      pricingType: v.pricingType || "fixed",
      durationMin: Number(v.durationMin || baseDuration),
      durationMax: Number(v.durationMax || baseDuration + 15),
      durationLabel: v.durationLabel || `${v.durationMin || baseDuration}–${v.durationMax || baseDuration + 15} mins`,
      warrantyDays: typeof v.warrantyDays === "number" ? v.warrantyDays : warrantyDays,
      isActive: v.isActive !== false,
      sortOrder: v.sortOrder || index + 1,
    }));
  }

  // Canonical standard tiered variants derived from configured rate card:
  const v1Price = Math.round(basePrice * 1.0);
  const v2Price = Math.round(basePrice * 1.7);
  const v3Price = Math.round(basePrice * 2.25);

  return [
    {
      id: `${serviceId}-v1`,
      serviceId,
      name: "Standard Single Unit",
      description: "Standard diagnosis and precision servicing for single unit",
      price: v1Price,
      pricingType: "fixed",
      durationMin: baseDuration,
      durationMax: baseDuration + 15,
      durationLabel: `${baseDuration}–${baseDuration + 15} mins`,
      warrantyDays,
      isActive: true,
      sortOrder: 1,
    },
    {
      id: `${serviceId}-v2`,
      serviceId,
      name: "Dual Unit Combo (Save 15%)",
      description: "Servicing and testing for 2 points or units in same visit",
      price: v2Price,
      pricingType: "fixed",
      durationMin: baseDuration * 2,
      durationMax: baseDuration * 2 + 20,
      durationLabel: `${baseDuration * 2}–${baseDuration * 2 + 20} mins`,
      warrantyDays,
      isActive: true,
      sortOrder: 2,
    },
    {
      id: `${serviceId}-v3`,
      serviceId,
      name: "Family Pack (3+ Units, Save 25%)",
      description: "Complete multi-point repair and testing for the whole home",
      price: v3Price,
      pricingType: "fixed",
      durationMin: baseDuration * 3,
      durationMax: baseDuration * 3 + 30,
      durationLabel: `${baseDuration * 3}–${baseDuration * 3 + 30} mins`,
      warrantyDays,
      isActive: true,
      sortOrder: 3,
    },
  ];
}

/**
 * Resolve a specific variant by ID or fallback to the first active variant
 */
export function findCanonicalVariant(
  service: CanonicalService | any,
  variantId?: string | null
): CanonicalServiceVariant {
  const variants = getCanonicalVariants(service);
  if (!variants || variants.length === 0) {
    const sId = service?.id || "srv";
    const bPrice = Number(service?.discountedPrice ?? service?.basePrice ?? 99);
    return {
      id: `${sId}-v1`,
      serviceId: sId,
      name: "Standard Package",
      description: "Standard service appointment",
      price: bPrice,
      pricingType: "fixed",
      durationMin: 30,
      durationMax: 45,
      durationLabel: "30–45 mins",
      warrantyDays: service?.warrantyDays ?? 30,
      isActive: true,
      sortOrder: 1,
    };
  }

  if (variantId) {
    const cleanQuery = variantId.toLowerCase().trim();
    const match = variants.find(
      (v) =>
        v.id.toLowerCase() === cleanQuery ||
        v.id.toLowerCase().endsWith(cleanQuery) ||
        (cleanQuery.includes("dual") && (v.name.toLowerCase().includes("dual") || v.id.endsWith("-v2"))) ||
        (cleanQuery.includes("family") && (v.name.toLowerCase().includes("family") || v.id.endsWith("-v3"))) ||
        (cleanQuery.includes("std") && (v.name.toLowerCase().includes("standard") || v.id.endsWith("-v1")))
    );
    if (match) return match;
  }

  return variants[0];
}

/**
 * Service-Specific Inclusions & Exclusions
 * Prevents generic copy from contaminating unrelated services.
 */
export function getCanonicalInclusions(service: CanonicalService | any): {
  included: string[];
  excluded: string[];
} {
  const cat = (service?.categorySlug || service?.category?.slug || "").toLowerCase();
  const slug = (service?.slug || "").toLowerCase();

  // Electrical / Switch / Socket
  if (cat.includes("elec") || slug.includes("switch") || slug.includes("socket") || slug.includes("fan")) {
    return {
      included: [
        "Switch/socket continuity diagnosis & circuit testing",
        "Precision labour using verified multi-meter & insulated tools",
        service?.warrantyDays ? `${service.warrantyDays}-Day Home-e-Fix Re-work Warranty` : "Labour included as per standard terms",
        "Post-service load testing & clean-up",
      ],
      excluded: [
        "Replacement switches or sockets (billed at actual retail MRP)",
        "Major masonry or civil wall demolition",
        "Concealed internal structural conduit rewiring",
      ],
    };
  }

  // AC & Appliances
  if (cat.includes("ac") || slug.includes("ac") || slug.includes("fridge") || slug.includes("washing")) {
    return {
      included: [
        "Deep foam jet wash / diagnostic inspection",
        "Coil, tray, and blower cleaning",
        service?.warrantyDays ? `${service.warrantyDays}-Day Home-e-Fix Re-work Warranty` : "Labour included as per standard terms",
        "Gas pressure, temperature & cooling test",
      ],
      excluded: [
        "Spare parts & compressor replacements billed at actuals",
        "Refrigerant gas leak repair & refill (separate service rate)",
        "Civil masonry or external wall core cutting",
      ],
    };
  }

  // Plumbing
  if (cat.includes("plumb") || slug.includes("tap") || slug.includes("drain") || slug.includes("leak")) {
    return {
      included: [
        "Leak pinpointing and pressure diagnostics",
        "Precision fitting, washer replacement, or pipe repair",
        service?.warrantyDays ? `${service.warrantyDays}-Day Home-e-Fix Re-work Warranty` : "Labour included as per standard terms",
        "Post-service water flow & seal testing",
      ],
      excluded: [
        "Sanitaryware, faucets, taps, and valves (billed at actual retail MRP)",
        "Major tile cutting or underground excavation",
        "Main municipal line external connection fixes",
      ],
    };
  }

  // Cleaning
  if (cat.includes("clean") || slug.includes("clean")) {
    return {
      included: [
        "Hospital-grade disinfectant & specialized degreasing solutions",
        "Machine scrubbing, vacuuming, and surface sanitation",
        "Post-service quality inspection checklist",
      ],
      excluded: [
        "Dismantling of major fixed electrical appliance machinery",
        "Hard water paint oxidation restoration or structural repainting",
        "Hazardous chemical waste handling",
      ],
    };
  }

  // Default Fallback
  return {
    included: [
      "Thorough pre-service inspection and diagnosis",
      "Professional labour executed according to standard operating checklist",
      service?.warrantyDays ? `${service.warrantyDays}-Day Home-e-Fix Re-work Warranty` : "Labour included as per standard terms",
      "Post-service clean-up and quality handover",
    ],
    excluded: [
      "Replacement parts & consumable materials (billed at actuals)",
      "Structural masonry demolition or major alterations",
    ],
  };
}
