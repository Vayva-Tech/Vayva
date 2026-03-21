/**
 * Desktop Application Build Verification Test
 * 
 * This script verifies that the desktop application structure is correct
 * and ready for building. Run this before attempting to build.
 */

import { existsSync } from 'fs';
import { join } from 'path';

const requiredFiles = [
  'package.json',
  'tsconfig.json',
  'electron-builder.yml',
  'src/main.ts',
  'src/preload.ts',
  'src/db/database.ts',
];

const requiredDirs = [
  'src',
  'build',
  'public',
];

console.log('🔍 Verifying Vayva Desktop Application Setup...\n');

let allGood = true;

// Check required files
console.log('📄 Checking required files:');
requiredFiles.forEach(file => {
  const filePath = join(__dirname, '..', file);
  if (existsSync(filePath)) {
    console.log(`   ✅ ${file}`);
  } else {
    console.log(`   ❌ ${file} - MISSING`);
    allGood = false;
  }
});

console.log('\n📁 Checking required directories:');
requiredDirs.forEach(dir => {
  const dirPath = join(__dirname, '..', dir);
  if (existsSync(dirPath)) {
    console.log(`   ✅ ${dir}/`);
  } else {
    console.log(`   ❌ ${dir}/ - MISSING`);
    allGood = false;
  }
});

// Check dependencies
console.log('\n📦 Checking package.json dependencies:');
try {
  const pkg = require('../package.json');
  const requiredDeps = ['electron', 'electron-builder', 'better-sqlite3'];
  
  requiredDeps.forEach(dep => {
    if (pkg.dependencies?.[dep] || pkg.devDependencies?.[dep]) {
      console.log(`   ✅ ${dep}`);
    } else {
      console.log(`   ⚠️  ${dep} - Not in dependencies`);
    }
  });
} catch (error) {
  console.log('   ❌ Could not read package.json');
  allGood = false;
}

// Summary
console.log('\n' + '='.repeat(50));
if (allGood) {
  console.log('✅ All checks passed! Ready to build.');
  console.log('\nNext steps:');
  console.log('   1. Install dependencies: pnpm install');
  console.log('   2. Build TypeScript: pnpm run build');
  console.log('   3. Build installer: pnpm run build:win (or build:mac)');
} else {
  console.log('❌ Some checks failed. Please fix the issues above.');
  process.exit(1);
}
