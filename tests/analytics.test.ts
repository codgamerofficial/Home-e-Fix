import test from "node:test";
import assert from "node:assert/strict";
import { analyticsService } from "../src/services/analytics/analytics.service";

test("Analytics Service - Tracks events and maintains session resilience", () => {
  analyticsService.trackEvent("page_view", { path: "/services/electrical" });
  analyticsService.trackEvent("service_view", { serviceSlug: "switch-socket-repair-replacement" });
  analyticsService.trackEvent("booking_started", { serviceSlug: "switch-socket-repair-replacement" });
  analyticsService.trackEvent("booking_confirmed", {
    bookingNumber: "HEF-2026-TEST1",
    amount: 149,
  });

  const recent = analyticsService.getRecentEvents(10);
  assert.ok(recent.length >= 4);

  const summary = analyticsService.getEventSummary();
  assert.ok(summary["page_view"] >= 1);
  assert.ok(summary["service_view"] >= 1);
  assert.ok(summary["booking_started"] >= 1);
  assert.ok(summary["booking_confirmed"] >= 1);

  const funnel = analyticsService.getFunnelMetrics();
  assert.ok(funnel.bookingStarts >= 1);
  assert.ok(funnel.bookingsConfirmed >= 1);
  assert.equal(typeof funnel.conversionRate, "string");
  assert.ok(funnel.conversionRate.endsWith("%"));
});
