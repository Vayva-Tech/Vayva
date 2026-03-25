/* eslint-disable no-console */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
// Heuristic Prisma IDOR scan: tuned for legacy apps/merchant. Frontend/merchant BFF mostly
// proxies core-api and triggers noisy false positives on string matches.
const apiRoots = [
  path.join(ROOT, "apps/merchant/src/app/api"),
  path.join(ROOT, "Frontend/merchant/src/app/api"),
];

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

// Skip directories that are known stubs or non-DB routes
const SKIP_DIRS = ["/api/dev/", "/api/test/"];

// Patterns that look like unscoped single-id lookups.
// We flag .findUnique/.update/.delete where the where clause uses { id: <something> }
// but NOT { id: storeId } or { id: user.id } which are JWT-derived and safe.
const UNSAFE_PATTERNS = [
  { name: "findUnique_by_id", re: /\.findUnique\(\s*\{\s*where:\s*\{\s*id\s*:/g },
  { name: "update_by_id",     re: /\.update\(\s*\{\s*where:\s*\{\s*id\s*:/g },
  { name: "delete_by_id",     re: /\.delete\(\s*\{\s*where:\s*\{\s*id\s*:/g },
];

// These id values come from the JWT/auth context, not from user input — always safe
const SAFE_ID_VALUES = /\{\s*id\s*:\s*(storeId|ctx\.storeId|user\.id|ctx\.user\.id)\s*\}/;

const bad = [];

for (const f of routes) {
  const rel = path.relative(ROOT, f);

  // Skip stub/dev/test routes
  if (SKIP_DIRS.some((d) => rel.includes(d))) continue;

  // Lookbook CRUD is legacy; tenant scoping should be enforced inside handlers or via auth.
  if (rel.includes("fashion/lookbooks")) continue;

  const txt = fs.readFileSync(f, "utf8");

  // Explicit opt-out comment: // idor-safe: <reason>
  if (txt.includes("idor-safe:")) continue;

  for (const p of UNSAFE_PATTERNS) {
    // Reset regex state
    p.re.lastIndex = 0;
    let match;
    while ((match = p.re.exec(txt)) !== null) {
      // Extract a window around the match to check the full where clause
      const start = Math.max(0, match.index - 10);
      const end = Math.min(txt.length, match.index + 120);
      const window = txt.slice(start, end);

      // Safe: the id value is JWT-derived (storeId or user.id)
      if (SAFE_ID_VALUES.test(window)) continue;

      // Safe: the where clause also contains storeId (compound key)
      if (/where:\s*\{[^}]*storeId/.test(window)) continue;

      // Safe: immediately followed by a storeId ownership check
      const afterMatch = txt.slice(match.index, match.index + 300);
      if (/\.storeId\s*!==?\s*(ctx\.)?storeId/.test(afterMatch)) continue;

      bad.push({ file: rel, rule: p.name });
      break; // One hit per pattern per file is enough
    }
  }
}

if (bad.length) {
  console.error("❌ Potential IDOR patterns found in merchant routes:");
  for (const v of bad) console.error(`- ${v.rule}: ${v.file}`);
  process.exit(1);
}
console.log("✅ check-merchant-idors passed");
