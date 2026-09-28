# HOME-E-FIX: Production OTP Authentication Architecture

**Target Application:** https://home-e-fix.vercel.app/  
**Status:** Canonical Production Specification  
**Authority:** Supabase Auth (Identity & OTP Verification) + Cloudflare (Turnstile & Edge Gateway) + 2Factor (Indian SMS Telecom Delivery)

---

## 1. System Architecture Overview

```
                         USER
                           │
                           ▼
                 Home-e-Fix Frontend (SPA)
                           │
                           ▼
              Cloudflare Turnstile Challenge
          (Action: customer_otp / professional_otp)
                           │
                           ▼
             Cloudflare Worker / Edge Gateway
                  POST /api/auth/request-otp
                           │
             ┌─────────────┴─────────────┐
             │                           │
      Turnstile Verify             Rate Limiting
  (Cloudflare Siteverify)      (Phone & IP Cooldowns)
             │                           │
             └─────────────┬─────────────┘
                           │
                           ▼
                    Supabase Auth
               (signInWithOtp / Admin)
                           │
                           ▼
                Send SMS Auth Hook
          (POST /functions/v1/send_sms)
                           │
                           ▼
                Home-e-Fix SMS Layer
             (SmsProvider Abstraction)
                           │
             ┌─────────────┴─────────────┐
             │                           │
    [Production Mode]           [Development Mode]
      2Factor.in API           Safe Console Logger
             │
             ▼
     Indian Telecom Carrier
             │
             ▼
    Real Indian Mobile (+91)
             │
             ▼
      User Enters 6-Digit OTP
             │
             ▼
      supabase.auth.verifyOtp()
  { phone, token, type: 'sms' }
             │
             ▼
       Authoritative User Session
             │
       ┌─────┴─────────────────────┐
       │                           │
   CUSTOMER                  PROFESSIONAL
       │                           │
  Customer Profile          KYC / Onboarding
                                   │
                                   ▼
                            Admin Approval
```

---

## 2. Core Responsibilities & Separation of Concerns

| Component | Provider | Responsibilities | Forbidden Actions |
|---|---|---|---|
| **Bot Protection** | Cloudflare Turnstile | Protects OTP endpoints against bot abuse; validates token against Siteverify API. | Never sends SMS; never generates OTP. |
| **Edge Gateway** | Cloudflare Worker / Vercel Edge | Turnstile validation, rate limiting, phone normalization, Supabase invocation, CORS headers. | Never generates fake OTP; never stores unhashed OTPs; never bypasses Supabase Auth. |
| **Auth Authority** | Supabase Auth | User identity lifecycle, cryptographic OTP generation, OTP expiry, and OTP verification via `verifyOtp()`. | Never handles raw telecom carrier delivery directly. |
| **SMS Hook** | Supabase Edge Function | Receives Svix webhook from Supabase Auth; verifies signature; delegates to active SMS provider. | Never reveals OTP back to frontend; never executes unauthenticated. |
| **SMS Delivery** | 2Factor.in (Initial) | Delivers 6-digit OTP via DLT-approved SMS route to Indian telecom networks. | Never verifies OTP; never stores user passwords or tokens. |

---

## 3. End-to-End User Journeys

### A. Customer Flow
1. **Entry:** Customer navigates to `/login` or `/signup` and enters a 10-digit Indian mobile number.
2. **Phone Normalization:** The input is formatted to canonical E.164 (`+91[6-9]\d{9}`).
3. **Turnstile:** User completes Turnstile widget with action `customer_otp`.
4. **Dispatch Request:** Frontend submits `POST /api/auth/request-otp` with:
   ```json
   {
     "phone": "+919876543210",
     "role": "customer",
     "action": "customer_otp",
     "turnstileToken": "<TOKEN>"
   }
   ```
5. **Gateway Validation:** Gateway checks Turnstile Siteverify and verifies rate limit (60s cooldown, 5/hour max).
6. **Supabase Trigger:** Gateway requests OTP via Supabase Auth.
7. **Hook & Delivery:** Supabase fires the Send SMS Hook, which invokes `TwoFactorSmsProvider`, sending the SMS via 2Factor.
8. **Verification:** User inputs 6-digit code. Client invokes `supabase.auth.verifyOtp({ phone, token, type: 'sms' })`.
9. **Session:** Supabase returns authoritative JWT session; customer profile is loaded or initialized.

### B. Professional Flow
1. **Entry:** Professional accesses `/become-professional` or `/professional/register`.
2. **Phone Normalization:** Validated to canonical `+91[6-9]\d{9}` format.
3. **Turnstile:** Turnstile widget completed with action `professional_otp`.
4. **Dispatch Request:** Submits `POST /api/auth/request-otp` with `role: "professional"`, `action: "professional_otp"`.
5. **Gateway & Delivery:** Verified and dispatched through Supabase Auth and 2Factor.
6. **Verification:** User enters 6-digit OTP verified via `supabase.auth.verifyOtp()`.
7. **Role & Lifecycle:** Authenticated identity established. Professional status proceeds to `phone_verified` -> `profile_incomplete` -> `kyc_pending` -> `under_review` -> `approved`.

---

## 4. Security & Data Protection Rules

1. **No Frontend OTP Comparison:** Under no circumstances may client-side code compare OTP values or generate synthetic sessions.
2. **Single-Use Turnstile Tokens:** Every OTP request and resend requires a fresh, unexpired Turnstile token. Replay attempts are rejected with HTTP 403.
3. **Rate Limiting:**
   - 60 seconds per-phone resend cooldown.
   - 5 requests per rolling hour per phone number.
   - 10 requests per 5 minutes per client IP address.
4. **Phone Redaction in Logs:** Any log message containing a phone number masks the central digits (e.g., `+91••••••3210`).
5. **DLT Telecom Compliance:** Production SMS messages sent in India use DLT-approved templates and registered sender IDs via 2Factor.in.
