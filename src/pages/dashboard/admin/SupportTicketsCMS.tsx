import { useState, useEffect } from "react";
import { MessageSquare, Clock, User, AlertCircle, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { dbRepository } from "@/services/db/repository";
import { formatDate } from "@/lib/date";

export default function SupportTicketsCMS() {
  const [tickets, setTickets] = useState<any[]>([]);

  useEffect(() => {
    setTickets(dbRepository.getSupportTickets());
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Customer Support Helpdesk</h1>
          <p className="text-sm text-foreground-secondary">
            Track support queries, warranty claims, and ticket lifecycles across Kolkata service hubs.
          </p>
        </div>
        <div className="text-xs text-foreground-muted font-medium">
          Active Tickets: <span className="font-bold text-primary">{tickets.length}</span>
        </div>
      </div>

      {tickets.length === 0 ? (
        <Card className="p-12 border border-border text-center space-y-3">
          <MessageSquare className="h-10 w-10 text-foreground-muted mx-auto" />
          <h3 className="font-heading text-base font-bold text-primary">No Active Support Tickets</h3>
          <p className="text-xs text-foreground-secondary max-w-sm mx-auto">
            All customer inquiries and warranty claims are currently up to date. New tickets will appear here with live priority tracking.
          </p>
        </Card>
      ) : (
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
                <p className="text-xs text-foreground-muted">Raised by: {t.customer_name || t.customer || "Homeowner"} • {t.created_at ? formatDate(t.created_at) : (t.date || "Recent")}</p>
              </div>

              <Button variant="outline" size="sm">
                Open Ticket
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
