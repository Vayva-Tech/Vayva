#!/usr/bin/env node
/**
 * Fix broken Button JSX from previous migration attempts
 * This script repairs malformed JSX where onClick was incorrectly parsed
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

// Fix broken Button patterns
function fixBrokenButtons(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  let fixes = 0;
  
  // Pattern 1: <Button>setState(...) - missing onClick={ and closing }
  // Fix: <Button onClick={() => setState(...)}>
  const brokenPattern1 = /<Button>(\w+)\(([^)]+)\)}([^>]*)>/g;
  content = content.replace(brokenPattern1, (match, funcName, args, rest) => {
    fixes++;
    return `<Button onClick={() => ${funcName}(${args})}${rest}>`;
  });
  
  // Pattern 2: <Button>funcName(args)} className=... - missing onClick={
  const brokenPattern2 = /<Button>(\w+)\(([^)]+)\)}\s+className=/g;
  content = content.replace(brokenPattern2, (match, funcName, args) => {
    fixes++;
    return `<Button onClick={() => ${funcName}(${args})} className=`;
  });
  
  // Pattern 3: <Button>funcName(args)}>...content...</Button> - content outside
  const brokenPattern3 = /<Button>(\w+)\(([^)]+)\)}>([\s\S]*?)<\/Button>/g;
  content = content.replace(brokenPattern3, (match, funcName, args, innerContent) => {
    fixes++;
    return `<Button onClick={() => ${funcName}(${args})}>${innerContent}</Button>`;
  });
  
  // Pattern 4: <Button>deleteSync(sync.id)}...> - missing onClick={
  const brokenPattern4 = /<Button>(\w+)\(([^)]+)\)([^>]*)>/g;
  content = content.replace(brokenPattern4, (match, funcName, args, rest) => {
    if (rest.includes('className') || rest.includes('disabled') || rest.includes('variant')) {
      fixes++;
      return `<Button onClick={() => ${funcName}(${args})}${rest}>`;
    }
    return match;
  });
  
  // Pattern 5: Nested Button tags from bad migration
  // <Button ...><Button ...>...</Button></Button> -> keep inner, remove outer
  const nestedPattern = /<Button\s+[^>]*>\s*<Button\s+(variant="outline"[^>]*)>\s*<div/;
  if (nestedPattern.test(content)) {
    // This is a complex case - the nested buttons in calendar/page.tsx
    // Keep just the outer wrapper div pattern, remove the duplicate Button
    content = content.replace(
      /<Button\s+variant="outline"\s+className="w-full flex items-center gap-3"\s*>\s*<Button\s+variant="outline"\s+className="w-full flex items-center gap-3"\s*>/g,
      '<Button variant="outline" className="w-full flex items-center gap-3">'
    );
    fixes++;
  }
  
  // Pattern 6: </Button></Button> - remove duplicate closing
  content = content.replace(/<\/Button>\s*<\/Button>/g, '</Button>');
  
  // Pattern 7: <Button> at start of line with just function call
  const linePattern = /^(\s*)<Button>(\w+)\(([^)]+)\)}/gm;
  content = content.replace(linePattern, (match, indent, funcName, args) => {
    fixes++;
    return `${indent}<Button onClick={() => ${funcName}(${args})}`;
  });
  
  if (fixes > 0) {
    fs.writeFileSync(filePath, content);
    return fixes;
  }
  return 0;
}

// Main
function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  
  let totalFiles = 0;
  let totalFixes = 0;
  
  for (const file of files) {
    const fixes = fixBrokenButtons(file);
    if (fixes > 0) {
      totalFiles++;
      totalFixes += fixes;
      console.log(`✓ ${path.relative(TARGET_DIR, file)}: ${fixes} fixes`);
    }
  }
  
  console.log('\n--- BUTTON FIX SUMMARY ---');
  console.log(`Files fixed: ${totalFiles}`);
  console.log(`Total fixes: ${totalFixes}`);
}

main();
