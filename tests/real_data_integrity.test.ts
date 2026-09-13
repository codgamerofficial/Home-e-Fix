import test from "node:test";
import assert from "node:assert/strict";

// In Node environment, mock localStorage for repository
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

import { dbRepository } from "../src/services/db/repository";
import { dataIntegrityService } from "../src/services/marketplace/dataIntegrity.service";

test("Real Data Integrity - Truthful Zero Default (No Fake Data)", () => {
  // Clear any existing stored data
  localStorage.clear();
  dbRepository.setDevSeedEnabled(false);

  // Assert empty truthful states
  const bookings = dbRepository.getBookings();
  assert.equal(bookings.length, 0, "Bookings must be 0 when no records created");

  const customers = dbRepository.getCustomers();
  assert.equal(customers.length, 0, "Customers must be 0 without real bookings");

  const addresses = dbRepository.getAddresses("usr-new-random");
  assert.equal(addresses.length, 0, "Addresses must be empty for new user");

  const payouts = dbRepository.getPayouts();
  assert.equal(payouts.length, 0, "Payouts must be empty without real requests");

  const refunds = dbRepository.getRefunds();
  assert.equal(refunds.length, 0, "Refunds must be empty without real cancellations");
});

test("Real Data Integrity - User Address Scoping & Isolation", () => {
  localStorage.clear();
  dbRepository.setDevSeedEnabled(false);

  const userA = "usr-kolkata-alice";
  const userB = "usr-kolkata-bob";

  // Save address for Alice
  const addrA = dbRepository.saveAddress({
    label: "Home",
    street: "Flat 4B, Salt Lake Sector 2",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700091",
    isDefault: true,
  }, userA);

  assert.equal(addrA.userId, userA);

  // Alice sees 1 address
  const aliceAddresses = dbRepository.getAddresses(userA);
  assert.equal(aliceAddresses.length, 1);
  assert.equal(aliceAddresses[0].street, "Flat 4B, Salt Lake Sector 2");

  // Bob sees 0 addresses (Strict Isolation)
  const bobAddresses = dbRepository.getAddresses(userB);
  assert.equal(bobAddresses.length, 0, "Bob must not see Alice's address");
});

test("Real Data Integrity - End-to-End Real Transaction Lifecycle", () => {
  localStorage.clear();
  dbRepository.setDevSeedEnabled(false);

  const customerId = "usr-real-test-99";
  const customerName = "Arindam Mukherjee";
  const customerPhone = "+91 98310 99999";

  // 1. Create Address
  const address = dbRepository.saveAddress({
    label: "Residence",
    street: "Block CD, Sector 1, Salt Lake",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700064",
    isDefault: true,
  }, customerId);

  // 2. Create Real Booking with crypto-secure OTP
  const booking = dbRepository.createBooking({
    customerId,
    customerName,
    customerPhone,
    customerEmail: "arindam@example.com",
    serviceId: "srv-ac-jet-clean",
    serviceName: "Split AC Foam Jet Wash",
    categorySlug: "ac",
    address: {
      street: address.street,
      city: address.city,
      pincode: address.pincode,
    },
    scheduledDate: "2026-09-18",
    scheduledTimeSlot: "Morning (09:00 AM - 12:00 PM)",
    subtotal: 799,
    safetyFee: 0,
    taxGst: 144,
    discount: 0,
    totalAmount: 943,
    paymentMethod: "ONLINE",
  });

  assert.ok(booking.id, "Booking ID must be generated");
  assert.match(booking.booking_number, /^HEF-\d{4}-[A-F0-9]{8}$/, "Booking number must match cryptographic pattern");
  assert.match(booking.start_otp, /^\d{4}$/, "Start OTP must be 4 digits");
  assert.notEqual(booking.start_otp, "4892", "Start OTP must not be static mock 4892");

  // 3. Assign Specialist Dynamically
  const assigned = dbRepository.acceptAssignment(
    booking.id,
    "pro-kol-specialist-1",
    "Sayan Sengupta",
    "+91 98301 22222"
  );
  assert.equal(assigned.assigned_technician_name, "Sayan Sengupta");
  assert.equal(assigned.assigned_technician_id, "pro-kol-specialist-1");

  // 4. Advance through real service stages
  dbRepository.updateBookingStatus(booking.id, "PROFESSIONAL_ON_THE_WAY");
  let updated = dbRepository.getBookingById(booking.id);
  assert.equal(updated?.status, "PROFESSIONAL_ON_THE_WAY");

  dbRepository.updateBookingStatus(booking.id, "PROFESSIONAL_ARRIVED");
  updated = dbRepository.getBookingById(booking.id);
  assert.equal(updated?.status, "PROFESSIONAL_ARRIVED");

  dbRepository.updateBookingStatus(booking.id, "SERVICE_STARTED");
  updated = dbRepository.getBookingById(booking.id);
  assert.equal(updated?.status, "SERVICE_STARTED");

  // 5. Complete Service
  dbRepository.updateBookingStatus(booking.id, "COMPLETED");
  updated = dbRepository.getBookingById(booking.id);
  assert.equal(updated?.status, "COMPLETED");

  // 6. Verify Digital Invoice Generation
  const customerInvoices = dbRepository.getInvoices(customerId);
  assert.equal(customerInvoices.length, 1, "Must generate exactly 1 invoice for completed booking");
  assert.equal(customerInvoices[0].booking_id, booking.id);
  assert.equal(customerInvoices[0].total_amount, 943);

  // 7. Verify Review Submission
  const review = dbRepository.createReview({
    bookingId: booking.id,
    customerId,
    serviceId: "srv-ac-jet-clean",
    serviceName: "Split AC Foam Jet Wash",
    userName: customerName,
    rating: 5,
    comment: "Flawless servicing by Sayan. Jet wash completely cleared internal blower dirt.",
  });
  assert.equal(review.bookingId, booking.id);
  assert.equal(review.userName, customerName);

  const reviews = dbRepository.getReviews("srv-ac-jet-clean");
  assert.equal(reviews.length, 1);
  assert.equal(reviews[0].rating, 5);
});

test("Real Data Integrity - 12-Point Automated Health Matrix", () => {
  // Run all 12 checks against current repository state
  const report = dataIntegrityService.runAllChecks();

  assert.equal(report.totalChecks, 12, "Must evaluate all 12 platform health checks");
  assert.ok(report.overallHealthScore >= 90, `Health score should be >= 90% (got ${report.overallHealthScore}%)`);
  assert.equal(report.failedChecks, 0, "No data discrepancies or integrity violations should exist");

  // Check specific crucial checks
  const orphanCheck = report.items.find((c) => c.id === "orphan-bookings");
  assert.equal(orphanCheck?.status, "PASS");

  const addressCheck = report.items.find((c) => c.id === "orphan-addresses");
  assert.equal(addressCheck?.status, "PASS");

  const invoiceCheck = report.items.find((c) => c.id === "invoice-booking-link");
  assert.equal(invoiceCheck?.status, "PASS");

  const reviewCheck = report.items.find((c) => c.id === "review-integrity");
  assert.equal(reviewCheck?.status, "PASS");

  const pricingCheck = report.items.find((c) => c.id === "pricing-integer-arithmetic");
  assert.equal(pricingCheck?.status, "PASS");
});
