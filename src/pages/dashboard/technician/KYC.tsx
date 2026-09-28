import { useState, useEffect } from "react";
import { Link } from "react-router";
import {
  ShieldCheck,
  CheckCircle2,
  Clock,
  Upload,
  FileText,
  AlertCircle,
  Eye,
  AlertTriangle,
  Lock,
  XCircle,
  MapPin,
  Calendar,
  Briefcase,
  Check,
  ArrowRight,
  RefreshCw,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth.store";
import { professionalService } from "@/services/professional/professionalService";
import type {
  ProfessionalProfile,
  ProfessionalDocument,
  KycDocumentType,
} from "@/services/professional/professional.types";
import { ROUTES } from "@/constants/routes";

export default function ProfessionalKYC() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [activeUploadDoc, setActiveUploadDoc] = useState<KycDocumentType | null>(null);
  const [docNumberInput, setDocNumberInput] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [previewLoading, setPreviewLoading] = useState<string | null>(null);

  const loadProfile = () => {
    if (user?.id) {
      const pro = professionalService.getProfessionalByUserId(user.id);
      if (pro) {
        setProfile(pro);
        return;
      }
    }
    const all = professionalService.getAllProfessionals();
    if (all.length > 0) {
      setProfile(all[0]);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user?.id]);

  const documents: ProfessionalDocument[] = profile?.documents || [];
  const status = (profile?.status || "PROFILE_INCOMPLETE").toUpperCase();
  const isApproved = status === "APPROVED" || status === "ACTIVE";

  const handleFileUpload = async (docType: KycDocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setUploadError("File size must not exceed 10MB.");
      return;
    }

    try {
      const maskedNumber = docNumberInput.trim()
        ? professionalService.maskDocumentNumber(docType, docNumberInput)
        : "OPTIONAL-REF";

      const uploaded = await professionalService.uploadKycDocument(
        profile?.id || "temp-pro",
        docType,
        file
      );

      const nowIso = new Date().toISOString();
      const newDoc: ProfessionalDocument = {
        id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        professionalId: profile?.id || "pro-current",
        documentType: docType,
        documentNumberMasked: maskedNumber,
        storagePath: uploaded.storagePath,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        status: "PENDING",
        uploadedAt: nowIso,
        createdAt: nowIso,
        updatedAt: nowIso,
      };

      if (profile) {
        const existingDocs = profile.documents || [];
        const updatedDocs = [
          ...existingDocs.filter((d) => d.documentType !== docType),
          newDoc,
        ];
        profile.documents = updatedDocs;

        const allPros = professionalService.getAllProfessionals();
        const updatedList = allPros.map((p) => (p.id === profile.id ? profile : p));
        localStorage.setItem("homeefix_db_professionals", JSON.stringify(updatedList));
        setProfile({ ...profile });
      }

      setActiveUploadDoc(null);
      setDocNumberInput("");
      setUploadError("");
      setUploadSuccess(`Certificate "${file.name}" saved to your professional profile!`);
      setTimeout(() => setUploadSuccess(""), 4000);
    } catch (err: any) {
      setUploadError(err?.message || "Failed to upload file.");
    }
  };

  const handlePreview = async (storagePath: string) => {
    setPreviewLoading(storagePath);
    try {
      const url = await professionalService.getDocumentSignedUrl(storagePath, 300);
      if (url) {
        window.open(url, "_blank", "noopener,noreferrer");
      }
    } catch {
      alert("Unable to generate preview URL.");
    } finally {
      setPreviewLoading(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-primary font-heading">
            Home-e-Fix Partner Status
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Authoritative marketplace verification, trade approvals, and operational availability
          </p>
        </div>

        <div>
          {isApproved ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-300 text-xs font-bold shadow-xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              Home-e-Fix Verified Partner
            </div>
          ) : status === "UNDER_REVIEW" || status === "APPLICATION_SUBMITTED" || status === "DOCUMENTS_UNDER_REVIEW" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold">
              <Clock className="h-4 w-4 text-blue-600" />
              Under Administrative Review
            </div>
          ) : status === "SUSPENDED" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold">
              <AlertTriangle className="h-4 w-4 text-slate-700" />
              Account Suspended
            </div>
          ) : status === "REJECTED" ? (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold">
              <XCircle className="h-4 w-4 text-rose-600" />
              Application Not Approved
            </div>
          ) : (
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-bold">
              <AlertCircle className="h-4 w-4 text-amber-600" />
              Profile Incomplete
            </div>
          )}
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {uploadSuccess}
        </div>
      )}

      {uploadError && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
          {uploadError}
        </div>
      )}

      {/* PRIMARY STATUS BANNER */}
      {isApproved ? (
        <Card className="p-6 border-emerald-300 bg-emerald-50/50 dark:bg-emerald-950/20 text-emerald-950 dark:text-emerald-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-emerald-900 dark:text-emerald-100">
                  Verified Partner • Active Dispatches Unlocked
                </h3>
                <p className="text-xs text-emerald-800 dark:text-emerald-300 max-w-2xl leading-relaxed">
                  Your professional application has been approved by Home-e-Fix administrators. You are authorized to receive and accept incoming customer bookings in your approved trade specialties and service areas.
                </p>
              </div>
            </div>
            <Button variant="accent" size="sm" asChild className="shrink-0 font-bold">
              <Link to={ROUTES.PROFESSIONAL_JOBS}>
                View Job Dispatches <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      ) : status === "CORRECTION_REQUIRED" ? (
        <Card className="p-6 border-amber-300 bg-amber-50/60 dark:bg-amber-950/30 text-amber-950 dark:text-amber-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-amber-900 dark:text-amber-100">
                  Action Required: Administrator Requested Update
                </h3>
                <p className="text-xs text-amber-800 dark:text-amber-300 max-w-2xl leading-relaxed">
                  {profile?.correctionNotes || "Please review your profile information, service areas, or working hours and resubmit."}
                </p>
              </div>
            </div>
            <Button variant="accent" size="sm" asChild className="shrink-0 font-bold">
              <Link to="/become-a-professional/onboarding">
                Update Application <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      ) : status === "SUSPENDED" ? (
        <Card className="p-6 border-slate-300 bg-slate-100/70 dark:bg-slate-900/40 text-slate-900 dark:text-slate-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">
                Partner Account Suspended
              </h3>
              <p className="text-xs text-slate-700 dark:text-slate-300 max-w-2xl leading-relaxed">
                {profile?.suspensionReason || profile?.rejectionReason || "Your account has been temporarily suspended from accepting service dispatches. Please contact partner support."}
              </p>
            </div>
          </div>
        </Card>
      ) : status === "REJECTED" ? (
        <Card className="p-6 border-rose-300 bg-rose-50/60 dark:bg-rose-950/30 text-rose-950 dark:text-rose-100 space-y-3">
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center shrink-0 mt-0.5">
              <XCircle className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-rose-900 dark:text-rose-100">
                Partner Application Not Approved
              </h3>
              <p className="text-xs text-rose-800 dark:text-rose-300 max-w-2xl leading-relaxed">
                Reason: {profile?.rejectionReason || "Your application did not satisfy our trade or service requirements."}
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <Card className="p-6 border-blue-200 bg-blue-50/60 dark:bg-blue-950/20 text-blue-950 dark:text-blue-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0 mt-0.5">
                <Clock className="h-6 w-6" />
              </div>
              <div className="space-y-1">
                <h3 className="text-base font-bold text-blue-950 dark:text-blue-100">
                  Application Under Administrative Review
                </h3>
                <p className="text-xs text-blue-800 dark:text-blue-300 max-w-2xl leading-relaxed">
                  Our operations team is reviewing your profile and availability. Dispatches unlock immediately upon administrative approval.
                </p>
              </div>
            </div>
            <Button variant="outline" size="sm" asChild className="shrink-0 font-semibold">
              <Link to="/become-a-professional/onboarding?step=7">
                View Tracker <ArrowRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          </div>
        </Card>
      )}

      {/* PARTNER PROFILE & OPERATIONAL SETTINGS */}
      <Card className="p-6 border border-border bg-surface space-y-4 shadow-xs">
        <div className="flex items-center justify-between border-b border-border pb-3">
          <div className="flex items-center gap-2">
            <Briefcase className="h-4 w-4 text-accent" />
            <h3 className="text-sm font-bold text-primary">Operational Profile & Coverage</h3>
          </div>
          <Badge variant="outline" className="text-xs font-mono">
            ID: {profile?.id || "HEF-PRO"}
          </Badge>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1">
            <span className="text-[11px] text-foreground-muted block">Primary Trade</span>
            <span className="font-bold text-primary capitalize block text-sm">
              {profile?.primaryCategory || "Electrical"}
            </span>
            <span className="text-[10px] text-foreground-secondary">
              {profile?.experienceYears || 3} Years Experience
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1">
            <span className="text-[11px] text-foreground-muted block">Service Hubs</span>
            <span className="font-semibold text-primary block truncate text-sm">
              {profile?.preferredServiceAreas?.join(", ") || "Kolkata Hubs"}
            </span>
            <span className="text-[10px] text-emerald-600 font-medium">Active Zone</span>
          </div>

          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1">
            <span className="text-[11px] text-foreground-muted block">Working Hours</span>
            <span className="font-semibold text-primary block text-sm">
              {profile?.workingHours?.start || "08:00 AM"} – {profile?.workingHours?.end || "08:00 PM"}
            </span>
            <span className="text-[10px] text-foreground-secondary">
              {profile?.workingHours?.daysOfWeek?.join(", ") || "Mon - Sat"}
            </span>
          </div>

          <div className="p-3 rounded-xl bg-muted/20 border border-border space-y-1">
            <span className="text-[11px] text-foreground-muted block">Verified Mobile</span>
            <span className="font-mono font-semibold text-primary block text-sm">
              {profile?.phone || "+91 ••••••••••"}
            </span>
            <span className="text-[10px] text-emerald-600 font-bold">
              {profile?.phoneVerified ? "✓ Phone Verified" : "Verification Pending"}
            </span>
          </div>
        </div>
      </Card>

      {/* EXTENSIBLE CERTIFICATIONS (OPTIONAL) */}
      <Card className="p-6 border border-border bg-surface space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-border pb-3">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-accent" />
              <h3 className="text-sm font-bold text-primary">
                Technical Certifications & Trade Diplomas (Optional)
              </h3>
            </div>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Government-ID is not required for onboarding. Trade certifications enhance customer trust and qualify you for specialized categories.
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] w-fit">
            Optional Credentials
          </Badge>
        </div>

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              type: "SKILL_CERTIFICATE" as KycDocumentType,
              title: "Trade Skill Certificate / ITI Diploma",
              desc: "Technical Qualification & Certifications (e.g. Wireman license, HVAC diploma)",
            },
            {
              type: "PROFILE_PHOTO" as KycDocumentType,
              title: "Official Partner Photo",
              desc: "Clear front headshot for customer booking screen & verified badge",
            },
          ].map((item) => {
            const doc = documents.find((d) => d.documentType === item.type);
            const isUploaded = Boolean(doc);

            return (
              <div
                key={item.type}
                className="rounded-2xl border border-border bg-muted/10 p-4 space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-primary">{item.title}</span>
                    {doc ? (
                      <Badge variant="secondary" className="bg-emerald-50 text-emerald-700 text-[10px]">
                        ✓ Added
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-[10px]">Optional</Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-foreground-secondary">{item.desc}</p>
                  {doc && (
                    <p className="text-[10px] font-mono text-foreground-muted">
                      {doc.fileName} • Ref: {doc.documentNumberMasked}
                    </p>
                  )}
                </div>

                {activeUploadDoc === item.type ? (
                  <div className="p-3 rounded-xl bg-surface border border-border space-y-2 text-xs">
                    <Input
                      type="text"
                      placeholder="Certificate title or reference number"
                      value={docNumberInput}
                      onChange={(e) => setDocNumberInput(e.target.value)}
                      className="text-xs h-8"
                    />
                    <div className="flex gap-2">
                      <label className="flex-1 flex items-center justify-center gap-1.5 h-8 px-2 rounded-lg bg-accent text-white text-xs font-bold cursor-pointer hover:bg-accent/90 transition-colors">
                        <Upload className="h-3 w-3" /> Select File (PDF/Image)
                        <input
                          type="file"
                          accept=".pdf,.jpg,.jpeg,.png,.webp"
                          className="hidden"
                          onChange={(e) => handleFileUpload(item.type, e)}
                        />
                      </label>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setActiveUploadDoc(null)}
                        className="text-xs h-8"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2 border-t border-border">
                    {doc ? (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        disabled={previewLoading === doc.storagePath}
                        onClick={() => handlePreview(doc.storagePath)}
                        className="h-7 text-[11px] gap-1 text-accent font-bold"
                      >
                        {previewLoading === doc.storagePath ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <Eye className="h-3 w-3" />
                        )}
                        View Document
                      </Button>
                    ) : (
                      <span className="text-[11px] text-foreground-muted">Not uploaded</span>
                    )}

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setActiveUploadDoc(item.type);
                        setDocNumberInput("");
                      }}
                      className="text-xs h-7 font-bold gap-1"
                    >
                      <Upload className="h-3 w-3" />
                      {doc ? "Replace" : "Add Certificate"}
                    </Button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}
