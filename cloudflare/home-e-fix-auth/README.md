# Home-e-Fix Auth Worker (`home-e-fix-auth`)

Cloudflare Edge Worker for bot protection, rate limiting, and Supabase Phone OTP orchestration.

## Features
- **Turnstile Bot Challenge Verification**: Validates Cloudflare Turnstile token via Siteverify before triggering OTP.
- **Strict Role & Action Enforcement**: Enforces `customer_otp` for customers and `professional_otp` for professionals.
- **Canonical Indian Phone Normalization**: E.164 canonicalization (`+91[6-9]\d{9}`).
- **Rate Limiting**: 60s cooldown per phone, 5 requests/hour per phone, IP connection limits.
- **Supabase Auth Hook Orchestration**: Triggers native Supabase OTP generation and Send SMS Hook.

## Deployment

```bash
# 1. Install dependencies
npm install

# 2. Add Secrets
wrangler secret put TURNSTILE_SECRET
wrangler secret put SUPABASE_SERVICE_ROLE_KEY
wrangler secret put TWOFACTOR_API_KEY
wrangler secret put TWOFACTOR_TEMPLATE_ID
wrangler secret put TWOFACTOR_SENDER_ID

# 3. Dry-run validation
npm run dry-run

# 4. Production deploy
npm run deploy
```
