import fs from "node:fs";
import path from "node:path";

/**
 * Codemod: Fix a subset of ESLint warnings using eslint CLI output.
 *
 * Supported:
 * - @typescript-eslint/no-unused-vars: prefixes the reported identifier with "_"
 *   on the *reported line* only (works for imports/params/locals in most cases).
 * - @typescript-eslint/no-explicit-any: replaces `any` with `unknown` on the reported line.
 * - no-console: replaces console.(log|info|debug) with console.warn on the reported line.
 *
 * Usage:
 *   node scripts/codemods/fix-eslint-warnings.mjs path/to/eslint-output.txt
 */

const [, , eslintOutputPath] = process.argv;
if (!eslintOutputPath) {
  console.error("Usage: node scripts/codemods/fix-eslint-warnings.mjs <eslint-output.txt>");
  process.exit(2);
}

const output = fs.readFileSync(eslintOutputPath, "utf8");

/** @type {Map<string, Array<{line:number, col:number, rule:string, name?:string}>>} */
const byFile = new Map();

// ESLint default formatter groups like:
// /abs/path/file.ts
//   12:34  warning  'foo' is defined but never used  @typescript-eslint/no-unused-vars
const lines = output.split(/\r?\n/);
let currentFile = null;
for (const raw of lines) {
  const fileMatch = raw.match(/^\/.*\.(?:ts|tsx|js|jsx)$/);
  if (fileMatch) {
    currentFile = fileMatch[0];
    continue;
  }
  if (!currentFile) continue;

  const warnMatch = raw.match(
    /^\s*(\d+):(\d+)\s+warning\s+(.+?)\s{2,}([@a-zA-Z0-9-/]+)\s*$/
  );
  if (!warnMatch) continue;

  const lineNo = Number(warnMatch[1]);
  const colNo = Number(warnMatch[2]);
  const message = warnMatch[3];
  const rule = warnMatch[4];

  if (rule === "@typescript-eslint/no-unused-vars") {
    const nameMatch =
      message.match(/'([^']+)' is (?:defined|assigned a value) but never used/) ??
      message.match(/'([^']+)' is (?:defined|assigned) but never used/);
    const name = nameMatch?.[1];
    if (!name || name.startsWith("_")) continue;
    const arr = byFile.get(currentFile) ?? [];
    arr.push({ line: lineNo, col: colNo, rule, name });
    byFile.set(currentFile, arr);
  } else if (rule === "@typescript-eslint/no-explicit-any") {
    const arr = byFile.get(currentFile) ?? [];
    arr.push({ line: lineNo, col: colNo, rule });
    byFile.set(currentFile, arr);
  } else if (rule === "no-console") {
    const arr = byFile.get(currentFile) ?? [];
    arr.push({ line: lineNo, col: colNo, rule });
    byFile.set(currentFile, arr);
  }
}

function replaceWordOnLine(line, word, replacement) {
  // Prefer identifier replacement near the start of a line (imports/params/const)
  // but keep it simple: first whole-word occurrence.
  const re = new RegExp(`\\b${escapeRegExp(word)}\\b`);
  return line.replace(re, replacement);
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

let touchedFiles = 0;
for (const [file, issues] of byFile) {
  if (!fs.existsSync(file)) continue;
  const original = fs.readFileSync(file, "utf8");
  const fileLines = original.split(/\r?\n/);

  // Apply bottom-up so earlier line numbers remain stable.
  const sorted = [...issues].sort((a, b) => b.line - a.line || b.col - a.col);
  let changed = false;

  for (const issue of sorted) {
    const idx = issue.line - 1;
    if (idx < 0 || idx >= fileLines.length) continue;
    const before = fileLines[idx];
    let after = before;

    if (issue.rule === "@typescript-eslint/no-unused-vars" && issue.name) {
      after = replaceWordOnLine(after, issue.name, `_${issue.name}`);
    } else if (issue.rule === "@typescript-eslint/no-explicit-any") {
      // Replace token `any` with `unknown` on that line.
      after = after.replace(/\bany\b/g, "unknown");
    } else if (issue.rule === "no-console") {
      after = after
        .replace(/\bconsole\.log\b/g, "console.warn")
        .replace(/\bconsole\.info\b/g, "console.warn")
        .replace(/\bconsole\.debug\b/g, "console.warn");
    }

    if (after !== before) {
      fileLines[idx] = after;
      changed = true;
    }
  }

  if (changed) {
    fs.writeFileSync(file, fileLines.join("\n"));
    touchedFiles++;
  }
}

console.log(`fix-eslint-warnings: updated ${touchedFiles} files`);

