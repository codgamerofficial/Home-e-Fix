import type { ActiveServiceWarranty } from "@/types/marketplace.types";
import { parseDate, formatDate } from "@/lib/date";

export const warrantyEngine = {
  /**
   * Create an authoritative warranty record when a booking completes.
   */
  createWarranty(
    bookingId: string,
    bookingNumber: string,
    serviceName: string,
    completedAtIso: string,
    warrantyDays: number,
    terms?: string
  ): ActiveServiceWarranty {
    const startDate = parseDate(completedAtIso);
    const endDate = new Date(startDate.getTime() + warrantyDays * 24 * 60 * 60 * 1000);

    const year = startDate.getFullYear();
    const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
    const warrantyNumber = `HEF-WRN-${year}-${randomHex}`;

    const isExpired = new Date() > endDate;

    return {
      id: `wrn_${bookingId}`,
      warrantyNumber,
      bookingId,
      bookingNumber,
      serviceName,
      startsAt: startDate.toISOString(),
      expiresAt: endDate.toISOString(),
      warrantyDays,
      terms: terms || `${warrantyDays}-day Home-e-Fix service rework protection. Free revisit for any recurring issue.`,
      status: isExpired ? "EXPIRED" : "ACTIVE",
    };
  },

  /**
   * Check if a claim can be raised for a warranty.
   */
  canRaiseClaim(warranty: ActiveServiceWarranty): { eligible: boolean; reason?: string } {
    if (warranty.status === "CLAIM_PENDING") {
      return { eligible: false, reason: "A warranty claim is already under review for this service." };
    }
    const expiresAt = new Date(warranty.expiresAt);
    if (new Date() > expiresAt) {
      return { eligible: false, reason: `Warranty expired on ${formatDate(expiresAt)}.` };
    }
    return { eligible: true };
  },
};
