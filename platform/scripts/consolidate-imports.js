const fs = require('fs');
const _path = require('path');

function consolidateImports(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  
  const uiImports = [];
  const otherLines = [];
  let firstUiImportIndex = -1;

  // Regex to match: import { A, B } from "@vayva/ui";
  // Also handles: import { Button } from "@vayva/ui";
  const importRegex = /^import\s+\{(.*)\}\s+from\s+["']@vayva\/ui["'];?$/;

  lines.forEach((line, _index) => {
    const match = line.match(importRegex);
    if (match) {
      if (firstUiImportIndex === -1) {
        firstUiImportIndex = otherLines.length; // Record position in the new array
      }
      // Extract symbols, split by comma, trim
      const symbols = match[1].split(',').map(s => s.trim()).filter(s => s);
      uiImports.push(...symbols);
    } else {
        otherLines.push(line);
    }
  });

  if (uiImports.length <= 0) {
      return; // No changes needed
  }
  
  // Unique symbols
  const uniqueSymbols = [...new Set(uiImports)].sort();
  
  // Construct new import line
  const newImportLine = `import { ${uniqueSymbols.join(', ')} } from "@vayva/ui";`;
  
  // Insert at the first occurrence
  if (firstUiImportIndex !== -1) {
      otherLines.splice(firstUiImportIndex, 0, newImportLine);
  } else {
      // Should not happen if uiImports.length > 0, but fallback to top? 
      // Actually usually imports are at top. using firstUiImportIndex is safer.
  }

  const newContent = otherLines.join('\n');
  
  if (newContent !== content) {
      fs.writeFileSync(filePath, newContent, 'utf8');
      console.log(`Updated ${filePath}`);
  }
}

// Get files from args
const files = process.argv.slice(2);
files.forEach(file => {
    try {
        if (fs.existsSync(file)) {
            consolidateImports(file);
        }
    } catch (e) {
        console.error(`Error processing ${file}:`, e);
    }
});
