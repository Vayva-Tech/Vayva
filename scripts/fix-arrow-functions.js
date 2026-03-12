#!/usr/bin/env node
/**
 * Fix malformed arrow function syntax (e) = /> -> (e) =>
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../Frontend/merchant-admin/src');

function fixArrowFunctions(content) {
  // Fix pattern: (e) = /> -> (e) =>
  // This is a malformed arrow function that happened during some automated edit

  // Fix: (e) = /> -> (e) =>
  content = content.replace(/\(e\)\s*=\s*\/>/g, '(e) =>');

  // Fix: (e) => /> at end of line (arrow then self-closing tag on same line)
  // This might be valid in some contexts but usually malformed

  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = fixArrowFunctions(content);

  if (content !== original) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Fixed: ${path.relative(SRC_DIR, filePath)}`);
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
console.log('🔧 Fixing malformed arrow function syntax...\n');

let fixedCount = 0;
walkDir(SRC_DIR, (filePath) => {
  if (processFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
