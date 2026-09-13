import type { GeneratedTimeSlot } from "@/types/marketplace.types";
import { parseDate } from "@/lib/date";

interface SlotTemplate {
  slotId: string;
  startHour: number;
  endHour: number;
  label: string;
}

const DAILY_SLOT_TEMPLATES: SlotTemplate[] = [
  { slotId: "s-09-11", startHour: 9, endHour: 11, label: "09:00 AM - 11:00 AM" },
  { slotId: "s-11-13", startHour: 11, endHour: 13, label: "11:00 AM - 01:00 PM" },
  { slotId: "s-13-15", startHour: 13, endHour: 15, label: "01:00 PM - 03:00 PM" },
  { slotId: "s-15-17", startHour: 15, endHour: 17, label: "03:00 PM - 05:00 PM" },
  { slotId: "s-17-19", startHour: 17, endHour: 19, label: "05:00 PM - 07:00 PM" },
  { slotId: "s-19-21", startHour: 19, endHour: 21, label: "07:00 PM - 09:00 PM" },
];

export const slotEngine = {
  /**
   * Generates valid time slots for a given date in Asia/Kolkata timezone.
   * If today, past slots are filtered out.
   */
  generateSlotsForDate(dateInput: Date | string): GeneratedTimeSlot[] {
    const d = parseDate(dateInput);
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const currentHour = now.getHours();
    const dateIso = d.toISOString().split("T")[0];

    return DAILY_SLOT_TEMPLATES.map((tmpl) => {
      let isAvailable = true;
      let capacityScore = 8; // Max concurrent jobs capacity per slot

      if (isToday) {
        // Need at least 90 minutes lead time for standard bookings
        if (tmpl.startHour <= currentHour + 1) {
          isAvailable = false;
          capacityScore = 0;
        }
      }

      return {
        slotId: `${dateIso}_${tmpl.slotId}`,
        dateIso,
        timeRangeLabel: tmpl.label,
        startHour: tmpl.startHour,
        endHour: tmpl.endHour,
        isAvailable,
        capacityScore,
      };
    });
  },

  /**
   * Evaluates if emergency slot (within 120 minutes) is available right now.
   */
  getEmergencySlot(): GeneratedTimeSlot | null {
    const now = new Date();
    const hour = now.getHours();

    // Emergency services operate between 08:00 AM and 09:00 PM
    if (hour < 8 || hour >= 20) {
      return null;
    }

    const endH = hour + 2;
    const formatH = (h: number) => {
      const ampm = h >= 12 ? "PM" : "AM";
      const h12 = h % 12 || 12;
      return `${String(h12).padStart(2, "0")}:00 ${ampm}`;
    };

    return {
      slotId: `emergency_${Date.now()}`,
      dateIso: now.toISOString().split("T")[0],
      timeRangeLabel: `Within 2 Hours (${formatH(hour)} - ${formatH(endH)})`,
      startHour: hour,
      endHour: endH,
      isAvailable: true,
      capacityScore: 3,
      isEmergencySlot: true,
    };
  },
};
