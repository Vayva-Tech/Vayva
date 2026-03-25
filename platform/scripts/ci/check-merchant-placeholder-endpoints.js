/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const apiRoot = path.join(ROOT, "Frontend/merchant/src/app/api");

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
const offenders = [];

for (const file of routes) {
  const txt = fs.readFileSync(file, "utf8");
  if (txt.includes("/api/endpoint")) offenders.push(path.relative(ROOT, file));
}

if (offenders.length > 0) {
  console.error("❌ Placeholder backend endpoint found:");
  offenders.forEach((file) => console.error(`- ${file}`));
  process.exit(1);
}

console.log("✅ check-merchant-placeholder-endpoints passed");
