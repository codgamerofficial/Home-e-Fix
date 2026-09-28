# HOME-E-FIX: Production Environment & Secrets Reference

**Production Domain:** https://home-e-fix.vercel.app/  
**Supabase Instance:** https://uzlarcvmhshwgtvtxcsh.supabase.co

---

## 1. Environment Variable Segregation Matrix

| Variable | Target Layer | Public / Secret | Description |
|---|---|---|---|
| `VITE_SUPABASE_URL` | Frontend (Vercel) | Public | Supabase project URL |
| `VITE_SUPABASE_ANON_KEY` | Frontend (Vercel) | Public | Supabase anonymous public client key |
| `VITE_TURNSTILE_SITE_KEY` | Frontend (Vercel) | Public | Cloudflare Turnstile public site key |
| `SUPABASE_URL` | Worker & Edge | Private | Backend Supabase API URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Worker & Edge | **CRITICAL SECRET** | Supabase admin key for server-to-server auth |
| `TURNSTILE_SECRET` | Worker & Edge | **CRITICAL SECRET** | Cloudflare Turnstile private key for siteverify |
| `SEND_SMS_HOOK_SECRET` | Supabase Hook | **CRITICAL SECRET** | Svix webhook signature secret (`whsec_...`) |
| `SMS_PROVIDER` | Supabase Hook | Server Var | Set to `2factor` in production |
| `TWOFACTOR_API_KEY` | Supabase Hook | **CRITICAL SECRET** | 2Factor.in API Key for Indian mobile dispatch |
| `TWOFACTOR_TEMPLATE_ID` | Supabase Hook | Server Var | Registered DLT template name |
| `TWOFACTOR_SENDER_ID` | Supabase Hook | Server Var | Registered 6-character DLT sender header |

---

## 2. Hard Security Invariants

1. **NO PRIVATE CREDENTIAL MAY START WITH `VITE_`:**
   - ❌ `VITE_SUPABASE_SERVICE_ROLE_KEY` (FORBIDDEN)
   - ❌ `VITE_TURNSTILE_SECRET` (FORBIDDEN)
   - ❌ `VITE_TWOFACTOR_API_KEY` (FORBIDDEN)
2. **NO LOCALHOST CALLS IN PRODUCTION:**
   - Production bundle must never call `http://localhost:*` or `http://127.0.0.1:*`.
3. **FAIL-SAFE GUARD:**
   - If `ENVIRONMENT=production` and `SMS_PROVIDER=development`, the system deliberately throws a fatal initialization error to prevent fake OTP dispatch in production.
