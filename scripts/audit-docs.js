const fs = require('fs');
const path = require('path');

const SERVICES_DIR = path.join(__dirname, '../Backend/fastify-server/src/services');

function getAllFiles(dir, ext) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = [...results, ...getAllFiles(file, ext)];
    } else if (file.endsWith(ext)) {
      results.push(file);
    }
  });
  return results;
}

function checkFileHasDocComments(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');
  const functionsWithoutDocs = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Check if this is a function declaration
    if (line.match(/async\s+\w+\s*\(|^\s*\w+\s*\([^)]*\)\s*[:{]/) && 
        !line.trim().startsWith('//') && 
        !line.includes('constructor')) {
      
      // Check if previous non-empty line is a JSDoc comment
      let hasDoc = false;
      for (let j = i - 1; j >= Math.max(0, i - 3); j--) {
        const prevLine = lines[j].trim();
        if (prevLine === '') continue;
        if (prevLine.startsWith('/**') || prevLine.startsWith('*')) {
          hasDoc = true;
        }
        break;
      }
      
      if (!hasDoc) {
        const funcName = line.match(/(async\s+)?(\w+)\s*\(/)?.[2] || 'anonymous';
        functionsWithoutDocs.push({
          line: i + 1,
          name: funcName,
          snippet: line.trim().substring(0, 60)
        });
      }
    }
  }
  
  return functionsWithoutDocs;
}

console.log('📊 Auditing fastify-server services for undocumented functions...\n');

const files = getAllFiles(SERVICES_DIR, '.ts');
let totalUndocumented = 0;
const report = [];

files.forEach(file => {
  const relativePath = path.relative(path.join(__dirname, '..'), file);
  const undoc = checkFileHasDocComments(file);
  
  if (undoc.length > 0) {
    report.push({
      file: relativePath,
      functions: undoc
    });
    totalUndocumented += undoc.length;
  }
});

console.log(`Total services files: ${files.length}`);
console.log(`Files with undocumented functions: ${report.length}`);
console.log(`Total undocumented functions: ${totalUndocumented}\n`);

if (report.length > 0) {
  console.log('📋 Files needing documentation:\n');
  report.forEach(item => {
    console.log(`\n${item.file}:`);
    item.functions.forEach(fn => {
      console.log(`  Line ${fn.line}: ${fn.name}() - ${fn.snippet}`);
    });
  });
} else {
  console.log('✅ All functions are documented!');
}

// Save report
fs.writeFileSync(
  path.join(__dirname, '../FUNCTION_DOCS_AUDIT.md'),
  `# Function Documentation Audit Report\n\n` +
  `Total services files: ${files.length}\n` +
  `Files with undocumented functions: ${report.length}\n` +
  `Total undocumented functions: ${totalUndocumented}\n\n` +
  (report.length > 0 ? report.map(item => 
    `## ${item.file}\n\n` + 
    item.functions.map(fn => `- Line ${fn.line}: \`${fn.name}()\``).join('\n')
  ).join('\n\n') : '✅ All functions are documented!\n')
);

console.log('\nReport saved to FUNCTION_DOCS_AUDIT.md');
