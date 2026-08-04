import { useState } from "react";
import { Download, FileText, Calendar, Filter } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Reports() {
  const handleExportCsv = (reportName: string) => {
    alert(`Exporting '${reportName}' to CSV format... File download started!`);
  };

  const handleExportPdf = (reportName: string) => {
    alert(`Exporting '${reportName}' to PDF document... File download started!`);
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Reports & Data Export Center</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Generate financial, operational, and customer retention reports in CSV or PDF formats
        </p>
      </div>

      <div className="space-y-4">
        {[
          { title: "Monthly Financial Ledger Report", desc: "Detailed breakdown of gross booking revenue, technician payouts, and 20% platform commission." },
          { title: "Technician Performance & Payout Audit", desc: "Complete log of tradesmen ratings, completed jobs, distance traveled, and bank payouts." },
          { title: "Customer Retention & Acquisition Log", desc: "User sign-ups, VIP pass subscriptions, repeat booking rates, and referral performance." },
          { title: "Category-wise Service Fulfillment Report", desc: "Booking counts, average resolution times, and cancellation rates across all 15 categories." },
        ].map((report, idx) => (
          <Card key={idx} className="p-5 border border-border flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h4 className="font-heading text-sm font-bold text-primary">{report.title}</h4>
              <p className="text-xs text-foreground-secondary mt-0.5">{report.desc}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <Button variant="outline" size="sm" onClick={() => handleExportCsv(report.title)} leftIcon={<Download className="h-3.5 w-3.5" />}>
                Export CSV
              </Button>
              <Button variant="accent" size="sm" onClick={() => handleExportPdf(report.title)} leftIcon={<FileText className="h-3.5 w-3.5" />}>
                Export PDF
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
