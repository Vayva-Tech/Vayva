#!/usr/bin/env node
/**
 * One-shot codemod: add buildBackendAuthHeaders + session storeId to BFF routes that
 * only trusted client x-store-id. Skips files that already use standard auth helpers.
 *
 * Usage: node platform/scripts/ci/migrate-bff-buildBackendAuthHeaders.mjs [--dry-run]
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const BASELINE = path.join(ROOT, "platform/scripts/ci/data/frontend-merchant-bff-auth-baseline.txt");

const AUTH_RE =
  /requireAuthFromRequest|buildBackendAuthHeaders|withVayvaAPI\s*\(|withTenantIsolation\s*\(|requireAuth\s*\(/;

const IMPORT_LINE = `import { buildBackendAuthHeaders } from "@/lib/backend-proxy";`;

const TRY_STORE_HEADER = /(\n  try {\n)\s*const storeId = request\.headers\.get\("x-store-id"\) \|\| "";\n/g;

const AUTH_BLOCK = `$1    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
`;

function addImport(src) {
  if (src.includes("buildBackendAuthHeaders")) return src;
  if (!src.includes(IMPORT_LINE)) {
    const nextImport = src.indexOf('from "next/server"');
    if (nextImport === -1) return src;
    const lineEnd = src.indexOf("\n", nextImport);
    return src.slice(0, lineEnd + 1) + IMPORT_LINE + "\n" + src.slice(lineEnd + 1);
  }
  return src;
}

/** POST/PUT/PATCH try { without store header — insert auth after first line of try if apiJson has empty/minimal headers */
function hasAuthCall(src) {
  return /await\s+buildBackendAuthHeaders\s*\(\s*request\s*\)/.test(src) ||
    /await\s+requireAuthFromRequest\s*\(/.test(src) ||
    /withVayvaAPI\s*\(/.test(src) ||
    /withTenantIsolation\s*\(/.test(src) ||
    /await\s+requireAuth\s*\(/.test(src) ||
    /getServerSession\s*\(/.test(src);
}

function injectAuthAfterTryOpen(src) {
  if (hasAuthCall(src)) return src;
  let out = src;
  // Pattern: "export async function POST(request: NextRequest) {\n  try {\n" -> add auth
  out = out.replace(
    /(export async function (?:GET|POST|PUT|PATCH|DELETE)\(request: NextRequest\) \{\n  try \{\n)(?!\s*const auth = await buildBackendAuthHeaders)/g,
    (m, p1) =>
      `${p1}    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
`,
  );
  return out;
}

function replaceHeadersWithAuth(src) {
  let out = src;
  // Common: headers: { "x-store-id": storeId }  -> auth.headers (only safe after AUTH_BLOCK applied)
  out = out.replace(
    /headers:\s*\{\s*\n\s*"x-store-id":\s*storeId,\s*\n\s*\}/g,
    "headers: auth.headers",
  );
  out = out.replace(
    /headers:\s*\{\s*"x-store-id":\s*storeId\s*\}/g,
    "headers: auth.headers",
  );
  // POST with both content-type and x-store-id
  out = out.replace(
    /headers:\s*\{\s*"Content-Type":\s*"application\/json",\s*"x-store-id":\s*storeId\s*\}/g,
    "headers: { ...auth.headers }",
  );
  out = out.replace(
    /headers:\s*\{\s*\n\s*"Content-Type":\s*"application\/json",\s*\n\s*"x-store-id":\s*storeId,\s*\n\s*\}/g,
    "headers: { ...auth.headers }",
  );
  return out;
}

function processFile(absPath, dryRun) {
  let src = fs.readFileSync(absPath, "utf8");
  if (AUTH_RE.test(src)) return { changed: false, reason: "already has auth helper" };

  const original = src;
  src = addImport(src);

  TRY_STORE_HEADER.lastIndex = 0;
  if (TRY_STORE_HEADER.test(src)) {
    TRY_STORE_HEADER.lastIndex = 0;
    src = src.replace(TRY_STORE_HEADER, AUTH_BLOCK);
    src = replaceHeadersWithAuth(src);
  } else {
    src = injectAuthAfterTryOpen(src);
    // Merge JSON posts that only had Content-Type
    src = src.replace(
      /headers:\s*\{\s*\n\s*"Content-Type":\s*"application\/json",\s*\n\s*\}/g,
      "headers: { ...auth.headers }",
    );
    src = src.replace(
      /headers:\s*\{\s*"Content-Type":\s*"application\/json"\s*\}/g,
      "headers: { ...auth.headers }",
    );
    src = src.replace(/headers:\s*\{\s*\}/g, "headers: auth.headers");
  }

  if (src === original) return { changed: false, reason: "no matching pattern" };
  if (!src.includes("buildBackendAuthHeaders")) return { changed: false, reason: "import failed" };

  if (!dryRun) fs.writeFileSync(absPath, src, "utf8");
  return { changed: true };
}

function main() {
  const dryRun = process.argv.includes("--dry-run");
  const rels = fs
    .readFileSync(BASELINE, "utf8")
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);

  let n = 0;
  let skip = 0;
  for (const rel of rels) {
    const abs = path.join(ROOT, rel);
    if (!fs.existsSync(abs)) {
      console.warn("missing:", rel);
      continue;
    }
    const r = processFile(abs, dryRun);
    if (r.changed) {
      n++;
      if (dryRun) console.log("would change:", rel);
    } else skip++;
  }
  console.log(dryRun ? `[dry-run] would patch ${n} files, skip ${skip}` : `patched ${n} files, skip ${skip}`);
}

main();
