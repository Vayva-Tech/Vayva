#!/usr/bin/env node
/**
 * Migration script: raw <select> and <button> to @vayva/ui components
 * Usage: node scripts/migrate-ui-components.js
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../Frontend/merchant-admin/src');

// Find all .tsx/.ts files
function findFiles(dir, pattern) {
  const files = [];
  const items = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory() && !item.name.startsWith('.') && item.name !== 'node_modules') {
      files.push(...findFiles(fullPath, pattern));
    } else if (item.isFile() && pattern.test(item.name)) {
      files.push(fullPath);
    }
  }
  return files;
}

// Check if file already imports from @vayva/ui
function hasVayvaUiImport(content) {
  return content.includes('@vayva/ui');
}

// Extract existing imports from @vayva/ui
function extractExistingImports(content) {
  const match = content.match(/from\s+["']@vayva\/ui["']\s*;?/);
  if (!match) return null;
  
  const importMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+["']@vayva\/ui["']/);
  if (importMatch) {
    return importMatch[1].split(',').map(s => s.trim()).filter(Boolean);
  }
  return null;
}

// Migrate select elements in a file
function migrateSelects(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Count occurrences
  const selectMatches = content.match(/<select[\s>]/g);
  if (!selectMatches) return { count: 0, modified: false };
  
  const count = selectMatches.length;
  
  // Skip if already uses @vayva/ui Select in a way that would conflict
  if (content.includes('<Select') && content.includes('@vayva/ui')) {
    return { count, modified: false, reason: 'already uses Select' };
  }
  
  // Replace <select with <Select (preserving attributes)
  content = content.replace(/<select(\s|>)/g, '<Select$1');
  content = content.replace(/<\/select>/g, '</Select>');
  
  // Update import
  const existingImports = extractExistingImports(content);
  if (existingImports) {
    if (!existingImports.includes('Select')) {
      const newImports = [...existingImports, 'Select'].sort().join(', ');
      content = content.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@vayva\/ui["']/,
        `import { ${newImports} } from "@vayva/ui"`
      );
    }
  } else {
    // Add new import
    const importLine = 'import { Select } from "@vayva/ui";\n';
    const firstImport = content.match(/^(import\s+.*from\s+["'][^"']+["'];?\s*)$/m);
    if (firstImport) {
      content = content.replace(firstImport[0], importLine + firstImport[0]);
    } else {
      // Insert after "use client" or at top
      if (content.startsWith('"use client"')) {
        content = content.replace('"use client";', '"use client";\n\n' + importLine);
      } else {
        content = importLine + '\n' + content;
      }
    }
  }
  
  modified = true;
  fs.writeFileSync(filePath, content);
  return { count, modified };
}

// Migrate button elements in a file (only simple ones)
function migrateButtons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Count simple button occurrences (not type="submit" or complex handlers)
  const buttonMatches = content.match(/<button[\s>]/g);
  if (!buttonMatches) return { count: 0, modified: false };
  
  // Skip files with complex button logic for now
  if (content.includes('onClick={() =>') && content.includes('onClick={async')) {
    return { count: buttonMatches.length, modified: false, reason: 'complex handlers' };
  }
  
  // For now, just report buttons - manual review needed for proper variant mapping
  return { count: buttonMatches.length, modified: false, reason: 'manual review needed' };
}

// Main execution
function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  
  let selectStats = { files: 0, total: 0, migrated: 0, skipped: [] };
  let buttonStats = { files: 0, total: 0 };
  
  for (const file of files) {
    // Migrate selects
    const selectResult = migrateSelects(file);
    if (selectResult.count > 0) {
      selectStats.files++;
      selectStats.total += selectResult.count;
      if (selectResult.modified) {
        selectStats.migrated++;
        console.log(`✓ ${path.relative(TARGET_DIR, file)}: ${selectResult.count} selects migrated`);
      } else {
        selectStats.skipped.push({ file: path.relative(TARGET_DIR, file), reason: selectResult.reason });
      }
    }
    
    // Check buttons
    const buttonResult = migrateButtons(file);
    if (buttonResult.count > 0) {
      buttonStats.files++;
      buttonStats.total += buttonResult.count;
    }
  }
  
  console.log('\n--- SELECT MIGRATION SUMMARY ---');
  console.log(`Files affected: ${selectStats.files}`);
  console.log(`Total selects: ${selectStats.total}`);
  console.log(`Migrated: ${selectStats.migrated}`);
  console.log(`Skipped: ${selectStats.skipped.length}`);
  
  if (selectStats.skipped.length > 0) {
    console.log('\nSkipped files:');
    selectStats.skipped.forEach(s => console.log(`  - ${s.file}: ${s.reason}`));
  }
  
  console.log('\n--- BUTTON AUDIT SUMMARY ---');
  console.log(`Files with buttons: ${buttonStats.files}`);
  console.log(`Total buttons: ${buttonStats.total}`);
  console.log('Note: Buttons require manual review for proper variant mapping');
}

main();
