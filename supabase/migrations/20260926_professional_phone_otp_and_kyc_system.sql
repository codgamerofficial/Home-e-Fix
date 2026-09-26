-- ==============================================================================
-- HOME-E-FIX: PRODUCTION-READY PROFESSIONAL PHONE OTP + KYC + ADMIN SYSTEM
-- Migration: 20260926_professional_phone_otp_and_kyc_system.sql
-- ==============================================================================

-- 1. Enable required cryptographic extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. Drop obsolete custom OTP verifications table if present
-- (Supabase Auth natively owns OTP generation, expiry, and verification)
DROP TABLE IF EXISTS public.otp_verifications CASCADE;

-- 3. Create or enhance the public.professionals table
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  full_name TEXT,
  profile_photo_url TEXT,
  date_of_birth DATE,
  address_line_1 TEXT,
  address_line_2 TEXT,
  locality TEXT,
  city TEXT DEFAULT 'Kolkata',
  state TEXT DEFAULT 'West Bengal',
  pincode TEXT,
  latitude NUMERIC(10, 7),
  longitude NUMERIC(10, 7),
  primary_category TEXT,
  service_categories TEXT[] DEFAULT '{}',
  experience_years NUMERIC DEFAULT 1,
  bio TEXT,
  preferred_service_areas TEXT[] DEFAULT '{"Kolkata"}',
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft',
    'phone_verified',
    'application_submitted',
    'under_review',
    'correction_required',
    'approved',
    'rejected',
    'suspended',
    'deactivated',
    -- Case-insensitive backwards-compatibility variants
    'DRAFT',
    'PHONE_VERIFIED',
    'APPLICATION_SUBMITTED',
    'DOCUMENTS_UNDER_REVIEW',
    'APPROVED',
    'ACTIVE',
    'REJECTED',
    'CORRECTION_REQUIRED',
    'SUSPENDED',
    'DEACTIVATED'
  )),
  application_submitted_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  correction_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure all columns exist if the table was created by a previous migration
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='professionals' AND column_name='application_submitted_at') THEN
    ALTER TABLE public.professionals ADD COLUMN application_submitted_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='professionals' AND column_name='reviewed_at') THEN
    ALTER TABLE public.professionals ADD COLUMN reviewed_at TIMESTAMPTZ;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='professionals' AND column_name='reviewed_by') THEN
    ALTER TABLE public.professionals ADD COLUMN reviewed_by UUID REFERENCES auth.users(id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='professionals' AND column_name='correction_reason') THEN
    ALTER TABLE public.professionals ADD COLUMN correction_reason TEXT;
  END IF;
END $$;

-- Indexes for performance and uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS idx_professionals_phone_unique ON public.professionals(phone);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);
CREATE INDEX IF NOT EXISTS idx_professionals_status ON public.professionals(status);
CREATE INDEX IF NOT EXISTS idx_professionals_pincode ON public.professionals(pincode);

-- 4. Create or enhance the public.professional_documents table
CREATE TABLE IF NOT EXISTS public.professional_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'identity_document',
    'address_document',
    'professional_certificate',
    'skill_certificate',
    'profile_photo',
    'bank_document',
    -- Upper case variants
    'IDENTITY_DOCUMENT',
    'ADDRESS_DOCUMENT',
    'PROFESSIONAL_CERTIFICATE',
    'SKILL_CERTIFICATE',
    'PROFILE_PHOTO',
    'BANK_DOCUMENT'
  )),
  document_number_masked TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN (
    'pending',
    'approved',
    'rejected',
    'replacement_required',
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REPLACEMENT_REQUIRED'
  )),
  rejection_reason TEXT,
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_pro_id ON public.professional_documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.professional_documents(status);

-- 5. Create the public.professional_review_logs table (Append-Only Audit Log)
CREATE TABLE IF NOT EXISTS public.professional_review_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  admin_user_id UUID REFERENCES auth.users(id),
  action TEXT NOT NULL,
  previous_status TEXT,
  new_status TEXT,
  reason TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_review_logs_pro_id ON public.professional_review_logs(professional_id);
CREATE INDEX IF NOT EXISTS idx_review_logs_created_at ON public.professional_review_logs(created_at);

-- 6. Helper Function: public.is_admin()
-- Authenticates administrators safely without trusting client-side flags
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    -- Check role in users table if exists
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role IN ('ADMIN', 'SUPER_ADMIN')
    )
    -- Service role bypass for Edge Functions & Background Workers
    OR (auth.jwt() ->> 'role' = 'service_role')
    -- JWT metadata claims
    OR (auth.jwt() -> 'user_metadata' ->> 'role' IN ('admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN'))
    OR (auth.jwt() -> 'app_metadata' ->> 'role' IN ('admin', 'ADMIN', 'super_admin', 'SUPER_ADMIN'))
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 7. Security Trigger: Prevent Self-Approval & Privilege Escalation
-- Ensures a professional CANNOT self-approve, modify phone_verified, or alter admin review fields
CREATE OR REPLACE FUNCTION public.protect_professional_admin_fields()
RETURNS TRIGGER AS $$
BEGIN
  -- If updater is not an authorized administrator
  IF NOT public.is_admin() THEN
    -- Block illegal status jump to approved/active
    IF NEW.status != OLD.status AND UPPER(NEW.status) IN ('APPROVED', 'ACTIVE') THEN
      RAISE EXCEPTION 'Security Violation: Only authorized administrators can approve professional profiles.';
    END IF;

    -- Block self-altering phone_verified
    IF NEW.phone_verified != OLD.phone_verified AND NEW.phone_verified = TRUE AND OLD.phone_verified = FALSE THEN
      RAISE EXCEPTION 'Security Violation: phone_verified is managed exclusively via Supabase Auth OTP verification.';
    END IF;

    -- Prevent overriding review metadata
    NEW.reviewed_by := OLD.reviewed_by;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.rejection_reason := OLD.rejection_reason;
    NEW.correction_reason := OLD.correction_reason;
  END IF;

  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_professional_admin_fields ON public.professionals;
CREATE TRIGGER trg_protect_professional_admin_fields
  BEFORE UPDATE ON public.professionals
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_professional_admin_fields();

-- 8. Security Trigger: Ensure Append-Only Audit Logs (Prevent Tampering)
CREATE OR REPLACE FUNCTION public.prevent_review_log_tampering()
RETURNS TRIGGER AS $$
BEGIN
  RAISE EXCEPTION 'Audit Violation: professional_review_logs records are strictly append-only.';
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_prevent_review_log_tampering_update ON public.professional_review_logs;
CREATE TRIGGER trg_prevent_review_log_tampering_update
  BEFORE UPDATE OR DELETE ON public.professional_review_logs
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_review_log_tampering();

-- 9. Row Level Security (RLS) Configuration
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_review_logs ENABLE ROW LEVEL SECURITY;

-- 9A. Professionals RLS Policies
DROP POLICY IF EXISTS "Professionals view own profile or admin" ON public.professionals;
CREATE POLICY "Professionals view own profile or admin"
  ON public.professionals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Professionals insert own application" ON public.professionals;
CREATE POLICY "Professionals insert own application"
  ON public.professionals FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Professionals update allowed fields or admin full update" ON public.professionals;
CREATE POLICY "Professionals update allowed fields or admin full update"
  ON public.professionals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin())
  WITH CHECK (auth.uid() = user_id OR public.is_admin());

DROP POLICY IF EXISTS "Admins can delete professional records" ON public.professionals;
CREATE POLICY "Admins can delete professional records"
  ON public.professionals FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 9B. Professional Documents RLS Policies
DROP POLICY IF EXISTS "Professionals view own docs or admin" ON public.professional_documents;
CREATE POLICY "Professionals view own docs or admin"
  ON public.professional_documents FOR SELECT
  TO authenticated
  USING (
    professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Professionals upload own docs" ON public.professional_documents;
CREATE POLICY "Professionals upload own docs"
  ON public.professional_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins can update document review status" ON public.professional_documents;
CREATE POLICY "Admins can update document review status"
  ON public.professional_documents FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Admins can delete documents" ON public.professional_documents;
CREATE POLICY "Admins can delete documents"
  ON public.professional_documents FOR DELETE
  TO authenticated
  USING (public.is_admin());

-- 9C. Professional Review Logs RLS Policies
DROP POLICY IF EXISTS "Professionals view own audit logs or admin" ON public.professional_review_logs;
CREATE POLICY "Professionals view own audit logs or admin"
  ON public.professional_review_logs FOR SELECT
  TO authenticated
  USING (
    professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid())
    OR public.is_admin()
  );

DROP POLICY IF EXISTS "Admins and service insert audit logs" ON public.professional_review_logs;
CREATE POLICY "Admins and service insert audit logs"
  ON public.professional_review_logs FOR INSERT
  TO authenticated
  WITH CHECK (
    public.is_admin()
    OR auth.uid() IN (SELECT user_id FROM public.professionals WHERE id = professional_id)
  );

-- 10. Private Supabase Storage Bucket Configuration
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-kyc',
  'professional-kyc',
  false, -- STRICTLY PRIVATE (Zero Public Access)
  5242880, -- 5MB file size limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- 11. Storage Objects RLS Policies
DROP POLICY IF EXISTS "Allow professional to upload KYC docs to own folder" ON storage.objects;
CREATE POLICY "Allow professional to upload KYC docs to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'professional-kyc' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Allow professional to read own KYC docs" ON storage.objects;
CREATE POLICY "Allow professional to read own KYC docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'professional-kyc' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Allow admin to read all KYC docs" ON storage.objects;
CREATE POLICY "Allow admin to read all KYC docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'professional-kyc' AND
    public.is_admin()
  );
