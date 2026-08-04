import { useState } from "react";
import { MessageSquare, Phone, Mail, ChevronDown, Send, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { HOMEPAGE_FAQS, APP_CONFIG } from "@/constants/services";

export default function HelpCenter() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [ticketSubject, setTicketSubject] = useState("");
  const [ticketDescription, setTicketDescription] = useState("");
  const [submittedTicket, setSubmittedTicket] = useState(false);

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (ticketSubject && ticketDescription) {
      setSubmittedTicket(true);
      setTicketSubject("");
      setTicketDescription("");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">24/7 Help Center & Support</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Need assistance with your booking? We are here to help 24/7.
        </p>
      </div>

      {/* QUICK CONTACT CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 text-center space-y-2 border border-border">
          <Phone className="mx-auto h-6 w-6 text-accent" />
          <h4 className="font-heading text-xs font-bold text-primary">Toll-Free Helpline</h4>
          <p className="text-[11px] text-foreground-secondary">{APP_CONFIG.supportPhone}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(`tel:${APP_CONFIG.supportPhone}`)}>
            Call Now
          </Button>
        </Card>

        <Card className="p-5 text-center space-y-2 border border-border">
          <MessageSquare className="mx-auto h-6 w-6 text-accent" />
          <h4 className="font-heading text-xs font-bold text-primary">Live Chat Support</h4>
          <p className="text-[11px] text-foreground-secondary">Instant agent response</p>
          <Button variant="accent" size="sm" onClick={() => alert("Live Chat window opened!")}>
            Start Chat
          </Button>
        </Card>

        <Card className="p-5 text-center space-y-2 border border-border">
          <Mail className="mx-auto h-6 w-6 text-accent" />
          <h4 className="font-heading text-xs font-bold text-primary">Email Support</h4>
          <p className="text-[11px] text-foreground-secondary">{APP_CONFIG.supportEmail}</p>
          <Button variant="outline" size="sm" onClick={() => window.open(`mailto:${APP_CONFIG.supportEmail}`)}>
            Send Email
          </Button>
        </Card>
      </div>

      {/* FAQ ACCORDION */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Frequently Asked Questions
        </h3>

        <div className="space-y-2">
          {HOMEPAGE_FAQS.map((faq, idx) => {
            const isOpen = openFaq === idx;

            return (
              <div key={idx} className="rounded-xl border border-border bg-surface overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left font-heading text-xs sm:text-sm font-semibold text-primary hover:text-accent cursor-pointer"
                >
                  <span>{faq.question}</span>
                  <ChevronDown className={`h-4 w-4 transition-transform shrink-0 ml-2 ${isOpen ? "rotate-180 text-accent" : ""}`} />
                </button>

                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-foreground-secondary leading-relaxed border-t border-border/40 pt-2">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* SUBMIT SUPPORT TICKET */}
      <Card className="p-6 border border-border space-y-4">
        <h3 className="font-heading text-base font-bold text-primary pb-2 border-b border-border">
          Submit a Support Ticket
        </h3>

        {submittedTicket ? (
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-semibold">
            🎉 Ticket #TKT-9041 submitted successfully! Our support team will call you within 15 minutes.
          </div>
        ) : (
          <form onSubmit={handleSubmitTicket} className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Subject / Issue Summary</label>
              <Input
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                placeholder="e.g. Need to change arrival time for booking #HEF-894102"
                required
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground-secondary mb-1 block">Detailed Description</label>
              <textarea
                value={ticketDescription}
                onChange={(e) => setTicketDescription(e.target.value)}
                rows={3}
                placeholder="Please describe your issue in detail..."
                className="w-full rounded-xl border border-border bg-background p-3 text-xs text-primary focus:outline-hidden focus:ring-2 focus:ring-accent"
                required
              />
            </div>

            <Button variant="accent" size="sm" type="submit" leftIcon={<Send className="h-4 w-4" />}>
              Submit Ticket
            </Button>
          </form>
        )}
      </Card>
    </div>
  );
}
