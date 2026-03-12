#!/usr/bin/env node
/**
 * Fix malformed comments in lib/ files causing TS parse errors
 */

const fs = require('fs');
const path = require('path');

const FILES = [
  'Frontend/merchant-admin/src/lib/logger.ts',
  'Frontend/merchant-admin/src/lib/utils.ts',
  'Frontend/merchant-admin/src/instrumentation.ts',
  'Frontend/merchant-admin/src/lib/auth.ts',
  'Frontend/merchant-admin/src/hooks/useLocalStorage.ts',
  'Frontend/merchant-admin/src/scripts/verify-paystack.ts',
];

function fixFile(filePath) {
  const fullPath = path.join(__dirname, '..', filePath);
  if (!fs.existsSync(fullPath)) {
    console.log(`⚠️  Not found: ${filePath}`);
    return false;
  }

  let content = fs.readFileSync(fullPath, 'utf8');
  const original = content;

  // Pattern 1: /* /* text */ */ -> /* text */
  content = content.replace(/\/\*\s*\/\*\s*([^*]*(?:\*(?!\/)\/?[^*]*)*)\*\/\s*\*\//g, '/* $1 */');

  // Pattern 2: Lines with backtick inside block comments that break TS parsing
  // /* `text */ -> /* text */
  content = content.replace(/\/\*\s*`([^`]*)\*\//g, '/* $1 */');

  // Pattern 3: /* text */ */ (trailing close)
  content = content.replace(/\/\*\s*([^*]*)\*\/\s*\*\//g, '/* $1 */');

  // Pattern 4: /* text with unclosed template ` -> remove the backtick
  content = content.replace(/(\/\*[^`]*?)`([^*]*)\*\//g, '$1$2 */');

  // Pattern 5: Nested comment blocks with multiple levels
  content = content.replace(/\/\*\s*\/\*\s*\/\*/g, '/*');

  // Pattern 6: Remove lines that are just malformed comment artifacts
  content = content.replace(/^\s*\*\/\s*$/gm, '');

  // Pattern 7: Fix template literal looking strings inside comments
  // that have ${...} patterns
  content = content.replace(/\/\*\s*\$\{/g, '/* {');

  if (content !== original) {
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`✅ Fixed: ${filePath}`);
    return true;
  }
  return false;
}

// Main
console.log('🔧 Fixing malformed comments in lib/ files...\n');

let fixedCount = 0;
for (const file of FILES) {
  if (fixFile(file)) {
    fixedCount++;
  }
}

console.log(`\n✅ Fixed ${fixedCount} files`);
