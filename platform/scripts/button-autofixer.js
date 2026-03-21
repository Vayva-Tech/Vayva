#!/usr/bin/env node

/**
 * BUTTON AUTO-FIXER
 * Directly fixes all raw <button> usage by adding Button imports
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

logger.info('\n\x1b[36m=== BUTTON AUTO-FIXER ===\x1b[0m\n');

// Get lint output and parse file paths
let rawOutput = '';
try {
  rawOutput = execSync('pnpm lint 2>&1 || true', { encoding: 'utf8', maxBuffer: 500 * 1024 * 1024 });
} catch (error) {
  logger.info('Error running lint');
  process.exit(1);
}

// Extract files with no-restricted-syntax warnings
const lines = rawOutput.split('\n');
const filesToFix = new Set();

for (const line of lines) {
  if (line.includes('no-restricted-syntax') && line.includes('<button>')) {
    // Extract file path - it's usually at the end of the line or in a specific format
    const match = line.match(/([^\s]+\.tsx?)[:\s]/);
    if (match && fs.existsSync(match[1])) {
      filesToFix.add(match[1]);
    }
  }
}

logger.info(`Found ${filesToFix.size} files with raw <button> usage\n`);

let fixed = 0;
filesToFix.forEach(filePath => {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Skip if already has Button import
    if (content.includes('import { Button }') || 
        content.includes('import{Button}') ||
        content.includes('import { Button,') ||
        content.includes(', Button }')) {
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
        }
      } else {
        // Add new import after other imports
        const lines = content.split('\n');
        const lastImportIdx = lines.findLastIndex(l => l.trim().startsWith('import '));
        if (lastImportIdx >= 0) {
          lines.splice(lastImportIdx + 1, 0, "import { Button } from '@vayva/ui';");
          content = lines.join('\n');
        }
      }
    } else {
      // Add import at end of imports
      const lines = content.split('\n');
      const lastImportIdx = lines.findLastIndex(l => l.trim().startsWith('import '));
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, "import { Button } from '@vayva/ui';");
        content = lines.join('\n');
      } else {
        // Add at top
        lines.unshift("import { Button } from '@vayva/ui';");
        content = lines.join('\n');
      }
    }
    
    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      fixed++;
    }
  } catch (error) {
    // Ignore errors
  }
});

logger.info(`\x1b[32m✓ Fixed Button imports in ${fixed} files\x1b[0m\n`);

// Verify
try {
  const finalCount = parseInt(execSync('pnpm lint 2>&1 | wc -l', { encoding: 'utf8' }).trim());
  logger.info(`\x1b[36mFinal warning count: \x1b[33m${finalCount} lines\x1b[0m`);
  
  if (finalCount < 1000) {
    logger.info(`\n\x1b[32m🎉 INCREDIBLE! Below 1000 lines! 🎉\x1b[0m\n`);
  } else if (finalCount < 1300) {
    logger.info(`\n\x1b[32m🎉 AMAZING! Close to 1300! 🎉\x1b[0m\n`);
  }
} catch (error) {
  logger.info('Could not verify final count');
}
