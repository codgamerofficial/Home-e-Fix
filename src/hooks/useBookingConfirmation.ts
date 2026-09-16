import { useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { bookingsApi } from "@/services/api/bookings.api";
import { invoiceEngine } from "@/services/marketplace/invoice.engine";
import { useAuthStore } from "@/store/auth.store";
import { formatDate } from "@/lib/date";
import type { DbBooking } from "@/types/database.types";
import type { DigitalInvoice } from "@/types/marketplace.types";

export interface BookingTimelineStep {
  key: string;
  label: string;
  description: string;
  status: "completed" | "current" | "upcoming";
  timestamp?: string | null;
}

export interface NormalizedBookingConfirmation {
  booking: DbBooking;
  bookingId: string;
  bookingNumber: string;
  status: string;
  service: {
    name: string;
    categorySlug: string;
    totalAmount: number;
    subtotal: number;
    safetyFee: number;
    taxGst: number;
    discount: number;
  };
  customer: {
    name: string;
    phone: string;
    email: string;
    id?: string;
  };
  addressSnapshot: {
    formattedAddress: string;
    houseFlatFloor: string;
    buildingSocietyName?: string;
    streetRoadName: string;
    areaLocality: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
  };
  scheduled: {
    date: string;
    timeSlot: string;
    formattedFull: string;
  };
  payment: {
    status: "PAID" | "PAYMENT_PENDING" | "PAYMENT_FAILED" | "REFUNDED" | "PAY_AT_SERVICE";
    method: string;
    totalPayable: number;
    subtotal: number;
    safetyFee: number;
    taxGst: number;
    discount: number;
    isPaid: boolean;
  };
  professional: {
    id: string;
    name: string;
    phone: string;
    trade: string;
    rating?: number;
    experienceYears?: number;
    isVerified: boolean;
    avatar?: string;
  } | null;
  warranty: {
    days: number;
    title: string;
    description: string;
  };
  timeline: BookingTimelineStep[];
  invoice: DigitalInvoice | null;
  canViewBooking: boolean;
  unauthorizedReason?: string;
}

/**
 * Standardize address snapshot display without leaking operational hub codes (KOL_EAST_SL, etc.)
 */
function normalizeAddressSnapshot(rawAddress: any, rawSnapshot?: any): NormalizedBookingConfirmation["addressSnapshot"] {
  const s = rawSnapshot || (typeof rawAddress === "object" ? rawAddress : null) || {};

  const houseFlatFloor = s.house_flat_floor || s.houseFlatFloor || s.flat || s.houseNumber || "";
  const buildingSocietyName = s.building_society_name || s.buildingSocietyName || s.building || "";
  const streetRoadName = s.street_road_name || s.streetRoadName || s.street || s.streetAddress || "";
  const areaLocality = s.area_locality || s.areaLocality || s.area || s.locality || "";
  const landmark = s.landmark || "";
  const city = s.city || "Kolkata";
  const state = s.state || "West Bengal";
  const pincode = s.pincode || s.postalCode || "700001";

  // Build clean human-friendly multi-line address
  const parts: string[] = [];
  if (houseFlatFloor) parts.push(houseFlatFloor);
  if (buildingSocietyName) parts.push(buildingSocietyName);
  if (streetRoadName) parts.push(streetRoadName);
  if (areaLocality) parts.push(areaLocality);
  if (landmark) parts.push(`Near ${landmark}`);
  parts.push(`${city}, ${state} – ${pincode}`);

  const formattedAddress =
    s.formatted_address ||
    (typeof rawAddress === "string" && rawAddress.length > 5
      ? rawAddress
      : parts.join(", "));

  // Ensure no operational hub strings are exposed
  const cleanFormatted = formattedAddress.replace(/\b(KOL_[A-Z0-9_]+)\b/gi, "").trim();

  return {
    formattedAddress: cleanFormatted,
    houseFlatFloor,
    buildingSocietyName,
    streetRoadName,
    areaLocality,
    landmark,
    city,
    state,
    pincode,
  };
}

/**
 * Determine lifecycle timeline steps based on booking status.
 */
function buildBookingTimeline(status: string, bookingCreated: string): BookingTimelineStep[] {
  const normStatus = (status || "CONFIRMED").toUpperCase();

  const isConfirmed = true;
  const isAssigning = ["ASSIGNING", "ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(normStatus);
  const isAccepted = ["ASSIGNED", "ACCEPTED", "ON_THE_WAY", "ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(normStatus);
  const isOnTheWay = ["ON_THE_WAY", "ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(normStatus);
  const isStarted = ["ARRIVED", "SERVICE_STARTED", "SERVICE_COMPLETED", "COMPLETED"].includes(normStatus);
  const isCompleted = ["SERVICE_COMPLETED", "COMPLETED", "CLOSED"].includes(normStatus);

  return [
    {
      key: "CONFIRMED",
      label: "Booking Confirmed",
      description: "Service request placed & secured.",
      status: isConfirmed ? "completed" : "upcoming",
      timestamp: formatDate(bookingCreated),
    },
    {
      key: "ASSIGNING",
      label: "Professional Assignment",
      description: isAccepted ? "Verified professional assigned." : "Locating nearest verified professional in Kolkata.",
      status: isAccepted ? "completed" : isAssigning ? "current" : "upcoming",
    },
    {
      key: "ACCEPTED",
      label: "Professional Accepted",
      description: isAccepted ? "Professional confirmed slot & tools ready." : "Awaiting technician acceptance.",
      status: isAccepted ? "completed" : "upcoming",
    },
    {
      key: "ON_THE_WAY",
      label: "Professional on the Way",
      description: isOnTheWay ? "Technician en route with live GPS telemetry." : "Technician will depart 45 mins prior to slot.",
      status: isCompleted || isStarted ? "completed" : isOnTheWay ? "current" : "upcoming",
    },
    {
      key: "SERVICE_STARTED",
      label: "Service Inspection & Work",
      description: isStarted ? "Job in progress under standard safety protocols." : "OTP verification at arrival.",
      status: isCompleted ? "completed" : isStarted ? "current" : "upcoming",
    },
    {
      key: "SERVICE_COMPLETED",
      label: "Service Completed",
      description: isCompleted ? "Service finished, warranty activated." : "Final invoice & warranty issue.",
      status: isCompleted ? "completed" : "upcoming",
    },
  ];
}

/**
 * Determine payment status
 */
function normalizePaymentStatus(
  paymentMethod: string = "UPI",
  rawPaymentStatus: string = "PENDING"
): NormalizedBookingConfirmation["payment"]["status"] {
  const method = paymentMethod.toUpperCase();
  const status = rawPaymentStatus.toUpperCase();

  if (status === "SUCCESS" || status === "PAID" || status === "COMPLETED") {
    return "PAID";
  }
  if (status === "FAILED") {
    return "PAYMENT_FAILED";
  }
  if (status === "REFUNDED") {
    return "REFUNDED";
  }
  if (method === "CASH" || method === "PAY_AFTER_SERVICE" || method === "COD") {
    return "PAY_AT_SERVICE";
  }
  return "PAYMENT_PENDING";
}

/**
 * Canonical Hook for Booking Confirmation Page
 */
export function useBookingConfirmation(bookingId?: string) {
  const queryClient = useQueryClient();
  const { user, isAuthenticated } = useAuthStore();

  const query = useQuery({
    queryKey: ["booking-confirmation", bookingId],
    queryFn: async (): Promise<NormalizedBookingConfirmation | null> => {
      if (!bookingId) return null;

      const raw = await bookingsApi.getBooking(bookingId);
      if (!raw) return null;
      const b: any = raw;

      // Ownership security verification
      let canView = true;
      let unauthorizedReason: string | undefined;

      if (isAuthenticated && user) {
        const isAdmin = user.role === "admin";
        const isTech = user.role === "technician";
        const isOwner = !b.customer_id || b.customer_id === user.id || b.customer_id === "usr-current";

        if (!isAdmin && !isTech && !isOwner) {
          canView = false;
          unauthorizedReason = "You do not have permission to view this booking.";
        }
      }

      // Extract address snapshot
      const addressSnapshot = normalizeAddressSnapshot(b.address, b.address_snapshot);

      // Scheduled dates
      const scheduledDateFormatted = formatDate(b.scheduled_date || new Date());
      const timeSlot = b.scheduled_time_slot || "09:00 AM – 11:00 AM";

      // Payment details
      const paymentMethod = b.payment_method || "UPI";
      const paymentStatus = normalizePaymentStatus(paymentMethod, b.payment_status);
      const isPaid = paymentStatus === "PAID";

      const totalPayable = b.total_amount || 499;
      const safetyFee = b.safety_fee ?? 49;
      const taxGst = b.tax_gst ?? Math.round(totalPayable * 0.18);
      const discount = b.discount ?? 0;
      const subtotal = b.subtotal ?? Math.max(0, totalPayable - safetyFee - taxGst + discount);

      // Professional details (only if genuinely assigned)
      let professional: NormalizedBookingConfirmation["professional"] = null;
      if (b.technician_name && b.technician_name.trim()) {
        professional = {
          id: b.technician_id || "tech-assigned",
          name: b.technician_name,
          phone: b.technician_phone || "",
          trade: b.service_name || "Verified Professional",
          rating: 4.9,
          experienceYears: 6,
          isVerified: true,
          avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&q=80",
        };
      }

      // Warranty definition
      const warranty = {
        days: 30,
        title: "30-Day Re-work Guarantee",
        description: "Covers workmanship and repatching for 30 days across Kolkata.",
      };

      // Invoice generation if applicable
      const invoice = invoiceEngine.generate({
        bookingId: b.id,
        bookingNumber: b.booking_number || bookingId,
        bookingDate: b.created_at || new Date().toISOString(),
        customerName: b.customer_name || user?.fullName || "Valued Customer",
        customerPhone: b.customer_phone || user?.phone || "",
        customerAddress: addressSnapshot.formattedAddress,
        serviceName: b.service_name || "Home Service Package",
        technicianName: professional?.name,
        subtotal,
        safetyFee,
        discountAmount: discount,
        paymentMethod,
        paymentStatus,
        warrantyDays: warranty.days,
      });

      return {
        booking: raw,
        bookingId: b.id,
        bookingNumber: b.booking_number || bookingId,
        status: b.status || "CONFIRMED",
        service: {
          name: b.service_name || "Home Service",
          categorySlug: b.category_slug || "general",
          totalAmount: totalPayable,
          subtotal,
          safetyFee,
          taxGst,
          discount,
        },
        customer: {
          name: b.customer_name || user?.fullName || "Customer",
          phone: b.customer_phone || user?.phone || "",
          email: b.customer_email || user?.email || "",
          id: b.customer_id,
        },
        addressSnapshot,
        scheduled: {
          date: scheduledDateFormatted,
          timeSlot,
          formattedFull: `${scheduledDateFormatted} • ${timeSlot}`,
        },
        payment: {
          status: paymentStatus,
          method: paymentMethod,
          totalPayable,
          subtotal,
          safetyFee,
          taxGst,
          discount,
          isPaid,
        },
        professional,
        warranty,
        timeline: buildBookingTimeline(raw.status, raw.created_at || new Date().toISOString()),
        invoice,
        canViewBooking: canView,
        unauthorizedReason,
      };
    },
    enabled: Boolean(bookingId),
    staleTime: 1000 * 15, // 15 seconds
  });

  // Supabase Realtime update hookup
  useEffect(() => {
    if (!bookingId) return;

    const channel = bookingsApi.subscribeToBooking(bookingId, () => {
      queryClient.invalidateQueries({ queryKey: ["booking-confirmation", bookingId] });
      queryClient.invalidateQueries({ queryKey: ["customer-bookings"] });
    });

    return () => {
      channel.unsubscribe();
    };
  }, [bookingId, queryClient]);

  return query;
}
