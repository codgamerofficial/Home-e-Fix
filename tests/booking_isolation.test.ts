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

import { pricingEngine, calculateBookingPrice } from "../src/services/marketplace/pricing.engine";
import { useCartStore } from "../src/store/cart.store";
import { useBookingDraftStore } from "../src/store/booking.store";
import { dbRepository } from "../src/services/db/repository";
import { serviceabilityEngine } from "../src/services/marketplace/serviceability.engine";

test("TEST 1 - Cart empty: Single service booking has isolated base price (₹79, NOT ₹297)", () => {
  localStorage.clear();
  useCartStore.getState().clearCart();
  useBookingDraftStore.getState().clearDraft();

  const fanRegulatorService = {
    id: "elec-fan-regulator",
    slug: "fan-regulator-replacement",
    name: "Fan Regulator Replacement",
    basePrice: 89,
    discountedPrice: 79,
    category: { slug: "electrical", name: "Electrician" },
    materialsPolicy: "extra",
    warrantyDays: 30,
  };

  useBookingDraftStore.getState().setSingleServiceDraft(fanRegulatorService, 1);
  const draft = useBookingDraftStore.getState().draft;

  assert.ok(draft, "Draft must exist");
  assert.equal(draft.source, "single_service");
  assert.equal(draft.items.length, 1);
  assert.equal(draft.items[0].serviceName, "Fan Regulator Replacement");
  assert.equal(draft.items[0].unitPrice, 79);
  assert.equal(draft.items[0].subtotal, 79);

  // Compute pricing
  const pricing = calculateBookingPrice({
    items: draft.items,
    membership: { isActive: false },
  });

  assert.equal(pricing.baseAmount, 79, "Base labour must be ₹79, never ₹297");
  assert.notEqual(pricing.baseAmount, 297, "Base labour must NOT leak cart subtotal ₹297");
});

test("TEST 2 - Multi-service cart checkout: Subtotal correctly reflects all cart items (₹297)", () => {
  localStorage.clear();
  useCartStore.getState().clearCart();
  useBookingDraftStore.getState().clearDraft();

  const cartServices = [
    { id: "srv-regulator", slug: "fan-regulator-replacement", name: "Fan Regulator Replacement", basePrice: 79, discountedPrice: 79, quantity: 1 },
    { id: "srv-fan-repair", slug: "fan-repair", name: "Fan Repair", basePrice: 149, discountedPrice: 149, quantity: 1 },
    { id: "srv-switch", slug: "switch-repair", name: "Switch/Socket Repair", basePrice: 69, discountedPrice: 69, quantity: 1 },
  ];

  cartServices.forEach((s) => useCartStore.getState().addItem(s));
  const cartItems = useCartStore.getState().items;

  assert.equal(cartItems.length, 3);
  assert.equal(useCartStore.getState().getSubtotal(), 297);

  // Load into booking draft as cart checkout
  useBookingDraftStore.getState().setCartDraft(cartItems);
  const draft = useBookingDraftStore.getState().draft;

  assert.ok(draft);
  assert.equal(draft.source, "cart");
  assert.equal(draft.items.length, 3);

  const pricing = calculateBookingPrice({
    items: draft.items,
    membership: { isActive: false },
  });

  assert.equal(pricing.baseAmount, 297, "Multi-service cart checkout subtotal must be exactly ₹297");
});

test("TEST 3 - Cart contains 3 services: Book Now on individual service enters isolated booking (₹79)", () => {
  localStorage.clear();
  useCartStore.getState().clearCart();
  useBookingDraftStore.getState().clearDraft();

  // Populate cart with 3 items (Subtotal ₹297)
  const cartServices = [
    { id: "srv-regulator", slug: "fan-regulator-replacement", name: "Fan Regulator Replacement", basePrice: 79, discountedPrice: 79, quantity: 1 },
    { id: "srv-fan-repair", slug: "fan-repair", name: "Fan Repair", basePrice: 149, discountedPrice: 149, quantity: 1 },
    { id: "srv-switch", slug: "switch-repair", name: "Switch/Socket Repair", basePrice: 69, discountedPrice: 69, quantity: 1 },
  ];
  cartServices.forEach((s) => useCartStore.getState().addItem(s));

  // User clicks Book Now on Fan Regulator Replacement directly
  const singleService = {
    id: "srv-regulator",
    slug: "fan-regulator-replacement",
    name: "Fan Regulator Replacement",
    basePrice: 79,
    discountedPrice: 79,
  };

  useBookingDraftStore.getState().setSingleServiceDraft(singleService, 1);
  const draft = useBookingDraftStore.getState().draft;

  assert.ok(draft);
  assert.equal(draft.source, "single_service");
  assert.equal(draft.items.length, 1);
  assert.equal(draft.items[0].subtotal, 79);

  // Cart must remain unchanged with 3 items
  assert.equal(useCartStore.getState().items.length, 3);
  assert.equal(useCartStore.getState().getSubtotal(), 297);

  // Booking pricing must be strictly ₹79
  const pricing = calculateBookingPrice({
    items: draft.items,
    membership: { isActive: false },
  });
  assert.equal(pricing.baseAmount, 79, "Isolated booking must be ₹79 despite cart having ₹297");
});

test("TEST 4 - User without active PLUS membership receives ₹0 membership discount", () => {
  const pricing = calculateBookingPrice({
    items: [{ serviceId: "srv-1", serviceName: "Test Service", basePrice: 1000, quantity: 1 }],
    membership: { isActive: false },
  });

  assert.equal(pricing.discountMembership, 0, "Non-members must never receive membership discounts");
});

test("TEST 5 - User with verified active PLUS membership receives exactly 20% discount on labour", () => {
  const pricing = calculateBookingPrice({
    items: [{ serviceId: "srv-1", serviceName: "Test Service", basePrice: 1000, quantity: 1 }],
    membership: { isActive: true },
  });

  assert.equal(pricing.discountMembership, 200, "Active PLUS members must receive 20% discount on eligible labour");
  assert.equal(pricing.safetyFee, 0, "Safety fee must be waived for PLUS members");
});

test("TEST 6 - Service with materials extra preserves material rule and transparency", () => {
  const pricing = calculateBookingPrice({
    items: [{ serviceId: "srv-fan-regulator", serviceName: "Fan Regulator", basePrice: 79, quantity: 1, materialsTotal: 50 }],
  });

  assert.equal(pricing.baseAmount, 79);
  assert.equal(pricing.materialsAmount, 50);
});

test("TEST 7 & 8 - Kolkata-Wide Serviceability Check correctly accepts Kolkata and blocks out-of-zone", () => {
  const kolkataCheck = serviceabilityEngine.checkServiceability({
    city: "Kolkata",
    state: "West Bengal",
    postalCode: "700091",
  });
  assert.equal(kolkataCheck.isServiceable, true, "Kolkata postal codes must be serviceable");

  const outsideCheck = serviceabilityEngine.checkServiceability({
    city: "Mumbai",
    state: "Maharashtra",
    postalCode: "400001",
  });
  assert.equal(outsideCheck.isServiceable, false, "Outside regions must be rejected with informative notice");
});

test("TEST 10 - Historical Booking Price Snapshot Immutability", () => {
  localStorage.clear();

  // Create booking with price snapshot
  const booking = dbRepository.createBooking({
    serviceId: "srv-fan-regulator",
    serviceName: "Fan Regulator Replacement",
    categorySlug: "electrical",
    customerName: "Saswat",
    customerPhone: "9830000000",
    scheduledDate: "2026-09-26",
    scheduledTimeSlot: "10:00 AM - 12:00 PM",
    address: "Salt Lake Sector 1, Kolkata - 700064",
    subtotal: 79,
    safetyFee: 0,
    taxGst: 14,
    discount: 0,
    totalAmount: 93,
    paymentMethod: "CASH",
    items: [
      {
        serviceId: "srv-fan-regulator",
        serviceName: "Fan Regulator Replacement",
        unitPrice: 79,
        quantity: 1,
        subtotal: 79,
      },
    ],
    pricingSnapshot: {
      baseAmount: 79,
      taxGst: 14,
      totalPayableInr: 93,
    },
  });

  assert.ok(booking.booking_items);
  assert.equal(booking.booking_items.length, 1);
  assert.equal(booking.booking_items[0].unit_price_snapshot, 79);
  assert.equal(booking.pricing_snapshot.totalPayableInr, 93);

  // Retrieve booking from DB
  const retrieved = dbRepository.getBookingById(booking.id);
  assert.equal(retrieved.booking_items[0].unit_price_snapshot, 79);
  assert.equal(retrieved.total_amount, 93);
});

test("TEST 11 - Refresh Safety: Booking Draft persistence in storage", () => {
  localStorage.clear();
  useBookingDraftStore.getState().clearDraft();

  useBookingDraftStore.getState().setSingleServiceDraft({
    id: "srv-tap",
    slug: "tap-repair",
    name: "Tap Repair",
    basePrice: 99,
  });

  useBookingDraftStore.getState().updateDraft({
    selectedDate: "2026-09-27",
    selectedSlotId: "slot-morning-1",
  });

  const draft = useBookingDraftStore.getState().draft;
  assert.equal(draft?.selectedDate, "2026-09-27");
  assert.equal(draft?.selectedSlotId, "slot-morning-1");
  assert.equal(draft?.items[0].serviceName, "Tap Repair");
});

test("TEST 12 - Idempotency Key Generation prevents duplicate booking submissions", () => {
  useBookingDraftStore.getState().clearDraft();
  useBookingDraftStore.getState().setSingleServiceDraft({ id: "srv-1", name: "Service", basePrice: 100 });

  const key1 = useBookingDraftStore.getState().ensureIdempotencyKey();
  const key2 = useBookingDraftStore.getState().ensureIdempotencyKey();

  assert.equal(key1, key2, "Idempotency key must remain identical for the same booking session");
});
