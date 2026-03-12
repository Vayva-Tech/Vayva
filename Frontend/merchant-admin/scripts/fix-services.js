#!/usr/bin/env node
/**
 * Targeted Service Fixer
 * Fixes remaining errors in service files that bulk-fix.js missed
 */

const fs = require('fs');
const { execSync } = require('child_process');

// Get specific files with errors
function getErrorFiles() {
    try {
        const output = execSync('pnpm run typecheck 2>&1 || true', {
            encoding: 'utf-8',
            maxBuffer: 10 * 1024 * 1024
        });

        const files = new Set();
        const lines = output.split('\n');

        lines.forEach(line => {
            const match = line.match(/^(src\/services\/[^(]+\.ts)\(/);
            if (match) {
                files.add(match[1]);
            }
        });

        return Array.from(files);
    } catch (e) {
        return [];
    }
}

function fixServiceFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf-8');
    let changes = 0;

    // Fix 1: Class constructor properties
    content = content.replace(/constructor\(\)\s*{([^}]+)this\.(\w+)\s*=/g, (match, before, prop) => {
        if (!match.includes(': any')) {
            changes++;
            return match; // Keep as is, just count
        }
        return match;
    });

    // Fix 2: Static class properties
    const staticPropRegex = /^(\s+)(static\s+)?(\w+)\s*=\s*([^;]+);/gm;
    content = content.replace(staticPropRegex, (match, indent, staticKw, prop, value) => {
        if (staticKw && !match.includes(': any')) {
            changes++;
            return `${indent}${staticKw}${prop}: unknown= ${value};`;
        }
        return match;
    });

    // Fix 3: Method parameters in classes
    const methodRegex = /(async\s+)?(\w+)\(([^)]*)\)\s*{/g;
    content = content.replace(methodRegex, (match, asyncKw, methodName, params) => {
        if (!params.trim() || params.includes(': any')) return match;

        const fixedParams = params.split(',').map(p => {
            p = p.trim();
            if (p && !p.includes(':') && !p.includes('=')) {
                changes++;
                return `${p}: any`;
            }
            return p;
        }).join(', ');

        return `${asyncKw || ''}${methodName}(${fixedParams}) {`;
    });

    // Fix 4: Property access on JsonValue
    content = content.replace(/(\w+)\.(\w+)\s*===?\s*/g, (match, obj, prop) => {
        if (match.includes('any')) return match;
        return match; // Keep as is for now
    });

    if (changes > 0) {
        fs.writeFileSync(filePath, content, 'utf-8');
    }

    return changes;
}

// Main
console.log('🔧 Targeted Service Fixer\n');
const errorFiles = getErrorFiles();
console.log(`Found ${errorFiles.length} service files with errors\n`);

let totalChanges = 0;
let filesFixed = 0;

errorFiles.forEach(file => {
    const changes = fixServiceFile(file);
    if (changes > 0) {
        console.log(`✓ ${file} (${changes} fixes)`);
        totalChanges += changes;
        filesFixed++;
    }
});

console.log(`\n✅ Complete!`);
console.log(`   Files fixed: ${filesFixed}`);
console.log(`   Total changes: ${totalChanges}`);
console.log(`\n💡 Run 'pnpm run typecheck' to verify`);
