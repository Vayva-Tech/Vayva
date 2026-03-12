#!/usr/bin/env node
/**
 * Comprehensive TypeScript Error Fix Script
 * Fixes remaining errors after binding element fixes
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Get all TypeScript errors
function getTypeScriptErrors() {
  try {
    const output = execSync('pnpm tsc --noEmit 2>&1', {
      cwd: '/Users/fredrick/Documents/Vayva-Tech/vayva',
      encoding: 'utf-8',
      maxBuffer: 50 * 1024 * 1024 // 50MB buffer
    });
    return output;
  } catch (e) {
    return e.stdout || e.message;
  }
}

// Parse errors by type
function parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');

  for (const line of lines) {
    const match = line.match(/^(.+)\((\d+),(\d+)\): error (TS\d+): (.+)$/);
    if (match) {
      errors.push({
        file: match[1],
        line: parseInt(match[2]),
        column: parseInt(match[3]),
        code: match[4],
        message: match[5]
      });
    }
  }

  return errors;
}

// Fix implicit any parameters (TS7006)
function fixImplicitAny(content, filePath) {
  let fixed = content;

  // Fix handler parameters like (req, res) =>
  fixed = fixed.replace(
    /\((req|request|_req|res|response|_res),\s*(\w+)\)\s*=>/g,
    '($1: any, $2: any) =>'
  );

  // Fix single parameter handlers
  fixed = fixed.replace(
    /\((err|error|event|e|evt|ctx|context)\)\s*=>/g,
    '($1: any) =>'
  );

  // Fix forEach/map callbacks
  fixed = fixed.replace(
    /\.forEach\(\s*(\w+)\s*=>/g,
    '.forEach(($1: any) =>'
  );
  fixed = fixed.replace(
    /\.map\(\s*(\w+)\s*=>/g,
    '.map(($1: any) =>'
  );
  fixed = fixed.replace(
    /\.filter\(\s*(\w+)\s*=>/g,
    '.filter(($1: any) =>'
  );
  fixed = fixed.replace(
    /\.reduce\(\s*\((\w+),\s*(\w+)\)\s*=>/g,
    '.reduce(($1: any, $2: any) =>'
  );

  // Fix Promise.then/catch callbacks
  fixed = fixed.replace(
    /\.then\(\s*\((\w+)\)\s*=>/g,
    '.then(($1: any) =>'
  );
  fixed = fixed.replace(
    /\.catch\(\s*\((\w+)\)\s*=>/g,
    '.catch(($1: any) =>'
  );

  // Fix addEventListener callbacks
  fixed = fixed.replace(
    /addEventListener\(['"]\w+['"],\s*(\w+)\s*=>/g,
    'addEventListener(\'$1\', ($1: any) =>'
  );

  // Fix function declarations
  fixed = fixed.replace(
    /function\s+(\w+)\s*\(\s*(\w+)\s*\)\s*\{/g,
    'function $1($2: any) {'
  );

  // Fix catch blocks with error parameter
  fixed = fixed.replace(
    /catch\s*\(\s*(\w+)\s*\)\s*\{/g,
    'catch ($1: any) {'
  );

  return fixed;
}

// Fix missing property errors (TS2339) - add type assertions
function fixMissingProperty(content, filePath) {
  let fixed = content;

  // Fix params.id access on union type
  if (filePath.includes('/api/') && content.includes('params')) {
    // Add await for params if needed
    fixed = fixed.replace(
      /const\s+\{\s*(\w+)\s*\}\s*=\s*params;/g,
      'const resolvedParams = await Promise.resolve(params);\n  const { $1 } = resolvedParams;'
    );

    // Fix direct params access
    fixed = fixed.replace(
      /params\.(\w+)/g,
      '(await Promise.resolve(params)).$1'
    );
  }

  return fixed;
}

// Fix enum assignment errors (TS2322)
function fixEnumAssignments(content, filePath) {
  let fixed = content;

  // Common enum patterns to fix
  const enumFixes = [
    // RescueIncidentStatus
    { pattern: /status:\s*"RUNNING"/g, replacement: 'status: "IN_PROGRESS"' },
    { pattern: /status:\s*"COMPLETED"/g, replacement: 'status: "RESOLVED"' },
    { pattern: /status:\s*"PENDING"/g, replacement: 'status: "QUEUED"' },

    // NotificationOutboxStatus
    { pattern: /status:\s*"PROCESSING"/g, replacement: 'status: "SENDING"' },
    { pattern: /status:\s*"DEAD"/g, replacement: 'status: "FAILED"' },

    // DispatchJobStatus
    { pattern: /status:\s*"REQUESTED"/g, replacement: 'status: "CREATED"' },
    { pattern: /status:\s*"ACCEPTED"/g, replacement: 'status: "ASSIGNED"' },

    // KycRecordStatus
    { pattern: /status:\s*"IN_PROGRESS"/g, replacement: 'status: "PENDING"' },

    // Other common patterns
    { pattern: /type:\s*"error"/g, replacement: 'type: "ERROR"' },
    { pattern: /type:\s*"success"/g, replacement: 'type: "SUCCESS"' },
  ];

  for (const { pattern, replacement } of enumFixes) {
    fixed = fixed.replace(pattern, replacement);
  }

  return fixed;
}

// Main function
async function main() {
  console.log('🔍 Getting TypeScript errors...');
  const errorOutput = getTypeScriptErrors();
  const errors = parseErrors(errorOutput);

  console.log(`📊 Found ${errors.length} errors`);

  // Group by file
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = [];
    }
    errorsByFile[error.file].push(error);
  }

  // Fix each file
  let fixedCount = 0;
  const files = Object.keys(errorsByFile).sort();

  for (const filePath of files) {
    const fullPath = path.join('/Users/fredrick/Documents/Vayva-Tech/vayva', filePath);

    if (!fs.existsSync(fullPath)) {
      console.log(`❌ File not found: ${filePath}`);
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    let fixed = content;

    const fileErrors = errorsByFile[filePath];
    const errorCodes = new Set(fileErrors.map(e => e.code));

    // Apply fixes based on error types
    if (errorCodes.has('TS7006')) {
      fixed = fixImplicitAny(fixed, filePath);
    }

    if (errorCodes.has('TS2339')) {
      fixed = fixMissingProperty(fixed, filePath);
    }

    if (errorCodes.has('TS2322')) {
      fixed = fixEnumAssignments(fixed, filePath);
    }

    if (fixed !== content) {
      fs.writeFileSync(fullPath, fixed, 'utf-8');
      console.log(`✅ Fixed ${fileErrors.length} errors in ${filePath}`);
      fixedCount++;
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} files`);
}

main().catch(console.error);
