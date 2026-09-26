import type {
  ProfessionalProfile,
  ProfessionalStatus,
  KycDocumentType,
  ProfessionalDocument,
  ProfessionalReviewLog,
  ProfessionalRegistrationDraft,
  ReviewActionType,
} from "./professional.types";
import { dbRepository } from "@/services/db/repository";
import { supabase } from "@/lib/supabase";
import { isServiceConfigured } from "@/config/env";

export class ProfessionalService {
  /**
   * Centralized Business Policy Helper:
   * A professional must NEVER be able to accept customer jobs merely because their phone OTP was verified.
   * Requires:
   * 1. Profile exists
   * 2. Phone verified
   * 3. Status is APPROVED or ACTIVE
   * 4. Not suspended or deactivated
   */
  canProfessionalAcceptJobs(
    professional: ProfessionalProfile | null | undefined
  ): { allowed: boolean; reason?: string } {
    if (!professional) {
      return {
        allowed: false,
        reason: "Professional profile not found. Please complete registration.",
      };
    }

    if (!professional.phoneVerified) {
      return {
        allowed: false,
        reason: "Mobile number is not verified. Please verify your phone number via OTP.",
      };
    }

    if (professional.status === "SUSPENDED") {
      return {
        allowed: false,
        reason: "Your professional account is currently suspended. Please contact partner support.",
      };
    }

    if (professional.status === "DEACTIVATED") {
      return {
        allowed: false,
        reason: "Your account is deactivated. Contact Home-e-Fix administration.",
      };
    }

    if (professional.status === "REJECTED") {
      return {
        allowed: false,
        reason:
          professional.rejectionReason ||
          "Your application was not approved. Please contact Home-e-Fix support.",
      };
    }

    if (professional.status === "CORRECTION_REQUIRED") {
      return {
        allowed: false,
        reason:
          professional.correctionNotes ||
          "Action required: Please update your submitted documents or information.",
      };
    }

    if (
      professional.status === "DRAFT" ||
      professional.status === "PHONE_VERIFIED" ||
      professional.status === "APPLICATION_SUBMITTED" ||
      professional.status === "DOCUMENTS_UNDER_REVIEW"
    ) {
      return {
        allowed: false,
        reason:
          "Your application is currently under review by Home-e-Fix administrators. You will be able to receive dispatches once approved.",
      };
    }

    if (professional.status === "APPROVED" || professional.status === "ACTIVE") {
      return { allowed: true };
    }

    return {
      allowed: false,
      reason: "Account status does not permit job acceptance.",
    };
  }

  /**
   * Enforces strict state-machine transitions for professional applications.
   * Prevents invalid or unauthorized status jumps (e.g. DRAFT -> APPROVED).
   */
  isValidStatusTransition(from: ProfessionalStatus, to: ProfessionalStatus): boolean {
    if (from === to) return true;

    const allowedTransitions: Record<ProfessionalStatus, ProfessionalStatus[]> = {
      DRAFT: ["PHONE_VERIFIED", "DEACTIVATED"],
      PHONE_VERIFIED: ["APPLICATION_SUBMITTED", "DEACTIVATED"],
      APPLICATION_SUBMITTED: ["DOCUMENTS_UNDER_REVIEW", "CORRECTION_REQUIRED", "REJECTED"],
      DOCUMENTS_UNDER_REVIEW: ["APPROVED", "CORRECTION_REQUIRED", "REJECTED"],
      APPROVED: ["ACTIVE", "SUSPENDED", "DEACTIVATED"],
      ACTIVE: ["SUSPENDED", "DEACTIVATED"],
      REJECTED: ["APPLICATION_SUBMITTED", "DEACTIVATED"], // Can re-apply if authorized
      CORRECTION_REQUIRED: ["APPLICATION_SUBMITTED", "DEACTIVATED"],
      SUSPENDED: ["ACTIVE", "APPROVED", "DEACTIVATED"],
      DEACTIVATED: ["DRAFT"],
    };

    const targetList = allowedTransitions[from] || [];
    return targetList.includes(to);
  }

  /**
   * Masks sensitive identity and bank document numbers for storage and administrative display.
   * Never stores unmasked government ID numbers or raw bank credentials.
   */
  maskDocumentNumber(docType: KycDocumentType, rawNumber: string): string {
    const clean = rawNumber.trim().replace(/\s+/g, "");
    if (!clean) return "XXXX-XXXX";

    if (docType === "IDENTITY_DOCUMENT") {
      // Aadhaar 12-digits: XXXX-XXXX-1234 or Voter ID
      if (clean.length === 12) {
        return `XXXX-XXXX-${clean.slice(-4)}`;
      }
      return `XXXX-${clean.slice(-4)}`;
    }

    if (docType === "BANK_DOCUMENT") {
      return `••••••••${clean.slice(-4)}`;
    }

    if (clean.length > 4) {
      return `••••${clean.slice(-4)}`;
    }

    return "••••";
  }

  /**
   * Generates an isolated private storage path for KYC documents in the private bucket.
   */
  generateDocumentStoragePath(
    professionalId: string,
    docType: KycDocumentType,
    fileName: string
  ): string {
    const timestamp = Date.now();
    const sanitizedName = fileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    return `${professionalId}/${docType.toLowerCase()}_${timestamp}_${randomSuffix}_${sanitizedName}`;
  }

  /**
   * Upload a KYC document to the private 'professional-kyc' Supabase Storage bucket.
   * Enforces file size (<= 5MB), allowed MIME types, and randomized storage paths.
   */
  async uploadKycDocument(
    userId: string,
    docType: KycDocumentType,
    file: File
  ): Promise<{ storagePath: string; fileName: string; fileSize: number; mimeType: string }> {
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error(`File size (${Math.round(file.size / 1024 / 1024)}MB) exceeds the maximum allowed 5MB limit.`);
    }

    const ALLOWED_MIMES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];
    if (!ALLOWED_MIMES.includes(file.type)) {
      throw new Error("Invalid file format. Allowed formats: JPG, PNG, WebP, and PDF.");
    }

    const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
    const randomId = Math.random().toString(36).slice(2, 10);
    const storagePath = `${userId}/${docType.toLowerCase()}_${Date.now()}_${randomId}.${ext}`;

    if (isServiceConfigured("supabase")) {
      const { error } = await supabase.storage
        .from("professional-kyc")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
        });

      if (error) {
        console.error("[Storage Upload Error]", error);
        throw new Error(`Failed to upload document: ${error.message}`);
      }
    }

    return {
      storagePath,
      fileName: file.name,
      fileSize: file.size,
      mimeType: file.type,
    };
  }

  /**
   * Generates an authorized, time-limited signed URL for viewing private KYC documents.
   * KYC documents are NEVER public.
   */
  async getDocumentSignedUrl(storagePath: string, expiresIn = 3600): Promise<string> {
    if (!storagePath) return "";

    if (isServiceConfigured("supabase")) {
      const { data, error } = await supabase.storage
        .from("professional-kyc")
        .createSignedUrl(storagePath, expiresIn);

      if (error) {
        console.warn("[Signed URL Error]", error);
        return "";
      }

      return data?.signedUrl || "";
    }

    return `https://storage.home-e-fix.local/preview/${encodeURIComponent(storagePath)}?token=dev-preview-token`;
  }

  /**
   * Submit an initial or updated professional application.
   */
  async submitApplication(
    userId: string,
    draftData: ProfessionalRegistrationDraft
  ): Promise<ProfessionalProfile> {
    if (!draftData.phoneVerified) {
      throw new Error("Phone number must be verified via OTP before application submission.");
    }

    if (!draftData.fullName.trim()) {
      throw new Error("Full name is required.");
    }

    if (!draftData.primaryCategory) {
      throw new Error("Primary service category is required.");
    }

    if (!draftData.termsAccepted) {
      throw new Error("You must accept the Home-e-Fix Professional Service Agreement.");
    }

    const allPros = dbRepository.getProfessionals();
    let existingPro = allPros.find((p) => p.userId === userId || p.phone === draftData.phone);

    const proId = existingPro?.id || `pro-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const nowIso = new Date().toISOString();

    const initialDocuments: ProfessionalDocument[] = draftData.documents.map((d) => ({
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      professionalId: proId,
      documentType: d.documentType,
      documentNumberMasked: d.documentNumberMasked,
      storagePath: d.storagePath,
      fileName: d.fileName,
      fileSize: d.fileSize,
      mimeType: d.mimeType,
      status: "PENDING",
      uploadedAt: nowIso,
      createdAt: nowIso,
      updatedAt: nowIso,
    }));

    const newProfile: ProfessionalProfile = {
      id: proId,
      userId,
      phone: draftData.phone,
      phoneVerified: true,
      fullName: draftData.fullName.trim(),
      profilePhotoUrl: draftData.profilePhotoUrl,
      dateOfBirth: draftData.dateOfBirth,
      addressLine1: draftData.addressLine1.trim(),
      addressLine2: draftData.addressLine2?.trim(),
      locality: draftData.locality.trim(),
      city: draftData.city.trim() || "Kolkata",
      state: draftData.state.trim() || "West Bengal",
      pincode: draftData.pincode.trim(),
      latitude: draftData.latitude,
      longitude: draftData.longitude,
      primaryCategory: draftData.primaryCategory,
      serviceCategories:
        draftData.serviceCategories.length > 0
          ? draftData.serviceCategories
          : [draftData.primaryCategory],
      experienceYears: draftData.experienceYears || 1,
      bio: draftData.bio?.trim(),
      preferredServiceAreas: draftData.preferredServiceAreas || ["Kolkata"],
      status: "DOCUMENTS_UNDER_REVIEW", // Application completed and awaiting compliance review
      documents: initialDocuments,
      createdAt: existingPro?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    // Store in database repository
    dbRepository.saveProfessional(newProfile);

    // Authoritative PostgreSQL synchronization if Supabase is active
    if (isServiceConfigured("supabase")) {
      try {
        await supabase.from("professionals").upsert({
          id: proId,
          user_id: userId,
          phone: draftData.phone,
          phone_verified: true,
          full_name: draftData.fullName.trim(),
          profile_photo_url: draftData.profilePhotoUrl,
          date_of_birth: draftData.dateOfBirth,
          address_line_1: draftData.addressLine1.trim(),
          address_line_2: draftData.addressLine2?.trim(),
          locality: draftData.locality.trim(),
          city: draftData.city.trim() || "Kolkata",
          state: draftData.state.trim() || "West Bengal",
          pincode: draftData.pincode.trim(),
          latitude: draftData.latitude,
          longitude: draftData.longitude,
          primary_category: draftData.primaryCategory,
          service_categories: newProfile.serviceCategories,
          experience_years: draftData.experienceYears || 1,
          bio: draftData.bio?.trim(),
          preferred_service_areas: draftData.preferredServiceAreas,
          status: "application_submitted",
          application_submitted_at: nowIso,
          updated_at: nowIso,
        });

        for (const doc of initialDocuments) {
          await supabase.from("professional_documents").upsert({
            id: doc.id,
            professional_id: proId,
            document_type: doc.documentType,
            document_number_masked: doc.documentNumberMasked,
            storage_path: doc.storagePath,
            file_name: doc.fileName,
            file_size: doc.fileSize,
            mime_type: doc.mimeType,
            status: doc.status,
            uploaded_at: doc.uploadedAt,
            updated_at: nowIso,
          });
        }
      } catch (err) {
        console.warn("[ProfessionalService] Supabase submission sync deferred:", err);
      }
    }

    // Append audit log
    this.addReviewLog({
      professionalId: proId,
      adminUserId: "system",
      adminName: "System",
      action: "application_submitted",
      previousStatus: existingPro?.status || "DRAFT",
      newStatus: "DOCUMENTS_UNDER_REVIEW",
      reason: "Professional completed and submitted application credentials.",
      createdAt: nowIso,
    });

    return newProfile;
  }

  /**
   * Admin Action: Approve application.
   */
  async adminApproveApplication(
    professionalId: string,
    adminUserId: string,
    adminName: string,
    approvalNotes?: string
  ): Promise<ProfessionalProfile> {
    const allPros = dbRepository.getProfessionals();
    const pro = allPros.find((p) => p.id === professionalId);

    if (!pro) {
      throw new Error("Professional record not found.");
    }

    if (!this.isValidStatusTransition(pro.status, "APPROVED")) {
      throw new Error(`Cannot transition professional from ${pro.status} to APPROVED.`);
    }

    const previousStatus = pro.status;
    const nowIso = new Date().toISOString();

    pro.status = "APPROVED";
    pro.updatedAt = nowIso;
    pro.rejectionReason = null;
    pro.correctionNotes = null;

    // Approve all pending documents
    if (pro.documents && Array.isArray(pro.documents)) {
      pro.documents = pro.documents.map((d: any) => ({
        ...d,
        status: "APPROVED",
        reviewedAt: nowIso,
        reviewedBy: adminUserId,
      }));
    }

    dbRepository.saveProfessional(pro);

    if (isServiceConfigured("supabase")) {
      try {
        await supabase
          .from("professionals")
          .update({
            status: "approved",
            reviewed_by: adminUserId,
            reviewed_at: nowIso,
            rejection_reason: null,
            correction_reason: null,
            updated_at: nowIso,
          })
          .eq("id", professionalId);

        await supabase
          .from("professional_documents")
          .update({
            status: "approved",
            reviewed_at: nowIso,
            reviewed_by: adminUserId,
            updated_at: nowIso,
          })
          .eq("professional_id", professionalId);

        await supabase.from("professional_review_logs").insert({
          professional_id: professionalId,
          admin_user_id: adminUserId,
          action: "approved",
          previous_status: previousStatus,
          new_status: "approved",
          reason: approvalNotes || "Background and KYC credentials verified by administrator.",
        });
      } catch (err) {
        console.warn("[adminApproveApplication] Supabase sync deferred:", err);
      }
    }

    this.addReviewLog({
      professionalId,
      adminUserId,
      adminName,
      action: "approved",
      previousStatus,
      newStatus: "APPROVED",
      reason: approvalNotes || "Background and KYC credentials verified by administrator.",
      createdAt: nowIso,
    });

    return pro;
  }

  /**
   * Admin Action: Reject application. Requires explicit reason.
   */
  async adminRejectApplication(
    professionalId: string,
    adminUserId: string,
    adminName: string,
    rejectionReason: string
  ): Promise<ProfessionalProfile> {
    if (!rejectionReason.trim()) {
      throw new Error("A specific rejection reason is mandatory.");
    }

    const allPros = dbRepository.getProfessionals();
    const pro = allPros.find((p) => p.id === professionalId);

    if (!pro) {
      throw new Error("Professional record not found.");
    }

    const previousStatus = pro.status;
    const nowIso = new Date().toISOString();

    pro.status = "REJECTED";
    pro.rejectionReason = rejectionReason.trim();
    pro.updatedAt = nowIso;

    dbRepository.saveProfessional(pro);

    if (isServiceConfigured("supabase")) {
      try {
        await supabase
          .from("professionals")
          .update({
            status: "rejected",
            rejection_reason: rejectionReason.trim(),
            reviewed_by: adminUserId,
            reviewed_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", professionalId);

        await supabase.from("professional_review_logs").insert({
          professional_id: professionalId,
          admin_user_id: adminUserId,
          action: "rejected",
          previous_status: previousStatus,
          new_status: "rejected",
          reason: rejectionReason.trim(),
        });
      } catch (err) {
        console.warn("[adminRejectApplication] Supabase sync deferred:", err);
      }
    }

    this.addReviewLog({
      professionalId,
      adminUserId,
      adminName,
      action: "rejected",
      previousStatus,
      newStatus: "REJECTED",
      reason: rejectionReason.trim(),
      createdAt: nowIso,
    });

    return pro;
  }

  /**
   * Admin Action: Request correction. Requires specific feedback notes.
   */
  async adminRequestCorrection(
    professionalId: string,
    adminUserId: string,
    adminName: string,
    correctionNotes: string
  ): Promise<ProfessionalProfile> {
    if (!correctionNotes.trim()) {
      throw new Error("Correction instructions are mandatory.");
    }

    const allPros = dbRepository.getProfessionals();
    const pro = allPros.find((p) => p.id === professionalId);

    if (!pro) {
      throw new Error("Professional record not found.");
    }

    const previousStatus = pro.status;
    const nowIso = new Date().toISOString();

    pro.status = "CORRECTION_REQUIRED";
    pro.correctionNotes = correctionNotes.trim();
    pro.updatedAt = nowIso;

    dbRepository.saveProfessional(pro);

    if (isServiceConfigured("supabase")) {
      try {
        await supabase
          .from("professionals")
          .update({
            status: "correction_required",
            correction_reason: correctionNotes.trim(),
            reviewed_by: adminUserId,
            reviewed_at: nowIso,
            updated_at: nowIso,
          })
          .eq("id", professionalId);

        await supabase.from("professional_review_logs").insert({
          professional_id: professionalId,
          admin_user_id: adminUserId,
          action: "correction_requested",
          previous_status: previousStatus,
          new_status: "correction_required",
          reason: correctionNotes.trim(),
        });
      } catch (err) {
        console.warn("[adminRequestCorrection] Supabase sync deferred:", err);
      }
    }

    this.addReviewLog({
      professionalId,
      adminUserId,
      adminName,
      action: "correction_requested",
      previousStatus,
      newStatus: "CORRECTION_REQUIRED",
      reason: correctionNotes.trim(),
      createdAt: nowIso,
    });

    return pro;
  }

  /**
   * Admin Action: Suspend professional.
   */
  async adminSuspendProfessional(
    professionalId: string,
    adminUserId: string,
    adminName: string,
    reason: string
  ): Promise<ProfessionalProfile> {
    if (!reason.trim()) {
      throw new Error("Suspension reason is mandatory.");
    }

    const allPros = dbRepository.getProfessionals();
    const pro = allPros.find((p) => p.id === professionalId);

    if (!pro) {
      throw new Error("Professional record not found.");
    }

    const previousStatus = pro.status;
    const nowIso = new Date().toISOString();

    pro.status = "SUSPENDED";
    pro.rejectionReason = reason.trim();
    pro.updatedAt = nowIso;

    dbRepository.saveProfessional(pro);

    if (isServiceConfigured("supabase")) {
      try {
        await supabase
          .from("professionals")
          .update({
            status: "suspended",
            rejection_reason: reason.trim(),
            updated_at: nowIso,
          })
          .eq("id", professionalId);

        await supabase.from("professional_review_logs").insert({
          professional_id: professionalId,
          admin_user_id: adminUserId,
          action: "suspended",
          previous_status: previousStatus,
          new_status: "suspended",
          reason: reason.trim(),
        });
      } catch (err) {
        console.warn("[adminSuspendProfessional] Supabase sync deferred:", err);
      }
    }

    this.addReviewLog({
      professionalId,
      adminUserId,
      adminName,
      action: "suspended",
      previousStatus,
      newStatus: "SUSPENDED",
      reason: reason.trim(),
      createdAt: nowIso,
    });

    return pro;
  }

  /**
   * Admin Action: Review individual KYC document.
   */
  async adminReviewDocument(
    professionalId: string,
    documentId: string,
    status: "APPROVED" | "REJECTED" | "REPLACEMENT_REQUIRED",
    rejectionReason?: string,
    adminUserId?: string
  ): Promise<ProfessionalProfile> {
    const allPros = dbRepository.getProfessionals();
    const pro = allPros.find((p) => p.id === professionalId);
    if (!pro) throw new Error("Professional record not found.");

    const nowIso = new Date().toISOString();
    if (pro.documents && Array.isArray(pro.documents)) {
      const doc = pro.documents.find((d: any) => d.id === documentId);
      if (doc) {
        doc.status = status;
        doc.reviewedAt = nowIso;
        doc.reviewedBy = adminUserId || "admin";
        if (rejectionReason) doc.rejectionReason = rejectionReason;
      }
    }

    dbRepository.saveProfessional(pro);

    if (isServiceConfigured("supabase")) {
      try {
        await supabase
          .from("professional_documents")
          .update({
            status,
            rejection_reason: rejectionReason || null,
            reviewed_at: nowIso,
            reviewed_by: adminUserId || null,
            updated_at: nowIso,
          })
          .eq("id", documentId);
      } catch (err) {
        console.warn("[adminReviewDocument] Supabase sync deferred:", err);
      }
    }

    this.addReviewLog({
      professionalId,
      adminUserId: adminUserId || "admin",
      adminName: "Administrator",
      action: "document_reviewed",
      previousStatus: pro.status,
      newStatus: pro.status,
      reason: `Document reviewed: ${status}${rejectionReason ? ` - ${rejectionReason}` : ""}`,
      createdAt: nowIso,
    });

    return pro;
  }

  /**
   * Append an immutable audit review log entry.
   */
  private addReviewLog(log: Omit<ProfessionalReviewLog, "id">): void {
    const raw = localStorage.getItem("homeefix_db_professional_review_logs");
    const logs: ProfessionalReviewLog[] = raw ? JSON.parse(raw) : [];

    const entry: ProfessionalReviewLog = {
      id: `rev-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      ...log,
    };

    logs.unshift(entry);
    localStorage.setItem("homeefix_db_professional_review_logs", JSON.stringify(logs));
  }

  /**
   * Retrieve audit review history for a professional.
   */
  getReviewLogs(professionalId: string): ProfessionalReviewLog[] {
    const raw = localStorage.getItem("homeefix_db_professional_review_logs");
    if (!raw) return [];
    try {
      const logs: ProfessionalReviewLog[] = JSON.parse(raw);
      return logs.filter((l) => l.professionalId === professionalId);
    } catch {
      return [];
    }
  }

  /**
   * Fetch professional profile by associated auth user ID.
   */
  getProfessionalByUserId(userId: string): ProfessionalProfile | null {
    const all = dbRepository.getProfessionals();
    return all.find((p) => p.userId === userId) || null;
  }

  /**
   * Fetch all professionals with optional status filtering.
   */
  getAllProfessionals(filterStatus?: ProfessionalStatus): ProfessionalProfile[] {
    const all = dbRepository.getProfessionals();
    if (!filterStatus) return all;
    return all.filter((p) => p.status === filterStatus);
  }
}

export const professionalService = new ProfessionalService();
