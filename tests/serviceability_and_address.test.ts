import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";

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

import { serviceabilityEngine } from "../src/services/marketplace/serviceability.engine.ts";
import { addressFormSchema } from "../src/lib/validations/address.schema.ts";
import { addressesApi } from "../src/services/api/addresses.api.ts";
import { dbRepository } from "../src/services/db/repository.ts";

beforeEach(() => {
  localStorage.clear();
});

test("Kolkata-Wide Serviceability - Serves ALL areas across Kolkata", () => {
  const kolkataPincodes = [
    { pin: "700091", locality: "Salt Lake Sector V" },
    { pin: "700064", locality: "Salt Lake Sector 1 & 2" },
    { pin: "700156", locality: "New Town Action Area 1" },
    { pin: "700019", locality: "Ballygunge" },
    { pin: "700034", locality: "Behala" },
    { pin: "700032", locality: "Jadavpur" },
    { pin: "700028", locality: "Dum Dum" },
    { pin: "700084", locality: "Garia" },
    { pin: "700016", locality: "Park Street" },
    { pin: "700027", locality: "Alipore" },
    { pin: "700135", locality: "Rajarhat" },
    { pin: "700053", locality: "New Alipore" },
    { pin: "700001", locality: "BBD Bagh" },
  ];

  for (const item of kolkataPincodes) {
    const result = serviceabilityEngine.checkServiceability({
      postalCode: item.pin,
      city: "Kolkata",
      state: "West Bengal",
    });

    assert.equal(result.isServiceable, true, `Pincode ${item.pin} (${item.locality}) must be serviceable`);
    assert.equal(result.cityName, "Kolkata");
    assert.equal(result.coverage, "ALL_KOLKATA");
    assert.ok(
      result.message?.includes("serves all areas across Kolkata"),
      `Message must be customer-facing and mention Kolkata coverage for ${item.pin}`
    );
    // Ensure customer message NEVER exposes internal hub codes
    assert.equal(
      result.message?.includes("KOL_EAST_SL"),
      false,
      "Customer message must NEVER expose internal dispatch code KOL_EAST_SL"
    );
    assert.equal(
      result.message?.includes("operational hub"),
      false,
      "Customer message must NEVER expose internal operational hub terminology"
    );
  }
});

test("Kolkata-Wide Serviceability - Rejects addresses strictly outside Kolkata", () => {
  const outsideLocations = [
    { city: "Bengaluru", state: "Karnataka", pin: "560001" },
    { city: "Mumbai", state: "Maharashtra", pin: "400001" },
    { city: "Delhi", state: "Delhi", pin: "110001" },
    { city: "Bhubaneswar", state: "Odisha", pin: "751001" },
  ];

  for (const loc of outsideLocations) {
    const result = serviceabilityEngine.checkServiceability({
      postalCode: loc.pin,
      city: loc.city,
      state: loc.state,
    });

    assert.equal(result.isServiceable, false, `Outside location ${loc.city} must NOT be serviceable`);
    assert.ok(
      result.reason?.includes("Kolkata only") || result.message?.includes("Kolkata only"),
      `Reason must state availability in Kolkata only for ${loc.city}`
    );
    // Ensure it does not say KOL_EAST_SL unavailable
    assert.equal(
      result.reason?.includes("KOL_EAST_SL"),
      false,
      "Customer out of bounds message must NOT reference internal hub codes"
    );
  }
});

test("Address Validation - Zod schema enforces valid Indian Mobile and PIN Code", () => {
  // Valid Address
  const validData = {
    fullName: "Saswata Mukherjee",
    phone: "9830012345",
    houseFlat: "Flat 4B, Tower 2",
    building: "Greenfield Heights",
    street: "Street 104, Action Area 1",
    areaLocality: "New Town",
    landmark: "Near Axis Mall",
    city: "Kolkata",
    state: "West Bengal",
    pincode: "700156",
    addressType: "HOME" as const,
    isDefault: true,
  };

  const parseResult = addressFormSchema.safeParse(validData);
  assert.equal(parseResult.success, true, "Valid Kolkata address data must pass validation");

  // Invalid Phone Numbers (less than 10 digits, starts with 1-5, has characters)
  const invalidPhones = ["12345", "983001234", "5830012345", "98300ABCD5"];
  for (const phone of invalidPhones) {
    const res = addressFormSchema.safeParse({ ...validData, phone });
    assert.equal(res.success, false, `Phone '${phone}' must fail validation`);
  }

  // Invalid PIN Codes (not 6 digits, has characters)
  const invalidPins = ["70009", "7000912", "70009A", "ABCDEF"];
  for (const pincode of invalidPins) {
    const res = addressFormSchema.safeParse({ ...validData, pincode });
    assert.equal(res.success, false, `PIN '${pincode}' must fail validation`);
  }

  // Missing required fields
  const missingFullName = addressFormSchema.safeParse({ ...validData, fullName: "" });
  assert.equal(missingFullName.success, false, "Empty fullName must fail validation");

  const missingHouse = addressFormSchema.safeParse({ ...validData, houseFlat: "" });
  assert.equal(missingHouse.success, false, "Empty houseFlat must fail validation");

  const missingStreet = addressFormSchema.safeParse({ ...validData, street: "ab" });
  assert.equal(missingStreet.success, false, "Street shorter than 3 characters must fail validation");
});

test("Address Contract - Structured fields & Snapshot Immutability", async () => {
  const userId = "cust-snapshot-test";

  // 1. Create Address with full details
  const created = await addressesApi.createAddress(
    {
      label: "HOME",
      full_name: "Priyanka Roy",
      phone: "9831122334",
      house_flat: "Flat 3A, Block C",
      building: "Silver Oak Residency",
      street: "Raja SC Mullick Road",
      area: "Jadavpur",
      landmark: "Near Jadavpur 8B Bus Stand",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700032",
      postal_code: "700032",
      is_default: true,
    },
    userId
  );

  assert.ok(created.id, "Saved address must have an ID");
  assert.equal(created.full_name, "Priyanka Roy");
  assert.equal(created.phone, "9831122334");
  assert.equal(created.house_flat, "Flat 3A, Block C");
  assert.equal(created.area, "Jadavpur");
  assert.equal(created.pincode, "700032");

  // 2. Create Booking with address snapshot
  const booking = dbRepository.createBooking({
    serviceId: "srv-ac-service",
    serviceName: "AC Jet Service",
    categorySlug: "ac",
    customerId: userId,
    customerName: created.full_name,
    customerPhone: created.phone,
    scheduledDate: "2026-09-20",
    scheduledTimeSlot: "10:00 AM - 12:00 PM",
    address: created.formatted_address,
    addressSnapshot: {
      id: created.id,
      full_name: created.full_name,
      phone: created.phone,
      house_flat: created.house_flat,
      building: created.building,
      street: created.street,
      area: created.area,
      landmark: created.landmark,
      city: created.city,
      state: created.state,
      country: created.country,
      postal_code: created.postal_code,
      formatted_address: created.formatted_address,
      label: created.label,
    },
    subtotal: 599,
    safetyFee: 49,
    taxGst: 108,
    discount: 0,
    totalAmount: 756,
    paymentMethod: "UPI",
  });

  assert.ok(booking.id, "Booking must have an ID");
  assert.ok(booking.address_snapshot, "Booking must retain immutable address_snapshot");
  assert.equal(booking.address_snapshot.house_flat, "Flat 3A, Block C");
  assert.equal(booking.address_snapshot.area, "Jadavpur");

  // 3. Customer modifies saved address later
  await addressesApi.updateAddress(
    created.id,
    {
      house_flat: "Changed to Flat 10Z",
      area: "Changed Area",
    },
    userId
  );

  // 4. Verify historical booking address snapshot was NOT mutated
  const retrievedBooking = dbRepository.getBookingById(booking.id);
  assert.equal(
    retrievedBooking.address_snapshot.house_flat,
    "Flat 3A, Block C",
    "Booking snapshot must remain untouched after customer updates saved address"
  );
  assert.equal(
    retrievedBooking.address_snapshot.area,
    "Jadavpur",
    "Booking snapshot must remain untouched after customer updates saved address"
  );

  // 5. Customer deletes saved address
  await addressesApi.deleteAddress(created.id, userId);
  const remainingAddresses = await addressesApi.getCustomerAddresses(userId);
  assert.equal(remainingAddresses.length, 0, "Saved address should be deleted");

  // 6. Verify booking still retains complete snapshot
  const postDeleteBooking = dbRepository.getBookingById(booking.id);
  assert.ok(postDeleteBooking.address_snapshot, "Booking must still retain snapshot after address deletion");
  assert.equal(postDeleteBooking.address_snapshot.full_name, "Priyanka Roy");
});
