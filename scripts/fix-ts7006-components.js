#!/usr/bin/env node
/**
 * Batch fix TS7006 errors in components - adds types to event handler parameters
 */
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/components';

// Find all .tsx files
function findTsxFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findTsxFiles(fullPath, files);
    } else if (item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Check if React is imported
function hasReactImport(content) {
  return /import\s+React/.test(content) || /from\s*["']react["']/.test(content);
}

// Add React import if missing
function addReactImport(content) {
  if (hasReactImport(content)) return content;
  return 'import React from "react";\n' + content;
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Add React import if needed for event types
  if (!hasReactImport(content)) {
    content = addReactImport(content);
    modified = true;
  }

  // Fix common patterns
  const fixes = [
    // e parameter in form events
    { pattern: /onSubmit=\{\s*\(\s*e\s*\)\s*=>/g, replacement: 'onSubmit={(e: React.FormEvent) =>' },
    // e parameter in change events (input)
    { pattern: /onChange=\{\s*\(\s*e\s*\)\s*=>/g, replacement: 'onSubmit={(e: React.ChangeEvent<HTMLInputElement>) =>' },
    // value parameter in setState
    { pattern: /set\w+\(\(\s*value\s*\)\s*=>/g, replacement: 'set$1((value: string) =>' },
  ];

  for (const fix of fixes) {
    const newContent = content.replace(fix.pattern, fix.replacement);
    if (newContent !== content) {
      content = newContent;
      modified = true;
    }
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { file: filePath, status: 'fixed' };
  }

  return { file: filePath, status: 'no-change' };
}

// Main
const tsxFiles = findTsxFiles(COMPONENTS_DIR);
console.log(`Found ${tsxFiles.length} .tsx files`);

let fixed = 0;
let errors = [];

for (const file of tsxFiles.slice(0, 50)) { // Process first 50 for now
  try {
    const result = fixFile(file);
    if (result.status === 'fixed') {
      console.log(`✓ Fixed: ${path.relative(COMPONENTS_DIR, file)}`);
      fixed++;
    }
  } catch (err) {
    console.error(`✗ Error in ${file}: ${err.message}`);
    errors.push({ file, error: err.message });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  process.exit(1);
}
