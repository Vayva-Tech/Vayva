import fs from "node:fs";
import path from "node:path";

/**
 * Repairs bad renames like `{ _Users } from "lucide-react"` introduced by
 * the lint auto-fix, which breaks typechecking (module doesn't export _Users).
 *
 * Transforms:
 *   import { _Users, DollarSign as _DollarSign } from "lucide-react";
 *   export { _TravelConfig } from "./foo";
 *   export type { _PaymentMethod } from "../types";
 * into:
 *   import { Users as _Users, DollarSign as _DollarSign } from "lucide-react";
 *   export { TravelConfig as _TravelConfig } from "./foo";
 *   export type { PaymentMethod as _PaymentMethod } from "../types";
 */

const [, , rootDirArg] = process.argv;
const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

const exts = [".ts", ".tsx", ".js", ".jsx"];
const ignoreParts = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}.next${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}build${path.sep}`,
  `${path.sep}coverage${path.sep}`,
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
    else if (exts.includes(path.extname(p))) out.push(p);
  }
}

function repairNamedSpecifiersLine(line) {
  // Handle:
  // - import { ... } from "..."
  // - export { ... } from "..."
  // - export type { ... } from "..."
  const m = line.match(
    /^(\s*(?:import|export)(?:\s+type)?\s+\{)([^}]+)(\}\s+from\s+['"][^'"]+['"]\s*;?\s*)$/,
  );
  if (!m) return line;
  const head = m[1];
  const inner = m[2];
  const tail = m[3];

  const parts = inner
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => {
      // Already aliased
      if (/\bas\b/.test(p)) return p;
      // Namespace type-only patterns etc
      if (!p.startsWith("_")) return p;
      const name = p.slice(1);
      if (!name) return p;
      return `${name} as ${p}`;
    });

  return `${head} ${parts.join(", ")} ${tail}`;
}

function repairDefaultPlusNamedImport(line) {
  // Handle: import React, { _useEffect, useMemo } from "react";
  const m = line.match(
    /^(\s*import\s+[^,{]+,\s*\{)([^}]+)(\}\s+from\s+['"][^'"]+['"]\s*;?\s*)$/,
  );
  if (!m) return line;
  const head = m[1];
  const inner = m[2];
  const tail = m[3];

  const parts = inner
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .map((p) => {
      if (/\bas\b/.test(p)) return p;
      if (!p.startsWith("_")) return p;
      const name = p.slice(1);
      if (!name) return p;
      return `${name} as ${p}`;
    });

  return `${head} ${parts.join(", ")} ${tail}`;
}

function repairNamedSpecifiersBlock(src) {
  // Multiline import/export blocks:
  // import { A, _B, C } from "x";
  // export type { _T } from "./types";
  const re =
    /(^\s*(?:import|export)(?:\s+type)?\s+\{)([\s\S]*?)(\}\s+from\s+['"][^'"]+['"]\s*;?\s*$)/gm;

  return src.replace(re, (_full, head, inner, tail) => {
    const parts = inner
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((p) => {
        if (/\bas\b/.test(p)) return p;
        if (!p.startsWith("_")) return p;
        const name = p.slice(1);
        if (!name) return p;
        return `${name} as ${p}`;
      });

    const rebuilt = parts.join(",\n  ");
    // Keep indentation stable: if the original had newlines, format nicely.
    const hasNewlines = inner.includes("\n");
    if (hasNewlines) {
      return `${head}\n  ${rebuilt}\n${tail}`;
    }
    return `${head} ${parts.join(", ")} ${tail}`;
  });
}

let updated = 0;
const files = [];
walk(rootDir, files);

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes("import") && !src.includes("export")) continue;
  if (!src.includes("_")) continue;

  let next = src;
  // First: repair multiline blocks (covers single-line too).
  next = repairNamedSpecifiersBlock(next);
  // Second: repair any remaining single-line patterns (default+named).
  const lines = next.split(/\r?\n/);
  let changed = next !== src;
  for (let i = 0; i < lines.length; i++) {
    const before = lines[i];
    const after = repairDefaultPlusNamedImport(before);
    if (after !== before) {
      lines[i] = after;
      changed = true;
    }
  }
  next = lines.join("\n");

  if (changed) {
    fs.writeFileSync(file, next);
    updated++;
  }
}

console.log(`repair-underscored-imports: updated ${updated} files`);

