/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const apiRoot = path.join(ROOT, "apps/merchant-admin/src/app/api");

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

const routes = walk(apiRoot).filter((f) => f.endsWith("route.ts"));

const allow = (f) => 
  f.includes("/api/auth/") || 
  f.endsWith("/api/health/route.ts") || 
  f.includes("/api/public/") ||
  f.includes("/api/webhooks/") ||
  f.includes("/api/whatsapp/webhook") ||
  f.includes("/api/dev/") ||
  f.includes("/api/test/") ||
  f.includes("/api/jobs/cron/") ||
  f.includes("/api/storefront/") ||
  f.endsWith("/api/status/route.ts") ||
  f.includes("/api/team/invites/accept/");

const bad = [];
for (const f of routes) {
  if (allow(f)) continue;
  const txt = fs.readFileSync(f, "utf8");
  if (!txt.includes("withVayvaAPI(")) bad.push(path.relative(ROOT, f));
}

if (bad.length) {
  console.error("❌ Merchant API routes missing withVayvaAPI:");
  bad.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log("✅ check-merchant-auth-wrapper passed");
