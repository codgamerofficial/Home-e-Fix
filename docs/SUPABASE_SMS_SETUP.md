# HOME-E-FIX: Supabase Send SMS Auth Hook Setup Manual

**Supabase Project:** `uzlarcvmhshwgtvtxcsh.supabase.co`  
**Hook Function:** `supabase/functions/send_sms/`  
**Target Provider:** 2Factor.in (Indian SMS Delivery)

---

## 1. Supabase Dashboard Configuration

### Step 1: Enable Phone Provider
1. Log in to [Supabase Dashboard](https://supabase.com/dashboard).
2. Select project **Home-e-Fix** (`uzlarcvmhshwgtvtxcsh`).
3. Navigate to **Authentication** > **Providers** > **Phone**.
4. Toggle **Enable Phone Provider** to **ON**.
5. Under SMS Provider, select **Send SMS Hook** (or custom hook).
6. Set **SMS OTP Expiry** to `300` seconds (5 minutes).

### Step 2: Configure Send SMS Auth Hook
1. In the Supabase Dashboard, navigate to **Authentication** > **Hooks** (or **Auth Hooks**).
2. Find the **Send SMS Hook**.
3. Select **HTTP Hook**.
4. Set URL to:
   ```
   https://uzlarcvmhshwgtvtxcsh.supabase.co/functions/v1/send_sms
   ```
5. Copy the generated **Webhook Secret** (starts with `whsec_`).

---

## 2. Deploying Edge Function & Secrets

### Step 1: Set Edge Function Secrets
Using the Supabase CLI (or the Dashboard under **Edge Functions** > **Secrets**):

```bash
# Set Send SMS Hook Secret (from Supabase Dashboard)
supabase secrets set SEND_SMS_HOOK_SECRET="whsec_..."

# Configure SMS Provider to 2Factor
supabase secrets set SMS_PROVIDER="2factor"
supabase secrets set ENVIRONMENT="production"

# Configure 2Factor Credentials
supabase secrets set TWOFACTOR_API_KEY="your-2factor-api-key"

# Optional: DLT Template Name and Sender ID
supabase secrets set TWOFACTOR_TEMPLATE_ID="HomeEFixOTP"
supabase secrets set TWOFACTOR_SENDER_ID="HEFFIX"
```

### Step 2: Deploy Edge Function

```bash
supabase functions deploy send_sms --no-verify-jwt
```
*(Note: `--no-verify-jwt` is required because the Send SMS Hook uses standard Svix webhook signature verification via headers, not standard user JWT tokens).*

---

## 3. How the Send SMS Hook Works

1. Supabase Auth triggers an internal event when a user requests an OTP.
2. Supabase generates a cryptographic 6-digit OTP code and signs an HTTP request to `https://uzlarcvmhshwgtvtxcsh.supabase.co/functions/v1/send_sms`.
3. The hook receives payload:
   ```json
   {
     "user": {
       "id": "uuid",
       "phone": "+919876543210"
     },
     "sms": {
       "otp": "123456"
     }
   }
   ```
4. `webhookVerifier.ts` validates the Svix `webhook-signature` using `SEND_SMS_HOOK_SECRET` with timing-safe comparison.
5. `TwoFactorSmsProvider.ts` dispatches the SMS via 2Factor REST API.
6. The hook returns HTTP 200 `{}`.
7. Supabase Auth records that the message was handed off to the SMS gateway.
