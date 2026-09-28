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

async function testEndpoints() {
  const endpoints = [
    `${env.SUPABASE_URL}/database/query`,
    `${env.SUPABASE_URL}/pg/query`,
    `${env.SUPABASE_URL}/rest/v1/rpc/exec`,
  ];
  for (const ep of endpoints) {
    try {
      const res = await fetch(ep, {
        method: "POST",
        headers: {
          "apikey": env.SUPABASE_SERVICE_ROLE_KEY,
          "Authorization": `Bearer ${env.SUPABASE_SERVICE_ROLE_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ query: "SELECT 1;" })
      });
      console.log(ep, res.status, await res.text());
    } catch (e) {
      console.log(ep, "Error:", e.message);
    }
  }
}

testEndpoints().catch(console.error);
