/**
 * HOME-E-FIX: SERVICE ARCHITECTURE & TELEMETRY TYPE DEFINITIONS
 * Authoritative types for Customer Service Missions, Professional Trades,
 * Delivery Types, Dynamic Diagnostic Questions & Real-Time Tracking.
 */

/* ─── 1. Customer-Facing Service Missions (15 Domains) ─── */
export type ServiceMissionCategory =
  | "home_repair"
  | "ac_appliances"
  | "cleaning"
  | "pest_control"
  | "painting_waterproofing"
  | "plumbing"
  | "electrical"
  | "carpentry_furniture"
  | "glass_windows"
  | "modular_kitchen"
  | "smart_home_security"
  | "home_inspection"
  | "beauty_wellness"
  | "rapid_home_help"
  | "emergency_services";

/* ─── 2. Professional Skills & Trades (20 Standard Trades) ─── */
export type ProfessionalTradeSkill =
  | "electrician"
  | "plumber"
  | "carpenter"
  | "ac_technician"
  | "refrigeration_technician"
  | "ro_technician"
  | "appliance_technician"
  | "painter"
  | "waterproofing_technician"
  | "cleaner"
  | "pest_technician"
  | "glass_technician"
  | "kitchen_technician"
  | "cctv_technician"
  | "smart_home_technician"
  | "home_inspector"
  | "beautician"
  | "hair_professional"
  | "spa_professional"
  | "rapid_help_professional";

export interface ProfessionalSkillMeta {
  id: string;
  slug: ProfessionalTradeSkill;
  name: string;
  categoryHint: string;
  description: string;
}

/* ─── 3. Service Delivery Types (11 Models) ─── */
export type ServiceDeliveryType =
  | "FIXED_PRICE"
  | "DIAGNOSIS_FIRST"
  | "QUOTATION"
  | "PACKAGE"
  | "QUANTITY_BASED"
  | "AREA_BASED"
  | "INSTALLATION"
  | "REPAIR"
  | "APPOINTMENT"
  | "RAPID"
  | "EMERGENCY"
  | "RECURRING";

/* ─── 4. Tracking Modes ─── */
export type TrackingMode =
  | "NONE"
  | "ASSIGNED_ONLY"
  | "ON_THE_WAY"
  | "LIVE_LOCATION"
  | "LIVE_LOCATION_AND_ETA";

/* ─── 5. Professional Tracking Operational States ─── */
export type TrackingSessionStatus =
  | "NOT_TRACKING"
  | "TRACKING_REQUESTED"
  | "LOCATION_PERMISSION_GRANTED"
  | "ON_THE_WAY"
  | "ARRIVED"
  | "SERVICE_STARTED"
  | "SERVICE_PAUSED"
  | "SERVICE_COMPLETED"
  | "TRACKING_ENDED";

/* ─── 6. Service Diagnostic Questions ─── */
export type QuestionInputType =
  | "SINGLE_CHOICE"
  | "MULTI_CHOICE"
  | "NUMBER_STEPPER"
  | "TEXT_INPUT"
  | "PHOTO_UPLOAD"
  | "AREA_SQFT"
  | "BHK_SELECT";

export interface QuestionOption {
  id: string;
  label: string;
  priceModifier?: number;
  durationModifierMin?: number;
  description?: string;
}

export interface ServiceDiagnosticQuestion {
  id: string;
  code: string;
  question: string;
  helperText?: string;
  type: QuestionInputType;
  required: boolean;
  options?: QuestionOption[];
  minNumber?: number;
  maxNumber?: number;
  step?: number;
  unitLabel?: string;
}

/* ─── 7. Architectural Service Entity ─── */
export interface ArchitecturalService {
  id: string;
  slug: string;
  name: string;
  missionCategory: ServiceMissionCategory;
  deliveryType: ServiceDeliveryType;
  trackingMode: TrackingMode;
  requiredSkills: ProfessionalTradeSkill[];
  shortDescription: string;
  fullDescription?: string;
  basePrice: number;
  strikePrice?: number;
  visitFee?: number;
  emergencyFee?: number;
  durationMin: number;
  durationMax?: number;
  warrantyDays: number;
  warrantyTitle: string;
  questions: ServiceDiagnosticQuestion[];
  isPopular?: boolean;
  isEmergencyEligible?: boolean;
  iconName?: string;
}

/* ─── 8. Workflow Step Definitions ─── */
export interface WorkflowStep {
  key: string;
  label: string;
  description: string;
  isTerminal?: boolean;
  requiresCustomerAction?: boolean;
}

export interface DeliveryWorkflowDefinition {
  deliveryType: ServiceDeliveryType;
  name: string;
  steps: WorkflowStep[];
  allowsTracking: boolean;
  requiresDiagnosisEstimate: boolean;
}

/* ─── 9. Telemetry & Real-Time Tracking Packet ─── */
export interface LocationCoordinates {
  latitude: number;
  longitude: number;
  accuracy?: number;
  heading?: number;
  speed?: number;
  timestamp: number;
}

export interface LiveTrackingBroadcastPayload {
  bookingId: string;
  professionalId: string;
  professionalName: string;
  professionalAvatar?: string;
  status: TrackingSessionStatus;
  currentLocation: LocationCoordinates;
  destination: {
    latitude: number;
    longitude: number;
    address: string;
  };
  etaMinutes: number | null;
  distanceKm: number | null;
  routePolyline?: string;
  lastUpdatedEpoch: number;
  isGpsStale?: boolean;
}

export interface ProfessionalLocationSession {
  id: string;
  professionalId: string;
  bookingId: string;
  status: TrackingSessionStatus;
  startedAt: string;
  endedAt?: string;
  lastLatitude?: number;
  lastLongitude?: number;
  lastAccuracy?: number;
  lastUpdatedAt?: string;
  etaMinutes?: number;
  distanceKm?: number;
}

/* ─── 10. Route Calculation Result ─── */
export interface CalculatedRouteResult {
  distanceMeters: number;
  distanceKm: number;
  durationSeconds: number;
  etaMinutes: number;
  encodedPolyline?: string;
  pathCoordinates: Array<{ lat: number; lng: number }>;
  isLiveTraffic: boolean;
  calculatedAtEpoch: number;
}
