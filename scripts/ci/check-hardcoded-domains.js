/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();

function walk(dir) {
  const out = [];
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name === ".next" || entry.name === "dist" || entry.name === ".turbo") continue;
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(p));
    else out.push(p);
  }
  return out;
}

function scanFiles(baseDir, checks) {
  const fullPath = path.join(ROOT, baseDir);
  if (!fs.existsSync(fullPath)) return [];
  
  const files = walk(fullPath)
    .filter((f) => /\.(ts|tsx|js|jsx|json)$/.test(f))
    .filter((f) => !f.endsWith(".test.ts") && !f.endsWith(".test.tsx") && !f.endsWith(".spec.ts") && !f.endsWith(".spec.tsx"));

  const violations = [];

  for (const file of files) {
    const txt = fs.readFileSync(file, "utf8");
    for (const c of checks) {
      if (c.test(txt) && !c.allow?.(txt)) {
        violations.push({ file: path.relative(ROOT, file), rule: c.name });
      }
    }
  }
  return violations;
}

const merchantViolations = scanFiles("apps/merchant-admin", [
  {
    name: "merchant-hardcodes-marketing",
    test: (t) => t.includes("https://vayva.ng/"),
    allow: (t) =>
      // allow only email logo/assets
      t.includes("https://vayva.ng/logos/") || t.includes("https://vayva.ng/assets/"),
  },
]);

const storefrontViolations = scanFiles("apps/storefront", [
  { name: "storefront-hardcodes-marketing-order", test: (t) => t.includes("https://vayva.ng/order") },
  { name: "storefront-uses-merchant-domain", test: (t) => t.includes("merchant.vayva.ng") },
]);

const opsViolations = scanFiles("apps/ops-console", [
  {
    name: "ops-hardcodes-marketing",
    test: (t) => t.includes("https://vayva.ng/"),
    allow: (t) =>
      t.includes("https://vayva.ng/logos/") || t.includes("https://vayva.ng/assets/"),
  },
]);

const all = [...merchantViolations, ...storefrontViolations, ...opsViolations];

if (all.length) {
  console.error("❌ Hardcoded domain violations found:");
  for (const v of all) console.error(`- ${v.rule}: ${v.file}`);
  process.exit(1);
} else {
  console.log("✅ check-hardcoded-domains passed");
}
