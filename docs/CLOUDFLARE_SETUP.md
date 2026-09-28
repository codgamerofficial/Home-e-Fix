# HOME-E-FIX: Cloudflare Turnstile & Worker Setup Manual

**Target Domain:** https://home-e-fix.vercel.app/  
**Components:** Cloudflare Turnstile (Fraud & Bot Prevention) + Cloudflare Worker (Edge Auth & OTP Gateway)

---

## 1. Cloudflare Turnstile Configuration

### A. Existing Widget Settings
- **Site Key:** `0x4AAAAAAFDtfWrwe8v_2bcD` (Configured in frontend as `VITE_TURNSTILE_SITE_KEY`)
- **Secret Key:** `0x4AAAAAAFDtfVqSjL_nWfjKubC97iKI_5o` (Stored server-side only as `TURNSTILE_SECRET`)
- **Domain List:**
  - `home-e-fix.vercel.app`
  - `localhost`
  - `127.0.0.1`

### B. Widget Actions
The Home-e-Fix frontend uses **explicit rendering** with single-use token lifecycle:
- `customer_otp`: Used on Customer login and registration forms.
- `professional_otp`: Used on Professional onboarding registration.

---

## 2. Cloudflare Worker Deployment (`home-e-fix-auth`)

The dedicated worker lives in `cloudflare/home-e-fix-auth/` and is also mirrored in `worker/index.ts`.

### A. Setting Worker Secrets
Never commit private secrets to `wrangler.toml` or git. Upload them via Wrangler CLI:

```bash
# 1. Turnstile Secret Key
wrangler secret put TURNSTILE_SECRET

# 2. Supabase Service Role Key (Server-to-Server Auth Admin)
wrangler secret put SUPABASE_SERVICE_ROLE_KEY

# 3. 2Factor SMS API Key
wrangler secret put TWOFACTOR_API_KEY

# 4. Optional: 2Factor DLT Template & Sender ID
wrangler secret put TWOFACTOR_TEMPLATE_ID
wrangler secret put TWOFACTOR_SENDER_ID
```

### B. Deploying to Cloudflare Workers

```bash
# From workspace root:
npm run build:worker

# Production deploy:
npm run cf:deploy
```

---

## 3. Endpoints Provided by the Worker

| Method | Path | Description | Access |
|---|---|---|---|
| `GET` | `/api/health` | Service health and dependency status | Public |
| `POST` | `/api/auth/request-otp` | Atomically validates Turnstile & rate limits, then requests Supabase OTP | Public (Rate-limited) |

---

## 4. Local Development vs Production

- **Local Development:** When `ENVIRONMENT=development` or running locally without remote secrets, the worker falls back gracefully to `DevelopmentSmsProvider` (logs OTP to terminal, zero SMS charge).
- **Production (`https://home-e-fix.vercel.app`):** Requires valid Turnstile challenge, enforces strict 60s phone cooldown, and dispatches via Supabase Auth + 2Factor.in.
