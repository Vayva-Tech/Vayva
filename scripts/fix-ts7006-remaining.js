#!/usr/bin/env node
/**
 * Batch fix remaining TS7006 errors in ops-console and tests
 */
const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/ops-console/src',
  '/Users/fredrick/Documents/Vayva-Tech/vayva/tests'
];

// Find all .ts and .tsx files
function findTsFiles(dirs, files = []) {
  for (const dir of dirs) {
    if (!fs.existsSync(dir)) continue;
    const items = fs.readdirSync(dir, { withFileTypes: true });
    for (const item of items) {
      const fullPath = path.join(dir, item.name);
      if (item.isDirectory()) {
        findTsFiles([fullPath], files);
      } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
        files.push(fullPath);
      }
    }
  }
  return files;
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  let newContent = content;

  // Fix .map((x) => ... patterns with single letter or short variable names
  newContent = newContent.replace(
    /\.map\(\s*\(\s*(h|t|p|s|r|w|m|tx|tag|app|log|inv|route|user|merchant)\s*\)\s*=>/g,
    '.map(($1: any) =>'
  );

  // Fix .filter((x) => ... patterns
  newContent = newContent.replace(
    /\.filter\(\s*\(\s*(h|t|p|s|r|w|m|tx|tag|app|log|inv|route|user|merchant)\s*\)\s*=>/g,
    '.filter(($1: any) =>'
  );

  // Fix .find((x) => ... patterns
  newContent = newContent.replace(
    /\.find\(\s*\(\s*(h|t|p|s|r|w|m|tx|tag|app|log|inv|route|user|merchant)\s*\)\s*=>/g,
    '.find(($1: any) =>'
  );

  // Fix onChange={(value) => ...}
  newContent = newContent.replace(
    /onChange=\{\s*\(\s*value\s*\)\s*=>/g,
    'onChange={(value: string) =>'
  );

  // Fix (h) => or (t) => or (p) => patterns in arrow functions
  newContent = newContent.replace(
    /\(\s*(h|t|p|s|r|w|m)\s*\)\s*=>/g,
    '($1: any) =>'
  );

  if (newContent !== content) {
    modified = true;
    content = newContent;
  }

  if (modified) {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { file: filePath, status: 'fixed' };
  }

  return { file: filePath, status: 'no-change' };
}

// Main
const tsFiles = findTsFiles(TARGET_DIRS);
console.log(`Found ${tsFiles.length} .ts/.tsx files`);

let fixed = 0;
let errors = [];

for (const file of tsFiles) {
  try {
    const result = fixFile(file);
    if (result.status === 'fixed') {
      console.log(`✓ Fixed: ${path.basename(file)}`);
      fixed++;
    }
  } catch (err) {
    console.error(`✗ Error in ${file}: ${err.message}`);
    errors.push({ file, error: err.message });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total files: ${tsFiles.length}`);
console.log(`Fixed: ${fixed}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  process.exit(1);
}
