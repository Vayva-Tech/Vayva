#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Configuration
const CORE_API_ROUTES_DIR = path.join(__dirname, '..', 'Backend', 'core-api', 'src', 'routes');
const FASTIFY_ROUTES_DIR = path.join(__dirname, '..', 'Backend', 'fastify-server', 'src', 'routes');
const FASTIFY_SERVICES_DIR = path.join(__dirname, '..', 'Backend', 'fastify-server', 'src', 'services');

// Helper to extract function names from a file
function extractFunctions(content) {
  const functions = [];
  
  // Match route registrations: server.get(), server.post(), server.put(), server.patch(), server.delete()
  const routePattern = /server\.(get|post|put|patch|delete)\s*\(\s*['"`]([^'"`]+)['"`]/g;
  let match;
  while ((match = routePattern.exec(content)) !== null) {
    functions.push({
      type: match[1].toUpperCase(),
      path: match[2],
      line: content.substring(0, match.index).split('\n').length
    });
  }
  
  return functions;
}

// Helper to get all route files
function getRouteFiles(dir, extension = '.routes.ts') {
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
      files.push(...getRouteFiles(fullPath, extension));
    } else if (item.endsWith(extension)) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Analyze core-api routes
console.log('🔍 Analyzing core-api routes...\n');
const coreApiRouteFiles = getRouteFiles(CORE_API_ROUTES_DIR);
const coreApiRoutes = new Map();

for (const file of coreApiRouteFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const functions = extractFunctions(content);
  const relativePath = path.relative(CORE_API_ROUTES_DIR, file);
  
  if (functions.length > 0) {
    coreApiRoutes.set(relativePath, functions);
  }
}

console.log(`Found ${coreApiRouteFiles.length} route files in core-api`);
console.log(`Found ${Array.from(coreApiRoutes.values()).flat().length} total routes\n`);

// Analyze fastify-server routes
console.log('🔍 Analyzing fastify-server routes...\n');
const fastifyRouteFiles = getRouteFiles(FASTIFY_ROUTES_DIR);
const fastifyRoutes = new Map();

for (const file of fastifyRouteFiles) {
  const content = fs.readFileSync(file, 'utf-8');
  const functions = extractFunctions(content);
  const relativePath = path.relative(FASTIFY_ROUTES_DIR, file);
  
  if (functions.length > 0) {
    fastifyRoutes.set(relativePath, functions);
  }
}

console.log(`Found ${fastifyRouteFiles.length} route files in fastify-server`);
console.log(`Found ${Array.from(fastifyRoutes.values()).flat().length} total routes\n`);

// Compare routes
console.log('📊 COMPARISON RESULTS\n');
console.log('=' .repeat(80));

let missingCount = 0;
const missingRoutes = [];

for (const [coreFile, coreFunctions] of coreApiRoutes.entries()) {
  // Try to find corresponding fastify file
  let foundMatch = false;
  
  for (const [fastifyFile, fastifyFunctions] of fastifyRoutes.entries()) {
    // Check if filenames match (ignoring directory structure)
    const coreFilename = path.basename(coreFile);
    const fastifyFilename = path.basename(fastifyFile);
    
    if (coreFilename === fastifyFilename) {
      foundMatch = true;
      
      // Check if all core functions exist in fastify
      for (const coreFunc of coreFunctions) {
        const exists = fastifyFunctions.some(f => 
          f.type === coreFunc.type && f.path === coreFunc.path
        );
        
        if (!exists) {
          missingCount++;
          missingRoutes.push({
            file: coreFile,
            type: coreFunc.type,
            path: coreFunc.path,
            line: coreFunc.line
          });
        }
      }
      break;
    }
  }
  
  if (!foundMatch) {
    // No matching file found - all routes are missing
    for (const coreFunc of coreFunctions) {
      missingCount++;
      missingRoutes.push({
        file: coreFile,
        type: coreFunc.type,
        path: coreFunc.path,
        line: coreFunc.line,
        note: 'No corresponding file in fastify-server'
      });
    }
  }
}

// Report missing routes
if (missingCount > 0) {
  console.log(`\n❌ MISSING ROUTES DETECTED: ${missingCount}\n`);
  console.log('=' .repeat(80));
  
  // Group by file
  const byFile = {};
  for (const route of missingRoutes) {
    if (!byFile[route.file]) {
      byFile[route.file] = [];
    }
    byFile[route.file].push(route);
  }
  
  for (const [file, routes] of Object.entries(byFile)) {
    console.log(`\n📁 File: ${file}`);
    console.log('-'.repeat(80));
    
    for (const route of routes) {
      console.log(`   ${route.type.padEnd(6)} ${route.path}`);
      if (route.note) {
        console.log(`         ⚠️  ${route.note}`);
      }
    }
  }
  
  console.log('\n' + '='.repeat(80));
  console.log(`\n📋 SUMMARY: ${missingCount} route(s) missing from fastify-server\n`);
  
  process.exit(1);
} else {
  console.log('✅ ALL CORE-API ROUTES FOUND IN FASTIFY-SERVER!\n');
  console.log('🎉 No missing functions detected.\n');
  process.exit(0);
}
