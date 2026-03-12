#!/usr/bin/env ts-node
/**
 * Script to fix TS18046 errors - 'e' is of type 'unknown' in catch blocks
 * 
 * This script finds catch blocks with untyped 'e' parameters and adds proper type guards
 */

import * as fs from 'fs';
import * as path from 'path';
import { glob } from 'glob';

// Patterns to find catch blocks that need fixing
const CATCH_PATTERNS = [
  /catch\s*\(\s*e\s*\)\s*\{/g,
  /catch\s*\(\s*err\s*\)\s*\{/g,
  /catch\s*\(\s*error\s*\)\s*\{/g,
];

// Check if a file uses the error variable without type guard
function needsFix(content: string): boolean {
  // Look for patterns like e.message, e.stack, etc. without instanceof check
  const usesE = /\be\.(message|stack|name|toString)\b/.test(content);
  const hasInstanceof = /instanceof\s+Error/.test(content);
  return usesE && !hasInstanceof;
}

// Fix the catch block by adding proper error handling
function fixCatchBlock(content: string): string {
  // Replace catch (e) { with proper error handling
  return content.replace(
    /catch\s*\(\s*(e|err|error)\s*\)\s*\{/g,
    'catch ($1: unknown) {\n    const errorMessage = $1 instanceof Error ? $1.message : String($1);'
  );
}

async function main() {
  const files = await glob('Frontend/**/*.{ts,tsx}', { cwd: process.cwd() });
  
  let fixedCount = 0;
  
  for (const file of files) {
    const fullPath = path.join(process.cwd(), file);
    const content = fs.readFileSync(fullPath, 'utf-8');
    
    // Check if file has catch blocks that need fixing
    if (CATCH_PATTERNS.some(p => p.test(content)) && needsFix(content)) {
      console.log(`Fixing: ${file}`);
      const fixed = fixCatchBlock(content);
      fs.writeFileSync(fullPath, fixed);
      fixedCount++;
    }
  }
  
  console.log(`\nFixed ${fixedCount} files`);
}

main().catch(console.error);
