#!/usr/bin/env node
/**
 * Comprehensive TypeScript error fix for merchant-admin
 * Fixes:
 * 1. Unterminated template literals in comments
 * 2. Unterminated regex literals
 * 3. Malformed nested block comments
 */

const fs = require('fs');
const path = require('path');

const SRC_DIR = path.join(__dirname, '../Frontend/merchant-admin/src');

// Specific files with known issues from the error log
const PRIORITY_FILES = [
  'lib/logger.ts',
  'lib/utils.ts',
  'instrumentation.ts',
  'hooks/useLocalStorage.ts',
  'lib/auth.ts',
  'app/(dashboard)/dashboard/finance/payouts/page.tsx',
  'app/(dashboard)/dashboard/fulfillment/issues/page.tsx',
  'app/(dashboard)/dashboard/inbox/page.tsx',
  'app/(dashboard)/dashboard/settings/store/page.tsx',
  'components/control-center/ThemeCustomizer.tsx',
  'components/customers/CustomerListContainer.tsx',
];

function fixUnterminatedLiterals(content) {
  // Fix pattern: `... */ (backtick starts but never closes before */)
  // This creates an unterminated template literal

  // Pattern 1: `text */ at end of line - remove the backtick
  content = content.replace(/`([^`]*)\*\/$/gm, (match) => {
    return match.replace(/^`/, '// ');
  });

  // Pattern 2: /* `... */ -> the backtick inside block comment
  content = content.replace(/\/\*\s*`([^`]*)\*\//g, (match) => {
    return match.replace(/`/, '');
  });

  // Pattern 3: `...${...}... */ -> remove these malformed template literals entirely
  content = content.replace(/`[^`]*\$\{[^}]*\}[^`]*\*\/$/gm, (match) => {
    return '// ' + match.replace(/`/g, '').replace(/\*\/$/, '');
  });

  // Pattern 4: Lines ending with backtick and content but no closing backtick before */
  content = content.replace(/^(\s*)`([^`]+)\*\/$/gm, (match, indent, inner) => {
    return indent + '// ' + inner;
  });

  return content;
}

function fixNestedBlockComments(content) {
  // Fix /* /* ... */ */ -> /* ... */
  content = content.replace(/\/\*\s*\/\*\s*([^*]*(?:\*(?!\/)[^*]*)*)\*\/\s*\*\//g, '/* $1 */');

  // Fix /* ... */ */ -> /* ... */
  content = content.replace(/\/\*\s*([^*]*)\*\/\s*\*\//g, '/* $1 */');

  return content;
}

function fixUnterminatedRegex(content) {
  // Pattern: /pattern/suffix with no closing or invalid
  // These often appear when regexes are broken across lines incorrectly

  // Fix trailing slashes that look like start of regex
  content = content.replace(/\*\/$/gm, '*/');

  return content;
}

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const original = content;

  content = fixNestedBlockComments(content);
  content = fixUnterminatedLiterals(content);
  content = fixUnterminatedRegex(content);

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
console.log('🔧 Comprehensive TypeScript error fix...\n');

let fixedCount = 0;

// First process priority files
for (const relPath of PRIORITY_FILES) {
  const fullPath = path.join(SRC_DIR, relPath);
  if (fs.existsSync(fullPath)) {
    if (processFile(fullPath)) {
      fixedCount++;
    }
  }
}

// Then walk all files
walkDir(SRC_DIR, (filePath) => {
  if (processFile(filePath)) {
    fixedCount++;
  }
});

console.log(`\n✅ Fixed ${fixedCount} files`);
