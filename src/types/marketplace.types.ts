/**
 * Home-e-Fix Authoritative Marketplace Type System
 * Models all 15 operational categories, pricing engine, serviceability,
 * candidate matching, job state transitions, warranties, and ledger accounting.
 */

export type ServiceCategoryId =
  | "electrician"
  | "plumbing"
  | "carpentry"
  | "ac"
  | "appliances"
  | "cleaning"
  | "pest-control"
  | "painting"
  | "glass"
  | "modular-kitchen"
  | "security"
  | "interior-repair"
  | "home-inspection"
  | "beauty-wellness"
  | "rapid-help";

export interface ServiceCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  bannerImage: string;
  accentColor: string;
  sortOrder: number;
  isActive: boolean;
}

export interface ServiceVariant {
  id: string;
  serviceId: string;
  slug: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

export interface ServiceAddon {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  price: number;
  durationMinutes: number;
}

export interface ServiceQuestion {
  id: string;
  serviceId: string;
  questionText: string;
  questionType: "SINGLE_SELECT" | "MULTI_SELECT" | "TEXT" | "NUMBER" | "PHOTO_UPLOAD";
  options: string[];
  isRequired: boolean;
  sortOrder: number;
}

export interface MarketplaceService {
  id: string;
  categoryId: string;
  categorySlug: string;
  categoryName: string;
  slug: string;
  name: string;
  shortDescription: string;
  fullDescription?: string;
  pricingModel: "FIXED" | "STARTING_FROM" | "QUANTITY_TIER" | "AREA_BASED" | "ROOM_BASED" | "BHK_BASED" | "QUOTATION";
  basePrice: number;
  strikePrice?: number;
  durationMinutes: number;
  warrantyDays: number;
  warrantyTitle: string;
  warrantyTerms?: string;
  visitCharge: number;
  emergencySurcharge: number;
  isEmergencyEligible: boolean;
  isActive: boolean;
  inclusions: string[];
  exclusions: string[];
  faqs: { question: string; answer: string }[];
  checklist: string[];
  variants?: ServiceVariant[];
  addons?: ServiceAddon[];
  questions?: ServiceQuestion[];
  rating?: number;
  reviewCount?: number;
}

/* ─── Serviceability & Geolocation ─── */
export interface ServiceabilityCheckParams {
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  pincode?: string;
  latitude?: number | null;
  longitude?: number | null;
  serviceId?: string;
  isEmergencyRequested?: boolean;
}

export interface ServiceabilityCheckResult {
  isServiceable: boolean;
  serviceable?: boolean;
  cityName: string;
  city?: string;
  localityName: string;
  coverage?: "ALL_KOLKATA" | "ALL_CITY" | "ZONE" | "OUT_OF_BOUNDS";
  zoneCode: string; // Internal dispatch zone
  internalHubCode?: string;
  pincode: string;
  postalCode?: string;
  isEmergencySupported: boolean;
  availableCapacityNow: boolean;
  earliestSlot: string;
  message?: string;
  reason?: string;
}

/* ─── Dynamic Slots ─── */
export interface GeneratedTimeSlot {
  slotId: string;
  dateIso: string; // YYYY-MM-DD
  timeRangeLabel: string; // "09:00 AM - 11:00 AM"
  startHour: number;
  endHour: number;
  isAvailable: boolean;
  capacityScore: number;
  isEmergencySlot?: boolean;
}

/* ─── Pricing Engine Breakdown ─── */
export interface PricingCalculationResult {
  baseAmount: number;
  selectedVariantPrice: number;
  quantity: number;
  addonsAmount: number;
  materialsAmount: number;
  emergencyFee: number;
  safetyFee: number;
  subtotal: number;
  taxGst: number;
  couponCode?: string;
  discountCoupon: number;
  discountMembership: number;
  totalPayableInr: number;
  totalPayablePaise: number;
  partnerLabourShare: number;
  platformFee: number;
}

/* ─── Candidate Matching & Dispatch ─── */
export interface MatchedProfessionalCandidate {
  professionalId: string;
  name: string;
  phone: string;
  rating: number;
  completedJobs: number;
  completionRate: number;
  distanceKm: number;
  zone: string;
  totalScore: number;
}

/* ─── Additional Charges ─── */
export interface AdditionalChargeItem {
  id: string;
  bookingId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  labourPrice: number;
  totalAmount: number;
  justification: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  requestedAt: string;
  reviewedAt?: string;
}

/* ─── Warranty & Invoices ─── */
export interface ActiveServiceWarranty {
  id: string;
  warrantyNumber: string;
  bookingId: string;
  bookingNumber: string;
  serviceName: string;
  startsAt: string;
  expiresAt: string;
  warrantyDays: number;
  terms: string;
  status: "ACTIVE" | "EXPIRED" | "CLAIM_PENDING" | "RESOLVED";
}

export interface DigitalInvoice {
  invoiceNumber: string;
  bookingNumber: string;
  bookingDate: string;
  customerName: string;
  customerPhone: string;
  customerAddress: string;
  serviceName: string;
  technicianName?: string;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  safetyFee: number;
  discountAmount: number;
  totalAmount: number;
  paymentMethod: string;
  paymentStatus: string;
  warrantyCoverage: string;
  gstinBusiness: string;
}
