#!/usr/bin/env node
/**
 * Button migration script: raw <button> to @vayva/ui Button
 * Handles simple cases; complex buttons need manual review
 */

const fs = require('fs');
const path = require('path');

const TARGET_DIR = path.join(__dirname, '../Frontend/merchant-admin/src');

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

// Extract existing Button imports from @vayva/ui
function extractExistingImports(content) {
  const match = content.match(/import\s+\{([^}]+)\}\s+from\s+["']@vayva\/ui["']/);
  if (match) {
    return match[1].split(',').map(s => s.trim()).filter(Boolean);
  }
  return null;
}

// Update imports to add Button
function updateImports(content) {
  const existing = extractExistingImports(content);
  if (existing) {
    if (!existing.includes('Button')) {
      const newImports = [...existing, 'Button'].sort().join(', ');
      return content.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@vayva\/ui["']/,
        `import { ${newImports} } from "@vayva/ui"`
      );
    }
    return content;
  }
  
  // Add new import line
  const importLine = 'import { Button } from "@vayva/ui";\n';
  const useClientMatch = content.match(/^("use client";\n?)/);
  if (useClientMatch) {
    return content.replace(useClientMatch[0], useClientMatch[0] + '\n' + importLine);
  }
  return importLine + '\n' + content;
}

// Migrate simple buttons
function migrateButtons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Find simple buttons: <button type="button" onClick={...}>text</button>
  // Pattern: <button followed by attributes, then >, then content, then </button>
  const buttonRegex = /<button\s+([^>]*)>(.*?)<\/button>/gs;
  
  let matches = [...content.matchAll(buttonRegex)];
  if (matches.length === 0) return { count: 0, migrated: 0 };
  
  let migrated = 0;
  let skipped = 0;
  
  for (const match of matches) {
    const [fullMatch, attributes, innerContent] = match;
    
    // Skip complex cases
    if (attributes.includes('type="submit"')) { skipped++; continue; }
    if (attributes.includes('form=')) { skipped++; continue; }
    if (innerContent.includes('<button') || innerContent.includes('<Button')) { skipped++; continue; }
    if (attributes.includes('className=') && attributes.includes('css-')) { skipped++; continue; }
    
    // Determine variant based on classes
    let variant = 'default';
    if (attributes.includes('bg-red') || attributes.includes('text-red')) variant = 'destructive';
    else if (attributes.includes('bg-transparent') || attributes.includes('ghost')) variant = 'ghost';
    else if (attributes.includes('outline') || attributes.includes('border')) variant = 'outline';
    
    // Extract onClick
    const onClickMatch = attributes.match(/onClick=\{([^}]+)\}/);
    const onClick = onClickMatch ? `onClick={${onClickMatch[1]}}` : '';
    
    // Extract disabled
    const disabled = attributes.includes('disabled') ? 'disabled' : '';
    
    // Build new Button
    const props = [variant !== 'default' ? `variant="${variant}"` : '', onClick, disabled]
      .filter(Boolean)
      .join(' ');
    
    const newButton = `<Button${props ? ' ' + props : ''}>${innerContent.trim()}</Button>`;
    
    content = content.replace(fullMatch, newButton);
    migrated++;
  }
  
  if (migrated > 0) {
    content = updateImports(content);
    fs.writeFileSync(filePath, content);
  }
  
  return { count: matches.length, migrated, skipped };
}

// Main
function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  
  let totalFiles = 0;
  let totalButtons = 0;
  let totalMigrated = 0;
  let totalSkipped = 0;
  
  for (const file of files) {
    const result = migrateButtons(file);
    if (result.count > 0) {
      totalFiles++;
      totalButtons += result.count;
      totalMigrated += result.migrated;
      totalSkipped += result.skipped;
      if (result.migrated > 0) {
        console.log(`✓ ${path.relative(TARGET_DIR, file)}: ${result.migrated}/${result.count} buttons migrated`);
      }
    }
  }
  
  console.log('\n--- BUTTON MIGRATION SUMMARY ---');
  console.log(`Files with buttons: ${totalFiles}`);
  console.log(`Total buttons: ${totalButtons}`);
  console.log(`Migrated: ${totalMigrated}`);
  console.log(`Skipped (complex): ${totalSkipped}`);
}

main();
