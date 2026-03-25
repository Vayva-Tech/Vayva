/* eslint-disable no-console */
/**
 * Ratchet guard for Frontend/merchant BFF API routes.
 *
 * Non-allowlisted route.ts files must use one of the standard server auth entry points.
 * Known gaps are listed in data/frontend-merchant-bff-auth-baseline.txt; CI fails if NEW
 * violations appear (paths not in baseline). Remove paths from the baseline when fixed.
 */
const fs = require("fs");
const path = require("path");

const ROOT = process.cwd();
const API_ROOT = path.join(ROOT, "Frontend/merchant/src/app/api");
const BASELINE_REL = path.join(
  "platform",
  "scripts",
  "ci",
  "data",
  "frontend-merchant-bff-auth-baseline.txt",
);
const BASELINE_ABS = path.join(ROOT, BASELINE_REL);

const AUTH_RE =
  /requireAuthFromRequest|buildBackendAuthHeaders|withVayvaAPI\s*\(|withTenantIsolation\s*\(|requireAuth\s*\(|getServerSession\s*\(/;

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

function normalizeRel(p) {
  return p.split(path.sep).join("/");
}

function allowlisted(absFile) {
  const rel = normalizeRel(path.relative(ROOT, absFile));
  return (
    rel.includes("/api/billing/template-switch/verify/") ||
    rel.includes("/api/public/") ||
    rel.includes("/api/webhooks/") ||
    rel.includes("/api/auth/") ||
    rel.includes("/api/health/") ||
    rel.includes("/api/dev/") ||
    rel.includes("/api/test/") ||
    rel.includes("/api/jobs/cron/") ||
    rel.includes("/api/storefront/") ||
    rel.includes("/api/team/invites/accept/") ||
    rel.includes("/api/analytics/") ||
    rel.includes("/api/fashion/") ||
    rel.includes("/api/whatsapp/webhook") ||
    rel.includes("/api/integrations/quickbooks/oauth/") ||
    rel.includes("/api/integrations/xero/oauth/")
  );
}

function computeViolations() {
  const routes = walk(API_ROOT).filter((f) => f.endsWith("route.ts"));
  const violations = [];
  for (const f of routes) {
    if (allowlisted(f)) continue;
    const txt = fs.readFileSync(f, "utf8");
    if (AUTH_RE.test(txt)) continue;
    violations.push(normalizeRel(path.relative(ROOT, f)));
  }
  return violations.sort();
}

function main() {
  const writeBaseline = process.argv.includes("--write-baseline");
  const violations = computeViolations();

  if (writeBaseline) {
    fs.mkdirSync(path.dirname(BASELINE_ABS), { recursive: true });
    fs.writeFileSync(BASELINE_ABS, violations.join("\n") + (violations.length ? "\n" : ""), "utf8");
    console.log(`✅ Wrote ${violations.length} baseline entries to ${BASELINE_REL}`);
    return;
  }

  if (!fs.existsSync(BASELINE_ABS)) {
    console.error(`❌ Missing baseline ${BASELINE_REL}. Run:`);
    console.error(`   node platform/scripts/ci/check-frontend-merchant-bff-auth.js --write-baseline`);
    process.exit(1);
  }

  const baselineRaw = fs.readFileSync(BASELINE_ABS, "utf8");
  const baseline = new Set(
    baselineRaw
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean),
  );
  const current = new Set(violations);

  const newViolations = violations.filter((v) => !baseline.has(v));
  if (newViolations.length) {
    console.error(
      "❌ Frontend/merchant BFF routes missing standard auth (requireAuthFromRequest, buildBackendAuthHeaders, withVayvaAPI, withTenantIsolation, requireAuth, getServerSession):",
    );
    for (const v of newViolations) console.error(`- ${v}`);
    console.error(
      "\nFix the route or add a deliberate allowlist entry in check-frontend-merchant-bff-auth.js. Do not expand the baseline for new code.",
    );
    process.exit(1);
  }

  const stale = [...baseline].filter((b) => !current.has(b));
  if (stale.length) {
    console.warn("⚠️  Baseline contains paths that no longer violate (remove from baseline to silence):");
    for (const s of stale.sort()) console.warn(`- ${s}`);
  }

  const gapNote =
    violations.length === 0
      ? "no baseline gaps"
      : `${violations.length} known baseline gaps`;
  console.log(`✅ check-frontend-merchant-bff-auth passed (${gapNote})`);
}

main();
