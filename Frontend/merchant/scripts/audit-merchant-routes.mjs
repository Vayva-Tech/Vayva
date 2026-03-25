#!/usr/bin/env node
/**
 * Merchant route validation:
 * - Reads generated e2e/merchant-routes.json (filesystem truth for App Router pages)
 * - Extracts all "/..." route strings from:
 *   - src/lib/industry/allowed-routes.ts (universal + module defaults)
 *   - src/config/industry.ts (industry moduleRoutes overrides)
 * - Reports:
 *   - expected routes missing from pages
 *   - pages that are not referenced by config (potentially orphan/internal)
 *
 * Note: This is intentionally string-based to avoid TS/alias runtime resolution.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
 
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
 
const generatedPath = path.join(root, "e2e/merchant-routes.json");
const allowedRoutesPath = path.join(root, "src/lib/industry/allowed-routes.ts");
const industryConfigPath = path.join(root, "src/config/industry.ts");
 
function readJson(p) {
  return JSON.parse(fs.readFileSync(p, "utf8"));
}
 
function readText(p) {
  return fs.readFileSync(p, "utf8");
}
 
function extractRouteStrings(tsSource) {
  // Extract string literals that look like routes: "/..." or "/.../..."
  // We keep them as-is and normalize by removing trailing slash (except root).
  const re = /["'`](\/[^"'`]*?)["'`]/g;
  const out = new Set();
  for (;;) {
    const m = re.exec(tsSource);
    if (!m) break;
    const s = m[1];
    if (!s.startsWith("/")) continue;
    out.add(normalizeRoute(s));
  }
  return out;
}
 
function normalizeRoute(r) {
  if (r === "/") return "/";
  return r.replace(/\/+$/, "");
}
 
function isDynamicPageRoute(route) {
  // The generated routes replace [id] with "1" and catchalls with "placeholder".
  return route.includes("/1") || route.includes("/placeholder");
}
 
function toPrefixes(routes) {
  // For expected route prefixes, include both the exact route and its parent prefixes.
  // Example: /dashboard/finance/payouts -> /dashboard/finance/payouts, /dashboard/finance, /dashboard
  const prefixes = new Set();
  for (const r of routes) {
    const norm = normalizeRoute(r);
    if (!norm.startsWith("/")) continue;
    const parts = norm.split("/").filter(Boolean);
    if (parts.length === 0) {
      prefixes.add("/");
      continue;
    }
    let cur = "";
    for (const p of parts) {
      cur += "/" + p;
      prefixes.add(cur);
    }
  }
  return prefixes;
}
 
function setDiff(a, b) {
  const out = [];
  for (const v of a) if (!b.has(v)) out.push(v);
  return out.sort();
}
 
function main() {
  if (!fs.existsSync(generatedPath)) {
    console.error(
      `Missing ${path.relative(root, generatedPath)}. Run: npm run generate:merchant-routes`,
    );
    process.exit(2);
  }
 
  const generated = readJson(generatedPath);
  const pageRoutes = new Set((generated.routes || []).map(normalizeRoute));
 
  const allowedText = readText(allowedRoutesPath);
  const industryText = readText(industryConfigPath);
 
  const allowedStrings = extractRouteStrings(allowedText);
  const industryStrings = extractRouteStrings(industryText);
 
  // Consider these "expected" navigable routes:
  // - Anything explicitly enumerated in allowed-routes.ts UNIVERSAL_ROUTES / MODULE_DEFAULT_ROUTES
  // - Anything in industry.ts moduleRoutes overrides
  const expected = new Set([...allowedStrings, ...industryStrings]);
 
  // Remove obviously non-page "routes" that can appear in config (e.g. external links)
  // Keep only dashboard/app paths.
  const expectedFiltered = new Set(
    [...expected].filter((r) => r.startsWith("/dashboard") || r.startsWith("/beta")),
  );
 
  const expectedPrefixes = toPrefixes(expectedFiltered);
 
  // Missing: expected prefixes that have no corresponding page route prefix.
  // We treat a route as "present" if:
  // - there is an exact page route
  // - OR there exists any page route under that prefix.
  const missingExpected = [];
  for (const exp of expectedFiltered) {
    const expNorm = normalizeRoute(exp);
    const hasExact = pageRoutes.has(expNorm);
    const hasChild = [...pageRoutes].some(
      (p) => p === expNorm || p.startsWith(expNorm + "/"),
    );
    if (!hasExact && !hasChild) missingExpected.push(expNorm);
  }
 
  // Orphans: pages under /dashboard that aren't included in expected prefixes.
  const orphanPages = [];
  for (const p of pageRoutes) {
    if (!p.startsWith("/dashboard") && !p.startsWith("/beta")) continue;
    // ignore dynamic pages for orphan checks (they often aren't in configs explicitly)
    if (isDynamicPageRoute(p)) continue;
    if (!expectedPrefixes.has(p)) orphanPages.push(p);
  }
 
  const summary = {
    generatedAt: generated.generatedAt,
    pageCount: pageRoutes.size,
    expectedCount: expectedFiltered.size,
    missingExpectedCount: missingExpected.length,
    orphanPagesCount: orphanPages.length,
  };
 
  const report = {
    summary,
    missingExpected: missingExpected.sort(),
    orphanPages: orphanPages.sort(),
    notes: [
      "missingExpected lists config-referenced routes that appear to have no matching App Router page.",
      "orphanPages lists App Router pages under /dashboard or /beta not referenced by allowed-routes.ts or industry.ts (may be internal or dead).",
      "Dynamic pages (routes containing /1 or /placeholder) are excluded from orphan detection.",
    ],
  };
 
  const out = path.join(root, "e2e/merchant-route-audit.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`Wrote audit report to ${path.relative(root, out)}`);
  console.log(
    `Missing expected: ${summary.missingExpectedCount}, orphan pages: ${summary.orphanPagesCount}`,
  );
}
 
main();

