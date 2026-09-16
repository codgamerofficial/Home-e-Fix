# Home-e-Fix Environment Audit & Security Strategy

**Audit Timestamp:** September 16, 2026  
**Security Classification:** Highly Confidential (Advisory Only — No Secret Values Exposed)

---

## 1. Executive Summary & Security Advisory

During the environment audit of the Home-e-Fix platform, credentials were reviewed to assess production readiness, potential data exposure, and architectural cleanliness.

> [!CAUTION]
> **MANDATORY CREDENTIAL ROTATION REQUIRED BEFORE PRODUCTION**
> 
> 1. **Razorpay Credentials**:
>    - `RAZORPAY_KEY_ID` (Test key present)
>    - `RAZORPAY_KEY_SECRET` (Present in local environment)
>    - **Action**: Rotate `RAZORPAY_KEY_SECRET` in the Razorpay Merchant Dashboard immediately prior to staging/production releases.
> 
> 2. **Cashfree Credentials**:
>    - Cashfree credentials were historically stored/referenced across configuration documents.
>    - **Action**: Any previously generated Cashfree Client Secret / App Secret must be revoked and regenerated in the Cashfree Merchant Dashboard (`merchant.cashfree.com`). Ensure sandbox vs. production environment flags (`CASHFREE_ENV=sandbox`) are strictly isolated.
> 
> 3. **Supabase Service Role Key**:
>    - Never expose `SUPABASE_SECRET_KEY` or `SUPABASE_SERVICE_ROLE_KEY` to client-side bundles (e.g. Vite or Next.js `NEXT_PUBLIC_*` or `VITE_*` prefixes). Only `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` or `VITE_SUPABASE_ANON_KEY` may be sent to the browser.
> 
> 4. **Zero-Contamination Verification**:
>    - No legacy e-commerce, print-on-demand (POD), or KultZR commerce variables are active in Home-e-Fix runtime files. Home-e-Fix is strictly a specialized on-demand home services marketplace.

---

## 2. Environment Variables Inventory

| Variable Name | Purpose | Provider | Scope (Client/Server) | Used By Feature / File | Status | Production Rotation Required? |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Environment mode | Node.js | Both | Runtime configuration | Configured (`development`) | No |
| `NEXT_PUBLIC_APP_NAME` | Brand title | Platform | Client | Navigation, Titles, PWA | Configured (`Home-e-Fix`) | No |
| `NEXT_PUBLIC_APP_URL` | Application root URL | Platform | Both | Auth redirect, SEO | Configured | No |
| `BUSINESS_TIMEZONE` | Operational timezone | Platform | Both | Slots & Booking Engine | Configured (`Asia/Kolkata`) | No |
| `DEFAULT_COUNTRY` | Localization country | Platform | Both | Geocoding & Addresses | Configured (`IN`) | No |
| `DEFAULT_CURRENCY` | System currency | Platform | Both | Pricing & Billing | Configured (`INR`) | No |
| `VITE_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Supabase API endpoint | Supabase | Client | Supabase Client (`supabase.ts`) | Configured | No (Public URL) |
| `VITE_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase anonymous RLS key | Supabase | Client | Database & Realtime Client | Configured | Re-generate if leaked |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Administrative database key | Supabase | Server Only | Edge Functions / Backend API | Configured | **ROTATION REQUIRED** |
| `VITE_RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay public key | Razorpay | Client | Razorpay Checkout SDK | Configured (Test) | Rotate to live key for prod |
| `RAZORPAY_KEY_SECRET` | Razorpay server secret | Razorpay | Server Only | Order Creation & Signatures | Configured (Test) | **ROTATION REQUIRED** |
| `RAZORPAY_WEBHOOK_SECRET` | Razorpay webhook validation | Razorpay | Server Only | Webhook Idempotency Handler | Needs Configuration | Set upon webhook setup |
| `CASHFREE_ENV` | Cashfree environment flag | Cashfree | Server Only | Secondary Gateway (`sandbox`/`production`) | Configured (`sandbox`) | No |
| `CASHFREE_CLIENT_ID` | Cashfree App ID | Cashfree | Server Only | Secondary Gateway | Optional / Needs Config | Set upon Cashfree enablement |
| `CASHFREE_CLIENT_SECRET` | Cashfree Secret Key | Cashfree | Server Only | Secondary Gateway | Optional / Needs Config | **ROTATION REQUIRED** |
| `CASHFREE_WEBHOOK_SECRET` | Cashfree Webhook Signature | Cashfree | Server Only | Cashfree Webhook Route | Optional / Needs Config | Set upon Cashfree enablement |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` / `VITE_MAP_API_KEY` | Maps JavaScript API key | Google Maps | Client | Autocomplete, Route Map, Marker | Configured | Restrict by HTTP Referrer |
| `GOOGLE_MAPS_SERVER_API_KEY` | Routes & Route Matrix API key | Google Maps | Server Only | ETA Engine, Distance Matrix | Configured | Restrict by Server IP |
| `GOOGLE_MAPS_MAP_ID` | Cloud-styled vector map ID | Google Maps | Client | Custom Live Map styling | Optional | No |
| `LOCATION_TRACKING_ENABLED` | Global tracking kill-switch | Platform | Both | Location Engine | Configured (`true`) | No |
| `LOCATION_UPDATE_INTERVAL_MS` | GPS update throttling (ms) | Platform | Client/Pro | Transmitter watchPosition | Configured (`5000`) | No |
| `LOCATION_MIN_DISTANCE_METERS`| Minimum movement threshold (m) | Platform | Client/Pro | GPS jitter filter | Configured (`10`) | No |
| `LOCATION_SESSION_MAX_MINUTES`| Max tracking session duration | Platform | Server | Session cleanup job | Configured (`240`) | No |
| `ETA_REFRESH_INTERVAL_SECONDS`| Route calculation throttling (s) | Platform | Both | Routes Engine cache | Configured (`30`) | No |
| `RESEND_API_KEY` | Email dispatch key | Resend | Server Only | Notifications (`resend.ts`) | Configured | Keep server-only |
| `EMAIL_FROM_ADDRESS` | Sender address | Platform | Server Only | Notification emails | Configured | No |
| `SUPPORT_EMAIL` | Customer support address | Platform | Both | Help & Support Hub | Configured | No |
| `AI_PROVIDER` | AI provider selector | Platform | Server Only | Smart Assistant (`gemini`) | Configured | No |
| `GEMINI_API_KEY` | Gemini API key | Google AI | Server Only | Assistant & Job Diagnosis | Configured | Keep server-only |
| `SENTRY_DSN` | Error telemetry DSN | Sentry | Both | Observability & ErrorBoundary | Configured | No |

---

## 3. Separation of Concerns: Operational Config vs. Runtime Data

The environment audit confirms a clear demarcation between system configuration and runtime database records:

- **Environment Variables (Static / Infra)**:
  - Intervals, timeouts, endpoints, API keys, feature flags.
- **PostgreSQL Database State (Dynamic / Runtime)**:
  - Professional GPS coordinates (`latitude`, `longitude`, `heading`, `speed`).
  - Booking statuses, assignment attempts, customer addresses, service pricing, invoice amounts.
  - Tracking sessions (`professional_location_sessions`) and broadcast events.

---

## 4. Key Management & Production Hardening Checklist

- [ ] Rotate Razorpay key secret in Razorpay Dashboard.
- [ ] Ensure Google Maps Browser Key has HTTP Referrer restriction enabled (`home-e-fix.com/*`).
- [ ] Ensure Google Maps Server Key has IP restriction enabled and only enables **Routes API**, **Places API**, and **Geocoding API**.
- [ ] Verify that Vite bundle contains ZERO occurrences of `SUPABASE_SECRET_KEY`, `RAZORPAY_KEY_SECRET`, or `CASHFREE_CLIENT_SECRET`.
- [ ] Enforce Supabase Row-Level Security (RLS) policies for private Realtime Broadcast channels (`booking:{id}:tracking`).
