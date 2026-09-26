import { useState, useEffect } from "react";
import { MessageSquare, Phone, Mail, ChevronDown, Send, HelpCircle, CheckCircle2, LifeBuoy, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HOMEPAGE_FAQS, APP_CONFIG } from "@/constants/services";
import { dbRepository } from "@/services/db/repository";
import { formatDateTime } from "@/lib/date";
import { TurnstileWidget } from "@/components/shared/TurnstileWidget";
import { turnstileService } from "@/services/turnstile/turnstileService";

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [subject, setSubject] = useState("");
  const [category, setCategory] = useState("Service Quality & Re-work");
  const [description, setDescription] = useState("");
  const [bookingNumber, setBookingNumber] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);

  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileError, setTurnstileError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadTickets = () => {
    setTickets(dbRepository.getSupportTickets());
  };

  useEffect(() => {
    loadTickets();
  }, []);

  const handleSubmitTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject || !description) return;

    setTurnstileError(null);
    setIsSubmitting(true);

    try {
      const verification = await turnstileService.verifyToken(
        turnstileToken,
        "support_ticket"
      );

      if (!verification.success) {
        setTurnstileError(
          verification.error ||
            "Please complete the security challenge before submitting a ticket."
        );
        return;
      }

      const t = dbRepository.createSupportTicket({
        subject,
        category,
        description,
        bookingNumber: bookingNumber || undefined,
      });

      loadTickets();
      setSubject("");
      setDescription("");
      setBookingNumber("");
      setNotice(
        `Ticket #${t.ticketNumber} created successfully! Our senior support engineer will investigate and respond within 2 hours.`
      );
      setTimeout(() => setNotice(null), 8000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">24/7 Help Center & Customer Support</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Assistance with service dispatches, refunds, re-work warranty claims, and technician resolution
        </p>
      </div>

      {notice && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-800 flex items-center justify-between gap-3 text-xs font-semibold animate-in fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0" />
            <span>{notice}</span>
          </div>
          <button onClick={() => setNotice(null)} className="font-bold px-2 py-0.5">
            ✕
          </button>
        </div>
      )}

      {/* QUICK CONTACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center space-y-2 border border-border bg-surface">
          <Phone className="mx-auto h-6 w-6 text-accent" />
          <h4 className="font-heading text-xs font-bold text-primary">Toll-Free Helpline</h4>
          <p className="text-[11px] text-foreground-secondary font-mono font-medium">{APP_CONFIG.supportPhone}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(`tel:${APP_CONFIG.supportPhone}`)}>
            Call Now
          </Button>
        </Card>

        <Card className="p-5 text-center space-y-2 border border-border bg-surface">
          <Mail className="mx-auto h-6 w-6 text-accent" />
          <h4 className="font-heading text-xs font-bold text-primary">Email Support Desk</h4>
          <p className="text-[11px] text-foreground-secondary">{APP_CONFIG.supportEmail}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${APP_CONFIG.supportEmail}`)}>
            Send Email
          </Button>
        </Card>

        <Card className="p-5 text-center space-y-2 border border-border bg-surface">
          <LifeBuoy className="mx-auto h-6 w-6 text-accent" />
          <h4 className="font-heading text-xs font-bold text-primary">Warranty Claims</h4>
          <p className="text-[11px] text-foreground-secondary">30-Day Re-work Guarantee</p>
          <Button variant="accent" size="sm" onClick={() => window.scrollTo({ top: 400, behavior: "smooth" })} className="font-bold">
            Raise Ticket
          </Button>
        </Card>
      </div>

      {/* SUBMIT SUPPORT TICKET */}
      <Card className="p-6 border border-border bg-surface space-y-4 shadow-sm">
        <div className="flex items-center gap-2 pb-2 border-b border-border">
          <MessageSquare className="h-5 w-5 text-accent" />
          <h3 className="font-heading text-base font-bold text-primary">
            Create Official Support Incident Ticket
          </h3>
        </div>

        <form onSubmit={handleSubmitTicket} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                Issue Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-xl border border-border p-2.5 bg-background text-primary text-xs"
              >
                <option value="Service Quality & Re-work">Service Quality & Re-work</option>
                <option value="Billing & Overcharge Inquiry">Billing & Overcharge Inquiry</option>
                <option value="Technician Delayed or No-Show">Technician Delayed or No-Show</option>
                <option value="Cancellation & Refund">Cancellation & Refund</option>
                <option value="App or Account Assistance">App or Account Assistance</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
                Booking Reference (Optional)
              </label>
              <Input
                value={bookingNumber}
                onChange={(e) => setBookingNumber(e.target.value)}
                placeholder="e.g. HEF-2026-9A82B1C3"
                className="font-mono uppercase"
              />
            </div>
          </div>

          <div>
            <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
              Subject Summary
            </label>
            <Input
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Brief summary of the issue..."
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-foreground-secondary block mb-1">
              Detailed Description
            </label>
            <textarea
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what occurred, any damages, or specific assistance required..."
              className="w-full rounded-xl border border-border p-3 bg-background text-primary text-xs"
              required
            />
          </div>

          <TurnstileWidget
            action="support_ticket"
            onSuccess={(token) => {
              setTurnstileToken(token);
              setTurnstileError(null);
            }}
            onExpired={() => setTurnstileToken(null)}
            className="py-1"
          />

          {turnstileError && (
            <p className="text-xs text-rose-500 font-medium text-center bg-rose-50 dark:bg-rose-950/30 p-2 rounded-lg border border-rose-200 dark:border-rose-900">
              {turnstileError}
            </p>
          )}

          <div className="flex justify-end pt-2 border-t border-border">
            <Button
              variant="accent"
              type="submit"
              size="default"
              disabled={isSubmitting}
              className="font-bold shadow-xs"
            >
              {isSubmitting ? "Verifying..." : "Submit Support Ticket"}
            </Button>
          </div>
        </form>
      </Card>

      {/* RECENT TICKETS LIST */}
      {tickets.length > 0 && (
        <Card className="p-6 border border-border bg-surface space-y-4">
          <h3 className="font-heading text-base font-bold text-primary border-b border-border pb-2">
            Your Active Support Tickets
          </h3>
          <div className="space-y-3">
            {tickets.map((t) => (
              <div key={t.id} className="p-4 rounded-xl border border-border bg-background flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-accent">{t.ticketNumber}</span>
                    <Badge variant="secondary" className="text-[9px] bg-blue-50 text-blue-700 font-bold">
                      {t.status}
                    </Badge>
                  </div>
                  <h4 className="font-bold text-primary text-xs mt-1">{t.subject}</h4>
                  <p className="text-[11px] text-foreground-muted">Category: {t.category} • Created: {formatDateTime(t.createdAt)}</p>
                </div>
                <Badge variant="outline" className="text-[10px] self-start sm:self-center">
                  Priority: NORMAL
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* FAQ ACCORDION */}
      <Card className="p-6 border border-border bg-surface space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border flex items-center gap-2">
          <HelpCircle className="h-5 w-5 text-accent" /> Frequently Answered Questions
        </h3>

        <div className="divide-y divide-border">
          {HOMEPAGE_FAQS.map((faq, idx) => (
            <div key={idx} className="py-3.5">
              <button
                type="button"
                onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                className="flex w-full items-center justify-between text-left text-xs font-bold text-primary hover:text-accent transition-colors cursor-pointer"
              >
                <span>{faq.question}</span>
                <ChevronDown
                  className={`h-4 w-4 shrink-0 transition-transform ${
                    openFaq === idx ? "rotate-180 text-accent" : "text-foreground-muted"
                  }`}
                />
              </button>
              {openFaq === idx && (
                <p className="mt-2 text-xs text-foreground-secondary leading-relaxed animate-in fade-in">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
