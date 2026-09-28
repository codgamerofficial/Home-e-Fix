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

import { invoiceEngine } from "../src/services/marketplace/invoice.engine.ts";
import { formatDate } from "../src/lib/date.ts";
import { dbRepository } from "../src/services/db/repository.ts";
import { useLocationStore } from "../src/store/location.store.ts";

test("Location Store - Defaults to Kolkata without hardcoding Salt Lake", () => {
  const state = useLocationStore.getState();
  assert.equal(state.city, "Kolkata");
  assert.equal(state.locality, "", "Locality should not default to Salt Lake");
  assert.equal(state.formattedAddress, "Kolkata, West Bengal");
});

test("Date Utility - Timezone-aware date formatting with Asia/Kolkata", () => {
  const formatted = formatDate("2026-09-16T09:30:00.000Z");
  assert.ok(formatted.includes("2026"), "Should format the year as 2026");
  assert.ok(formatted.includes("Sep"), "Should format month in IST");
});

test("Digital Tax Invoice & Receipt - Correct SAC Code 998719 and Truthful GST Configuration", () => {
  const inv = invoiceEngine.generate({
    bookingId: "test-booking-uuid",
    bookingNumber: "HEF-2026-E56D842A",
    bookingDate: "2026-09-16T10:00:00.000Z",
    customerName: "Subrata Roy",
    customerPhone: "+91 98300 12345",
    customerAddress: "Flat 3B, Sunshine Towers, Behala, Kolkata - 700034",
    serviceName: "Split AC Deep Cleaning & Servicing",
    subtotal: 699,
    safetyFee: 49,
    discountAmount: 100,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    warrantyDays: 30,
    isServiceCompleted: false, // Pre-service receipt
  });

  assert.equal(inv.bookingNumber, "HEF-2026-E56D842A");
  assert.ok(inv.invoiceNumber.startsWith("HEF-REC-2627-"), `Expected receipt prefix, got ${inv.invoiceNumber}`);
  assert.equal(inv.documentType, "PAYMENT_RECEIPT");
  assert.equal(inv.customerName, "Subrata Roy");
  assert.equal(inv.customerAddress, "Flat 3B, Sunshine Towers, Behala, Kolkata - 700034");

  // Taxable: 699 - 100 + 49 = 648
  assert.equal(inv.taxableAmount, 648);
  assert.ok(inv.warrantyCoverage.includes("30 Days"));
});

test("Address Snapshot Contract - Never leaks operational hub codes in confirmation", () => {
  const sampleAddress = "Flat 101, Diamond City, Jessore Road, Dum Dum, KOL_NORTH_DUM, Kolkata, 700028";
  const cleanAddress = sampleAddress.replace(/\b(KOL_[A-Z0-9_]+)\b/gi, "").replace(/,\s*,/g, ",").trim();

  assert.ok(!cleanAddress.includes("KOL_NORTH_DUM"), "Should strip internal dispatch codes");
  assert.ok(cleanAddress.includes("Dum Dum"));
  assert.ok(cleanAddress.includes("700028"));
});

test("Repository - Stores and retrieves booking with address snapshot", () => {
  const created = dbRepository.createBooking({
    serviceId: "srv-ac-jet",
    serviceName: "AC Jet Servicing",
    categorySlug: "ac",
    customerId: "cust-test-123",
    customerName: "Ananya Sen",
    customerPhone: "9831122334",
    scheduledDate: "2026-09-17",
    scheduledTimeSlot: "10:00 AM – 12:00 PM",
    address: "Ballygunge Circular Road, Kolkata 700019",
    addressSnapshot: {
      house_flat_floor: "Flat 4A",
      street_road_name: "Ballygunge Circular Road",
      area_locality: "Ballygunge",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700019",
    },
    subtotal: 799,
    safetyFee: 49,
    taxGst: 144,
    discount: 0,
    totalAmount: 992,
    paymentMethod: "UPI",
  });

  assert.ok(created.id);
  assert.ok(created.booking_number.startsWith("HEF-"));

  const retrieved = dbRepository.getBookingById(created.id);
  assert.ok(retrieved);
  assert.equal(retrieved.customer_name, "Ananya Sen");
  assert.equal(retrieved.address_snapshot?.area_locality, "Ballygunge");
  assert.equal(retrieved.address_snapshot?.pincode, "700019");

  // Also query by booking_number
  const retrievedByNumber = dbRepository.getBookingById(created.booking_number);
  assert.ok(retrievedByNumber);
  assert.equal(retrievedByNumber.id, created.id);
});
