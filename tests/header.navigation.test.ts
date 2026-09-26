import test from "node:test";
import assert from "node:assert/strict";
import { formatHeaderLocation, formatLocationLabel, useLocationStore } from "../src/store/location.store";
import { useAuthStore } from "../src/store/auth.store";
import { useNotificationStore } from "../src/store/notification.store";
import { useUIStore } from "../src/store/ui.store";
import { MAIN_NAV_LINKS } from "../src/constants/navigation";
import { ROUTES } from "../src/constants/routes";

test("Header Navigation - formatHeaderLocation handles empty and default location", () => {
  const resultNull = formatHeaderLocation(null);
  assert.equal(resultNull.display, "Select location");
  assert.equal(resultNull.short, "Select location");
  assert.equal(resultNull.full, "Select location");

  const resultEmpty = formatHeaderLocation({ locality: "", city: "" });
  assert.equal(resultEmpty.display, "Select location");
});

test("Header Navigation - formatHeaderLocation prevents redundant 'Kolkata, Kolkata'", () => {
  const result = formatHeaderLocation({ locality: "Kolkata", city: "Kolkata" });
  assert.equal(result.display, "Kolkata");
  assert.equal(result.short, "Kolkata");
  assert.equal(result.full, "Kolkata");
});

test("Header Navigation - formatHeaderLocation formats standard Locality and City", () => {
  const result = formatHeaderLocation({ locality: "Salt Lake", city: "Kolkata" });
  assert.equal(result.display, "Salt Lake, Kolkata");
  assert.equal(result.short, "Salt Lake");
  assert.equal(result.full, "Salt Lake, Kolkata");
});

test("Header Navigation - formatHeaderLocation cleanly handles long localities with tooltip full string", () => {
  const longLocality = "Salt Lake Sector V Tech Park";
  const result = formatHeaderLocation({ locality: longLocality, city: "Kolkata" });
  assert.equal(result.full, "Salt Lake Sector V Tech Park, Kolkata");
  assert.ok(result.display.length <= 25, "Display should be compact for the header row");
  assert.ok(result.display.includes("…") || result.display.length <= 24);
});

test("Header Navigation - Priority Navigation Links definition", () => {
  assert.ok(MAIN_NAV_LINKS.length >= 5, "Main navigation links should have at least 5 links");
  
  // Priority 3 (Primary links): Services, How It Works
  const primaryLinks = MAIN_NAV_LINKS.slice(0, 2);
  assert.equal(primaryLinks[0].label, "Services");
  assert.equal(primaryLinks[1].label, "How It Works");

  // Priority 4 (Secondary links): PLUS, Become a Pro, Support
  const secondaryLinks = MAIN_NAV_LINKS.slice(2);
  const secondaryLabels = secondaryLinks.map((l) => l.label);
  assert.ok(secondaryLabels.some((label) => label.includes("PLUS")));
  assert.ok(secondaryLabels.some((label) => label.includes("Professional") || label.includes("Pro")));
  assert.ok(secondaryLabels.some((label) => label.includes("Support")));
});

test("Header Navigation - Critical routes are defined and not dead links", () => {
  // Public
  assert.equal(ROUTES.HOME, "/");
  assert.equal(ROUTES.SERVICES, "/services");
  assert.equal(ROUTES.HOW_IT_WORKS, "/how-it-works");
  assert.equal(ROUTES.SUPPORT, "/support");
  assert.equal(ROUTES.LOGIN, "/auth/login");

  // Customer
  assert.equal(ROUTES.CUSTOMER_PROFILE, "/app/profile");
  assert.equal(ROUTES.CUSTOMER_BOOKINGS, "/app/bookings");
  assert.equal(ROUTES.APP_ADDRESSES, "/app/addresses");
  assert.equal(ROUTES.APP_NOTIFICATIONS, "/app/notifications");
  assert.equal(ROUTES.APP_MEMBERSHIP, "/app/membership");
  assert.equal(ROUTES.APP_SETTINGS, "/app/settings");

  // Professional
  assert.equal(ROUTES.PROFESSIONAL, "/professional");
  assert.equal(ROUTES.PROFESSIONAL_JOBS, "/professional/jobs");
  assert.equal(ROUTES.PROFESSIONAL_CALENDAR, "/professional/calendar");
  assert.equal(ROUTES.PROFESSIONAL_EARNINGS, "/professional/earnings");
  assert.equal(ROUTES.PROFESSIONAL_KYC, "/professional/kyc");

  // Admin
  assert.equal(ROUTES.ADMIN, "/admin");
  assert.equal(ROUTES.ADMIN_NOTIFICATIONS, "/admin/notifications");
  assert.equal(ROUTES.ADMIN_SETTINGS, "/admin/settings");
});

test("Header Navigation - Notification Store tracks real unread count", () => {
  const store = useNotificationStore.getState();
  assert.equal(typeof store.unreadCount, "number");
  assert.ok(store.unreadCount >= 0);
  assert.equal(Array.isArray(store.notifications), true);

  // Mark all read clears unread badge
  store.markAllAsRead();
  assert.equal(useNotificationStore.getState().unreadCount, 0);
});

test("Header Navigation - Theme persistence and toggling", () => {
  const uiStore = useUIStore.getState();
  const initialTheme = uiStore.theme;
  
  uiStore.toggleTheme();
  const toggledTheme = useUIStore.getState().theme;
  assert.notEqual(initialTheme, toggledTheme);

  // Toggle back
  useUIStore.getState().toggleTheme();
  assert.equal(useUIStore.getState().theme, initialTheme);
});

test("Header Navigation - Auth Store session handling", () => {
  const authStore = useAuthStore.getState();
  assert.equal(typeof authStore.isAuthenticated, "boolean");
  assert.equal(typeof authStore.isLoading, "boolean");

  // Verify role helpers
  assert.equal(typeof authStore.hasRole, "function");
  assert.equal(typeof authStore.isCustomer, "function");
  assert.equal(typeof authStore.isTechnician, "function");
  assert.equal(typeof authStore.isAdmin, "function");
});
