# Home-e-Fix: Production-Ready Professional Phone OTP, KYC & Admin Verification System

> **Tagline:** *YOUR HOME. OUR FIX.*  
> **Target Region:** India (E.164 canonical `+91XXXXXXXXXX`)

---

## 1. Architectural Overview

Home-e-Fix is a home-services marketplace connecting customers with verified home-service professionals.

### Fundamental Business Principle
```
PHONE VERIFICATION  ≠  PROFESSIONAL APPROVAL
```
* **Phone OTP verification** proves only that the applicant controls the submitted mobile number.
* **Professional approval** requires full KYC review, background credential verification, and administrative sign-off.
* An applicant can **NEVER** accept customer job dispatches merely by verifying their mobile number.

### End-to-End Verification Lifecycle
```
PHONE VERIFIED
      ↓
PROFILE COMPLETED
      ↓
APPLICATION SUBMITTED
      ↓
DOCUMENTS UNDER REVIEW (KYC)
      ↓
ADMIN REVIEW (Approve / Reject / Correction)
      ↓
APPROVED & ACTIVE PROFESSIONAL
```

---

## 2. Authentication Architecture

```
                 HOME-E-FIX
                      │
                      ▼
              Professional UI
                      │
                      ▼
              Supabase Auth
                      │
              signInWithOtp()
                      │
                      ▼
               Supabase OTP
                      │
                      ▼
             Send SMS Auth Hook
                      │
                      ▼
             send_sms Edge Function
                      │
             ┌────────┴─────────┐
             │                  │
       DEVELOPMENT          PRODUCTION
             │                  │
       Server-side OTP      SMS Provider
          logging          adapter/interface
             │                  │
             └────────┬─────────┘
                      ▼
               verifyOtp()
                      │
                      ▼
              Authenticated User
                      │
                      ▼
             Professional Profile
                      │
                      ▼
                   KYC
                      │
                      ▼
               Admin Review
                      │
          ┌───────────┴───────────┐
          │                       │
       APPROVED              CORRECTION
          │                       │
          ▼                       ▼
      PROFESSIONAL             RESUBMIT
         ACTIVE
```

### Critical Identity Invariants
1. **Supabase Auth as Source of Truth**:
   - Supabase Auth owns OTP generation, OTP expiration (5 minutes), OTP token verification, and user sessions.
   - No custom `otp_verifications` table.
   - No browser-generated OTPs.
   - Verification returns an authoritative Supabase session.
2. **Canonical Indian Mobile Storage**:
   - Validates 10-digit Indian numbers starting with 6, 7, 8, or 9.
   - Canonicalizes to `+91XXXXXXXXXX`.
   - Unique index `idx_professionals_phone_unique` on `public.professionals(phone)` prevents duplicate accounts caused by `9876543210` vs `+919876543210`.

---

## 3. Send SMS Auth Hook & Edge Function

Supabase Auth uses the **Send SMS Hook** to route SMS delivery through our Supabase Edge Function (`send_sms`).

### Edge Function Location
`supabase/functions/send_sms/index.ts`

### Webhook Signature Verification
Supabase Auth signs hook payloads using the standard webhook scheme (Svix-compatible).
- **Headers:** `webhook-id`, `webhook-timestamp`, `webhook-signature`
- **Replay Protection:** Rejects any request with a timestamp drift > 5 minutes (300 seconds).
- **Signature Algorithm:** HMAC-SHA256 computed over `${webhookId}.${webhookTimestamp}.${rawBody}` with `SEND_SMS_HOOK_SECRET`.
- **Timing-Safe Comparison:** Compares candidate signatures against expected signatures using constant-time byte comparisons to prevent timing attacks.

### Incoming Hook Payload
```json
{
  "user": {
    "id": "c1f7b0f6-...",
    "phone": "+919830012345"
  },
  "sms": {
    "otp": "491204"
  }
}
```

### Hook Response
- Returns HTTP 200 with `{}` on success.
- **NEVER** echoes the OTP code back in the response.

---

## 4. Development OTP Mode vs. Production Safety

### Development Mode (`OTP_PROVIDER_MODE=development`)
- Operates at **₹0 SMS cost** during development and testing.
- The `send_sms` Edge Function routes delivery to `DevelopmentOtpProvider`.
- The OTP is logged **strictly to server-side Edge Function console logs**:
  ```text
  [HOME-E-FIX DEVELOPMENT OTP HOOK]
  Time:      2026-09-26T00:55:00.000Z
  Mobile:    +919830012345 (+91 98••••45)
  OTP Code:  491204
  Notice:    SERVER-SIDE LOG ONLY. Never expose in production.
  ```
- The developer inspects their terminal logs and enters the code in the UI.
- The code is **NEVER** returned in API responses, shown in client alerts, or exposed to frontend JavaScript.

### Production Safety Guard
If `ENVIRONMENT=production` (or `NODE_ENV=production`) and `OTP_PROVIDER_MODE=development`, the system **fails safely**:
```ts
if (isProductionEnv && rawMode === "development") {
  throw new Error("FATAL SECURITY CONFIGURATION: Development OTP mode is strictly prohibited in production environment.");
}
```
This hard invariant prevents accidental deployment of mock/dev OTP handlers in production.

---

## 5. Production SMS Provider Abstraction

The production adapter (`ProductionOtpProvider`) implements the `OtpDeliveryProvider` interface:
```ts
export interface OtpDeliveryProvider {
  readonly name: string;
  sendOtp(params: { phone: string; otp: string }): Promise<OtpDeliveryResult>;
}
```

### Integration Requirements
When ready for live Indian SMS delivery:
1. Set `OTP_PROVIDER_MODE=production`.
2. Configure server secrets in Supabase Edge Functions:
   - `SMS_PROVIDER_API_KEY`: SMS gateway auth token
   - `SMS_PROVIDER_SENDER_ID`: Registered DLT 6-character Header (e.g. `HOMEFX`)
   - `SMS_PROVIDER_TEMPLATE_ID`: DLT-approved SMS content template registration ID
   - `SMS_PROVIDER_GATEWAY_URL`: Endpoint of the Indian SMS gateway
3. Secrets are never exposed to `VITE_` or client bundles.

---

## 6. Database Schema & Row Level Security (RLS)

Migration file: `supabase/migrations/20260926_professional_phone_otp_and_kyc_system.sql`

### Tables
1. `public.professionals`:
   - `id UUID PRIMARY KEY DEFAULT gen_random_uuid()`
   - `user_id UUID UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE`
   - `phone TEXT UNIQUE NOT NULL`
   - `phone_verified BOOLEAN NOT NULL DEFAULT FALSE`
   - `full_name TEXT`, `profile_photo_url TEXT`, `date_of_birth DATE`
   - Address fields: `address_line_1`, `address_line_2`, `locality`, `city`, `state`, `pincode`, `latitude`, `longitude`
   - Trade fields: `primary_category`, `service_categories TEXT[]`, `experience_years NUMERIC`, `bio TEXT`, `preferred_service_areas TEXT[]`
   - Status: `status TEXT NOT NULL DEFAULT 'draft'`
   - Audit/Review fields: `application_submitted_at`, `reviewed_at`, `reviewed_by`, `rejection_reason`, `correction_reason`
2. `public.professional_documents`:
   - `id UUID PRIMARY KEY`, `professional_id UUID REFERENCES public.professionals(id)`
   - `document_type TEXT` (`identity_document`, `address_document`, `professional_certificate`, `skill_certificate`, `profile_photo`, `bank_document`)
   - `document_number_masked TEXT` (e.g. `XXXX-XXXX-1234`)
   - `storage_path TEXT`, `file_name TEXT`, `file_size INTEGER`, `mime_type TEXT`
   - `status TEXT DEFAULT 'pending'` (`pending`, `approved`, `rejected`, `replacement_required`)
   - `reviewed_at TIMESTAMPTZ`, `reviewed_by UUID`, `rejection_reason TEXT`
3. `public.professional_review_logs`:
   - `id UUID PRIMARY KEY`, `professional_id UUID`, `admin_user_id UUID`
   - `action TEXT`, `previous_status TEXT`, `new_status TEXT`, `reason TEXT`, `metadata JSONB`, `created_at TIMESTAMPTZ`

### Strict Database-Level Security Triggers
1. **Self-Approval & Privilege Escalation Blocker (`protect_professional_admin_fields`)**:
   - If user is not an administrator (`NOT public.is_admin()`):
     - Blocks any update changing `status` to `approved` or `active`.
     - Blocks any direct change to `phone_verified` (only managed via `verifyOtp`).
     - Overrides any attempt to overwrite `reviewed_by`, `reviewed_at`, `rejection_reason`, `correction_reason`.
2. **Immutable Audit Logs (`prevent_review_log_tampering`)**:
   - `professional_review_logs` is strictly append-only.
   - Updates and deletions trigger a Postgres exception.

### Storage Security
- Private bucket: `professional-kyc` (`public = false`, 5MB limit, JPG/PNG/WEBP/PDF).
- Storage RLS:
  - Professional can only upload to `{auth.uid()}/*`.
  - Professional can only read from `{auth.uid()}/*`.
  - Administrator can read all documents.
  - Public/Anonymous access is completely blocked.
  - Authorized access uses short-lived signed URLs (`createSignedUrl(path, 3600)`).

---

## 7. Business Logic: Job Eligibility

A professional can accept customer job dispatches **ONLY** when:
```ts
canProfessionalAcceptJobs(professional: ProfessionalProfile)
```
Conditions enforced:
1. Profile exists.
2. `phone_verified === true`.
3. `status === "APPROVED"` or `status === "ACTIVE"`.
4. Account is not `SUSPENDED` or `DEACTIVATED`.
5. Application is not in `DRAFT`, `PHONE_VERIFIED`, `APPLICATION_SUBMITTED`, `DOCUMENTS_UNDER_REVIEW`, `CORRECTION_REQUIRED`, or `REJECTED`.

---

## 8. Supabase Dashboard Configuration Steps

Follow these exact steps in the Supabase Dashboard:

### Step 1: Enable Phone Provider
1. Go to **Authentication** → **Providers** → **Phone**.
2. Toggle **Enable Phone Provider**.
3. Under **SMS Provider**, select **Custom** (or the SMS hook option).

### Step 2: Configure Send SMS Hook
1. Go to **Authentication** → **Hooks**.
2. In the **Send SMS** section, click **Add Hook** (or **Configure Hook**).
3. Select **HTTP Endpoint**.
4. Set the Endpoint URL to your deployed Edge Function:
   ```
   https://<your-project-ref>.supabase.co/functions/v1/send_sms
   ```
5. Click **Generate Secret** (starts with `whsec_...`).
6. Copy the secret.

### Step 3: Configure Edge Function Secret
1. Go to **Project Settings** → **Edge Functions** (or use the Supabase CLI):
   ```bash
   supabase secrets set SEND_SMS_HOOK_SECRET=whsec_your_secret_here OTP_PROVIDER_MODE=development
   ```

> **IMPORTANT WARNING:**  
> Do **NOT** use the "Create Custom Auth Provider" screen in the Supabase Dashboard. That screen is strictly for OAuth2 / OIDC Single Sign-On providers, NOT phone OTP authentication. Use **Authentication → Hooks → Send SMS**.

---

## 9. Troubleshooting Guide

| Issue | Cause | Resolution |
|-------|-------|------------|
| OTP request fails with 401 Webhook error | `SEND_SMS_HOOK_SECRET` in Edge Function does not match Supabase Dashboard hook secret | Verify secret matches in `supabase secrets list` and dashboard. |
| OTP not received on mobile | `OTP_PROVIDER_MODE` is set to `development` | In development, check the Edge Function logs in Supabase Dashboard → Functions → `send_sms` → Logs. |
| "Fatal security hazard" error | Production environment detected with `OTP_PROVIDER_MODE=development` | Configure `OTP_PROVIDER_MODE=production` and supply valid SMS gateway credentials. |
| KYC document upload fails | File exceeds 5MB or invalid MIME type | Ensure file is JPG, PNG, WEBP, or PDF and under 5MB. |
| Professional cannot accept job | Status is not `APPROVED` | Check application in Admin Review Center (`/admin/professionals`) and complete admin sign-off. |
