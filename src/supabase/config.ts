/**
 * Supabase constants — table names, bucket names, edge function names.
 * Centralizes all Supabase resource references.
 */
export const SUPABASE_TABLES = {
  USERS: "users",
  PROFILES: "profiles",
  SERVICES: "services",
  SERVICE_CATEGORIES: "service_categories",
  BOOKINGS: "bookings",
  TECHNICIANS: "technicians",
  REVIEWS: "reviews",
  PAYMENTS: "payments",
  ADDRESSES: "addresses",
  NOTIFICATIONS: "notifications",
  COUPONS: "coupons",
} as const;

export const SUPABASE_BUCKETS = {
  AVATARS: "avatars",
  SERVICE_IMAGES: "service-images",
  DOCUMENTS: "documents",
  REVIEWS: "review-images",
} as const;

export const SUPABASE_FUNCTIONS = {
  SEND_OTP: "send-otp",
  VERIFY_OTP: "verify-otp",
  PROCESS_PAYMENT: "process-payment",
  SEND_NOTIFICATION: "send-notification",
  ASSIGN_TECHNICIAN: "assign-technician",
} as const;
