import { createClient } from "@supabase/supabase-js";
import fs from "fs";

// Read .env manually
const envContent = fs.readFileSync(".env", "utf8");
const env = {};
for (const line of envContent.split("\n")) {
  const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
  if (match) {
    let val = match[2] || "";
    if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
    if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
    env[match[1]] = val;
  }
}

const supabaseUrl = env.SUPABASE_URL || env.VITE_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log("Supabase URL:", supabaseUrl);
console.log("Service Key exists:", !!serviceKey);

const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  console.log("--- Querying auth.users ---");
  const { data: users, error: usersErr } = await supabase.auth.admin.listUsers();
  if (usersErr) {
    console.error("Error listing users:", usersErr);
  } else {
    console.log(`Found ${users.users.length} users:`);
    for (const u of users.users) {
      console.log(`- ID: ${u.id} | Email: ${u.email} | Phone: ${u.phone} | Created: ${u.created_at}`);
      console.log(`  Raw user metadata:`, u.user_metadata);
      console.log(`  App metadata:`, u.app_metadata);
    }
  }

  console.log("\n--- Querying public.profiles ---");
  const { data: profiles, error: profErr } = await supabase.from("profiles").select("*");
  if (profErr) {
    console.error("Error listing profiles:", profErr);
  } else {
    console.log(`Found ${profiles.length} profiles:`);
    for (const p of profiles) {
      console.log(`- ID: ${p.id} | Role: ${p.role} | Name: ${p.full_name} | Email: ${p.email}`);
    }
  }
}

main().catch(console.error);
