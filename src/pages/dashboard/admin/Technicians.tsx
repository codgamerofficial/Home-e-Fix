import { useState } from "react";
import { ShieldCheck, ShieldAlert, Check, X, Star, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MOCK_TECHS = [
  { id: "t-1", name: "Suresh Reddy", category: "AC Repair", rating: 4.9, jobs: 620, status: "verified", aadhaar: "VERIFIED_9041", policeClearance: "CLEARED" },
  { id: "t-2", name: "Mahesh Kumar", category: "Plumbing", rating: 4.8, jobs: 410, status: "verified", aadhaar: "VERIFIED_1204", policeClearance: "CLEARED" },
  { id: "t-3", name: "Ramesh Sharma", category: "Electrical", rating: 0, jobs: 0, status: "pending_verification", aadhaar: "PENDING_REVIEW", policeClearance: "SUBMITTED" },
];

export default function Technicians() {
  const [techs, setTechs] = useState(MOCK_TECHS);

  const handleApprove = (id: string) => {
    setTechs((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: "verified" } : t))
    );
    alert("Technician background documents verified & account approved!");
  };

  const handleReject = (id: string) => {
    setTechs((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Technician Operations & Approvals</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Verify tradesmen background identity documents, police certificates, and onboard pros
        </p>
      </div>

      <Card className="border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-surface border-b border-border text-foreground-secondary font-heading font-semibold">
              <tr>
                <th className="p-4">Technician Name</th>
                <th className="p-4">Trade Specialty</th>
                <th className="p-4">Rating / Jobs</th>
                <th className="p-4">Aadhaar & Police Clearance</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Verification Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {techs.map((tech) => (
                <tr key={tech.id} className="hover:bg-surface/50 transition-colors">
                  <td className="p-4 font-bold text-primary">{tech.name}</td>
                  <td className="p-4 font-semibold text-foreground-secondary">{tech.category}</td>
                  <td className="p-4">
                    <div className="flex items-center gap-1 text-yellow-500 font-bold">
                      <Star className="h-3.5 w-3.5 fill-yellow-400" />
                      <span>{tech.rating > 0 ? tech.rating : "New"}</span>
                      <span className="text-[11px] text-foreground-muted">({tech.jobs} Jobs)</span>
                    </div>
                  </td>
                  <td className="p-4 text-foreground-secondary">
                    <div>Aadhaar: <span className="font-bold text-primary">{tech.aadhaar}</span></div>
                    <div className="text-[10px] text-foreground-muted">Police Clearance: {tech.policeClearance}</div>
                  </td>
                  <td className="p-4">
                    <Badge variant={tech.status === "verified" ? "secondary" : "accent"} className={tech.status === "verified" ? "text-emerald-600 bg-emerald-50" : ""}>
                      {tech.status === "verified" ? "✓ Verified Pro" : "⏳ Pending Approval"}
                    </Badge>
                  </td>
                  <td className="p-4 text-right">
                    {tech.status === "pending_verification" ? (
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => handleReject(tech.id)} className="text-rose-600 border-rose-200">
                          Reject
                        </Button>
                        <Button variant="accent" size="sm" onClick={() => handleApprove(tech.id)} className="font-bold">
                          Approve Pro
                        </Button>
                      </div>
                    ) : (
                      <span className="text-[11px] text-emerald-600 font-bold">Approved</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
