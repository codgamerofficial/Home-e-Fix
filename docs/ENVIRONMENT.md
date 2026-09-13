# Home-e-Fix Environment & Integration Architecture

This document defines the authoritative environment variables, security boundaries, and integration parameters for the Home-e-Fix production marketplace.

---

## 1. Security First Principles

1. **Client vs. Server Separation**:
   - Variables prefixed with `VITE_` or `NEXT_PUBLIC_` are bundled directly into the browser JavaScript.
   - **Under no circumstances should API secret keys, database master passwords, private JWT keys, webhook secrets, or service accounts be prefixed with `VITE_` or `NEXT_PUBLIC_`.**
2. **Zero Hardcoded Secrets**:
   - No payment secrets (`RAZORPAY_KEY_SECRET`, `CASHFREE_CLIENT_SECRET`), database service keys, or OAuth secrets may be stored in code or committed to Git.
3. **Rotation Protocol**:
   - Any secret that has been committed to version control or shared over unsecured channels must be revoked and rotated immediately in the respective provider console.
4. **Environment-Aware Payment Safety**:
   - Production builds automatically check that test gateway keys (e.g. `rzp_test_...` or Cashfree Sandbox) are not accidentally active in live transactions.

---

## 2. Environment Variables Matrix

| Variable | Scope | Purpose | Required / Optional | Where to Obtain |
| :--- | :--- | :--- | :--- | :--- |
| `NODE_ENV` | Server | Runtime environment (`development`, `production`, `test`) | Required | Host/Runtime |
| `NEXT_PUBLIC_APP_NAME` | Client/Server | Application brand name ("Home-e-Fix") | Required | Static config |
| `NEXT_PUBLIC_APP_URL` | Client/Server | Public URL of application deployment | Required | Hosting provider |
| `NEXT_PUBLIC_TIMEZONE` | Client/Server | Business standard timezone (`Asia/Kolkata`) | Required | Static config |
| `NEXT_PUBLIC_DEFAULT_CURRENCY` | Client/Server | Currency symbol & ISO (`INR`) | Required | Static config |
| **Supabase Integration** | | | | |
| `VITE_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase Project API URL | Required | Supabase Dashboard > Settings > API |
| `VITE_SUPABASE_ANON_KEY` / `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Client | Supabase public anonymous client JWT | Required | Supabase Dashboard > Settings > API |
| `SUPABASE_URL` | Server | Supabase backend endpoint | Required | Supabase Dashboard > Settings > API |
| `SUPABASE_SECRET_KEY` / `SUPABASE_SERVICE_ROLE_KEY` | Server | Supabase Service Role key (bypasses RLS) | Required | Supabase Dashboard > Settings > API |
| **Razorpay Integration** | | | | |
| `VITE_RAZORPAY_KEY_ID` / `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Client | Public Razorpay Key ID | Required | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_KEY_ID` | Server | Razorpay Key ID for REST API calls | Required | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_KEY_SECRET` | Server | Razorpay Secret Key for HMAC verification | Required | Razorpay Dashboard > Settings > API Keys |
| `RAZORPAY_WEBHOOK_SECRET` | Server | Secret for validating webhook HMAC signatures | Required | Razorpay Dashboard > Settings > Webhooks |
| **Cashfree Integration** | | | | |
| `CASHFREE_ENV` | Server | Environment: `sandbox` or `production` | Optional | Cashfree Merchant Dashboard |
| `CASHFREE_CLIENT_ID` | Server | Cashfree App ID | Optional | Cashfree Merchant Dashboard > Developers |
| `CASHFREE_CLIENT_SECRET` | Server | Cashfree Secret Key | Optional | Cashfree Merchant Dashboard > Developers |
| `CASHFREE_WEBHOOK_SECRET` | Server | Webhook HMAC signature key | Optional | Cashfree Merchant Dashboard > Webhooks |
| `CASHFREE_API_VERSION` | Server | API version (`2025-01-01`) | Optional | Cashfree Documentation |
| **Google Maps Platform** | | | | |
| `VITE_MAP_API_KEY` / `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | Client | Restricted browser key (Places, Maps JS) | Required | Google Cloud Console > Credentials |
| `GOOGLE_MAPS_SERVER_API_KEY` | Server | Restricted server key (Geocoding, Routes) | Optional | Google Cloud Console > Credentials |
| `GOOGLE_MAPS_MAP_ID` | Client | Vector map ID for custom styling | Optional | Google Cloud Console > Map Management |
| **Google Authentication** | | | | |
| `VITE_GOOGLE_CLIENT_ID` | Client | Google OAuth 2.0 Web Client ID | Required | Google Cloud Console > Credentials |
| `GOOGLE_CLIENT_SECRET` | Server | Google OAuth 2.0 Client Secret | Optional | Google Cloud Console > Credentials |
| **Transactional Email** | | | | |
| `RESEND_API_KEY` | Server | Resend transactional email API key | Optional | Resend Dashboard > API Keys |
| `RESEND_WEBHOOK_SECRET` | Server | Webhook validation key for delivery events | Optional | Resend Dashboard > Webhooks |
| `EMAIL_FROM_NAME` | Server | Sender display name ("Home-e-Fix") | Optional | Resend Dashboard > Domains |
| `EMAIL_FROM_ADDRESS` | Server | Verified sender address | Optional | Resend Dashboard > Domains |
| **Push Notifications** | | | | |
| `NEXT_PUBLIC_FIREBASE_*` | Client | Firebase public config for web push (FCM) | Optional | Firebase Console > Project Settings |
| `FIREBASE_CLIENT_EMAIL` | Server | Firebase Admin service account email | Optional | Firebase Console > Service Accounts |
| `FIREBASE_PRIVATE_KEY` | Server | Firebase Admin private key | Optional | Firebase Console > Service Accounts |
| **AI Assistants** | | | | |
| `AI_PROVIDER` | Server | AI provider: `gemini` or `openrouter` | Optional | Static config |
| `GEMINI_API_KEY` | Server | Google AI Studio API key | Optional | Google AI Studio |
| `OPENROUTER_API_KEY` | Server | OpenRouter API key | Optional | OpenRouter Dashboard |
| **Bot Protection** | | | | |
| `NEXT_PUBLIC_TURNSTILE_SITE_KEY` | Client | Cloudflare Turnstile public site key | Optional | Cloudflare Dashboard > Turnstile |
| `TURNSTILE_SECRET_KEY` | Server | Cloudflare Turnstile secret key | Optional | Cloudflare Dashboard > Turnstile |
| **Observability** | | | | |
| `SENTRY_DSN` | Server | Sentry DSN for backend error logging | Optional | Sentry Dashboard > Project Settings |
| `NEXT_PUBLIC_SENTRY_DSN` | Client | Sentry DSN for frontend telemetry | Optional | Sentry Dashboard > Project Settings |

---

## 3. Integration Health Checks

The Admin Operations Center includes a dedicated integration status dashboard at:
`/admin/system/integrations`

This page displays the real-time status of each external integration:
- `CONNECTED`: Valid credentials configured and operational.
- `CONFIGURATION_REQUIRED`: Credentials not provided; system operates with graceful fallback.
- `TEST_MODE`: Development or sandbox credentials active.
- `LIVE_MODE`: Production verified credentials active.
- `DISABLED`: Feature flag set to `false`.

Under no circumstances are raw secret keys shown in the dashboard or returned over the API.
