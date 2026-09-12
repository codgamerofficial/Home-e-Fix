import { useState } from "react";
import { ShieldCheck, CheckCircle2, Clock, Upload, FileText, AlertCircle, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface KycDocument {
  id: string;
  name: string;
  category: string;
  status: "VERIFIED" | "PENDING_REVIEW" | "NOT_SUBMITTED";
  number: string;
  verifiedDate?: string;
  fileName?: string;
}

const INITIAL_DOCS: KycDocument[] = [
  {
    id: "doc-aadhaar",
    name: "Government ID (Aadhaar Card)",
    category: "Identity & Address Verification",
    status: "VERIFIED",
    number: "XXXX-XXXX-4912",
    verifiedDate: "14 Jan 2026",
    fileName: "aadhaar_front_back_signed.pdf",
  },
  {
    id: "doc-pan",
    name: "PAN Card",
    category: "Tax & Compliance Identification",
    status: "VERIFIED",
    number: "ABCDE1234F",
    verifiedDate: "14 Jan 2026",
    fileName: "pan_card_copy.pdf",
  },
  {
    id: "doc-bank",
    name: "Bank Account (Payout Settlement)",
    category: "Payout Routing & Direct Deposit",
    status: "VERIFIED",
    number: "HDFC Bank •••• 8821 (IFSC: HDFC0001092)",
    verifiedDate: "15 Jan 2026",
    fileName: "cancelled_cheque.pdf",
  },
  {
    id: "doc-pcc",
    name: "Police Background Clearance Certificate",
    category: "Safety & Criminal Record Verification",
    status: "VERIFIED",
    number: "PCC-WB-2026-901",
    verifiedDate: "16 Jan 2026",
    fileName: "kolkata_police_clearance.pdf",
  },
];

export default function ProfessionalKYC() {
  const [documents, setDocuments] = useState<KycDocument[]>(INITIAL_DOCS);
  const [activeUploadDoc, setActiveUploadDoc] = useState<string | null>(null);
  const [docNumberInput, setDocNumberInput] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState("");

  const verifiedCount = documents.filter((d) => d.status === "VERIFIED").length;
  const overallKycStatus =
    verifiedCount === documents.length
      ? "Approved"
      : verifiedCount > 0
      ? "Under Review"
      : "Pending";

  const handleFileUpload = (docId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setDocuments((prev) =>
      prev.map((d) =>
        d.id === docId
          ? {
              ...d,
              status: "PENDING_REVIEW",
              fileName: file.name,
              number: docNumberInput || d.number,
            }
      : d
      )
    );
    setActiveUploadDoc(null);
    setDocNumberInput("");
    setUploadSuccess(`Document "${file.name}" uploaded successfully for verification!`);
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
          <ShieldCheck className="h-4 w-4 text-emerald-600" /> Compliance Status: {overallKycStatus}
        </div>
      </div>

      {uploadSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
          {uploadSuccess}
        </div>
      )}

      {/* COMPLIANCE OVERVIEW BANNER */}
      <Card className="p-5 border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="font-bold text-sm text-primary">Verification Checklist</span>
            <Badge variant="secondary" className="text-xs">
              {verifiedCount} of {documents.length} Verified
            </Badge>
          </div>
          <p className="text-xs text-foreground-secondary">
            All Home-e-Fix service partners undergo strict identity check and police verification before dispatch.
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] text-foreground-muted block">Background Checked By</span>
          <span className="text-xs font-bold text-primary">Home-e-Fix Trust & Safety Council</span>
        </div>
      </Card>

      {/* DOCUMENT TILES */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <div
            key={doc.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm space-y-3 flex flex-col justify-between"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="space-y-1">
                <span className="font-bold text-sm text-primary">{doc.name}</span>
                <p className="text-[11px] text-foreground-secondary">{doc.category}</p>
                <p className="text-xs font-mono text-foreground-muted">{doc.number}</p>
              </div>
              <span
                className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 ${
                  doc.status === "VERIFIED"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-amber-50 text-amber-700 border border-amber-200"
                }`}
              >
                {doc.status === "VERIFIED" ? (
                  <>
                    <CheckCircle2 className="h-3 w-3 text-emerald-600" /> Verified
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 text-amber-600" /> Pending Review
                  </>
                )}
              </span>
            </div>

            {activeUploadDoc === doc.id ? (
              <div className="pt-2 border-t border-border space-y-2">
                <Input
                  placeholder="Document number / identifier"
                  value={docNumberInput}
                  onChange={(e) => setDocNumberInput(e.target.value)}
                  className="text-xs h-8"
                />
                <div className="flex gap-2">
                  <label className="cursor-pointer flex-1 text-center py-1 px-3 rounded-lg border border-accent bg-accent/5 text-accent text-xs font-bold hover:bg-accent/10">
                    Choose PDF / Image
                    <input
                      type="file"
                      accept=".pdf,image/*"
                      className="hidden"
                      onChange={(e) => handleFileUpload(doc.id, e)}
                    />
                  </label>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs"
                    onClick={() => setActiveUploadDoc(null)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="pt-2 border-t border-border flex items-center justify-between text-xs text-foreground-muted">
                <span>{doc.verifiedDate ? `Verified on ${doc.verifiedDate}` : "File submitted"}</span>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => alert(`Viewing on-file copy: ${doc.fileName}`)}
                  >
                    <Eye className="h-3 w-3" /> View
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs gap-1"
                    onClick={() => {
                      setActiveUploadDoc(doc.id);
                      setDocNumberInput(doc.number);
                    }}
                  >
                    <Upload className="h-3 w-3" /> Re-upload
                  </Button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
