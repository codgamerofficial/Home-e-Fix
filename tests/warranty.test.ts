import test from "node:test";
import assert from "node:assert/strict";
import { warrantyEngine } from "../src/services/marketplace/warranty.engine";

test("Warranty Engine - Generates active 30-day warranty on completed service", () => {
  const completedDate = new Date().toISOString();
  const warranty = warrantyEngine.createWarranty(
    "booking-123",
    "HEF-2026-AB12CD34",
    "AC Deep Jet Service",
    completedDate,
    30
  );

  assert.equal(warranty.bookingId, "booking-123");
  assert.equal(warranty.bookingNumber, "HEF-2026-AB12CD34");
  assert.equal(warranty.warrantyDays, 30);
  assert.equal(warranty.status, "ACTIVE");
  assert.ok(warranty.warrantyNumber.startsWith("HEF-WRN-"));

  const eligibility = warrantyEngine.canRaiseClaim(warranty);
  assert.equal(eligibility.eligible, true);
});

test("Warranty Engine - Identifies expired warranties and blocks claims", () => {
  // Service completed 60 days ago with a 30-day warranty
  const sixtyDaysAgo = new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString();
  const warranty = warrantyEngine.createWarranty(
    "booking-old",
    "HEF-2026-OLD123",
    "Switchboard Repair",
    sixtyDaysAgo,
    30
  );

  assert.equal(warranty.status, "EXPIRED");
  const eligibility = warrantyEngine.canRaiseClaim(warranty);
  assert.equal(eligibility.eligible, false);
  assert.ok(eligibility.reason?.includes("Warranty expired"));
});
