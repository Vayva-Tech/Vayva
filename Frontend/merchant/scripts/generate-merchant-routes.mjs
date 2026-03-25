#!/usr/bin/env node
/**
 * Regenerate e2e/merchant-routes.json from every App Router page.tsx file.
 * Dynamic segments become numeric placeholders (e.g. [id] -> 1).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const appDir = path.join(root, "src/app");
const outPath = path.join(root, "e2e/merchant-routes.json");

function isRouteGroup(s) {
  return s.startsWith("(") && s.endsWith(")");
}

function fileToRouteSegments(rel) {
  const parts = rel.split(path.sep).filter(Boolean);
  if (parts[parts.length - 1] !== "page.tsx") return null;
  parts.pop();
  const segs = [];
  for (const p of parts) {
    if (isRouteGroup(p)) continue;
    segs.push(p);
  }
  return segs;
}

function walk(dir, base = "") {
  const out = [];
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, ent.name);
    const full = path.join(dir, ent.name);
    if (ent.isDirectory()) out.push(...walk(full, rel));
    else if (ent.name === "page.tsx") out.push(rel);
  }
  return out;
}

function toUrlPath(segs) {
  if (!segs.length) return "/";
  return (
    "/" +
    segs
      .map((s) => {
        if (s.startsWith("[") && s.endsWith("]")) {
          const inner = s.slice(1, -1);
          if (inner.startsWith("...")) return "placeholder";
          return "1";
        }
        return s;
      })
      .join("/")
  );
}

const files = walk(appDir);
const routes = [
  ...new Set(
    files
      .map((f) => {
        const segs = fileToRouteSegments(f);
        return segs ? toUrlPath(segs) : null;
      })
      .filter(Boolean),
  ),
].sort();

fs.writeFileSync(
  outPath,
  JSON.stringify(
    { generatedAt: new Date().toISOString(), count: routes.length, routes },
    null,
    2,
  ),
);
console.log(`Wrote ${routes.length} routes to ${path.relative(root, outPath)}`);
