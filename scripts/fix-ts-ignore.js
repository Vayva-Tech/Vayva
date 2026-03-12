#!/usr/bin/env node
/**
 * Script to remove @ts-ignore comments for module resolution issues
 * where the modules actually exist and resolve correctly.
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.resolve(__dirname, '../Frontend/merchant-admin/src');

// Patterns to match and remove
const PATTERNS = [
  // @ts-ignore comment on its own line, followed by import
  { regex: /\/\/\s*@ts-ignore\s*-?\s*Module resolution pending\s*\n(?=\s*import\s+)/g, replacement: '' },
  // @ts-ignore on same line as import
  { regex: /\/\/\s*@ts-ignore\s*-?\s*Module resolution pending\s*\n/g, replacement: '' },
];

function processFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  let newContent = content;
  let changed = false;

  for (const pattern of PATTERNS) {
    if (pattern.regex.test(newContent)) {
      newContent = newContent.replace(pattern.regex, pattern.replacement);
      changed = true;
    }
  }

  if (changed) {
    // Clean up double newlines left by removals
    newContent = newContent.replace(/\n\n\n+/g, '\n\n');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log(`Fixed: ${path.relative(SRC_DIR, filePath)}`);
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      walkDir(fullPath, callback);
    } else if (/\.(ts|tsx|js|jsx)$/.test(file)) {
      callback(fullPath);
    }
  }
}

let fixedCount = 0;
walkDir(SRC_DIR, (filePath) => {
  if (processFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\nTotal files fixed: ${fixedCount}`);
