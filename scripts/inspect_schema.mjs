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
  // Let's check what schemas or tables PostgREST exposes
  const res = await fetch(`${env.SUPABASE_URL}/rest/v1/?apikey=${env.SUPABASE_SERVICE_ROLE_KEY}`);
  const spec = await res.json();
  console.log("OpenAPI definitions:", Object.keys(spec.definitions || {}));
  console.log("OpenAPI paths:", Object.keys(spec.paths || {}));
}

main().catch(console.error);
