#!/usr/bin/env node
/**
 * Fix malformed TypeScript generic syntax in merchant-admin
 * Specifically fixes: React.ChangeEvent<HTMLInputElement /> -> React.ChangeEvent<HTMLInputElement>
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../Frontend/merchant-admin/src');

// Fix patterns
const FIXES = [
  // React.ChangeEvent generic syntax errors (extra space before />)
  { from: /React\.ChangeEvent<HTMLInputElement\s*\/>/g, to: 'React.ChangeEvent<HTMLInputElement>' },
  { from: /React\.ChangeEvent<HTMLTextAreaElement\s*\/>/g, to: 'React.ChangeEvent<HTMLTextAreaElement>' },
  { from: /React\.ChangeEvent<HTMLSelectElement\s*\/>/g, to: 'React.ChangeEvent<HTMLSelectElement>' },
  { from: /React\.ChangeEvent<HTMLButtonElement\s*\/>/g, to: 'React.ChangeEvent<HTMLButtonElement>' },
];

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;

  for (const fix of FIXES) {
    if (fix.from.test(content)) {
      content = content.replace(fix.from, fix.to);
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
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
      if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
        walkDir(fullPath, callback);
      }
    } else if (/\.(tsx|ts)$/.test(file)) {
      callback(fullPath);
    }
  }
}

// Main
console.log('🔧 Fixing malformed TypeScript generic syntax...\n');

let fixedCount = 0;
walkDir(SRC_DIR, (filePath) => {
  if (processFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
