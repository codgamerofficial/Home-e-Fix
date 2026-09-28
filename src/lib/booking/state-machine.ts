import type { BookingStatus } from "@/types/database.types";

/**
 * Strict transition graph for Home-e-Fix Bookings.
 * Key: Current Status, Value: Array of allowable next Statuses.
 */
export const BOOKING_TRANSITIONS: Record<BookingStatus, BookingStatus[]> = {
  DRAFT: ["PENDING_PAYMENT", "CANCELLED"],
  PENDING_PAYMENT: ["PAYMENT_PROCESSING", "PAYMENT_AUTHORIZED", "PAYMENT_FAILED", "CONFIRMED", "CANCELLED"],
  PAYMENT_AUTHORIZED: ["CONFIRMED", "PAYMENT_FAILED", "CANCELLED"],
  PAYMENT_PROCESSING: ["CONFIRMED", "PAYMENT_FAILED"],
  PAYMENT_FAILED: ["PENDING_PAYMENT", "CANCELLED"],
  CONFIRMED: ["MATCHING", "SEARCHING_PROFESSIONAL", "ASSIGNMENT_PENDING", "CANCELLED"],
  MATCHING: ["ASSIGNMENT_PENDING", "SEARCHING_PROFESSIONAL", "PROFESSIONAL_ASSIGNED", "CANCELLED"],
  SEARCHING_PROFESSIONAL: ["PROFESSIONAL_ASSIGNED", "CANCELLED", "NO_SHOW"],
  ASSIGNMENT_PENDING: ["PROFESSIONAL_ASSIGNED", "MATCHING", "CANCELLED"],
  PROFESSIONAL_ASSIGNED: ["PROFESSIONAL_ACCEPTED", "ASSIGNMENT_PENDING", "CANCELLED"],
  PROFESSIONAL_ACCEPTED: ["PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_EN_ROUTE", "ASSIGNMENT_PENDING", "CANCELLED"],
  PROFESSIONAL_ON_THE_WAY: ["PROFESSIONAL_ARRIVED", "NO_SHOW", "CANCELLED"],
  PROFESSIONAL_EN_ROUTE: ["PROFESSIONAL_ARRIVED", "NO_SHOW", "CANCELLED"],
  PROFESSIONAL_ARRIVED: ["SERVICE_STARTED", "CANCELLED"],
  SERVICE_STARTED: [
    "AWAITING_CUSTOMER_APPROVAL",
    "ADDITIONAL_CHARGES_PENDING",
    "SERVICE_PAUSED",
    "SERVICE_COMPLETED",
    "DISPUTED",
  ],
  SERVICE_PAUSED: ["SERVICE_STARTED", "CANCELLED", "DISPUTED"],
  AWAITING_CUSTOMER_APPROVAL: [
    "ADDITIONAL_CHARGES_APPROVED",
    "SERVICE_STARTED",
    "DISPUTED",
  ],
  ADDITIONAL_CHARGES_PENDING: [
    "ADDITIONAL_CHARGES_APPROVED",
    "SERVICE_STARTED",
    "DISPUTED",
  ],
  ADDITIONAL_CHARGES_APPROVED: ["SERVICE_STARTED", "SERVICE_COMPLETED"],
  SERVICE_COMPLETED: ["CUSTOMER_CONFIRMED", "DISPUTED"],
  CUSTOMER_CONFIRMED: ["INVOICE_GENERATED"],
  INVOICE_GENERATED: ["PAYMENT_COMPLETED"],
  PAYMENT_COMPLETED: ["WARRANTY_ACTIVE", "REVIEW_PENDING", "COMPLETED"],
  WARRANTY_ACTIVE: ["REVIEW_PENDING", "COMPLETED", "DISPUTED"],
  REVIEW_PENDING: ["COMPLETED"],
  COMPLETED: ["DISPUTED"],
  NO_SHOW: ["SEARCHING_PROFESSIONAL", "CANCELLED", "REFUND_PENDING"],
  CANCELLED: ["REFUND_PENDING"],
  REFUND_PENDING: ["REFUNDED", "DISPUTED"],
  REFUNDED: [],
  DISPUTED: ["REFUND_PENDING", "COMPLETED", "CANCELLED"],
};

export class StateTransitionError extends Error {
  public fromStatus: BookingStatus;
  public toStatus: BookingStatus;

  constructor(fromStatus: BookingStatus, toStatus: BookingStatus) {
    super(
      `[Illegal State Transition]: Cannot transition booking from "${fromStatus}" to "${toStatus}". This transition is forbidden by business rules.`
    );
    this.name = "StateTransitionError";
    this.fromStatus = fromStatus;
    this.toStatus = toStatus;
  }
}

/**
 * Validates whether a requested transition is allowable according to the mathematical state machine.
 */
export function canTransition(current: BookingStatus, next: BookingStatus): boolean {
  const allowed = BOOKING_TRANSITIONS[current] || [];
  return allowed.includes(next);
}

/**
 * Asserts transition validity and throws StateTransitionError on illegal jumps.
 */
export function validateTransition(current: BookingStatus, next: BookingStatus): void {
  if (!canTransition(current, next)) {
    throw new StateTransitionError(current, next);
  }
}

/**
 * Returns permissible next statuses for a given state (e.g. for action buttons).
 */
export function getAllowedNextTransitions(current: BookingStatus): BookingStatus[] {
  return BOOKING_TRANSITIONS[current] || [];
}
