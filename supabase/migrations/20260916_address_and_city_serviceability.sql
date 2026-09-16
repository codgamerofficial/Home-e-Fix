-- ==============================================================================
-- HOME-E-FIX DATABASE MIGRATION: 20260916_address_and_city_serviceability.sql
-- Kolkata-Wide Serviceability, Authoritative Saved Addresses with RLS,
-- Single-Default Enforcement Trigger, Future Multi-City Architecture,
-- and Immutable Booking Address Snapshots.
-- ==============================================================================

-- 1. AUTHORITATIVE SAVED ADDRESSES TABLE
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  label VARCHAR(32) NOT NULL DEFAULT 'HOME', -- 'HOME', 'WORK', 'OTHER'
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  house_flat VARCHAR(128) NOT NULL,
  building VARCHAR(255),
  street VARCHAR(255) NOT NULL,
  area VARCHAR(255) NOT NULL,
  landmark VARCHAR(255),
  city VARCHAR(64) NOT NULL DEFAULT 'Kolkata',
  state VARCHAR(64) NOT NULL DEFAULT 'West Bengal',
  country VARCHAR(64) NOT NULL DEFAULT 'India',
  postal_code VARCHAR(12) NOT NULL,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  formatted_address TEXT NOT NULL,
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Performance and Isolation Indexes
CREATE INDEX IF NOT EXISTS idx_saved_addresses_customer_id ON public.saved_addresses (customer_id);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_customer_default ON public.saved_addresses (customer_id, is_default);
CREATE INDEX IF NOT EXISTS idx_saved_addresses_postal ON public.saved_addresses (postal_code);

-- 2. ENFORCE SINGLE DEFAULT ADDRESS PER CUSTOMER (TRIGGER)
CREATE OR REPLACE FUNCTION public.handle_single_default_address()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_default = TRUE THEN
    UPDATE public.saved_addresses
    SET is_default = FALSE
    WHERE customer_id = NEW.customer_id
      AND id != NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_enforce_single_default_address ON public.saved_addresses;
CREATE TRIGGER trg_enforce_single_default_address
BEFORE INSERT OR UPDATE OF is_default ON public.saved_addresses
FOR EACH ROW
WHEN (NEW.is_default = TRUE)
EXECUTE FUNCTION public.handle_single_default_address();

-- 3. SUPABASE ROW-LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Customers can view own saved addresses" ON public.saved_addresses;
CREATE POLICY "Customers can view own saved addresses"
  ON public.saved_addresses FOR SELECT
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can insert own saved addresses" ON public.saved_addresses;
CREATE POLICY "Customers can insert own saved addresses"
  ON public.saved_addresses FOR INSERT
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can update own saved addresses" ON public.saved_addresses;
CREATE POLICY "Customers can update own saved addresses"
  ON public.saved_addresses FOR UPDATE
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Customers can delete own saved addresses" ON public.saved_addresses;
CREATE POLICY "Customers can delete own saved addresses"
  ON public.saved_addresses FOR DELETE
  USING (auth.uid() = customer_id);

-- 4. FUTURE MULTI-CITY ARCHITECTURE
CREATE TABLE IF NOT EXISTS public.cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(128) NOT NULL,
  state VARCHAR(128) NOT NULL,
  country VARCHAR(64) NOT NULL DEFAULT 'India',
  slug VARCHAR(64) UNIQUE NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES public.cities(id) ON DELETE CASCADE,
  name VARCHAR(128) NOT NULL,
  coverage_type VARCHAR(32) NOT NULL DEFAULT 'ALL_CITY', -- 'ALL_CITY', 'ZONE', 'RADIUS'
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_area_postcodes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_area_id UUID NOT NULL REFERENCES public.service_areas(id) ON DELETE CASCADE,
  pincode VARCHAR(12) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.service_area_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_area_id UUID NOT NULL REFERENCES public.service_areas(id) ON DELETE CASCADE,
  service_id VARCHAR(64) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed Kolkata as Active with ALL_CITY Coverage
INSERT INTO public.cities (id, name, state, country, slug, is_active)
VALUES 
  ('c1000000-0000-0000-0000-000000000001', 'Kolkata', 'West Bengal', 'India', 'kolkata', TRUE),
  ('c1000000-0000-0000-0000-000000000002', 'Bhubaneswar', 'Odisha', 'India', 'bhubaneswar', FALSE),
  ('c1000000-0000-0000-0000-000000000003', 'Delhi NCR', 'Delhi', 'India', 'delhi', FALSE),
  ('c1000000-0000-0000-0000-000000000004', 'Mumbai', 'Maharashtra', 'India', 'mumbai', FALSE),
  ('c1000000-0000-0000-0000-000000000005', 'Bengaluru', 'Karnataka', 'India', 'bengaluru', FALSE),
  ('c1000000-0000-0000-0000-000000000006', 'Hyderabad', 'Telangana', 'India', 'hyderabad', FALSE)
ON CONFLICT (slug) DO UPDATE
SET is_active = EXCLUDED.is_active;

INSERT INTO public.service_areas (id, city_id, name, coverage_type, is_active)
VALUES
  ('a1000000-0000-0000-0000-000000000001', 'c1000000-0000-0000-0000-000000000001', 'Greater Kolkata Metropolitan', 'ALL_CITY', TRUE)
ON CONFLICT (id) DO NOTHING;

-- 5. IMMUTABLE BOOKING ADDRESS SNAPSHOT
-- Ensure bookings table preserves complete address snapshot decoupling from address edits/deletions
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS address_snapshot JSONB;
