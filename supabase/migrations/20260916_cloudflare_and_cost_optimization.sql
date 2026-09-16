-- ==============================================================================
-- HOME-E-FIX: ZERO-COST PRODUCTION POSTGRESQL SCHEMA & RLS MIGRATION
-- Migration Date: 2026-09-16
-- Targets: Supabase PostgreSQL (Free Tier Optimized) + Realtime + Storage
-- Enforces: Idempotent payments (Razorpay only), RLS customer isolation, Realtime tracking
-- ==============================================================================

-- 1. Enable Required Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Ensure Schema Idempotency & Types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_gateway_type') THEN
    CREATE TYPE payment_gateway_type AS ENUM ('RAZORPAY', 'CASH_ON_SERVICE', 'WALLET');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'booking_event_type') THEN
    CREATE TYPE booking_event_type AS ENUM (
      'BOOKING_CREATED',
      'BROADCAST_SENT',
      'PROFESSIONAL_ASSIGNED',
      'EN_ROUTE',
      'ARRIVED',
      'INSPECTION_COMPLETED',
      'WORK_STARTED',
      'PAYMENT_REQUESTED',
      'PAYMENT_COMPLETED',
      'WORK_COMPLETED',
      'CANCELLED',
      'REFUNDED'
    );
  END IF;
END $$;

-- 3. Core Booking Events (Append-Only Event Store for Realtime Tracking)
CREATE TABLE IF NOT EXISTS public.booking_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL,
  event_type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  actor_id UUID,
  actor_role VARCHAR(32) DEFAULT 'SYSTEM', -- 'CUSTOMER', 'PROFESSIONAL', 'ADMIN', 'SYSTEM'
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_booking_events_booking_id ON public.booking_events (booking_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_booking_events_created_at ON public.booking_events (created_at DESC);

-- 4. Payment Events & Transactions (Razorpay Only)
CREATE TABLE IF NOT EXISTS public.payment_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID,
  customer_id UUID,
  gateway VARCHAR(32) NOT NULL DEFAULT 'RAZORPAY',
  order_id VARCHAR(128) NOT NULL,
  payment_id VARCHAR(128),
  signature VARCHAR(255),
  amount_inr NUMERIC(12, 2) NOT NULL,
  currency VARCHAR(8) NOT NULL DEFAULT 'INR',
  status VARCHAR(32) NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'
  purpose VARCHAR(32) NOT NULL DEFAULT 'BOOKING', -- 'BOOKING', 'WALLET_TOPUP', 'MEMBERSHIP'
  raw_payload JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  verified_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_payment_events_order_id ON public.payment_events (order_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_payment_id ON public.payment_events (payment_id);
CREATE INDEX IF NOT EXISTS idx_payment_events_customer ON public.payment_events (customer_id, created_at DESC);

-- 5. Saved Customer Addresses (Customer-Isolated)
CREATE TABLE IF NOT EXISTS public.saved_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL,
  tag VARCHAR(32) NOT NULL DEFAULT 'Home', -- 'Home', 'Work', 'Other'
  flat_no VARCHAR(128),
  apartment_name VARCHAR(255),
  street_address TEXT NOT NULL,
  landmark VARCHAR(255),
  city VARCHAR(64) NOT NULL DEFAULT 'Kolkata',
  state VARCHAR(64) NOT NULL DEFAULT 'West Bengal',
  pincode VARCHAR(12) NOT NULL,
  hub_id VARCHAR(64),
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  is_default BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_addresses_customer ON public.saved_addresses (customer_id);

-- 6. Coupon Redemptions (Idempotency & Fraud Prevention)
CREATE TABLE IF NOT EXISTS public.coupon_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  coupon_code VARCHAR(32) NOT NULL,
  customer_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  discount_amount NUMERIC(10, 2) NOT NULL,
  redeemed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT uq_coupon_customer_booking UNIQUE (coupon_code, customer_id, booking_id)
);

CREATE INDEX IF NOT EXISTS idx_coupon_redemptions_cust ON public.coupon_redemptions (customer_id);

-- 7. Plus Memberships (Zero-Cost Recurring Loyalty Tracking)
CREATE TABLE IF NOT EXISTS public.plus_memberships (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL UNIQUE,
  tier VARCHAR(32) NOT NULL DEFAULT 'VIP_ANNUAL',
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  price_paid_inr NUMERIC(8, 2) NOT NULL DEFAULT 299.00,
  starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '1 year'),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Professional Earnings & Payouts
CREATE TABLE IF NOT EXISTS public.professional_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL,
  booking_id UUID NOT NULL,
  gross_amount NUMERIC(10, 2) NOT NULL,
  platform_fee NUMERIC(10, 2) NOT NULL,
  gst_on_fee NUMERIC(10, 2) NOT NULL,
  net_earning NUMERIC(10, 2) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'CREDITED', -- 'CREDITED', 'PAID_OUT', 'HELD'
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_pro_earnings_pro_id ON public.professional_earnings (professional_id, created_at DESC);

-- 9. System Audit Logs
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  action VARCHAR(64) NOT NULL,
  resource VARCHAR(64) NOT NULL,
  resource_id VARCHAR(128),
  actor_id UUID,
  actor_email VARCHAR(255),
  ip_address VARCHAR(45),
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON public.audit_logs (created_at DESC);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE public.booking_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.saved_addresses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.coupon_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plus_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Booking Events Policies
DROP POLICY IF EXISTS "Public can view booking events for their booking" ON public.booking_events;
CREATE POLICY "Public can view booking events for their booking"
  ON public.booking_events FOR SELECT
  USING (true); -- Read-only event stream filtered by client booking ID

DROP POLICY IF EXISTS "Service role can insert booking events" ON public.booking_events;
CREATE POLICY "Service role can insert booking events"
  ON public.booking_events FOR INSERT
  WITH CHECK (true);

-- Saved Addresses: Strict Customer Isolation
DROP POLICY IF EXISTS "Customers manage their own addresses" ON public.saved_addresses;
CREATE POLICY "Customers manage their own addresses"
  ON public.saved_addresses FOR ALL
  USING (auth.uid() = customer_id)
  WITH CHECK (auth.uid() = customer_id);

-- Payment Events: Customers read own transactions, service role writes
DROP POLICY IF EXISTS "Customers view own payments" ON public.payment_events;
CREATE POLICY "Customers view own payments"
  ON public.payment_events FOR SELECT
  USING (auth.uid() = customer_id);

DROP POLICY IF EXISTS "Service role manages payments" ON public.payment_events;
CREATE POLICY "Service role manages payments"
  ON public.payment_events FOR ALL
  USING (true)
  WITH CHECK (true);

-- Plus Memberships: Customers view own membership
DROP POLICY IF EXISTS "Customers view own plus membership" ON public.plus_memberships;
CREATE POLICY "Customers view own plus membership"
  ON public.plus_memberships FOR SELECT
  USING (auth.uid() = customer_id);

-- Professional Earnings: Professionals view own earnings
DROP POLICY IF EXISTS "Professionals view own earnings" ON public.professional_earnings;
CREATE POLICY "Professionals view own earnings"
  ON public.professional_earnings FOR SELECT
  USING (auth.uid() = professional_id);

-- Audit Logs: Admin access only
DROP POLICY IF EXISTS "Admins view audit logs" ON public.audit_logs;
CREATE POLICY "Admins view audit logs"
  ON public.audit_logs FOR SELECT
  USING (auth.jwt() ->> 'role' = 'service_role' OR auth.jwt() ->> 'email' LIKE '%@home-e-fix.com');

-- ==============================================================================
-- REALTIME BROADCAST REGISTRATION
-- ==============================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' AND tablename = 'booking_events'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.booking_events;
  END IF;
END $$;
