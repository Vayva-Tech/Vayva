#!/usr/bin/env node
/**
 * Batch fix TS7006 errors - adds number type to sum parameters in reduce functions
 */
const fs = require('fs');
const path = require('path');

const SRC_DIR = '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src';

// Find all .ts and .tsx files
function findTsFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findTsFiles(fullPath, files);
    } else if (item.name.endsWith('.ts') || item.name.endsWith('.tsx')) {
      files.push(fullPath);
    }
  }
  return files;
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix patterns like: .reduce((sum, item) or .reduce((sum, p) =>
  // by adding : number to sum
  const newContent = content.replace(
    /\.reduce\(\s*\(\s*(sum|acc|total)\s*,\s*(\w+)\s*\)\s*=>/g,
    '.reduce(($1: number, $2) =>'
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
const tsFiles = findTsFiles(SRC_DIR);
console.log(`Found ${tsFiles.length} .ts/.tsx files`);

let fixed = 0;
let skipped = 0;
let errors = [];

for (const file of tsFiles) {
  try {
    const result = fixFile(file);
    if (result.status === 'fixed') {
      console.log(`✓ Fixed: ${path.relative(SRC_DIR, file)}`);
      fixed++;
    } else {
      skipped++;
    }
  } catch (err) {
    console.error(`✗ Error in ${file}: ${err.message}`);
    errors.push({ file, error: err.message });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total files: ${tsFiles.length}`);
console.log(`Fixed: ${fixed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  process.exit(1);
}
