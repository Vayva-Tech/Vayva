import fs from "node:fs";
import path from "node:path";

/**
 * Replace console.(log|info|debug) with console.warn in JS/TS sources.
 *
 * Usage:
 *   node scripts/codemods/replace-console-log-with-warn.mjs <dir...>
 */

const dirs = process.argv.slice(2);
if (dirs.length === 0) {
  console.error("Provide one or more directories.");
  process.exit(2);
}

const exts = new Set([".js", ".jsx", ".ts", ".tsx", ".mjs", ".cjs"]);
const ignoreParts = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}.turbo${path.sep}`,
];

function shouldIgnore(p) {
  return ignoreParts.some((part) => p.includes(part));
}

function walk(dir, out) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (shouldIgnore(p)) continue;
    if (e.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
}

const files = [];
for (const d of dirs) walk(path.resolve(d), files);

let changed = 0;
for (const f of files) {
  const src = fs.readFileSync(f, "utf8");
  if (!src.includes("console.")) continue;
  const next = src
    .replace(/\bconsole\.log\b/g, "console.warn")
    .replace(/\bconsole\.info\b/g, "console.warn")
    .replace(/\bconsole\.debug\b/g, "console.warn");
  if (next !== src) {
    fs.writeFileSync(f, next);
    changed++;
  }
}

console.log(`replace-console-log-with-warn: updated ${changed} files`);

