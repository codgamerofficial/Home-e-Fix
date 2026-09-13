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

import { addressesApi } from "../src/services/api/addresses.api.ts";
import { dbRepository } from "../src/services/db/repository.ts";

beforeEach(() => {
  // Clear address table in storage between runs
  localStorage.clear();
});

test("Address Contract - getCustomerAddresses always returns an Array", async () => {
  const result = await addressesApi.getCustomerAddresses("cust-new-1");
  assert.equal(Array.isArray(result), true, "Result must strictly be an Array");
  assert.equal(result.length, 0, "Initial state for new customer must be empty array");
});

test("Address Contract - Normalization enforces all fields and aliases", async () => {
  const created = await addressesApi.createAddress(
    {
      title: "Home",
      streetAddress: "Flat 4B, Greenfield Heights, Salt Lake Sector 1",
      landmark: "Near City Centre 1",
      city: "Kolkata",
      state: "West Bengal",
      pincode: "700064",
      is_default: true,
    },
    "cust-real-1"
  );

  assert.ok(created.id, "Address must have an ID");
  assert.equal(created.user_id, "cust-real-1");
  assert.equal(created.userId, "cust-real-1");
  assert.equal(created.title, "Home");
  assert.equal(created.label, "Home");
  assert.equal(created.streetAddress, "Flat 4B, Greenfield Heights, Salt Lake Sector 1");
  assert.equal(created.address_line_1, "Flat 4B, Greenfield Heights, Salt Lake Sector 1");
  assert.equal(created.city, "Kolkata");
  assert.equal(created.pincode, "700064");
  assert.equal(created.is_default, true);
  assert.equal(created.isDefault, true);
  assert.ok(created.fullAddress?.includes("Kolkata"), "Full address should contain Kolkata");
});

test("Address Contract - Customer Isolation & Cross-User Security", async () => {
  const userA = "user-alpha-99";
  const userB = "user-beta-88";

  // Create address for User A
  const addrA = await addressesApi.createAddress(
    {
      title: "Alpha Home",
      streetAddress: "12 Ballygunge Circular Rd",
      city: "Kolkata",
      pincode: "700019",
    },
    userA
  );

  // Create address for User B
  const addrB = await addressesApi.createAddress(
    {
      title: "Beta Work",
      streetAddress: "Block EP & GP, Sector V, Salt Lake",
      city: "Kolkata",
      pincode: "700091",
    },
    userB
  );

  // User A should only see A's addresses
  const listA = await addressesApi.getCustomerAddresses(userA);
  assert.equal(listA.length, 1);
  assert.equal(listA[0].id, addrA.id);
  assert.equal(listA[0].title, "Alpha Home");

  // User B should only see B's addresses
  const listB = await addressesApi.getCustomerAddresses(userB);
  assert.equal(listB.length, 1);
  assert.equal(listB[0].id, addrB.id);
  assert.equal(listB[0].title, "Beta Work");

  // User B cannot delete or access User A's address
  await addressesApi.deleteAddress(addrA.id, userB);
  const verifyA = await addressesApi.getCustomerAddresses(userA);
  assert.equal(verifyA.length, 1, "User A's address must remain untouched when targeted by User B");
});

test("Address Contract - Single Default Address Policy", async () => {
  const userId = "cust-multi-defaults";

  const addr1 = await addressesApi.createAddress(
    {
      title: "Address 1",
      streetAddress: "10 Park Street",
      city: "Kolkata",
      pincode: "700016",
      is_default: true,
    },
    userId
  );

  const addr2 = await addressesApi.createAddress(
    {
      title: "Address 2",
      streetAddress: "25 Camac Street",
      city: "Kolkata",
      pincode: "700016",
      is_default: true,
    },
    userId
  );

  const list = await addressesApi.getCustomerAddresses(userId);
  assert.equal(list.length, 2);

  const defaults = list.filter((a) => a.is_default || a.isDefault);
  assert.equal(defaults.length, 1, "There must be exactly one default address");
  assert.equal(defaults[0].id, addr2.id, "Address 2 should be the sole default");

  // Setting default back to Address 1
  await addressesApi.setDefaultAddress(addr1.id, userId);
  const updatedList = await addressesApi.getCustomerAddresses(userId);
  const updatedDefaults = updatedList.filter((a) => a.is_default || a.isDefault);
  assert.equal(updatedDefaults.length, 1);
  assert.equal(updatedDefaults[0].id, addr1.id, "Address 1 should now be the sole default");
});

test("Address Contract - Storage Resilience prevents TypeError: addresses.map is not a function", async () => {
  // Simulate corrupt non-array storage in localStorage
  localStorage.setItem(
    "homeefix_db_v2_addresses",
    JSON.stringify({ id: "corrupt-obj", streetAddress: "Single object instead of array" })
  );

  // Must not throw, and must return Array
  const fromRepo = dbRepository.getAddresses("cust-test");
  assert.equal(Array.isArray(fromRepo), true, "dbRepository must recover and return array");

  const fromApi = await addressesApi.getCustomerAddresses("cust-test");
  assert.equal(Array.isArray(fromApi), true, "addressesApi must recover and return array");

  // Safe mapping test
  assert.doesNotThrow(() => {
    fromApi.map((a) => a.id);
  }, "Calling .map() on addresses must NEVER throw TypeError");
});

test("Address Contract - Full Lifecycle (Create, Read, Update, Delete)", async () => {
  const userId = "cust-lifecycle-1";

  // 1. Create
  const created = await addressesApi.createAddress(
    {
      title: "Home",
      streetAddress: "123 Prince Anwar Shah Rd",
      landmark: "Near South City Mall",
      city: "Kolkata",
      pincode: "700068",
    },
    userId
  );
  assert.ok(created.id);

  // 2. Read
  let list = await addressesApi.getCustomerAddresses(userId);
  assert.equal(list.length, 1);
  assert.equal(list[0].id, created.id);

  // 3. Update
  const updated = await addressesApi.updateAddress(
    created.id,
    {
      title: "Parent's Flat",
      landmark: "Opposite Lords Bakery",
    },
    userId
  );
  assert.equal(updated.title, "Parent's Flat");

  list = await addressesApi.getCustomerAddresses(userId);
  assert.equal(list[0].title, "Parent's Flat");
  assert.equal(list[0].landmark, "Opposite Lords Bakery");

  // 4. Delete
  await addressesApi.deleteAddress(created.id, userId);
  list = await addressesApi.getCustomerAddresses(userId);
  assert.equal(list.length, 0, "Address must be deleted");
});
