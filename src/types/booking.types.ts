import type { BaseEntity, GeoLocation, TimeSlot, MediaFile } from "./common.types";
import type { Service } from "./service.types";
import type { User } from "./auth.types";

/* ─── Booking Status ─── */

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "assigned"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "refunded";

/* ─── Payment Status ─── */

export type PaymentStatus =
  | "pending"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded"
  | "partial_refund";

/* ─── Payment Method ─── */

export type PaymentMethod = "card" | "upi" | "netbanking" | "wallet" | "cod";

/* ─── Booking Address ─── */

export interface BookingAddress {
  label: string; // "Home", "Office", etc.
  fullAddress: string;
  landmark?: string;
  floor?: string;
  location: GeoLocation;
}

/* ─── Booking ─── */

export interface Booking extends BaseEntity {
  bookingNumber: string;
  customerId: string;
  customer?: User;
  technicianId?: string;
  technician?: User;
  serviceId: string;
  service?: Service;
  status: BookingStatus;
  scheduledDate: string;
  scheduledSlot: TimeSlot;
  address: BookingAddress;
  notes?: string;
  images?: MediaFile[];

  // Pricing
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  couponCode?: string;

  // Payment
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
  paymentId?: string;
  transactionId?: string;

  // Lifecycle
  confirmedAt?: string;
  assignedAt?: string;
  startedAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;

  // Rating
  rating?: number;
  review?: string;
}

/* ─── Booking Request ─── */

export interface BookingRequest {
  serviceId: string;
  scheduledDate: string;
  scheduledSlotId: string;
  address: BookingAddress;
  notes?: string;
  couponCode?: string;
  paymentMethod: PaymentMethod;
}

/* ─── Booking Summary ─── */

export interface BookingSummary {
  totalBookings: number;
  pendingBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  totalSpent: number;
}
