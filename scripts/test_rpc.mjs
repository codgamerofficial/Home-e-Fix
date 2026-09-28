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
  // Test if rpc exec_sql exists
  const { data, error } = await supabase.rpc("exec_sql", { sql: "SELECT 1;" });
  console.log("exec_sql rpc:", error ? error.message : "Success");

  // Let's test auth.admin update user app_metadata
  // We can set role = 'super_admin' in app_metadata on the user!
  const user = await supabase.auth.admin.getUserById("f3e5b3dd-24d3-46e0-9793-f54a26f48bd2");
  console.log("Got user:", user.data.user?.email);
}

main().catch(console.error);
