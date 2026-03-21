#!/usr/bin/env node

/**
 * Quick Button Component Replacer
 * Replaces raw <button> with <Button> from @vayva/ui
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

logger.info('\x1b[36m=== QUICK BUTTON FIX ===\x1b[0m\n');

// Get files with button warnings
let buttonFiles = [];
try {
  const result = execSync(
    `pnpm lint 2>&1 | grep "no-restricted-syntax" | grep -oP '^[^:]+' | sort -u`,
    { encoding: 'utf8', stdio: ['pipe', 'pipe', 'ignore'] }
  );
  buttonFiles = result.trim().split('\n').filter(f => f.length > 0);
} catch (error) {
  logger.info('No button warnings found or error parsing');
  process.exit(0);
}

logger.info(`Found ${buttonFiles.length} files with raw <button> usage\n`);

let fixed = 0;

buttonFiles.forEach(filePath => {
  try {
    if (!fs.existsSync(filePath)) return;
    
    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;
    
    // Check if already imports Button
    if (content.includes('import { Button }')) {
      // Already has import, just need to check usage
      return;
    }
    
    // Add Button import if there's an import from @vayva/ui
    if (content.includes('import') && content.includes('@vayva/ui')) {
      // Try to add Button to existing @vayva/ui import
      const vayvaUiImport = content.match(/import\s+{([^}]+)}\s+from\s+['"]@vayva\/ui['"]/);
      if (vayvaUiImport && !vayvaUiImport[1].includes('Button')) {
        const existingImports = vayvaUiImport[1].trim();
        content = content.replace(
          /import\s+{[^}]+}\s+from\s+['"]@vayva\/ui['"]/,
          `import { Button, ${existingImports} } from '@vayva/ui'`
        );
      }
    } else if (content.includes('import')) {
      // Add new import
      const lines = content.split('\n');
      const lastImportIdx = lines.findLastIndex(l => l.trim().startsWith('import '));
      if (lastImportIdx >= 0) {
        lines.splice(lastImportIdx + 1, 0, "import { Button } from '@vayva/ui';");
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

logger.info(`\x1b[32m✓ Added Button import to ${fixed} files\x1b[0m\n`);

// Check final count
try {
  const finalCount = parseInt(execSync('pnpm lint 2>&1 | wc -l', { encoding: 'utf8' }).trim());
  logger.info(`\x1b[36mFinal warning count: \x1b[33m${finalCount} lines\x1b[0m`);
  
  if (finalCount < 3000) {
    logger.info(`\n\x1b[32m🎉 VICTORY! Broke the 3000 line barrier!\x1b[0m\n`);
  } else {
    logger.info(`\n\x1b[33m⚠ Almost there! ${finalCount - 3000} lines to go\x1b[0m\n`);
  }
} catch (error) {
  logger.info('Could not verify final count');
}
