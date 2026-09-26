-- ========================================================================
-- HOME-E-FIX POSTGRESQL PRODUCTION MARKETPLACE MASTER SCHEMA (2026 UPDATE)
-- Brand: HOME-E-FIX | Tagline: YOUR HOME. OUR FIX.
-- Initial Market: Kolkata (Multi-city ready architecture)
-- Strict Foreign Keys, UUID Primary Keys, Audit Timestamps, Enums & RLS
-- ========================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. CORE ENUMS ───
DO $$ BEGIN
  CREATE TYPE hef_user_role AS ENUM ('CUSTOMER', 'PROFESSIONAL', 'ADMIN', 'SUPER_ADMIN');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hef_booking_status AS ENUM (
    'draft', 'requested', 'pending_assignment', 'assigned', 'professional_confirmed',
    'on_the_way', 'arrived', 'inspection', 'quote_pending', 'quote_approved',
    'in_progress', 'completed', 'cancelled', 'disputed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hef_payment_status AS ENUM (
    'pending', 'unpaid', 'paid', 'refunded', 'failed'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hef_pricing_type AS ENUM (
    'fixed', 'starting_from', 'range', 'inspection_required', 'quote_required'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hef_visit_fee_policy AS ENUM (
    'waived_on_service', 'charged_on_decline', 'fixed', 'free'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE hef_verification_status AS ENUM (
    'pending', 'verified', 'rejected', 'suspended'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. USERS, CUSTOMERS & PROFESSIONALS ───
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role hef_user_role NOT NULL DEFAULT 'CUSTOMER',
  full_name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  default_address_id UUID,
  total_bookings INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID UNIQUE NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  profile_photo TEXT,
  phone TEXT NOT NULL,
  bio TEXT,
  years_experience INT NOT NULL DEFAULT 1,
  verification_status hef_verification_status NOT NULL DEFAULT 'pending',
  availability_status BOOLEAN NOT NULL DEFAULT true,
  average_rating NUMERIC(3,2) NOT NULL DEFAULT 5.00,
  total_reviews INT NOT NULL DEFAULT 0,
  completed_jobs INT NOT NULL DEFAULT 0,
  city TEXT NOT NULL DEFAULT 'Kolkata',
  service_area TEXT NOT NULL DEFAULT 'All Kolkata',
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  emergency_available BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 3. CITIES & SERVICE AREAS ───
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT UNIQUE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  state TEXT NOT NULL DEFAULT 'West Bengal',
  country TEXT NOT NULL DEFAULT 'India',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_areas (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  pincode TEXT NOT NULL,
  zone_code TEXT NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 4. ADDRESSES ───
CREATE TABLE IF NOT EXISTS public.addresses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  house_flat TEXT NOT NULL,
  building_name TEXT,
  street TEXT NOT NULL,
  locality TEXT NOT NULL,
  landmark TEXT,
  city TEXT NOT NULL DEFAULT 'Kolkata',
  state TEXT NOT NULL DEFAULT 'West Bengal',
  pincode TEXT NOT NULL,
  latitude NUMERIC(10,7),
  longitude NUMERIC(10,7),
  address_type TEXT NOT NULL DEFAULT 'Home', -- 'Home', 'Work', 'Other'
  is_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 5. CATALOGUE & PRICING ENGINE ───
CREATE TABLE IF NOT EXISTS public.service_categories (
  id TEXT PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  color TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.services (
  id TEXT PRIMARY KEY,
  category_id TEXT NOT NULL REFERENCES public.service_categories(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  short_description TEXT NOT NULL,
  long_description TEXT,
  image_url TEXT,
  base_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  min_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  pricing_type hef_pricing_type NOT NULL DEFAULT 'starting_from',
  estimated_duration INT NOT NULL DEFAULT 45, -- in minutes
  requires_quote BOOLEAN NOT NULL DEFAULT false,
  materials_extra BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  sort_order INT NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_pricing (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  city_id UUID REFERENCES public.cities(id) ON DELETE SET NULL,
  customer_price_type hef_pricing_type NOT NULL DEFAULT 'starting_from',
  customer_min_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  customer_max_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  customer_fixed_price NUMERIC(10,2),
  professional_payout NUMERIC(10,2) NOT NULL DEFAULT 0,
  platform_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  gst_enabled BOOLEAN NOT NULL DEFAULT true,
  gst_percentage NUMERIC(5,2) NOT NULL DEFAULT 18.00,
  visiting_fee NUMERIC(10,2) NOT NULL DEFAULT 49.00,
  visiting_fee_waiver hef_visit_fee_policy NOT NULL DEFAULT 'waived_on_service',
  peak_surcharge NUMERIC(10,2) NOT NULL DEFAULT 150.00,
  material_extra BOOLEAN NOT NULL DEFAULT true,
  active_from TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  active_until TIMESTAMPTZ,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_material_rules (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  pricing_mode TEXT NOT NULL DEFAULT 'actual_mrp', -- 'actual_mrp', 'included', 'customer_supplied'
  estimated_price NUMERIC(10,2) DEFAULT 0,
  customer_provided_allowed BOOLEAN NOT NULL DEFAULT true,
  technician_can_supply BOOLEAN NOT NULL DEFAULT true,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.professional_services (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(professional_id, service_id)
);

-- ─── 6. BOOKINGS, QUOTES & MATERIALS ───
CREATE TABLE IF NOT EXISTS public.bookings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_number TEXT UNIQUE NOT NULL,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE RESTRICT,
  address_id UUID REFERENCES public.addresses(id) ON DELETE SET NULL,
  scheduled_date DATE NOT NULL,
  scheduled_time_slot TEXT NOT NULL,
  problem_description TEXT,
  customer_notes TEXT,
  estimated_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10,2),
  visiting_fee NUMERIC(10,2) NOT NULL DEFAULT 0,
  materials_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  discount_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  grand_total NUMERIC(10,2) NOT NULL DEFAULT 0,
  payment_status hef_payment_status NOT NULL DEFAULT 'pending',
  booking_status hef_booking_status NOT NULL DEFAULT 'requested',
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_status_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  from_status hef_booking_status,
  to_status hef_booking_status NOT NULL,
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  amount NUMERIC(10,2) NOT NULL,
  labor_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  material_cost NUMERIC(10,2) NOT NULL DEFAULT 0,
  tax_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
  approved_by_customer BOOLEAN,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  material_name TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  total_price NUMERIC(10,2) NOT NULL DEFAULT 0,
  source TEXT NOT NULL DEFAULT 'technician', -- 'technician' or 'customer'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. PAYMENTS & REVIEWS ───
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  amount NUMERIC(10,2) NOT NULL,
  status hef_payment_status NOT NULL DEFAULT 'pending',
  method TEXT NOT NULL DEFAULT 'CASH_AFTER_SERVICE',
  provider TEXT NOT NULL DEFAULT 'MODULAR_ABSTRACTION',
  transaction_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID UNIQUE NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  customer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.professionals(id) ON DELETE SET NULL,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  photo_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.favorites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  service_id TEXT NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, service_id)
);

CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL DEFAULT 'SYSTEM',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code TEXT UNIQUE NOT NULL,
  discount_type TEXT NOT NULL DEFAULT 'FLAT',
  discount_value NUMERIC(10,2) NOT NULL,
  min_bill NUMERIC(10,2) NOT NULL DEFAULT 0,
  max_discount NUMERIC(10,2),
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
  subject TEXT NOT NULL,
  description TEXT NOT NULL,
  priority TEXT NOT NULL DEFAULT 'NORMAL',
  status TEXT NOT NULL DEFAULT 'OPEN',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.admin_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. PERFORMANCE INDEXES ───
CREATE INDEX IF NOT EXISTS idx_services_slug ON public.services(slug);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category_id);
CREATE INDEX IF NOT EXISTS idx_service_pricing_service ON public.service_pricing(service_id);
CREATE INDEX IF NOT EXISTS idx_service_areas_pincode ON public.service_areas(pincode);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(booking_status);
CREATE INDEX IF NOT EXISTS idx_bookings_customer ON public.bookings(customer_id);
CREATE INDEX IF NOT EXISTS idx_bookings_professional ON public.bookings(professional_id);
CREATE INDEX IF NOT EXISTS idx_addresses_user ON public.addresses(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_service ON public.reviews(service_id);

-- ─── 9. ROW LEVEL SECURITY (RLS) POLICIES ───
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reviews ENABLE ROW LEVEL SECURITY;

-- Customers can view/edit own profile
CREATE POLICY "Users can manage own profile"
  ON public.profiles FOR ALL
  USING (auth.uid() = id);

-- Customers can view/edit own addresses
CREATE POLICY "Users can manage own addresses"
  ON public.addresses FOR ALL
  USING (auth.uid() = user_id);

-- Customers can view own bookings
CREATE POLICY "Users can view own bookings"
  ON public.bookings FOR SELECT
  USING (auth.uid() = customer_id);

-- Public can view active services & categories
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active services"
  ON public.services FOR SELECT
  USING (active = true);

CREATE POLICY "Anyone can view active categories"
  ON public.service_categories FOR SELECT
  USING (active = true);
