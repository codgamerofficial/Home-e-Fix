import type { UserRole } from "@/types/database.types";

export type Permission =
  // Customer Permissions
  | "booking:create"
  | "booking:view_own"
  | "booking:cancel_own"
  | "booking:approve_charges"
  | "review:create"
  | "address:manage"
  // Professional Permissions
  | "job:view_assigned"
  | "job:accept_reject"
  | "job:update_status"
  | "job:request_charges"
  | "earnings:view_own"
  | "kyc:submit"
  // Support Agent Permissions
  | "ticket:view_all"
  | "ticket:reply"
  | "ticket:resolve"
  | "customer:view_basic"
  // Operations Manager Permissions
  | "booking:assign_manual"
  | "booking:reassign"
  | "professional:view_all"
  | "professional:review_kyc"
  | "service_area:manage"
  // Finance Admin Permissions
  | "payment:view_ledger"
  | "refund:process"
  | "payout:reconcile"
  | "invoice:generate"
  // Admin Permissions
  | "service:create"
  | "service:update"
  | "pricing:update"
  | "coupon:manage"
  | "review:moderate"
  // Super Admin Permissions
  | "user:manage_roles"
  | "audit:view_all"
  | "settings:system_config";

const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  CUSTOMER: [
    "booking:create",
    "booking:view_own",
    "booking:cancel_own",
    "booking:approve_charges",
    "review:create",
    "address:manage",
  ],
  PROFESSIONAL: [
    "job:view_assigned",
    "job:accept_reject",
    "job:update_status",
    "job:request_charges",
    "earnings:view_own",
    "kyc:submit",
  ],
  SUPPORT_AGENT: [
    "ticket:view_all",
    "ticket:reply",
    "ticket:resolve",
    "customer:view_basic",
    "booking:view_own",
  ],
  OPERATIONS_MANAGER: [
    "booking:assign_manual",
    "booking:reassign",
    "professional:view_all",
    "professional:review_kyc",
    "service_area:manage",
    "ticket:view_all",
  ],
  FINANCE_ADMIN: [
    "payment:view_ledger",
    "refund:process",
    "payout:reconcile",
    "invoice:generate",
  ],
  ADMIN: [
    "booking:assign_manual",
    "booking:reassign",
    "professional:view_all",
    "professional:review_kyc",
    "service_area:manage",
    "service:create",
    "service:update",
    "pricing:update",
    "coupon:manage",
    "review:moderate",
    "payment:view_ledger",
    "refund:process",
    "ticket:view_all",
  ],
  SUPER_ADMIN: [
    "booking:create",
    "booking:view_own",
    "booking:cancel_own",
    "booking:approve_charges",
    "review:create",
    "address:manage",
    "job:view_assigned",
    "job:accept_reject",
    "job:update_status",
    "job:request_charges",
    "earnings:view_own",
    "kyc:submit",
    "ticket:view_all",
    "ticket:reply",
    "ticket:resolve",
    "customer:view_basic",
    "booking:assign_manual",
    "booking:reassign",
    "professional:view_all",
    "professional:review_kyc",
    "service_area:manage",
    "payment:view_ledger",
    "refund:process",
    "payout:reconcile",
    "invoice:generate",
    "service:create",
    "service:update",
    "pricing:update",
    "coupon:manage",
    "review:moderate",
    "user:manage_roles",
    "audit:view_all",
    "settings:system_config",
  ],
};

/**
 * Checks if a specific role possesses the given permission.
 * Note: Real authorization must also be validated server-side / database-side via Supabase RLS.
 */
export function hasPermission(role: UserRole | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role] || [];
  return permissions.includes(permission);
}
