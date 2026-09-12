/**
 * Centralized route path constants for Home-e-Fix.
 * Covers:
 * - Public Marketing Website (Section 43)
 * - Customer Platform (/app/*) (Section 44)
 * - Professional Platform (/professional/*) (Section 45)
 * - Admin Platform (/admin/*) (Section 46)
 * - Auth & Legacy backwards-compatibility
 */

export const ROUTES = {
  // ─── Public Website Pages (Section 43) ───
  HOME: "/",
  SERVICES: "/services",
  SERVICE_CATEGORY: "/services/:category",
  SERVICE_DETAIL: "/services/:category/:service",
  HOW_IT_WORKS: "/how-it-works",
  MEMBERSHIP: "/membership",
  ABOUT: "/about",
  BECOME_A_PROFESSIONAL: "/become-a-professional",
  SUPPORT: "/support",
  CONTACT: "/contact",
  BLOG: "/blog",
  PRIVACY: "/privacy",
  TERMS: "/terms",
  DESIGN_SYSTEM: "/design-system",

  // ─── Direct Booking Routes ───
  BOOKING: "/booking",
  BOOKING_CONFIRMATION: "/booking/confirmation/:bookingId",

  // ─── Auth Routes ───
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  OTP_VERIFY: "/auth/otp",
  PROFILE_SETUP: "/auth/profile-setup",

  // ─── Customer Platform (/app/*) (Section 44) ───
  APP: "/app",
  APP_BOOK: "/app/book",
  APP_BOOK_SERVICE: "/app/book/:service",
  APP_BOOKINGS: "/app/bookings",
  APP_BOOKING_DETAIL: "/app/bookings/:id",
  APP_INVOICES: "/app/invoices",
  APP_MEMBERSHIP: "/app/membership",
  APP_WALLET: "/app/wallet",
  APP_COUPONS: "/app/coupons",
  APP_ADDRESSES: "/app/addresses",
  APP_REVIEWS: "/app/reviews",
  APP_NOTIFICATIONS: "/app/notifications",
  APP_SUPPORT: "/app/support",
  APP_PROFILE: "/app/profile",
  APP_SETTINGS: "/app/settings",

  // Backward compatibility alias for /dashboard
  CUSTOMER_DASHBOARD: "/app/bookings",
  CUSTOMER_BOOKINGS: "/app/bookings",
  CUSTOMER_PROFILE: "/app/profile",
  CUSTOMER_ADDRESSES: "/app/addresses",
  CUSTOMER_WALLET: "/app/wallet",
  CUSTOMER_SUPPORT: "/app/support",

  // ─── Professional Platform (/professional/*) (Section 45) ───
  PROFESSIONAL: "/professional",
  PROFESSIONAL_JOBS: "/professional/jobs",
  PROFESSIONAL_JOB_DETAIL: "/professional/jobs/:id",
  PROFESSIONAL_CALENDAR: "/professional/calendar",
  PROFESSIONAL_EARNINGS: "/professional/earnings",
  PROFESSIONAL_WALLET: "/professional/wallet",
  PROFESSIONAL_RATINGS: "/professional/ratings",
  PROFESSIONAL_PROFILE: "/professional/profile",
  PROFESSIONAL_KYC: "/professional/kyc",
  PROFESSIONAL_DOCUMENTS: "/professional/documents",
  PROFESSIONAL_SUPPORT: "/professional/support",
  PROFESSIONAL_SETTINGS: "/professional/settings",

  // Backward compatibility alias for /technician
  TECHNICIAN_DASHBOARD: "/professional/jobs",
  TECHNICIAN_JOBS: "/professional/jobs",
  TECHNICIAN_SCHEDULE: "/professional/calendar",
  TECHNICIAN_EARNINGS: "/professional/earnings",
  TECHNICIAN_REVIEWS: "/professional/ratings",
  TECHNICIAN_PROFILE: "/professional/profile",

  // ─── Admin Platform (/admin/*) (Section 46) ───
  ADMIN: "/admin",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_CUSTOMERS: "/admin/customers",
  ADMIN_PROFESSIONALS: "/admin/professionals",
  ADMIN_SERVICES: "/admin/services",
  ADMIN_CATEGORIES: "/admin/categories",
  ADMIN_PRICING: "/admin/pricing",
  ADMIN_PAYMENTS: "/admin/payments",
  ADMIN_REFUNDS: "/admin/refunds",
  ADMIN_MEMBERSHIP: "/admin/membership",
  ADMIN_COUPONS: "/admin/coupons",
  ADMIN_REVIEWS: "/admin/reviews",
  ADMIN_SUPPORT: "/admin/support",
  ADMIN_NOTIFICATIONS: "/admin/notifications",
  ADMIN_CMS: "/admin/cms",
  ADMIN_REPORTS: "/admin/reports",
  ADMIN_AUDIT_LOGS: "/admin/audit-logs",
  ADMIN_SETTINGS: "/admin/settings",

  // Backward compatibility alias for admin
  ADMIN_DASHBOARD: "/admin/analytics",
  ADMIN_USERS: "/admin/customers",
  ADMIN_TECHNICIANS: "/admin/professionals",

  // ─── Catch-all ───
  NOT_FOUND: "*",
} as const;

export type RouteKey = keyof typeof ROUTES;
export type AppRoute = (typeof ROUTES)[RouteKey];

/**
 * Helper to build dynamic routes.
 * e.g., buildRoute(ROUTES.SERVICE_CATEGORY, { category: 'electrical' })
 */
export function buildRoute(
  route: string,
  params: Record<string, string>
): string {
  let result = route;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, encodeURIComponent(value));
  }
  return result;
}
