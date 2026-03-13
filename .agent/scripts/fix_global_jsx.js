const fs = require('fs');
const path = require('path');

const SCAN_DIRS = ['apps', 'packages', 'infra'];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts')) return 0;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // Pattern 1: Promise<JSX.Element> -> Promise<React.JSX.Element>
    const asyncJsxRegex = /Promise\s*<\s*JSX\.Element/g;
    if (asyncJsxRegex.test(content)) {
        content = content.replace(asyncJsxRegex, 'Promise<React.JSX.Element');
        modified = true;
    }

    // Pattern 2: : JSX.Element -> : React.JSX.Element
    const jsxTypeRegex = /:\s*JSX\.Element/g;
    if (jsxTypeRegex.test(content)) {
        content = content.replace(jsxTypeRegex, ': React.JSX.Element');
        modified = true;
    }

    // Pattern 3: as JSX.Element -> as React.JSX.Element
    const asJsxRegex = /as\s*JSX\.Element/g;
    if (asJsxRegex.test(content)) {
        content = content.replace(asJsxRegex, 'as React.JSX.Element');
        modified = true;
    }

    if (modified) {
        // Ensure React import if it's a .tsx file or mentions JSX
        if (filePath.endsWith('.tsx') || content.includes('React.JSX')) {
            const reactImportRegex = /import\s+(?:React\s*,?\s*)?(?:{[^}]*})?\s*from\s+['"]react['"]/;
            const starImportRegex = /import\s+\*\s+as\s+React\s+from\s+['"]react['"]/;

            if (!reactImportRegex.test(content) && !starImportRegex.test(content)) {
                if (content.startsWith('"use client";') || content.startsWith("'use client';")) {
                    const lines = content.split('\n');
                    lines.splice(1, 0, 'import React from "react";');
                    content = lines.join('\n');
                } else if (content.startsWith('"use server";') || content.startsWith("'use server';")) {
                    const lines = content.split('\n');
                    lines.splice(1, 0, 'import React from "react";');
                    content = lines.join('\n');
                } else {
                    content = 'import React from "react";\n' + content;
                }
            }
        }

        fs.writeFileSync(filePath, content);
        return 1;
    }
    return 0;
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next' || entry.name === 'generated') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += traverse(fullPath);
        } else if (entry.isFile()) {
            count += processFile(fullPath);
        }
    }
    return count;
}

console.log('Starting repository-wide JSX namespace remediation...');
let total = 0;
for (const dir of SCAN_DIRS) {
    const target = path.resolve(process.cwd(), dir);
    total += traverse(target);
}
console.log(`Total files fixed: ${total}`);
