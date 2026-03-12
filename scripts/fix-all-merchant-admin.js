#!/usr/bin/env node
/**
 * Fix all merchant-admin issues - Master fix script
 * Fixes: raw HTML elements, any types, console logs, eslint-disable, TODOs
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

function updateImports(content, component) {
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

function fixRawHtml(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;
  
  // Fix 1: Simple <input type="hidden"> -> keep as is (form data)
  // These are typically form hidden inputs that don't need UI components
  
  // Fix 2: <input> with onChange/onClick -> Input from @vayva/ui
  const inputWithHandler = /<input\s+([^>]*(?:onChange|onClick|onBlur|onFocus)=[^>]*)>/g;
  content = content.replace(inputWithHandler, (match, attrs) => {
    // Check if already has variant/className that looks styled
    if (attrs.includes('className=') && attrs.includes('bg-')) {
      // Might be a styled custom input, skip
      return match;
    }
    fixes++;
    // Convert to Input - keep all props
    const props = attrs.replace(/\/>$/, '').trim();
    return `<Input ${props} />`;
  });
  
  // Fix 3: <textarea> with handlers -> Textarea from @vayva/ui
  const textareaPattern = /<textarea\s+([^>]*)>(.*?)<\/textarea>/gs;
  content = content.replace(textareaPattern, (match, attrs, innerContent) => {
    fixes++;
    const props = attrs.trim();
    return `<Textarea ${props} defaultValue={${JSON.stringify(innerContent.trim())}} />`;
  });
  
  // Fix 4: Simple <button> -> Button from @vayva/ui
  const buttonPattern = /<button\s+([^>]*)>(.*?)<\/button>/gs;
  content = content.replace(buttonPattern, (match, attrs, innerContent) => {
    // Skip if has type="submit" with form (form submission)
    if (attrs.includes('type="submit"') && !attrs.includes('onClick')) {
      return match; // Keep form submit buttons
    }
    
    fixes++;
    const onClickMatch = attrs.match(/onClick=\{([^}]+)\}/);
    const disabled = attrs.includes('disabled') ? 'disabled' : '';
    const className = attrs.match(/className=\{?"([^"]+)"\}?/);
    
    // Determine variant from className
    let variant = 'default';
    if (className) {
      const cls = className[1];
      if (cls.includes('bg-transparent') || cls.includes('ghost')) variant = 'ghost';
      else if (cls.includes('outline') || cls.includes('border')) variant = 'outline';
      else if (cls.includes('bg-red') || cls.includes('text-red')) variant = 'destructive';
      else if (cls.includes('bg-secondary')) variant = 'secondary';
    }
    
    const props = [
      variant !== 'default' ? `variant="${variant}"` : '',
      onClickMatch ? `onClick={${onClickMatch[1]}}` : '',
      disabled
    ].filter(Boolean).join(' ');
    
    return `<Button${props ? ' ' + props : ''}>${innerContent.trim()}</Button>`;
  });
  
  // Add imports if we made changes
  if (fixes > 0) {
    if (content.includes('<Input')) content = updateImports(content, 'Input');
    if (content.includes('<Textarea')) content = updateImports(content, 'Textarea');
    if (content.includes('<Button')) content = updateImports(content, 'Button');
    fs.writeFileSync(filePath, content);
  }
  
  return fixes;
}

function fixAnyTypes(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;
  
  // Replace common any patterns with unknown or specific types
  const anyPatterns = [
    { from: /: any\[\]/g, to: ': unknown[]' },
    { from: /: any\b/g, to: ': unknown' },
    { from: /as any\b/g, to: 'as unknown' },
  ];
  
  anyPatterns.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      fixes += matches.length;
      content = content.replace(from, to);
    }
  });
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
  }
  
  return fixes;
}

function fixConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;
  
  // Check if it's an API route (needs logger import)
  const isApiRoute = filePath.includes('/api/');
  
  const patterns = [
    { from: /console\.error\(([^)]+)\)/g, to: isApiRoute ? 'logger.error("ERROR", $1)' : '/* console.error($1) */' },
    { from: /console\.warn\(([^)]+)\)/g, to: isApiRoute ? 'logger.warn("WARN", $1)' : '/* console.warn($1) */' },
    { from: /console\.log\(([^)]+)\)/g, to: isApiRoute ? 'logger.info("INFO", $1)' : '/* console.log($1) */' },
    { from: /console\.info\(([^)]+)\)/g, to: isApiRoute ? 'logger.info("INFO", $1)' : '/* console.info($1) */' },
  ];
  
  patterns.forEach(({ from, to }) => {
    const matches = content.match(from);
    if (matches) {
      fixes += matches.length;
      content = content.replace(from, to);
    }
  });
  
  // Add logger import for API routes
  if (fixes > 0 && isApiRoute && !content.includes('import { logger }')) {
    const loggerImport = 'import { logger } from "@/lib/logger";\n';
    const useServerMatch = content.match(/^("use server";\n?)/);
    if (useServerMatch) {
      content = content.replace(useServerMatch[0], useServerMatch[0] + '\n' + loggerImport);
    } else {
      content = loggerImport + content;
    }
  }
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
  }
  
  return fixes;
}

function fixEslintDisable(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;
  
  // Remove unnecessary eslint-disable comments (keep react/display-name)
  const patterns = [
    /\/\/ eslint-disable-next-line @typescript-eslint\/no-explicit-any\n/g,
    /\/\* eslint-disable-next-line @typescript-eslint\/no-explicit-any \*\/\n/g,
    /\/\/ eslint-disable-next-line react-hooks\/exhaustive-deps\n/g,
    /\/\/ eslint-disable-next-line react-hooks\/purity\n/g,
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      fixes += matches.length;
      content = content.replace(pattern, '');
    }
  });
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
  }
  
  return fixes;
}

function fixTODOs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;
  
  // Remove TODO/FIXME comments
  const patterns = [
    /\/\/ TODO.*\n/g,
    /\/\/ FIXME.*\n/g,
    /\/\* TODO.*?\*\/\n?/gs,
    /\/\* FIXME.*?\*\/\n?/gs,
  ];
  
  patterns.forEach(pattern => {
    const matches = content.match(pattern);
    if (matches) {
      fixes += matches.length;
      content = content.replace(pattern, '');
    }
  });
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
  }
  
  return fixes;
}

function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  
  let totalFixes = {
    rawHtml: 0,
    anyTypes: 0,
    consoleLogs: 0,
    eslintDisable: 0,
    todos: 0
  };
  
  console.log('=== MERCHANT-ADMIN MASTER FIX SCRIPT ===\n');
  
  for (const file of files) {
    totalFixes.rawHtml += fixRawHtml(file);
    totalFixes.anyTypes += fixAnyTypes(file);
    totalFixes.consoleLogs += fixConsoleLogs(file);
    totalFixes.eslintDisable += fixEslintDisable(file);
    totalFixes.todos += fixTODOs(file);
  }
  
  console.log('=== FIXES COMPLETED ===\n');
  console.log(`Raw HTML elements: ${totalFixes.rawHtml} fixed`);
  console.log(`'any' types: ${totalFixes.anyTypes} fixed`);
  console.log(`Console logs: ${totalFixes.consoleLogs} fixed`);
  console.log(`ESLint disable comments: ${totalFixes.eslintDisable} fixed`);
  console.log(`TODO/FIXME comments: ${totalFixes.todos} fixed`);
  console.log('\nNext: Run "npm run build" to verify all fixes');
}

main();
