const fs = require('fs');
const path = require('path');

const ROOT_DIRS = ['apps/marketing/src', 'apps/marketplace/src', 'apps/merchant-admin/src'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // Pattern 1: Promise<JSX.Element> -> Promise<React.JSX.Element>
    // Regex matches "Promise<JSX.Element" with optional whitespace
    const asyncJsxRegex = /Promise\s*<\s*JSX\.Element/g;

    // Pattern 2: Explicit : JSX.Element (re-run as backup)
    const jsxTypeRegex = /:\s*JSX\.Element/g;

    if (asyncJsxRegex.test(content)) {
        content = content.replace(asyncJsxRegex, 'Promise<React.JSX.Element');
        modified = true;
    }

    if (jsxTypeRegex.test(content)) {
        content = content.replace(jsxTypeRegex, ': React.JSX.Element');
        modified = true;
    }

    if (modified) {
        // Ensure React import
        const reactImportRegex = /import\s+(?:React\s*,?\s*)?(?:{[^}]*})?\s*from\s+['"]react['"]/;
        const starImportRegex = /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/;

        if (!reactImportRegex.test(content) && !starImportRegex.test(content)) {
            if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
                const lines = content.split('\n');
                if (lines[0].includes('use client')) {
                    lines.splice(1, 0, 'import React from "react";');
                } else {
                    lines.unshift('import React from "react";');
                }
                content = lines.join('\n');
            } else {
                content = 'import React from "react";\n' + content;
            }
        }

        fs.writeFileSync(filePath, content);
        console.log(`Fixed Async JSX types in ${filePath}`);
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

console.log('Starting Async JSX fix...');
let total = 0;
for (const dir of ROOT_DIRS) {
    const target = path.resolve(process.cwd(), dir);
    total += traverse(target);
}
console.log(`Total files fixed: ${total}`);
