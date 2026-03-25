import fs from "node:fs";
import path from "node:path";

/**
 * Codemod: Fix TS1484 under verbatimModuleSyntax by converting certain imports
 * to type-only imports.
 *
 * This is intentionally conservative: it only rewrites specific identifiers.
 *
 * Usage:
 *   node scripts/codemods/fix-verbatim-type-imports.mjs <rootDir>
 */

const [, , rootDirArg] = process.argv;
const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

const exts = [".ts", ".tsx"];
const ignoreParts = [
  `${path.sep}node_modules${path.sep}`,
  `${path.sep}dist${path.sep}`,
  `${path.sep}build${path.sep}`,
  `${path.sep}.next${path.sep}`,
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

const typeOnlyNames = new Set([
  "LegalDocument",
  "LegalRegistry",
  "LegalSection",
  "ErrorInfo",
  "ReactNode",
  "IconName",
]);

function rewriteNamedImport(line) {
  // import { A, B } from "x";
  const m = line.match(/^(\s*import\s+)\{\s*([^}]+)\s*\}(\s+from\s+['"][^'"]+['"]\s*;?\s*)$/);
  if (!m) return line;
  const head = m[1];
  const inner = m[2];
  const tail = m[3];

  const parts = inner
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const anyNonType = parts.some((p) => {
    // Strip any alias "X as Y"
    const base = p.split(/\s+as\s+/)[0]?.trim();
    return base && !typeOnlyNames.has(base);
  });

  const anyType = parts.some((p) => {
    const base = p.split(/\s+as\s+/)[0]?.trim();
    return base && typeOnlyNames.has(base);
  });

  // If it mixes, we convert only the specific ones by adding `type` keyword in specifiers
  // (TS 5+ supports `import { type Foo, Bar } ...`).
  if (anyNonType && anyType) {
    const rebuilt = parts
      .map((p) => {
        const base = p.split(/\s+as\s+/)[0]?.trim();
        if (base && typeOnlyNames.has(base) && !p.startsWith("type ")) return `type ${p}`;
        return p;
      })
      .join(", ");
    return `${head}{ ${rebuilt} }${tail}`;
  }

  // If all are type-only, switch to `import type`.
  if (anyType && !anyNonType) {
    return `${head}type { ${parts.join(", ")} }${tail}`;
  }

  return line;
}

let updated = 0;
const files = [];
walk(rootDir, files);

for (const file of files) {
  const src = fs.readFileSync(file, "utf8");
  if (!src.includes("import")) continue;

  const lines = src.split(/\r?\n/);
  let changed = false;
  for (let i = 0; i < lines.length; i++) {
    const before = lines[i];
    const after = rewriteNamedImport(before);
    if (after !== before) {
      lines[i] = after;
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, lines.join("\n"));
    updated++;
  }
}

console.log(`fix-verbatim-type-imports: updated ${updated} files`);

