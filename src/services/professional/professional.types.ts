/**
 * Professional Domain Types & KYC Models for Home-e-Fix
 */

export type ProfessionalStatus =
  | "DRAFT"
  | "PHONE_VERIFIED"
  | "APPLICATION_SUBMITTED"
  | "DOCUMENTS_UNDER_REVIEW"
  | "APPROVED"
  | "ACTIVE"
  | "REJECTED"
  | "CORRECTION_REQUIRED"
  | "SUSPENDED"
  | "DEACTIVATED";

export type KycDocumentType =
  | "IDENTITY_DOCUMENT" // Aadhaar Card / Voter ID
  | "ADDRESS_DOCUMENT"  // Utility Bill / Passport / Rental Agreement
  | "SKILL_CERTIFICATE" // Trade Diploma / ITI Certificate / Manufacturer Training
  | "PROFILE_PHOTO"     // Passport-style clear headshot
  | "BANK_DOCUMENT";    // Cancelled Cheque / Bank Passbook for payouts

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
  experienceYears: number;
  bio?: string;
  preferredServiceAreas?: string[];
  status: ProfessionalStatus;
  rejectionReason?: string | null;
  correctionNotes?: string | null;
  documents?: ProfessionalDocument[];
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
  experienceYears: number;
  bio?: string;
  preferredServiceAreas?: string[];
  documents: Array<{
    documentType: KycDocumentType;
    documentNumberMasked: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    storagePath: string;
  }>;
  termsAccepted: boolean;
}
