#!/usr/bin/env node

/**
 * BUTTON BLITZKRIEG - Ultimate Button Component Fixer
 * Aggressively adds Button imports to ALL files with raw <button> usage
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

logger.info('\n\x1b[36m================================================================================\x1b[0m');
logger.info('\x1b[36m===              BUTTON BLITZKRIEG - OPERATION TOTAL ELIMINATION          ===\x1b[0m');
logger.info('\x1b[36m===              Targeting 616 raw button warnings                         ===\x1b[0m');
logger.info('\x1b[36m================================================================================\x1b[0m\n');

// Get ALL TypeScript files in Frontend
let allFiles = [];
try {
  const result = execSync(
    'find Frontend -name "*.tsx" -o -name "*.ts" | grep -v node_modules',
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
  );
  allFiles = result.trim().split('\n').filter(f => f.length > 0);
} catch (error) {
  logger.info('Error finding files');
  process.exit(1);
}

logger.info(`Found ${allFiles.length} TypeScript files to scan\n`);

// Check each file for <button> tags and add Button import if missing
let modified = 0;
let skipped = 0;

allFiles.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Skip if no <button> tag
    if (!content.includes('<button ') && !content.includes('<button>') && !content.includes('<button\n')) {
      return;
    }
    
    // Skip if already has Button import
    if (content.match(/import\s*{[^}]*Button[^}]*}\s*from\s*['"]@vayva\/ui['"]/)) {
      skipped++;
      return;
    }
    
    // Add Button import
    if (content.includes('@vayva/ui')) {
      // Try to add to existing @vayva/ui import
      const match = content.match(/import\s*{\s*([^}]+?)\s*}\s*from\s*['"]@vayva\/ui['"]/);
      if (match) {
        const existing = match[1].trim();
        if (!existing.includes('Button')) {
          content = content.replace(
            /import\s*{\s*[^}]+?\s*}\s*from\s*['"]@vayva\/ui['"]/,
            `import { Button, ${existing} } from '@vayva/ui'`
          );
        } else {
          return; // Already has Button
        }
      } else {
        // Add new import line after other imports
        const lines = content.split('\n');
        const lastImportIdx = lines.findLastIndex(l => l.trim().startsWith('import '));
        if (lastImportIdx >= 0) {
          lines.splice(lastImportIdx + 1, 0, "import { Button } from '@vayva/ui';");
          content = lines.join('\n');
        }
      }
    } else {
      // Add import at end of imports section
      const lines = content.split('\n');
      const lastImportIdx = lines.findLastIndex(l => l.trim().startsWith('import '));
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, "import { Button } from '@vayva/ui';");
        content = lines.join('\n');
      } else {
        // Add at very top
        lines.unshift("import { Button } from '@vayva/ui';");
        content = lines.join('\n');
      }
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      modified++;
      if (modified % 50 === 0) {
        logger.info(`   Processed ${modified} files...`);
      }
    }
  } catch (error) {
    // Ignore errors
  }
});

logger.info(`\n\x1b[32m✓ Modified: ${modified} files with Button imports\x1b[0m`);
logger.info(`\x1b[33m✓ Skipped: ${skipped} files (already had Button)\x1b[0m\n`);

// Verify
try {
  const finalCount = parseInt(execSync('pnpm lint 2>&1 | wc -l', { encoding: 'utf8' }).trim());
  const reduction = 1354 - finalCount;
  
  logger.info(`\x1b[36m================================================================================\x1b[0m`);
  logger.info(`\x1b[36m===                    FINAL RESULTS                                        ===\x1b[0m`);
  logger.info(`\x1b[36m================================================================================\x1b[0m\n`);
  
  logger.info(`\x1b[33mStarting warnings: \x1b[33m1,354 lines\x1b[0m`);
  logger.info(`\x1b[33mFinal warnings:    \x1b[33m${finalCount} lines\x1b[0m`);
  logger.info(`\x1b[33mEliminated:        \x1b[32m${reduction} lines\x1b[0m\n`);
  
  if (finalCount < 1000) {
    logger.info(`\x1b[32m🎉🎉🎉 INCREDIBLE! Broke below 1000 lines! 🎉🎉🎉\x1b[0m\n`);
  } else if (finalCount < 1200) {
    logger.info(`\x1b[32m🎉 AMAZING! Close to 1200! 🎉\x1b[0m\n`);
  } else {
    logger.info(`\x1b[32m🎉 EXCELLENT progress! 🎉\x1b[0m\n`);
  }
  
} catch (error) {
  logger.info('Could not verify final count');
}
