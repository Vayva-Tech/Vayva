#!/usr/bin/env node
/**
 * Auto-fix TypeScript binding element errors in API routes
 * This script adds explicit type annotations to withVayvaAPI handlers
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Patterns to match and their replacements
const patterns = [
  // Pattern 1: async (req, { storeId }) => {
  {
    regex: /async\s*\(\s*req\s*,\s*\{\s*storeId\s*\}\s*\)\s*=>/g,
    replacement: 'async (req, { storeId }: { storeId: string }) =>',
    description: 'storeId only'
  },
  // Pattern 2: async (req, { storeId, user }) => {
  {
    regex: /async\s*\(\s*req\s*,\s*\{\s*storeId\s*,\s*user\s*\}\s*\)\s*=>/g,
    replacement: 'async (req, { storeId, user }: { storeId: string; user: { id: string } }) =>',
    description: 'storeId + user'
  },
  // Pattern 3: async (req, { storeId, params }) => {
  {
    regex: /async\s*\(\s*req\s*,\s*\{\s*storeId\s*,\s*params\s*\}\s*\)\s*=>/g,
    replacement: 'async (req, { storeId, params }: { storeId: string; params: Record<string, string> | Promise<Record<string, string>> }) =>',
    description: 'storeId + params'
  },
  // Pattern 4: async (req, { storeId, user, params }) => {
  {
    regex: /async\s*\(\s*req\s*,\s*\{\s*storeId\s*,\s*user\s*,\s*params\s*\}\s*\)\s*=>/g,
    replacement: 'async (req, { storeId, user, params }: { storeId: string; user: { id: string }; params: Record<string, string> | Promise<Record<string, string>> }) =>',
    description: 'storeId + user + params'
  },
  // Pattern 5: async (req, { storeId, correlationId }) => {
  {
    regex: /async\s*\(\s*req\s*,\s*\{\s*storeId\s*,\s*correlationId\s*\}\s*\)\s*=>/g,
    replacement: 'async (req, { storeId, correlationId }: { storeId: string; correlationId: string }) =>',
    description: 'storeId + correlationId'
  },
  // Pattern 6: async (req, { storeId, user, correlationId }) => {
  {
    regex: /async\s*\(\s*req\s*,\s*\{\s*storeId\s*,\s*user\s*,\s*correlationId\s*\}\s*\)\s*=>/g,
    replacement: 'async (req, { storeId, user, correlationId }: { storeId: string; user: { id: string }; correlationId: string }) =>',
    description: 'storeId + user + correlationId'
  }
];

// Get list of files with binding element errors
function getFilesWithErrors() {
  try {
    const result = execSync(
      'pnpm tsc --noEmit 2>&1 | grep "Binding element \'storeId\'" | grep -oE "Frontend/merchant-admin/src/app/api/.*\.ts" | sort -u',
      { cwd: '/Users/fredrick/Documents/Vayva-Tech/vayva', encoding: 'utf-8', maxBuffer: 50 * 1024 * 1024 }
    );
    return result.trim().split('\n').filter(Boolean);
  } catch (e) {
    console.error('Error getting files with errors:', e.message);
    return [];
  }
}

// Fix a single file
function fixFile(filePath) {
  const fullPath = path.join('/Users/fredrick/Documents/Vayva-Tech/vayva', filePath);
  
  if (!fs.existsSync(fullPath)) {
    console.log(`File not found: ${fullPath}`);
    return 0;
  }

  let content = fs.readFileSync(fullPath, 'utf-8');
  let originalContent = content;
  let fixes = 0;

  for (const pattern of patterns) {
    const matches = content.match(pattern.regex);
    if (matches) {
      content = content.replace(pattern.regex, pattern.replacement);
      fixes += matches.length;
      console.log(`  Fixed ${matches.length} ${pattern.description} pattern(s)`);
    }
  }

  if (content !== originalContent) {
    fs.writeFileSync(fullPath, content, 'utf-8');
    console.log(`✓ Fixed ${fixes} errors in ${filePath}`);
    return fixes;
  }

  console.log(`  No matching patterns found in ${filePath}`);
  return 0;
}

// Main execution
console.log('🔧 Auto-fixing TypeScript binding element errors...\n');

const files = getFilesWithErrors();
console.log(`Found ${files.length} files with binding element errors\n`);

let totalFixes = 0;
for (const file of files) {
  console.log(`Processing: ${file}`);
  totalFixes += fixFile(file);
}

console.log(`\n✅ Total fixes applied: ${totalFixes}`);
console.log('Run "pnpm tsc --noEmit" to verify the error count.');
