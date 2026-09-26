-- ==============================================================================
-- HOME-E-FIX: PROFESSIONAL PHONE OTP, KYC & ADMINISTRATIVE APPROVAL SYSTEM
-- Migration: 20260925_professional_kyc_system.sql
-- ==============================================================================

-- Enable UUID extension if not already present
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─── 1. OTP VERIFICATIONS TABLE ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.otp_verifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  phone_hash TEXT NOT NULL,
  purpose TEXT NOT NULL,
  otp_hash TEXT NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  attempt_count INTEGER DEFAULT 0,
  max_attempts INTEGER DEFAULT 5,
  resend_available_at TIMESTAMPTZ,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_otp_phone_purpose ON public.otp_verifications(phone_hash, purpose);
CREATE INDEX IF NOT EXISTS idx_otp_expires_at ON public.otp_verifications(expires_at);

-- ─── 2. PROFESSIONALS TABLE ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.professionals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  phone TEXT UNIQUE NOT NULL,
  phone_verified BOOLEAN DEFAULT FALSE,
  full_name TEXT NOT NULL,
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
  primary_category TEXT NOT NULL,
  service_categories TEXT[] DEFAULT '{}',
  experience_years NUMERIC DEFAULT 1,
  bio TEXT,
  preferred_service_areas TEXT[] DEFAULT '{"Kolkata"}',
  status TEXT DEFAULT 'DRAFT' CHECK (status IN (
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
  rejection_reason TEXT,
  correction_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_professionals_status ON public.professionals(status);
CREATE INDEX IF NOT EXISTS idx_professionals_phone ON public.professionals(phone);
CREATE INDEX IF NOT EXISTS idx_professionals_user_id ON public.professionals(user_id);

-- ─── 3. PROFESSIONAL KYC DOCUMENTS TABLE ──────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.professional_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  professional_id UUID NOT NULL REFERENCES public.professionals(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL CHECK (document_type IN (
    'IDENTITY_DOCUMENT',
    'ADDRESS_DOCUMENT',
    'SKILL_CERTIFICATE',
    'PROFILE_PHOTO',
    'BANK_DOCUMENT'
  )),
  document_number_masked TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER,
  mime_type TEXT,
  status TEXT DEFAULT 'PENDING' CHECK (status IN (
    'PENDING',
    'APPROVED',
    'REJECTED',
    'REPLACEMENT_REQUIRED'
  )),
  uploaded_at TIMESTAMPTZ DEFAULT NOW(),
  reviewed_at TIMESTAMPTZ,
  reviewed_by UUID REFERENCES auth.users(id),
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_pro_id ON public.professional_documents(professional_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON public.professional_documents(status);

-- ─── 4. ADMINISTRATIVE REVIEW AUDIT LOGS (APPEND-ONLY) ────────────────────────
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

-- ─── 5. ROW LEVEL SECURITY (RLS) POLICIES ─────────────────────────────────────
ALTER TABLE public.otp_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professionals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.professional_review_logs ENABLE ROW LEVEL SECURITY;

-- OTP: Service-layer only access (no public client queries)
CREATE POLICY "Deny direct public read of OTP records"
  ON public.otp_verifications FOR ALL
  TO anon, authenticated
  USING (false);

-- Professionals: Read/update own record
CREATE POLICY "Professionals can view own profile"
  ON public.professionals FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Professionals can update own draft details"
  ON public.professionals FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status IN ('DRAFT', 'PHONE_VERIFIED', 'CORRECTION_REQUIRED'));

-- Documents: Read own documents
CREATE POLICY "Professionals can view own documents"
  ON public.professional_documents FOR SELECT
  TO authenticated
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

CREATE POLICY "Professionals can upload own documents"
  ON public.professional_documents FOR INSERT
  TO authenticated
  WITH CHECK (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

-- Review logs: Read only by admins or applicant
CREATE POLICY "Professionals can view own review audit logs"
  ON public.professional_review_logs FOR SELECT
  TO authenticated
  USING (professional_id IN (SELECT id FROM public.professionals WHERE user_id = auth.uid()));

-- ─── 6. PRIVATE STORAGE BUCKET CONFIGURATION ──────────────────────────────────
-- Setup private 'professional-kyc' bucket with zero public access
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'professional-kyc',
  'professional-kyc',
  false, -- STRICTLY PRIVATE
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET public = false;

-- Storage RLS: Authorized upload into own directory
CREATE POLICY "Allow professional to upload KYC docs to own folder"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'professional-kyc' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "Allow professional to read own KYC docs"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'professional-kyc' AND
    (storage.foldername(name))[1] = auth.uid()::text
  );
