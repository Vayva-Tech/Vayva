import fs from "node:fs";
import path from "node:path";

/**
 * Repairs issues introduced by naive replace-raw-button codemod:
 * - Ensures "use client" remains a directive (no imports before it)
 * - Avoids importing Button from @vayva/ui when Button is already imported from elsewhere
 */

const [, , rootDirArg] = process.argv;
const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

const exts = [".tsx", ".jsx"];
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

function hasUseClient(src) {
  return /(^|\n)\s*['"]use client['"];\s*(\n|$)/.test(src);
}

function hasNonUiButtonImport(src) {
  // Any import that brings in Button, not from @vayva/ui
  const importLines = src.match(/^import .*$/gm) ?? [];
  return importLines.some((l) => /\bButton\b/.test(l) && !/@vayva\/ui/.test(l));
}

function removeUiButtonImport(src) {
  // Remove simple `import { Button } from "@vayva/ui";`
  src = src.replace(/^import\s+\{\s*Button\s*\}\s+from\s+['"]@vayva\/ui['"];\s*\n?/m, "");
  // If there's a named import list, remove Button from it and clean commas.
  src = src.replace(
    /^import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@vayva\/ui['"];\s*$/gm,
    (full, inner) => {
      const parts = inner
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .filter((p) => p !== "Button");
      if (parts.length === 0) return "";
      return `import { ${parts.join(", ")} } from "@vayva/ui";`;
    },
  );
  return src;
}

function moveImportsBelowUseClient(src) {
  // If there are imports before the 'use client' directive, move them after.
  const m = src.match(/(^[\s\S]*?)((?:['"]use client['"];\s*\n))(?:([\s\S]*))$/m);
  if (!m) return src;
  const before = m[1];
  const directive = m[2];
  const after = m[3] ?? "";

  // Extract import lines from `before`
  const beforeLines = before.split(/\r?\n/);
  const importLines = [];
  const keptLines = [];
  for (const l of beforeLines) {
    if (/^\s*import\b/.test(l)) importLines.push(l);
    else keptLines.push(l);
  }
  if (importLines.length === 0) return src;

  // Rebuild: kept (comments) + directive + imports + rest(after)
  const kept = keptLines.join("\n").replace(/\s+$/g, "");
  const importsBlock = importLines.join("\n") + "\n";
  return `${kept}\n${directive}${importsBlock}${after}`.replace(/^\n+/, "");
}

let changed = 0;
const files = [];
walk(rootDir, files);

for (const file of files) {
  let src = fs.readFileSync(file, "utf8");
  if (!src.includes("Button") && !src.includes("use client")) continue;

  let next = src;
  if (hasUseClient(next)) {
    next = moveImportsBelowUseClient(next);
  }
  if (hasNonUiButtonImport(next)) {
    next = removeUiButtonImport(next);
  }

  if (next !== src) {
    fs.writeFileSync(file, next);
    changed++;
  }
}

console.log(`repair-button-imports: updated ${changed} files`);

