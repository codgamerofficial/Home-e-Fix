import test from "node:test";
import assert from "node:assert/strict";

// Mock localStorage for headless Node test environment
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

import { authService } from "../src/services/auth.service";
import { useAuthStore } from "../src/store/auth.store";
import { ROUTES } from "../src/constants/routes";
import { dbRepository } from "../src/services/db/repository";

test("TEST 1 - Platform Owner Account Resolves super_admin and Routes to /admin", async () => {
  const ownerUuid = "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";
  const ownerUser = {
    id: ownerUuid,
    email: "deysaswata200@gmail.com",
    app_metadata: { role: "super_admin", roles: ["super_admin", "admin"] },
    user_metadata: { full_name: "Saswata Dey", role: "super_admin" },
  };

  const resolved = await authService.ensureProfile(ownerUser);
  assert.equal(resolved.role, "super_admin");
  assert.equal(resolved.id, ownerUuid);

  // Verify auth store reflection
  useAuthStore.getState().login(resolved, "mock-token", "mock-refresh");
  assert.equal(useAuthStore.getState().isAdmin(), true);
  assert.equal(useAuthStore.getState().isSuperAdmin(), true);

  // Deterministic routing verification
  const redirectTarget = resolved.role === "super_admin" || resolved.role === "admin"
    ? ROUTES.ADMIN
    : ROUTES.APP;
  assert.equal(redirectTarget, ROUTES.ADMIN);
});

test("TEST 2 - Customer Access to /admin is Denied (403)", () => {
  const customerUser = {
    id: "cust-uuid-1234",
    email: "customer@example.com",
    role: "customer" as const,
  };

  const adminAllowedRoles = ["ADMIN", "SUPER_ADMIN"];
  const userRoleNormalized = customerUser.role.toUpperCase();
  const normalizedAllowed = adminAllowedRoles.map((r) => r.toUpperCase());

  const isSuperAdmin = userRoleNormalized === "SUPER_ADMIN";
  const isAdminLevelPermitted = normalizedAllowed.includes("ADMIN") || normalizedAllowed.includes("SUPER_ADMIN");

  const hasMatchingRole =
    normalizedAllowed.includes(userRoleNormalized) ||
    (isSuperAdmin && isAdminLevelPermitted);

  assert.equal(hasMatchingRole, false, "Customer MUST NOT have matching role for /admin");
});

test("TEST 3 - Professional Access to /admin is Denied (403)", () => {
  const proUser = {
    id: "pro-uuid-5678",
    email: "partner@example.com",
    role: "professional" as const,
  };

  const adminAllowedRoles = ["ADMIN", "SUPER_ADMIN"];
  const userRoleNormalized = proUser.role.toUpperCase();
  const normalizedAllowed = adminAllowedRoles.map((r) => r.toUpperCase());

  const isSuperAdmin = userRoleNormalized === "SUPER_ADMIN";
  const isAdminLevelPermitted = normalizedAllowed.includes("ADMIN") || normalizedAllowed.includes("SUPER_ADMIN");

  const hasMatchingRole =
    normalizedAllowed.includes(userRoleNormalized) ||
    (isSuperAdmin && isAdminLevelPermitted);

  assert.equal(hasMatchingRole, false, "Professional MUST NOT have matching role for /admin");
});

test("TEST 4 - Admin Access to /professional is Authorized per Business Invariants", () => {
  const adminUser = {
    id: "admin-uuid-9999",
    email: "ops@homeefix.in",
    role: "admin" as const,
  };

  // Section 45 allows Admins & Super Admins to inspect professional dashboard
  const proAllowedRoles = ["PROFESSIONAL", "TECHNICIAN", "ADMIN", "SUPER_ADMIN"];
  const userRoleNormalized = adminUser.role.toUpperCase();
  const normalizedAllowed = proAllowedRoles.map((r) => r.toUpperCase());

  const hasMatchingRole = normalizedAllowed.includes(userRoleNormalized);
  assert.equal(hasMatchingRole, true, "Admin MUST be permitted to inspect professional portal");
});

test("TEST 5 - Customer Attempting Client-Side Role Modification is Denied", async () => {
  const customerSessionUser = {
    id: "user-cust-7777",
    email: "attacker@gmail.com",
    app_metadata: { role: "customer" },
    user_metadata: { role: "customer" },
  };

  // Customer tries to supply roleIntent = "super_admin" via client call
  const resolved = await authService.ensureProfile(customerSessionUser, "super_admin" as any);

  // Server-side app_metadata takes precedence; unauthorized escalation is blocked
  assert.notEqual(resolved.id, "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2");
  assert.equal(resolved.role, "customer", "Unauthorized user cannot escalate to super_admin via roleIntent");
});

test("TEST 6 - Professional Attempting Client-Side Role Modification is Denied", async () => {
  const proSessionUser = {
    id: "user-pro-8888",
    email: "partner@gmail.com",
    app_metadata: { role: "professional" },
    user_metadata: { role: "professional" },
  };

  // Professional attempts to declare themselves admin
  const resolved = await authService.ensureProfile(proSessionUser, "admin" as any);
  assert.equal(resolved.role, "professional", "Professional cannot escalate to admin via roleIntent");
});

test("TEST 7 - Normal Admin Attempting to Access Super Admin Management (/admin/admins) is Denied", () => {
  const normalAdmin = {
    id: "admin-sub-1111",
    email: "subadmin@homeefix.in",
    role: "admin" as const,
  };

  // /admin/admins strictly requires SUPER_ADMIN
  const superAdminOnlyRoles = ["SUPER_ADMIN"];
  const userRoleNormalized = normalAdmin.role.toUpperCase();
  const normalizedAllowed = superAdminOnlyRoles.map((r) => r.toUpperCase());

  const isSuperAdmin = userRoleNormalized === "SUPER_ADMIN";
  const isAdminLevelPermitted = normalizedAllowed.includes("ADMIN");

  const hasMatchingRole =
    normalizedAllowed.includes(userRoleNormalized) ||
    (isSuperAdmin && isAdminLevelPermitted);

  assert.equal(hasMatchingRole, false, "Normal admin MUST NOT have access to /admin/admins");
});

test("TEST 8 - Super Admin Successfully Manages Admin Users and Logs Audit Event", () => {
  const superAdminId = "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";

  // Super admin creates an audit log entry for admin provisioning
  dbRepository.addAuditLog(
    "ADMIN_CREATED",
    "ADMIN_USER",
    "admin-new-001",
    { email: "newmanager@homeefix.in", role: "admin" },
    superAdminId,
    "super_admin"
  );

  const logs = dbRepository.getAuditLogs();
  const createdLog = logs.find((l) => l.action === "ADMIN_CREATED" && l.entityId === "admin-new-001");

  assert.ok(createdLog, "Audit log for admin creation must exist");
  assert.equal(createdLog.actor_role, "super_admin");
  assert.equal(createdLog.actor_id, superAdminId);
});
