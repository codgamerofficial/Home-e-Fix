# HOME-E-FIX: Phone OTP Failure Diagnosis & Troubleshooting Manual

This guide outlines the layer-by-layer troubleshooting protocol to isolate, diagnose, and resolve OTP delivery issues across the Home-e-Fix authentication architecture.

---

## 1. End-to-End Failure Trace Pipeline

Whenever a user does not receive an OTP SMS on their Indian mobile number, do NOT guess. Trace through each layer in order:

```
[1. FRONTEND]
      │ (Phone normalization + Turnstile Widget)
      ▼
[2. TURNSTILE]
      │ (Bot Challenge Token)
      ▼
[3. CLOUDFLARE WORKER / EDGE GATEWAY]
      │ (Turnstile Siteverify + Rate Limiting)
      ▼
[4. SUPABASE AUTH]
      │ (Cryptographic OTP Generation + Expiry Storage)
      ▼
[5. SEND SMS AUTH HOOK]
      │ (Svix Webhook Signature Verification)
      ▼
[6. 2FACTOR ADAPTER]
      │ (DLT-Approved HTTP Request)
      ▼
[7. 2FACTOR GATEWAY RESPONSE]
      │ (Status: Success / Error)
      ▼
[8. INDIAN TELECOM SCRUBBER & CARRIER]
      │ (DLT Template & Entity ID Scrutiny)
      ▼
[9. RECIPIENT HANDSET]
      (Real Indian SMS Delivery)
```

---

## 2. Layer-by-Layer Diagnostic Matrix

### Layer 1: FRONTEND
- **Failure Symptom:** "Please enter a valid Indian mobile number."
- **Root Cause:** Input does not match TRAI 10-digit standard starting with 6, 7, 8, or 9.
- **Fix:** Enter a 10-digit number. Leading country codes (`+91`, `91`, `0`) are automatically normalized.
- **Verification:** Unit test `Phase 3 - Phone Format` validates `+91[6-9]\d{9}`.

### Layer 2: TURNSTILE
- **Failure Symptom:** "Please complete the security challenge before requesting an OTP."
- **Root Cause:** Turnstile widget expired, network blocked `challenges.cloudflare.com`, or domain not configured in Cloudflare Turnstile dashboard.
- **Fix:** Ensure `home-e-fix.vercel.app` is added to permitted hostnames in Cloudflare Turnstile dashboard.
- **Verification:** Inspect browser console for Turnstile script load errors.

### Layer 3: CLOUDFLARE WORKER / EDGE GATEWAY
- **Failure Symptom:** HTTP 403 `{"error": "Security verification failed. Please try again.", "code": "TURNSTILE_FAILED"}` or HTTP 429 `{"error": "Too many OTP requests...", "code": "RATE_LIMITED"}`.
- **Root Cause:** Turnstile secret invalid, token replayed, or rate limits exceeded (60s cooldown or >5 requests/hour).
- **Fix:** Wait for cooldown to expire; verify `TURNSTILE_SECRET` is set in Worker Secrets.
- **Verification:** Send test request with fresh Turnstile token to `/api/auth/request-otp`.

### Layer 4: SUPABASE AUTH
- **Failure Symptom:** HTTP 500 / 502 with message `We couldn't send the OTP right now.`
- **Root Cause:** Supabase Phone Auth provider disabled or `SUPABASE_SERVICE_ROLE_KEY` invalid.
- **Fix:** Supabase Dashboard > Authentication > Providers > Phone > Enable Phone provider.
- **Verification:** Query Supabase Auth settings API or test via Supabase CLI.

### Layer 5: SEND SMS AUTH HOOK
- **Failure Symptom:** Supabase Hook returns HTTP 401 or 500.
- **Root Cause:** Webhook signature verification failed due to mismatched `SEND_SMS_HOOK_SECRET`.
- **Fix:** Verify the secret in Supabase Dashboard (Auth Hooks > Send SMS) matches `SEND_SMS_HOOK_SECRET` in Edge Function secrets.
- **Verification:** Check Supabase Edge Function logs for `[SEND SMS HOOK]` events.

### Layer 6: 2FACTOR ADAPTER
- **Failure Symptom:** Edge Function logs `[2FACTOR SMS ERROR] TWOFACTOR_API_KEY is not configured`.
- **Root Cause:** Missing `TWOFACTOR_API_KEY` secret in Supabase Edge Functions.
- **Fix:** Execute `supabase secrets set TWOFACTOR_API_KEY=... SMS_PROVIDER=2factor`.
- **Verification:** Check Edge Function logs for `[2FACTOR SMS DELIVERED]` with Session ID.

### Layer 7: 2FACTOR GATEWAY RESPONSE
- **Failure Symptom:** Edge Function logs `[2FACTOR SMS REJECTED] ... Reason: Invalid API Key / Insufficient Balance / Template Mismatch`.
- **Root Cause:** Account out of SMS credits or unapproved DLT template name.
- **Fix:** Check balance on [https://2factor.in/v3/dashboard/](https://2factor.in) and ensure `TWOFACTOR_TEMPLATE_ID` matches your DLT approved template.
- **Verification:** 2Factor returns `{"Status": "Success", "Details": "<session-uuid>"}`.

### Layer 8 & 9: INDIAN TELECOM CARRIER & DLT
- **Failure Symptom:** 2Factor reports success, but recipient handset receives no SMS after 30 seconds.
- **Root Cause:**
  1. Recipient is on strict NDNC / DND (Do Not Disturb) and transactional route was not used.
  2. Telecom carrier scrubber dropped SMS due to template variable mismatch.
  3. Recipient mobile is out of network coverage or in airplane mode.
- **Fix:** Ensure 2Factor transactional OTP route is selected in dashboard; test with a registered test phone.
- **Verification:** Check DLR (Delivery Receipt) status in 2Factor portal for the generated Session ID.

---

## 3. Quick Diagnostic Checklist

| Check | Expected Value | How to Inspect |
|---|---|---|
| Health Check | `ok: true`, `dependencies: { turnstile: "configured", supabase: "configured" }` | `GET https://home-e-fix.vercel.app/api/health` |
| Edge Function Hook | Responds HTTP 200 `{}` on valid Svix payload | Supabase Dashboard > Logs > Edge Functions |
| Turnstile Siteverify | `success: true` | Cloudflare Dashboard > Turnstile Analytics |
| 2Factor Account | Active credits > 0 | 2Factor.in Portal |
