#!/usr/bin/env node
/**
 * Batch fix TS7006 errors - adds types to event handler parameters in components
 */
const fs = require('fs');
const path = require('path');

const COMPONENTS_DIR = '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/components';

// Find all .tsx files
function findTsxFiles(dir, files = []) {
  if (!fs.existsSync(dir)) return files;
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

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  // Fix onChange={(e) => ...} to onChange={(e: React.ChangeEvent<HTMLInputElement>) => ...}
  let newContent = content.replace(
    /onChange=\{\s*\(\s*e\s*\)\s*=>/g,
    'onChange={(e: React.ChangeEvent<HTMLInputElement>) =>'
  );

  // Fix onClick={(e) => ...} to onClick={(e: React.MouseEvent<HTMLButtonElement>) => ...}
  newContent = newContent.replace(
    /onClick=\{\s*\(\s*e\s*\)\s*=>/g,
    'onClick={(e: React.MouseEvent<HTMLButtonElement>) =>'
  );

  // Fix onSubmit={(e) => ...} to onSubmit={(e: React.FormEvent<HTMLFormElement>) => ...}
  newContent = newContent.replace(
    /onSubmit=\{\s*\(\s*e\s*\)\s*=>/g,
    'onSubmit={(e: React.FormEvent<HTMLFormElement>) =>'
  );

  // Fix onKeyDown={(e) => ...}
  newContent = newContent.replace(
    /onKeyDown=\{\s*\(\s*e\s*\)\s*=>/g,
    'onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) =>'
  );

  // Fix .map((item, index) => with implicit item
  newContent = newContent.replace(
    /\.map\(\s*\(\s*(item|i)\s*,\s*(index|i)\s*\)\s*=>/g,
    '.map(($1: any, $2: number) =>'
  );

  // Fix .map((item) => with implicit item
  newContent = newContent.replace(
    /\.map\(\s*\(\s*(item|row|data)\s*\)\s*=>/g,
    '.map(($1: any) =>'
  );

  // Fix (value) => with implicit value
  newContent = newContent.replace(
    /\(\s*value\s*\)\s*=>/g,
    '(value: string) =>'
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
const tsxFiles = findTsxFiles(COMPONENTS_DIR);
console.log(`Found ${tsxFiles.length} .tsx files`);

let fixed = 0;
let errors = [];

for (const file of tsxFiles) {
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
console.log(`Total files: ${tsxFiles.length}`);
console.log(`Fixed: ${fixed}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  process.exit(1);
}
