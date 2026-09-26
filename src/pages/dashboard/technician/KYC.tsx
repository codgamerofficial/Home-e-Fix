import { useState, useEffect } from "react";
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

export default function ProfessionalKYC() {
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<ProfessionalProfile | null>(null);
  const [activeUploadDoc, setActiveUploadDoc] = useState<KycDocumentType | null>(null);
  const [docNumberInput, setDocNumberInput] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");
  const [uploadError, setUploadError] = useState("");

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
  const verifiedCount = documents.filter((d) => d.status === "APPROVED").length;

  const handleFileUpload = (docType: KycDocumentType, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File size must not exceed 5MB.");
      return;
    }

    const maskedNumber = docNumberInput
      ? professionalService.maskDocumentNumber(docType, docNumberInput)
      : "XXXX-XXXX";

    const storagePath = professionalService.generateDocumentStoragePath(
      profile?.id || "temp-pro",
      docType,
      file.name
    );

    const nowIso = new Date().toISOString();
    const newDoc: ProfessionalDocument = {
      id: `doc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      professionalId: profile?.id || "pro-current",
      documentType: docType,
      documentNumberMasked: maskedNumber,
      storagePath,
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
      profile.status = "DOCUMENTS_UNDER_REVIEW";

      const allPros = professionalService.getAllProfessionals();
      const updatedList = allPros.map((p) => (p.id === profile.id ? profile : p));
      localStorage.setItem("homeefix_db_professionals", JSON.stringify(updatedList));
      setProfile({ ...profile });
    }

    setActiveUploadDoc(null);
    setDocNumberInput("");
    setUploadError("");
    setUploadSuccess(`Document "${file.name}" uploaded successfully for review!`);
    setTimeout(() => setUploadSuccess(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">KYC & Compliance Verification</h1>
          <p className="text-sm text-foreground-secondary">
            Your mandatory verification status required to receive dispatch notifications and payouts.
          </p>
        </div>

        <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />
          Status: {profile?.status?.replace("_", " ") || "DRAFT"}
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

      {/* Action Required Banner if CORRECTION_REQUIRED */}
      {profile?.status === "CORRECTION_REQUIRED" && (
        <Card className="p-5 border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sm">
            <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0" />
            Action Required: Administrator Requested Document Correction
          </div>
          <p className="text-xs text-amber-800 dark:text-amber-300">
            {profile.correctionNotes || "Please re-upload a clear copy of your identity or bank document."}
          </p>
        </Card>
      )}

      {/* COMPLIANCE OVERVIEW BANNER */}
      <Card className="p-5 border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-primary">Verification Checklist</span>
            <Badge variant="secondary" className="text-xs">
              {verifiedCount} Verified Documents
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary">
            All Home-e-Fix service partners undergo strict identity checks and administrative review before job dispatch.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-foreground-muted block">Protected By</span>
          <span className="text-xs font-bold text-primary flex items-center gap-1 justify-end">
            <Lock className="h-3 w-3 text-accent" /> Private Storage Vault
          </span>
        </div>
      </Card>

      {/* DOCUMENT TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {[
          {
            type: "IDENTITY_DOCUMENT" as KycDocumentType,
            title: "Government Photo ID (Aadhaar / Voter ID)",
            desc: "Identity & Residential Address Proof",
          },
          {
            type: "BANK_DOCUMENT" as KycDocumentType,
            title: "Bank Payout Document (Cancelled Cheque / Passbook)",
            desc: "Direct Payout Settlement Routing",
          },
          {
            type: "SKILL_CERTIFICATE" as KycDocumentType,
            title: "Trade Skill Certificate / ITI Diploma",
            desc: "Technical Qualification & Certifications",
          },
          {
            type: "ADDRESS_DOCUMENT" as KycDocumentType,
            title: "Secondary Address Document",
            desc: "Utility Bill / Rental Agreement",
          },
        ].map((item) => {
          const doc = documents.find((d) => d.documentType === item.type);
          const isUploaded = Boolean(doc);
          const isApproved = doc?.status === "APPROVED";

          return (
            <div
              key={item.type}
              className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3 flex flex-col justify-between"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="space-y-1">
                  <span className="font-bold text-sm text-primary">{item.title}</span>
                  <p className="text-[11px] text-foreground-secondary">{item.desc}</p>
                  {doc && (
                    <p className="text-xs font-mono text-foreground-muted">
                      Masked Number: {doc.documentNumberMasked}
                    </p>
                  )}
                </div>
                <span
                  className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                    isApproved
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : isUploaded
                      ? "bg-blue-50 text-blue-700 border border-blue-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}
                >
                  {isApproved ? (
                    <>
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                    </>
                  ) : isUploaded ? (
                    <>
                      <Clock className="h-3 w-3 text-blue-600" /> Under Review
                    </>
                  ) : (
                    "Not Uploaded"
                  )}
                </span>
              </div>

              {activeUploadDoc === item.type ? (
                <div className="p-3 rounded-xl bg-muted/40 border border-border space-y-2">
                  <Input
                    type="text"
                    placeholder="Enter document identifier (e.g. Last 4 digits)"
                    value={docNumberInput}
                    onChange={(e) => setDocNumberInput(e.target.value)}
                    className="text-xs"
                  />
                  <div className="flex gap-2">
                    <label className="flex-1 flex items-center justify-center gap-1.5 p-2 rounded-lg bg-accent text-white text-xs font-bold cursor-pointer hover:bg-accent/90 transition-colors">
                      <Upload className="h-3.5 w-3.5" /> Choose File (PDF/Image)
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
                      className="text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between pt-2 border-t border-border">
                  <span className="text-[11px] text-foreground-muted">
                    {doc ? `Uploaded: ${doc.fileName}` : "Max size: 5MB"}
                  </span>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setActiveUploadDoc(item.type);
                      setDocNumberInput("");
                    }}
                    className="text-xs font-bold gap-1"
                  >
                    <Upload className="h-3 w-3" />
                    {doc ? "Replace Document" : "Upload Document"}
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
