import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage for zustand in Node.js environment
if (typeof globalThis.localStorage === "undefined") {
  const store = new Map<string, string>();
  globalThis.localStorage = {
    getItem: (key: string) => store.get(key) || null,
    setItem: (key: string, value: string) => store.set(key, value),
    removeItem: (key: string) => store.delete(key),
    clear: () => store.clear(),
    key: (index: number) => Array.from(store.keys())[index] || null,
    length: store.size,
  };
}

import { GeolocationService } from "../src/services/location/geolocationService.ts";
import { GeocodingService } from "../src/services/location/geocodingService.ts";
import { ServiceAreaService } from "../src/services/location/serviceAreaService.ts";
import { AddressService } from "../src/services/location/addressService.ts";
import { useLocationStore } from "../src/store/location.store.ts";

test("TEST 1 - Geolocation Accuracy Evaluator correctly flags low vs high accuracy", () => {
  const geoService = new GeolocationService();

  // High accuracy (within 15m)
  const highAcc = geoService.evaluateAccuracy(15);
  assert.equal(highAcc.isLowAccuracy, false);
  assert.ok(highAcc.accuracyLabel.includes("15m"));

  // Low accuracy (> 100m)
  const lowAcc = geoService.evaluateAccuracy(250);
  assert.equal(lowAcc.isLowAccuracy, true);
  assert.ok(lowAcc.accuracyLabel.includes("250m"));
  assert.ok(lowAcc.advice?.includes("approximate"));

  // Missing accuracy
  const missingAcc = geoService.evaluateAccuracy(undefined);
  assert.equal(missingAcc.isLowAccuracy, true);
  assert.equal(missingAcc.accuracyLabel, "Approximate");
});

test("TEST 2 - PIN Code Validation strictly enforces 6-digit Indian Postal Index Numbers", () => {
  const addressService = new AddressService();

  // Valid Kolkata PIN codes
  assert.equal(addressService.isValidPincode("700091"), true);
  assert.equal(addressService.isValidPincode("700064"), true);
  assert.equal(addressService.isValidPincode("700019"), true);
  assert.equal(addressService.isValidPincode("700034"), true);

  // Invalid formats
  assert.equal(addressService.isValidPincode("123"), false);
  assert.equal(addressService.isValidPincode("000000"), false); // Leading zero is invalid in India
  assert.equal(addressService.isValidPincode("7000911"), false); // 7 digits
  assert.equal(addressService.isValidPincode("700 91"), false);
  assert.equal(addressService.isValidPincode("PIN700"), false);
  assert.equal(addressService.isValidPincode(""), false);
});

test("TEST 3 - Geocoding Sanitizer sanitizes postcode and preserves legitimate 6-digit PIN", () => {
  const geocodingService = new GeocodingService();

  assert.equal(geocodingService.sanitizePincode("700091"), "700091");
  assert.equal(geocodingService.sanitizePincode("WB 700064"), "700064");
  assert.equal(geocodingService.sanitizePincode("invalid"), undefined);
  assert.equal(geocodingService.sanitizePincode("012345"), undefined);
});

test("TEST 4 - Address Normalization and Deduplication Fingerprinting", () => {
  const addressService = new AddressService();

  const raw1 = "Flat 4B, Sector V, Salt Lake, Kolkata - 700091";
  const raw2 = "flat 4b, sector  v, salt lake, kolkata - 700091.";

  const norm1 = addressService.normalizeAddressString(raw1);
  const norm2 = addressService.normalizeAddressString(raw2);

  assert.equal(norm1, norm2, "Normalized addresses should match regardless of punctuation or casing");

  const fp1 = addressService.getFingerprint({
    houseFlat: "Flat 4B",
    street: "Sector V",
    locality: "Salt Lake",
    pincode: "700091",
  });

  const fp2 = addressService.getFingerprint({
    houseFlat: "flat 4b",
    street: "sector v",
    locality: "salt lake",
    pincode: "700091",
  });

  assert.equal(fp1, fp2, "Fingerprints must match for identical residential components");
});

test("TEST 5 - Service Area Service validates Kolkata territory coordinates and PINs", () => {
  const serviceArea = new ServiceAreaService();

  // Valid Salt Lake Coordinates
  assert.equal(
    serviceArea.isWithinKolkataCoordinates(22.5867, 88.4178),
    true,
    "Salt Lake coordinates must be inside Kolkata territory"
  );

  // Valid Park Street Coordinates
  assert.equal(
    serviceArea.isWithinKolkataCoordinates(22.5513, 88.3524),
    true,
    "Park Street coordinates must be inside Kolkata territory"
  );

  // Out of bounds: New Delhi coordinates
  assert.equal(
    serviceArea.isWithinKolkataCoordinates(28.6139, 77.2090),
    false,
    "New Delhi coordinates must be strictly rejected"
  );

  // Out of bounds: Mumbai coordinates
  assert.equal(
    serviceArea.isWithinKolkataCoordinates(19.0760, 72.8777),
    false,
    "Mumbai coordinates must be strictly rejected"
  );

  // Validation by PIN
  const validCheck = serviceArea.validateServiceArea({
    pincode: "700091",
    city: "Kolkata",
    locality: "Salt Lake Sector V",
  });
  assert.equal(validCheck.isServiceable, true);
  assert.equal(validCheck.city, "Kolkata");

  // Validation out of coverage
  const invalidCheck = serviceArea.validateServiceArea({
    pincode: "110001",
    city: "New Delhi",
    locality: "Connaught Place",
  });
  assert.equal(invalidCheck.isServiceable, false);
  assert.ok(invalidCheck.message.includes("isn't available"));
});

test("TEST 6 - Location Store initializes with clean defaults and updates on manual setting", () => {
  const store = useLocationStore.getState();

  assert.equal(store.city, "Kolkata");
  assert.equal(store.locality, "");
  assert.equal(store.formattedAddress, "Kolkata, West Bengal");
  assert.equal(store.status, "idle");

  // Manually set location
  useLocationStore.getState().setManualLocation("Ballygunge", "700019");

  const updated = useLocationStore.getState();
  assert.equal(updated.locality, "Ballygunge");
  assert.equal(updated.pincode, "700019");
  assert.equal(updated.city, "Kolkata");
  assert.equal(updated.currentLocation.confirmed, true);
  assert.equal(updated.currentLocation.source, "manual");
  assert.equal(updated.currentLocation.serviceability?.isServiceable, true);
});

test("TEST 7 - Location Store selectSavedAddress sets confirmed state accurately", () => {
  useLocationStore.getState().selectSavedAddress({
    id: "addr-test-1",
    user_id: "usr-123",
    label: "HOME",
    title: "HOME",
    full_name: "Debashis Banerjee",
    recipient_name: "Debashis Banerjee",
    phone: "9830012345",
    house_flat: "Flat 2A",
    street: "Raja Basanta Roy Road",
    address_line_1: "Raja Basanta Roy Road",
    locality: "Southern Avenue",
    area: "Southern Avenue",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700029",
    postal_code: "700029",
    country: "India",
    latitude: 22.5123,
    longitude: 88.3541,
    place_id: null,
    is_default: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });

  const state = useLocationStore.getState();
  assert.equal(state.locality, "Southern Avenue");
  assert.equal(state.pincode, "700029");
  assert.equal(state.currentLocation.source, "saved_address");
  assert.equal(state.currentLocation.confirmed, true);
  assert.equal(state.currentLocation.latitude, 22.5123);
  assert.equal(state.currentLocation.longitude, 88.3541);
  assert.equal(state.currentLocation.serviceability?.isServiceable, true);
});
