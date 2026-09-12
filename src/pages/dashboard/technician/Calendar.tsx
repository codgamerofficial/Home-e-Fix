import { useState } from "react";
import { Calendar as CalendarIcon, Clock, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState("Today, Sep 12");

  const scheduleSlots = [
    { time: "09:00 AM - 10:30 AM", status: "COMPLETED", client: "Rajesh Roy", service: "Switch Board Replacement" },
    { time: "11:30 AM - 01:00 PM", status: "COMPLETED", client: "Pooja Das", service: "Tap Leakage & Pipe Fix" },
    { time: "02:30 PM - 04:00 PM", status: "UPCOMING", client: "Anirban Mukherjee", service: "Split AC Jet Deep Cleaning" },
    { time: "05:00 PM - 06:30 PM", status: "AVAILABLE", client: "Free Slot", service: "Open for Dispatch" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-primary">Service Calendar</h1>
          <p className="text-sm text-foreground-secondary">
            Manage your daily appointment slots and planned dispatch routes.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-bold text-primary px-3 py-1.5 rounded-lg border border-border bg-surface">
            {selectedDate}
          </span>
          <Button variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Slots Timeline */}
      <div className="space-y-3">
        {scheduleSlots.map((slot) => (
          <div
            key={slot.time}
            className="rounded-2xl border border-border bg-surface p-5 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div className="flex items-start gap-4">
              <div className="h-10 w-10 rounded-xl bg-accent/10 text-accent flex items-center justify-center shrink-0">
                <Clock className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <span className="text-xs font-mono text-foreground-muted block">{slot.time}</span>
                <h4 className="text-sm font-bold text-primary">{slot.service}</h4>
                <p className="text-xs text-foreground-secondary">{slot.client}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span
                className={`text-xs px-2.5 py-1 rounded-full font-bold ${
                  slot.status === "COMPLETED"
                    ? "bg-success/10 text-success"
                    : slot.status === "UPCOMING"
                    ? "bg-accent/10 text-accent"
                    : "bg-muted text-foreground-muted"
                }`}
              >
                {slot.status}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
