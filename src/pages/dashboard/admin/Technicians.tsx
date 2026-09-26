import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router";
import {
  ShieldCheck,
  ShieldAlert,
  Check,
  X,
  Star,
  FileText,
  RefreshCw,
  Eye,
  AlertCircle,
  Clock,
  User,
  Phone,
  MapPin,
  Briefcase,
  AlertTriangle,
  History,
  Lock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { professionalService } from "@/services/professional/professionalService";
import type {
  ProfessionalProfile,
  ProfessionalStatus,
  ProfessionalReviewLog,
} from "@/services/professional/professional.types";
import { useAuthStore } from "@/store/auth.store";

export default function Technicians() {
  const { id: paramId } = useParams();
  const { user: currentAdmin } = useAuthStore();
  const [professionals, setProfessionals] = useState<ProfessionalProfile[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("ALL");
  const [reviewTarget, setReviewTarget] = useState<ProfessionalProfile | null>(null);
  const [reviewLogs, setReviewLogs] = useState<ProfessionalReviewLog[]>([]);

  // Dialog Action States
  const [actionType, setActionType] = useState<"APPROVE" | "REJECT" | "CORRECTION" | "SUSPEND" | null>(null);
  const [actionReason, setActionReason] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  const loadData = () => {
    const list = professionalService.getAllProfessionals();
    setProfessionals(list);
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (paramId && professionals.length > 0) {
      const match = professionals.find((p) => p.id === paramId);
      if (match) {
        handleOpenReview(match);
      }
    }
  }, [paramId, professionals]);

  // Filter professionals
  const filteredProfessionals = useMemo(() => {
    if (selectedStatus === "ALL") return professionals;
    return professionals.filter((p) => (p.status || "").toUpperCase() === selectedStatus);
  }, [professionals, selectedStatus]);

  // Statistics derived truthfully from real database records (no fake numbers)
  const stats = useMemo(() => {
    const total = professionals.length;
    const underReview = professionals.filter((p) =>
      ["APPLICATION_SUBMITTED", "DOCUMENTS_UNDER_REVIEW", "PENDING_REVIEW"].includes(
        (p.status || "").toUpperCase()
      )
    ).length;
    const approved = professionals.filter((p) =>
      ["APPROVED", "ACTIVE"].includes((p.status || "").toUpperCase())
    ).length;
    const correction = professionals.filter((p) =>
      (p.status || "").toUpperCase() === "CORRECTION_REQUIRED"
    ).length;
    const rejected = professionals.filter((p) =>
      (p.status || "").toUpperCase() === "REJECTED"
    ).length;
    const suspended = professionals.filter((p) =>
      (p.status || "").toUpperCase() === "SUSPENDED"
    ).length;

    return { total, underReview, approved, correction, rejected, suspended };
  }, [professionals]);

  const [viewingDocId, setViewingDocId] = useState<string | null>(null);

  const handleOpenReview = (pro: ProfessionalProfile) => {
    setReviewTarget(pro);
    setActionType(null);
    setActionReason("");
    setErrorMessage(null);
    const logs = professionalService.getReviewLogs(pro.id);
    setReviewLogs(logs);
  };

  const handleViewDocument = async (storagePath: string, docId: string) => {
    setViewingDocId(docId);
    try {
      const signedUrl = await professionalService.getDocumentSignedUrl(storagePath, 3600);
      if (signedUrl) {
        window.open(signedUrl, "_blank", "noopener,noreferrer");
      } else {
        alert("Unable to generate authorized signed URL for this KYC document.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to retrieve signed URL.");
    } finally {
      setViewingDocId(null);
    }
  };

  const handleReviewDoc = async (
    docId: string,
    status: "APPROVED" | "REJECTED" | "REPLACEMENT_REQUIRED"
  ) => {
    if (!reviewTarget) return;
    let reason: string | undefined = undefined;
    if (status === "REJECTED" || status === "REPLACEMENT_REQUIRED") {
      const promptVal = window.prompt(`Enter mandatory reason for marking document as ${status}:`);
      if (!promptVal || !promptVal.trim()) {
        alert("Action cancelled: A specific reason is mandatory.");
        return;
      }
      reason = promptVal.trim();
    }

    try {
      const updated = await professionalService.adminReviewDocument(
        reviewTarget.id,
        docId,
        status,
        reason,
        currentAdmin?.id || "adm-compliance"
      );
      setReviewTarget({ ...updated });
      loadData();
    } catch (err: any) {
      alert(err?.message || "Failed to update document status.");
    }
  };

  const handleExecuteAction = async () => {
    if (!reviewTarget) return;
    setIsProcessing(true);
    setErrorMessage(null);

    const adminId = currentAdmin?.id || "adm-compliance-officer";
    const adminName = currentAdmin?.fullName || "Compliance Officer";

    try {
      if (actionType === "APPROVE") {
        await professionalService.adminApproveApplication(
          reviewTarget.id,
          adminId,
          adminName,
          actionReason || "Background and KYC credentials verified by administrator."
        );
        setSuccessNotice(`Professional "${reviewTarget.fullName}" approved successfully.`);
      } else if (actionType === "REJECT") {
        if (!actionReason.trim()) {
          setErrorMessage("Please specify a reason for rejection.");
          setIsProcessing(false);
          return;
        }
        await professionalService.adminRejectApplication(
          reviewTarget.id,
          adminId,
          adminName,
          actionReason
        );
        setSuccessNotice(`Application for "${reviewTarget.fullName}" marked as REJECTED.`);
      } else if (actionType === "CORRECTION") {
        if (!actionReason.trim()) {
          setErrorMessage("Please specify the corrections required.");
          setIsProcessing(false);
          return;
        }
        await professionalService.adminRequestCorrection(
          reviewTarget.id,
          adminId,
          adminName,
          actionReason
        );
        setSuccessNotice(`Correction request sent to "${reviewTarget.fullName}".`);
      } else if (actionType === "SUSPEND") {
        if (!actionReason.trim()) {
          setErrorMessage("Please specify a reason for suspension.");
          setIsProcessing(false);
          return;
        }
        await professionalService.adminSuspendProfessional(
          reviewTarget.id,
          adminId,
          adminName,
          actionReason
        );
        setSuccessNotice(`Professional "${reviewTarget.fullName}" has been SUSPENDED.`);
      }

      loadData();
      setReviewTarget(null);
      setActionType(null);
      setActionReason("");
      setTimeout(() => setSuccessNotice(null), 5000);
    } catch (err: any) {
      setErrorMessage(err?.message || "Failed to execute review action.");
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const s = (status || "").toUpperCase();
    switch (s) {
      case "APPROVED":
      case "ACTIVE":
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Approved ✓</Badge>;
      case "DOCUMENTS_UNDER_REVIEW":
      case "APPLICATION_SUBMITTED":
      case "UNDER_REVIEW":
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200">Under Review</Badge>;
      case "CORRECTION_REQUIRED":
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200">Correction Required</Badge>;
      case "REJECTED":
        return <Badge className="bg-rose-50 text-rose-700 border-rose-200">Rejected</Badge>;
      case "SUSPENDED":
        return <Badge className="bg-slate-100 text-slate-700 border-slate-300">Suspended</Badge>;
      case "PHONE_VERIFIED":
        return <Badge className="bg-purple-50 text-purple-700 border-purple-200">Phone Verified</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">
            Professional Verification & KYC Review
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Review applicant identities, verify trade credentials, and authorize service dispatch privileges
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadData} className="h-9 gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </Button>
      </div>

      {successNotice && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          {successNotice}
        </div>
      )}

      {/* Real Statistics Metric Cards (Zero fake figures) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card
          onClick={() => setSelectedStatus("ALL")}
          className={`p-3.5 border cursor-pointer transition-all ${
            selectedStatus === "ALL" ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-surface"
          }`}
        >
          <span className="text-[11px] font-bold text-foreground-secondary block">Total Applicants</span>
          <span className="text-2xl font-extrabold text-primary">{stats.total}</span>
        </Card>

        <Card
          onClick={() => setSelectedStatus("DOCUMENTS_UNDER_REVIEW")}
          className={`p-3.5 border cursor-pointer transition-all ${
            selectedStatus === "DOCUMENTS_UNDER_REVIEW" ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-surface"
          }`}
        >
          <span className="text-[11px] font-bold text-blue-600 block">Under Review</span>
          <span className="text-2xl font-extrabold text-blue-700">{stats.underReview}</span>
        </Card>

        <Card
          onClick={() => setSelectedStatus("APPROVED")}
          className={`p-3.5 border cursor-pointer transition-all ${
            selectedStatus === "APPROVED" ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-surface"
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-600 block">Approved</span>
          <span className="text-2xl font-extrabold text-emerald-700">{stats.approved}</span>
        </Card>

        <Card
          onClick={() => setSelectedStatus("CORRECTION_REQUIRED")}
          className={`p-3.5 border cursor-pointer transition-all ${
            selectedStatus === "CORRECTION_REQUIRED" ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-surface"
          }`}
        >
          <span className="text-[11px] font-bold text-amber-600 block">Correction Req.</span>
          <span className="text-2xl font-extrabold text-amber-700">{stats.correction}</span>
        </Card>

        <Card
          onClick={() => setSelectedStatus("REJECTED")}
          className={`p-3.5 border cursor-pointer transition-all ${
            selectedStatus === "REJECTED" ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-surface"
          }`}
        >
          <span className="text-[11px] font-bold text-rose-600 block">Rejected</span>
          <span className="text-2xl font-extrabold text-rose-700">{stats.rejected}</span>
        </Card>

        <Card
          onClick={() => setSelectedStatus("SUSPENDED")}
          className={`p-3.5 border cursor-pointer transition-all ${
            selectedStatus === "SUSPENDED" ? "border-accent bg-accent/5 ring-1 ring-accent" : "border-border bg-surface"
          }`}
        >
          <span className="text-[11px] font-bold text-slate-600 block">Suspended</span>
          <span className="text-2xl font-extrabold text-slate-700">{stats.suspended}</span>
        </Card>
      </div>

      {/* Main Professionals Table */}
      <Card className="border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-foreground-secondary font-heading font-semibold">
              <tr>
                <th className="p-4">Applicant / Phone</th>
                <th className="p-4">Trade Specialty</th>
                <th className="p-4">Operational Hubs</th>
                <th className="p-4">Documents</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredProfessionals.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground-muted">
                    No professionals matching status "{selectedStatus}".
                  </td>
                </tr>
              ) : (
                filteredProfessionals.map((pro) => {
                  const docCount = pro.documents?.length || 0;
                  return (
                    <tr key={pro.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-accent/10 text-accent font-bold flex items-center justify-center shrink-0">
                            {pro.fullName?.[0]?.toUpperCase() || "P"}
                          </div>
                          <div>
                            <span className="font-bold text-primary block">{pro.fullName}</span>
                            <span className="text-foreground-secondary font-mono text-[11px]">
                              {pro.phone} {pro.phoneVerified && <span className="text-emerald-600">✓</span>}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-primary block capitalize">
                          {pro.primaryCategory || "General Services"}
                        </span>
                        <span className="text-[11px] text-foreground-muted">
                          {pro.experienceYears || 1} yrs experience
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="text-foreground-secondary line-clamp-1">
                          {pro.preferredServiceAreas?.join(", ") || pro.locality || "Kolkata"}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="inline-flex items-center gap-1 font-semibold text-foreground-secondary">
                          <FileText className="h-3.5 w-3.5 text-accent" /> {docCount} Uploaded
                        </span>
                      </td>

                      <td className="p-4">{getStatusBadge(pro.status)}</td>

                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenReview(pro)}
                          className="h-8 text-xs font-bold gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" /> Review Application
                        </Button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* ─────────────────────────────────────────────────────────────────────────────
          APPLICATION REVIEW MODAL
         ───────────────────────────────────────────────────────────────────────────── */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col border border-border bg-surface shadow-2xl rounded-2xl">
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-bold text-primary">{reviewTarget.fullName}</h2>
                  {getStatusBadge(reviewTarget.status)}
                </div>
                <p className="text-xs text-foreground-secondary mt-0.5 font-mono">
                  Ref ID: {reviewTarget.id} • Registered: {reviewTarget.createdAt?.slice(0, 10)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewTarget(null)}
                className="p-1.5 rounded-full hover:bg-muted text-foreground-muted hover:text-foreground transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 text-xs flex-1">
              {/* 1. Applicant & Phone Verification */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl border border-border bg-muted/20">
                <div>
                  <span className="font-bold text-foreground-muted block">Mobile Number</span>
                  <span className="font-mono text-sm font-bold text-primary">
                    {reviewTarget.phone} {reviewTarget.phoneVerified && <span className="text-emerald-600">✓ (Verified)</span>}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-foreground-muted block">Residential Address</span>
                  <span className="text-primary font-medium">
                    {reviewTarget.addressLine1}, {reviewTarget.locality}, {reviewTarget.city} - {reviewTarget.pincode}
                  </span>
                </div>
                <div>
                  <span className="font-bold text-foreground-muted block">Primary Trade</span>
                  <span className="text-primary font-semibold capitalize">
                    {reviewTarget.primaryCategory} ({reviewTarget.experienceYears} Years Experience)
                  </span>
                </div>
                <div>
                  <span className="font-bold text-foreground-muted block">Operational Hubs</span>
                  <span className="text-primary font-medium">
                    {reviewTarget.preferredServiceAreas?.join(", ") || "Kolkata Region"}
                  </span>
                </div>
              </div>

              {/* 2. KYC Documents Section */}
              <div className="space-y-3">
                <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                  <Lock className="h-4 w-4 text-accent" /> Submitted KYC Credentials & Documents
                </h3>

                {(!reviewTarget.documents || reviewTarget.documents.length === 0) ? (
                  <p className="text-foreground-muted italic">No documents uploaded yet.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {reviewTarget.documents.map((doc) => (
                      <div
                        key={doc.id || doc.documentType}
                        className="p-3.5 rounded-xl border border-border bg-background space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-primary block">
                            {doc.documentType.replace("_", " ")}
                          </span>
                          <Badge
                            variant="outline"
                            className={`text-[10px] font-mono font-bold ${
                              doc.status === "APPROVED"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                                : doc.status === "REJECTED"
                                ? "bg-rose-50 text-rose-700 border-rose-300"
                                : doc.status === "REPLACEMENT_REQUIRED"
                                ? "bg-amber-50 text-amber-700 border-amber-300"
                                : "bg-muted text-foreground-secondary border-border"
                            }`}
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <p className="font-mono text-[11px] text-foreground-secondary">
                          Masked ID: {doc.documentNumberMasked}
                        </p>
                        <p className="text-[10px] text-foreground-muted">
                          File: {doc.fileName} ({Math.round(doc.fileSize / 1024)} KB)
                        </p>

                        {doc.rejectionReason && (
                          <p className="text-[11px] text-rose-700 bg-rose-50 p-2 rounded-lg border border-rose-200">
                            Reason: {doc.rejectionReason}
                          </p>
                        )}

                        {/* Signed URL Preview & Actions */}
                        <div className="pt-1.5 flex flex-wrap items-center gap-1.5 border-t border-border">
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            disabled={viewingDocId === (doc.id || doc.documentType)}
                            onClick={() => handleViewDocument(doc.storagePath, doc.id || doc.documentType)}
                            className="h-7 text-[10px] font-bold gap-1"
                          >
                            {viewingDocId === (doc.id || doc.documentType) ? (
                              <RefreshCw className="h-3 w-3 animate-spin" />
                            ) : (
                              <Eye className="h-3 w-3 text-accent" />
                            )}
                            View Document (Signed URL)
                          </Button>

                          <div className="flex items-center gap-1 ml-auto">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewDoc(doc.id, "APPROVED")}
                              className="h-7 px-2 text-[10px] text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                              title="Approve Document"
                            >
                              <Check className="h-3 w-3 mr-0.5" /> Approve
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewDoc(doc.id, "REPLACEMENT_REQUIRED")}
                              className="h-7 px-2 text-[10px] text-amber-600 hover:text-amber-700 hover:bg-amber-50"
                              title="Request Replacement"
                            >
                              Replace
                            </Button>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => handleReviewDoc(doc.id, "REJECTED")}
                              className="h-7 px-2 text-[10px] text-rose-600 hover:text-rose-700 hover:bg-rose-50"
                              title="Reject Document"
                            >
                              <X className="h-3 w-3 mr-0.5" /> Reject
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Review History Audit Logs */}
              {reviewLogs.length > 0 && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <h3 className="font-bold text-sm text-primary flex items-center gap-1.5">
                    <History className="h-4 w-4 text-foreground-secondary" /> Administrative Action History
                  </h3>
                  <div className="space-y-1.5">
                    {reviewLogs.map((log) => (
                      <div key={log.id} className="p-2.5 rounded-lg border border-border bg-muted/30 text-[11px]">
                        <div className="flex justify-between font-semibold">
                          <span className="capitalize">{log.action.replace("_", " ")} by {log.adminName || "Admin"}</span>
                          <span className="text-foreground-muted">{log.createdAt.slice(0, 16).replace("T", " ")}</span>
                        </div>
                        {log.reason && <p className="text-foreground-secondary mt-0.5">Note: {log.reason}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action Form Inputs */}
              {actionType && (
                <div className="p-4 rounded-xl border border-accent/40 bg-accent/5 space-y-3">
                  <h4 className="font-bold text-primary">
                    Action: {actionType === "APPROVE" ? "Approve Application" : actionType === "REJECT" ? "Reject Application" : actionType === "CORRECTION" ? "Request Correction" : "Suspend Professional"}
                  </h4>

                  <Input
                    type="text"
                    placeholder={
                      actionType === "APPROVE"
                        ? "Optional approval remarks or compliance notes..."
                        : "Mandatory justification or correction instructions..."
                    }
                    value={actionReason}
                    onChange={(e) => setActionReason(e.target.value)}
                  />

                  {errorMessage && (
                    <p className="text-xs text-rose-600 font-semibold">{errorMessage}</p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setActionType(null)}
                      disabled={isProcessing}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant={actionType === "APPROVE" ? "accent" : "destructive"}
                      size="sm"
                      onClick={handleExecuteAction}
                      disabled={isProcessing}
                    >
                      {isProcessing ? "Processing..." : "Confirm Decision"}
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Modal Actions Footer */}
            <div className="p-4 border-t border-border bg-muted/20 flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" size="sm" onClick={() => setReviewTarget(null)}>
                Close
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-amber-700 border-amber-300 hover:bg-amber-50"
                  onClick={() => {
                    setActionType("CORRECTION");
                    setActionReason("");
                  }}
                >
                  Request Correction
                </Button>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    setActionType("REJECT");
                    setActionReason("");
                  }}
                >
                  Reject
                </Button>

                <Button
                  variant="accent"
                  size="sm"
                  className="font-bold"
                  onClick={() => {
                    setActionType("APPROVE");
                    setActionReason("");
                  }}
                >
                  Approve Application
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
