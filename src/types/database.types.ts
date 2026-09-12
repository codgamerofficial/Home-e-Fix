/**
 * Home-e-Fix Database Type Contract
 * Authoritative PostgreSQL schema representations matching Supabase database tables.
 * Strict UUIDs, foreign keys, audit timestamps, and operational status enums.
 */

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

/* ─────────────────────────────────────────────────────────────
 * CORE OPERATIONAL ENUMS
 * ──────────────────────────────────────────────────────────── */

export type UserRole =
  | "CUSTOMER"
  | "PROFESSIONAL"
  | "SUPPORT_AGENT"
  | "OPERATIONS_MANAGER"
  | "FINANCE_ADMIN"
  | "ADMIN"
  | "SUPER_ADMIN";

export type BookingStatus =
  | "DRAFT"
  | "PENDING_PAYMENT"
  | "PAYMENT_PROCESSING"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "MATCHING"
  | "ASSIGNMENT_PENDING"
  | "PROFESSIONAL_ASSIGNED"
  | "PROFESSIONAL_ACCEPTED"
  | "PROFESSIONAL_ON_THE_WAY"
  | "PROFESSIONAL_ARRIVED"
  | "SERVICE_STARTED"
  | "AWAITING_CUSTOMER_APPROVAL"
  | "ADDITIONAL_CHARGES_PENDING"
  | "ADDITIONAL_CHARGES_APPROVED"
  | "SERVICE_COMPLETED"
  | "CUSTOMER_CONFIRMED"
  | "INVOICE_GENERATED"
  | "PAYMENT_COMPLETED"
  | "WARRANTY_ACTIVE"
  | "REVIEW_PENDING"
  | "COMPLETED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "REFUNDED"
  | "DISPUTED";

export type PaymentStatus =
  | "CREATED"
  | "PENDING"
  | "PROCESSING"
  | "SUCCESS"
  | "FAILED"
  | "CANCELLED"
  | "REFUND_PENDING"
  | "PARTIALLY_REFUNDED"
  | "REFUNDED"
  | "DISPUTED";

export type PaymentMethod =
  | "UPI"
  | "CARD"
  | "NETBANKING"
  | "WALLET"
  | "CASH_AFTER_SERVICE"
  | "RAZORPAY";

export type KYCStatus =
  | "DRAFT"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "CHANGES_REQUIRED"
  | "APPROVED"
  | "REJECTED"
  | "SUSPENDED";

export type PricingModel =
  | "FIXED"
  | "STARTING_FROM"
  | "QUOTATION"
  | "PER_UNIT";

export type WarrantyStatus =
  | "ACTIVE"
  | "EXPIRED"
  | "CLAIMED"
  | "CANCELLED";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING_FOR_CUSTOMER"
  | "RESOLVED"
  | "CLOSED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type MembershipPlanType = "MONTHLY_99" | "ANNUAL_999";
export type MembershipStatus = "ACTIVE" | "EXPIRED" | "CANCELLED" | "PENDING_RENEWAL";

export type WalletTxType = "CREDIT" | "DEBIT" | "REFUND" | "CASHBACK" | "ADJUSTMENT";
export type PayoutStatus = "PENDING" | "APPROVED" | "INITIATED" | "PROCESSING" | "COMPLETED" | "FAILED";

/* ─────────────────────────────────────────────────────────────
 * AUTH & USER ENTITIES
 * ──────────────────────────────────────────────────────────── */

export interface DbUser {
  id: string; // UUID references auth.users.id
  email: string;
  phone: string | null;
  role: UserRole;
  is_verified: boolean;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
  updated_at: string;
  deleted_at: string | null;
}

export interface DbProfile {
  id: string; // UUID primary key
  user_id: string; // UUID references users.id
  first_name: string;
  last_name: string;
  avatar_url: string | null;
  gender: string | null;
  date_of_birth: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCustomer {
  id: string; // UUID primary key
  user_id: string; // UUID references users.id
  loyalty_tier: "STANDARD" | "PLUS";
  preferred_language: string;
  default_address_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfessional {
  id: string; // UUID primary key
  user_id: string; // UUID references users.id
  application_number: string;
  experience_years: number;
  kyc_status: KYCStatus;
  kyc_rejection_reason: string | null;
  is_available: boolean;
  is_emergency_eligible: boolean;
  rating_average: number;
  rating_count: number;
  completion_rate: number;
  acceptance_rate: number;
  primary_hub_area_id: string | null;
  police_verification_status: "PENDING" | "VERIFIED" | "REJECTED";
  bank_account_verified: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbProfessionalDocument {
  id: string;
  professional_id: string;
  document_type: "AADHAAR" | "PAN" | "POLICE_CLEARANCE" | "TRADE_CERTIFICATE" | "DRIVING_LICENSE";
  document_number_masked: string;
  storage_path: string; // Supabase private bucket path
  verification_status: "PENDING" | "VERIFIED" | "REJECTED";
  verified_by: string | null;
  verified_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfessionalSkill {
  id: string;
  professional_id: string;
  service_category_id: string;
  skill_name: string;
  proficiency_level: "APPRENTICE" | "JOURNEYMAN" | "MASTER";
  certified: boolean;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────
 * SERVICE CATALOGUE & PRICING
 * ──────────────────────────────────────────────────────────── */

export interface DbServiceCategory {
  id: string;
  name: string;
  slug: string;
  description: string;
  icon_name: string;
  image_url: string | null;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface DbService {
  id: string;
  category_id: string;
  name: string;
  slug: string;
  description: string;
  pricing_model: PricingModel;
  base_price: number;
  emergency_price: number;
  tax_rate_percent: number;
  duration_minutes: number;
  warranty_days: number;
  warranty_description: string | null;
  inclusions: string[];
  exclusions: string[];
  faqs: { question: string; answer: string }[];
  is_active: boolean;
  is_emergency_available: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbServiceVariant {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  duration_minutes: number;
  is_active: boolean;
  created_at: string;
}

export interface DbServiceAddon {
  id: string;
  service_id: string;
  name: string;
  description: string | null;
  price: number;
  is_active: boolean;
  created_at: string;
}

export interface DbServiceWarranty {
  id: string;
  booking_id: string;
  service_id: string;
  customer_id: string;
  warranty_number: string;
  start_date: string;
  end_date: string;
  terms: string;
  status: WarrantyStatus;
  created_at: string;
  updated_at: string;
}

/* ─────────────────────────────────────────────────────────────
 * ADDRESSES & GEOLOCATION
 * ──────────────────────────────────────────────────────────── */

export interface DbAddress {
  id: string;
  user_id: string;
  label: "HOME" | "WORK" | "OTHER";
  recipient_name: string;
  recipient_phone: string;
  house_flat: string;
  street_area: string;
  landmark: string | null;
  city: string;
  state: string;
  pincode: string;
  latitude: number | null;
  longitude: number | null;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbServiceArea {
  id: string;
  city_name: string;
  area_name: string;
  pincode: string;
  is_operational: boolean;
  is_emergency_enabled: boolean;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────
 * BOOKINGS & STATE MACHINE
 * ──────────────────────────────────────────────────────────── */

export interface DbBooking {
  id: string;
  booking_number: string;
  customer_id: string;
  address_id: string;
  status: BookingStatus;
  is_emergency: boolean;
  scheduled_date: string; // YYYY-MM-DD
  time_slot_id: string;
  service_notes: string | null;
  labour_charge: number;
  material_charge: number;
  addon_charge: number;
  emergency_fee: number;
  platform_fee: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_status: PaymentStatus;
  coupon_code: string | null;
  invoice_id: string | null;
  cancellation_reason: string | null;
  cancelled_by: string | null;
  cancelled_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbBookingItem {
  id: string;
  booking_id: string;
  service_id: string;
  variant_id: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  created_at: string;
}

export interface DbBookingStatusHistory {
  id: string;
  booking_id: string;
  previous_status: BookingStatus | null;
  new_status: BookingStatus;
  changed_by: string; // user UUID or 'SYSTEM'
  reason: string | null;
  metadata: Json | null;
  created_at: string;
}

export interface DbBookingAssignment {
  id: string;
  booking_id: string;
  professional_id: string;
  status: "OFFERED" | "ACCEPTED" | "REJECTED" | "REASSIGNED" | "EXPIRED";
  assigned_by: string; // 'SYSTEM_ALGORITHM' or admin UUID
  response_timeout_at: string;
  responded_at: string | null;
  rejection_reason: string | null;
  created_at: string;
}

export interface DbBookingMaterial {
  id: string;
  booking_id: string;
  item_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  tax_percent: number;
  customer_approval_status: "PENDING" | "APPROVED" | "REJECTED";
  requested_by: string; // professional UUID
  approved_at: string | null;
  created_at: string;
}

export interface DbBookingMedia {
  id: string;
  booking_id: string;
  media_type: "ISSUE_PREVIEW" | "BEFORE_JOB" | "AFTER_JOB" | "RECEIPT";
  storage_path: string;
  uploaded_by: string;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────
 * PAYMENTS & INVOICES
 * ──────────────────────────────────────────────────────────── */

export interface DbPayment {
  id: string;
  booking_id: string;
  customer_id: string;
  gateway: "RAZORPAY" | "CASH" | "WALLET";
  gateway_order_id: string | null;
  gateway_payment_id: string | null;
  gateway_signature: string | null;
  amount: number;
  currency: string;
  status: PaymentStatus;
  error_code: string | null;
  error_description: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbRefund {
  id: string;
  payment_id: string;
  booking_id: string;
  amount: number;
  reason: string;
  initiated_by: string; // admin UUID or 'SYSTEM'
  gateway_refund_id: string | null;
  status: "PENDING" | "PROCESSED" | "FAILED";
  processed_at: string | null;
  created_at: string;
}

export interface DbInvoice {
  id: string;
  invoice_number: string;
  booking_id: string;
  customer_id: string;
  professional_id: string | null;
  invoice_date: string;
  subtotal_amount: number;
  tax_amount: number;
  discount_amount: number;
  total_amount: number;
  gstin_company: string;
  pdf_storage_path: string | null;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────
 * WALLET & PAYOUTS
 * ──────────────────────────────────────────────────────────── */

export interface DbWallet {
  id: string;
  user_id: string;
  balance: number;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

export interface DbWalletTransaction {
  id: string;
  wallet_id: string;
  type: WalletTxType;
  amount: number;
  balance_after: number;
  title: string;
  reference_id: string | null; // booking_id or payment_id
  created_at: string;
}

export interface DbProfessionalEarnings {
  id: string;
  professional_id: string;
  booking_id: string;
  gross_amount: number;
  platform_commission: number;
  net_earnings: number;
  material_reimbursement: number;
  is_settled: boolean;
  payout_id: string | null;
  created_at: string;
}

export interface DbPayout {
  id: string;
  professional_id: string;
  amount: number;
  status: PayoutStatus;
  gateway_payout_id: string | null;
  bank_reference_number: string | null;
  created_at: string;
  processed_at: string | null;
}

/* ─────────────────────────────────────────────────────────────
 * AUDIT LOGS & GOVERNANCE
 * ──────────────────────────────────────────────────────────── */

export interface DbAuditLog {
  id: string;
  actor_id: string;
  actor_role: UserRole;
  action: string;
  resource_type: string;
  resource_id: string;
  before_state: Json | null;
  after_state: Json | null;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
}

/* ─────────────────────────────────────────────────────────────
 * REVIEWS, SUPPORT, TICKETS
 * ──────────────────────────────────────────────────────────── */

export interface DbReview {
  id: string;
  booking_id: string;
  customer_id: string;
  professional_id: string;
  rating: number; // 1-5
  comment: string | null;
  is_verified_booking: boolean;
  is_published: boolean;
  moderated_by: string | null;
  created_at: string;
}

export interface DbSupportTicket {
  id: string;
  ticket_number: string;
  user_id: string;
  booking_id: string | null;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  assigned_to_agent_id: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}
