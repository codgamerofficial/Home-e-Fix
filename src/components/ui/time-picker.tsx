import { Clock, Sun, Moon, Sunset } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimeSlotOption {
  id: string;
  time: string; // e.g. "09:00 AM"
  period: "morning" | "afternoon" | "evening";
  available: boolean;
}

export interface TimePickerProps {
  slots?: TimeSlotOption[];
  selectedSlotId?: string;
  onSelectSlot?: (slot: TimeSlotOption) => void;
  label?: string;
  error?: string;
  className?: string;
}

const DEFAULT_SLOTS: TimeSlotOption[] = [
  { id: "s1", time: "08:00 AM - 09:00 AM", period: "morning", available: true },
  { id: "s2", time: "09:00 AM - 10:00 AM", period: "morning", available: true },
  { id: "s3", time: "10:00 AM - 11:00 AM", period: "morning", available: true },
  { id: "s4", time: "11:00 AM - 12:00 PM", period: "morning", available: false },
  { id: "s5", time: "12:00 PM - 01:00 PM", period: "afternoon", available: true },
  { id: "s6", time: "02:00 PM - 03:00 PM", period: "afternoon", available: true },
  { id: "s7", time: "03:00 PM - 04:00 PM", period: "afternoon", available: true },
  { id: "s8", time: "04:00 PM - 05:00 PM", period: "afternoon", available: true },
  { id: "s9", time: "05:00 PM - 06:00 PM", period: "evening", available: true },
  { id: "s10", time: "06:00 PM - 07:00 PM", period: "evening", available: true },
  { id: "s11", time: "07:00 PM - 08:00 PM", period: "evening", available: true },
];

export function TimePicker({
  slots = DEFAULT_SLOTS,
  selectedSlotId,
  onSelectSlot,
  label = "Select Time Slot",
  error,
  className,
}: TimePickerProps) {
  const periods = [
    { key: "morning", label: "Morning", icon: Sun },
    { key: "afternoon", label: "Afternoon", icon: Sunset },
    { key: "evening", label: "Evening", icon: Moon },
  ] as const;

  return (
    <div className={cn("space-y-4", className)}>
      {label && (
        <div className="flex items-center justify-between">
          <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
            <Clock className="h-4 w-4 text-accent" />
            {label}
          </label>
        </div>
      )}

      <div className="space-y-4">
        {periods.map((period) => {
          const Icon = period.icon;
          const periodSlots = slots.filter((s) => s.period === period.key);

          if (periodSlots.length === 0) return null;

          return (
            <div key={period.key} className="space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-foreground-secondary">
                <Icon className="h-3.5 w-3.5 text-accent" />
                {period.label}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                {periodSlots.map((slot) => {
                  const isSelected = slot.id === selectedSlotId;

                  return (
                    <button
                      key={slot.id}
                      type="button"
                      disabled={!slot.available}
                      onClick={() => onSelectSlot?.(slot)}
                      className={cn(
                        "flex items-center justify-center rounded-xl border px-3 py-2.5 text-xs font-medium",
                        "transition-all duration-200 cursor-pointer shadow-xs",
                        isSelected
                          ? "border-accent bg-accent text-white font-semibold shadow-glow scale-[1.02]"
                          : slot.available
                          ? "border-border bg-surface text-foreground hover:border-accent/50 hover:bg-accent/5"
                          : "border-border/40 bg-muted/40 text-foreground-muted line-through opacity-50 cursor-not-allowed"
                      )}
                    >
                      {slot.time}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {error && <p className="text-xs text-error">{error}</p>}
    </div>
  );
}
