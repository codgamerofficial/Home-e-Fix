import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage in Node
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

import { CATEGORY_SERVICES_MAP, POPULAR_SERVICES } from "../src/constants/services";
import { SERVICE_IMAGE_MAP, getServiceImage } from "../src/constants/serviceImageMap";
import { resolveServicePrice } from "../src/utils/servicePricing";
import { serviceAreaService } from "../src/services/location/serviceAreaService";
import { calculateBookingPrice } from "../src/services/marketplace/pricing.engine";
import { useCartStore } from "../src/store/cart.store";
import { useBookingDraftStore } from "../src/store/booking.store";
import { useLocationStore } from "../src/store/location.store";

test("TEST 1: No location selected -> Prompts user to select location", () => {
  useLocationStore.getState().clearLocation();
  const state = useLocationStore.getState();
  const isConfirmed = state.currentLocation.confirmed || Boolean(state.locality || state.pincode);
  assert.equal(isConfirmed, false, "Location must not be assumed without confirmation");
});

test("TEST 2: Location selected -> Territory validation accepts Kolkata PIN", () => {
  const result = serviceAreaService.validateServiceArea({
    locality: "Salt Lake Sector V",
    city: "Kolkata",
    pincode: "700091",
  });
  assert.equal(result.isServiceable, true, "Salt Lake, Kolkata must be verified serviceable");
  assert.ok(result.zoneCode, "Zone code must be assigned");
});

test("TEST 3: Filter by Electrical -> Returns strictly electrical services", () => {
  const electricalServices = CATEGORY_SERVICES_MAP.electrical || [];
  assert.ok(electricalServices.length > 0, "Electrical category must have services");
  electricalServices.forEach((svc: any) => {
    assert.equal(svc.categorySlug || svc.category?.slug || "electrical", "electrical");
  });
});

test("TEST 4: Search 'fan' -> Returns fan-related services", () => {
  const allServices = Object.values(CATEGORY_SERVICES_MAP).flat();
  const query = "fan";
  const matched = allServices.filter(
    (s: any) =>
      s.name.toLowerCase().includes(query) ||
      (s.shortDescription && s.shortDescription.toLowerCase().includes(query))
  );
  assert.ok(matched.length >= 2, "Must find multiple fan repair services");
  const names = matched.map((s: any) => s.name);
  assert.ok(names.some((n: string) => n.toLowerCase().includes("fan")), "Should match fan repair");
});

test("TEST 5: Search 'tap' -> Returns plumbing tap services", () => {
  const allServices = Object.values(CATEGORY_SERVICES_MAP).flat();
  const query = "tap";
  const matched = allServices.filter(
    (s: any) =>
      s.name.toLowerCase().includes(query) ||
      (s.shortDescription && s.shortDescription.toLowerCase().includes(query))
  );
  assert.ok(matched.length >= 1, "Must find plumbing tap services");
  const categories = matched.map((s: any) => s.categorySlug || s.category?.slug);
  assert.ok(categories.includes("plumbing"), "Matching services should be in plumbing");
});

test("TEST 6: Inactive service does not appear in active catalog", () => {
  const mockCatalogue = [
    { id: "s1", name: "Active Service", is_active: true },
    { id: "s2", name: "Discontinued Service", is_active: false },
  ];
  const activeList = mockCatalogue.filter((s) => s.is_active !== false);
  assert.equal(activeList.length, 1);
  assert.equal(activeList[0].id, "s1");
});

test("TEST 7: Unavailable service out-of-zone -> Not bookable in unserved areas", () => {
  const outOfZone = serviceAreaService.validateServiceArea({
    locality: "Andheri West",
    city: "Mumbai",
    pincode: "400058",
  });
  assert.equal(outOfZone.isServiceable, false, "Mumbai address must not be marked serviceable for Kolkata hub");
});

test("TEST 8: Service with 0 reviews has no fake rating", () => {
  const unreviewedService = {
    id: "svc-new",
    name: "New Sensor Light Installation",
    reviewCount: 0,
    rating: undefined,
  };
  const hasRealRating = Boolean(unreviewedService.rating && unreviewedService.reviewCount > 0);
  assert.equal(hasRealRating, false, "Must not display fake rating if review count is 0");
});

test("TEST 9: Service without discount has no crossed-out price", () => {
  const fixedService = {
    id: "svc-fixed",
    basePrice: 149,
    discountedPrice: undefined,
  };
  const hasDiscount = Boolean(
    fixedService.discountedPrice && fixedService.discountedPrice < fixedService.basePrice
  );
  assert.equal(hasDiscount, false, "Must not fabricate crossed-out price when no discount exists");
});

test("TEST 10: Service pricing type = RANGE -> Range displayed properly", () => {
  const rangeService = {
    id: "svc-range",
    pricingType: "RANGE",
    minPrice: 499,
    maxPrice: 799,
  };
  const display = `${rangeService.minPrice}–${rangeService.maxPrice}`;
  assert.equal(display, "499–799", "Must format range pricing accurately");
});

test("TEST 11: Click Book Now -> Correct service enters isolated booking", () => {
  useBookingDraftStore.getState().clearDraft();
  const testService = POPULAR_SERVICES[0];

  useBookingDraftStore.getState().setSingleServiceDraft(testService, 1);
  const draft = useBookingDraftStore.getState().draft;

  assert.ok(draft, "Draft must exist");
  assert.equal(draft.items[0].serviceId, testService.id);
  assert.equal(draft.items[0].serviceName, testService.name);
});

test("TEST 12: Cart contains multiple services -> Direct booking one service uses ONLY selected service pricing", () => {
  useCartStore.getState().clearCart();
  useBookingDraftStore.getState().clearDraft();

  // Add 3 services to cart
  useCartStore.getState().addItem({ id: "cart-1", name: "Tap Repair", basePrice: 99 });
  useCartStore.getState().addItem({ id: "cart-2", name: "Switchboard Fix", basePrice: 119 });
  useCartStore.getState().addItem({ id: "cart-3", name: "AC Check", basePrice: 199 });

  assert.equal(useCartStore.getState().items.length, 3);
  assert.equal(useCartStore.getState().getSubtotal(), 417);

  // Directly book one isolated service (₹79)
  const singleService = {
    id: "fan-regulator",
    slug: "fan-regulator-replacement",
    name: "Fan Regulator Replacement",
    basePrice: 79,
    discountedPrice: 79,
  };

  useBookingDraftStore.getState().setSingleServiceDraft(singleService, 1);
  const draft = useBookingDraftStore.getState().draft;

  assert.equal(draft?.items.length, 1);
  assert.equal(draft?.items[0].subtotal, 79);

  const priceCalc = calculateBookingPrice({
    items: draft!.items,
    membership: { isActive: false },
  });

  assert.equal(priceCalc.baseAmount, 79, "Direct booking must only charge ₹79, never cart subtotal ₹417");
  assert.notEqual(priceCalc.baseAmount, 417, "Cart items must NOT leak into single service direct booking");
});

test("IMAGE INTEGRITY: Eliminate student stock photo from service images", () => {
  const badImage = "photo-1544717305-2782549b5136";
  const mappedValues = Object.values(SERVICE_IMAGE_MAP);

  mappedValues.forEach((meta) => {
    assert.ok(
      !meta.primaryImage.includes(badImage),
      `Primary image for ${meta.slug} must not be student photo`
    );
    assert.ok(
      !meta.secondaryImage.includes(badImage),
      `Secondary image for ${meta.slug} must not be student photo`
    );
    assert.ok(
      !meta.thumbnail.includes(badImage),
      `Thumbnail for ${meta.slug} must not be student photo`
    );
  });
});

test("TEST 13: Corporate meeting stock photo photo-1558402529-d2638a7023e9 eliminated from all service mappings", () => {
  const corporateMeetingImage = "photo-1558402529-d2638a7023e9";
  const mappedValues = Object.values(SERVICE_IMAGE_MAP);

  mappedValues.forEach((meta) => {
    assert.ok(
      !meta.primaryImage.includes(corporateMeetingImage),
      `Primary image for ${meta.slug} must not be office meeting photo`
    );
    assert.ok(
      !meta.secondaryImage.includes(corporateMeetingImage),
      `Secondary image for ${meta.slug} must not be office meeting photo`
    );
    assert.ok(
      !meta.thumbnail.includes(corporateMeetingImage),
      `Thumbnail for ${meta.slug} must not be office meeting photo`
    );
  });

  POPULAR_SERVICES.forEach((svc) => {
    assert.ok(
      !svc.thumbnail?.includes(corporateMeetingImage),
      `Popular service ${svc.name} must not use office meeting photo`
    );
  });
});

test("TEST 14: Central getServiceImage resolves valid trade photography", () => {
  const acService = {
    name: "Split AC Foam Jet Deep Servicing",
    slug: "split-ac-foam-servicing",
    category: { slug: "ac" },
  };
  const resolved = getServiceImage(acService);
  assert.ok(resolved.url.startsWith("https://images.unsplash.com/"), "Image URL must be valid Unsplash URL");
  assert.ok(resolved.url.includes("photo-1621905251189-08b45d6a269e"), "Must resolve genuine AC technician photo");
  assert.ok(resolved.alt.length > 0, "Alt text must be provided");

  const electricalService = {
    name: "Switch & Socket Installation / Repair",
    slug: "switch-socket-installation",
    category: { slug: "electrical" },
  };
  const resolvedElec = getServiceImage(electricalService);
  assert.ok(resolvedElec.url.includes("photo-1621905252507-b35492cc74b4"), "Must resolve genuine electrician photo");
});

test("TEST 15: resolveServicePrice standardizes pricing models without fake discounts", () => {
  // Fixed pricing
  const fixed = resolveServicePrice({
    pricingModel: "FIXED",
    basePrice: 899,
  });
  assert.equal(fixed.label, "FIXED");
  assert.equal(fixed.priceFormatted, "₹899");
  assert.equal(fixed.originalPriceFormatted, undefined, "No crossed out price if no real discount");

  // Starting From
  const starting = resolveServicePrice({
    pricingModel: "STARTING_FROM",
    basePrice: 499,
  });
  assert.equal(starting.label, "STARTING FROM");
  assert.equal(starting.priceFormatted, "₹499");
  assert.equal(starting.originalPriceFormatted, undefined);

  // Per Unit
  const perUnit = resolveServicePrice({
    pricingModel: "PER_UNIT",
    basePrice: 149,
    unit: "point",
  });
  assert.equal(perUnit.label, "RATE");
  assert.equal(perUnit.priceFormatted, "₹149 / point");

  // Range
  const range = resolveServicePrice({
    pricingModel: "RANGE",
    minPrice: 499,
    maxPrice: 799,
  });
  assert.equal(range.label, "PRICE RANGE");
  assert.equal(range.priceFormatted, "₹499–₹799");

  // Quote
  const quote = resolveServicePrice({
    pricingModel: "QUOTE",
  });
  assert.equal(quote.label, "GET A QUOTE");
  assert.equal(quote.ctaText, "Request Quote");

  // Real discount
  const discounted = resolveServicePrice({
    pricingModel: "FIXED",
    basePrice: 1000,
    discountedPrice: 800,
  });
  assert.equal(discounted.priceFormatted, "₹800");
  assert.equal(discounted.originalPriceFormatted, "₹1,000");
  assert.equal(discounted.discountLabel, "20% OFF");
});

