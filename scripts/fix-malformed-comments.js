#!/usr/bin/env node
/**
 * Fix malformed comment blocks causing TypeScript parse errors
 */

const fs = require('fs');
const path = require('path');

const FILES_TO_FIX = [
  'Frontend/merchant-admin/src/lib/logger.ts',
  'Frontend/merchant-admin/src/lib/utils.ts',
  'Frontend/merchant-admin/src/instrumentation.ts',
  'Frontend/merchant-admin/src/hooks/useLocalStorage.ts',
  'Frontend/merchant-admin/src/lib/auth.ts',
  'Frontend/merchant-admin/src/scripts/verify-paystack.ts',
];

// Fix malformed nested block comments
function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  let modified = false;

  // Fix pattern: /* /* some code */ */ → /* some code */
  // Handle the specific case of nested block comments from console log removal
  const nestedCommentPattern = /\/\*\s*\/\*\s*([^*]*(?:\*(?!\/)\/?[^*]*)*)\*\/\s*\*\//g;
  if (nestedCommentPattern.test(content)) {
    content = content.replace(nestedCommentPattern, (match, inner) => {
      return `/* ${inner.trim()} */`;
    });
    modified = true;
  }

  // Fix pattern: /* some code */ */ (trailing */)
  const trailingPattern = /\/\*\s*([^*]*)\*\/\s*\*\//g;
  if (trailingPattern.test(content)) {
    content = content.replace(trailingPattern, (match, inner) => {
      return `/* ${inner.trim()} */`;
    });
    modified = true;
  }

  // Fix unterminated template literals in comments (from partial console removal)
  // Pattern: `... */ (unterminated backtick)
  const unterminatedPattern = /`[^`]*\*\/$/gm;
  if (unterminatedPattern.test(content)) {
    // Remove these malformed lines entirely
    content = content.replace(/^\s*`[^`]*\*\/\s*$/gm, '');
    modified = true;
  }

  if (modified) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Main
console.log('🔧 Fixing malformed comment blocks...\n');

let fixedCount = 0;
for (const file of FILES_TO_FIX) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
