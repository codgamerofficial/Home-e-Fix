/**
 * HOME-E-FIX: AUTHORITATIVE STATUS & LIFECYCLE MAPPING ENGINE
 *
 * Provides a single, authoritative mapping across:
 * - Customer UI
 * - Professional UI
 * - Admin Operations
 * - Notifications
 * - Timeline Milestones
 *
 * Eliminates cross-screen inconsistencies (e.g. "Finding professional" vs "Rajesh Kumar on the way").
 */

import type { BookingStatus, PaymentStatus } from "@/types/database.types";

export interface StatusPresentation {
  key: BookingStatus;
  badgeLabel: string;
  badgeVariant: "default" | "outline" | "secondary" | "destructive";
  customerTitle: string;
  customerDescription: string;
  proActionTitle: string;
  adminTitle: string;
  notificationMessage: string;
  isTerminal: boolean;
  canTrackLiveGps: boolean;
}

export const BOOKING_STATUS_PRESENTATION: Record<string, StatusPresentation> = {
  CONFIRMED: {
    key: "CONFIRMED",
    badgeLabel: "CONFIRMED",
    badgeVariant: "default",
    customerTitle: "Booking Confirmed",
    customerDescription: "Service request placed and locked with Home-e-Fix.",
    proActionTitle: "New Job Request Available",
    adminTitle: "Confirmed - Unassigned",
    notificationMessage: "Your booking is confirmed.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  SEARCHING_PROFESSIONAL: {
    key: "SEARCHING_PROFESSIONAL",
    badgeLabel: "SEARCHING PRO",
    badgeVariant: "outline",
    customerTitle: "Finding Your Professional",
    customerDescription: "Locating the nearest verified specialist in Kolkata.",
    proActionTitle: "Job Broadcasting to Nearby Partners",
    adminTitle: "Dispatch Searching",
    notificationMessage: "Matching your request with a verified Kolkata tradesman.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  ASSIGNMENT_PENDING: {
    key: "ASSIGNMENT_PENDING",
    badgeLabel: "ASSIGNING",
    badgeVariant: "outline",
    customerTitle: "Assigning Technician",
    customerDescription: "Connecting with certified partner in your service area.",
    proActionTitle: "Acceptance Requested",
    adminTitle: "Pending Acceptance",
    notificationMessage: "Technician assigned, awaiting confirmation.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  PROFESSIONAL_ASSIGNED: {
    key: "PROFESSIONAL_ASSIGNED",
    badgeLabel: "PRO ASSIGNED",
    badgeVariant: "default",
    customerTitle: "Professional Assigned",
    customerDescription: "Specialist assigned and reviewing job details.",
    proActionTitle: "Review & Confirm Slot",
    adminTitle: "Assigned",
    notificationMessage: "A verified professional has been assigned to your booking.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  PROFESSIONAL_ACCEPTED: {
    key: "PROFESSIONAL_ACCEPTED",
    badgeLabel: "ACCEPTED",
    badgeVariant: "default",
    customerTitle: "Professional Confirmed",
    customerDescription: "Technician confirmed schedule and is preparing tools.",
    proActionTitle: "Start Transit When Ready",
    adminTitle: "Accepted - Awaiting Transit",
    notificationMessage: "Your technician has confirmed your appointment slot.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  PROFESSIONAL_EN_ROUTE: {
    key: "PROFESSIONAL_EN_ROUTE",
    badgeLabel: "ON THE WAY",
    badgeVariant: "default",
    customerTitle: "Professional On The Way",
    customerDescription: "Technician is en route to your service address.",
    proActionTitle: "Navigating to Customer",
    adminTitle: "En Route",
    notificationMessage: "Your technician is on the way to your doorstep.",
    isTerminal: false,
    canTrackLiveGps: true,
  },
  PROFESSIONAL_ON_THE_WAY: {
    key: "PROFESSIONAL_ON_THE_WAY",
    badgeLabel: "ON THE WAY",
    badgeVariant: "default",
    customerTitle: "Professional On The Way",
    customerDescription: "Technician is en route to your service address.",
    proActionTitle: "Navigating to Customer",
    adminTitle: "En Route",
    notificationMessage: "Your technician is on the way to your doorstep.",
    isTerminal: false,
    canTrackLiveGps: true,
  },
  PROFESSIONAL_ARRIVED: {
    key: "PROFESSIONAL_ARRIVED",
    badgeLabel: "ARRIVED",
    badgeVariant: "default",
    customerTitle: "Arrived at Doorstep",
    customerDescription: "Technician is at your doorstep. Please share 4-digit start OTP.",
    proActionTitle: "Verify Start OTP",
    adminTitle: "Arrived",
    notificationMessage: "Your technician has arrived at your address.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  SERVICE_STARTED: {
    key: "SERVICE_STARTED",
    badgeLabel: "IN PROGRESS",
    badgeVariant: "default",
    customerTitle: "Service In Progress",
    customerDescription: "Work in progress under standard Home-e-Fix safety protocols.",
    proActionTitle: "Perform Service According to SOP",
    adminTitle: "Service Active",
    notificationMessage: "Service inspection and work has commenced.",
    isTerminal: false,
    canTrackLiveGps: false,
  },
  SERVICE_COMPLETED: {
    key: "SERVICE_COMPLETED",
    badgeLabel: "COMPLETED",
    badgeVariant: "default",
    customerTitle: "Service Completed",
    customerDescription: "Job completed satisfactorily. 30-Day warranty active.",
    proActionTitle: "Service Finished",
    adminTitle: "Completed",
    notificationMessage: "Service successfully completed. Digital invoice and warranty issued.",
    isTerminal: true,
    canTrackLiveGps: false,
  },
  COMPLETED: {
    key: "COMPLETED",
    badgeLabel: "COMPLETED",
    badgeVariant: "default",
    customerTitle: "Service Completed",
    customerDescription: "Job completed satisfactorily. 30-Day warranty active.",
    proActionTitle: "Service Finished",
    adminTitle: "Completed",
    notificationMessage: "Service successfully completed. Digital invoice and warranty issued.",
    isTerminal: true,
    canTrackLiveGps: false,
  },
  CANCELLED: {
    key: "CANCELLED",
    badgeLabel: "CANCELLED",
    badgeVariant: "destructive",
    customerTitle: "Booking Cancelled",
    customerDescription: "This appointment was cancelled.",
    proActionTitle: "Cancelled",
    adminTitle: "Cancelled",
    notificationMessage: "Booking was cancelled.",
    isTerminal: true,
    canTrackLiveGps: false,
  },
  REFUNDED: {
    key: "REFUNDED",
    badgeLabel: "REFUNDED",
    badgeVariant: "secondary",
    customerTitle: "Refund Processed",
    customerDescription: "Payment has been refunded to your source account / wallet.",
    proActionTitle: "Refunded",
    adminTitle: "Refunded",
    notificationMessage: "Your refund transaction has been completed.",
    isTerminal: true,
    canTrackLiveGps: false,
  },
};

export function getStatusPresentation(rawStatus: string): StatusPresentation {
  const norm = (rawStatus || "CONFIRMED").toUpperCase();
  return (
    BOOKING_STATUS_PRESENTATION[norm] || {
      key: norm as BookingStatus,
      badgeLabel: norm,
      badgeVariant: "outline",
      customerTitle: norm.replace(/_/g, " "),
      customerDescription: "Booking is in progress.",
      proActionTitle: norm,
      adminTitle: norm,
      notificationMessage: `Booking status is ${norm}`,
      isTerminal: false,
      canTrackLiveGps: false,
    }
  );
}

export interface TimelineMilestone {
  key: string;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string | null;
}

/**
 * Builds authoritative timeline milestones strictly grounded in backend event records.
 * NEVER fabricates steps or claims a professional is assigned when unassigned.
 */
export function buildAuthoritativeTimeline(
  bookingStatus: string,
  createdAt: string,
  events: Array<{ status: string; timestamp: string; label?: string }> = [],
  technicianName?: string | null,
  paymentStatus?: string,
  paymentMethod?: string
): TimelineMilestone[] {
  const norm = (bookingStatus || "CONFIRMED").toUpperCase();
  const hasTech = Boolean(technicianName && technicianName.trim());

  // Determine stage flags
  const isCancelled = norm === "CANCELLED";
  const isRefunded = norm === "REFUNDED";

  const isConfirmed = true;
  const isAssigning = !hasTech && ["CONFIRMED", "SEARCHING_PROFESSIONAL", "ASSIGNMENT_PENDING"].includes(norm);
  const isAssigned = hasTech || ["PROFESSIONAL_ASSIGNED", "PROFESSIONAL_ACCEPTED", "PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_EN_ROUTE", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(norm);
  const isAccepted = ["PROFESSIONAL_ACCEPTED", "PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_EN_ROUTE", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(norm);
  const isOnTheWay = ["PROFESSIONAL_ON_THE_WAY", "PROFESSIONAL_EN_ROUTE", "PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(norm);
  const isArrived = ["PROFESSIONAL_ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(norm);
  const isStarted = ["SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(norm);
  const isCompleted = ["SERVICE_COMPLETED", "COMPLETED"].includes(norm);

  const findEventTs = (statusKey: string): string | null => {
    const ev = events.find((e) => (e.status || "").toUpperCase() === statusKey);
    return ev ? ev.timestamp : null;
  };

  const paymentDesc =
    paymentStatus === "PAID"
      ? `Payment verified via ${paymentMethod || "online"}`
      : paymentStatus === "AUTHORIZED"
      ? `Payment pre-authorized via ${paymentMethod || "card"}`
      : "Payment pending / Pay after service";

  return [
    {
      key: "CONFIRMED",
      label: "Booking Confirmed",
      description: paymentDesc,
      status: "completed",
      timestamp: findEventTs("CONFIRMED") || createdAt,
    },
    {
      key: "ASSIGNMENT",
      label: "Professional Assignment",
      description: hasTech
        ? `Allocated: ${technicianName}`
        : "Locating nearest verified professional in Kolkata",
      status: isAssigned ? "completed" : isAssigning ? "current" : "upcoming",
      timestamp: findEventTs("PROFESSIONAL_ASSIGNED"),
    },
    {
      key: "ACCEPTED",
      label: "Professional Accepted",
      description: isAccepted
        ? "Professional confirmed slot & tools ready"
        : "Awaiting technician acceptance",
      status: isAccepted ? "completed" : isAssigned && !isAccepted ? "current" : "upcoming",
      timestamp: findEventTs("PROFESSIONAL_ACCEPTED"),
    },
    {
      key: "ON_THE_WAY",
      label: "Professional On The Way",
      description: isOnTheWay
        ? "Technician en route with live GPS telemetry"
        : "Technician departs prior to slot window",
      status: isArrived || isStarted || isCompleted ? "completed" : isOnTheWay ? "current" : "upcoming",
      timestamp: findEventTs("PROFESSIONAL_ON_THE_WAY") || findEventTs("PROFESSIONAL_EN_ROUTE"),
    },
    {
      key: "ARRIVED",
      label: "Arrived at Doorstep",
      description: isArrived
        ? "Technician reached location; verified via start OTP"
        : "OTP verification at arrival",
      status: isStarted || isCompleted ? "completed" : isArrived ? "current" : "upcoming",
      timestamp: findEventTs("PROFESSIONAL_ARRIVED"),
    },
    {
      key: "SERVICE_STARTED",
      label: "Service Inspection & Work",
      description: isStarted
        ? "Work in progress under standard safety protocols"
        : "Technician performs diagnosis and repair",
      status: isCompleted ? "completed" : isStarted ? "current" : "upcoming",
      timestamp: findEventTs("SERVICE_STARTED"),
    },
    {
      key: "SERVICE_COMPLETED",
      label: "Service Completed",
      description: isCompleted
        ? "Service completed; warranty & final invoice activated"
        : "Final invoice & 30-day warranty",
      status: isCompleted ? "completed" : "upcoming",
      timestamp: findEventTs("SERVICE_COMPLETED") || findEventTs("COMPLETED"),
    },
  ];
}
