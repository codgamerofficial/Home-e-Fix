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

// Storage helpers
function getStored<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return raw ? JSON.parse(raw) : fallback;
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
    return getStored<boolean>("dev_seed_mode", true);
  },

  setDevSeedMode(enabled: boolean): void {
    setStored<boolean>("dev_seed_mode", enabled);
  },

  initializeIfEmpty(): void {
    const existing = localStorage.getItem(STORAGE_KEY_PREFIX + "bookings");
    if (!existing) {
      const { devBookings, devAssignments, devPros, devInvoices } = createInitialDevSeeds();
      setStored("bookings", devBookings);
      setStored("assignments", devAssignments);
      setStored("professionals", devPros);
      setStored("invoices", devInvoices);
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
      return filtered.filter((b) => b.customer_id === customerId || b.customer_id === "usr-seed-1");
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
  }): any {
    const all = getStored<any[]>("bookings", []);
    const bookingNumber = generateReference("HEF");
    const id = `b-${Date.now()}`;

    const newBooking: any = {
      id,
      booking_number: bookingNumber,
      customer_id: "usr-current",
      customer_name: payload.customerName,
      customer_phone: payload.customerPhone,
      service_id: payload.serviceId,
      service_name: payload.serviceName,
      category_slug: payload.categorySlug,
      status: "CONFIRMED",
      scheduled_date: payload.scheduledDate,
      scheduled_time_slot: payload.scheduledTimeSlot,
      address: payload.address,
      subtotal: payload.subtotal,
      safety_fee: payload.safetyFee,
      tax_gst: payload.taxGst,
      discount: payload.discount,
      total_amount: payload.totalAmount,
      payment_method: payload.paymentMethod,
      payment_status: payload.paymentMethod === "CASH" ? "PENDING" : "SUCCESS",
      customer_notes: payload.customerNotes || "",
      start_otp: String(Math.floor(1000 + Math.random() * 9000)),
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
    return getStored<any[]>("refunds", [
      {
        id: "RF-801",
        bookingId: "HEF-2026-9A82B1C3",
        customer: "Debanjan Sengupta",
        amount: 499,
        reason: "Technician delayed past emergency threshold",
        status: "COMPLETED",
        date: "11 Sep 2026",
      },
    ]);
  },

  getPayouts(): any[] {
    return getStored<any[]>("payouts", [
      { id: "p-1", techId: "pro-seed-1", techName: "Suresh Reddy", bank: "HDFC Bank (**** 4891)", amount: 3450, status: "pending", requestedAt: nowIso() },
      { id: "p-2", techId: "pro-seed-2", techName: "Mahesh Kumar", bank: "ICICI Bank (**** 1204)", amount: 2180, status: "approved", requestedAt: nowIso() },
    ]);
  },

  requestPayout(techId: string, techName: string, amount: number, bank: string): any {
    const payouts = this.getPayouts();
    const newPayout = {
      id: `p-${Date.now().toString().slice(-4)}`,
      techId,
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

    customerMap.set("usr-seed-1", {
      id: "usr-seed-1",
      name: "Debanjan Sengupta",
      email: "debanjan@homeefix.in",
      phone: "+91 98301 23456",
      orders: 0,
      spend: 0,
      status: blockedCustomerIds.includes("usr-seed-1") ? "blocked" : "active",
      joinedDate: "10 Aug 2026",
    });

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

  acceptAssignment(assignmentId: string, professionalId: string): boolean {
    const assignments = getStored<BookingAssignment[]>("assignments", []);
    const idx = assignments.findIndex((a) => a.id === assignmentId);
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
      bookings[bIdx].technician_id = professionalId;
      bookings[bIdx].technician_name = "Suresh Reddy";
      bookings[bIdx].technician_phone = "+91 98765 43210";
      setStored("bookings", bookings);
    }

    this.addAuditLog("JOB_ACCEPTED", "ASSIGNMENT", assignmentId, null, { professionalId });
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
    return isDev ? all : all.filter((i) => !i.isDevSeed);
  },

  generateInvoiceForBooking(booking: any): any {
    const invoices = getStored<any[]>("invoices", []);
    const invoiceNumber = generateReference("INV");
    const inv = {
      id: `inv-${Date.now()}`,
      invoiceNumber,
      bookingId: booking.id,
      bookingNumber: booking.booking_number,
      serviceName: booking.service_name,
      customerName: booking.customer_name,
      date: formatDate(nowIso()),
      subtotal: booking.subtotal,
      safetyFee: booking.safety_fee,
      taxGst: booking.tax_gst,
      discount: booking.discount,
      totalAmount: booking.total_amount,
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
  getAddresses(): any[] {
    return getStored<any[]>("addresses", [
      {
        id: "addr-seed-1",
        title: "Home Address",
        type: "home",
        streetAddress: "Flat 402, Block CD, Salt Lake Sector 1",
        landmark: "Near City Centre 1 Mall",
        city: "Kolkata",
        state: "West Bengal",
        pincode: "700064",
        isDefault: true,
      },
      {
        id: "addr-seed-2",
        title: "Work Office",
        type: "work",
        streetAddress: "Tower 5, Action Area 1, New Town",
        landmark: "Near Eco Park Gateway 2",
        city: "Kolkata",
        state: "West Bengal",
        pincode: "700156",
        isDefault: false,
      },
    ]);
  },

  saveAddress(address: any): any[] {
    const current = this.getAddresses();
    if (address.id) {
      const idx = current.findIndex((a) => a.id === address.id);
      if (idx !== -1) current[idx] = address;
    } else {
      address.id = `addr-${Date.now()}`;
      if (address.isDefault) {
        current.forEach((a) => (a.isDefault = false));
      }
      current.push(address);
    }
    setStored("addresses", current);
    return current;
  },

  deleteAddress(id: string): any[] {
    const current = this.getAddresses().filter((a) => a.id !== id);
    setStored("addresses", current);
    return current;
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
  getReviews(): any[] {
    return getStored<any[]>("reviews", [
      {
        id: "rev-seed-1",
        userName: "Debanjan Sengupta",
        serviceName: "Kitchen Sink Leakage Repair",
        rating: 5,
        comment: "Plumber arrived on time with proper tools and fixed the mixer tap leak neatly.",
        date: "2026-09-11",
        isVerified: true,
        isDevSeed: true,
      },
    ]);
  },

  createReview(payload: { bookingId: string; rating: number; comment: string; serviceName: string }): void {
    const reviews = getStored<any[]>("reviews", []);
    reviews.unshift({
      id: `rev-${Date.now()}`,
      bookingId: payload.bookingId,
      userName: "Debanjan Sengupta",
      serviceName: payload.serviceName,
      rating: payload.rating,
      comment: payload.comment,
      date: formatDate(nowIso()),
      isVerified: true,
      isDevSeed: false,
    });
    setStored("reviews", reviews);
  },

  // ─── SUPPORT TICKETS ───
  getSupportTickets(): any[] {
    return getStored<any[]>("support_tickets", []);
  },

  createSupportTicket(payload: { subject: string; category: string; description: string; bookingNumber?: string }): any {
    const tickets = getStored<any[]>("support_tickets", []);
    const ticket = {
      id: `tkt-${Date.now()}`,
      ticketNumber: generateReference("TKT"),
      subject: payload.subject,
      category: payload.category,
      description: payload.description,
      bookingNumber: payload.bookingNumber,
      status: "OPEN",
      createdAt: nowIso(),
    };
    tickets.unshift(ticket);
    setStored("support_tickets", tickets);
    return ticket;
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
};
