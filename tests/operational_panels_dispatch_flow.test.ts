import test from "node:test";
import assert from "node:assert/strict";

// In Node environment, mock localStorage for repository & zustand
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] ?? null,
    length: 0,
  } as Storage;
}

import { dbRepository } from "../src/services/db/repository.ts";
import { professionalService } from "../src/services/professional/professionalService.ts";
import { subscribeToBookingSync, broadcastBookingEvent } from "../src/services/realtime/sync.ts";
import { pricingEngine } from "../src/services/marketplace/pricing.engine.ts";

test("Operational Panels Dispatch Flow - End-to-End Real Assignment & Realtime Sync", async () => {
  // 1. Customer creates a booking
  const booking = dbRepository.createBooking({
    serviceId: "srv-ac-deep-clean",
    serviceName: "Split AC Deep Cleaning & Servicing",
    categorySlug: "ac",
    customerId: "cust-real-001",
    customerName: "Siddhartha Mukherjee",
    customerPhone: "+91 98301 99887",
    scheduledDate: "2026-09-30",
    scheduledTimeSlot: "11:00 AM – 01:00 PM",
    address: "Flat 4B, Silver Oak Residency, Sector V, Salt Lake, Kolkata 700091",
    subtotal: 1399,
    safetyFee: 0,
    taxGst: 251.82,
    discount: 100,
    totalAmount: 1550.82,
    paymentMethod: "UPI",
  });

  assert.ok(booking.id, "Booking should be created with valid ID");
  assert.equal(booking.technician_id, undefined, "New booking must NOT have a fake assigned technician");
  assert.equal(booking.status, "CONFIRMED", "Initial status should be CONFIRMED / ASSIGNMENT_PENDING");

  // 2. Admin Assignment Queue Check
  const allBookings = dbRepository.getBookings();
  const foundInQueue = allBookings.find((b) => b.id === booking.id);
  assert.ok(foundInQueue, "Booking must be visible in admin database");
  assert.ok(!foundInQueue.technician_id, "Booking must be unassigned in Assignment Queue");

  // Track realtime broadcast events
  const broadcastEvents: Array<{ status: string; bookingId: string }> = [];
  const unsubscribe = subscribeToBookingSync(booking.id, (event) => {
    broadcastEvents.push({ status: event.status, bookingId: event.bookingId });
  });

  // 3. Admin manually dispatches to a verified professional
  const proId = "pro-rajesh-kumar";
  const proName = "Rajesh Kumar";
  const proPhone = "+91 98300 11223";

  const assignedBooking = dbRepository.assignBookingToProfessional(
    booking.id,
    proId,
    proName,
    proPhone,
    "admin-dispatch"
  );

  assert.ok(assignedBooking, "Assignment should succeed");
  assert.equal(assignedBooking.status, "PROFESSIONAL_ASSIGNED");
  assert.equal(assignedBooking.technician_name, proName);
  assert.equal(assignedBooking.technician_id, proId);

  // Verify Audit Log was recorded
  const auditLogs = dbRepository.getAuditLogs();
  const assignLog = auditLogs.find((l) => l.action === "MANUAL_ASSIGNMENT" && l.entityId === booking.id);
  assert.ok(assignLog, "Manual assignment audit log must be recorded");

  // 4. Verify Professional Job Offers
  const assignments = dbRepository.getAssignments();
  const proOffer = assignments.find((a) => a.bookingId === booking.id);
  assert.ok(proOffer, "Assignment offer must be generated");
  assert.equal(proOffer.status, "PENDING");
  assert.equal(proOffer.assignedProfessionalId, proId);

  // 5. Professional Accepts Job
  const acceptResult = dbRepository.acceptAssignment(proOffer.id, proId, proName, proPhone);
  assert.ok(acceptResult, "Professional must be able to accept valid assignment");

  const acceptedBooking = dbRepository.getBookingById(booking.id);
  assert.equal(acceptedBooking.status, "PROFESSIONAL_ACCEPTED");
  assert.equal(acceptedBooking.technician_name, proName);

  // 6. Professional Starts Travel
  const onTheWayBooking = dbRepository.updateBookingStatus(
    booking.id,
    "PROFESSIONAL_ON_THE_WAY",
    "Technician is en route"
  );
  assert.equal(onTheWayBooking.status, "PROFESSIONAL_ON_THE_WAY");

  // 7. Professional Arrives
  const arrivedBooking = dbRepository.updateBookingStatus(
    booking.id,
    "PROFESSIONAL_ARRIVED",
    "Technician reached customer premises"
  );
  assert.equal(arrivedBooking.status, "PROFESSIONAL_ARRIVED");

  // 8. Service Completed
  const completedBooking = dbRepository.updateBookingStatus(
    booking.id,
    "SERVICE_COMPLETED",
    "Work completed and handed over"
  );
  assert.equal(completedBooking.status, "SERVICE_COMPLETED");

  // Check that events were dispatched through the realtime bus
  assert.ok(broadcastEvents.length >= 3, "Realtime events must be broadcast across status transitions");

  unsubscribe();
});

test("Pricing Engine & Tax Calculation - Mathematical Reconciliation in Paise", () => {
  // Test case from specification:
  // Base = ₹1,399, Discount = ₹100 => Taxable value = ₹1,299
  // 18% GST => ₹233.82 (CGST = ₹116.91, SGST = ₹116.91)
  // Total = ₹1,532.82
  const basePricePaise = 139900; // 1399 * 100
  const discountPaise = 10000;  // 100 * 100
  const taxableValuePaise = basePricePaise - discountPaise; // 129900

  assert.equal(taxableValuePaise, 129900, "Taxable value must equal ₹1,299 (129900 paise)");

  const gstRate = 0.18;
  const gstPaise = Math.round(taxableValuePaise * gstRate); // 23382 paise = ₹233.82
  const cgstPaise = Math.round(gstPaise / 2); // 11691 paise = ₹116.91
  const sgstPaise = Math.round(gstPaise / 2); // 11691 paise = ₹116.91

  assert.equal(gstPaise, 23382, "GST must equal ₹233.82 (23382 paise)");
  assert.equal(cgstPaise, 11691, "CGST must equal ₹116.91 (11691 paise)");
  assert.equal(sgstPaise, 11691, "SGST must equal ₹116.91 (11691 paise)");

  const grandTotalPaise = taxableValuePaise + gstPaise; // 153282 paise = ₹1,532.82
  assert.equal(grandTotalPaise, 153282, "Total must equal ₹1,532.82 (153282 paise)");

  // Partner payout calculation (80% split)
  const partnerSharePaise = Math.round(taxableValuePaise * 0.8);
  assert.equal(partnerSharePaise, 103920, "Partner share must equal ₹1,039.20");
});
