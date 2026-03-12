/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const apiRoot = path.join(ROOT, "apps/ops-console/src/app/api");

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

const bad = [];

for (const f of routes) {
  const txt = fs.readFileSync(f, "utf8");

  const isMutation = txt.includes("export const POST") || txt.includes("export const PATCH") || txt.includes("export const DELETE");
  if (!isMutation) continue;

  // allowlist auth routes
  if (f.includes("/api/auth/")) continue;

  if (!txt.includes("auditLog(")) bad.push(path.relative(ROOT, f));
}

if (bad.length) {
  console.error("❌ Ops mutation routes missing auditLog:");
  bad.forEach((f) => console.error(`- ${f}`));
  process.exit(1);
}
console.log("✅ check-ops-auditlog passed");
