import { test } from "node:test";
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

import { pricingEngine, toPaise, fromPaise, createCommercialPricingSnapshot } from "../src/services/marketplace/pricing.engine";
import { invoiceEngine, getFinancialYearCode } from "../src/services/marketplace/invoice.engine";
import { resolveTaxSplitPolicy, resolveDocumentType, BUSINESS_TAX_CONFIG } from "../src/config/tax.config";
import { buildAuthoritativeTimeline, BOOKING_STATUS_PRESENTATION } from "../src/services/marketplace/status.engine";
import { calculateHaversineKm } from "../src/services/tracking/routes.engine";
import { dbRepository } from "../src/services/db/repository";

test("SCREEN 1 RECONCILIATION - 4-Wheeler EV Charger Installation Math", () => {
  // Service package: ₹1,399
  // Discount: -₹100
  // Applicable Tax: 18% GST (Intra-state West Bengal)
  const result = pricingEngine.calculate({
    items: [
      {
        serviceId: "srv-ev-charger-4w",
        serviceName: "4-Wheeler EV Charger Installation",
        basePrice: 1399,
        quantity: 1,
      },
    ],
    basePrice: 1399,
    quantity: 1,
    couponCode: "FIRSTFIX100", // Flat ₹100 discount
    placeOfSupplyState: "West Bengal",
  });

  // 1. Assert Taxable Value = Base Price (₹1,399) - Discount (₹100) = ₹1,299
  assert.equal(result.baseAmount, 1399, "Base package price must be ₹1,399");
  assert.equal(result.discountCoupon, 100, "Coupon discount must be ₹100");
  assert.equal(result.taxableAmount, 1299, "Taxable amount must be base - discount = ₹1,299");
  assert.equal(result.taxableAmountPaise, 129900, "Integer paise for taxable amount must be exactly 129900");

  // 2. Assert 18% GST calculation on ₹1,299:
  // Tax = 1299 * 0.18 = 233.82 (23382 paise)
  assert.equal(result.taxGst, 233.82, "Total GST must be ₹233.82");
  assert.equal(result.taxGstPaise, 23382, "Total GST in paise must be 23382");

  // 3. Intra-state split: CGST 9% (₹116.91) + SGST 9% (₹116.91)
  assert.equal(result.supplyType, "INTRA_STATE", "West Bengal customer supply must be INTRA_STATE");
  assert.equal(result.cgstAmount, 116.91, "CGST 9% must be ₹116.91");
  assert.equal(result.cgstPaise, 11691, "CGST in paise must be 11691");
  assert.equal(result.sgstAmount, 116.91, "SGST 9% must be ₹116.91");
  assert.equal(result.sgstPaise, 11691, "SGST in paise must be 11691");
  assert.equal(result.igstAmount, 0, "IGST must be 0 for intra-state supply");

  // 4. Grand Total = Taxable Value (₹1,299) + GST (₹233.82) = ₹1,532.82
  assert.equal(result.totalPayableInr, 1532.82, "Total invoice payable must be ₹1,532.82");
  assert.equal(result.totalPayablePaise, 153282, "Total invoice payable in paise must be 153282");

  // 5. Total reconciliation: CGST + SGST === Total Tax
  assert.equal(
    result.cgstPaise + result.sgstPaise,
    result.taxGstPaise,
    "CGST paise + SGST paise must exactly equal total tax paise"
  );

  // 6. Total reconciliation: Taxable Value + Tax === Grand Total
  assert.equal(
    result.taxableAmountPaise + result.taxGstPaise,
    result.totalPayablePaise,
    "Taxable paise + Tax paise must exactly equal Grand Total paise"
  );

  // 7. Verify the old erroneous total of ₹1,651 is completely gone
  assert.notEqual(result.totalPayableInr, 1651, "Erroneous unreconciled ₹1,651 is eradicated");
});

test("TAX JURISDICTION - Intra-state vs Inter-state Determination", () => {
  // Intra-state (West Bengal supplier -> West Bengal customer) with registration override
  const intra = resolveTaxSplitPolicy("West Bengal", 18, true);
  assert.equal(intra.isGstApplicable, true);
  assert.equal(intra.supplyType, "INTRA_STATE");
  assert.equal(intra.cgstRatePercent, 9);
  assert.equal(intra.sgstRatePercent, 9);
  assert.equal(intra.igstRatePercent, 0);

  // Inter-state (West Bengal supplier -> Odisha customer) with registration override
  const inter = resolveTaxSplitPolicy("Odisha", 18, true);
  assert.equal(inter.isGstApplicable, true);
  assert.equal(inter.supplyType, "INTER_STATE");
  assert.equal(inter.cgstRatePercent, 0);
  assert.equal(inter.sgstRatePercent, 0);
  assert.equal(inter.igstRatePercent, 18);

  const interPricing = pricingEngine.calculate({
    items: [{ serviceId: "srv-1", basePrice: 1000, quantity: 1 }],
    basePrice: 1000,
    quantity: 1,
    placeOfSupplyState: "Odisha",
  });
  assert.equal(interPricing.cgstAmount, 0);
  assert.equal(interPricing.sgstAmount, 0);
  assert.equal(interPricing.igstAmount, 180);
  assert.equal(interPricing.totalPayableInr, 1180);
});

test("PRICE SNAPSHOT IMMUTABILITY - Historical Price Changes Do Not Alter Old Invoices", () => {
  // Customer books at ₹1,399 with ₹100 discount
  const originalPricing = pricingEngine.calculate({
    items: [{ serviceId: "srv-ev", basePrice: 1399, quantity: 1 }],
    basePrice: 1399,
    quantity: 1,
    couponCode: "FIRSTFIX100",
  });

  const snapshot = createCommercialPricingSnapshot(originalPricing, {
    serviceId: "srv-ev",
    serviceName: "4-Wheeler EV Charger Installation",
  });

  // Verify frozen snapshot
  assert.equal(snapshot.basePrice, 1399);
  assert.equal(snapshot.taxableValue, 1299);
  assert.equal(snapshot.grandTotal, 1532.82);

  // Later, company raises package price to ₹1,599
  const updatedCataloguePrice = 1599;
  assert.notEqual(updatedCataloguePrice, snapshot.basePrice);

  // Generating invoice using the frozen snapshot must preserve ₹1,532.82
  const invoice = invoiceEngine.generate({
    bookingId: "b-ev-charger-1",
    bookingNumber: "HEF-2026-CFBS97",
    bookingDate: "2026-09-28",
    customerName: "Bongo Moy",
    customerAddress: "Sector V, Salt Lake, Kolkata",
    serviceName: "4-Wheeler EV Charger Installation",
    subtotal: updatedCataloguePrice, // New catalogue price passed in runtime
    pricingSnapshot: snapshot, // Authoritative frozen snapshot
    paymentMethod: "WALLET",
    paymentStatus: "PAID",
    warrantyDays: 30,
    isServiceCompleted: true,
  });

  assert.equal(invoice.subtotal, 1399, "Invoice must honor snapshot base price (₹1,399), not updated catalogue (₹1,599)");
  assert.equal(invoice.taxableAmount, 1299, "Invoice taxable amount must remain ₹1,299");
  assert.equal(invoice.totalAmount, 1532.82, "Invoice total must remain ₹1,532.82");
});

test("INVOICE VS BOOKING RECEIPT - Document Classification & No Fake GSTIN", () => {
  // Pre-service completed booking receipt
  const preServiceDoc = resolveDocumentType(false, true);
  assert.equal(preServiceDoc.documentType, "PAYMENT_RECEIPT");
  assert.equal(preServiceDoc.documentTitle, "Booking & Payment Receipt");

  // Post-service completed bill / invoice
  const postServiceDoc = resolveDocumentType(true, true);
  assert.ok(
    postServiceDoc.documentType === "TAX_INVOICE" || postServiceDoc.documentType === "BILL_OF_SUPPLY"
  );

  // Verify BUSINESS_TAX_CONFIG: If not registered, never fabricate GSTIN
  assert.equal(BUSINESS_TAX_CONFIG.gstRegistered, false, "Production default: Not registered until verified");
  assert.equal(BUSINESS_TAX_CONFIG.gstin, null, "Fabricated GSTIN 19AABCH1234F1Z5 must be null");

  const receipt = invoiceEngine.generate({
    bookingId: "b-test-1",
    bookingNumber: "HEF-2026-112233",
    bookingDate: "2026-09-28",
    customerName: "Sayan Roy",
    customerAddress: "Salt Lake, Kolkata",
    serviceName: "Switch Replacement",
    subtotal: 69,
    paymentMethod: "UPI",
    paymentStatus: "PAID",
    warrantyDays: 30,
    isServiceCompleted: false, // Pre-service!
  });

  assert.equal(receipt.documentType, "PAYMENT_RECEIPT");
  assert.equal(receipt.gstinBusiness, null, "Must NOT render fake GSTIN on payment receipt");
});

test("SEQUENTIAL INVOICE NUMBERING - Financial Year Aware", () => {
  // Sep 2026 is in FY 2026-27 -> FY code "2627"
  const fy = getFinancialYearCode(new Date("2026-09-28"));
  assert.equal(fy, "2627");

  // Jan 2027 is in FY 2026-27 -> FY code "2627"
  const fyJan = getFinancialYearCode(new Date("2027-01-15"));
  assert.equal(fyJan, "2627");

  // May 2027 is in FY 2027-28 -> FY code "2728"
  const fyMay = getFinancialYearCode(new Date("2027-05-10"));
  assert.equal(fyMay, "2728");

  const inv = invoiceEngine.generate({
    bookingId: "b-1",
    bookingNumber: "HEF-2026-ABC123",
    bookingDate: "2026-09-28",
    customerName: "Rohan Sen",
    customerAddress: "Ballygunge, Kolkata",
    serviceName: "AC Servicing",
    subtotal: 499,
    paymentMethod: "CARD",
    paymentStatus: "PAID",
    warrantyDays: 30,
    isServiceCompleted: true,
  });

  assert.match(inv.invoiceNumber, /^HEF-(INV|REC)-2627-[A-Z0-9]+$/, "Invoice number must follow FY pattern");
});

test("SINGLE SOURCE OF TRUTH - Screen 2 vs Screen 3 Consistency", () => {
  // 1. Initial State: Booking Confirmed, Unassigned
  const booking = dbRepository.createBooking({
    serviceId: "srv-ev-charger-4w",
    serviceName: "4-Wheeler EV Charger Installation",
    categorySlug: "electrical",
    customerName: "Bongo Moy",
    customerPhone: "9830000000",
    scheduledDate: "2026-09-29",
    scheduledTimeSlot: "09:00 AM - 11:00 AM",
    address: "Hindol apartment, Bansdroni, Kolkata",
    subtotal: 1399,
    safetyFee: 0,
    taxGst: 233.82,
    discount: 100,
    totalAmount: 1532.82,
    paymentMethod: "CASH",
  });

  // Both pages must read from booking
  assert.equal(booking.technician_name, undefined, "Technician must be undefined before assignment");
  assert.equal(booking.status, "CONFIRMED");

  // Timeline check for unassigned booking
  const timelineUnassigned = buildAuthoritativeTimeline(
    booking.status,
    booking.created_at,
    booking.timeline,
    booking.technician_name,
    booking.payment_status,
    booking.payment_method
  );

  const confirmStep = timelineUnassigned.find((s) => s.key === "CONFIRMED");
  const assignStep = timelineUnassigned.find((s) => s.key === "ASSIGNMENT");
  const onTheWayStep = timelineUnassigned.find((s) => s.key === "ON_THE_WAY");

  assert.equal(confirmStep?.status, "completed");
  assert.equal(assignStep?.status, "current", "Assignment must be currently in progress");
  assert.equal(onTheWayStep?.status, "upcoming", "On The Way must NOT be active before professional is assigned");

  // 2. Technician Accepted & Assigned
  const proId = "pro-deb-sen";
  const proName = "Debojyoti Sen";
  dbRepository.reassignBooking(booking.id, proId, proName, "+91 98301 99999");
  dbRepository.updateBookingStatus(booking.id, "PROFESSIONAL_ON_THE_WAY");

  const updatedBooking = dbRepository.getBookingById(booking.id);
  assert.equal(updatedBooking.technician_name, proName);
  assert.equal(updatedBooking.status, "PROFESSIONAL_ON_THE_WAY");

  // Timeline check for en route booking
  const timelineEnRoute = buildAuthoritativeTimeline(
    updatedBooking.status,
    updatedBooking.created_at,
    updatedBooking.timeline,
    updatedBooking.technician_name,
    updatedBooking.payment_status,
    updatedBooking.payment_method
  );

  const assignStepAfter = timelineEnRoute.find((s) => s.key === "ASSIGNMENT");
  const onTheWayStepAfter = timelineEnRoute.find((s) => s.key === "ON_THE_WAY");

  assert.equal(assignStepAfter?.status, "completed");
  assert.equal(onTheWayStepAfter?.status, "current", "On The Way is now current milestone");
});

test("DISTANCE & HAVERSINE CALCULATION - Real Coordinate Distance", () => {
  // Salt Lake Sector V (22.5855, 88.4239) to Ballygunge (22.5280, 88.3656)
  const saltLake = { lat: 22.5855, lng: 88.4239 };
  const ballygunge = { lat: 22.5280, lng: 88.3656 };

  const directKm = calculateHaversineKm(saltLake, ballygunge);
  // Real straight-line distance is ~8.7 km
  assert.ok(directKm > 7.5 && directKm < 10.0, `Haversine distance ${directKm} km must be physically accurate`);
});

test("WALLET PAYMENT & REFUND ATOMICITY", () => {
  // Setup wallet with balance of ₹500
  localStorage.setItem(
    "homeefix-wallet-storage",
    JSON.stringify({
      state: {
        balance: 500,
        transactions: [],
      },
      version: 0,
    })
  );

  // 1. Initial booking with WALLET payment method
  const booking = dbRepository.createBooking({
    serviceId: "srv-switch-repair",
    serviceName: "Switch Repair",
    categorySlug: "electrical",
    customerName: "Amitabh Ghosh",
    customerPhone: "9830012345",
    scheduledDate: "2026-09-30",
    scheduledTimeSlot: "11:00 AM - 01:00 PM",
    address: "Salt Lake, Kolkata",
    subtotal: 100,
    safetyFee: 0,
    taxGst: 18,
    discount: 0,
    totalAmount: 118,
    paymentMethod: "WALLET",
  });

  // Verify payment status is set to PAID
  assert.equal(booking.payment_status, "PAID");
  assert.equal(booking.payment_method, "WALLET");

  // Verify wallet balance was debited: 500 - 118 = 382
  const updatedWallet = JSON.parse(localStorage.getItem("homeefix-wallet-storage") || "{}");
  assert.equal(updatedWallet.state.balance, 382);

  // Verify immutable payment transaction was created
  const txs = dbRepository.getPaymentTransactions(booking.id);
  assert.equal(txs.length, 1);
  assert.equal(txs[0].amount, 118);
  assert.equal(txs[0].status, "PAID");
  assert.equal(txs[0].provider, "WALLET");

  // 2. Refund processing
  dbRepository.refundBooking(booking.id, 118, "Customer requested cancellation");
  const refundedBooking = dbRepository.getBookingById(booking.id);

  assert.equal(refundedBooking.status, "REFUNDED");
  assert.equal(refundedBooking.payment_status, "REFUNDED");
  assert.equal(refundedBooking.refund_amount, 118);

  // Verify wallet balance was restored: 382 + 118 = 500
  const restoredWallet = JSON.parse(localStorage.getItem("homeefix-wallet-storage") || "{}");
  assert.equal(restoredWallet.state.balance, 500);

  const updatedTxs = dbRepository.getPaymentTransactions(booking.id);
  assert.equal(updatedTxs[0].refunded_amount, 118);
  assert.equal(updatedTxs[0].status, "REFUNDED");

  const allRefunds = dbRepository.getRefunds();
  const refRecord = allRefunds.find((r) => r.booking_id === booking.id);
  assert.ok(refRecord, "Refund transaction record must exist");
  assert.equal(refRecord?.amount, 118);
});
