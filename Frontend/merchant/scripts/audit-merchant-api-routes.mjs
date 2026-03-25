#!/usr/bin/env node
// Validate Next.js App Router API route handlers under src/app/api/**/route.ts
// Reports:
// - route files with no HTTP method exports (GET/POST/PUT/PATCH/DELETE/OPTIONS/HEAD)
// - route files that appear to contain TODO / not implemented markers
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const apiDir = path.join(root, "src/app/api");

const METHOD_RE =
  /\bexport\s+(?:async\s+function|function|const)\s+(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b/g;
const METHOD_REEXPORT_RE =
  /\bexport\s*\{\s*[^}]*\b(GET|POST|PUT|PATCH|DELETE|OPTIONS|HEAD)\b[^}]*\}\s*(?:from\s+["'`][^"'`]+["'`])?\s*;?/g;
const TODO_RE =
  /\b(TODO|not implemented|NotImplemented)\b/i;

function isRouteFile(name) {
  return name === "route.ts" || name === "route.tsx" || name === "route.js";
}

function walk(dir) {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full));
    else if (ent.isFile() && isRouteFile(ent.name)) out.push(full);
  }
  return out;
}

function toApiPath(fullPath) {
  const rel = path.relative(path.join(root, "src/app"), fullPath);
  // rel like: api/foo/bar/route.ts -> /api/foo/bar
  const parts = rel.split(path.sep);
  if (parts[0] !== "api") return null;
  parts.pop();
  return "/" + parts.join("/");
}

function main() {
  if (!fs.existsSync(apiDir)) {
    console.error("No src/app/api directory found.");
    process.exit(2);
  }

  const files = walk(apiDir);
  const missingHandlers = [];
  const todoCandidates = [];

  for (const f of files) {
    const src = fs.readFileSync(f, "utf8");
    const methods = new Set();
    for (;;) {
      const m = METHOD_RE.exec(src);
      if (!m) break;
      methods.add(m[1]);
    }
    for (;;) {
      const m = METHOD_REEXPORT_RE.exec(src);
      if (!m) break;
      methods.add(m[1]);
    }
    const apiPath = toApiPath(f);
    if (!apiPath) continue;

    if (methods.size === 0) {
      missingHandlers.push({ apiPath, file: path.relative(root, f) });
    }
    if (TODO_RE.test(src)) {
      todoCandidates.push({ apiPath, file: path.relative(root, f) });
    }
  }

  const report = {
    summary: {
      routeFiles: files.length,
      missingHandlersCount: missingHandlers.length,
      todoCandidatesCount: todoCandidates.length,
    },
    missingHandlers: missingHandlers.sort((a, b) =>
      a.apiPath.localeCompare(b.apiPath),
    ),
    todoCandidates: todoCandidates.sort((a, b) =>
      a.apiPath.localeCompare(b.apiPath),
    ),
  };

  const out = path.join(root, "e2e/merchant-api-route-audit.json");
  fs.writeFileSync(out, JSON.stringify(report, null, 2));
  console.log(`Wrote API audit report to ${path.relative(root, out)}`);
  console.log(
    `Missing handlers: ${report.summary.missingHandlersCount}, TODO candidates: ${report.summary.todoCandidatesCount}`,
  );
}

main();

