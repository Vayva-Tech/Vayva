#!/usr/bin/env node
/**
 * Fix corrupted syntax from aggressive-type-fixer.mjs
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Find all TS/TSX files
function findFiles(dir, extensions, files = []) {
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory() && !item.startsWith('.') && item !== 'node_modules') {
        findFiles(fullPath, extensions, files);
      } else if (stat.isFile() && extensions.some(ext => item.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  } catch (e) {}
  return files;
}

// Fix corrupted patterns
function fixCorruptedPatterns(content) {
  let original = content;

  // Fix (React as any)?.JSX?.Element -> React.JSX.Element
  content = content.replace(/\(React as any\)\?\.JSX\?\.Element/g, 'React.JSX.Element');
  content = content.replace(/\(React as any\)\.JSX\.Element/g, 'React.JSX.Element');
  content = content.replace(/\(React as any\)\?\.JSX\.Element/g, 'React.JSX.Element');

  // Fix broken map callbacks: .map((x) as any => ( -> .map((x) => (
  content = content.replace(/\.map\(\(([^)]+)\)\s+as\s+any\s*=>/g, '.map(($1) =>');

  // Fix broken map callbacks with type: .map((x: Type) as any => ( -> .map((x: Type) => (
  content = content.replace(/\.map\(\(([^)]+:\s*[^)]+)\)\s+as\s+any\s*=>/g, '.map(($1) =>');

  // Fix broken inline as any in JSX: {(item as any).prop} -> {item.prop}
  content = content.replace(/\{\s*\((\w+)\s+as\s+any\)\?\./g, '{$1?.');
  content = content.replace(/\{\s*\((\w+)\s+as\s+any\)\./g, '{$1.');

  // Fix broken text like (amina as any)?.vayva?.ng -> amina.vayva.ng
  content = content.replace(/\((\w+)\s+as\s+any\)\?\./g, '$1.');

  // Fix {bullets.map((b, i) as any => ( -> {bullets.map((b, i) => (
  content = content.replace(/\.map\(\(([^)]+,\s*\w+)\)\s+as\s+any\s*=>/g, '.map(($1) =>');

  return content;
}

// Main
console.log('🔧 Fixing corrupted syntax patterns...\n');

const files = findFiles('/Users/fredrick/Documents/Vayva-Tech/vayva', ['.ts', '.tsx']);
let fixed = 0;

for (const file of files) {
  try {
    const content = fs.readFileSync(file, 'utf-8');
    const fixed = fixCorruptedPatterns(content);
    if (fixed !== content) {
      fs.writeFileSync(file, fixed);
      console.log(`✅ Fixed: ${path.relative('/Users/fredrick/Documents/Vayva-Tech/vayva', file)}`);
      fixed++;
    }
  } catch (e) {
    console.error(`❌ Error: ${file}: ${e.message}`);
  }
}

console.log(`\n🎉 Fixed ${fixed} files`);
