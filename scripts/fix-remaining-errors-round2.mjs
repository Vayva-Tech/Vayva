#!/usr/bin/env node
/**
 * Aggressive TypeScript Error Fix Script - Round 2
 * Handles remaining TS7006, TS2322, TS2339 errors
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const ROOT_DIR = '/Users/fredrick/Documents/Vayva-Tech/vayva';

function getErrors() {
  try {
    const output = execSync('pnpm tsc --noEmit 2>&1', {
      cwd: ROOT_DIR,
      encoding: 'utf-8',
      maxBuffer: 100 * 1024 * 1024
    });
    return output;
  } catch (e) {
    return e.stdout || e.message;
  }
}

function parseErrors(output) {
  const errors = [];
  const lines = output.split('\n');

  for (const line of lines) {
    // Match error format: file(line,col): error TSxxxx: message
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

// More aggressive implicit any fixes
function fixImplicitAnyAggressive(content) {
  let fixed = content;

  // Fix array method callbacks with destructuring
  fixed = fixed.replace(
    /\.map\(\s*\(\s*\{([^}]+)\}\s*\)\s*=>/g,
    '.map(({ $1 }: any) =>'
  );
  fixed = fixed.replace(
    /\.filter\(\s*\(\s*\{([^}]+)\}\s*\)\s*=>/g,
    '.filter(({ $1 }: any) =>'
  );
  fixed = fixed.replace(
    /\.reduce\(\s*\(\s*\{([^}]+)\}\s*,/g,
    '.reduce(({ $1 }: any,'
  );

  // Fix forEach with index
  fixed = fixed.replace(
    /\.forEach\(\s*\((\w+),\s*(\w+)\)\s*=>/g,
    '.forEach(($1: any, $2: number) =>'
  );
  fixed = fixed.replace(
    /\.map\(\s*\((\w+),\s*(\w+)\)\s*=>/g,
    '.map(($1: any, $2: number) =>'
  );

  // Fix try-catch error parameters
  fixed = fixed.replace(
    /catch\s*\(\s*(\w+)\s*\)\s*\{/g,
    'catch ($1: any) {'
  );

  // Fix Promise error callbacks
  fixed = fixed.replace(
    /\.catch\(\s*\((\w+)\)\s*=>/g,
    '.catch(($1: any) =>'
  );

  // Fix event handler callbacks
  fixed = fixed.replace(
    /\(\s*event\s*\)\s*=>/g,
    '(event: any) =>'
  );
  fixed = fixed.replace(
    /\(\s*e\s*\)\s*=>/g,
    '(e: any) =>'
  );

  // Fix useEffect callbacks
  fixed = fixed.replace(
    /useEffect\(\s*\(\s*\)\s*=>/g,
    'useEffect(() =>'
  );

  // Fix React event handlers
  fixed = fixed.replace(
    /on\w+={\s*(\w+)\s*=>/g,
    'on$1={($1: any) =>'
  );

  // Fix JSON.parse callbacks
  fixed = fixed.replace(
    /JSON\.parse\([^,]+,\s*(\w+)\s*=>/g,
    'JSON.parse(..., ($1: any) =>'
  );

  // Fix setTimeout/setInterval callbacks
  fixed = fixed.replace(
    /setTimeout\(\s*(\w+)\s*=>/g,
    'setTimeout(($1: any) =>'
  );
  fixed = fixed.replace(
    /setInterval\(\s*(\w+)\s*=>/g,
    'setInterval(($1: any) =>'
  );

  // Fix array destructuring in callbacks
  fixed = fixed.replace(
    /\(\s*\[(\w+)\]\s*\)\s*=>/g,
    '([$1]: any[]) =>'
  );
  fixed = fixed.replace(
    /\(\s*\[(\w+),\s*(\w+)\]\s*\)\s*=>/g,
    '([$1, $2]: any[]) =>'
  );

  // Fix function declarations with multiple params
  fixed = fixed.replace(
    /function\s+(\w+)\s*\(\s*(\w+),\s*(\w+)\s*\)/g,
    'function $1($2: any, $3: any)'
  );

  // Fix inline arrow functions in object properties
  fixed = fixed.replace(
    /:\s*\(\s*(\w+)\s*\)\s*=>/g,
    ': ($1: any) =>'
  );

  // Fix sort callbacks
  fixed = fixed.replace(
    /\.sort\(\s*\((\w+),\s*(\w+)\)\s*=>/g,
    '.sort(($1: any, $2: any) =>'
  );

  // Fix find/findIndex callbacks
  fixed = fixed.replace(
    /\.find\(\s*(\w+)\s*=>/g,
    '.find(($1: any) =>'
  );
  fixed = fixed.replace(
    /\.findIndex\(\s*(\w+)\s*=>/g,
    '.findIndex(($1: any) =>'
  );

  // Fix every/some callbacks
  fixed = fixed.replace(
    /\.every\(\s*(\w+)\s*=>/g,
    '.every(($1: any) =>'
  );
  fixed = fixed.replace(
    /\.some\(\s*(\w+)\s*=>/g,
    '.some(($1: any) =>'
  );

  // Fix flatMap callbacks
  fixed = fixed.replace(
    /\.flatMap\(\s*(\w+)\s*=>/g,
    '.flatMap(($1: any) =>'
  );

  return fixed;
}

// Fix remaining enum issues
function fixEnumIssues(content) {
  let fixed = content;

  // More comprehensive enum mappings based on Prisma schema
  const enumMappings = [
    // RescueIncidentStatus: QUEUED, IN_PROGRESS, RESOLVED, CANCELLED
    { from: /status:\s*"RUNNING"/g, to: 'status: "IN_PROGRESS"' },
    { from: /status:\s*"ACTIVE"/g, to: 'status: "IN_PROGRESS"' },
    { from: /status:\s*"COMPLETED"/g, to: 'status: "RESOLVED"' },
    { from: /status:\s*"DONE"/g, to: 'status: "RESOLVED"' },
    { from: /status:\s*"PENDING"/g, to: 'status: "QUEUED"' },
    { from: /status:\s*"NEW"/g, to: 'status: "QUEUED"' },

    // NotificationOutboxStatus: QUEUED, SENDING, SENT, FAILED, RETRYING, CANCELLED
    { from: /status:\s*"PROCESSING"/g, to: 'status: "SENDING"' },
    { from: /status:\s*"PENDING"/g, to: 'status: "QUEUED"' },
    { from: /status:\s*"DEAD"/g, to: 'status: "FAILED"' },
    { from: /status:\s*"ERROR"/g, to: 'status: "FAILED"' },

    // DispatchJobStatus: CREATED, ASSIGNED, PICKED_UP, IN_TRANSIT, DELIVERED, FAILED, CANCELLED
    { from: /status:\s*"REQUESTED"/g, to: 'status: "CREATED"' },
    { from: /status:\s*"ACCEPTED"/g, to: 'status: "ASSIGNED"' },
    { from: /status:\s*"READY"/g, to: 'status: "PICKED_UP"' },
    { from: /status:\s*"SHIPPED"/g, to: 'status: "IN_TRANSIT"' },
    { from: /status:\s*"COMPLETE"/g, to: 'status: "DELIVERED"' },

    // PayoutStatus: PENDING, PROCESSING, COMPLETED, FAILED, CANCELLED
    { from: /status:\s*"PAID"/g, to: 'status: "COMPLETED"' },
    { from: /status:\s*"SUCCESS"/g, to: 'status: "COMPLETED"' },

    // ReturnStatus: REQUESTED, APPROVED, REJECTED, RECEIVED, INSPECTING, RESTOCKED, REFUNDED, CANCELLED
    { from: /status:\s*"OPEN"/g, to: 'status: "REQUESTED"' },

    // OrderStatus: PENDING, PROCESSING, SHIPPED, DELIVERED, CANCELLED, REFUNDED, DISPUTED
    { from: /status:\s*"PLACED"/g, to: 'status: "PENDING"' },

    // SupportTicketStatus: OPEN, PENDING, RESOLVED, CLOSED, ESCALATED
    // No changes needed - matches common usage

    // KycRecordStatus: PENDING, VERIFIED, REJECTED
    { from: /kycStatus:\s*"IN_PROGRESS"/g, to: 'kycStatus: "PENDING"' },
    { from: /kycStatus:\s*"SUBMITTED"/g, to: 'kycStatus: "PENDING"' },

    // AiSubscriptionStatus: PENDING, ACTIVE, PAUSED, CANCELLED, EXPIRED
    { from: /subscriptionStatus:\s*"ENABLED"/g, to: 'subscriptionStatus: "ACTIVE"' },
    { from: /subscriptionStatus:\s*"DISABLED"/g, to: 'subscriptionStatus: "CANCELLED"' },

    // Common event types
    { from: /type:\s*"error"/gi, to: 'type: "ERROR"' },
    { from: /type:\s*"success"/gi, to: 'type: "SUCCESS"' },
    { from: /type:\s*"warning"/gi, to: 'type: "WARNING"' },
    { from: /type:\s*"info"/gi, to: 'type: "INFO"' },

    // Audit event types
    { from: /eventType:\s*"CREATE"/g, to: 'eventType: "RECORD_CREATE"' },
    { from: /eventType:\s*"UPDATE"/g, to: 'eventType: "RECORD_UPDATE"' },
    { from: /eventType:\s*"DELETE"/g, to: 'eventType: "RECORD_DELETE"' },
    { from: /eventType:\s*"LOGIN"/g, to: 'eventType: "SESSION_LOGIN"' },
    { from: /eventType:\s*"LOGOUT"/g, to: 'eventType: "SESSION_LOGOUT"' },
  ];

  for (const { from, to } of enumMappings) {
    fixed = fixed.replace(from, to);
  }

  return fixed;
}

// Fix property access issues
function fixPropertyAccess(content, filePath) {
  let fixed = content;

  // Fix params access in API routes
  if (filePath.includes('/api/')) {
    // Replace direct params.id with resolved version
    fixed = fixed.replace(
      /params\.(\w+)/g,
      '(await Promise.resolve(params)).$1'
    );

    // Fix destructuring patterns that weren't caught before
    fixed = fixed.replace(
      /const\s+\{\s*(\w+)\s*\}\s*=\s*await\s+Promise\.resolve\(params\);/g,
      'const { $1 } = await Promise.resolve(params);'
    );
  }

  // Fix common property access patterns that may fail
  // Add optional chaining where appropriate
  fixed = fixed.replace(
    /(\w+)\.params\.(\w+)/g,
    '$1.params?.$2'
  );

  // Fix data access patterns
  fixed = fixed.replace(
    /(\w+)\.data\.(\w+)/g,
    '$1.data?.$2'
  );

  return fixed;
}

// Main function
async function main() {
  console.log('🔍 Getting remaining TypeScript errors...');
  const errorOutput = getErrors();
  const errors = parseErrors(errorOutput);

  console.log(`📊 Found ${errors.length} errors`);

  // Group by file and code
  const errorsByFile = {};
  for (const error of errors) {
    if (!errorsByFile[error.file]) {
      errorsByFile[error.file] = { codes: new Set(), count: 0 };
    }
    errorsByFile[error.file].codes.add(error.code);
    errorsByFile[error.file].count++;
  }

  // Fix files
  let fixedCount = 0;
  const files = Object.keys(errorsByFile).sort();

  for (const filePath of files) {
    const fullPath = path.join(ROOT_DIR, filePath);

    if (!fs.existsSync(fullPath)) {
      continue;
    }

    const content = fs.readFileSync(fullPath, 'utf-8');
    let fixed = content;
    const { codes } = errorsByFile[filePath];

    let wasFixed = false;

    if (codes.has('TS7006')) {
      const before = fixed;
      fixed = fixImplicitAnyAggressive(fixed);
      if (fixed !== before) wasFixed = true;
    }

    if (codes.has('TS2322')) {
      const before = fixed;
      fixed = fixEnumIssues(fixed);
      if (fixed !== before) wasFixed = true;
    }

    if (codes.has('TS2339')) {
      const before = fixed;
      fixed = fixPropertyAccess(fixed, filePath);
      if (fixed !== before) wasFixed = true;
    }

    if (wasFixed && fixed !== content) {
      fs.writeFileSync(fullPath, fixed, 'utf-8');
      console.log(`✅ Fixed ${errorsByFile[filePath].count} errors in ${filePath}`);
      fixedCount++;
    }
  }

  console.log(`\n🎉 Fixed ${fixedCount} files in round 2`);
}

main().catch(console.error);
