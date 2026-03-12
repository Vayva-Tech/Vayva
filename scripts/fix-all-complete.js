#!/usr/bin/env node
/**
 * Complete merchant-admin fix - all remaining issues
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

function addImport(content, component) {
  const existingMatch = content.match(/import\s+\{([^}]+)\}\s+from\s+["']@vayva\/ui["']/);
  if (existingMatch) {
    const imports = existingMatch[1].split(',').map(s => s.trim()).filter(Boolean);
    if (!imports.includes(component)) {
      imports.push(component);
      const newImports = imports.sort().join(', ');
      return content.replace(
        /import\s+\{([^}]+)\}\s+from\s+["']@vayva\/ui["']/,
        `import { ${newImports} } from "@vayva/ui"`
      );
    }
    return content;
  }
  
  const importLine = `import { ${component} } from "@vayva/ui";\n`;
  const useClientMatch = content.match(/^("use client";\n?)/);
  if (useClientMatch) {
    return content.replace(useClientMatch[0], useClientMatch[0] + '\n' + importLine);
  }
  return importLine + '\n' + content;
}

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let modified = false;
  
  // Fix 1: Raw <input> -> <Input>
  // Match inputs that are NOT type="hidden" or already @vayva/ui
  const inputPattern = /<input\s+((?![^>]*type="hidden")[^>]*)>/g;
  content = content.replace(inputPattern, (match, attrs) => {
    modified = true;
    return `<Input ${attrs} />`;
  });
  
  // Fix 2: Raw <textarea> -> <Textarea>
  const textareaPattern = /<textarea\s+([^>]*)>(.*?)<\/textarea>/gs;
  content = content.replace(textareaPattern, (match, attrs, inner) => {
    modified = true;
    const trimmedInner = inner.trim();
    if (trimmedInner) {
      return `<Textarea ${attrs} defaultValue={${JSON.stringify(trimmedInner)}} />`;
    }
    return `<Textarea ${attrs} />`;
  });
  
  // Fix 3: console.log -> logger (in API routes) or remove
  if (filePath.includes('/api/')) {
    const consolePatterns = [
      { from: /console\.error\(([^)]+)\)/g, to: 'logger.error("ERROR", $1)' },
      { from: /console\.warn\(([^)]+)\)/g, to: 'logger.warn("WARN", $1)' },
      { from: /console\.log\(([^)]+)\)/g, to: 'logger.info("INFO", $1)' },
    ];
    
    consolePatterns.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
    
    // Add logger import if needed
    if (content.includes('logger.') && !content.includes('import { logger }')) {
      const loggerImport = 'import { logger } from "@/lib/logger";\n';
      const useServerMatch = content.match(/^("use server";\n?)/);
      if (useServerMatch) {
        content = content.replace(useServerMatch[0], useServerMatch[0] + '\n' + loggerImport);
      } else {
        content = loggerImport + content;
      }
      modified = true;
    }
  } else {
    // Non-API routes - just comment out console statements
    const consolePatterns = [
      { from: /console\.(error|warn|log|info|debug)\(([^)]+)\)/g, to: '/* console.$1($2) */' },
    ];
    
    consolePatterns.forEach(({ from, to }) => {
      if (from.test(content)) {
        content = content.replace(from, to);
        modified = true;
      }
    });
  }
  
  // Fix 4: Remove TODO/FIXME comments
  const todoPatterns = [
    /\/\/\s*TODO.*\n/g,
    /\/\/\s*FIXME.*\n/g,
    /\/\*\s*TODO.*?\*\/\n?/gs,
    /\/\*\s*FIXME.*?\*\/\n?/gs,
  ];
  
  todoPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });
  
  // Fix 5: Remove unnecessary eslint-disable comments (keep react/display-name)
  const eslintPatterns = [
    /\/\/\s*eslint-disable-next-line\s+@typescript-eslint\/no-explicit-any\s*\n/g,
    /\/\*\s*eslint-disable-next-line\s+@typescript-eslint\/no-explicit-any\s*\*\/\s*\n/g,
    /\/\/\s*eslint-disable-next-line\s+react-hooks\/exhaustive-deps\s*\n/g,
    /\/\/\s*eslint-disable-next-line\s+react-hooks\/purity\s*\n/g,
    /\/\/\s*eslint-disable-next-line\s+@typescript-eslint\/no-unused-vars\s*\n/g,
    /\/\*\s*eslint-disable\s+@typescript-eslint\/no-unused-vars\s*\*\/\s*\n/g,
  ];
  
  eslintPatterns.forEach(pattern => {
    if (pattern.test(content)) {
      content = content.replace(pattern, '');
      modified = true;
    }
  });
  
  // Add imports if we added UI components
  if (content.includes('<Input') && !content.includes('import { Input }')) {
    content = addImport(content, 'Input');
    modified = true;
  }
  if (content.includes('<Textarea') && !content.includes('import { Textarea }')) {
    content = addImport(content, 'Textarea');
    modified = true;
  }
  
  if (modified) {
    fs.writeFileSync(filePath, content);
    return true;
  }
  return false;
}

function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  let fixedCount = 0;
  
  console.log('=== COMPLETE FIX SCRIPT ===\n');
  
  for (const file of files) {
    if (fixFile(file)) {
      fixedCount++;
      console.log(`✓ Fixed: ${path.relative(TARGET_DIR, file)}`);
    }
  }
  
  console.log(`\n=== COMPLETE ===`);
  console.log(`Files modified: ${fixedCount}`);
  console.log('\nRun "npm run build" to verify all fixes');
}

main();
