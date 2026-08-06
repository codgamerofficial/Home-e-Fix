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
  SERVICE_DETAIL: "/services/:categorySlug",

  // Booking
  BOOKING: "/booking",
  BOOKING_NEW: "/booking",
  BOOKING_CONFIRM: "/booking",
  BOOKING_SUCCESS: "/booking/confirmation",
  BOOKING_DETAIL: "/booking/confirmation/:bookingId",

  // Auth
  LOGIN: "/auth/login",
  REGISTER: "/auth/register",
  FORGOT_PASSWORD: "/auth/forgot-password",
  RESET_PASSWORD: "/auth/forgot-password",
  VERIFY_EMAIL: "/auth/otp",

  // Customer Dashboard
  CUSTOMER_DASHBOARD: "/dashboard/orders",
  CUSTOMER_BOOKINGS: "/dashboard/orders",
  CUSTOMER_PROFILE: "/dashboard/profile",
  CUSTOMER_ADDRESSES: "/dashboard/addresses",
  CUSTOMER_WALLET: "/dashboard/wallet",
  CUSTOMER_SUPPORT: "/dashboard/help",

  // Technician Dashboard
  TECHNICIAN_DASHBOARD: "/technician/jobs",
  TECHNICIAN_JOBS: "/technician/jobs",
  TECHNICIAN_SCHEDULE: "/technician/availability",
  TECHNICIAN_EARNINGS: "/technician/earnings",
  TECHNICIAN_REVIEWS: "/technician/ratings",
  TECHNICIAN_PROFILE: "/technician/jobs",

  // Admin Dashboard
  ADMIN_DASHBOARD: "/admin/analytics",
  ADMIN_USERS: "/admin/customers",
  ADMIN_SERVICES: "/admin/services",
  ADMIN_BOOKINGS: "/admin/bookings",
  ADMIN_TECHNICIANS: "/admin/technicians",
  ADMIN_ANALYTICS: "/admin/analytics",
  ADMIN_SETTINGS: "/admin/reports",

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
