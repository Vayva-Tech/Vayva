const fs = require('fs');
const path = require('path');

/**
 * Modernize Imports Script
 * Converts const x = require('y') to import x from 'y'
 */

const targetPatterns = [
    {
        regex: /const\s+\{?\s*([a-zA-Z0-9_, ]+)\s*\}?\s*=\s*require\((['"])(.+?)\2\);?/g,
        replace: (match, imports, quote, source) => {
            // Check if it's a destructuring require
            if (match.includes('{')) {
                return `import { ${imports.trim()} } from ${quote}${source}${quote};`;
            }
            return `import ${imports.trim()} from ${quote}${source}${quote};`;
        }
    },
    {
        regex: /require\((['"])(.+?)\1\)\.config\(\);?/g,
        replace: (match, quote, source) => {
            if (source === 'dotenv') {
                return `import 'dotenv/config';`;
            }
            return match;
        }
    }
];

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;

    targetPatterns.forEach(pattern => {
        const newContent = content.replace(pattern.regex, pattern.replace);
        if (newContent !== content) {
            content = newContent;
            changed = true;
        }
    });

    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`[FIXED] ${filePath}`);
    }
}

// Get files from command line or stdin
const files = process.argv.slice(2);
if (files.length > 0) {
    files.forEach(processFile);
} else {
    // Read from stdin (useful for piping from grep/awk)
    const readline = require('readline');
    const rl = readline.createInterface({
        input: process.stdin,
        terminal: false
    });

    rl.on('line', (line) => {
        if (line) processFile(line.trim());
    });
}
