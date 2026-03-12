#!/usr/bin/env node
/**
 * Analyze TS2307 errors - Cannot find module
 */
const fs = require('fs');
const path = require('path');

const MARKETING_DIR = '/Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/marketing';

// Run tsc and capture TS2307 errors
const { execSync } = require('child_process');

try {
  const output = execSync('pnpm tsc --noEmit 2>&1', {
    cwd: '/Users/fredrick/Documents/Vayva-Tech/vayva',
    encoding: 'utf-8',
    maxBuffer: 10 * 1024 * 1024
  });

  const lines = output.split('\n');
  const ts2307Errors = lines.filter(line => line.includes('TS2307'));

  console.log(`Found ${ts2307Errors.length} TS2307 errors\n`);

  // Parse errors and check if files exist
  const errorsByFile = {};

  for (const error of ts2307Errors.slice(0, 50)) {
    // Extract the importing file and the module it tried to import
    const match = error.match(/(.+?)\(\d+,\d+\):.*Cannot find module ['"](.+?)['"]/);
    if (match) {
      const [, importingFile, modulePath] = match;
      const cleanPath = importingFile.replace(/^\s*/, '');

      // Convert @/ path to actual path
      if (modulePath.startsWith('@/')) {
        const actualPath = modulePath.replace('@/', './src/');
        const fullPath = path.join(MARKETING_DIR, actualPath);
        const exists = fs.existsSync(fullPath) || fs.existsSync(fullPath + '.tsx') || fs.existsSync(fullPath + '.ts');

        if (!exists) {
          // Check if it's a .tsx file
          const tsxPath = fullPath + '.tsx';
          const tsPath = fullPath + '.ts';
          const existsTsx = fs.existsSync(tsxPath);
          const existsTs = fs.existsSync(tsPath);

          if (!existsTsx && !existsTs) {
            console.log(`❌ MISSING: ${modulePath}`);
            console.log(`   Importing from: ${cleanPath}`);
            console.log(`   Expected at: ${tsxPath.replace(MARKETING_DIR, '')}`);
            console.log();
          } else {
            console.log(`✅ EXISTS: ${modulePath}`);
          }
        } else {
          console.log(`✅ EXISTS: ${modulePath}`);
        }
      }
    }
  }

} catch (e) {
  console.error('Error running tsc:', e.message);
}
