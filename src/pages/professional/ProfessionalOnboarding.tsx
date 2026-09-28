import { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  ArrowRight,
  ArrowLeft,
  Upload,
  AlertCircle,
  AlertTriangle,
  Phone,
  User,
  Wrench,
  FileText,
  FileCheck,
  Building,
  MapPin,
  Lock,
  RefreshCw,
  Info,
  Check,
  X,
  Eye,
  Trash2,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { otpService } from "@/services/otp/otpService";
import { authService } from "@/services/auth.service";
import { professionalService } from "@/services/professional/professionalService";
import type {
  KycDocumentType,
  ProfessionalStatus,
  ProfessionalProfile,
} from "@/services/professional/professional.types";
import { useAuthStore } from "@/store/auth.store";
import { ROUTES } from "@/constants/routes";
import {
  TurnstileWidget,
  type TurnstileWidgetHandle,
  type TurnstileStatus,
} from "@/components/shared/TurnstileWidget";
import { turnstileService } from "@/services/turnstile/turnstileService";

const SERVICE_CATEGORIES = [
  { id: "electrical", name: "Electrical & Wiring" },
  { id: "plumbing", name: "Plumbing & Sanitary" },
  { id: "ac", name: "AC & HVAC Servicing" },
  { id: "appliance", name: "Appliance Repair" },
  { id: "cleaning", name: "Deep Cleaning & Sanitization" },
  { id: "carpentry", name: "Carpentry & Furniture" },
  { id: "painting", name: "Painting & Waterproofing" },
  { id: "cctv", name: "CCTV & Smart Security" },
];

const KOLKATA_HUBS = [
  "Salt Lake & Sector V",
  "New Town & Rajarhat",
  "South Kolkata (Ballygunge/Alipore)",
  "Central Kolkata (Park Street/Dalhousie)",
  "North Kolkata (Dum Dum/Shyambazar)",
  "Behala & Jadavpur",
];

export default function ProfessionalOnboarding() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Wizard Step: 1: Phone, 2: OTP, 3: Personal, 4: Professional, 5: KYC, 6: Review, 7: Status
  const [step, setStep] = useState<number>(1);

  // Step 1: Account & Identity State
  const [phone, setPhone] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState<string | null>(null);

  // Turnstile Bot Protection State for KYC Submission
  const [kycTurnstileToken, setKycTurnstileToken] = useState<string | null>(null);

  // Step 3: Personal Details State
  const [fullName, setFullName] = useState(user?.fullName || "");
  const [profilePhotoUrl, setProfilePhotoUrl] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [addressLine1, setAddressLine1] = useState("");
  const [addressLine2, setAddressLine2] = useState("");
  const [locality, setLocality] = useState("");
  const [city, setCity] = useState("Kolkata");
  const [state, setState] = useState("West Bengal");
  const [pincode, setPincode] = useState("");

  // Step 4: Professional Details State
  const [primaryCategory, setPrimaryCategory] = useState("electrical");
  const [selectedCategories, setSelectedCategories] = useState<string[]>(["electrical"]);
  const [experienceYears, setExperienceYears] = useState(3);
  const [bio, setBio] = useState("");
  const [selectedHubs, setSelectedHubs] = useState<string[]>(["Salt Lake & Sector V"]);

  // Step 5: Service Areas & Working Hours / Availability State
  const [workingStartTime, setWorkingStartTime] = useState("08:00 AM");
  const [workingEndTime, setWorkingEndTime] = useState("08:00 PM");
  const [workingDays, setWorkingDays] = useState<string[]>([
    "Mon",
    "Tue",
    "Wed",
    "Thu",
    "Fri",
    "Sat",
  ]);
  const [payoutUpiId, setPayoutUpiId] = useState("");

  // Optional Documents State (Backwards-compatibility only; NOT required for onboarding)
  const [documents, setDocuments] = useState<
    Array<{
      documentType: KycDocumentType;
      documentNumberMasked: string;
      fileName: string;
      fileSize: number;
      mimeType: string;
      storagePath: string;
    }>
  >([]);
  const [uploadingDocType, setUploadingDocType] = useState<KycDocumentType | null>(null);
  const [docUploadError, setDocUploadError] = useState<string | null>(null);
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  // Step 6: Legal agreement checkbox
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);

  // Submitted application profile representation
  const [submittedProfile, setSubmittedProfile] = useState<ProfessionalProfile | null>(null);

  // Check if current user already has an existing professional application
  useEffect(() => {
    if (user?.id) {
      const existing = professionalService.getProfessionalByUserId(user.id);
      if (existing) {
        setSubmittedProfile(existing);
        setPhone(existing.phone || "");
        setFullName(existing.fullName || "");
        if (existing.profilePhotoUrl) setProfilePhotoUrl(existing.profilePhotoUrl);
        if (existing.addressLine1) setAddressLine1(existing.addressLine1);
        if (existing.locality) setLocality(existing.locality);
        if (existing.pincode) setPincode(existing.pincode);
        if (existing.primaryCategory) setPrimaryCategory(existing.primaryCategory);
        if (existing.serviceCategories?.length) setSelectedCategories(existing.serviceCategories);
        if (existing.preferredServiceAreas?.length) setSelectedHubs(existing.preferredServiceAreas);
        if (existing.workingHours) {
          if (existing.workingHours.start) setWorkingStartTime(existing.workingHours.start);
          if (existing.workingHours.end) setWorkingEndTime(existing.workingHours.end);
          if (existing.workingHours.daysOfWeek?.length) setWorkingDays(existing.workingHours.daysOfWeek);
        }
        if (existing.payoutUpiId) setPayoutUpiId(existing.payoutUpiId);
        if (existing.documents?.length) {
          setDocuments(
            existing.documents.map((d) => ({
              documentType: d.documentType,
              documentNumberMasked: d.documentNumberMasked,
              fileName: d.fileName,
              fileSize: d.fileSize,
              mimeType: d.mimeType,
              storagePath: d.storagePath,
            }))
          );
        }

        // If application is in review, correction, or approved, show Status view
        const currentStatus = (existing.status || "").toUpperCase();
        if (
          [
            "APPLICATION_SUBMITTED",
            "UNDER_REVIEW",
            "DOCUMENTS_UNDER_REVIEW",
            "CORRECTION_REQUIRED",
            "APPROVED",
            "ACTIVE",
            "REJECTED",
            "SUSPENDED",
          ].includes(currentStatus)
        ) {
          setStep(7);
        }
      }
    }
  }, [user]);

  // Authenticate / Sign In via Google OAuth for Professional Role
  const handleGoogleProLogin = async () => {
    setGoogleError(null);
    setGoogleLoading(true);
    try {
      await authService.signInWithGoogle("professional", ROUTES.PROFESSIONAL_ONBOARDING);
    } catch (err: any) {
      setGoogleError(err?.message || "Google sign-in could not be initiated. Please try again.");
      setGoogleLoading(false);
    }
  };

  // Toggle secondary category
  const handleToggleCategory = (catId: string) => {
    if (selectedCategories.includes(catId)) {
      if (selectedCategories.length === 1) return; // Keep at least one
      setSelectedCategories(selectedCategories.filter((c) => c !== catId));
    } else {
      setSelectedCategories([...selectedCategories, catId]);
    }
  };

  // Toggle preferred service hubs
  const handleToggleHub = (hub: string) => {
    if (selectedHubs.includes(hub)) {
      if (selectedHubs.length === 1) return;
      setSelectedHubs(selectedHubs.filter((h) => h !== hub));
    } else {
      setSelectedHubs([...selectedHubs, hub]);
    }
  };

  // Toggle active service working days
  const handleToggleDay = (day: string) => {
    if (workingDays.includes(day)) {
      if (workingDays.length === 1) return; // Keep at least one active day
      setWorkingDays(workingDays.filter((d) => d !== day));
    } else {
      setWorkingDays([...workingDays, day]);
    }
  };

  // Handle document upload to private 'professional-kyc' storage bucket (optional/deprecated)
  const handleFileSelect = async (
    docType: KycDocumentType,
    rawNumber: string,
    file?: File | null
  ) => {
    setDocUploadError(null);
    if (!file) return;

    const cleanNum = rawNumber.trim() || "DOC-REF";

    // Client-side file size and format pre-flight checks
    if (file.size > 10 * 1024 * 1024) {
      setDocUploadError("File size must be 10 MB or less.");
      return;
    }

    const allowedMimes = ["application/pdf", "image/jpeg", "image/png", "image/webp"];
    if (!allowedMimes.includes(file.type)) {
      setDocUploadError("Please upload a PDF, JPG, JPEG, PNG, or WEBP file.");
      return;
    }

    setUploadingDocType(docType);

    try {
      const existingDoc = documents.find((d) => d.documentType === docType);

      const uploaded = await professionalService.uploadKycDocument(
        user?.id || `pro-${phone.replace(/\D/g, "") || Date.now()}`,
        docType,
        file,
        existingDoc?.storagePath
      );

      const masked = professionalService.maskDocumentNumber(docType, cleanNum);
      const docEntry = {
        documentType: docType,
        documentNumberMasked: masked,
        fileName: uploaded.fileName,
        fileSize: uploaded.fileSize,
        mimeType: uploaded.mimeType,
        storagePath: uploaded.storagePath,
      };

      setDocuments((prev) => {
        const filtered = prev.filter((d) => d.documentType !== docType);
        return [...filtered, docEntry];
      });
    } catch (err: any) {
      setDocUploadError(err?.message || "Failed to upload document.");
    } finally {
      setUploadingDocType(null);
    }
  };

  // Preview uploaded private document via short-lived signed URL
  const handlePreviewDocument = async (storagePath: string) => {
    setDocUploadError(null);
    setPreviewLoading(storagePath);
    try {
      const signedUrl = await professionalService.getDocumentSignedUrl(storagePath, 300);
      if (!signedUrl) {
        throw new Error("Unable to generate secure preview link. Please try again.");
      }
      window.open(signedUrl, "_blank", "noopener,noreferrer");
    } catch (err: any) {
      setDocUploadError(err?.message || "Could not open document preview.");
    } finally {
      setPreviewLoading(null);
    }
  };

  // Remove/Delete an uploaded document
  const handleRemoveDocument = async (docType: KycDocumentType, storagePath: string) => {
    setDocUploadError(null);
    try {
      await professionalService.deleteKycDocument(storagePath);
    } catch {
      // non-blocking
    }
    setDocuments((prev) => prev.filter((d) => d.documentType !== docType));
  };

  // Final Application Submission
  const handleSubmitApplication = async () => {
    if (!termsAccepted) {
      setSubmissionError("Please review and accept the Professional Service Terms.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // Verify Turnstile token before submitting
      const verification = await turnstileService.verifyToken(
        kycTurnstileToken,
        "professional_kyc_submit"
      );

      if (!verification.success) {
        setSubmissionError(
          verification.error ||
            "Please complete the security challenge before submitting your application."
        );
        return;
      }

      let canonicalPhone = "";
      if (phone) {
        try {
          canonicalPhone = otpService.normalizeIndianPhone(phone);
        } catch {
          canonicalPhone = phone;
        }
      }
      const profile = await professionalService.submitApplication(user?.id || `usr-${Date.now()}`, {
        phone: canonicalPhone,
        phoneVerified: false,
        fullName,
        profilePhotoUrl,
        dateOfBirth,
        addressLine1,
        addressLine2,
        locality,
        city,
        state,
        pincode,
        primaryCategory,
        serviceCategories: selectedCategories,
        experienceYears,
        bio,
        preferredServiceAreas: selectedHubs,
        workingHours: {
          start: workingStartTime,
          end: workingEndTime,
          daysOfWeek: workingDays,
        },
        payoutUpiId,
        documents: [], // Zero KYC documents required
        termsAccepted,
      });

      setSubmittedProfile(profile);
      setStep(7); // Jump to status tracker
    } catch (err: any) {
      setSubmissionError(err?.message || "Failed to submit application. Please verify all details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="py-10 md:py-16 bg-background min-h-[85vh]">
      <div className="container-app max-w-3xl">
        {/* Progress Timeline Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-xs font-bold text-foreground-secondary mb-2">
            <span>Professional Registration</span>
            <span>Step {step} of 7</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-accent h-full transition-all duration-300 rounded-full"
              style={{ width: `${(step / 7) * 100}%` }}
            />
          </div>
        </div>

        {/* ─── STEP 1: GOOGLE ACCOUNT CONNECT / AUTH ─── */}
        {step === 1 && (
          <Card className="p-6 sm:p-7 md:p-8 border border-border bg-surface shadow-xs rounded-2xl space-y-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Direct Partner Onboarding
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                Join as a Professional Partner
              </h1>
              <p className="text-xs md:text-sm text-foreground-secondary mt-1">
                Connect your Google account to begin your professional partner application.
              </p>
            </div>

            {googleError && (
              <div className="p-3.5 rounded-xl bg-destructive/10 border border-destructive/20 text-xs text-destructive flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{googleError}</span>
              </div>
            )}

            {user ? (
              <div className="p-5 rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-4 max-w-lg mx-auto">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-primary dark:text-white">
                      Google Account Connected
                    </h3>
                    <p className="text-xs text-foreground-secondary">
                      Signed in as <span className="font-semibold text-primary dark:text-white">{user.fullName || user.email}</span>
                    </p>
                  </div>
                </div>

                <Button
                  variant="accent"
                  size="lg"
                  onClick={() => setStep(3)}
                  className="w-full h-12 font-bold gap-2 text-sm shadow-md cursor-pointer"
                >
                  Continue to Application Details <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="space-y-4 pt-1 max-w-lg mx-auto w-full">
                <Button
                  type="button"
                  variant="outline"
                  size="lg"
                  disabled={googleLoading}
                  onClick={handleGoogleProLogin}
                  aria-label="Continue with Google"
                  className="w-full h-13 flex items-center justify-center gap-3 border border-border bg-white dark:bg-slate-900/60 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-100 font-bold text-sm rounded-xl transition-all shadow-sm active:scale-[0.99] cursor-pointer"
                >
                  <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>{googleLoading ? "Connecting to Google..." : "Continue with Google"}</span>
                </Button>

                <p className="text-[11px] text-center text-foreground-muted leading-relaxed">
                  Fast and secure application access. You will configure your trade details, service areas, and availability on the following steps.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* ─── STEP 3: PERSONAL INFORMATION ─── */}
        {step === 3 && (
          <Card className="p-6 md:p-8 border border-border bg-surface shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                <CheckCircle2 className="h-4 w-4" /> Google Authenticated ({user?.email || "Connected"})
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                Personal Information
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Enter your professional profile and contact details.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Full Name *
                </label>
                <Input
                  type="text"
                  placeholder="e.g. Subir Kumar Ghosh"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Profile Photo URL (Optional)
                </label>
                <Input
                  type="url"
                  placeholder="https://... (or leave blank to use your Google account photo)"
                  value={profilePhotoUrl}
                  onChange={(e) => setProfilePhotoUrl(e.target.value)}
                />
                <p className="text-[11px] text-foreground-muted mt-1">
                  A clear profile picture helps build trust with customers once approved.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Contact Mobile Number (Optional for communication)
                </label>
                <div className="flex gap-2">
                  <div className="h-10 flex items-center px-3 rounded-lg border border-border bg-muted/60 text-xs font-mono font-bold text-foreground-secondary select-none shrink-0">
                    +91
                  </div>
                  <Input
                    type="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Date of Birth *
                </label>
                <Input
                  type="date"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    House / Building / Street *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. 14/B, Raja Subodh Mallick Road"
                    value={addressLine1}
                    onChange={(e) => setAddressLine1(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Locality / Area *
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Jadavpur / Salt Lake"
                    value={locality}
                    onChange={(e) => setLocality(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    City
                  </label>
                  <Input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    PIN Code (6-digit) *
                  </label>
                  <Input
                    type="text"
                    maxLength={6}
                    placeholder="e.g. 700032"
                    value={pincode}
                    onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  disabled={!fullName || !addressLine1 || !locality || pincode.length !== 6}
                  onClick={() => setStep(4)}
                  className="gap-2 font-bold cursor-pointer"
                >
                  Next: Trade & Experience <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── STEP 4: TRADE & EXPERIENCE ─── */}
        {step === 4 && (
          <Card className="p-6 md:p-8 border border-border bg-surface shadow-sm space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                Trade Specialty & Service Categories
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Select your primary trade category and any secondary home maintenance skills you offer.
              </p>
            </div>

            <div className="space-y-5 pt-1">
              <div>
                <label className="block text-xs font-bold text-primary mb-2">
                  Select Services & Trade Categories (Choose all that apply) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {SERVICE_CATEGORIES.map((cat) => {
                    const isSelected = selectedCategories.includes(cat.id);
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => handleToggleCategory(cat.id)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/5 ring-1 ring-accent text-primary font-bold"
                            : "border-border hover:bg-muted text-foreground-secondary"
                        }`}
                      >
                        <span className="text-xs">{cat.name}</span>
                        {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Years of Field Experience *
                  </label>
                  <Input
                    type="number"
                    min={1}
                    max={40}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value, 10) || 1)}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-primary mb-1">
                    Short Professional Bio / Skills Summary
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Expert in inverter wiring & split AC PCB diagnosis"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  disabled={selectedCategories.length === 0}
                  onClick={() => setStep(5)}
                  className="gap-2 font-bold cursor-pointer"
                >
                  Next: Service Areas & Availability <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── STEP 5: SERVICE AREAS, WORKING HOURS & AVAILABILITY ─── */}
        {step === 5 && (
          <Card className="p-6 md:p-8 border border-border bg-surface shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-2">
                <Clock className="h-3.5 w-3.5" /> Operations & Availability
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                Service Areas & Working Hours
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Configure your operational coverage hubs in Kolkata, daily working schedule, and active days.
              </p>
            </div>

            {/* Reassurance Banner: Zero Government-ID Required */}
            <div className="p-4 rounded-2xl bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-900 flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="font-bold text-blue-950 dark:text-blue-200 block">
                  Zero Government-ID Required
                </span>
                <p className="text-blue-800 dark:text-blue-300 leading-relaxed">
                  Home-e-Fix does not require Aadhaar, PAN, voter ID, or document uploads for partner onboarding at this stage. Your profile, trade specialties, and service coverage are reviewed directly by platform administration.
                </p>
              </div>
            </div>

            <div className="space-y-5 pt-1">
              {/* 1. Operational Service Hubs */}
              <div>
                <label className="block text-xs font-bold text-primary mb-2">
                  Preferred Kolkata Operational Hubs (Select at least one) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KOLKATA_HUBS.map((hub) => {
                    const isSelected = selectedHubs.includes(hub);
                    return (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => handleToggleHub(hub)}
                        className={`p-3 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/5 ring-1 ring-accent font-bold text-primary"
                            : "border-border hover:bg-muted text-foreground-secondary"
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className="h-3.5 w-3.5 text-accent shrink-0" />
                          <span>{hub}</span>
                        </span>
                        {isSelected && <Check className="h-4 w-4 text-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 2. Daily Working Hours */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-xs font-bold text-primary">
                  Daily Working Hours *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <span className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                      Start Time
                    </span>
                    <Input
                      type="text"
                      placeholder="08:00 AM"
                      value={workingStartTime}
                      onChange={(e) => setWorkingStartTime(e.target.value)}
                    />
                  </div>
                  <div>
                    <span className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                      End Time
                    </span>
                    <Input
                      type="text"
                      placeholder="08:00 PM"
                      value={workingEndTime}
                      onChange={(e) => setWorkingEndTime(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              {/* 3. Active Working Days */}
              <div className="space-y-2 pt-2 border-t border-border">
                <label className="block text-xs font-bold text-primary">
                  Active Working Days (Select all that apply) *
                </label>
                <div className="flex flex-wrap gap-2">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((day) => {
                    const isActive = workingDays.includes(day);
                    return (
                      <button
                        key={day}
                        type="button"
                        onClick={() => handleToggleDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                          isActive
                            ? "bg-accent text-white border-accent shadow-xs"
                            : "bg-surface text-foreground-secondary border-border hover:border-accent/40"
                        }`}
                      >
                        {day}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 4. Optional Payout Information */}
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-primary">
                    Payout UPI ID (Optional)
                  </label>
                  <Badge variant="outline" className="text-[10px]">Optional</Badge>
                </div>
                <Input
                  type="text"
                  placeholder="e.g. yourname@oksbi / 9830012345@paytm"
                  value={payoutUpiId}
                  onChange={(e) => setPayoutUpiId(e.target.value)}
                />
                <p className="text-[11px] text-foreground-muted">
                  Required only when direct bank or UPI settlement functionality is activated for payouts. You can also configure this later.
                </p>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  disabled={selectedHubs.length === 0 || workingDays.length === 0}
                  onClick={() => setStep(6)}
                  className="gap-2 font-bold cursor-pointer"
                >
                  Review Application <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── STEP 6: APPLICATION REVIEW & SUBMISSION ─── */}
        {step === 6 && (
          <Card className="p-6 md:p-8 border border-border bg-surface shadow-sm space-y-6">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                Review & Confirm Application
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Please verify that your personal, trade, and document details are accurate before final submission.
              </p>
            </div>

            <div className="space-y-4 text-xs divide-y divide-border">
              {/* Phone & Identity */}
              <div className="pt-2 flex justify-between items-center">
                <div>
                  <span className="font-bold text-primary block">{fullName}</span>
                  <span className="text-foreground-secondary font-mono">
                    +91 ******{phone.slice(-4)} • DOB: {dateOfBirth || "Provided"}
                  </span>
                </div>
                <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                  Phone Verified ✓
                </Badge>
              </div>

              {/* Service Address */}
              <div className="pt-3">
                <span className="font-bold text-primary block">Residential Address</span>
                <span className="text-foreground-secondary mt-0.5 block">
                  {addressLine1}, {locality}, {city}, {state} - {pincode}
                </span>
              </div>

              {/* Trade Categories */}
              <div className="pt-3">
                <span className="font-bold text-primary block">Primary Trade & Experience</span>
                <span className="text-foreground-secondary mt-0.5 block">
                  {selectedCategories.join(", ")} • {experienceYears} Years Experience
                </span>
                <span className="text-[11px] text-foreground-muted block mt-1">
                  Service Hubs: {selectedHubs.join(", ")}
                </span>
              </div>

              {/* Working Hours & Availability */}
              <div className="pt-3">
                <span className="font-bold text-primary block">Working Hours & Availability</span>
                <span className="text-foreground-secondary mt-0.5 block">
                  {workingStartTime} – {workingEndTime} • Active Days: {workingDays.join(", ")}
                </span>
                <span className="text-[11px] text-foreground-muted block mt-1">
                  Operational Hubs: {selectedHubs.join(", ")}
                </span>
              </div>

              {/* Profile Photo & Payout */}
              <div className="pt-3">
                <span className="font-bold text-primary block">Profile Photo & Payout Routing</span>
                <div className="mt-1 space-y-0.5 text-foreground-secondary">
                  <p>Photo: {profilePhotoUrl ? "Provided ✓" : "Default / Account Photo"}</p>
                  <p>Payout UPI: {payoutUpiId || "Not set (Will be configured when payouts begin)"}</p>
                </div>
              </div>
            </div>

            {submissionError && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{submissionError}</span>
              </div>
            )}

            {/* Legal Confirmation Checkbox */}
            <div className="pt-2">
              <label className="flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => setTermsAccepted(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded-sm border-border text-accent focus:ring-accent"
                />
                <span className="text-xs text-foreground-secondary leading-relaxed">
                  I confirm that all personal, trade specialty, and availability details provided are genuine and complete. I understand that Home-e-Fix does not require government-ID KYC uploads at this stage, and that customer job dispatches will only be enabled after administrator review and approval.
                </span>
              </label>
            </div>

            <TurnstileWidget
              action="professional_kyc_submit"
              onSuccess={(token) => {
                setKycTurnstileToken(token);
                setSubmissionError(null);
              }}
              onError={() => setKycTurnstileToken(null)}
              onExpired={() => setKycTurnstileToken(null)}
              className="py-1"
            />

            <div className="flex justify-between pt-4 border-t border-border">
              <Button variant="outline" onClick={() => setStep(5)}>
                Back
              </Button>
              <Button
                variant="accent"
                disabled={!termsAccepted || !kycTurnstileToken || isSubmitting}
                onClick={handleSubmitApplication}
                className="gap-2 font-bold cursor-pointer"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Application <Check className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* ─── STEP 7: HOME-E-FIX PARTNER STATUS TRACKER ─── */}
        {step === 7 && (
          <Card className="p-6 md:p-10 border border-border bg-surface shadow-sm text-center space-y-6">
            {/* Status-specific Header & Icon */}
            {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE" ? (
              <>
                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-300 font-bold mb-2">
                    HOME-E-FIX VERIFIED PARTNER
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                    Application Approved!
                  </h1>
                  <p className="text-xs md:text-sm text-foreground-secondary max-w-md mx-auto mt-2">
                    Congratulations {submittedProfile.fullName}! You are an authorized Home-e-Fix Verified Partner and can now receive and accept customer job assignments in your service areas.
                  </p>
                </div>
              </>
            ) : submittedProfile?.status === "SUSPENDED" ? (
              <>
                <div className="h-16 w-16 rounded-full bg-slate-100 text-slate-700 border border-slate-300 flex items-center justify-center mx-auto shadow-sm">
                  <AlertTriangle className="h-8 w-8 text-slate-700" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-slate-100 text-slate-700 border-slate-300 font-bold mb-2">
                    ACCOUNT SUSPENDED
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                    Professional Account Suspended
                  </h1>
                  <div className="max-w-md mx-auto mt-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-left">
                    <span className="font-bold text-xs text-slate-900 block mb-1">Reason:</span>
                    <p className="text-xs text-slate-800">
                      {submittedProfile.suspensionReason || submittedProfile.rejectionReason || "Your account has been temporarily suspended by administration."}
                    </p>
                  </div>
                </div>
              </>
            ) : submittedProfile?.status === "CORRECTION_REQUIRED" ? (
              <>
                <div className="h-16 w-16 rounded-full bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center mx-auto shadow-sm">
                  <AlertTriangle className="h-8 w-8" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-300 font-bold mb-2">
                    ACTION REQUIRED • CORRECTION NEEDED
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                    Application Correction Requested
                  </h1>
                  <div className="max-w-md mx-auto mt-3 p-4 rounded-xl bg-amber-50 border border-amber-200 text-left">
                    <span className="font-bold text-xs text-amber-900 block mb-1">Administrator Review Notes:</span>
                    <p className="text-xs text-amber-800">
                      {submittedProfile.correctionNotes || "Please review your personal details or availability and update requested information."}
                    </p>
                  </div>
                </div>
              </>
            ) : submittedProfile?.status === "REJECTED" ? (
              <>
                <div className="h-16 w-16 rounded-full bg-rose-50 text-rose-600 border border-rose-200 flex items-center justify-center mx-auto shadow-sm">
                  <X className="h-8 w-8" />
                </div>
                <div>
                  <Badge variant="outline" className="bg-rose-50 text-rose-700 border-rose-300 font-bold mb-2">
                    APPLICATION REJECTED
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                    Application Not Approved
                  </h1>
                  <div className="max-w-md mx-auto mt-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-left">
                    <span className="font-bold text-xs text-rose-900 block mb-1">Reason:</span>
                    <p className="text-xs text-rose-800">
                      {submittedProfile.rejectionReason || "Your application did not satisfy our partner verification standards."}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-16 w-16 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                    Application Ref: {submittedProfile?.id || "HEF-PRO-APP"}
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                    Application Successfully Submitted!
                  </h1>
                  <p className="text-xs md:text-sm text-foreground-secondary max-w-md mx-auto mt-2">
                    Thank you for applying to the Home-e-Fix Partner Network. Our operations team is reviewing your profile and availability.
                  </p>
                </div>
              </>
            )}

            {/* Lifecycle Status Stepper */}
            <div className="max-w-md mx-auto p-5 rounded-2xl border border-border bg-muted/20 text-left space-y-4">
              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block">1. Account & Profile Complete</span>
                  <span className="text-[11px] text-foreground-muted">Google authentication and profile information registered.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block">2. Trade Specialty & Availability Set</span>
                  <span className="text-[11px] text-foreground-muted">Services, experience, operational hubs, and working hours configured.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE"
                    ? "bg-emerald-500 text-white"
                    : submittedProfile?.status === "CORRECTION_REQUIRED"
                    ? "bg-amber-500 text-white"
                    : submittedProfile?.status === "REJECTED"
                    ? "bg-rose-500 text-white"
                    : submittedProfile?.status === "SUSPENDED"
                    ? "bg-slate-500 text-white"
                    : "bg-accent text-white animate-pulse"
                }`}>
                  {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE" ? "✓" : "3"}
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block">3. Administrative Review</span>
                  <span className="text-[11px] text-foreground-muted">
                    {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE"
                      ? "Profile and trade specialty verified and approved by administrator."
                      : submittedProfile?.status === "CORRECTION_REQUIRED"
                      ? "Correction requested by administrator. Please update required details."
                      : submittedProfile?.status === "REJECTED"
                      ? "Application not approved."
                      : submittedProfile?.status === "SUSPENDED"
                      ? "Account suspended by administration."
                      : "Active: Turnaround typically within 24 to 48 hours."}
                  </span>
                </div>
              </div>

              <div className={`flex items-start gap-3 ${
                submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE" ? "" : "opacity-60"
              }`}>
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 ${
                  submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE"
                    ? "bg-emerald-500 text-white"
                    : "bg-muted border border-border text-foreground-muted"
                }`}>
                  {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE" ? "✓" : "4"}
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block">4. Partner Approved & Dispatches Unlocked</span>
                  <span className="text-[11px] text-foreground-muted">
                    {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE"
                      ? "Active: Customer job assignments unlocked."
                      : "Customer dispatches unlock upon administrative sign-off."}
                  </span>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              {submittedProfile?.status === "CORRECTION_REQUIRED" && (
                <Button
                  variant="accent"
                  onClick={() => setStep(4)} // Go to trade/availability step to fix
                  className="font-bold gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Update Details & Resubmit
                </Button>
              )}
              {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE" ? (
                <Button
                  variant="accent"
                  onClick={() => navigate(ROUTES.PROFESSIONAL_JOBS)}
                  className="font-bold gap-2"
                >
                  View Job Dispatches <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => navigate(ROUTES.PROFESSIONAL_JOBS)}
                  className="font-bold"
                >
                  Go to Professional Portal
                </Button>
              )}
              <Button
                variant="outline"
                asChild
              >
                <Link to={ROUTES.HOME}>Return to Homepage</Link>
              </Button>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
