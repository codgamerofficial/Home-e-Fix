import { useState } from "react";
import { MessageSquare, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function SupportTicketsCMS() {
  const tickets = [
    {
      id: "TCK-501",
      customer: "Siddhartha Bose",
      subject: "Requesting reschedule of AC service for tomorrow morning",
      status: "OPEN",
      priority: "MEDIUM",
      date: "10 mins ago",
    },
    {
      id: "TCK-498",
      customer: "Madhumita Sen",
      subject: "Water heater leaking from connector pipe post installation",
      status: "IN_PROGRESS",
      priority: "HIGH",
      date: "1 hour ago",
    },
    {
      id: "TCK-490",
      customer: "Kunal Mitra",
      subject: "Warranty claim for false ceiling light bracket repair",
      status: "RESOLVED",
      priority: "LOW",
      date: "Yesterday",
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Customer Support Helpdesk</h1>
        <p className="text-sm text-foreground-secondary">
          Track support queries, warranty claims, and ticket lifecycles across Kolkata hubs.
        </p>
      </div>

      <div className="space-y-3">
        {tickets.map((t) => (
          <div
            key={t.id}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-primary font-mono">{t.id}</span>
                <span className={`text-[11px] px-2 py-0.5 rounded-full font-bold ${
                  t.status === "OPEN" ? "bg-accent/10 text-accent" : t.status === "IN_PROGRESS" ? "bg-warning/10 text-warning" : "bg-success/10 text-success"
                }`}>
                  {t.status}
                </span>
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                  t.priority === "HIGH" ? "bg-error/10 text-error" : "bg-muted text-foreground-muted"
                }`}>
                  {t.priority} Priority
                </span>
              </div>
              <h4 className="text-sm font-semibold text-foreground">{t.subject}</h4>
              <p className="text-xs text-foreground-muted">Raised by: {t.customer} • {t.date}</p>
            </div>

            <Button variant="outline" size="sm">
              Open Ticket
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
