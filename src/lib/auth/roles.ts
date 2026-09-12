import type { UserRole } from "@/types/database.types";

/**
 * 7 Authoritative Core Actors defined in Home-e-Fix Architecture.
 */
export const ROLES: Record<UserRole, UserRole> = {
  CUSTOMER: "CUSTOMER",
  PROFESSIONAL: "PROFESSIONAL",
  SUPPORT_AGENT: "SUPPORT_AGENT",
  OPERATIONS_MANAGER: "OPERATIONS_MANAGER",
  FINANCE_ADMIN: "FINANCE_ADMIN",
  ADMIN: "ADMIN",
  SUPER_ADMIN: "SUPER_ADMIN",
} as const;

/**
 * Role hierarchy levels for administrative scope.
 */
export const ROLE_HIERARCHY: Record<UserRole, number> = {
  CUSTOMER: 10,
  PROFESSIONAL: 20,
  SUPPORT_AGENT: 40,
  OPERATIONS_MANAGER: 60,
  FINANCE_ADMIN: 70,
  ADMIN: 80,
  SUPER_ADMIN: 100,
};

/**
 * Type predicates for role verification.
 */
export function isStaffOrAdmin(role?: UserRole | null): boolean {
  if (!role) return false;
  return ["SUPPORT_AGENT", "OPERATIONS_MANAGER", "FINANCE_ADMIN", "ADMIN", "SUPER_ADMIN"].includes(role);
}

export function isCustomer(role?: UserRole | null): boolean {
  return role === "CUSTOMER";
}

export function isProfessional(role?: UserRole | null): boolean {
  return role === "PROFESSIONAL";
}

export function isSuperAdmin(role?: UserRole | null): boolean {
  return role === "SUPER_ADMIN";
}
