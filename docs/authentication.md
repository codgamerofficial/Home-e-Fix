# Home-e-Fix — Production Phone OTP Authentication System
### 2Factor + Supabase Auth + Cloudflare Infrastructure

---

## 1. Executive Summary & Architecture

Home-e-Fix uses a unified, secure, production-grade Indian mobile number (+91) OTP authentication pipeline. 

### Core Architectural Principle
* **Supabase Auth** is the **sole authentication and OTP authority**. Supabase generates the 6-digit cryptographic OTP and verifies it natively via `supabase.auth.verifyOtp()`.
* **2Factor.in** is strictly the **SMS transport delivery provider**. The application does NOT verify 2Factor-generated OTPs independently or create custom unverified sessions.
* **Cloudflare / Edge Gateway** provides **Turnstile bot defense** and **per-phone / per-IP rate limiting** to protect against SMS toll fraud and exhaustion attacks.

### Architecture Flowchart

```text
                        +---------------------------+
                        |     Home-e-Fix Client     |
                        |   (Customer / Pro UI)     |
                        +-------------+-------------+
                                      |
                                      | 1. Phone + Turnstile Token
                                      v
                        +---------------------------+
                        |  Cloudflare Edge Gateway  |
                        | (/api/auth/request-otp)   |
                        +-------------+-------------+
                                      |
                       [Turnstile Valid & Rate Limit OK]
                                      |
                                      | 2. POST /auth/v1/otp (or signInWithOtp)
                                      v
                        +---------------------------+
                        |       Supabase Auth       |
                        |  Generates 6-digit OTP    |
                        +-------------+-------------+
                                      |
                                      | 3. Send SMS Auth Hook (Svix Webhook)
                                      v
                        +---------------------------+
                        | Supabase Send SMS Hook /  |
                        |     SMS Edge Gateway      |
                        |  (svix signature verify)  |
                        +-------------+-------------+
                                      |
                                      | 4. POST /API/V1/OTP/SEND
                                      v
                        +---------------------------+
                        |      2Factor.in API       |
                        |   (DLT Route / Telecom)   |
                        +-------------+-------------+
                                      |
                                      | 5. Indian Telecom SMS Delivery
                                      v
                                📱 User Phone (+91)
                                      |
                                      | 6. User enters 6-digit OTP
                                      v
                        +---------------------------+
                        |   supabase.auth.verifyOtp |
                        | (Authoritative Supabase)  |
                        +-------------+-------------+
                                      |
                                      | 7. Session Created
                                      v
                    +-----------------+-----------------+
                    |                                   |
                    v                                   v
             [Customer Role]                    [Professional Role]
                    |                                   |
         Customer Dashboard /             KYC State Machine:
          Profile Auto-sync               - phone_verified (true)
                                          - kyc_status (pending/under_review)
                                          - admin_approval_status (pending)
```

---

## 2. Customer Authentication Flow

1. **Input & Normalization**: User enters their 10-digit Indian phone number (e.g. `98765 43210`). The canonical utility `src/lib/phone.ts` normalizes it to E.164 `+919876543210`.
2. **Turnstile Bot Defense**: The client invokes Cloudflare Turnstile with action `customer_otp`.
3. **Dispatch Request**: Client calls `/api/auth/request-otp` with phone, role `customer`, action `customer_otp`, and turnstile token.
4. **Supabase OTP Generation**: Gateway triggers Supabase Auth `signInWithOtp({ phone })`. Supabase generates a 6-digit OTP and fires the `Send SMS Hook`.
5. **SMS Delivery via 2Factor**: The hook dispatches SMS to the user's mobile via 2Factor DLT-approved template `HOME_E_FIX_LOGIN`.
6. **OTP Entry**: User enters the 6-digit OTP in the accessible OTP input component with auto-focus, paste support, and a 60-second resend countdown.
7. **Native Verification**: Client calls `supabase.auth.verifyOtp({ phone: '+919876543210', token: otp, type: 'sms' })`.
8. **Session Established**: Supabase issues an authoritative JWT session. Customer profile is resolved or initialized in the `profiles` table. User is redirected to `/customer/dashboard`.

---

## 3. Professional Authentication & Onboarding Flow

1. **Input & Normalization**: Professional enters their 10-digit Indian phone number on `/become-professional`.
2. **Turnstile Bot Defense**: Turnstile verifies the request with action `professional_otp`.
3. **Dispatch Request**: Gateway triggers Supabase Auth for the professional user.
4. **OTP Delivery**: 2Factor delivers SMS OTP to the professional's mobile.
5. **Native Verification**: Verified via `supabase.auth.verifyOtp`.
6. **Separation of Concerns (CRITICAL)**:
   * **Phone Verification**: `phone_verified: true` marks mobile ownership only.
   * **KYC Status**: Distinct state (`draft` -> `submitted` -> `under_review` -> `verified`).
   * **Admin Approval**: Distinct state (`pending` -> `approved` -> `rejected`).
   * **Safety Rule**: Phone verification **NEVER** bypasses KYC or grants active professional listing rights until documents are approved by an administrator.

---

## 4. Supabase Configuration

### Enable Phone Auth
In the Supabase Dashboard:
1. Navigate to **Authentication** -> **Providers** -> **Phone**.
2. Toggle **Enable Phone Provider** to **ON**.
3. Under **SMS Provider**, select **Custom SMS Provider (Auth Hook)**.
4. Ensure **Confirm Phone** is enabled (Do NOT enable auto-confirmation in production).

### Configure Send SMS Hook
1. Navigate to **Authentication** -> **Hooks** -> **Send SMS Hook**.
2. Select **HTTP Endpoint** or **Supabase Edge Function**.
3. Point to: `https://<project-ref>.supabase.co/functions/v1/send_sms`.
4. Copy the webhook secret into `SEND_SMS_HOOK_SECRET` / `SUPABASE_SMS_HOOK_SECRET`.
5. The hook verifies standard Svix signatures (`svix-id`, `svix-timestamp`, `svix-signature`) using constant-time comparison before processing.

---

## 5. 2Factor.in SMS Integration Contract

2Factor serves as the authoritative Indian SMS gateway.

### Official Endpoint (JSON POST)
* **URL**: `https://2factor.in/API/V1/OTP/SEND`
* **Method**: `POST`
* **Headers**:
  ```http
  Content-Type: application/json
  X-API-Key: <TWOFACTOR_API_KEY>
  ```
* **Payload**:
  ```json
  {
    "to": "+919876543210",
    "template": "HOME_E_FIX_LOGIN",
    "var1": "482910"
  }
  ```

### Fallback Endpoint (REST GET)
* **URL**: `https://2factor.in/API/V1/:api_key/SMS/:phone/:otp/:template`
* **Method**: `GET`

### Success Response
```json
{
  "Status": "Success",
  "Details": "9a38f321-72cb-4bc3-9524-2c67672221b2"
}
```

### Error Response
```json
{
  "Status": "Error",
  "Details": "Invalid API Key or Insufficient Balance"
}
```

---

## 6. DLT / Indian Telecom Compliance

In accordance with Telecom Regulatory Authority of India (TRAI) regulations, all commercial SMS in India must route through an approved Distributed Ledger Technology (DLT) entity.

* **Registered Sender ID**: `HEFFIX` (or 6-character approved alpha header)
* **Registered Entity ID**: Configurable via `SMS_ENTITY_ID`
* **Approved DLT Template**: `HOME_E_FIX_LOGIN`
* **Registered Message Content**:
  > "Your Home-e-Fix verification OTP is {#numeric#}. Do not share this OTP with anyone."

---

## 7. Cloudflare Infrastructure & Turnstile

### Cloudflare Worker Gateway (`cloudflare/home-e-fix-auth`)
* **Endpoint**: `/api/auth/request-otp`
  * Validates E.164 phone formatting (`normalizeIndianPhone`).
  * Enforces Turnstile bot verification (`verifyTurnstileToken`).
  * Enforces rate limiting (60s cooldown per phone, 5 requests / 15 mins).
  * Calls Supabase Auth securely using server-side credentials.
* **Health Check**: `/api/health` reports status of dependencies without leaking secrets.

### Turnstile Bot Protection
* Server verifies client token against Cloudflare's verification endpoint:
  `POST https://challenges.cloudflare.com/turnstile/v0/siteverify`
* Validates matching expected action:
  * `customer_otp` for customer flows
  * `professional_otp` for professional flows

---

## 8. Development Mode vs Production Mode

| Capability | Development Mode (`AUTH_SMS_MODE=development`) | Production Mode (`AUTH_SMS_MODE=production`) |
| :--- | :--- | :--- |
| **SMS Provider** | `DevelopmentSmsProvider` | `TwoFactorSmsProvider` |
| **Real SMS Sent** | **No** (Zero 2Factor charges) | **Yes** (Dispatched to +91 mobile) |
| **Console Logs** | Masked phone + simulated message ID | Masked phone + provider status ID |
| **Production Guard**| Throws fatal exception if active in production | Enforced in all production builds |

### Fail-Closed Production Safeguard
```typescript
if (isProd && (mode === "development" || provider === "development")) {
  throw new Error("FATAL: Development SMS provider cannot be loaded in production environment!");
}
```

---

## 9. Rate Limiting Specifications

| Scope | Limit | Window | Action on Violation |
| :--- | :--- | :--- | :--- |
| **Per-Phone Cooldown** | 1 request | 60 seconds | 429 Too Many Requests ("Please wait before requesting a new OTP") |
| **Per-Phone Window** | 5 requests | 15 minutes | 429 Too Many Requests ("Maximum OTP requests reached. Try again later") |
| **Per-IP Protection** | 10 requests | 5 minutes | 429 Too Many Requests ("Too many OTP requests from this connection") |
| **OTP Verification** | 5 attempts | Per OTP lifetime | OTP invalidated, user must request new OTP |

---

## 10. Environment Variables & Secret Separation

### Public / Client-Safe (Vite / Browser)
* `VITE_SUPABASE_URL`: Supabase project URL.
* `VITE_SUPABASE_ANON_KEY`: Supabase anon public JWT key.
* `VITE_TURNSTILE_SITE_KEY`: Cloudflare Turnstile public site key.

### Server-Side ONLY (Supabase Secrets / Cloudflare Secrets)
* `SUPABASE_SERVICE_ROLE_KEY`: Administrative Supabase key. **NEVER expose to client**.
* `SEND_SMS_HOOK_SECRET` / `SUPABASE_SMS_HOOK_SECRET`: Webhook secret for Send SMS Hook.
* `TWOFACTOR_API_KEY`: 2Factor.in account API key.
* `TWOFACTOR_TEMPLATE_ID`: DLT approved template name (`HOME_E_FIX_LOGIN`).
* `TWOFACTOR_SENDER_ID`: DLT approved 6-character header (`HEFFIX`).
* `TURNSTILE_SECRET` / `TURNSTILE_SECRET_KEY`: Cloudflare Turnstile secret key.

---

## 11. Security Audit & Best Practices

1. **No Frontend Leaks**: Grepped and verified zero `VITE_TWOFACTOR_` or `VITE_SUPABASE_SERVICE_ROLE_KEY` references in browser code.
2. **Timing-Safe Verification**: Svix webhook signatures are validated using constant-time HMAC SHA-256 comparisons.
3. **Safe Privacy Logging**: Production logs strictly mask phone numbers (`+91******3210`) and NEVER print OTP values or API keys.
4. **No Database OTP Storage**: OTPs are generated and validated in-memory by Supabase Auth; no raw or unhashed OTPs are stored in application tables.

---

## 12. Secret Rotation Runbook (Zero Downtime)

### Rotating `TWOFACTOR_API_KEY`
1. Generate new API key in the 2Factor.in portal.
2. Update Cloudflare Worker secret:
   ```bash
   npx wrangler secret put TWOFACTOR_API_KEY
   ```
3. Update Supabase Edge Function secret:
   ```bash
   npx supabase secrets set TWOFACTOR_API_KEY="new_key_here"
   ```
4. Verify via `/api/health` and test one real SMS OTP.
5. Revoke old key in 2Factor portal.

### Rotating `SUPABASE_SMS_HOOK_SECRET`
1. Generate a new secret in Supabase Dashboard -> **Authentication** -> **Hooks**.
2. Supabase supports secret rotation with dual-verification during transition.
3. Update `SEND_SMS_HOOK_SECRET` in Edge Function / Worker secrets.
4. Finalize rotation in Supabase Dashboard.

---

## 13. Troubleshooting Guide

| Issue / Error | Cause | Resolution |
| :--- | :--- | :--- |
| `SMS_PROVIDER_CONFIG_MISSING` | `TWOFACTOR_API_KEY` is empty in server environment | Configure secret in Supabase / Cloudflare secrets. |
| `429 Too Many Requests` | Cooldown active (<60s) or >5 requests in 15 mins | Wait for cooldown timer to expire. |
| `INVALID_PHONE` | Number has <10 digits or does not start with 6-9 | Enter valid 10-digit Indian mobile number. |
| `TURNSTILE_FAILED` | Bot verification token expired or invalid action | Refresh page and solve Turnstile widget. |
| `INVALID_OTP` | Entered code does not match Supabase generated OTP | Check latest SMS received and re-enter. |
| `EXPIRED_OTP` | OTP lifetime (typically 5 minutes) exceeded | Click "Resend OTP" to generate a fresh code. |
