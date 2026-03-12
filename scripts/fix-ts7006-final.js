#!/usr/bin/env node
/**
 * Fix remaining TS7006 errors in services and ops-console
 */
const fs = require('fs');
const path = require('path');

const TARGET_DIRS = [
  '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/services',
  '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/ops-console/src',
  '/Users/fredrick/Documents/Vayva-Tech/vayva/tests'
];

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

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;
  let newContent = content;

  // Fix service file patterns
  newContent = newContent.replace(
    /\.map\(\s*\(\s*(p|d|s|tier|ind)\s*\)\s*=>/g,
    '.map(($1: any) =>'
  );
  newContent = newContent.replace(
    /\.filter\(\s*\(\s*(p|d|s|tier|ind)\s*\)\s*=>/g,
    '.filter(($1: any) =>'
  );
  newContent = newContent.replace(
    /\.find\(\s*\(\s*(p|d|s|tier|ind)\s*\)\s*=>/g,
    '.find(($1: any) =>'
  );
  newContent = newContent.replace(
    /\.forEach\(\s*\(\s*(p|d|s|tier|ind)\s*\)\s*=>/g,
    '.forEach(($1: any) =>'
  );

  // Fix ops-console patterns
  newContent = newContent.replace(
    /async\s*\(\s*_?req\s*,\s*context\s*\)\s*=>/g,
    'async (_req: NextRequest, context: any) =>'
  );
  newContent = newContent.replace(
    /async\s*\(\s*req\s*,\s*context\s*\)\s*=>/g,
    'async (req: NextRequest, context: any) =>'
  );

  // Add NextRequest import if needed
  if (newContent.includes('NextRequest') && !newContent.includes('from "next/server"')) {
    newContent = 'import { NextRequest } from "next/server";\n' + newContent;
  }

  // Fix page.tsx patterns
  newContent = newContent.replace(
    /\.map\(\s*\(\s*(u|c|i|item|merchant|value)\s*\)\s*=>/g,
    '.map(($1: any) =>'
  );
  newContent = newContent.replace(
    /onChange=\{\s*\(\s*value\s*\)\s*=>/g,
    'onChange={(value: string) =>'
  );

  // Fix test file patterns
  newContent = newContent.replace(
    /page\.route\(\s*\(\s*route\s*\)\s*=>/g,
    'page.route((route: any) =>'
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

const tsFiles = findTsFiles(TARGET_DIRS);
console.log(`Found ${tsFiles.length} files`);

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
    errors.push({ file, error: err.message });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Fixed: ${fixed}`);
console.log(`Errors: ${errors.length}`);
