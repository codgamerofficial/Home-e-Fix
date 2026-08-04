import { useState } from "react";
import { Clock, Calendar, CheckCircle2, MapPin, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Attendance() {
  const [isClockedIn, setIsClockedIn] = useState(true);
  const [clockInTime, setClockInTime] = useState("09:00 AM Today");

  const handleClockToggle = () => {
    if (isClockedIn) {
      setIsClockedIn(false);
      alert("Clocked Out for the day! Total shift time: 7 hours 45 mins.");
    } else {
      setIsClockedIn(true);
      setClockInTime(new Date().toLocaleTimeString());
      alert("Clocked In successfully with GPS location verified!");
    }
  };

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="font-heading text-2xl font-extrabold text-primary">Attendance & Shift Logs</h1>
        <p className="text-xs text-foreground-secondary mt-1">
          Daily clock-in verification, shift duration logging, and leave requests
        </p>
      </div>

      {/* CLOCK IN / CLOCK OUT BANNER */}
      <Card className="p-6 border border-border bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className={`h-12 w-12 rounded-full flex items-center justify-center text-white font-bold ${
            isClockedIn ? "bg-emerald-600 shadow-md" : "bg-slate-400"
          }`}>
            <Clock className="h-6 w-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-heading text-base font-bold text-primary">
                {isClockedIn ? "Shift Active (Clocked In)" : "Shift Ended (Clocked Out)"}
              </h3>
              <Badge variant={isClockedIn ? "secondary" : "outline"} className={isClockedIn ? "text-emerald-600 bg-emerald-50" : ""}>
                {isClockedIn ? "On Duty" : "Off Duty"}
              </Badge>
            </div>
            <p className="text-xs text-foreground-secondary mt-0.5">
              Clock-in time: {clockInTime} • GPS Location: Hitech City Hub
            </p>
          </div>
        </div>

        <Button
          variant={isClockedIn ? "outline" : "accent"}
          size="default"
          onClick={handleClockToggle}
          className="font-bold shrink-0"
        >
          {isClockedIn ? "Clock Out for Day" : "Clock In Now"}
        </Button>
      </Card>

      {/* MONTHLY SUMMARY STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Days Present</div>
          <div className="font-heading text-2xl font-bold text-emerald-600">22 Days</div>
          <div className="text-[10px] text-foreground-muted">August 2026</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Total Hours Logged</div>
          <div className="font-heading text-2xl font-bold text-primary">176 Hours</div>
          <div className="text-[10px] text-foreground-muted">Avg 8.0h / day</div>
        </Card>

        <Card className="p-5 border border-border text-center space-y-1">
          <div className="text-xs text-foreground-secondary font-semibold">Leaves Remaining</div>
          <div className="font-heading text-2xl font-bold text-accent">3 Days</div>
          <div className="text-[10px] text-foreground-muted">Paid Casual Leaves</div>
        </Card>
      </div>
    </div>
  );
}
