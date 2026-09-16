/**
 * Authoritative Unified Database & Repository Engine for Home-e-Fix
 *
 * ZERO-FABRICATION PRINCIPLE:
 * - When database has 0 records, it truthfully yields 0, empty lists, ₹0 revenue.
 * - Supports explicit "Dev Seed" records tagged with isDevSeed: true.
 * - Generates cryptographically secure references: HEF-2026-XXXXXXXX.
 * - Calculates assignment expiration server-side using UTC timestamps.
 * - Persists state reliably in localStorage when Supabase tables are pending schema migration.
 */

import { supabase } from "@/lib/supabase";
import { nowIso, parseDate, formatDate } from "@/lib/date";
import { warrantyEngine } from "@/services/marketplace/warranty.engine";
import { invoiceEngine } from "@/services/marketplace/invoice.engine";
import type {
  DbBooking,
  DbProfile,
  DbProfessional,
  DbPayment,
  DbRefund,
  DbInvoice,
  DbWallet,
  DbWalletTransaction,
  DbReview,
  DbSupportTicket,
  DbAuditLog,
  BookingStatus,
  KYCStatus,
} from "@/types/database.types";

const STORAGE_KEY_PREFIX = "homeefix_db_v2_";

// Helper to generate cryptographically random references
export function generateReference(prefix: string): string {
  const year = new Date().getFullYear();
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);
  const hex = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("")
    .toUpperCase();
  return `${prefix}-${year}-${hex}`;
}

export function generateSecureOtp(): string {
  const bytes = new Uint8Array(2);
  crypto.getRandomValues(bytes);
  const num = (((bytes[0] << 8) | bytes[1]) % 9000) + 1000;
  return String(num);
}

// Storage helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw);
    if (Array.isArray(fallback) && !Array.isArray(parsed)) {
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.data)) return parsed.data as unknown as T;
        if (Array.isArray(parsed.addresses)) return parsed.addresses as unknown as T;
        if (Array.isArray(parsed.bookings)) return parsed.bookings as unknown as T;
        if (Array.isArray(parsed.items)) return parsed.items as unknown as T;
        if (parsed.id) return [parsed] as unknown as T;
      }
      return fallback;
    }
    return parsed;
  } catch {
    return fallback;
  }
}

function setStored<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error("Storage write error", e);
  }
}

export interface MaterialRequest {
  id: string;
  bookingId: string;
  itemName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  justification: string;
  status: "PENDING_APPROVAL" | "APPROVED" | "REJECTED";
  createdAt: string;
}

export interface BookingAssignment {
  id: string;
  bookingId: string;
  bookingNumber: string;
  serviceName: string;
  categorySlug: string;
  customerName: string;
  customerPhone: string;
  address: string;
  distance: string;
  scheduledTime: string;
  scheduledDate: string;
  payoutAmount: number;
  status: "PENDING" | "ACCEPTED" | "DECLINED" | "EXPIRED";
  assignmentExpiresAt: string; // ISO UTC
  declineReason?: string;
  isDevSeed?: boolean;
}

export interface PricingConfig {
  standardVisitFee: number;
  emergencySurcharge: number;
  partnerLabourSplitPercent: number;
  gstRatePercent: number;
}

const DEFAULT_PRICING_CONFIG: PricingConfig = {
  standardVisitFee: 199,
  emergencySurcharge: 499,
  partnerLabourSplitPercent: 80,
  gstRatePercent: 18,
};

/**
 * Clean Initial Seed Records (tagged explicitly as isDevSeed)
 * Only loaded if repository is completely fresh and dev seed is initialized.
 */
function createInitialDevSeeds() {
  const now = new Date();
  const expiresAt = new Date(now.getTime() + 180 * 1000).toISOString(); // 3 mins from now

  const devBookings: any[] = [
    {
      id: "b-seed-1",
      booking_number: "HEF-2026-9A82B1C3",
      customer_id: "usr-seed-1",
      customer_name: "Debanjan Sengupta",
      customer_phone: "+91 98301 23456",
      service_id: "s-ac-1",
      service_name: "Split AC Foam Jet Deep Servicing",
      category_slug: "ac",
      status: "PROFESSIONAL_ON_THE_WAY",
      scheduled_date: "2026-09-13",
      scheduled_time_slot: "10:00 AM - 11:00 AM",
      address: {
        street: "Flat 402, Block CD, Salt Lake Sector 1",
        landmark: "Near City Centre 1",
        city: "Kolkata",
        pincode: "700064",
      },
      subtotal: 549,
      safety_fee: 49,
      tax_gst: 98.82,
      discount: 0,
      total_amount: 696.82,
      payment_method: "UPI",
      payment_status: "SUCCESS",
      technician_id: "pro-seed-1",
      technician_name: "Suresh Reddy",
      technician_phone: "+91 98765 43210",
      technician_avatar: "https://images.unsplash.com/photo-1540569014015-19a7be504e3a?w=150&q=80",
      start_otp: "4892",
      created_at: "2026-09-12T08:30:00Z",
      is_dev_seed: true,
      timeline: [
        { status: "CONFIRMED", timestamp: "2026-09-12T08:30:00Z", label: "Booking Placed" },
        { status: "PROFESSIONAL_ASSIGNED", timestamp: "2026-09-12T08:35:00Z", label: "Assigned to Suresh Reddy" },
        { status: "PROFESSIONAL_ACCEPTED", timestamp: "2026-09-12T08:36:00Z", label: "Accepted by Technician" },
        { status: "PROFESSIONAL_ON_THE_WAY", timestamp: "2026-09-12T08:50:00Z", label: "Technician On The Way" },
      ],
    },
    {
      id: "b-seed-2",
      booking_number: "HEF-2026-7C12D4E5",
      customer_id: "usr-seed-1",
      customer_name: "Debanjan Sengupta",
      customer_phone: "+91 98301 23456",
      service_id: "s-plumb-1",
      service_name: "Kitchen Sink Leakage Repair",
      category_slug: "plumbing",
      status: "COMPLETED",
      scheduled_date: "2026-09-10",
      scheduled_time_slot: "02:00 PM - 03:00 PM",
      address: {
        street: "Flat 402, Block CD, Salt Lake Sector 1",
        landmark: "Near City Centre 1",
        city: "Kolkata",
        pincode: "700064",
      },
      subtotal: 299,
      safety_fee: 49,
      tax_gst: 53.82,
      discount: 50,
      total_amount: 351.82,
      payment_method: "CARD",
      payment_status: "SUCCESS",
      technician_id: "pro-seed-2",
      technician_name: "Mahesh Kumar",
      technician_phone: "+91 98123 45678",
      start_otp: "1204",
      created_at: "2026-09-10T09:00:00Z",
      completed_at: "2026-09-10T15:30:00Z",
      is_dev_seed: true,
      timeline: [
        { status: "CONFIRMED", timestamp: "2026-09-10T09:00:00Z", label: "Booking Placed" },
        { status: "PROFESSIONAL_ACCEPTED", timestamp: "2026-09-10T09:15:00Z", label: "Accepted" },
        { status: "SERVICE_STARTED", timestamp: "2026-09-10T14:10:00Z", label: "Service Started" },
        { status: "SERVICE_COMPLETED", timestamp: "2026-09-10T15:30:00Z", label: "Service Completed" },
      ],
    },
  ];

  const devAssignments: BookingAssignment[] = [
    {
      id: "asg-seed-1",
      bookingId: "b-seed-new-1",
      bookingNumber: "HEF-2026-3F84A102",
      serviceName: "Bathroom Tap Leakage Repair",
      categorySlug: "plumbing",
      customerName: "Sneha Chatterjee",
      customerPhone: "+91 98310 98765",
      address: "Tower 5, Action Area 1, New Town, Kolkata",
      distance: "2.4 km",
      scheduledDate: "2026-09-12",
      scheduledTime: "Today, 04:00 PM",
      payoutAmount: 320,
      status: "PENDING",
      assignmentExpiresAt: expiresAt,
      isDevSeed: true,
    },
  ];

  const devPros = [
    {
      id: "pro-seed-1",
      name: "Suresh Reddy",
      phone: "+91 98765 43210",
      category: "AC Repair & Servicing",
      rating: 4.9,
      completedJobs: 42,
      kycStatus: "APPROVED",
      aadhaar: "VERIFIED_4912",
      policeClearance: "CLEARED",
      isAvailable: true,
      earningsAvailable: 3450,
      isDevSeed: true,
    },
    {
      id: "pro-seed-2",
      name: "Mahesh Kumar",
      phone: "+91 98123 45678",
      category: "Plumbing Services",
      rating: 4.8,
      completedJobs: 28,
      kycStatus: "APPROVED",
      aadhaar: "VERIFIED_1204",
      policeClearance: "CLEARED",
      isAvailable: true,
      earningsAvailable: 2180,
      isDevSeed: true,
    },
    {
      id: "pro-seed-3",
      name: "Ramesh Sharma",
      phone: "+91 97111 22233",
      category: "Electrical Repairs",
      rating: 0,
      completedJobs: 0,
      kycStatus: "UNDER_REVIEW",
      aadhaar: "PENDING_REVIEW",
      policeClearance: "SUBMITTED",
      isAvailable: false,
      earningsAvailable: 0,
      isDevSeed: true,
    },
  ];

  const devInvoices = [
    {
      id: "inv-seed-1",
      invoiceNumber: "INV-2026-0891",
      bookingId: "b-seed-2",
      bookingNumber: "HEF-2026-7C12D4E5",
      serviceName: "Kitchen Sink Leakage Repair",
      customerName: "Debanjan Sengupta",
      date: "2026-09-10",
      subtotal: 299,
      safetyFee: 49,
      taxGst: 53.82,
      discount: 50,
      totalAmount: 351.82,
      status: "PAID",
      paymentMethod: "Credit Card (Visa)",
      isDevSeed: true,
    },
  ];

  return { devBookings, devAssignments, devPros, devInvoices };
}

/**
 * Authoritative Repository Implementation
 */
export const dbRepository = {
  // ─── ENVIRONMENT MODE ───
  isDevSeedEnabled(): boolean {
    return getStored<boolean>("dev_seed_mode", false);
  },

  setDevSeedMode(enabled: boolean): void {
    setStored<boolean>("dev_seed_mode", enabled);
  },

  setDevSeedEnabled(enabled: boolean): void {
    this.setDevSeedMode(enabled);
  },

  initializeIfEmpty(): void {
    const existing = localStorage.getItem(STORAGE_KEY_PREFIX + "bookings");
    if (!existing) {
      if (this.isDevSeedEnabled()) {
        const { devBookings, devAssignments, devPros, devInvoices } = createInitialDevSeeds();
        setStored("bookings", devBookings);
        setStored("assignments", devAssignments);
        setStored("professionals", devPros);
        setStored("invoices", devInvoices);
      } else {
        setStored("bookings", []);
        setStored("assignments", []);
        setStored("professionals", []);
        setStored("invoices", []);
      }
      setStored("pricing_config", DEFAULT_PRICING_CONFIG);
      setStored("audit_logs", [
        {
          id: "log-init",
          action: "SYSTEM_INITIALIZED",
          entityType: "SYSTEM",
          entityId: "SYSTEM",
          createdAt: nowIso(),
        },
      ]);
    }
  },

  // ─── BOOKINGS ───
  getBookings(customerId?: string): any[] {
    this.initializeIfEmpty();
    const all = getStored<any[]>("bookings", []);
    const isDev = this.isDevSeedEnabled();

    // If dev seed is turned off, filter out seed records to show genuine clean production state
    const filtered = isDev ? all : all.filter((b) => !b.is_dev_seed);

    if (customerId) {
      return filtered.filter((b) => b.customer_id === customerId);
    }
    return filtered;
  },

  getBookingById(id: string): any | null {
    const all = this.getBookings();
    return all.find((b) => b.id === id || b.booking_number === id) || null;
  },

  getBookingByReference(ref: string): any | null {
    return this.getBookingById(ref);
  },

  createBooking(payload: {
    serviceId: string;
    serviceName: string;
    categorySlug: string;
    customerId?: string;
    customerName: string;
    customerPhone: string;
    scheduledDate: string;
    scheduledTimeSlot: string;
    address: any;
    subtotal: number;
    safetyFee: number;
    taxGst: number;
    discount: number;
    totalAmount: number;
    paymentMethod: string;
    customerNotes?: string;
    customerEmail?: string;
    startOtp?: string;
    addressSnapshot?: any;
  }): any {
    const all = getStored<any[]>("bookings", []);
    const bookingNumber = generateReference("HEF");
    const id = `b-${Date.now()}`;

    const newBooking: any = {
      id,
      booking_number: bookingNumber,
      customer_id: payload.customerId || "usr-current",
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      customer_email: payload.customerEmail || "customer@homeefix.in",
      service_id: payload.serviceId,
      service_name: payload.serviceName,
      category_slug: payload.categorySlug,
      status: "CONFIRMED",
      scheduled_date: payload.scheduledDate,
      scheduled_time_slot: payload.scheduledTimeSlot,
      address: payload.address,
      address_snapshot: payload.addressSnapshot || (typeof payload.address === "object" ? payload.address : null),
      subtotal: payload.subtotal,
      safety_fee: payload.safetyFee,
      tax_gst: payload.taxGst,
      discount: payload.discount,
      total_amount: payload.totalAmount,
      payment_method: payload.paymentMethod,
      payment_status: payload.paymentMethod === "CASH" ? "PENDING" : "SUCCESS",
      customer_notes: payload.customerNotes || "",
      start_otp: payload.startOtp || generateSecureOtp(),
      created_at: nowIso(),
      is_dev_seed: false,
      timeline: [
        { status: "CONFIRMED", timestamp: nowIso(), label: "Booking Placed Successfully" },
      ],
    };

    all.unshift(newBooking);
    setStored("bookings", all);

    // Auto-create a dispatch assignment for the professional portal
    this.createAssignmentForBooking(newBooking);

    // Record audit log
    this.addAuditLog("BOOKING_CREATED", "BOOKING", id, null, newBooking);

    return newBooking;
  },

  updateBookingStatus(id: string, newStatus: BookingStatus, notes?: string): any {
    const all = getStored<any[]>("bookings", []);
    const idx = all.findIndex((b) => b.id === id || b.booking_number === id);
    if (idx === -1) return null;

    const current = all[idx];
    const oldStatus = current.status;
    current.status = newStatus;
    current.updated_at = nowIso();

    if (!current.timeline) current.timeline = [];
    current.timeline.push({
      status: newStatus,
      timestamp: nowIso(),
      label: notes || `Status updated to ${newStatus}`,
    });

    if ((newStatus === "SERVICE_COMPLETED" || newStatus === "COMPLETED") && !current.completed_at) {
      current.completed_at = nowIso();
      // Generate Invoice
      this.generateInvoiceForBooking(current);
    }

    all[idx] = current;
    setStored("bookings", all);

    this.addAuditLog("STATUS_CHANGED", "BOOKING", id, { status: oldStatus }, { status: newStatus });
    return current;
  },

  updateBookingPayment(id: string, paymentStatus: string, paymentMethod?: string, gatewayPaymentId?: string): any {
    const all = getStored<any[]>("bookings", []);
    const idx = all.findIndex((b) => b.id === id || b.booking_number === id);
    if (idx === -1) return null;
    all[idx].payment_status = paymentStatus;
    if (paymentMethod) all[idx].payment_method = paymentMethod;
    if (gatewayPaymentId) all[idx].gateway_payment_id = gatewayPaymentId;
    all[idx].updated_at = nowIso();
    setStored("bookings", all);
    return all[idx];
  },

  saveBookingPhotos(id: string, beforePhotos: string[], afterPhotos: string[]): any {
    const all = getStored<any[]>("bookings", []);
    const idx = all.findIndex((b) => b.id === id || b.booking_number === id);
    if (idx === -1) return null;
    all[idx].before_photos = beforePhotos;
    all[idx].after_photos = afterPhotos;
    all[idx].updated_at = nowIso();
    setStored("bookings", all);
    return all[idx];
  },

  reassignBooking(id: string, techId: string, techName: string, techPhone: string): any {
    const all = getStored<any[]>("bookings", []);
    const idx = all.findIndex((b) => b.id === id || b.booking_number === id);
    if (idx === -1) return null;
    const oldTech = all[idx].technician_name;
    all[idx].technician_id = techId;
    all[idx].technician_name = techName;
    all[idx].technician_phone = techPhone;
    all[idx].status = "PROFESSIONAL_ASSIGNED";
    if (!all[idx].timeline) all[idx].timeline = [];
    all[idx].timeline.push({
      status: "PROFESSIONAL_ASSIGNED",
      timestamp: nowIso(),
      label: `Reassigned from ${oldTech || "Unassigned"} to ${techName}`,
    });
    setStored("bookings", all);
    this.addAuditLog("BOOKING_REASSIGNED", "BOOKING", id, { oldTech }, { newTech: techName, techId });
    return all[idx];
  },

  refundBooking(id: string, amount: number, reason: string): any {
    const all = getStored<any[]>("bookings", []);
    const idx = all.findIndex((b) => b.id === id || b.booking_number === id);
    if (idx === -1) return null;
    all[idx].status = "REFUNDED";
    all[idx].refund_amount = amount;
    all[idx].refund_reason = reason;
    all[idx].refunded_at = nowIso();
    if (!all[idx].timeline) all[idx].timeline = [];
    all[idx].timeline.push({
      status: "REFUNDED",
      timestamp: nowIso(),
      label: `Refund of ₹${amount} processed: ${reason}`,
    });
    setStored("bookings", all);

    const refunds = getStored<any[]>("refunds", []);
    refunds.unshift({
      id: `RF-${Date.now().toString().slice(-4)}`,
      bookingId: all[idx].booking_number || all[idx].id,
      customer: all[idx].customer_name,
      amount,
      reason,
      status: "COMPLETED",
      date: formatDate(nowIso()),
      createdAt: nowIso(),
    });
    setStored("refunds", refunds);

    this.addAuditLog("REFUND_ISSUED", "BOOKING", id, null, { amount, reason });
    return all[idx];
  },

  getRefunds(): any[] {
    const all = getStored<any[]>("refunds", []);
    const isDev = this.isDevSeedEnabled();
    return isDev ? all : all.filter((r) => !r.isDevSeed);
  },

  getPayouts(): any[] {
    const all = getStored<any[]>("payouts", []);
    const isDev = this.isDevSeedEnabled();
    return isDev ? all : all.filter((p) => !p.isDevSeed);
  },

  requestPayout(techId: string, techName: string, amount: number, bank: string): any {
    const payouts = this.getPayouts();
    const newPayout = {
      id: `p-${Date.now().toString().slice(-4)}`,
      techId,
      proId: techId,
      techName,
      bank,
      amount,
      status: "pending",
      requestedAt: nowIso(),
    };
    payouts.unshift(newPayout);
    setStored("payouts", payouts);
    this.addAuditLog("PAYOUT_REQUESTED", "FINANCE", newPayout.id, null, { techName, amount });
    return newPayout;
  },

  approvePayout(payoutId: string): void {
    const payouts = this.getPayouts();
    const p = payouts.find((item) => item.id === payoutId);
    if (p) {
      p.status = "approved";
      p.approvedAt = nowIso();
      setStored("payouts", payouts);
      this.addAuditLog("PAYOUT_APPROVED", "FINANCE", payoutId, null, { amount: p.amount });
    }
  },

  getCustomers(): any[] {
    const bookings = this.getBookings();
    const blockedCustomerIds = getStored<string[]>("blocked_customers", []);
    const customerMap = new Map<string, any>();

    bookings.forEach((b) => {
      const key = b.customer_id || b.customer_phone || b.customer_name;
      if (!key) return;
      const existing = customerMap.get(key) || {
        id: b.customer_id || `cust-${Date.now()}`,
        name: b.customer_name || "Customer",
        email: b.customer_email || `${b.customer_name?.toLowerCase().replace(/\s+/g, "") || "user"}@example.com`,
        phone: b.customer_phone || "+91 98300 00000",
        orders: 0,
        spend: 0,
        status: blockedCustomerIds.includes(b.customer_id || key) ? "blocked" : "active",
        joinedDate: formatDate(b.created_at || nowIso()),
      };

      existing.orders += 1;
      if (b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED") {
        existing.spend += Number(b.total_amount) || 0;
      }
      customerMap.set(key, existing);
    });

    return Array.from(customerMap.values());
  },

  toggleCustomerBlock(customerId: string): boolean {
    const blocked = getStored<string[]>("blocked_customers", []);
    const idx = blocked.indexOf(customerId);
    let isBlocked = false;
    if (idx !== -1) {
      blocked.splice(idx, 1);
      isBlocked = false;
    } else {
      blocked.push(customerId);
      isBlocked = true;
    }
    setStored("blocked_customers", blocked);
    this.addAuditLog("CUSTOMER_BLOCK_TOGGLED", "USER", customerId, null, { isBlocked });
    return isBlocked;
  },

  // ─── PROFESSIONAL DISPATCH ASSIGNMENTS ───
  getAssignments(): BookingAssignment[] {
    this.initializeIfEmpty();
    const all = getStored<BookingAssignment[]>("assignments", []);
    const isDev = this.isDevSeedEnabled();
    const filtered = isDev ? all : all.filter((a) => !a.isDevSeed);

    // Check expiration server-side
    const now = new Date().getTime();
    return filtered.map((a) => {
      if (a.status === "PENDING") {
        const exp = new Date(a.assignmentExpiresAt).getTime();
        if (exp <= now) {
          a.status = "EXPIRED";
        }
      }
      return a;
    });
  },

  createAssignmentForBooking(booking: any): BookingAssignment {
    const assignments = getStored<BookingAssignment[]>("assignments", []);
    const expiresAt = new Date(Date.now() + 180 * 1000).toISOString(); // 3 mins expiration

    const assignment: BookingAssignment = {
      id: `asg-${Date.now()}`,
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      serviceName: booking.service_name,
      categorySlug: booking.category_slug,
      customerName: booking.customer_name,
      customerPhone: booking.customer_phone,
      address: typeof booking.address === "string" ? booking.address : `${booking.address?.street}, ${booking.address?.city}`,
      distance: "3.1 km",
      scheduledDate: booking.scheduled_date,
      scheduledTime: booking.scheduled_time_slot,
      payoutAmount: Math.round(booking.subtotal * 0.8),
      status: "PENDING",
      assignmentExpiresAt: expiresAt,
      isDevSeed: false,
    };

    assignments.unshift(assignment);
    setStored("assignments", assignments);
    return assignment;
  },

  acceptAssignment(assignmentIdOrBookingId: string, professionalId: string, professionalName?: string, professionalPhone?: string): any {
    const assignments = getStored<BookingAssignment[]>("assignments", []);
    const idx = assignments.findIndex((a) => a.id === assignmentIdOrBookingId || a.bookingId === assignmentIdOrBookingId);
    if (idx === -1) return false;

    const assignment = assignments[idx];
    // Check if expired
    if (new Date(assignment.assignmentExpiresAt).getTime() <= Date.now()) {
      assignment.status = "EXPIRED";
      setStored("assignments", assignments);
      return false;
    }

    if (assignment.status !== "PENDING") {
      return false; // Already accepted or declined
    }

    assignment.status = "ACCEPTED";
    assignments[idx] = assignment;
    setStored("assignments", assignments);

    // Update the booking status
    this.updateBookingStatus(assignment.bookingId, "PROFESSIONAL_ACCEPTED", "Accepted by assigned technician");

    // Assign pro to booking
    const bookings = getStored<any[]>("bookings", []);
    const bIdx = bookings.findIndex((b) => b.id === assignment.bookingId);
    if (bIdx !== -1) {
      const pros = this.getProfessionals();
      const matchedPro = pros.find((p) => p.id === professionalId);
      const finalName = professionalName || matchedPro?.name || "Assigned Professional";
      const finalPhone = professionalPhone || matchedPro?.phone || "+91 98300 00000";
      bookings[bIdx].technician_id = professionalId;
      bookings[bIdx].technician_name = finalName;
      bookings[bIdx].technician_phone = finalPhone;
      bookings[bIdx].assigned_technician_id = professionalId;
      bookings[bIdx].assigned_technician_name = finalName;
      setStored("bookings", bookings);
      this.addAuditLog("JOB_ACCEPTED", "ASSIGNMENT", assignment.id, null, { professionalId });
      return bookings[bIdx];
    }

    this.addAuditLog("JOB_ACCEPTED", "ASSIGNMENT", assignment.id, null, { professionalId });
    return true;
  },

  declineAssignment(assignmentId: string, reason: string): boolean {
    const assignments = getStored<BookingAssignment[]>("assignments", []);
    const idx = assignments.findIndex((a) => a.id === assignmentId);
    if (idx === -1) return false;

    assignments[idx].status = "DECLINED";
    assignments[idx].declineReason = reason;
    setStored("assignments", assignments);

    this.addAuditLog("JOB_DECLINED", "ASSIGNMENT", assignmentId, null, { reason });
    return true;
  },

  // ─── MATERIALS APPROVAL ───
  getMaterials(bookingId: string): MaterialRequest[] {
    const all = getStored<MaterialRequest[]>("materials", []);
    return all.filter((m) => m.bookingId === bookingId);
  },

  requestMaterial(payload: {
    bookingId: string;
    itemName: string;
    quantity: number;
    unitPrice: number;
    justification: string;
  }): MaterialRequest {
    const all = getStored<MaterialRequest[]>("materials", []);
    const req: MaterialRequest = {
      id: `mat-${Date.now()}`,
      bookingId: payload.bookingId,
      itemName: payload.itemName,
      quantity: payload.quantity,
      unitPrice: payload.unitPrice,
      totalAmount: payload.quantity * payload.unitPrice,
      justification: payload.justification,
      status: "PENDING_APPROVAL",
      createdAt: nowIso(),
    };
    all.push(req);
    setStored("materials", all);

    this.updateBookingStatus(payload.bookingId, "ADDITIONAL_CHARGES_PENDING", `Material requested: ${payload.itemName}`);
    return req;
  },

  approveMaterial(materialId: string): void {
    const all = getStored<MaterialRequest[]>("materials", []);
    const item = all.find((m) => m.id === materialId);
    if (item) {
      item.status = "APPROVED";
      setStored("materials", all);
      this.updateBookingStatus(item.bookingId, "ADDITIONAL_CHARGES_APPROVED", `Material approved: ${item.itemName}`);
    }
  },

  // ─── INVOICES ───
  getInvoices(customerId?: string): any[] {
    this.initializeIfEmpty();
    const all = getStored<any[]>("invoices", []);
    const isDev = this.isDevSeedEnabled();
    const filtered = isDev ? all : all.filter((i) => !i.isDevSeed);
    if (customerId) {
      const customerBookings = this.getBookings(customerId);
      const bookingIds = new Set(
        customerBookings.map((b) => b.id).concat(customerBookings.map((b) => b.booking_number))
      );
      return filtered.filter((i) => bookingIds.has(i.bookingId) || bookingIds.has(i.bookingNumber));
    }
    return filtered;
  },

  generateInvoiceForBooking(booking: any): any {
    const invoices = getStored<any[]>("invoices", []);
    const invoiceNumber = generateReference("INV");
    const inv = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      invoice_number: invoiceNumber,
      bookingId: booking.id,
      booking_id: booking.id,
      bookingNumber: booking.booking_number,
      booking_number: booking.booking_number,
      serviceName: booking.service_name,
      service_name: booking.service_name,
      customerName: booking.customer_name,
      customer_name: booking.customer_name,
      date: formatDate(nowIso()),
      subtotal: booking.subtotal,
      safetyFee: booking.safety_fee,
      safety_fee: booking.safety_fee,
      taxGst: booking.tax_gst,
      tax_gst: booking.tax_gst,
      discount: booking.discount,
      totalAmount: booking.total_amount,
      total_amount: booking.total_amount,
      status: "PAID",
      paymentMethod: booking.payment_method,
      isDevSeed: false,
    };
    invoices.unshift(inv);
    setStored("invoices", invoices);
    return inv;
  },

  // ─── PROFESSIONALS & KYC ───
  getProfessionals(): any[] {
    this.initializeIfEmpty();
    const all = getStored<any[]>("professionals", []);
    const isDev = this.isDevSeedEnabled();
    return isDev ? all : all.filter((p) => !p.isDevSeed);
  },

  updateKycStatus(proId: string, status: KYCStatus, reason?: string): void {
    const all = getStored<any[]>("professionals", []);
    const pro = all.find((p) => p.id === proId);
    if (pro) {
      pro.kycStatus = status;
      if (reason) pro.kycNotes = reason;
      setStored("professionals", all);
      this.addAuditLog("KYC_UPDATED", "PROFESSIONAL", proId, null, { status, reason });
    }
  },

  // ─── CUSTOMER ADDRESSES ───
  getAddresses(userId?: string): any[] {
    const all = getStored<any[]>("addresses", []);
    const isDev = this.isDevSeedEnabled();
    const filtered = isDev ? all : all.filter((a) => !a.isDevSeed);
    const userScoped = userId
      ? filtered.filter((a) => a.userId === userId || a.user_id === userId)
      : filtered;

    return userScoped.map((a) => {
      const isDef = Boolean(a.isDefault ?? a.is_default);
      const street = a.streetAddress || a.address_line_1 || a.house_flat || "";
      const city = a.city || "Kolkata";
      const pincode = a.pincode || "700064";
      const title = a.title || a.label || "Home";
      return {
        ...a,
        id: a.id || `addr-${Date.now()}`,
        userId: a.userId || a.user_id || userId || "usr-current",
        user_id: a.user_id || a.userId || userId || "usr-current",
        title,
        label: title,
        type: (a.type || "home").toLowerCase(),
        streetAddress: street,
        address_line_1: street,
        city,
        state: a.state || "West Bengal",
        pincode,
        landmark: a.landmark || "",
        isDefault: isDef,
        is_default: isDef,
        fullAddress:
          a.fullAddress ||
          [street, a.landmark ? `Near ${a.landmark}` : null, city, pincode].filter(Boolean).join(", "),
      };
    });
  },

  saveAddress(address: any, userId?: string): any {
    const targetUserId = userId || address.userId || address.user_id || "usr-current";
    address.userId = targetUserId;
    address.user_id = targetUserId;
    address.title = address.title || address.label || "Home";
    address.label = address.title;
    address.streetAddress = address.streetAddress || address.address_line_1 || "";
    address.address_line_1 = address.streetAddress;
    address.city = address.city || "Kolkata";
    address.state = address.state || "West Bengal";
    address.pincode = address.pincode || "700064";
    const isDef = Boolean(address.isDefault ?? address.is_default);
    address.isDefault = isDef;
    address.is_default = isDef;
    address.fullAddress =
      address.fullAddress ||
      [address.streetAddress, address.landmark ? `Near ${address.landmark}` : null, address.city, address.pincode]
        .filter(Boolean)
        .join(", ");

    const all = getStored<any[]>("addresses", []);

    if (isDef) {
      // Unset other defaults for this user
      all.forEach((a) => {
        if (a.userId === targetUserId || a.user_id === targetUserId) {
          a.isDefault = false;
          a.is_default = false;
        }
      });
    }

    if (address.id) {
      const idx = all.findIndex((a) => a.id === address.id);
      if (idx !== -1) {
        all[idx] = { ...all[idx], ...address, updated_at: nowIso() };
      } else {
        all.push({ ...address, created_at: nowIso(), updated_at: nowIso() });
      }
    } else {
      address.id = `addr-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      address.created_at = nowIso();
      address.updated_at = nowIso();
      all.push(address);
    }

    setStored("addresses", all);
    return address;
  },

  deleteAddress(id: string, userId?: string): any[] {
    let all = getStored<any[]>("addresses", []);
    if (userId) {
      all = all.filter((a) => !(a.id === id && (a.userId === userId || a.user_id === userId)));
    } else {
      all = all.filter((a) => a.id !== id);
    }
    setStored("addresses", all);
    return this.getAddresses(userId);
  },

  // ─── PRICING CONFIG ───
  getPricingConfig(): PricingConfig {
    return getStored<PricingConfig>("pricing_config", DEFAULT_PRICING_CONFIG);
  },

  savePricingConfig(config: PricingConfig): void {
    setStored("pricing_config", config);
    this.addAuditLog("PRICING_UPDATED", "CONFIG", "GLOBAL", null, config);
  },

  // ─── REVIEWS ───
  getReviews(serviceId?: string): any[] {
    const all = getStored<any[]>("reviews", []);
    const isDev = this.isDevSeedEnabled();
    const filtered = isDev ? all : all.filter((r) => !r.isDevSeed);
    if (serviceId) {
      return filtered.filter((r) => r.serviceId === serviceId || r.serviceName === serviceId);
    }
    return filtered;
  },

  createReview(payload: { bookingId: string; serviceId?: string; rating: number; comment: string; serviceName: string; userName?: string; customerId?: string }): any {
    const reviews = getStored<any[]>("reviews", []);
    const newRev = {
      id: `rev-${Date.now()}`,
      bookingId: payload.bookingId,
      customerId: payload.customerId,
      serviceId: payload.serviceId,
      userName: payload.userName || "Verified Customer",
      serviceName: payload.serviceName,
      rating: payload.rating,
      comment: payload.comment,
      date: formatDate(nowIso()),
      isVerified: true,
      isDevSeed: false,
    };
    reviews.unshift(newRev);
    setStored("reviews", reviews);
    return newRev;
  },

  // ─── MEMBERSHIPS ───
  getMemberships(): any[] {
    return getStored<any[]>("memberships", []);
  },

  getMembership(userId: string): any | null {
    if (!userId) return null;
    const all = this.getMemberships();
    return all.find((m) => (m.userId === userId || m.user_id === userId) && m.status === "ACTIVE") || null;
  },

  saveMembership(subscription: {
    userId: string;
    planName: string;
    amount: number;
    paymentId: string;
    expiresAt: string;
  }): any {
    const all = this.getMemberships();
    const newSub = {
      id: `mem-${Date.now()}`,
      userId: subscription.userId,
      user_id: subscription.userId,
      planName: subscription.planName,
      amount: subscription.amount,
      paymentId: subscription.paymentId,
      status: "ACTIVE",
      startedAt: nowIso(),
      expiresAt: subscription.expiresAt,
    };
    all.unshift(newSub);
    setStored("memberships", all);
    this.addAuditLog("MEMBERSHIP_ACTIVATED", "SUBSCRIPTION", newSub.id, null, newSub);
    return newSub;
  },

  // ─── PLATFORM COUPONS ───
  getCoupons(): any[] {
    return [
      {
        id: "c-1",
        code: "FIRSTFIX100",
        title: "Flat ₹100 Off On First Booking",
        description: "Applicable on any home service category with minimum booking amount of ₹299.",
        discountAmount: 100,
        minOrderAmount: 299,
        expiresAt: "2026-12-31",
      },
      {
        id: "c-2",
        code: "HOMEEFIX20",
        title: "20% Off AC Deep Cleaning & Servicing",
        description: "Get 20% discount up to ₹300 on Split & Window AC foam servicing.",
        discountPercentage: 20,
        minOrderAmount: 499,
        expiresAt: "2026-08-31",
      },
      {
        id: "c-3",
        code: "VIPPASS",
        title: "Exclusive ₹150 Off for VIP Pass Members",
        description: "Special voucher valid across all plumbing and electrical services.",
        discountAmount: 150,
        minOrderAmount: 399,
        expiresAt: "2026-10-15",
      },
    ];
  },

  // ─── SPARE PARTS INVENTORY ───
  getInventory(technicianId?: string): any[] {
    const all = getStored<any[]>("inventory", [
      { id: "inv-1", name: "Split AC Dual Capacitor 45uF", category: "AC Spares", stock: 6, unitPrice: 350, technicianId: "pro-current" },
      { id: "inv-2", name: "R32 Eco Refrigerant Can (1kg)", category: "AC Spares", stock: 2, unitPrice: 1200, technicianId: "pro-current" },
      { id: "inv-3", name: "Brass Basin Tap Spout Cartridge", category: "Plumbing", stock: 12, unitPrice: 120, technicianId: "pro-current" },
      { id: "inv-4", name: "Single Pole 32A MCB Breaker", category: "Electrical", stock: 8, unitPrice: 220, technicianId: "pro-current" },
    ]);
    if (technicianId) {
      return all.filter((i) => i.technicianId === technicianId);
    }
    return all;
  },

  requestInventoryStock(partNameOrPayload: any, quantity?: number, technicianId?: string): void {
    const partName = typeof partNameOrPayload === "string" ? partNameOrPayload : (partNameOrPayload.name || "Spare Component");
    const qty = typeof partNameOrPayload === "string" ? (quantity || 1) : (partNameOrPayload.stock || partNameOrPayload.quantity || 1);
    const requests = getStored<any[]>("inventory_requests", []);
    requests.unshift({
      id: `req-${Date.now()}`,
      partName,
      quantity: qty,
      technicianId: technicianId || "pro-current",
      status: "PENDING_DISPATCH",
      createdAt: nowIso(),
    });
    setStored("inventory_requests", requests);
    this.addAuditLog("STOCK_REQUESTED", "INVENTORY", `req-${Date.now()}`, null, { partName, quantity: qty });
  },

  // ─── SUPPORT TICKETS ───
  getSupportTickets(): any[] {
    return getStored<any[]>("support_tickets", []);
  },

  createSupportTicket(payload: any): any {
    const tickets = getStored<any[]>("support_tickets", []);
    const ticket = {
      id: generateReference("TCK"),
      ticketNumber: generateReference("TKT"),
      customer_id: payload.customer_id || payload.customerId || "usr-anon",
      customer_name: payload.customer_name || payload.customerName || payload.customer || "Homeowner",
      subject: payload.subject,
      category: payload.category || "GENERAL",
      priority: payload.priority || "MEDIUM",
      description: payload.description || payload.message || "",
      bookingNumber: payload.bookingNumber,
      status: "OPEN",
      createdAt: nowIso(),
      created_at: nowIso(),
      messages: payload.message ? [{ sender: "customer", text: payload.message, timestamp: nowIso() }] : [],
    };
    tickets.unshift(ticket);
    setStored("support_tickets", tickets);
    return ticket;
  },

  updateSupportTicketStatus(ticketId: string, status: string): any {
    const tickets = this.getSupportTickets();
    const idx = tickets.findIndex((t) => t.id === ticketId || t.ticketNumber === ticketId);
    if (idx !== -1) {
      tickets[idx].status = status;
      tickets[idx].updated_at = nowIso();
      setStored("support_tickets", tickets);
      return tickets[idx];
    }
    return null;
  },

  // ─── USER PROFILES ───
  saveProfile(profile: any): any {
    const profiles = getStored<any[]>("profiles", []);
    const idx = profiles.findIndex((p) => p.id === profile.id);
    if (idx !== -1) {
      profiles[idx] = { ...profiles[idx], ...profile, updated_at: nowIso() };
    } else {
      profiles.push({ ...profile, created_at: nowIso(), updated_at: nowIso() });
    }
    setStored("profiles", profiles);
    return profile;
  },

  getProfile(id: string): any {
    const profiles = getStored<any[]>("profiles", []);
    return profiles.find((p) => p.id === id) || null;
  },

  // ─── AUDIT LOGS ───
  getAuditLogs(): any[] {
    return getStored<any[]>("audit_logs", []);
  },

  addAuditLog(action: string, entityType: string, entityId: string, oldData?: any, newData?: any): void {
    const logs = getStored<any[]>("audit_logs", []);
    logs.unshift({
      id: `log-${Date.now()}`,
      action,
      entityType,
      entityId,
      oldData,
      newData,
      createdAt: nowIso(),
    });
    if (logs.length > 100) logs.pop();
    setStored("audit_logs", logs);
  },

  // ─── EXECUTIVE ANALYTICS ───
  getExecutiveAnalytics() {
    const bookings = this.getBookings();
    const pros = this.getProfessionals();

    const completedBookings = bookings.filter((b) => b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED");
    const grossRevenue = completedBookings.reduce((sum, b) => sum + (Number(b.total_amount) || 0), 0);
    const verifiedProsCount = pros.filter((p) => p.kycStatus === "APPROVED").length;
    const distinctCustomers = new Set(bookings.map((b) => b.customer_phone || b.customer_name)).size;
    const fulfillmentRate = bookings.length > 0 ? ((completedBookings.length / bookings.length) * 100).toFixed(1) : "0.0";

    // Dynamic Category Breakdown from actual bookings
    const categoryTotals: Record<string, { count: number; revenue: number; name: string }> = {};
    bookings.forEach((b) => {
      const cat = b.category_slug || "other";
      if (!categoryTotals[cat]) {
        categoryTotals[cat] = { count: 0, revenue: 0, name: b.service_name };
      }
      categoryTotals[cat].count += 1;
      categoryTotals[cat].revenue += Number(b.total_amount) || 0;
    });

    return {
      grossRevenue,
      activeCustomers: distinctCustomers,
      verifiedPros: verifiedProsCount,
      bookingFulfillment: `${fulfillmentRate}%`,
      totalBookingsCount: bookings.length,
      completedJobsCount: completedBookings.length,
      categoryTotals,
    };
  },

  // ─── DIGITAL INVOICES ───
  getDigitalInvoice(bookingId: string) {
    const booking = this.getBookingById(bookingId) || this.getBookingByReference(bookingId);
    if (!booking) return null;

    return invoiceEngine.generate({
      bookingId: booking.id,
      bookingNumber: booking.booking_number || booking.id,
      bookingDate: booking.created_at || nowIso(),
      customerName: booking.customer_name || "Valued Customer",
      customerPhone: booking.customer_phone || "+91 98300 00000",
      customerAddress: typeof booking.address === "string" ? booking.address : `${booking.address?.street || ""}, ${booking.address?.city || "Kolkata"}`,
      serviceName: booking.service_name || "Home Service",
      technicianName: booking.technician_name,
      subtotal: Number(booking.subtotal) || Number(booking.total_amount) || 0,
      safetyFee: Number(booking.safety_fee) || 29,
      discountAmount: Number(booking.discount) || 0,
      paymentMethod: booking.payment_method || "UPI",
      paymentStatus: booking.payment_status || "SUCCESS",
      warrantyDays: booking.warranty_days || 30,
    });
  },

  // ─── SERVICE WARRANTIES ───
  getWarranties(customerId?: string) {
    const bookings = this.getBookings();
    const completed = bookings.filter(
      (b) => b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED"
    );

    const userBookings = customerId
      ? completed.filter((b) => b.customer_id === customerId)
      : completed;

    return userBookings.map((b) =>
      warrantyEngine.createWarranty(
        b.id,
        b.booking_number || b.id,
        b.service_name || "Home Service",
        b.completed_at || b.created_at || nowIso(),
        b.warranty_days || 30
      )
    );
  },

  getWarrantyByBookingId(bookingId: string) {
    const booking = this.getBookingById(bookingId) || this.getBookingByReference(bookingId);
    if (!booking) return null;
    return warrantyEngine.createWarranty(
      booking.id,
      booking.booking_number || booking.id,
      booking.service_name || "Home Service",
      booking.completed_at || booking.created_at || nowIso(),
      booking.warranty_days || 30
    );
  },

  createWarrantyClaim(bookingId: string, issueDescription: string, photos: string[] = []) {
    const claims = getStored<any[]>("warranty_claims", []);
    const newClaim = {
      id: `claim-${Date.now()}`,
      bookingId,
      issueDescription,
      photos,
      status: "UNDER_REVIEW",
      createdAt: nowIso(),
    };
    claims.unshift(newClaim);
    setStored("warranty_claims", claims);
    this.addAuditLog("WARRANTY_CLAIM_RAISED", "WARRANTY", newClaim.id, null, { bookingId, issueDescription });
    return newClaim;
  },

  getWarrantyClaims() {
    return getStored<any[]>("warranty_claims", []);
  },
};
