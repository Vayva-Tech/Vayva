const fs = require('fs');
const path = require('path');

const ROOT_DIRS = ['apps/marketing/src', 'apps/marketplace/src', 'apps/merchant-admin/src'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // Check if file uses : JSX.Element
    // Regex for `: JSX.Element` with optional surrounding whitespace
    const jsxTypeRegex = /:\s*JSX\.Element/g;

    if (jsxTypeRegex.test(content)) {
        // Replace with : React.JSX.Element
        const newContent = content.replace(jsxTypeRegex, ': React.JSX.Element');

        if (newContent !== content) {
            content = newContent;
            modified = true;

            // Check if React is imported
            const reactImportRegex = /import\s+(?:React\s*,?\s*)?(?:{[^}]*})?\s*from\s+['"]react['"]/;
            const starImportRegex = /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/;

            const hasReactImport = reactImportRegex.test(content) || starImportRegex.test(content);

            if (!hasReactImport) {
                // Add import React from "react"; at the top
                // Try to insert after "use client"; if exists, or at very top
                if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
                    const lines = content.split('\n');
                    // Find index of use client
                    // Insert after
                    if (lines[0].includes('use client')) {
                        lines.splice(1, 0, 'import React from "react";');
                    } else {
                        // Should not happen if startsWith is true
                        lines.unshift('import React from "react";');
                    }
                    content = lines.join('\n');
                } else {
                    content = 'import React from "react";\n' + content;
                }
            }
        }
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed JSX types in ${filePath}`);
        return 1;
    }
    return 0;
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += traverse(fullPath);
        } else if (entry.isFile() && entry.name.endsWith('.tsx')) {
            count += processFile(fullPath);
        }
    }
    return count;
}

console.log('Starting global JSX namespace fix...');
let total = 0;
for (const dir of ROOT_DIRS) {
    // resolve from cwd
    const target = path.resolve(process.cwd(), dir);
    total += traverse(target);
}
console.log(`Total files fixed: ${total}`);
