#!/usr/bin/env node
/**
 * Comprehensive audit script for merchant-admin
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

function auditFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const issues = [];
  
  lines.forEach((line, idx) => {
    // Check for raw HTML elements not from @vayva/ui
    if (line.includes('<input') || line.includes('<textarea') || line.includes('<select') || line.includes('<button')) {
      // Skip if it's @vayva/ui import or usage
      if (!line.includes('@vayva/ui') && !line.includes('import') && !line.includes('//')) {
        issues.push({ line: idx + 1, type: 'RAW_HTML', content: line.trim().substring(0, 80) });
      }
    }
    
    // Check for TODO/FIXME
    if (line.includes('TODO') || line.includes('FIXME')) {
      issues.push({ line: idx + 1, type: 'TODO', content: line.trim().substring(0, 80) });
    }
    
    // Check for console.log
    if (line.includes('console.') && !line.includes('//')) {
      issues.push({ line: idx + 1, type: 'CONSOLE', content: line.trim().substring(0, 80) });
    }
    
    // Check for : any or as any
    if ((line.includes(': any') || line.includes('as any')) && !line.includes('//')) {
      issues.push({ line: idx + 1, type: 'ANY', content: line.trim().substring(0, 80) });
    }
    
    // Check for eslint-disable
    if (line.includes('eslint-disable') && !line.includes('eslint-disable-next-line react/display-name')) {
      issues.push({ line: idx + 1, type: 'ESLINT_DISABLE', content: line.trim().substring(0, 80) });
    }
  });
  
  return issues;
}

function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  
  let allIssues = [];
  let fileCount = 0;
  
  for (const file of files) {
    const issues = auditFile(file);
    if (issues.length > 0) {
      fileCount++;
      allIssues.push({
        file: path.relative(TARGET_DIR, file),
        issues
      });
    }
  }
  
  // Summarize
  const summary = {
    RAW_HTML: 0,
    TODO: 0,
    CONSOLE: 0,
    ANY: 0,
    ESLINT_DISABLE: 0
  };
  
  allIssues.forEach(f => {
    f.issues.forEach(i => {
      summary[i.type]++;
    });
  });
  
  console.log('=== MERCHANT-ADMIN AUDIT RESULTS ===\n');
  console.log(`Files with issues: ${fileCount}/${files.length}`);
  console.log(`\nSummary:`);
  console.log(`  Raw HTML elements: ${summary.RAW_HTML}`);
  console.log(`  TODO/FIXME comments: ${summary.TODO}`);
  console.log(`  Console logs: ${summary.CONSOLE}`);
  console.log(`  'any' types: ${summary.ANY}`);
  console.log(`  eslint-disable: ${summary.ESLINT_DISABLE}`);
  
  if (allIssues.length > 0) {
    console.log(`\n--- DETAILED ISSUES ---`);
    allIssues.slice(0, 20).forEach(f => {
      console.log(`\n${f.file}:`);
      f.issues.slice(0, 5).forEach(i => {
        console.log(`  Line ${i.line}: [${i.type}] ${i.content}`);
      });
      if (f.issues.length > 5) {
        console.log(`  ... and ${f.issues.length - 5} more issues`);
      }
    });
  }
}

main();
