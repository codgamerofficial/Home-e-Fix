import test from "node:test";
import assert from "node:assert/strict";

// Setup localStorage mock in Node environment
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

import {
  resolveCanonicalService,
  getCanonicalVariants,
  findCanonicalVariant,
  getCanonicalInclusions,
} from "../src/services/marketplace/canonicalService.service";
import { useBookingDraftStore } from "../src/store/booking.store";
import { useCartStore } from "../src/store/cart.store";
import { pricingEngine } from "../src/services/marketplace/pricing.engine";
import { serviceabilityEngine } from "../src/services/marketplace/serviceability.engine";
import { dbRepository } from "../src/services/db/repository";

test("TEST 1 - Switch/Socket Repair: Canonical service resolution returns ₹69, NEVER Split AC (₹499)", () => {
  const service = resolveCanonicalService("switch-socket-repair-replacement");
  assert.ok(service, "Service must resolve for switch-socket-repair-replacement");
  assert.notEqual(service.name, "Split AC Foam Jet Deep Servicing", "Must NEVER resolve to AC service");
  assert.match(service.name, /switch|socket/i, "Service name must be Switch/Socket related");

  const variants = getCanonicalVariants(service);
  assert.ok(variants.length >= 3, "Must have at least 3 packages/variants");

  const standardVariant = variants[0];
  assert.match(standardVariant.name, /standard/i);
  assert.equal(standardVariant.price, 69, "Standard Single Unit must be ₹69");
});

test("TEST 2 - Package / Variant Selection: Correctly preserves variant ID, name, duration, and price", () => {
  const service = resolveCanonicalService("switch-socket-repair-replacement")!;

  // 1. Standard Single Unit (₹69)
  const v1 = findCanonicalVariant(service, "pkg-switch-std");
  assert.match(v1.name, /standard/i);
  assert.equal(v1.price, 69);
  assert.equal(v1.durationLabel, "30–45 mins");

  // 2. Dual Unit Combo (₹117)
  const v2 = findCanonicalVariant(service, "pkg-switch-dual");
  assert.match(v2.name, /dual/i);
  assert.equal(v2.price, 117);
  assert.equal(v2.durationLabel, "60–80 mins");

  // 3. Family Pack (₹155)
  const v3 = findCanonicalVariant(service, "pkg-switch-family");
  assert.match(v3.name, /family/i);
  assert.equal(v3.price, 155);
  assert.equal(v3.durationLabel, "90–120 mins");
});

test("TEST 3 - Booking Draft: Switching package updates draft price and variant metadata", () => {
  localStorage.clear();
  useBookingDraftStore.getState().clearDraft();

  const service = resolveCanonicalService("switch-socket-repair-replacement")!;

  // User selects Family Pack (₹155)
  const familyVariant = findCanonicalVariant(service, "pkg-switch-family");
  useBookingDraftStore.getState().setSingleServiceDraft(service, 1, familyVariant);

  const draft = useBookingDraftStore.getState().draft;
  assert.ok(draft);
  assert.equal(draft.items.length, 1);
  assert.equal(draft.items[0].variantId, familyVariant.id);
  assert.match(draft.items[0].variantName || "", /family/i);
  assert.equal(draft.items[0].unitPrice, 155, "Family pack draft price must be ₹155, NOT ₹69 or ₹499");
  assert.equal(draft.items[0].subtotal, 155);
  assert.equal(draft.items[0].variantDuration, "90–120 mins");
});

test("TEST 4 - Missing or Invalid Service Identifier: Returns undefined and NEVER falls back to default AC service", () => {
  const invalidService = resolveCanonicalService("non-existent-service-slug-xyz");
  assert.ok(!invalidService, "Invalid service must return falsy/undefined");

  const emptyService = resolveCanonicalService("");
  assert.ok(!emptyService, "Empty service query must return falsy/undefined");
});

test("TEST 5 - Cart Isolation: Direct booking price is unaffected by cart subtotal", () => {
  localStorage.clear();
  useCartStore.getState().clearCart();
  useBookingDraftStore.getState().clearDraft();

  // Populate cart with 2 items (Fan repair ₹149, Tap repair ₹99 = ₹248)
  useCartStore.getState().addItem({ id: "srv-fan", name: "Fan Repair", basePrice: 149, discountedPrice: 149, quantity: 1 });
  useCartStore.getState().addItem({ id: "srv-tap", name: "Tap Repair", basePrice: 99, discountedPrice: 99, quantity: 1 });
  assert.equal(useCartStore.getState().getSubtotal(), 248);

  // Directly book Switch/Socket Repair (Standard Single Unit ₹69)
  const switchService = resolveCanonicalService("switch-socket-repair-replacement")!;
  const standardVariant = findCanonicalVariant(switchService, "pkg-switch-std");
  useBookingDraftStore.getState().setSingleServiceDraft(switchService, 1, standardVariant);

  const draft = useBookingDraftStore.getState().draft;
  assert.ok(draft);
  assert.equal(draft.items.length, 1);
  assert.equal(draft.items[0].unitPrice, 69);
  assert.notEqual(draft.items[0].unitPrice, 248, "Must not leak cart subtotal ₹248");

  // Calculate pricing
  const calculation = pricingEngine.calculate({
    items: draft.items.map((i) => ({
      serviceId: i.serviceId,
      serviceName: i.serviceName,
      basePrice: i.unitPrice,
      variantPrice: i.unitPrice,
      quantity: 1,
    })),
    basePrice: draft.items[0].unitPrice,
    quantity: 1,
  });

  assert.equal(calculation.baseAmount, 69, "Base labour must be strictly ₹69");
  assert.notEqual(calculation.baseAmount, 248, "Base labour must NOT be cart subtotal ₹248");
  assert.notEqual(calculation.baseAmount, 499, "Base labour must NOT be AC service ₹499");
});

test("TEST 6 - Canonical Inclusions & Exclusions: Service-specific, not generic across all services", () => {
  const switchService = resolveCanonicalService("switch-socket-repair-replacement");
  const switchInclusions = getCanonicalInclusions(switchService);

  assert.ok(switchInclusions.included.some((i) => /switch|socket|continuity/i.test(i)));
  assert.ok(switchInclusions.excluded.some((e) => /concealed|rewiring|civil/i.test(e)));

  const acService = resolveCanonicalService("split-ac-foam-servicing");
  const acInclusions = getCanonicalInclusions(acService);

  assert.ok(acInclusions.included.some((i) => /foam|jet|filter|cooling/i.test(i)));
  assert.ok(acInclusions.excluded.some((e) => /compressor|gas leak/i.test(e)));
});

test("TEST 7 - Kolkata Pincode Availability: Rejects non-Kolkata and accepts valid Kolkata PIN", () => {
  // Valid Kolkata PIN
  const validResult = serviceabilityEngine.checkServiceability({
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700064",
    pincode: "700064",
  });
  assert.equal(validResult.isServiceable, true, "Kolkata PIN 700064 must be serviceable");

  // Non-Kolkata PIN (e.g. Mumbai 400001)
  const invalidResult = serviceabilityEngine.checkServiceability({
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
    pincode: "400001",
  });
  assert.equal(invalidResult.isServiceable, false, "Mumbai PIN 400001 must not be serviceable");
});

test("TEST 8 - Price Snapshot Immutability: Booking preserves variant and full price snapshot", () => {
  const switchService = resolveCanonicalService("switch-socket-repair-replacement")!;
  const dualVariant = findCanonicalVariant(switchService, "pkg-switch-dual");

  const booking = dbRepository.createBooking({
    serviceId: switchService.id,
    serviceName: switchService.name,
    categorySlug: switchService.categorySlug,
    customerName: "Test User",
    customerPhone: "9830012345",
    scheduledDate: "2026-09-30",
    scheduledTimeSlot: "11:00 AM - 01:00 PM",
    address: "Salt Lake Sector V, Kolkata - 700091",
    subtotal: dualVariant.price,
    safetyFee: 0,
    taxGst: 21,
    discount: 0,
    totalAmount: 138,
    paymentMethod: "CASH",
    items: [
      {
        serviceId: switchService.id,
        serviceName: switchService.name,
        variantId: dualVariant.id,
        variantName: dualVariant.name,
        unitPrice: dualVariant.price,
        quantity: 1,
        subtotal: dualVariant.price,
      },
    ],
    pricingSnapshot: {
      serviceId: switchService.id,
      variantId: dualVariant.id,
      variantName: dualVariant.name,
      basePrice: dualVariant.price,
      baseAmount: dualVariant.price,
      taxGst: 21,
      totalPayableInr: 138,
    },
  });

  assert.ok(booking.booking_items);
  assert.equal(booking.booking_items[0].unit_price_snapshot, 117);
  assert.equal(booking.pricing_snapshot.variantId, dualVariant.id);
  assert.equal(booking.pricing_snapshot.variantName, dualVariant.name);
  assert.equal(booking.pricing_snapshot.totalPayableInr, 138);
});
