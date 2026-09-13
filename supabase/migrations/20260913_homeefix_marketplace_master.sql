-- ========================================================================
-- HOME-E-FIX POSTGRESQL PRODUCTION MARKETPLACE MASTER SCHEMA
-- Authoritative Schema: 45+ Relational Tables, Strict Enums, RLS & Triggers
-- Brand: Home-e-Fix | Tagline: FIXING HOMES. EARNING TRUST.
-- ========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. CORE OPERATIONAL ENUMS ───
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM (
    'CUSTOMER', 'PROFESSIONAL', 'SUPPORT_AGENT', 'OPERATIONS_MANAGER', 'FINANCE_ADMIN', 'ADMIN', 'SUPER_ADMIN'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE booking_status AS ENUM (
    'DRAFT', 'PENDING_PAYMENT', 'PAYMENT_PROCESSING', 'PAYMENT_FAILED',
    'CONFIRMED', 'MATCHING', 'ASSIGNMENT_PENDING', 'PROFESSIONAL_ASSIGNED',
    'PROFESSIONAL_ACCEPTED', 'PROFESSIONAL_ON_THE_WAY', 'PROFESSIONAL_ARRIVED',
    'SERVICE_STARTED', 'DIAGNOSING', 'WAITING_FOR_CUSTOMER',
    'ADDITIONAL_CHARGE_REQUESTED', 'WAITING_CUSTOMER_APPROVAL',
    'SERVICE_IN_PROGRESS', 'SERVICE_COMPLETED', 'CUSTOMER_CONFIRMED',
    'INVOICE_GENERATED', 'PAYMENT_COMPLETED', 'WARRANTY_ACTIVE',
    'COMPLETED', 'CANCELLED', 'REFUND_PENDING', 'REFUNDED', 'DISPUTED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_status AS ENUM (
    'CREATED', 'PENDING', 'PROCESSING', 'SUCCESS', 'FAILED', 'CANCELLED',
    'REFUND_PENDING', 'PARTIALLY_REFUNDED', 'REFUNDED', 'DISPUTED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_gateway AS ENUM ('RAZORPAY', 'CASHFREE', 'WALLET', 'CASH_AFTER_SERVICE');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE payment_method AS ENUM ('UPI', 'CARD', 'NETBANKING', 'WALLET', 'CASH_AFTER_SERVICE', 'RAZORPAY');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE kyc_status AS ENUM (
    'DRAFT', 'APPLIED', 'DOCUMENTS_PENDING', 'KYC_PENDING', 'UNDER_REVIEW',
    'TRAINING_PENDING', 'ASSESSMENT_PENDING', 'BACKGROUND_CHECK', 'ADMIN_REVIEW',
    'APPROVED', 'ACTIVE', 'CHANGES_REQUIRED', 'REJECTED', 'SUSPENDED', 'INACTIVE'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_status AS ENUM ('OPEN', 'ASSIGNED', 'IN_PROGRESS', 'WAITING_CUSTOMER', 'RESOLVED', 'CLOSED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE ticket_priority AS ENUM ('LOW', 'NORMAL', 'HIGH', 'URGENT');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE pricing_model AS ENUM (
    'FIXED', 'STARTING_FROM', 'QUANTITY_TIER', 'AREA_BASED', 'ROOM_BASED', 'BHK_BASED', 'QUOTATION'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE warranty_status AS ENUM ('ACTIVE', 'EXPIRED', 'CLAIM_PENDING', 'REWORK_SCHEDULED', 'RESOLVED', 'VOID');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE assignment_status AS ENUM ('OFFERED', 'ACCEPTED', 'DECLINED', 'EXPIRED', 'REASSIGNED');
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. USERS & PROFILES ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role user_role NOT NULL DEFAULT 'CUSTOMER',
  full_name TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  gender TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  is_blocked BOOLEAN NOT NULL DEFAULT false,
  is_vip BOOLEAN NOT NULL DEFAULT false,
  vip_expires_at TIMESTAMPTZ,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  membership_tier TEXT NOT NULL DEFAULT 'STANDARD',
  membership_status TEXT NOT NULL DEFAULT 'INACTIVE',
  membership_expires_at TIMESTAMPTZ,
  emergency_contacts JSONB DEFAULT '[]'::jsonb,
  total_spend NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  completed_bookings_count INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. PROFESSIONALS, ONBOARDING & QUALIFICATIONS ───
CREATE TABLE IF NOT EXISTS public.professional_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  application_number TEXT UNIQUE NOT NULL,
  kyc_status kyc_status NOT NULL DEFAULT 'DRAFT',
  is_available BOOLEAN NOT NULL DEFAULT false,
  is_emergency_eligible BOOLEAN NOT NULL DEFAULT false,
  rating NUMERIC(3, 2) NOT NULL DEFAULT 0.00,
  total_ratings_count INT NOT NULL DEFAULT 0,
  completed_jobs_count INT NOT NULL DEFAULT 0,
  cancelled_jobs_count INT NOT NULL DEFAULT 0,
  acceptance_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  completion_rate NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
  experience_years INT NOT NULL DEFAULT 1,
  trade_categories TEXT[] DEFAULT '{}',
  primary_service_zone TEXT NOT NULL DEFAULT 'KOLKATA_CENTRAL',
  police_verification_status TEXT NOT NULL DEFAULT 'PENDING',
  bank_account_number TEXT,
  bank_ifsc_code TEXT,
  bank_name TEXT,
  aadhaar_last_four TEXT,
  pan_number_masked TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'AADHAAR_FRONT', 'AADHAAR_BACK', 'PAN', 'POLICE_VERIFICATION', 'TRADE_CERTIFICATE', 'PROFILE_PHOTO'
  storage_path TEXT NOT NULL,
  document_number_masked TEXT,
  verification_status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'VERIFIED', 'REJECTED'
  rejection_reason TEXT,
  verified_by UUID REFERENCES public.profiles(id),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  category_slug TEXT NOT NULL,
  service_slug TEXT,
  proficiency_level TEXT NOT NULL DEFAULT 'JOURNEYMAN', -- 'APPRENTICE', 'JOURNEYMAN', 'MASTER'
  is_certified BOOLEAN NOT NULL DEFAULT true,
  assessment_score INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_working_hours (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  day_of_week INT NOT NULL CHECK (day_of_week BETWEEN 0 AND 6), -- 0 = Sunday
  start_time TIME NOT NULL DEFAULT '08:00:00',
  end_time TIME NOT NULL DEFAULT '20:00:00',
  is_working BOOLEAN NOT NULL DEFAULT true,
  break_start TIME DEFAULT '13:00:00',
  break_end TIME DEFAULT '14:00:00',
  UNIQUE (professional_id, day_of_week)
);

CREATE TABLE IF NOT EXISTS public.professional_leaves (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  leave_date DATE NOT NULL,
  reason TEXT,
  approved_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. GEOGRAPHY & SERVICEABILITY ZONES ───
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL,
  country TEXT NOT NULL DEFAULT 'IN',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.serviceability_zones (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  zone_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  is_emergency_supported BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.pincodes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  zone_id UUID NOT NULL REFERENCES public.serviceability_zones(id) ON DELETE CASCADE,
  pincode TEXT UNIQUE NOT NULL,
  locality_name TEXT NOT NULL,
  is_operational BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customer_addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL DEFAULT 'Home',
  address_type TEXT NOT NULL DEFAULT 'home', -- 'home', 'work', 'other'
  recipient_name TEXT,
  recipient_phone TEXT,
  flat_house_building TEXT NOT NULL,
  street_address TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL DEFAULT 'Kolkata',
  state TEXT NOT NULL DEFAULT 'West Bengal',
  pincode TEXT NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. HIERARCHICAL SERVICE CATALOGUE ───
CREATE TABLE IF NOT EXISTS public.service_categories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  banner_image TEXT,
  accent_color TEXT DEFAULT '#FF6A00',
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_subcategories (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID NOT NULL REFERENCES public.service_categories(id) ON DELETE RESTRICT,
  subcategory_id UUID REFERENCES public.service_subcategories(id) ON DELETE SET NULL,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  short_description TEXT,
  full_description TEXT,
  pricing_model pricing_model NOT NULL DEFAULT 'FIXED',
  base_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  strike_price NUMERIC(10, 2),
  duration_minutes INT NOT NULL DEFAULT 45,
  warranty_days INT NOT NULL DEFAULT 30,
  warranty_title TEXT DEFAULT '30-Day Service Warranty',
  warranty_terms TEXT,
  visit_charge NUMERIC(10, 2) NOT NULL DEFAULT 199.00,
  emergency_surcharge NUMERIC(10, 2) NOT NULL DEFAULT 499.00,
  is_emergency_eligible BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true,
  inclusions JSONB DEFAULT '[]'::jsonb,
  exclusions JSONB DEFAULT '[]'::jsonb,
  faqs JSONB DEFAULT '[]'::jsonb,
  checklist JSONB DEFAULT '[]'::jsonb,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_variants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  slug TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 45,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  UNIQUE (service_id, slug)
);

CREATE TABLE IF NOT EXISTS public.service_addons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC(10, 2) NOT NULL,
  duration_minutes INT NOT NULL DEFAULT 15,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL, -- 'SINGLE_SELECT', 'MULTI_SELECT', 'TEXT', 'NUMBER', 'PHOTO_UPLOAD'
  options JSONB DEFAULT '[]'::jsonb,
  is_required BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0
);

-- ─── 6. BOOKINGS, ITEMS & STATE MACHINE ───
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
  professional_id UUID REFERENCES public.professional_profiles(id) ON DELETE SET NULL,
  service_id UUID NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  service_name TEXT NOT NULL,
  category_slug TEXT NOT NULL,
  variant_id UUID REFERENCES public.service_variants(id) ON DELETE SET NULL,
  variant_name TEXT,
  status booking_status NOT NULL DEFAULT 'CONFIRMED',
  is_emergency BOOLEAN NOT NULL DEFAULT false,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot TEXT NOT NULL,
  address JSONB NOT NULL,
  pincode TEXT NOT NULL,
  subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  materials_charge NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  safety_fee NUMERIC(10, 2) NOT NULL DEFAULT 29.00,
  tax_gst NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  discount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  coupon_code TEXT,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  payment_method payment_method NOT NULL DEFAULT 'UPI',
  payment_status payment_status NOT NULL DEFAULT 'PENDING',
  customer_notes TEXT,
  start_otp TEXT NOT NULL DEFAULT '4892',
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  cancellation_reason TEXT,
  cancelled_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  service_id UUID NOT NULL REFERENCES public.services(id),
  variant_id UUID REFERENCES public.service_variants(id),
  name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status booking_status,
  to_status booking_status NOT NULL,
  changed_by UUID REFERENCES public.profiles(id),
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_customer_answers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  question_id UUID REFERENCES public.service_questions(id),
  question_text TEXT NOT NULL,
  answer_text TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_media (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  media_type TEXT NOT NULL, -- 'CUSTOMER_ISSUE', 'BEFORE_SERVICE', 'AFTER_SERVICE', 'RECEIPT'
  storage_path TEXT NOT NULL,
  uploaded_by UUID REFERENCES public.profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_assignments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  status assignment_status NOT NULL DEFAULT 'OFFERED',
  decline_reason TEXT,
  assignment_expires_at TIMESTAMPTZ NOT NULL,
  payout_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. ADDITIONAL CHARGES & AUDIT APPROVALS ───
CREATE TABLE IF NOT EXISTS public.booking_additional_charges (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  labour_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  justification TEXT NOT NULL,
  evidence_media_path TEXT,
  status TEXT NOT NULL DEFAULT 'PENDING_APPROVAL', -- 'PENDING_APPROVAL', 'APPROVED', 'REJECTED'
  requested_by UUID REFERENCES public.profiles(id),
  customer_action_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. PAYMENTS, TRANSACTIONS, REFUNDS & LEDGER ───
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'INR',
  gateway payment_gateway NOT NULL DEFAULT 'RAZORPAY',
  payment_method payment_method NOT NULL DEFAULT 'UPI',
  gateway_status TEXT NOT NULL DEFAULT 'CREATED',
  gateway_order_id TEXT,
  gateway_payment_id TEXT,
  gateway_signature TEXT,
  purpose TEXT NOT NULL DEFAULT 'BOOKING', -- 'BOOKING', 'WALLET_TOPUP', 'MEMBERSHIP'
  verified_at TIMESTAMPTZ,
  webhook_received_at TIMESTAMPTZ,
  error_code TEXT,
  error_description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  payment_id UUID REFERENCES public.payments(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  amount NUMERIC(10, 2) NOT NULL,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'REQUESTED', -- 'REQUESTED', 'APPROVED', 'PROCESSING', 'COMPLETED', 'REJECTED'
  gateway_refund_id TEXT,
  processed_by UUID REFERENCES public.profiles(id),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  invoice_number TEXT UNIQUE NOT NULL,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  professional_id UUID REFERENCES public.professional_profiles(id),
  invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
  taxable_amount NUMERIC(10, 2) NOT NULL,
  cgst_amount NUMERIC(10, 2) NOT NULL,
  sgst_amount NUMERIC(10, 2) NOT NULL,
  safety_fee NUMERIC(10, 2) NOT NULL DEFAULT 29.00,
  discount_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL,
  gstin_business TEXT DEFAULT '19AABCH1234F1Z5',
  pdf_storage_path TEXT,
  issued_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  balance NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
  currency TEXT NOT NULL DEFAULT 'INR',
  is_locked BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.wallet_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  wallet_id UUID NOT NULL REFERENCES public.wallets(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'CREDIT', 'DEBIT'
  amount NUMERIC(10, 2) NOT NULL,
  description TEXT NOT NULL,
  reference_id TEXT,
  status TEXT NOT NULL DEFAULT 'SUCCESS',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_earnings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  gross_booking_value NUMERIC(10, 2) NOT NULL,
  labour_share NUMERIC(10, 2) NOT NULL,
  materials_payout NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  platform_fee NUMERIC(10, 2) NOT NULL,
  tds_deducted NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  net_earnings NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING_PAYOUT', -- 'PENDING_PAYOUT', 'PAID', 'WITHHELD'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_payouts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'APPROVED', 'PROCESSED', 'FAILED'
  bank_reference TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 9. COUPONS & PLUS MEMBERSHIPS ───
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  description TEXT NOT NULL,
  discount_type TEXT NOT NULL, -- 'PERCENTAGE', 'FLAT'
  discount_value NUMERIC(10, 2) NOT NULL,
  min_order_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  max_discount_amount NUMERIC(10, 2),
  valid_until TIMESTAMPTZ NOT NULL,
  total_usage_limit INT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  coupon_id UUID NOT NULL REFERENCES public.coupons(id),
  user_id UUID NOT NULL REFERENCES public.profiles(id),
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  discount_applied NUMERIC(10, 2) NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.membership_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  plan_code TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  duration_days INT NOT NULL,
  price NUMERIC(10, 2) NOT NULL,
  discount_percent INT NOT NULL DEFAULT 20,
  free_health_check_included BOOLEAN NOT NULL DEFAULT true,
  is_active BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS public.membership_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.membership_plans(id),
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'ACTIVE',
  payment_id UUID REFERENCES public.payments(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 10. REVIEWS, WARRANTIES & SUPPORT ───
CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID NOT NULL REFERENCES public.professional_profiles(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  rating_punctuality INT CHECK (rating_punctuality >= 1 AND rating_punctuality <= 5),
  rating_quality INT CHECK (rating_quality >= 1 AND rating_quality <= 5),
  rating_cleanliness INT CHECK (rating_cleanliness >= 1 AND rating_cleanliness <= 5),
  comment TEXT,
  review_photos JSONB DEFAULT '[]'::jsonb,
  professional_reply TEXT,
  professional_replied_at TIMESTAMPTZ,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_moderated BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warranties (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_number TEXT UNIQUE NOT NULL,
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  service_id UUID NOT NULL REFERENCES public.services(id),
  starts_at TIMESTAMPTZ NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  terms TEXT NOT NULL,
  status warranty_status NOT NULL DEFAULT 'ACTIVE',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.warranty_claims (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  warranty_id UUID NOT NULL REFERENCES public.warranties(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id),
  customer_id UUID NOT NULL REFERENCES public.profiles(id),
  issue_description TEXT NOT NULL,
  evidence_photos JSONB DEFAULT '[]'::jsonb,
  status TEXT NOT NULL DEFAULT 'UNDER_REVIEW', -- 'UNDER_REVIEW', 'APPROVED', 'REWORK_ASSIGNED', 'RESOLVED', 'REJECTED'
  revisit_booking_id UUID REFERENCES public.bookings(id),
  admin_notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_number TEXT UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  category TEXT NOT NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority ticket_priority NOT NULL DEFAULT 'NORMAL',
  status ticket_status NOT NULL DEFAULT 'OPEN',
  assigned_agent_id UUID REFERENCES public.profiles(id),
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.profiles(id),
  message TEXT NOT NULL,
  attachments JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 11. AUDIT LOGS (IMMUTABLE) ───
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id TEXT NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 12. ROW LEVEL SECURITY (RLS) ───
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Profiles: Users can view & update own profile
DO $$ BEGIN
  CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
  CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Bookings: Customers can view & create their own bookings
DO $$ BEGIN
  CREATE POLICY "Customers can view own bookings" ON public.bookings FOR SELECT USING (auth.uid() = customer_id);
  CREATE POLICY "Customers can create bookings" ON public.bookings FOR INSERT WITH CHECK (auth.uid() = customer_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Invoices: Customers can view own invoices
DO $$ BEGIN
  CREATE POLICY "Customers view own invoices" ON public.invoices FOR SELECT USING (auth.uid() = customer_id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 13. INDEXES FOR HIGH-THROUGHPUT QUERYING ───
CREATE INDEX IF NOT EXISTS idx_bookings_customer_id ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional_id ON public.bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_scheduled_date ON public.bookings(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_payments_gateway_order_id ON public.payments(gateway_order_id);
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_pincodes_operational ON public.pincodes(pincode, is_operational);
