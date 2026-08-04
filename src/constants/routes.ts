/**
 * Centralized route path constants.
 * Always reference these instead of hardcoding paths.
 */
export const ROUTES = {
  // Public
  HOME: "/",
  ABOUT: "/about",
  CONTACT: "/contact",
  TERMS: "/terms",
  PRIVACY: "/privacy",

  // Services
  SERVICES: "/services",
  SERVICE_CATEGORY: "/services/:categorySlug",
  SERVICE_DETAIL: "/services/:categorySlug/:serviceSlug",

  // Booking
  BOOKING: "/booking",
  BOOKING_NEW: "/booking/new",
  BOOKING_CONFIRM: "/booking/confirm",
  BOOKING_SUCCESS: "/booking/success",
  BOOKING_DETAIL: "/booking/:bookingId",

  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/reset-password",
  VERIFY_EMAIL: "/auth/verify-email",

  // Customer Dashboard
  CUSTOMER_DASHBOARD: "/dashboard",
  CUSTOMER_BOOKINGS: "/dashboard/bookings",
  CUSTOMER_PROFILE: "/dashboard/profile",
  CUSTOMER_ADDRESSES: "/dashboard/addresses",
  CUSTOMER_WALLET: "/dashboard/wallet",
  CUSTOMER_SUPPORT: "/dashboard/support",

  // Technician Dashboard
  TECHNICIAN_DASHBOARD: "/technician",
  TECHNICIAN_JOBS: "/technician/jobs",
  TECHNICIAN_SCHEDULE: "/technician/schedule",
  TECHNICIAN_EARNINGS: "/technician/earnings",
  TECHNICIAN_REVIEWS: "/technician/reviews",
  TECHNICIAN_PROFILE: "/technician/profile",

  // Admin Dashboard
  ADMIN_DASHBOARD: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_SERVICES: "/admin/services",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_TECHNICIANS: "/admin/technicians",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS: "/admin/settings",

  // Catch-all
  NOT_FOUND: "*",
} as const;

/**
 * Helper to build dynamic routes.
 */
export function buildRoute(
  route: string,
  params: Record<string, string>
): string {
  let result = route;
  for (const [key, value] of Object.entries(params)) {
    result = result.replace(`:${key}`, value);
  }
  return result;
}
