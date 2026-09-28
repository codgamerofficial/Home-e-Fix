# HOME-E-FIX: Authentication & OTP Delivery Comprehensive Audit

**Date:** 2026-09-28  
**Target Application:** https://home-e-fix.vercel.app/  
**Role:** Principal Full-Stack Architect, Security Engineer, Cloudflare & Supabase Engineer

---

## 1. Current Authentication Architecture

Home-e-Fix is structured as a Vite Single Page Application (SPA) hosted on Vercel with Cloudflare integration (Turnstile bot verification and Cloudflare Worker capabilities).

The existing authentication architecture had fractured responsibilities:
- **Client Application (`src/`):** React 19 SPA using Zustand (`auth.store.ts`), Supabase JS SDK client (`src/lib/supabase.ts`), and `auth.service.ts`.
- **OTP Subsystem (`src/services/otp/`):** Contained a custom `OtpService`, `DevelopmentOtpProvider`, and `ProductionOtpProvider` that handled OTP hashing, memory storage, and verification client-side.
- **Edge Worker (`worker/index.ts`):** Included custom routes `/api/otp/send` and `/api/otp/verify` storing hashed OTPs in an in-memory `EDGE_OTP_STORE` and dispatching via an unconfigured SMS gateway placeholder.
- **Vercel Edge API (`api/turnstile/verify.ts`):** Provided a standalone Turnstile siteverify proxy endpoint that verified bot tokens before auth was invoked.
- **Supabase Edge Function (`supabase/functions/send_sms/`):** Contained a Send SMS Auth Hook handler designed to receive webhook requests from Supabase Auth and relay them via an unconfigured gateway placeholder (`https://api.sms-provider.internal/v1/send`).

---

## 2. Customer OTP Flow (Pre-Fix Analysis)

1. **Login (`src/pages/auth/Login.tsx`):**
   - The user entered a 10-digit Indian phone number.
   - The frontend independently invoked `/api/turnstile/verify` via `turnstileService.verifyToken()` using action `customer_login_phone`.
   - If Turnstile succeeded, the browser directly called Supabase Auth client: `supabase.auth.signInWithOtp({ phone: formattedPhone, options: { channel: "sms" } })`.
   - Supabase Auth attempted to fire the Send SMS Hook, but the edge function lacked valid 2Factor credentials and pointed to a placeholder URL.
   - No SMS was ever delivered to the customer's phone.
2. **Registration (`src/pages/auth/Register.tsx`):**
   - User filled in name, email, phone, and completed Turnstile with action `customer_signup`.
   - `authService.sendPhoneOtp(phone)` was wrapped in a `try...catch` block that caught errors, logged `console.warn`, and unconditionally set state `step = "otp"`.
   - Entering any 6 digits in `Register.tsx` triggered `handleVerifyOtp` which generated a synthetic client object `{ id: "usr-" + Date.now(), ... }` and stored dummy session token `"hef-auth-token"`.
3. **Standalone OTP Verification (`src/pages/auth/OtpVerification.tsx`):**
   - Accepted any 6 digits and minted dummy user `usr-...` with token `"hef-otp-token"`, completely bypassing Supabase Auth.

---

## 3. Professional OTP Flow (Pre-Fix Analysis)

1. **Onboarding (`src/pages/professional/ProfessionalOnboarding.tsx`):**
   - The professional entered their mobile number and solved the Turnstile challenge (action `professional_otp`).
   - The page invoked `turnstileService.verifyToken(token, "professional_otp")` against `/api/turnstile/verify`.
   - The browser then directly called `authService.sendPhoneOtp(normalized)`.
   - Like the customer flow, this triggered the Supabase Send SMS hook which failed silently or returned 502/500 due to unconfigured SMS gateway credentials.
   - For verification, `authService.verifyPhoneOtp(normalized, otp)` invoked `supabase.auth.verifyOtp()`, but since no real OTP had arrived, verification could never succeed.

---

## 4. Turnstile Implementation

- **Widget (`src/components/shared/TurnstileWidget`):** Uses `@marsidev/react-turnstile` with explicit rendering and auto-reset mechanisms.
- **Site Key:** `VITE_TURNSTILE_SITE_KEY` configured in `.env` (`0x4AAAAAAFDtfWrwe8v_2bcD`).
- **Secret Key:** `TURNSTILE_SECRET` / `TURNSTILE_SECRET_KEY` configured in server environment.
- **Flaws Identified:**
  - Turnstile verification was separated from the OTP dispatch API. A malicious actor could bypass Turnstile entirely and directly invoke Supabase Auth endpoints or spam the SMS hook.
  - Action identifiers were inconsistent: `customer_login_phone`, `customer_signup` instead of unified `customer_otp` and `professional_otp`.
  - Allowed hostnames were configured via environment, but Turnstile tokens were verified via a separate pre-flight call rather than atomically inside the OTP request transaction.

---

## 5. Supabase Configuration

- **Project:** `uzlarcvmhshwgtvtxcsh.supabase.co`
- **Client Configuration:** `src/lib/supabase.ts` configured with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`.
- **Database Schema:** Standard `auth.users` table with application tables (`users`, `profiles`, `customers`, `professionals`, `professional_documents`).
- **Send SMS Auth Hook:**
  - Supabase supports HTTP Send SMS Hook that sends a POST request with payload `{"user": {"phone": "..."}, "sms": {"otp": "..."}}`.
  - Signature verification uses standard Svix-compatible webhook headers (`webhook-id`, `webhook-timestamp`, `webhook-signature`).

---

## 6. SMS Implementation

- **Supabase Function (`supabase/functions/send_sms/`):**
  - Handled incoming webhook payload correctly.
  - However, `productionOtpProvider.ts` contained a mock endpoint:
    `const endpoint = gatewayUrl || "https://api.sms-provider.internal/v1/send";`
  - It expected generic `SMS_PROVIDER_API_KEY`, but no adapter existed for **2Factor.in**.
- **Worker (`worker/index.ts`):**
  - Maintained its own parallel `/api/otp/send` attempting to call `SMS_GATEWAY_URL` with bearer token, which was disconnected from Supabase Auth and lacked 2Factor integration.

---

## 7. Cloudflare Implementation

- **Worker:** `worker/index.ts` with `wrangler.jsonc`.
- **Static Assets:** Serves `./dist` SPA with API routes for Razorpay, Health, and Turnstile.
- **Secrets Management:** Cloudflare Worker Secrets supported via `wrangler secret put`.
- **Flaws Identified:**
  - Duplicate OTP store (`EDGE_OTP_STORE`) existed in `worker/index.ts`.
  - No atomic `POST /api/auth/request-otp` endpoint orchestrated Turnstile + Rate Limiting + Supabase Auth.

---

## 8. Existing Errors

1. **OTP Never Received:** When requesting OTP, the Indian mobile number received no SMS because the backend SMS adapter called `https://api.sms-provider.internal/v1/send` instead of 2Factor.
2. **Action Mismatch:** Client sent `customer_login_phone` while backend expected `customer_otp`.
3. **Rate Limiting Mismatch:** In-memory rate limits were scattered across `OtpService`, `worker/index.ts`, and Vercel edge routes.

---

## 9. Security Vulnerabilities

1. **Client-Side OTP Bypass:** `Register.tsx` and `OtpVerification.tsx` accepted any 6 digits and minted synthetic authenticated user sessions with dummy tokens.
2. **Decoupled Turnstile:** Turnstile was verified in a prior standalone step, allowing automated bots to call Supabase or worker endpoints directly without presenting a token.
3. **Mislabeled Secret in `.env`:** Line 37 of `.env` had `RAZORPAY_WEBHOOK_SECRET` populated with a Supabase `service_role` JWT token. While not exposed with a `VITE_` prefix, this secret must be secured, isolated, and properly rotated in production.
4. **Client-Side Hash Verification:** `src/services/otp/productionOtpProvider.ts` contained a client-side `verifyOtp` method that hashed user input in JavaScript and compared it against `expectedHash`.

---

## 10. Duplicate Implementations

- **Duplicate OTP Providers:** `src/services/otp/` vs `supabase/functions/send_sms/otp/` vs `worker/index.ts`.
- **Duplicate Verification Flows:** `authService.verifyPhoneOtp` (Supabase) vs `OtpService.verifyOtp` (local hash) vs `worker/index.ts` (`/api/otp/verify`).
- **Duplicate Phone Normalizers:** In `otpService.ts`, `worker/index.ts`, and local page components.

---

## 11. Root Cause of OTP Failure

The root cause of the OTP delivery failure is a **broken delivery chain**:
1. When a user submitted their phone number, the frontend called `supabase.auth.signInWithOtp()`.
2. Supabase Auth generated an OTP and executed the configured Send SMS Hook (`supabase/functions/send_sms/`).
3. The Send SMS Hook called `ProductionOtpProvider`, which attempted an HTTP POST to `https://api.sms-provider.internal/v1/send` with missing/dummy credentials.
4. No integration with 2Factor.in existed.
5. The HTTP request failed, no SMS was dispatched to the Indian carrier network, and the user never received their verification code.

---

## 12. Files Requiring Modification

1. `src/lib/phone.ts` — Provide authoritative, canonical `normalizeIndianPhone()`.
2. `src/services/auth.service.ts` — Consolidate OTP request through canonical `/api/auth/request-otp` and verification strictly through Supabase Auth.
3. `src/pages/auth/Login.tsx` — Integrate with canonical request OTP API, action `customer_otp`, Turnstile auto-reset on resend, and Supabase verification.
4. `src/pages/auth/Register.tsx` — Eliminate fake session minting; wire into canonical OTP flow.
5. `src/pages/auth/OtpVerification.tsx` — Eliminate fake session minting; wire into Supabase Auth `verifyOtp`.
6. `src/pages/professional/ProfessionalOnboarding.tsx` — Use canonical request OTP flow with action `professional_otp` and Supabase verification.
7. `supabase/functions/send_sms/otp/productionOtpProvider.ts` — Implement real 2Factor adapter.
8. `supabase/functions/send_sms/otp/developmentOtpProvider.ts` — Development safe logger.
9. `worker/index.ts` — Implement `/api/auth/request-otp` with Turnstile Siteverify, Rate Limiting, and Supabase Auth integration; remove `EDGE_OTP_STORE`.
10. `api/auth/request-otp.ts` — Provide matching Vercel Edge implementation for zero-drift deployment parity.

---

## 13. Files That Should Be Removed / Replaced

- Dead client-side OTP generation and verification methods in `src/services/otp/productionOtpProvider.ts` and `src/services/otp/developmentOtpProvider.ts`.
- Mock token minting logic in `src/pages/auth/OtpVerification.tsx` and `src/pages/auth/Register.tsx`.
- Standalone `/api/otp/send` and `/api/otp/verify` endpoints in `worker/index.ts`.

---

## 14. Required Dashboard Configuration

1. **Supabase Dashboard:**
   - **Authentication → Providers → Phone:** Enabled.
   - **Authentication → Auth Hooks → Send SMS Hook:**
     - Type: HTTP Hook.
     - Endpoint: `https://uzlarcvmhshwgtvtxcsh.supabase.co/functions/v1/send_sms`.
     - Secrets: `SEND_SMS_HOOK_SECRET` matching the webhook secret.
   - **Edge Functions Secrets:**
     - `SMS_PROVIDER=2factor`
     - `TWOFACTOR_API_KEY=<configured_in_dashboard>`
     - `TWOFACTOR_TEMPLATE_ID=<configured_in_dashboard>`
     - `TWOFACTOR_SENDER_ID=<configured_in_dashboard>`
2. **Cloudflare Dashboard:**
   - **Turnstile:** Widget configured for hostname `home-e-fix.vercel.app`.
   - **Worker Secrets:**
     - `TURNSTILE_SECRET`
     - `SUPABASE_SERVICE_ROLE_KEY`
     - `SUPABASE_URL`
3. **Vercel Dashboard:**
   - Ensure `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, and `VITE_TURNSTILE_SITE_KEY` are configured for the frontend.
   - Ensure backend secrets (`TURNSTILE_SECRET`, `SUPABASE_SERVICE_ROLE_KEY`, `TWOFACTOR_API_KEY`) are stored exclusively in backend environments.
