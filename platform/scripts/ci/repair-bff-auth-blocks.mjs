#!/usr/bin/env node
/**
 * Insert missing `const auth = await buildBackendAuthHeaders(request)` after `try {`
 * when the file references auth.headers / ...auth.headers but inject was skipped
 * because the import line matched AUTH_RE.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, "../../..");
const API = path.join(ROOT, "Frontend/merchant/src/app/api");

const BLOCK = `    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
`;

const NEEDS_AUTH_USE = /\.\.\.auth\.headers|headers:\s*auth\.headers/;

function walk(dir) {
  const out = [];
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...walk(p));
    else if (e.name === "route.ts") out.push(p);
  }
  return out;
}

function repair(src) {
  if (!NEEDS_AUTH_USE.test(src)) return src;
  if (!src.includes("buildBackendAuthHeaders")) return src;

  let out = src;
  // Handlers using `request: NextRequest` — add auth right after `try {` if missing
  const re =
    /(export async function (?:GET|POST|PUT|PATCH|DELETE)\(request: NextRequest\) \{\n  try \{\n)(?!    const auth = await buildBackendAuthHeaders)/g;
  out = out.replace(re, `$1${BLOCK}`);
  return out;
}

let n = 0;
for (const abs of walk(API)) {
  const before = fs.readFileSync(abs, "utf8");
  const after = repair(before);
  if (after !== before) {
    fs.writeFileSync(abs, after, "utf8");
    n++;
    console.log("repaired:", path.relative(ROOT, abs));
  }
}
console.log(`done, ${n} files`);
