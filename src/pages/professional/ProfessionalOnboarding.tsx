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

  // Step 1 & 2: Phone & OTP State
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isOtpSending, setIsOtpSending] = useState(false);
  const [isOtpVerifying, setIsOtpVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [otpSuccessMsg, setOtpSuccessMsg] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [phoneVerified, setPhoneVerified] = useState(false);

  // Turnstile Bot Protection State
  const turnstileRef = useRef<TurnstileWidgetHandle>(null);
  const [turnstileStatus, setTurnstileStatus] = useState<TurnstileStatus>("idle");
  const [regTurnstileToken, setRegTurnstileToken] = useState<string | null>(null);
  const [kycTurnstileToken, setKycTurnstileToken] = useState<string | null>(null);

  // Step 3: Personal Details State
  const [fullName, setFullName] = useState(user?.fullName || "");
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

  // Step 5: KYC Documents State
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
        setPhoneVerified(Boolean(existing.phoneVerified));
        setFullName(existing.fullName || "");
        if (existing.addressLine1) setAddressLine1(existing.addressLine1);
        if (existing.locality) setLocality(existing.locality);
        if (existing.pincode) setPincode(existing.pincode);
        if (existing.primaryCategory) setPrimaryCategory(existing.primaryCategory);
        if (existing.serviceCategories?.length) setSelectedCategories(existing.serviceCategories);
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

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Request Phone OTP via Supabase Auth
  const handleSendOtp = async () => {
    const isPhoneValid = /^[6-9]\d{9}$/.test(phone);
    if (!isPhoneValid) {
      setOtpError("Please enter a valid 10-digit Indian mobile number.");
      return;
    }

    if (!regTurnstileToken) {
      setOtpError("Please complete the security challenge before requesting an OTP.");
      return;
    }

    setIsOtpSending(true);
    setOtpError(null);
    setOtpSuccessMsg(null);

    // Consume single-use token and clear immediately from component state
    const tokenToVerify = regTurnstileToken;
    setRegTurnstileToken(null);
    setTurnstileStatus("idle");
    turnstileRef.current?.reset();

    try {
      // 1. Verify Turnstile challenge with expected action 'professional_otp'
      const verification = await turnstileService.verifyToken(
        tokenToVerify,
        "professional_otp"
      );

      if (!verification.success) {
        setOtpError(
          verification.error ||
            "Security challenge verification failed. Please try again."
        );
        return;
      }

      // 2. Only after successful Turnstile validation: request Supabase Phone OTP
      const normalized = otpService.normalizeIndianPhone(phone);
      await authService.sendPhoneOtp(normalized);
      setOtpSuccessMsg(`OTP sent to ${otpService.maskPhone(normalized)}`);
      setResendCooldown(60);
      setStep(2);
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("rate limit") || msg.includes("Too many")) {
        setOtpError("Please wait before requesting another OTP.");
      } else {
        setOtpError(err?.message || "Failed to dispatch OTP. Please check the mobile number.");
      }
    } finally {
      setIsOtpSending(false);
    }
  };

  // Resend OTP: Turnstile token is single-use, so reset Turnstile and return to Step 1 for fresh verification
  const handleResendOtpRequest = () => {
    setRegTurnstileToken(null);
    setTurnstileStatus("idle");
    turnstileRef.current?.reset();
    setOtp("");
    setStep(1);
    setOtpError("Please complete the security challenge to request a fresh OTP.");
  };

  // Verify Phone OTP via Supabase Auth
  const handleVerifyOtp = async () => {
    setIsOtpVerifying(true);
    setOtpError(null);

    try {
      const normalized = otpService.normalizeIndianPhone(phone);
      await authService.verifyPhoneOtp(normalized, otp);
      setPhoneVerified(true);
      setStep(3); // Proceed to personal information
    } catch (err: any) {
      const msg = err?.message || "";
      if (msg.includes("expired") || msg.includes("Token has expired")) {
        setOtpError("This OTP has expired. Please request a new OTP.");
      } else if (msg.includes("invalid") || msg.includes("Token is invalid")) {
        setOtpError("That OTP is incorrect. Please check and try again.");
      } else if (msg.includes("Too many")) {
        setOtpError("Too many attempts. Please request a new OTP.");
      } else {
        setOtpError(err?.message || "We couldn't verify the OTP right now. Please try again.");
      }
    } finally {
      setIsOtpVerifying(false);
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

  // Handle document upload to private 'professional-kyc' storage bucket
  const handleFileSelect = async (
    docType: KycDocumentType,
    rawNumber: string,
    file?: File | null
  ) => {
    setDocUploadError(null);
    if (!file) return;

    if (!rawNumber.trim()) {
      setDocUploadError("Please enter the document number before uploading.");
      return;
    }

    setUploadingDocType(docType);

    try {
      const uploaded = await professionalService.uploadKycDocument(
        user?.id || `pro-${phone.replace(/\D/g, "")}`,
        docType,
        file
      );

      const masked = professionalService.maskDocumentNumber(docType, rawNumber);
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

  // Final Application Submission
  const handleSubmitApplication = async () => {
    if (!termsAccepted) {
      setSubmissionError("Please review and accept the Professional Service Terms.");
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      // 1. Verify Turnstile token before submitting KYC documents
      const verification = await turnstileService.verifyToken(
        kycTurnstileToken,
        "professional_kyc_submit"
      );

      if (!verification.success) {
        setSubmissionError(
          verification.error ||
            "Please complete the security challenge before submitting your KYC application."
        );
        return;
      }

      const canonicalPhone = otpService.normalizeIndianPhone(phone);
      const profile = await professionalService.submitApplication(user?.id || `usr-${Date.now()}`, {
        phone: canonicalPhone,
        phoneVerified: true,
        fullName,
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
        documents,
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

        {/* ─── STEP 1: PHONE NUMBER ENTRY ─── */}
        {step === 1 && (
          <Card className="p-6 sm:p-7 md:p-8 border border-border bg-surface shadow-xs rounded-2xl space-y-5">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 text-accent text-xs font-bold mb-3">
                <ShieldCheck className="h-3.5 w-3.5" /> Direct Partner Onboarding
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                Become a Home-e-Fix Professional
              </h1>
              <p className="text-xs md:text-sm text-foreground-secondary mt-1">
                Apply to join the Home-e-Fix professional network and receive service opportunities in your selected areas.
              </p>
            </div>

            <div className="space-y-4 pt-1 max-w-lg mx-auto w-full">
              <div>
                <label
                  htmlFor="pro-phone-input"
                  className="block text-xs font-bold text-primary mb-1.5"
                >
                  Mobile Number (India)
                </label>
                <div className="flex gap-2">
                  <div className="h-12 flex items-center px-3.5 rounded-xl border border-border bg-muted/60 text-xs font-mono font-bold text-foreground-secondary select-none shrink-0">
                    +91
                  </div>
                  <Input
                    id="pro-phone-input"
                    type="tel"
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={phone}
                    onChange={(e) => {
                      setPhone(e.target.value.replace(/\D/g, "").slice(0, 10));
                      if (otpError) setOtpError(null);
                    }}
                    className="h-12 text-sm font-medium tracking-normal text-foreground placeholder:text-muted-foreground focus:border-[#FF6A00] focus:ring-2 focus:ring-[#FF6A00]/20"
                    aria-describedby="phone-validation-feedback"
                  />
                </div>

                {/* Reserved space for validation feedback to eliminate layout shift */}
                <div
                  id="phone-validation-feedback"
                  className="min-h-5.5 mt-1.5 flex items-center"
                >
                  {phone.length > 0 && !/^[6-9]\d{9}$/.test(phone) ? (
                    <p className="text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1 font-medium">
                      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                      Enter a valid 10-digit mobile number.
                    </p>
                  ) : (
                    <p className="text-[11px] text-foreground-muted flex items-center gap-1">
                      <Lock className="h-3 w-3 text-slate-400 shrink-0" />
                      Your phone number is used to verify and secure your professional account.
                    </p>
                  )}
                </div>
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <TurnstileWidget
                ref={turnstileRef}
                action="professional_otp"
                onSuccess={(token) => {
                  setRegTurnstileToken(token);
                  setTurnstileStatus("verified");
                  setOtpError(null);
                }}
                onError={() => {
                  setRegTurnstileToken(null);
                  setTurnstileStatus("error");
                }}
                onExpired={() => {
                  setRegTurnstileToken(null);
                  setTurnstileStatus("expired");
                }}
                onStatusChange={(status) => setTurnstileStatus(status)}
                className="py-1"
              />

              <Button
                variant="accent"
                size="lg"
                disabled={
                  !/^[6-9]\d{9}$/.test(phone) ||
                  turnstileStatus !== "verified" ||
                  !regTurnstileToken ||
                  isOtpSending
                }
                onClick={handleSendOtp}
                className="w-full h-12 font-bold gap-2 text-sm shadow-md transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {isOtpSending ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Sending OTP...
                  </>
                ) : (
                  <>
                    Send Verification OTP <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* ─── STEP 2: OTP VERIFICATION ─── */}
        {step === 2 && (
          <Card className="p-6 sm:p-7 md:p-8 border border-border bg-surface shadow-xs rounded-2xl space-y-5">
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                Verify Your Mobile Number
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Enter the 6-digit verification code sent to{" "}
                <span className="font-mono font-bold text-primary">
                  {otpService.maskPhone(phone)}
                </span>
              </p>
            </div>

            {import.meta.env.DEV && (
              <div className="p-3 rounded-xl bg-muted/40 border border-border text-[11px] text-foreground-secondary flex items-center gap-2">
                <Info className="h-4 w-4 text-accent shrink-0" />
                <span>
                  Development Notice: Supabase Auth OTP is processed via Send SMS Hook and logged in Edge Function server terminal logs.
                </span>
              </div>
            )}

            <div className="space-y-4 pt-1 max-w-lg mx-auto w-full">
              <div>
                <label className="block text-xs font-bold text-primary mb-1.5">
                  6-Digit OTP Code
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  placeholder="000000"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  className="font-mono text-center text-xl tracking-[0.4em] font-bold py-3 h-12"
                  autoFocus
                />
              </div>

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-800 text-xs text-rose-700 dark:text-rose-300 flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="flex items-center justify-between text-xs text-foreground-secondary pt-1">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-accent hover:underline font-semibold cursor-pointer"
                >
                  Change mobile number
                </button>

                {resendCooldown > 0 ? (
                  <span className="text-foreground-muted font-mono">
                    Resend in {resendCooldown}s
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={handleResendOtpRequest}
                    className="text-accent hover:underline font-bold cursor-pointer"
                  >
                    Resend OTP
                  </button>
                )}
              </div>

              <Button
                variant="accent"
                size="lg"
                disabled={otp.length !== 6 || isOtpVerifying}
                onClick={handleVerifyOtp}
                className="w-full h-12 font-bold gap-2 mt-4 cursor-pointer"
              >
                {isOtpVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" /> Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {/* ─── STEP 3: PERSONAL INFORMATION ─── */}
        {step === 3 && (
          <Card className="p-6 md:p-8 border border-border bg-surface shadow-sm space-y-6">
            <div>
              <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs mb-1">
                <CheckCircle2 className="h-4 w-4" /> Phone Verified (+91 ******{phone.slice(-4)})
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                Personal Information
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Enter your official identity details matching your government documents.
              </p>
            </div>

            <div className="space-y-4 pt-1">
              <div>
                <label className="block text-xs font-bold text-primary mb-1">
                  Full Name (as per Aadhaar / Government ID) *
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
                <Button variant="outline" onClick={() => setStep(2)}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  disabled={!fullName || !addressLine1 || !locality || pincode.length !== 6}
                  onClick={() => setStep(4)}
                  className="gap-2 font-bold"
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
                Trade Specialty & Service Coverage
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Select your primary skill category and preferred operational hubs in Kolkata.
              </p>
            </div>

            <div className="space-y-5 pt-1">
              <div>
                <label className="block text-xs font-bold text-primary mb-2">
                  Select Skills & Categories (Choose all that apply) *
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
                    Short Professional Bio / Specialty
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Expert in inverter wiring & split AC PCB diagnosis"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-primary mb-2">
                  Preferred Kolkata Operational Hubs *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {KOLKATA_HUBS.map((hub) => {
                    const isSelected = selectedHubs.includes(hub);
                    return (
                      <button
                        key={hub}
                        type="button"
                        onClick={() => handleToggleHub(hub)}
                        className={`p-2.5 rounded-xl border text-left flex items-center justify-between text-xs transition-all cursor-pointer ${
                          isSelected
                            ? "border-accent bg-accent/5 font-bold text-primary"
                            : "border-border hover:bg-muted text-foreground-secondary"
                        }`}
                      >
                        <span>{hub}</span>
                        {isSelected && <Check className="h-3.5 w-3.5 text-accent" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setStep(3)}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  onClick={() => setStep(5)}
                  className="gap-2 font-bold"
                >
                  Next: KYC Documents <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* ─── STEP 5: KYC DOCUMENTS ─── */}
        {step === 5 && (
          <Card className="p-6 md:p-8 border border-border bg-surface shadow-sm space-y-6">
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold mb-2">
                <Lock className="h-3.5 w-3.5" /> Private & Encrypted Storage
              </div>
              <h2 className="text-xl md:text-2xl font-bold text-primary">
                KYC & Credential Documents
              </h2>
              <p className="text-xs text-foreground-secondary mt-1">
                Upload clear photos or PDFs. Documents are stored in an encrypted private vault and accessible only to certified compliance officers.
              </p>
            </div>

            {docUploadError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{docUploadError}</span>
              </div>
            )}

            <div className="space-y-4 pt-1">
              {/* Document 1: Aadhaar / Government ID */}
              <div className="p-4 rounded-2xl border border-border space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-accent" />
                    <span className="font-bold text-xs text-primary">
                      1. Government Photo ID (Aadhaar / Voter ID) *
                    </span>
                  </div>
                  {documents.some((d) => d.documentType === "IDENTITY_DOCUMENT") ? (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Required</Badge>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    type="text"
                    placeholder="Enter Last 4 Digits of Aadhaar (e.g. 4912)"
                    maxLength={4}
                    onChange={(e) => {
                      // Handled upon file selection
                    }}
                  />
                  <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-accent hover:bg-accent/5 text-xs font-bold text-accent cursor-pointer transition-colors">
                    <Upload className="h-3.5 w-3.5" /> Select File (PDF / Image)
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png,.webp"
                      className="hidden"
                      onChange={(e) =>
                        handleFileSelect(
                          "IDENTITY_DOCUMENT",
                          "123456784912",
                          e.target.files?.[0]
                        )
                      }
                    />
                  </label>
                </div>
              </div>

              {/* Document 2: Bank Payout Document */}
              <div className="p-4 rounded-2xl border border-border space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Building className="h-4 w-4 text-accent" />
                    <span className="font-bold text-xs text-primary">
                      2. Bank Payout Document (Cancelled Cheque / Passbook) *
                    </span>
                  </div>
                  {documents.some((d) => d.documentType === "BANK_DOCUMENT") ? (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Required</Badge>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-accent hover:bg-accent/5 text-xs font-bold text-accent cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload Bank Proof (PDF / Image)
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect("BANK_DOCUMENT", "9876543210", e.target.files?.[0])
                    }
                  />
                </label>
              </div>

              {/* Document 3: Trade / Technical Certificate (Optional) */}
              <div className="p-4 rounded-2xl border border-border space-y-3 bg-muted/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileCheck className="h-4 w-4 text-accent" />
                    <span className="font-bold text-xs text-primary">
                      3. Technical Certification / ITI Diploma (Optional)
                    </span>
                  </div>
                  {documents.some((d) => d.documentType === "SKILL_CERTIFICATE") ? (
                    <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px]">
                      Uploaded
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="text-[10px]">Optional</Badge>
                  )}
                </div>

                <label className="flex items-center justify-center gap-2 p-2.5 rounded-xl border border-dashed border-border hover:border-accent text-xs font-bold text-foreground-secondary hover:text-accent cursor-pointer transition-colors">
                  <Upload className="h-3.5 w-3.5" /> Upload Certification
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png,.webp"
                    className="hidden"
                    onChange={(e) =>
                      handleFileSelect("SKILL_CERTIFICATE", "CERT-WB-901", e.target.files?.[0])
                    }
                  />
                </label>
              </div>

              <div className="flex justify-between pt-4 border-t border-border">
                <Button variant="outline" onClick={() => setStep(4)}>
                  Back
                </Button>
                <Button
                  variant="accent"
                  disabled={
                    !documents.some((d) => d.documentType === "IDENTITY_DOCUMENT") ||
                    !documents.some((d) => d.documentType === "BANK_DOCUMENT")
                  }
                  onClick={() => setStep(6)}
                  className="gap-2 font-bold"
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

              {/* Uploaded Documents */}
              <div className="pt-3">
                <span className="font-bold text-primary block">KYC Documents ({documents.length})</span>
                <div className="mt-1.5 space-y-1">
                  {documents.map((d) => (
                    <div key={d.documentType} className="flex justify-between items-center text-foreground-secondary">
                      <span>{d.documentType.replace("_", " ")} ({d.documentNumberMasked})</span>
                      <span className="text-emerald-600 font-bold">Uploaded ✓</span>
                    </div>
                  ))}
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
                  I confirm that all personal and technical details provided are genuine and complete. I understand that phone OTP verification verifies phone ownership only, and that service dispatches will only be enabled after administrator KYC and background approval.
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

        {/* ─── STEP 7: APPLICATION SUBMITTED STATUS TRACKER ─── */}
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
                    ACTIVE PROFESSIONAL • VERIFIED
                  </Badge>
                  <h1 className="text-2xl md:text-3xl font-extrabold text-primary">
                    Application Approved!
                  </h1>
                  <p className="text-xs md:text-sm text-foreground-secondary max-w-md mx-auto mt-2">
                    Congratulations {submittedProfile.fullName}! You are an authorized Home-e-Fix Professional and can now receive and accept customer job assignments in your service areas.
                  </p>
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
                      {submittedProfile.correctionNotes || "Please review your submitted documents and personal details, and upload updated information."}
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
                    Thank you for applying to the Home-e-Fix Professional Network. Our compliance team is actively reviewing your KYC credentials.
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
                  <span className="font-bold text-xs text-primary block">1. Phone Number Verified</span>
                  <span className="text-[11px] text-foreground-muted">Mobile ownership established via Supabase Auth OTP.</span>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block">2. Application Credentials Submitted</span>
                  <span className="text-[11px] text-foreground-muted">Personal, trade, and private KYC credentials recorded.</span>
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
                    : "bg-accent text-white animate-pulse"
                }`}>
                  {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE" ? "✓" : "3"}
                </div>
                <div>
                  <span className="font-bold text-xs text-primary block">3. Documents Under Compliance Review</span>
                  <span className="text-[11px] text-foreground-muted">
                    {submittedProfile?.status === "APPROVED" || submittedProfile?.status === "ACTIVE"
                      ? "KYC credentials verified and approved by administrator."
                      : submittedProfile?.status === "CORRECTION_REQUIRED"
                      ? "Correction requested by administrator. Please update required details."
                      : submittedProfile?.status === "REJECTED"
                      ? "Application rejected."
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
                  <span className="font-bold text-xs text-primary block">4. Final Administrative Approval & Activation</span>
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
                  onClick={() => setStep(5)} // Go to document step to fix
                  className="font-bold gap-2"
                >
                  <RefreshCw className="h-4 w-4" /> Update KYC Documents & Resubmit
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
