import { useState, useEffect } from "react";
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
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { dbRepository } from "@/services/db/repository";

export default function Technicians() {
  const [techs, setTechs] = useState<any[]>([]);
  const [reviewTarget, setReviewTarget] = useState<any | null>(null);
  const [remarks, setRemarks] = useState("");
  const [notificationMsg, setNotificationMsg] = useState("");

  const loadTechs = () => {
    setTechs(dbRepository.getProfessionals());
  };

  useEffect(() => {
    loadTechs();
  }, []);

  const handleApprove = (id: string) => {
    dbRepository.updateKycStatus(id, "APPROVED", remarks || "Document verification approved by compliance officer.");
    loadTechs();
    setReviewTarget(null);
    setRemarks("");
    setNotificationMsg("Technician background verified & approved for service dispatches.");
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  const handleReject = (id: string) => {
    dbRepository.updateKycStatus(id, "REJECTED", remarks || "Identity documents unreadable or rejected.");
    loadTechs();
    setReviewTarget(null);
    setRemarks("");
    setNotificationMsg("Technician KYC marked as rejected. Resubmission requested.");
    setTimeout(() => setNotificationMsg(""), 4000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-extrabold text-primary">
            Technician Operations & Approvals
          </h1>
          <p className="text-xs text-foreground-secondary mt-1">
            Review tradesmen identity credentials, police background clearances, and manage verified badges
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={loadTechs} className="h-9 gap-1 text-xs">
          <RefreshCw className="h-3.5 w-3.5" /> Refresh List
        </Button>
      </div>

      {notificationMsg && (
        <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-xs font-bold text-emerald-800 flex items-center gap-2">
          <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          {notificationMsg}
        </div>
      )}

      <Card className="border border-border overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-foreground-secondary font-heading font-semibold">
              <tr>
                <th className="p-4">Technician Name</th>
                <th className="p-4">Trade Specialty</th>
                <th className="p-4">Rating / Jobs</th>
                <th className="p-4">Aadhaar & Police Clearance</th>
                <th className="p-4">KYC Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {techs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-foreground-muted">
                    No registered professionals found.
                  </td>
                </tr>
              ) : (
                techs.map((tech) => {
                  const isApproved = tech.kycStatus === "APPROVED";
                  const isUnderReview = tech.kycStatus === "UNDER_REVIEW" || tech.kycStatus === "PENDING_REVIEW";

                  return (
                    <tr key={tech.id} className="hover:bg-surface/50 transition-colors">
                      <td className="p-4 font-bold text-primary">
                        <div>{tech.name}</div>
                        <div className="text-[10px] text-foreground-muted font-normal">{tech.phone}</div>
                        {tech.isDevSeed && (
                          <span className="text-[9px] font-mono px-1 py-0.2 rounded border border-amber-300 text-amber-600 bg-amber-50 inline-block mt-0.5">
                            [DEV SEED]
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-semibold text-foreground-secondary">{tech.category}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-1 text-amber-500 font-bold">
                          <Star className="h-3.5 w-3.5 fill-amber-400" />
                          <span>{tech.rating > 0 ? tech.rating : "New"}</span>
                          <span className="text-[11px] text-foreground-muted">
                            ({tech.completedJobs || 0} Jobs)
                          </span>
                        </div>
                      </td>
                      <td className="p-4 text-foreground-secondary">
                        <div>
                          Aadhaar: <span className="font-bold text-primary">{tech.aadhaar || "Submitted"}</span>
                        </div>
                        <div className="text-[10px] text-foreground-muted">
                          Police Clearance: {tech.policeClearance || "Under Check"}
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant="outline"
                          className={
                            isApproved
                              ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                              : isUnderReview
                              ? "text-amber-700 bg-amber-50 border-amber-200"
                              : "text-rose-700 bg-rose-50 border-rose-200"
                          }
                        >
                          {isApproved ? "✓ Verified Pro" : isUnderReview ? "⏳ Pending Review" : "✕ Rejected"}
                        </Badge>
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-7 text-xs gap-1"
                          onClick={() => {
                            setReviewTarget(tech);
                            setRemarks("");
                          }}
                        >
                          <Eye className="h-3 w-3" /> {isApproved ? "Manage" : "Review Docs"}
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

      {/* KYC REVIEW MODAL */}
      {reviewTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md p-6 space-y-4 shadow-2xl bg-surface border border-border">
            <h3 className="font-bold text-base text-primary">
              Verify Technician: {reviewTarget.name}
            </h3>
            <p className="text-xs text-foreground-secondary">
              Review submitted credentials for {reviewTarget.category} trade onboarding.
            </p>

            <div className="space-y-2 text-xs bg-muted/40 p-3 rounded-xl border border-border">
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Aadhaar Card:</span>
                <span className="font-mono font-bold text-primary">{reviewTarget.aadhaar || "VERIFIED_UID"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Police Clearance:</span>
                <span className="font-mono font-bold text-primary">{reviewTarget.policeClearance || "SUBMITTED"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-foreground-secondary">Bank Settlement:</span>
                <span className="font-mono font-bold text-primary">HDFC Bank (Verified IFSC)</span>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary block mb-1">
                Compliance Review Remarks
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Add audit notes regarding document clarity or background check status"
                className="w-full text-xs p-2 rounded-lg border border-border bg-surface"
              />
            </div>

            <div className="flex justify-between gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setReviewTarget(null)}
              >
                Cancel
              </Button>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-rose-600 border-rose-200 hover:bg-rose-50"
                  onClick={() => handleReject(reviewTarget.id)}
                >
                  Reject
                </Button>
                <Button
                  variant="accent"
                  size="sm"
                  className="font-bold"
                  onClick={() => handleApprove(reviewTarget.id)}
                >
                  Approve Pro
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
