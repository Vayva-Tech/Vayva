#!/usr/bin/env node
/**
 * Batch fix TS7006 errors - adds NextRequest type to req parameters
 */
const fs = require('fs');
const path = require('path');

const API_DIR = '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin/src/app/api';

// Find all route.ts files
function findRouteFiles(dir, files = []) {
  const items = fs.readdirSync(dir, { withFileTypes: true });
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      findRouteFiles(fullPath, files);
    } else if (item.name === 'route.ts') {
      files.push(fullPath);
    }
  }
  return files;
}

// Check if file has implicit any req parameter
function hasImplicitReq(content) {
  // Match patterns like: async (req, { or async (_req, {
  return /async\s*\(\s*(_|)req\s*,\s*\{/g.test(content);
}

// Check if NextRequest is already imported
function hasNextRequestImport(content) {
  return /import\s*\{[^}]*NextRequest[^}]*\}\s*from\s*["']next\/server["']/.test(content);
}

// Fix a single file
function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf-8');
  let modified = false;

  if (!hasImplicitReq(content)) {
    return { file: filePath, status: 'skipped', reason: 'no implicit req' };
  }

  // Add NextRequest import if missing
  if (!hasNextRequestImport(content)) {
    // Check if NextResponse is already imported
    if (content.includes('import { NextResponse } from "next/server"')) {
      content = content.replace(
        'import { NextResponse } from "next/server"',
        'import { NextRequest, NextResponse } from "next/server"'
      );
    } else if (content.includes("import { NextResponse } from 'next/server'")) {
      content = content.replace(
        "import { NextResponse } from 'next/server'",
        "import { NextRequest, NextResponse } from 'next/server'"
      );
    } else {
      // Add new import at the top
      content = 'import { NextRequest } from "next/server";\n' + content;
    }
    modified = true;
  }

  // Replace async (req, { with async (req: NextRequest, {
  const newContent = content.replace(
    /async\s*\(\s*(_|)req\s*,\s*\{/g,
    'async ($1req: NextRequest, {'
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
const routeFiles = findRouteFiles(API_DIR);
console.log(`Found ${routeFiles.length} route.ts files`);

let fixed = 0;
let skipped = 0;
let errors = [];

for (const file of routeFiles) {
  try {
    const result = fixFile(file);
    if (result.status === 'fixed') {
      console.log(`✓ Fixed: ${path.relative(API_DIR, file)}`);
      fixed++;
    } else if (result.status === 'skipped') {
      skipped++;
    }
  } catch (err) {
    console.error(`✗ Error in ${file}: ${err.message}`);
    errors.push({ file, error: err.message });
  }
}

console.log(`\n=== Summary ===`);
console.log(`Total files: ${routeFiles.length}`);
console.log(`Fixed: ${fixed}`);
console.log(`Skipped: ${skipped}`);
console.log(`Errors: ${errors.length}`);

if (errors.length > 0) {
  console.log('\nErrors:');
  errors.forEach(e => console.log(`  - ${e.file}: ${e.error}`));
  process.exit(1);
}
