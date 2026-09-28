/**
 * Safe Admin Bootstrap Script for Home-e-Fix
 * Runs strictly server-side using SUPABASE_SERVICE_ROLE_KEY.
 * Never bundles or exposes service-role keys to browser bundles.
 */

import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

// Load .env manually if not already present in process.env
const envPath = path.resolve(rootDir, ".env");
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, "utf-8");
  for (const line of content.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, "");
      if (!process.env[key]) {
        process.env[key] = val;
      }
    }
  }
}

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bootstrapUserId =
  process.env.ADMIN_BOOTSTRAP_USER_ID ||
  process.env.VITE_ADMIN_BOOTSTRAP_USER_ID ||
  "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";

if (!supabaseUrl) {
  console.error("❌ ERROR: VITE_SUPABASE_URL or SUPABASE_URL not found in .env");
  process.exit(1);
}

if (!serviceRoleKey) {
  console.error("❌ ERROR: SUPABASE_SERVICE_ROLE_KEY not found in .env");
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function bootstrapAdmin() {
  console.log("=================================================");
  console.log("🛡️  HOME-E-FIX: SECURE ADMIN BOOTSTRAP INITIATED");
  console.log("=================================================");
  console.log(`Target User ID: ${bootstrapUserId}`);

  // 1. Fetch user from Supabase Auth
  const { data: userData, error: getUserError } = await supabaseAdmin.auth.admin.getUserById(bootstrapUserId);

  if (getUserError || !userData?.user) {
    console.error("❌ Failed to find target user by UUID:", getUserError?.message || "User not found");
    console.log("Listing existing users in auth.users:");
    const { data: userList } = await supabaseAdmin.auth.admin.listUsers();
    (userList?.users || []).forEach((u) => {
      console.log(` - ${u.id} | ${u.email} | current role: ${u.app_metadata?.role || u.user_metadata?.role || "none"}`);
    });
    process.exit(1);
  }

  const user = userData.user;
  console.log(`Found account: ${user.email}`);

  // 2. Authoritatively set super_admin in app_metadata and user_metadata
  const existingAppMeta = user.app_metadata || {};
  const existingUserMeta = user.user_metadata || {};

  const { data: updatedUser, error: updateError } = await supabaseAdmin.auth.admin.updateUserById(bootstrapUserId, {
    app_metadata: {
      ...existingAppMeta,
      role: "super_admin",
      roles: ["super_admin", "admin"],
      platform_admin: true,
      bootstrapped_at: new Date().toISOString(),
    },
    user_metadata: {
      ...existingUserMeta,
      role: "super_admin",
    },
  });

  if (updateError) {
    console.error("❌ Failed to assign super_admin role:", updateError.message);
    process.exit(1);
  }

  // 3. Attempt to update public.profiles if table exists
  try {
    const { error: profileError } = await supabaseAdmin
      .from("profiles")
      .upsert({
        id: bootstrapUserId,
        role: "SUPER_ADMIN",
        email: user.email,
        is_active: true,
        updated_at: new Date().toISOString(),
      });
    if (profileError) {
      console.log("ℹ️  public.profiles table notice:", profileError.message);
    } else {
      console.log("✅ public.profiles updated successfully.");
    }
  } catch (err) {
    console.log("ℹ️  Database table sync notice:", err.message);
  }

  console.log("=================================================");
  console.log("✅ SUCCESS: USER SUCCESSFULLY PROVISIONED AS SUPER_ADMIN");
  console.log(`Email: ${user.email}`);
  console.log(`UUID:  ${bootstrapUserId}`);
  console.log(`Role:  super_admin`);
  console.log("=================================================");
}

bootstrapAdmin().catch((err) => {
  console.error("Unexpected bootstrap failure:", err);
  process.exit(1);
});
