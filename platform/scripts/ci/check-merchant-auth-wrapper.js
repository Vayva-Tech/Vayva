/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
// Legacy Next app under apps/merchant uses withVayvaAPI. Frontend/merchant is guarded by
// check-frontend-merchant-bff-auth.js (ratchet + baseline). This script stays apps/merchant-only.
const apiRoots = [path.join(ROOT, "apps/merchant/src/app/api")];

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

const routes = apiRoots.flatMap((root) => walk(root)).filter((f) => f.endsWith("route.ts"));

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
  f.includes("/api/team/invites/accept/") ||
  f.includes("/api/analytics/") ||
  f.includes("/api/fashion/");

const bad = [];
for (const f of routes) {
  if (allow(f)) continue;
  const txt = fs.readFileSync(f, "utf8");
  if (!txt.includes("withVayvaAPI(")) bad.push(path.relative(ROOT, f));
}

if (bad.length) {
  console.error("❌ apps/merchant API routes missing withVayvaAPI:");
  bad.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log("✅ check-merchant-auth-wrapper passed");
