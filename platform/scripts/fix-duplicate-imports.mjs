#!/usr/bin/env node

/**
 * Codemod to consolidate duplicate @vayva/ui imports
 * 
 * This script finds files with multiple import statements from @vayva/ui
 * and consolidates them into a single import statement.
 */

import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join } from 'path';

const ROOT = process.cwd();

// Recursively find all TypeScript/TSX files
function findFiles(dir, pattern = /\.(ts|tsx)$/) {
    const results = [];

    try {
        const entries = readdirSync(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = join(dir, entry.name);

            // Skip node_modules, dist, .next, etc.
            if (entry.name === 'node_modules' || entry.name === 'dist' ||
                entry.name === '.next' || entry.name === '.turbo' ||
                entry.name === 'build' || entry.name === 'coverage') {
                continue;
            }

            if (entry.isDirectory()) {
                results.push(...findFiles(fullPath, pattern));
            } else if (entry.isFile() && pattern.test(entry.name)) {
                results.push(fullPath);
            }
        }
    } catch (error) {
        // Skip directories we can't read
    }

    return results;
}

// Find all files in apps directory
const appsDir = join(ROOT, 'apps');
const files = findFiles(appsDir);

let fixedCount = 0;
let errorCount = 0;

console.log(`🔍 Scanning ${files.length} files for duplicate @vayva/ui imports...\n`);

files.forEach(filePath => {
    try {
        const content = readFileSync(filePath, 'utf-8');
        const lines = content.split('\n');

        // Find all @vayva/ui import lines
        const importLines = [];
        const importIndices = [];

        lines.forEach((line, index) => {
            if (line.match(/^import\s+.*from\s+["']@vayva\/ui["'];?\s*$/)) {
                importLines.push(line);
                importIndices.push(index);
            }
        });

        // Only process if there are multiple imports
        if (importLines.length > 1) {
            // Extract all imported items
            const allImports = new Set();
            let hasTypeImport = false;

            importLines.forEach(line => {
                // Check for type imports
                if (line.includes('import type')) {
                    hasTypeImport = true;
                }

                // Extract imports between { and }
                const match = line.match(/import\s+(?:type\s+)?\{([^}]+)\}/);
                if (match) {
                    const items = match[1].split(',').map(item => item.trim());
                    items.forEach(item => allImports.add(item));
                }
            });

            if (allImports.size > 0) {
                // Create consolidated import
                const sortedImports = Array.from(allImports).sort();
                const typePrefix = hasTypeImport ? 'type ' : '';
                const consolidatedImport = `import ${typePrefix}{ ${sortedImports.join(', ')} } from "@vayva/ui";`;

                // Remove old imports and add new one at the first import position
                const newLines = [...lines];

                // Remove all old import lines (in reverse to maintain indices)
                for (let i = importIndices.length - 1; i >= 0; i--) {
                    newLines.splice(importIndices[i], 1);
                }

                // Insert consolidated import at the first import position
                newLines.splice(importIndices[0], 0, consolidatedImport);

                const newContent = newLines.join('\n');
                writeFileSync(filePath, newContent, 'utf-8');

                const relativePath = filePath.replace(ROOT + '/', '');
                console.log(`✅ Fixed: ${relativePath}`);
                console.log(`   ${importLines.length} imports → 1 import (${sortedImports.length} items)`);
                fixedCount++;
            }
        }
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error.message);
        errorCount++;
    }
});

console.log(`\n📊 Summary:`);
console.log(`   ✅ Fixed: ${fixedCount} files`);
console.log(`   ❌ Errors: ${errorCount} files`);
console.log(`   📁 Total scanned: ${files.length} files`);

if (fixedCount > 0) {
    console.log(`\n✨ Run 'pnpm lint' to verify the changes.`);
}

process.exit(errorCount > 0 ? 1 : 0);
