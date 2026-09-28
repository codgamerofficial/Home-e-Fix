/**
 * Professional Domain Types & Partner Status Models for Home-e-Fix
 *
 * Product Policy:
 * Home-e-Fix does NOT require government-ID KYC for professional onboarding.
 * Onboarding consists of Google account, basic profile, phone verification,
 * services/categories, skills & experience, service areas, working hours/availability,
 * and profile photo, followed by administrator review and approval.
 */

export type ProfessionalStatus =
  | "PROFILE_INCOMPLETE"
  | "DRAFT"
  | "PHONE_VERIFIED"
  | "APPLICATION_SUBMITTED"
  | "UNDER_REVIEW"
  | "DOCUMENTS_UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "REJECTED"
  | "CORRECTION_REQUIRED"
  | "SUSPENDED"
  | "DEACTIVATED";

/**
 * Optional trade / certification document types (deprecated from mandatory onboarding)
 */
export type KycDocumentType =
  | "IDENTITY_DOCUMENT" // Optional / Deprecated
  | "ADDRESS_DOCUMENT"  // Optional / Deprecated
  | "SKILL_CERTIFICATE" // Optional trade diploma / ITI certificate
  | "PROFILE_PHOTO"     // Profile headshot
  | "BANK_DOCUMENT";    // Optional payout verification

export type KycDocumentStatus =
  | "PENDING"
  | "APPROVED"
  | "REJECTED"
  | "REPLACEMENT_REQUIRED";

export interface ProfessionalDocument {
  id: string;
  professionalId: string;
  documentType: KycDocumentType;
  documentNumberMasked: string; // e.g. "XXXX-XXXX-4912" (Never store raw unmasked numbers)
  storagePath: string; // Path in private 'professional-kyc' storage bucket
  fileName: string;
  fileSize: number;
  mimeType: string;
  status: KycDocumentStatus;
  uploadedAt: string; // ISO UTC
  reviewedAt?: string | null;
  reviewedBy?: string | null;
  rejectionReason?: string | null;
  signedUrl?: string; // Short-lived temporary viewing URL
  createdAt: string;
  updatedAt: string;
}

export type ReviewActionType =
  | "application_submitted"
  | "document_reviewed"
  | "approved"
  | "rejected"
  | "correction_requested"
  | "suspended"
  | "reactivated";

export interface ProfessionalReviewLog {
  id: string;
  professionalId: string;
  adminUserId: string;
  adminName?: string;
  action: ReviewActionType;
  previousStatus: ProfessionalStatus;
  newStatus: ProfessionalStatus;
  reason?: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export interface ProfessionalWorkingHours {
  start: string; // e.g. "08:00 AM" or "08:00"
  end: string;   // e.g. "08:00 PM" or "20:00"
  daysOfWeek: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
}

export interface ProfessionalProfile {
  id: string;
  userId: string;
  phone: string;
  phoneVerified: boolean;
  fullName: string;
  profilePhotoUrl?: string;
  dateOfBirth?: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  primaryCategory: string;
  serviceCategories: string[];
  skills?: string[];
  experienceYears: number;
  bio?: string;
  preferredServiceAreas?: string[];
  workingHours?: ProfessionalWorkingHours;
  workingDays?: string[];
  payoutUpiId?: string;
  status: ProfessionalStatus;
  incompleteReason?: string | null;
  rejectionReason?: string | null;
  suspensionReason?: string | null;
  correctionNotes?: string | null;
  documents?: ProfessionalDocument[]; // Optional / not required for onboarding
  createdAt: string;
  updatedAt: string;
  isDevSeed?: boolean;
}

export interface ProfessionalRegistrationDraft {
  phone: string;
  phoneVerified: boolean;
  fullName: string;
  profilePhotoUrl?: string;
  dateOfBirth?: string;
  addressLine1: string;
  addressLine2?: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  latitude?: number | null;
  longitude?: number | null;
  primaryCategory: string;
  serviceCategories: string[];
  skills?: string[];
  experienceYears: number;
  bio?: string;
  preferredServiceAreas?: string[];
  workingHours?: ProfessionalWorkingHours;
  workingDays?: string[];
  payoutUpiId?: string;
  documents?: Array<{
    documentType: KycDocumentType;
    documentNumberMasked: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
  }>;
  termsAccepted: boolean;
}
