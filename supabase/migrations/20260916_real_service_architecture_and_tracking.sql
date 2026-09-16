-- ========================================================================
-- HOME-E-FIX: REAL SERVICE ARCHITECTURE + LIVE PROFESSIONAL TRACKING
-- Authoritative Schema Upgrade: Two-Dimensional Domain Model, Delivery Types,
-- Real-Time Location Sessions, Sampled Telemetry & RLS Policies
-- ========================================================================

-- ─── 1. NEW OPERATIONAL ENUMS ───
DO $$ BEGIN
  CREATE TYPE service_delivery_type AS ENUM (
    'FIXED_PRICE', 'DIAGNOSIS_FIRST', 'QUOTATION', 'PACKAGE',
    'QUANTITY_BASED', 'AREA_BASED', 'INSTALLATION', 'REPAIR',
    'APPOINTMENT', 'RAPID', 'EMERGENCY', 'RECURRING'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tracking_mode AS ENUM (
    'NONE', 'ASSIGNED_ONLY', 'ON_THE_WAY', 'LIVE_LOCATION', 'LIVE_LOCATION_AND_ETA'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE TYPE tracking_status AS ENUM (
    'OFF', 'REQUESTED', 'ACTIVE', 'STALE', 'ENDED'
  );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 2. PROFESSIONAL SKILLS & TRADES (20 Specialized Roles) ───
CREATE TABLE IF NOT EXISTS public.professional_skills (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  category_hint TEXT,
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed 20 Standard Professional Trades
INSERT INTO public.professional_skills (slug, name, category_hint, description)
VALUES
  ('electrician', 'Electrician', 'Electrical', 'Certified domestic and commercial electrical wiring and repair specialist'),
  ('plumber', 'Plumber', 'Plumbing', 'Plumbing fixtures, drainage, sanitaryware, and piping specialist'),
  ('carpenter', 'Carpenter', 'Carpentry & Furniture', 'Furniture assembly, modular fittings, and woodworking technician'),
  ('ac_technician', 'AC Technician', 'AC & Appliances', 'Split, window, and inverter AC servicing, gas charging, and repair'),
  ('refrigeration_technician', 'Refrigeration Technician', 'AC & Appliances', 'Single and double door refrigerator repair and coolant specialist'),
  ('ro_technician', 'RO Technician', 'AC & Appliances', 'Water purifier filter replacement, membrane service, and pump repair'),
  ('appliance_technician', 'Appliance Technician', 'AC & Appliances', 'Washing machine, microwave, and kitchen appliance diagnostics'),
  ('painter', 'Painter', 'Painting & Waterproofing', 'Interior and exterior wall painting, priming, and putty specialist'),
  ('waterproofing_technician', 'Waterproofing Technician', 'Painting & Waterproofing', 'Roof, balcony, and wall seepage waterproofing expert'),
  ('cleaner', 'Professional Cleaner', 'Cleaning', 'Deep home cleaning, kitchen degreasing, bathroom sanitization'),
  ('pest_technician', 'Pest Control Technician', 'Pest Control', 'Termite, cockroach, rodent, and bed bug eradication expert'),
  ('glass_technician', 'Glass Technician', 'Glass & Windows', 'Window glazing, glass partitions, and mirror installation'),
  ('kitchen_technician', 'Kitchen Technician', 'Modular Kitchen', 'Modular kitchen hardware, chimney, and hob installation specialist'),
  ('cctv_technician', 'CCTV Technician', 'Smart Home & Security', 'Surveillance camera wiring, DVR setup, and IP camera configuration'),
  ('smart_home_technician', 'Smart Home Technician', 'Smart Home & Security', 'Smart lock, smart switch, and home automation integration'),
  ('home_inspector', 'Home Inspector', 'Home Inspection', 'Pre-possession quality audit, electrical safety, and seepage audit'),
  ('beautician', 'Beautician', 'Beauty & Wellness', 'Facials, waxing, manicure, and pedicure at-home specialist'),
  ('hair_professional', 'Hair Professional', 'Beauty & Wellness', 'Hair cutting, styling, coloring, and treatment expert'),
  ('spa_professional', 'Spa Professional', 'Beauty & Wellness', 'Aromatherapy, deep tissue, and relaxation massage specialist'),
  ('rapid_help_professional', 'Rapid Help Professional', 'Rapid Home Help', 'On-demand urgent household assistance and emergency repairs')
ON CONFLICT (slug) DO UPDATE 
SET name = EXCLUDED.name, category_hint = EXCLUDED.category_hint, description = EXCLUDED.description;

-- Many-to-Many: Professionals can possess multiple skills
CREATE TABLE IF NOT EXISTS public.professional_skill_map (
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  skill_id UUID NOT NULL REFERENCES public.professional_skills(id) ON DELETE CASCADE,
  proficiency_level TEXT NOT NULL DEFAULT 'EXPERT', -- 'ENTRY', 'EXPERIENCED', 'EXPERT', 'MASTER'
  is_primary BOOLEAN NOT NULL DEFAULT false,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (professional_id, skill_id)
);

-- ─── 3. EXTEND SERVICES TABLE WITH DELIVERY TYPES & WORKFLOWS ───
ALTER TABLE public.services 
  ADD COLUMN IF NOT EXISTS delivery_type service_delivery_type NOT NULL DEFAULT 'FIXED_PRICE',
  ADD COLUMN IF NOT EXISTS tracking_mode tracking_mode NOT NULL DEFAULT 'ON_THE_WAY',
  ADD COLUMN IF NOT EXISTS required_skills JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS required_equipment JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS questions JSONB DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS media_requirements JSONB DEFAULT '{"allow_photos": true, "require_photos": false}'::jsonb,
  ADD COLUMN IF NOT EXISTS service_area JSONB DEFAULT '["kolkata", "howrah", "salt-lake", "new-town"]'::jsonb,
  ADD COLUMN IF NOT EXISTS warranty_policy JSONB DEFAULT '{"warranty_days": 30, "terms": "Covers re-repair if issue reoccurs"}'::jsonb,
  ADD COLUMN IF NOT EXISTS cancellation_policy JSONB DEFAULT '{"free_cancellation_min": 120, "fee_after_assignment": 99}'::jsonb,
  ADD COLUMN IF NOT EXISTS additional_charge_policy JSONB DEFAULT '{"requires_customer_approval": true, "audit_threshold": 500}'::jsonb,
  ADD COLUMN IF NOT EXISTS pricing_rules JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS workflow_config JSONB DEFAULT '{}'::jsonb;

-- ─── 4. EXTEND BOOKINGS TABLE WITH TELEMETRY & WORKFLOW DATA ───
ALTER TABLE public.bookings
  ADD COLUMN IF NOT EXISTS delivery_type service_delivery_type NOT NULL DEFAULT 'FIXED_PRICE',
  ADD COLUMN IF NOT EXISTS tracking_mode tracking_mode NOT NULL DEFAULT 'ON_THE_WAY',
  ADD COLUMN IF NOT EXISTS booking_answers JSONB DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS destination_lat NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS destination_lng NUMERIC(10, 7),
  ADD COLUMN IF NOT EXISTS quote_id UUID;

-- ─── 5. REAL PROFESSIONAL LOCATION SESSIONS ───
-- Manages session lifecycle: Starts when ON_THE_WAY, terminates on ARRIVED / SERVICE_COMPLETED
CREATE TABLE IF NOT EXISTS public.professional_location_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  professional_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  status tracking_status NOT NULL DEFAULT 'REQUESTED',
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  ended_at TIMESTAMPTZ,
  consent_at TIMESTAMPTZ DEFAULT NOW(),
  last_latitude NUMERIC(10, 7),
  last_longitude NUMERIC(10, 7),
  last_accuracy NUMERIC(8, 2),
  last_heading NUMERIC(6, 2),
  last_speed NUMERIC(6, 2),
  last_updated_at TIMESTAMPTZ,
  eta_minutes INT,
  distance_km NUMERIC(6, 2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 6. PERIODIC / SAMPLED LOCATION SNAPSHOTS (For Audit & Analytics, NOT every 2s) ───
CREATE TABLE IF NOT EXISTS public.professional_location_snapshots (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES public.professional_location_sessions(id) ON DELETE CASCADE,
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  latitude NUMERIC(10, 7) NOT NULL,
  longitude NUMERIC(10, 7) NOT NULL,
  accuracy NUMERIC(8, 2),
  heading NUMERIC(6, 2),
  speed NUMERIC(6, 2),
  recorded_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 7. BOOKING QUOTES (For DIAGNOSIS_FIRST & QUOTATION Delivery Types) ───
CREATE TABLE IF NOT EXISTS public.booking_quotes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  professional_id UUID REFERENCES public.profiles(id),
  total_parts_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_labour_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  diagnosis_summary TEXT NOT NULL,
  estimated_duration_min INT DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'DRAFT', -- 'DRAFT', 'SUBMITTED', 'APPROVED', 'REJECTED'
  customer_approved_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.booking_quote_items (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  quote_id UUID NOT NULL REFERENCES public.booking_quotes(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL DEFAULT 'PART', -- 'PART', 'LABOUR', 'SURCHARGE'
  description TEXT NOT NULL,
  quantity INT NOT NULL DEFAULT 1,
  unit_price NUMERIC(10, 2) NOT NULL,
  total_price NUMERIC(10, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ─── 8. ROW LEVEL SECURITY (RLS) POLICIES FOR LOCATION PRIVACY ───
ALTER TABLE public.professional_skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_skill_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_location_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_location_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_quotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.booking_quote_items ENABLE ROW LEVEL SECURITY;

-- Skills: Publicly readable by all authenticated and anonymous clients
DO $$ BEGIN
  CREATE POLICY "Public can view active skills" ON public.professional_skills
    FOR SELECT USING (is_active = true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Location Sessions: Only assigned customer or assigned professional can access
DO $$ BEGIN
  CREATE POLICY "Customer can view tracking session for own booking" 
    ON public.professional_location_sessions FOR SELECT 
    USING (
      booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Assigned professional can manage own location session" 
    ON public.professional_location_sessions FOR ALL 
    USING (professional_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Snapshots: Readable by assigned customer during active trip
DO $$ BEGIN
  CREATE POLICY "Customer view location snapshots" 
    ON public.professional_location_snapshots FOR SELECT 
    USING (
      booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- Quotes: Customer can view and approve; professional can manage
DO $$ BEGIN
  CREATE POLICY "Customer can view quotes for own booking" 
    ON public.booking_quotes FOR SELECT 
    USING (
      booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Customer can approve or reject quotes for own booking" 
    ON public.booking_quotes FOR UPDATE 
    USING (
      booking_id IN (SELECT id FROM public.bookings WHERE customer_id = auth.uid())
    );
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Professional can manage quotes for assigned booking" 
    ON public.booking_quotes FOR ALL 
    USING (professional_id = auth.uid());
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ─── 9. PERFORMANCE INDEXES ───
CREATE INDEX IF NOT EXISTS idx_location_sessions_booking ON public.professional_location_sessions(booking_id);
CREATE INDEX IF NOT EXISTS idx_location_sessions_pro ON public.professional_location_sessions(professional_id, status);
CREATE INDEX IF NOT EXISTS idx_location_snapshots_session ON public.professional_location_snapshots(session_id, recorded_at DESC);
CREATE INDEX IF NOT EXISTS idx_booking_quotes_booking ON public.booking_quotes(booking_id);
CREATE INDEX IF NOT EXISTS idx_services_delivery_type ON public.services(delivery_type);
CREATE INDEX IF NOT EXISTS idx_services_tracking_mode ON public.services(tracking_mode);
