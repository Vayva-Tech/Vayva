#!/usr/bin/env node
/**
 * Fix malformed icon imports with double aliases
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../Frontend/ops-console/src');

function findFiles(dir, ext = '.tsx') {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      files.push(...findFiles(fullPath, ext));
    } else if (item.name.endsWith(ext)) {
      files.push(fullPath);
    }
  }
  return files;
}

function fixMalformedImports(content) {
  // Fix patterns like "X as Y as Z" → "X as Z"
  // Pattern: IconName as Alias1 as Alias2
  const doubleAliasPattern = /(\w+)\s+as\s+(\w+)\s+as\s+(\w+)/g;
  content = content.replace(doubleAliasPattern, (match, iconName, alias1, alias2) => {
    console.log(`  Fixing double alias: ${match} → ${iconName} as ${alias2}`);
    return `${iconName} as ${alias2}`;
  });

  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;

  content = fixMalformedImports(content);

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Fixed: ${path.relative(TARGET_DIR, filePath)}`);
    return true;
  }
  return false;
}

console.log('🔍 Fixing malformed imports...');
const files = findFiles(TARGET_DIR);
let fixedCount = 0;

for (const file of files) {
  if (processFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
