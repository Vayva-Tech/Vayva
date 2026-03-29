#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CORE_API_SERVICES_DIR = path.join(__dirname, '..', 'Backend', 'core-api', 'src', 'services');
const FASTIFY_SERVICES_DIR = path.join(__dirname, '..', 'Backend', 'fastify-server', 'src', 'services');
const CORE_API_ROUTES_DIR = path.join(__dirname, '..', 'Backend', 'core-api', 'src', 'routes');
const FASTIFY_ROUTES_DIR = path.join(__dirname, '..', 'Backend', 'fastify-server', 'src', 'routes');

// Helper to extract class/function names from a file
function extractClasses(content) {
  const classes = [];
  
  // Match export class ClassName
  const classPattern = /export\s+class\s+(\w+)/g;
  let match;
  while ((match = classPattern.exec(content)) !== null) {
    classes.push({
      name: match[1],
      type: 'class',
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  // Match export async function Name or export function Name
  const funcPattern = /export\s+(async\s+)?function\s+(\w+)/g;
  while ((match = funcPattern.exec(content)) !== null) {
    classes.push({
      name: match[2],
      type: 'function',
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return classes;
}

// Helper to extract route handlers from route files
function extractRoutes(content) {
  const routes = [];
  
  // Match server.get(), server.post(), etc.
  const routePattern = /server\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = routePattern.exec(content)) !== null) {
    routes.push({
      method: match[1].toUpperCase(),
      path: match[2],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return routes;
}

// Helper to get all TypeScript files
function getTSFiles(dir) {
  const files = [];
  
  if (!fs.existsSync(dir)) {
    console.warn(`⚠️  Directory not found: ${dir}`);
    return files;
  }
  
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      files.push(...getTSFiles(fullPath));
    } else if (item.endsWith('.ts') && !item.endsWith('.test.ts') && !item.endsWith('.spec.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

console.log('=' .repeat(80));
console.log('🔍 COMPREHENSIVE CORE-API TO FASTIFY-SERVER AUDIT');
console.log('=' .repeat(80));
console.log();

// ===== PART 1: SERVICES AUDIT =====
console.log('📦 PART 1: SERVICES AUDIT\n');

const coreApiServiceFiles = getTSFiles(CORE_API_SERVICES_DIR);
const fastifyServiceFiles = getTSFiles(FASTIFY_SERVICES_DIR);

console.log(`Core-api services files: ${coreApiServiceFiles.length}`);
console.log(`Fastify-server services files: ${fastifyServiceFiles.length}`);
console.log();

// Extract classes/functions from core-api services
const coreApiServices = new Map();
for (const file of coreApiServiceFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const classes = extractClasses(content);
  if (classes.length > 0) {
    const relativePath = path.relative(CORE_API_SERVICES_DIR, file);
    coreApiServices.set(relativePath, {
      fileName: path.basename(file),
      classes
    });
  }
}

// Extract classes/functions from fastify-server services
const fastifyServices = new Map();
for (const file of fastifyServiceFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const classes = extractClasses(content);
  if (classes.length > 0) {
    const relativePath = path.relative(FASTIFY_SERVICES_DIR, file);
    fastifyServices.set(relativePath, {
      fileName: path.basename(file),
      classes
    });
  }
}

// Compare services
let missingServicesCount = 0;
const missingServices = [];

for (const [coreFile, coreData] of coreApiServices.entries()) {
  let foundMatch = false;
  
  // Try to find matching file in fastify
  for (const [fastifyFile, fastifyData] of fastifyServices.entries()) {
    if (path.basename(coreFile) === path.basename(fastifyFile)) {
      foundMatch = true;
      
      // Check if all classes/functions exist
      for (const coreClass of coreData.classes) {
        const exists = fastifyData.classes.some(f => f.name === coreClass.name);
        if (!exists) {
          missingServicesCount++;
          missingServices.push({
            file: coreFile,
            name: coreClass.name,
            type: coreClass.type,
            note: `Class/function "${coreClass.name}" missing in ${fastifyFile}`
          });
        }
      }
      break;
    }
  }
  
  if (!foundMatch) {
    // No matching file - check if it's a critical service
    const isCritical = !coreFile.includes('__tests__') && 
                       !coreFile.includes('.test.') &&
                       !coreFile.includes('.spec.');
    
    if (isCritical) {
      for (const coreClass of coreData.classes) {
        missingServicesCount++;
        missingServices.push({
          file: coreFile,
          name: coreClass.name,
          type: coreClass.type,
          note: `No corresponding file in fastify-server`
        });
      }
    }
  }
}

if (missingServicesCount > 0) {
  console.log(`❌ MISSING SERVICES/CLASSES: ${missingServicesCount}\n`);
  console.log('-'.repeat(80));
  
  const byFile = {};
  for (const svc of missingServices) {
    if (!byFile[svc.file]) {
      byFile[svc.file] = [];
    }
    byFile[svc.file].push(svc);
  }
  
  for (const [file, items] of Object.entries(byFile)) {
    console.log(`\n📁 ${file}`);
    for (const item of items) {
      console.log(`   - ${item.type.toUpperCase()}: ${item.name}`);
      console.log(`     ⚠️  ${item.note}`);
    }
  }
  console.log();
} else {
  console.log('✅ All core services found in fastify-server!\n');
}

// ===== PART 2: ROUTES AUDIT =====
console.log('🛣️  PART 2: ROUTES AUDIT\n');

const coreApiRouteFiles = getTSFiles(CORE_API_ROUTES_DIR).filter(f => f.endsWith('.routes.ts'));
const fastifyRouteFiles = getTSFiles(FASTIFY_ROUTES_DIR).filter(f => f.endsWith('.routes.ts'));

console.log(`Core-api route files: ${coreApiRouteFiles.length}`);
console.log(`Fastify-server route files: ${fastifyRouteFiles.length}`);
console.log();

// Extract routes from core-api
const coreApiRoutes = new Map();
for (const file of coreApiRouteFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const routes = extractRoutes(content);
  if (routes.length > 0) {
    const relativePath = path.relative(CORE_API_ROUTES_DIR, file);
    coreApiRoutes.set(relativePath, routes);
  }
}

// Extract routes from fastify-server
const fastifyRoutes = new Map();
for (const file of fastifyRouteFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const routes = extractRoutes(content);
  if (routes.length > 0) {
    const relativePath = path.relative(FASTIFY_ROUTES_DIR, file);
    fastifyRoutes.set(relativePath, routes);
  }
}

// Compare routes
let missingRoutesCount = 0;
const missingRoutes = [];

for (const [coreFile, coreFileRoutes] of coreApiRoutes.entries()) {
  let foundMatch = false;
  
  for (const [fastifyFile, fastifyFileRoutes] of fastifyRoutes.entries()) {
    if (path.basename(coreFile) === path.basename(fastifyFile)) {
      foundMatch = true;
      
      for (const coreRoute of coreFileRoutes) {
        const exists = fastifyFileRoutes.some(f => 
          f.method === coreRoute.method && f.path === coreRoute.path
        );
        
        if (!exists) {
          missingRoutesCount++;
          missingRoutes.push({
            file: coreFile,
            method: coreRoute.method,
            path: coreRoute.path,
            note: `Route missing in ${fastifyFile}`
          });
        }
      }
      break;
    }
  }
  
  if (!foundMatch) {
    for (const coreRoute of coreFileRoutes) {
      missingRoutesCount++;
      missingRoutes.push({
        file: coreFile,
        method: coreRoute.method,
        path: coreRoute.path,
        note: 'No corresponding file in fastify-server'
      });
    }
  }
}

if (missingRoutesCount > 0) {
  console.log(`❌ MISSING ROUTES: ${missingRoutesCount}\n`);
  console.log('-'.repeat(80));
  
  const byFile = {};
  for (const route of missingRoutes) {
    if (!byFile[route.file]) {
      byFile[route.file] = [];
    }
    byFile[route.file].push(route);
  }
  
  for (const [file, routes] of Object.entries(byFile)) {
    console.log(`\n📁 ${file}`);
    for (const route of routes) {
      console.log(`   ${route.method.padEnd(6)} ${route.path}`);
      console.log(`         ⚠️  ${route.note}`);
    }
  }
  console.log();
} else {
  console.log('✅ All core-api routes found in fastify-server!\n');
}

// ===== FINAL SUMMARY =====
console.log('=' .repeat(80));
console.log('📊 FINAL SUMMARY');
console.log('=' .repeat(80));
console.log();

const totalMissing = missingServicesCount + missingRoutesCount;

if (totalMissing === 0) {
  console.log('🎉 PERFECT! ALL FUNCTIONS MIGRATED SUCCESSFULLY!');
  console.log();
  console.log('✅ All services/classes migrated');
  console.log('✅ All routes/endpoints migrated');
  console.log();
  process.exit(0);
} else {
  console.log(`❌ TOTAL MISSING FUNCTIONS: ${totalMissing}`);
  console.log();
  console.log(`   - Services/Classes: ${missingServicesCount}`);
  console.log(`   - Routes: ${missingRoutesCount}`);
  console.log();
  console.log('⚠️  Review the missing items above and migrate them to fastify-server');
  console.log();
  process.exit(1);
}
