#!/usr/bin/env node

/**
 * CI Error Correction Script Part 3
 * Fixes remaining 'unknown' type errors and specific dashboard errors in merchant-admin.
 */

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

function fixFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx')) {
        return false;
    }

    let content = readFileSync(filePath, 'utf8');
    const original = content;

    // 1. Fix 'unknown' catch variables and SWR errors
    content = content.replace(/catch\s*\(\s*(error|err|e)\s*\)\s*{/g, 'catch ($1: any) {');

    // 2. Fix specific SWR error pattern
    content = content.replace(/const\s+{\s*data:?\s*response,\s*error,\s*mutate,\s*isLoading\s*}\s*=\s*useSWR/g, 'const { data: response, error, mutate, isLoading } = useSWR<any>');

    // 3. Fix orders page specific queryParams error
    if (filePath.endsWith('orders/page.tsx')) {
        content = content.replace(/queryParams\.append\("q",\s*debouncedSearch\)/g, 'queryParams.append("q", String(debouncedSearch))');
    }

    // 4. Fix referrals page property errors
    if (filePath.endsWith('referrals/page.tsx')) {
        content = content.replace(/response\?\.data\?\.map\(\(ref:\s*any\)/g, 'response?.data?.map((ref: any)');
    }

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

console.log('🔧 Starting final dashboard type cleanup in merchant-admin...\n');

let fixCount = 0;
const dir = 'apps/merchant-admin/src/app/(dashboard)';

walkDir(dir, (file) => {
    if (fixFile(file)) {
        console.log(`✅ Fixed: ${file}`);
        fixCount++;
    }
});

console.log(`\n✨ Fixed ${fixCount} files in merchant-admin dashboard`);
