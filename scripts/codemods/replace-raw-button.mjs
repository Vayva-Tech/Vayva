import fs from "node:fs";
import path from "node:path";

/**
 * Codemod: Replace raw <button> with <Button> from @vayva/ui in TSX/JSX.
 *
 * Heuristic (string-based):
 * - Replace `<button` -> `<Button`
 * - Replace `</button>` -> `</Button>`
 * - Ensure `Button` is imported from `@vayva/ui`
 *
 * Usage:
 *   node scripts/codemods/replace-raw-button.mjs <rootDir>
 */

const [, , rootDirArg] = process.argv;
const rootDir = rootDirArg ? path.resolve(rootDirArg) : process.cwd();

/** @type {string[]} */
const exts = [".tsx", ".jsx"];

/** @type {string[]} */
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

function upsertButtonImport(source) {
  // If already has Button imported from @vayva/ui, do nothing.
  if (source.match(/from\s+['"]@vayva\/ui['"]/)) {
    // Expand existing named import if possible.
    const m = source.match(
      /import\s+\{\s*([^}]+)\s*\}\s+from\s+['"]@vayva\/ui['"];\s*/m
    );
    if (m) {
      const names = m[1]
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      if (!names.includes("Button")) {
        const updated = `import { ${[...names, "Button"].join(", ")} } from "@vayva/ui";\n`;
        return source.replace(m[0], updated);
      }
      return source;
    }
  }

  // Otherwise add a new import near the top (after "use client" if present).
  const importLine = `import { Button } from "@vayva/ui";\n`;
  if (source.startsWith('"use client";') || source.startsWith("'use client';")) {
    const lines = source.split(/\r?\n/);
    // Insert after first line.
    lines.splice(1, 0, importLine.trimEnd());
    return lines.join("\n") + "\n";
  }
  return importLine + source;
}

let changedFiles = 0;
const files = [];
walk(rootDir, files);

for (const file of files) {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes("<button") && !original.includes("</button>")) continue;

  let next = original;
  next = next.replace(/<button(\s|>)/g, "<Button$1");
  next = next.replace(/<\/button>/g, "</Button>");

  if (next !== original) {
    next = upsertButtonImport(next);
    fs.writeFileSync(file, next);
    changedFiles++;
  }
}

console.log(`replace-raw-button: updated ${changedFiles} files`);

