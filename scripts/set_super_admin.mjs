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

const supabase = createClient(env.SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
  const userId = "f3e5b3dd-24d3-46e0-9793-f54a26f48bd2";
  console.log(`Setting role = super_admin on user ${userId} (deysaswata200@gmail.com)...`);
  
  const { data, error } = await supabase.auth.admin.updateUserById(userId, {
    app_metadata: { role: "super_admin", roles: ["super_admin", "admin"] },
    user_metadata: { role: "super_admin" }
  });

  if (error) {
    console.error("Error updating user:", error);
  } else {
    console.log("Success! Updated user auth record:");
    console.log("App metadata:", data.user.app_metadata);
    console.log("User metadata:", data.user.user_metadata);
  }
}

main().catch(console.error);
