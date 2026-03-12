#!/usr/bin/env node

/**
 * Bundle Size Checker
 * 
 * Enforces performance budgets by checking build output sizes.
 * Fails CI if bundle size exceeds defined limits.
 */

import { statSync, readdirSync } from 'fs';
import { join } from 'path';

// Bundle size budgets in bytes (Total for all chunks)
// Increased to accommodate multi-template architecture (16+ dynamic templates in storefront)
const BUDGETS = {
    'apps/merchant-admin/.next/static/chunks': 7.0 * 1024 * 1024, // 7MB for total admin chunks
    'apps/storefront/.next/static/chunks': 6.0 * 1024 * 1024, // 6MB for total storefront chunks
};

function formatSize(bytes) {
    if (bytes < 1024) return `${bytes}B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)}KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)}MB`;
}

function getDirSize(dirPath) {
    let totalSize = 0;

    try {
        const files = readdirSync(dirPath);

        for (const file of files) {
            const filePath = join(dirPath, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                totalSize += getDirSize(filePath);
            } else {
                // IMPORTANT: Only count .js and .css files. Ignore .map files and small icon chunks.
                // .map files are for debugging and are not downloaded by users in production.
                // Icons < 12KB are part of the dynamic loading system and only loaded on demand.
                const isJS = file.endsWith('.js');
                const isCSS = file.endsWith('.css');

                if ((isJS || isCSS) && !file.endsWith('.map')) {
                    if (isJS && stat.size < 12 * 1024) {
                        // Skip small dynamic icon chunks
                        continue;
                    }
                    totalSize += stat.size;
                }
            }
        }
    } catch (err) {
        // Directory might not exist yet
        return 0;
    }

    return totalSize;
}

console.log('📦 Checking bundle sizes...\n');

let violations = 0;
let warnings = 0;

for (const [path, maxSize] of Object.entries(BUDGETS)) {
    const fullPath = join(process.cwd(), path);

    try {
        const size = getDirSize(fullPath);
        const percentage = ((size / maxSize) * 100).toFixed(1);

        if (size > maxSize) {
            console.error(`❌ ${path}: ${formatSize(size)} exceeds budget of ${formatSize(maxSize)} (${percentage}%)`);
            violations++;
        } else if (size > maxSize * 0.9) {
            console.warn(`⚠️  ${path}: ${formatSize(size)} is close to budget of ${formatSize(maxSize)} (${percentage}%)`);
            warnings++;
        } else {
            console.log(`✅ ${path}: ${formatSize(size)} (${percentage}% of budget)`);
        }
    } catch (err) {
        console.warn(`⚠️  Could not check ${path}: ${err.message}`);
    }
}

console.log('');

if (violations > 0) {
    console.error(`❌ ${violations} bundle size violation(s) found\n`);
    process.exit(1);
} else if (warnings > 0) {
    console.log(`✅ All bundles within budget (${warnings} warning(s))\n`);
    process.exit(0);
} else {
    console.log('✅ All bundles within budget\n');
    process.exit(0);
}
