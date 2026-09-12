import { Headphones, Phone, AlertTriangle, ShieldCheck, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CONTACT_INFO } from "@/config";

export default function TechnicianSupport() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Technician Partner Support</h1>
        <p className="text-sm text-foreground-secondary">
          Dedicated emergency dispatch and field support desk for active on-site issues.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-2xl border-2 border-error/30 bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-error">
            <AlertTriangle className="h-6 w-6" />
            <h3 className="font-bold text-lg">On-Site Emergency Helpdesk</h3>
          </div>
          <p className="text-sm text-foreground-secondary">
            For critical customer disputes, power hazards, or on-site medical emergencies during service execution.
          </p>
          <Button variant="destructive" className="w-full" asChild>
            <a href={`tel:${CONTACT_INFO.emergencyHelpdesk}`}>
              Call Emergency SOS ({CONTACT_INFO.emergencyHelpdesk})
            </a>
          </Button>
        </div>

        <div className="rounded-2xl border border-border bg-surface p-6 space-y-4 shadow-sm">
          <div className="flex items-center gap-3 text-accent">
            <Headphones className="h-6 w-6" />
            <h3 className="font-bold text-lg text-primary">Settlement & App Support</h3>
          </div>
          <p className="text-sm text-foreground-secondary">
            For payout queries, job cancellation disputes, or tool inventory replacement claims.
          </p>
          <Button variant="outline" className="w-full" asChild>
            <a href={`tel:${CONTACT_INFO.phone}`}>
              Call Dispatch Hub ({CONTACT_INFO.phone})
            </a>
          </Button>
        </div>
      </div>
    </div>
  );
}
