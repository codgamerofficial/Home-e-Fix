import { createClient } from "@supabase/supabase-js";
import fs from "fs";

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

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const testTables = [
    "profiles", "users", "customers", "professionals", "bookings", "services", 
    "service_categories", "customer_profiles", "professional_profiles"
  ];
  for (const t of testTables) {
    const { data, error } = await supabase.from(t).select("*").limit(1);
    console.log(`Table '${t}':`, error ? error.message : `Exists (${data.length} rows sample)`);
  }
}

main().catch(console.error);
