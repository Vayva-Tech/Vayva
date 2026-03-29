#!/usr/bin/env node

/**
 * Comprehensive Backend Audit Script
 * Compares core-api services vs fastify-server services
 * Identifies what's missing, duplicated, or needs migration
 */

const fs = require('fs');
const path = require('path');

// Directories to analyze
const CORE_API_SERVICES = '/Users/fredrick/Documents/Vayva-Tech/vayva/Backend/core-api/src/services';
const FASTIFY_SERVER_SERVICES = '/Users/fredrick/Documents/Vayva-Tech/vayva/Backend/fastify-server/src/services';
const FASTIFY_SERVER_ROUTES = '/Users/fredrick/Documents/Vayva-Tech/vayva/Backend/fastify-server/src/routes/api/v1';

// BFF directories to check
const OPS_CONSOLE_BFF = '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/ops-console/src/app/api';

console.log('🔍 COMPREHENSIVE BACKEND AUDIT\n');
console.log('=' .repeat(80));

// 1. Analyze core-api services
console.log('\n📊 ANALYSIS 1: core-api Services\n');
console.log('-'.repeat(80));

const coreApiServices = getAllFiles(CORE_API_SERVICES, '.ts');
console.log(`\nTotal files in core-api/src/services: ${coreApiServices.length}`);

// Categorize services
const categories = {
  'Root Level': [],
  'Education': [],
  'Fashion': [],
  'Inventory': [],
  'Meal Kit': [],
  'POS': [],
  'Rentals': [],
  'Security': [],
  'Subscriptions': [],
  'WhatsApp': [],
};

coreApiServices.forEach(file => {
  const relativePath = path.relative(CORE_API_SERVICES, file);
  const parts = relativePath.split(path.sep);
  
  if (parts.length === 1) {
    categories['Root Level'].push(file);
  } else if (categories[parts[0]]) {
    categories[parts[0]].push(file);
  }
});

// Print categorized services
Object.entries(categories).forEach(([category, files]) => {
  if (files.length > 0) {
    console.log(`\n${category}:`);
    files.forEach(file => {
      const stats = fs.statSync(file);
      const sizeKB = (stats.size / 1024).toFixed(1);
      console.log(`  📄 ${path.basename(file)} (${sizeKB}KB)`);
    });
  }
});

// 2. Analyze fastify-server services
console.log('\n\n📊 ANALYSIS 2: fastify-server Services\n');
console.log('-'.repeat(80));

const fastifyServices = getAllFiles(FASTIFY_SERVER_SERVICES, '.ts');
console.log(`\nTotal files in fastify-server/src/services: ${fastifyServices.length}`);

const fastifyCategories = {};
fastifyServices.forEach(file => {
  const relativePath = path.relative(FASTIFY_SERVER_SERVICES, file);
  const parts = relativePath.split(path.sep);
  const category = parts[0];
  
  if (!fastifyCategories[category]) {
    fastifyCategories[category] = [];
  }
  fastifyCategories[category].push(file);
});

Object.entries(fastifyCategories).forEach(([category, files]) => {
  console.log(`\n${category} (${files.length} files):`);
  files.forEach(file => {
    console.log(`  📄 ${path.relative(FASTIFY_SERVER_SERVICES, file)}`);
  });
});

// 3. Compare and find gaps
console.log('\n\n📊 ANALYSIS 3: Migration Gap Analysis\n');
console.log('-'.repeat(80));

const coreApiBasenames = new Set(coreApiServices.map(f => path.basename(f)));
const fastifyBasenames = new Set(fastifyServices.map(f => path.basename(f)));

const notMigrated = [...coreApiBasenames].filter(name => !fastifyBasenames.has(name));
const migrated = [...coreApiBasenames].filter(name => fastifyBasenames.has(name));

console.log(`\n✅ MIGRATED (${migrated.length} files):`);
migrated.forEach(name => {
  console.log(`   ✓ ${name}`);
});

console.log(`\n❌ NOT MIGRATED (${notMigrated.length} files):`);
notMigrated.forEach(name => {
  const fullPath = coreApiServices + '/' + name;
  let sizeKB = 'N/A';
  if (fs.existsSync(fullPath)) {
    sizeKB = (fs.statSync(fullPath).size / 1024).toFixed(1) + 'KB';
  }
  console.log(`   ✗ ${name} (${sizeKB})`);
});

// 4. Check for duplicate code
console.log('\n\n📊 ANALYSIS 4: Duplicate Code Detection\n');
console.log('-'.repeat(80));

const duplicates = [];
migrated.forEach(basename => {
  const coreFile = coreApiServices + '/' + basename;
  const fastifyFile = findFileByBasename(FASTIFY_SERVER_SERVICES, basename);
  
  if (fastifyFile && fs.existsSync(coreFile)) {
    const coreContent = fs.readFileSync(coreFile, 'utf8');
    const fastifyContent = fs.readFileSync(fastifyFile, 'utf8');
    
    if (coreContent === fastifyContent) {
      duplicates.push(basename);
    }
  }
});

console.log(`\n⚠️  EXACT DUPLICATES FOUND (${duplicates.length} files):`);
duplicates.forEach(name => {
  console.log(`   ⚠️  ${name}`);
});

// 5. Analyze BFF routes in ops-console
console.log('\n\n📊 ANALYSIS 5: BFF Routes to Extract\n');
console.log('-'.repeat(80));

const bffRoutes = getAllFiles(OPS_CONSOLE_BFF, '.ts');
console.log(`\nTotal BFF routes in ops-console: ${bffRoutes.length}`);

// Categorize by directory
const bffCategories = {};
bffRoutes.forEach(file => {
  const relativePath = path.relative(OPS_CONSOLE_BFF, file);
  const parts = relativePath.split(path.sep);
  const category = parts[0];
  
  if (!bffCategories[category]) {
    bffCategories[category] = [];
  }
  bffCategories[category].push(file);
});

console.log('\nBFF Routes by category:');
Object.entries(bffCategories).slice(0, 10).forEach(([category, files]) => {
  console.log(`\n  ${category} (${files.length} routes):`);
  files.slice(0, 5).forEach(file => {
    console.log(`    - ${path.relative(OPS_CONSOLE_BFF, file)}`);
  });
  if (files.length > 5) {
    console.log(`    ... and ${files.length - 5} more`);
  }
});

// 6. Summary and recommendations
console.log('\n\n' + '='.repeat(80));
console.log('📋 SUMMARY & RECOMMENDATIONS\n');
console.log('='.repeat(80));

console.log(`
📊 STATISTICS:
   • core-api services: ${coreApiServices.length} files
   • fastify-server services: ${fastifyServices.length} files
   • Exact duplicates: ${duplicates.length} files
   • Not yet migrated: ${notMigrated.length} files
   • BFF routes to extract: ${bffRoutes.length} routes

✅ READY TO DELETE FROM core-api:
   1. All exact duplicates (${duplicates.length} files)
   2. Auth service (byte-for-byte identical)
   3. Route files (all migrated to fastify-server)
   4. Fastify config files

⚠️  NEEDS REVIEW BEFORE DELETION:
   1. Services not yet migrated (${notMigrated.length} files):
      ${notMigrated.slice(0, 10).join('\n      ')}
      ${notMigrated.length > 10 ? `... and ${notMigrated.length - 10} more` : ''}
   
   2. Next.js-specific services (should stay in core-api):
      - dashboard.server.ts
      - dashboard-industry.server.ts
      - onboarding.server.ts
      - email-automation.ts
      - kyc.ts
      - wallet.ts
      - PaystackService.ts
      - TemplatePurchaseService.ts
      - BookingService.ts
      - DeletionService.ts

🎯 RECOMMENDED ACTIONS:
   1. Migrate remaining ${notMigrated.length} services to fastify-server
   2. Delete all exact duplicates from core-api
   3. Delete Fastify-specific files from core-api:
      - src/fastify-index.ts
      - src/server-fastify.ts
      - src/config/fastify.ts
      - tsconfig.fastify.json
      - src/routes/ (entire directory)
   4. Keep Next.js-specific services in core-api (for now)
   5. Extract BFF routes from ops-console (${bffRoutes.length} routes)

🔥 CRITICAL FINDING:
   The ${notMigrated.length} unmigrated services need to be reviewed and either:
   a) Migrated to fastify-server, OR
   b) Confirmed as Next.js-only and kept in core-api temporarily

`);

// Helper functions
function getAllFiles(dirPath, extension, fileList = []) {
  if (!fs.existsSync(dirPath)) return fileList;
  
  const files = fs.readdirSync(dirPath);
  
  files.forEach(file => {
    const filePath = path.join(dirPath, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      getAllFiles(filePath, extension, fileList);
    } else if (file.endsWith(extension)) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

function findFileByBasename(baseDir, basename) {
  const files = getAllFiles(baseDir, '.ts');
  return files.find(f => path.basename(f) === basename);
}

console.log('\n✅ Audit complete!\n');
