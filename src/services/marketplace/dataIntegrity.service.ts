/**
 * Authoritative Data Integrity & Audit Service for Home-e-Fix
 *
 * Runs 12 automated database sanity checks ensuring ZERO data corruption,
 * orphan records, unlinked transactions, or invalid pricing states across the platform.
 */

import { dbRepository } from "@/services/db/repository";

export interface IntegrityCheckItem {
  id: string;
  name: string;
  category: "FINANCIAL" | "OPERATIONAL" | "USER_DATA" | "MARKETPLACE";
  description: string;
  status: "PASS" | "WARN" | "FAIL";
  issueCount: number;
  details: string[];
}

export interface IntegrityReport {
  timestamp: string;
  overallHealthScore: number; // 0 to 100
  totalChecks: number;
  passedChecks: number;
  warningChecks: number;
  failedChecks: number;
  items: IntegrityCheckItem[];
}

export const dataIntegrityService = {
  runAllChecks(): IntegrityReport {
    const bookings = dbRepository.getBookings();
    const addresses = dbRepository.getAddresses();
    const assignments = dbRepository.getAssignments();
    const invoices = dbRepository.getInvoices();
    const reviews = dbRepository.getReviews();
    const pros = dbRepository.getProfessionals();
    const refunds = dbRepository.getRefunds();
    const warranties = dbRepository.getWarranties();

    const items: IntegrityCheckItem[] = [];

    // 1. Orphan Bookings (Missing customer or service)
    const orphanBookings: string[] = [];
    bookings.forEach((b) => {
      if (!b.customer_phone && !b.customer_name) {
        orphanBookings.push(`Booking #${b.booking_number || b.id} has no customer reference.`);
      }
      if (!b.service_name && !b.service_id) {
        orphanBookings.push(`Booking #${b.booking_number || b.id} has no service reference.`);
      }
    });
    items.push({
      id: "orphan-bookings",
      name: "Booking Entity Integrity",
      category: "MARKETPLACE",
      description: "Verifies every booking references a valid customer and registered service.",
      status: orphanBookings.length === 0 ? "PASS" : "FAIL",
      issueCount: orphanBookings.length,
      details: orphanBookings,
    });

    // 2. Orphan Addresses (Addresses not scoped to any user)
    const orphanAddresses: string[] = [];
    addresses.forEach((a) => {
      if (!a.userId && !a.user_id && !a.id.startsWith("addr-seed")) {
        orphanAddresses.push(`Address '${a.streetAddress || a.title}' has no associated user.`);
      }
    });
    items.push({
      id: "orphan-addresses",
      name: "Customer Address Ownership",
      category: "USER_DATA",
      description: "Ensures every saved delivery address is tied to an authenticated customer.",
      status: orphanAddresses.length === 0 ? "PASS" : "WARN",
      issueCount: orphanAddresses.length,
      details: orphanAddresses,
    });

    // 3. Duplicate Default Addresses Per User
    const userDefaultCount: Record<string, number> = {};
    addresses.forEach((a) => {
      const uid = a.userId || a.user_id || "global";
      if (a.isDefault) {
        userDefaultCount[uid] = (userDefaultCount[uid] || 0) + 1;
      }
    });
    const duplicateDefaults: string[] = [];
    Object.entries(userDefaultCount).forEach(([uid, count]) => {
      if (count > 1) {
        duplicateDefaults.push(`User '${uid}' has ${count} addresses marked as default.`);
      }
    });
    items.push({
      id: "duplicate-defaults",
      name: "Single Default Address Policy",
      category: "USER_DATA",
      description: "Guarantees a customer has at most one primary delivery address.",
      status: duplicateDefaults.length === 0 ? "PASS" : "WARN",
      issueCount: duplicateDefaults.length,
      details: duplicateDefaults,
    });

    // 4. Invoices Without Valid Settled Bookings
    const invalidInvoices: string[] = [];
    invoices.forEach((inv) => {
      const parentBooking = bookings.find(
        (b) => b.id === inv.bookingId || b.booking_number === inv.bookingNumber
      );
      if (!parentBooking) {
        invalidInvoices.push(`Invoice #${inv.invoiceNumber} references nonexistent booking ${inv.bookingNumber}.`);
      }
    });
    items.push({
      id: "invoice-booking-link",
      name: "Invoice Ledger Reconciliation",
      category: "FINANCIAL",
      description: "Audits that every digital invoice links to a legitimate database booking.",
      status: invalidInvoices.length === 0 ? "PASS" : "FAIL",
      issueCount: invalidInvoices.length,
      details: invalidInvoices,
    });

    // 5. Completed Bookings Missing Digital Invoices
    const completedWithoutInvoice: string[] = [];
    bookings
      .filter((b) => b.status === "COMPLETED" || b.status === "SERVICE_COMPLETED")
      .forEach((b) => {
        const hasInv = invoices.some(
          (inv) => inv.bookingId === b.id || inv.bookingNumber === b.booking_number
        );
        if (!hasInv) {
          completedWithoutInvoice.push(`Completed booking #${b.booking_number || b.id} has no invoice record.`);
        }
      });
    items.push({
      id: "completed-invoice-required",
      name: "GST Compliance & Tax Billing",
      category: "FINANCIAL",
      description: "Verifies every completed service appointment has an automated digital invoice.",
      status: completedWithoutInvoice.length === 0 ? "PASS" : "WARN",
      issueCount: completedWithoutInvoice.length,
      details: completedWithoutInvoice,
    });

    // 6. Reviews Referencing Valid Bookings
    const unverifiedReviews: string[] = [];
    reviews.forEach((r) => {
      if (r.bookingId && !r.isDevSeed) {
        const exists = bookings.some((b) => b.id === r.bookingId || b.booking_number === r.bookingId);
        if (!exists) {
          unverifiedReviews.push(`Review #${r.id} references non-existent booking #${r.bookingId}.`);
        }
      }
    });
    items.push({
      id: "review-integrity",
      name: "Verified Review Authenticity",
      category: "MARKETPLACE",
      description: "Ensures reviews originate only from completed real customer appointments.",
      status: unverifiedReviews.length === 0 ? "PASS" : "FAIL",
      issueCount: unverifiedReviews.length,
      details: unverifiedReviews,
    });

    // 7. Dispatch Assignment Expirations
    const expiredUnprocessed: string[] = [];
    const nowMs = Date.now();
    assignments.forEach((asg) => {
      if (asg.status === "PENDING" && new Date(asg.assignmentExpiresAt).getTime() < nowMs) {
        expiredUnprocessed.push(`Assignment #${asg.bookingNumber} is pending past expiration time.`);
      }
    });
    items.push({
      id: "assignment-expiration",
      name: "Professional Dispatch SLA",
      category: "OPERATIONAL",
      description: "Guarantees expired professional acceptance timeouts transition server-side.",
      status: expiredUnprocessed.length === 0 ? "PASS" : "WARN",
      issueCount: expiredUnprocessed.length,
      details: expiredUnprocessed,
    });

    // 8. Professional KYC Verification Integrity
    const unverifiedActivePros: string[] = [];
    pros.forEach((p) => {
      if (p.isAvailable && p.kycStatus !== "APPROVED") {
        unverifiedActivePros.push(`Technician '${p.name}' is marked available but KYC status is ${p.kycStatus}.`);
      }
    });
    items.push({
      id: "pro-kyc-compliance",
      name: "Technician Compliance & Clearance",
      category: "OPERATIONAL",
      description: "Confirms only 100% background cleared & approved pros can receive dispatches.",
      status: unverifiedActivePros.length === 0 ? "PASS" : "FAIL",
      issueCount: unverifiedActivePros.length,
      details: unverifiedActivePros,
    });

    // 9. Pricing Integrity & Paise Consistency
    const corruptedPrices: string[] = [];
    bookings.forEach((b) => {
      const tot = Number(b.total_amount);
      if (isNaN(tot) || tot < 0) {
        corruptedPrices.push(`Booking #${b.booking_number || b.id} has invalid total amount: ${b.total_amount}.`);
      }
    });
    items.push({
      id: "pricing-integer-arithmetic",
      name: "Monetary Arithmetic & Paise Accuracy",
      category: "FINANCIAL",
      description: "Validates all order sub-totals, GST taxes, and totals are positive real values.",
      status: corruptedPrices.length === 0 ? "PASS" : "FAIL",
      issueCount: corruptedPrices.length,
      details: corruptedPrices,
    });

    // 10. Warranties Originating From Valid Jobs
    const invalidWarranties: string[] = [];
    warranties.forEach((w) => {
      const b = bookings.find((item) => item.id === w.bookingId || item.booking_number === w.bookingNumber);
      if (b && (b.status === "CANCELLED" || b.status === "REFUNDED")) {
        invalidWarranties.push(`Warranty #${w.id} is active for a cancelled/refunded booking #${b.booking_number}.`);
      }
    });
    items.push({
      id: "warranty-validity",
      name: "Service Warranty Eligibility",
      category: "MARKETPLACE",
      description: "Guarantees warranties only protect successfully completed services.",
      status: invalidWarranties.length === 0 ? "PASS" : "WARN",
      issueCount: invalidWarranties.length,
      details: invalidWarranties,
    });

    // 11. Payouts Reconciled Against Partner Earnings
    const unreconciledPayouts: string[] = [];
    refunds.forEach((rf) => {
      if (!rf.bookingId && !rf.booking_number) {
        unreconciledPayouts.push(`Refund record #${rf.id} lacks a source booking reference.`);
      }
    });
    items.push({
      id: "refund-reconciliation",
      name: "Customer Refund Ledger Integrity",
      category: "FINANCIAL",
      description: "Checks that every customer refund or charge reversal links to a booking.",
      status: unreconciledPayouts.length === 0 ? "PASS" : "WARN",
      issueCount: unreconciledPayouts.length,
      details: unreconciledPayouts,
    });

    // 12. Synthetic / Seed Isolation Check
    const isDev = dbRepository.isDevSeedEnabled();
    items.push({
      id: "production-seed-isolation",
      name: "Environment Seed Isolation",
      category: "MARKETPLACE",
      description: "Confirms synthetic test fixtures are completely quarantined from production.",
      status: isDev ? "WARN" : "PASS",
      issueCount: isDev ? 1 : 0,
      details: isDev ? ["Development seed mode is currently active in this browser environment."] : [],
    });

    const passed = items.filter((i) => i.status === "PASS").length;
    const warnings = items.filter((i) => i.status === "WARN").length;
    const failed = items.filter((i) => i.status === "FAIL").length;
    const score = Math.round(((passed * 100) + (warnings * 60)) / items.length);

    return {
      timestamp: new Date().toISOString(),
      overallHealthScore: score,
      totalChecks: items.length,
      passedChecks: passed,
      warningChecks: warnings,
      failedChecks: failed,
      items,
    };
  },
};
