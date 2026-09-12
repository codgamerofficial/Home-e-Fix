import { FileText, Download, Upload, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function TechnicianDocuments() {
  const legalDocs = [
    { title: "Home-e-Fix Professional Partner Agreement 2026", date: "Signed on Jan 14, 2026", size: "1.4 MB" },
    { title: "Service Level Agreement (SLA) & Safety Standard Handbook", date: "Updated Jul 2026", size: "3.2 MB" },
    { title: "GST Input Tax Credit & Commercial Invoice Guide", date: "Issued Apr 2026", size: "840 KB" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Legal & Service Documents</h1>
        <p className="text-sm text-foreground-secondary">
          Access signed agreements, service level guidelines, and compliance certifications.
        </p>
      </div>

      <div className="space-y-3">
        {legalDocs.map((doc) => (
          <div
            key={doc.title}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex items-center justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm text-primary">{doc.title}</h4>
                <p className="text-xs text-foreground-muted">{doc.date} • {doc.size}</p>
              </div>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 shrink-0">
              <Download className="h-3.5 w-3.5" /> Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
