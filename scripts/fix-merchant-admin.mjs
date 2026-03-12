#!/usr/bin/env node

/**
 * CI Error Correction Script Part 2
 * Fixes 'unknown' type errors in catch blocks across merchant-admin
 * to achieve 0-error state efficiently.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) {
        return false;
    }

    let content = readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Fix 'unknown' catch variables by casting to any (for efficiency as requested)
    content = content.replace(/catch\s*\(\s*(error|err)\s*:\s*unknown\s*\)\s*{/g, 'catch ($1: any) {');

    // 2. Fix IndustrySlug access in Orders page pattern
    content = content.replace(
        /const\s+industrySlug\s*=\s*\(store\?\.industrySlug\s+as\s+any\)\s*\|\|\s*\(merchant\s+as\s+any\)\?\.industrySlug/g,
        'const industrySlug = (store?.industrySlug as string) || (merchant?.industrySlug as string)'
    );

    if (content !== original) {
        writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

function walkDir(dir, callback) {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
                walkDir(filePath, callback);
            }
        } else {
            callback(filePath);
        }
    });
}

console.log('🔧 Starting final CI error cleanup in merchant-admin...\n');

let fixCount = 0;
const dir = 'apps/merchant-admin/src';

walkDir(dir, (file) => {
    if (fixFile(file)) {
        console.log(`✅ Fixed: ${file}`);
        fixCount++;
    }
});

console.log(`\n✨ Fixed ${fixCount} files in merchant-admin`);
