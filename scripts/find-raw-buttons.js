#!/usr/bin/env node
/**
 * Search for remaining raw <button> elements
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

function findButtons(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const matches = [];
  
  lines.forEach((line, idx) => {
    if (line.includes('<button') || line.includes('< button')) {
      matches.push({
        line: idx + 1,
        content: line.trim().substring(0, 100)
      });
    }
  });
  
  return matches;
}

function main() {
  const files = findFiles(TARGET_DIR, /\.tsx?$/);
  
  let totalButtons = 0;
  let filesWithButtons = [];
  
  for (const file of files) {
    const matches = findButtons(file);
    if (matches.length > 0) {
      totalButtons += matches.length;
      filesWithButtons.push({
        file: path.relative(TARGET_DIR, file),
        count: matches.length,
        lines: matches.map(m => m.line).join(',')
      });
    }
  }
  
  console.log('=== RAW BUTTON SEARCH RESULTS ===\n');
  console.log(`Total raw <button> elements found: ${totalButtons}\n`);
  
  if (filesWithButtons.length > 0) {
    console.log('Files with raw buttons:');
    filesWithButtons.forEach(f => {
      console.log(`  ${f.file}: ${f.count} (lines: ${f.lines})`);
    });
  } else {
    console.log('No raw <button> elements found - all migrated!');
  }
}

main();
