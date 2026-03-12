#!/usr/bin/env node

/**
 * Sixth Pass: ULTRA AGGRESSIVE - Zero Any Mission
 * 
 * This is the nuclear option - replaces ALL remaining any with unknown
 * except for explicitly allowed cases
 */

import fs from 'fs';
import path from 'path';

const APPS_DIR = path.join(process.cwd(), 'apps');
const SERVICES_DIR = path.join(process.cwd(), 'services');
const PACKAGES_DIR = path.join(process.cwd(), 'packages');

const stats = {
    filesScanned: 0,
    filesModified: 0,
    totalFixed: 0,
    skipped: 0,
    errors: []
};

// Files/patterns to skip (acceptable any usage)
const SKIP_FILES = [
    'Button.tsx', // motion.button needs any
    'motion.ts',
    'framer',
    '.config.',
    'fix-any-violations'
];

function shouldSkipFile(filePath) {
    const skipPatterns = [
        '/node_modules/',
        '/.next/',
        '/dist/',
        '/build/',
        '/generated/',
        '.test.ts',
        '.test.tsx',
        '.spec.ts',
        '.spec.tsx',
        '/tests/',
        '.config.ts',
        '.config.js',
    ];

    // Check if file should be skipped
    if (SKIP_FILES.some(skip => filePath.includes(skip))) {
        return true;
    }

    return skipPatterns.some(pattern => filePath.includes(pattern));
}

function getAllTypeScriptFiles(dir) {
    let results = [];

    try {
        const list = fs.readdirSync(dir);

        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (!shouldSkipFile(filePath)) {
                    results = results.concat(getAllTypeScriptFiles(filePath));
                }
            } else if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !shouldSkipFile(filePath)) {
                results.push(filePath);
            }
        });
    } catch (err) {
        stats.errors.push(`Error reading directory ${dir}: ${err.message}`);
    }

    return results;
}

function fixFile(filePath) {
    try {
        let content = fs.readFileSync(filePath, 'utf8');
        const originalContent = content;

        // Check if file has eslint-disable for no-explicit-any
        if (content.includes('eslint-disable') && content.includes('no-explicit-any')) {
            stats.skipped++;
            return;
        }

        let fixCount = 0;

        // Ultra aggressive: Replace ANY occurrence of ": any" or "as any" with unknown
        // But be smart about it - use word boundaries

        const patterns = [
            // Most common remaining patterns
            { pattern: /:\s*any\s*\)/g, replacement: ': unknown)', name: 'param-any' },
            { pattern: /:\s*any\s*,/g, replacement: ': unknown,', name: 'param-any-comma' },
            { pattern: /:\s*any\s*;/g, replacement: ': unknown;', name: 'prop-any' },
            { pattern: /:\s*any\s*=/g, replacement: ': unknown =', name: 'var-any' },
            { pattern: /:\s*any\s*\|/g, replacement: ': unknown |', name: 'union-any' },
            { pattern: /\|\s*any\s/g, replacement: '| unknown ', name: 'union-any-right' },
            { pattern: /:\s*any\s*\{/g, replacement: ': unknown {', name: 'return-any' },
            { pattern: /:\s*any\s*=>/g, replacement: ': unknown =>', name: 'arrow-any' },
            { pattern: /:\s*any\s*\n/g, replacement: ': unknown\n', name: 'newline-any' },
            { pattern: /:\s*any\s*>/g, replacement: ': unknown>', name: 'generic-close-any' },
            { pattern: /<any>/g, replacement: '<unknown>', name: 'generic-any' },
            { pattern: /<any,/g, replacement: '<unknown,', name: 'generic-any-comma' },
            { pattern: /,\s*any>/g, replacement: ', unknown>', name: 'generic-any-second' },
            { pattern: /as\s+any\s*\)/g, replacement: 'as unknown)', name: 'as-any-paren' },
            { pattern: /as\s+any\s*;/g, replacement: 'as unknown;', name: 'as-any-semi' },
            { pattern: /as\s+any\s*,/g, replacement: 'as unknown,', name: 'as-any-comma' },
            { pattern: /as\s+any\s*\n/g, replacement: 'as unknown\n', name: 'as-any-newline' },
            { pattern: /as\s+any\s*\}/g, replacement: 'as unknown}', name: 'as-any-brace' },
            { pattern: /Array<any>/g, replacement: 'Array<unknown>', name: 'array-any' },
            { pattern: /Promise<any>/g, replacement: 'Promise<unknown>', name: 'promise-any' },
            { pattern: /Record<string,\s*any>/g, replacement: 'Record<string, unknown>', name: 'record-any' },
            { pattern: /Record<any,\s*any>/g, replacement: 'Record<unknown, unknown>', name: 'record-any-any' },
            { pattern: /Map<string,\s*any>/g, replacement: 'Map<string, unknown>', name: 'map-any' },
            { pattern: /Map<any,\s*any>/g, replacement: 'Map<unknown, unknown>', name: 'map-any-any' },
            { pattern: /Set<any>/g, replacement: 'Set<unknown>', name: 'set-any' },
            { pattern: /Partial<any>/g, replacement: 'Partial<unknown>', name: 'partial-any' },
            { pattern: /Readonly<any>/g, replacement: 'Readonly<unknown>', name: 'readonly-any' },
            { pattern: /Required<any>/g, replacement: 'Required<unknown>', name: 'required-any' },
            { pattern: /Pick<any,/g, replacement: 'Pick<unknown,', name: 'pick-any' },
            { pattern: /Omit<any,/g, replacement: 'Omit<unknown,', name: 'omit-any' },
            { pattern: /extends\s+any\s/g, replacement: 'extends unknown ', name: 'extends-any' },
            { pattern: /\[\]:\s*any/g, replacement: '[]: unknown', name: 'index-any' },
        ];

        patterns.forEach(({ pattern, replacement }) => {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                content = content.replace(pattern, replacement);
                fixCount += matches.length;
            }
        });

        if (content !== originalContent) {
            fs.writeFileSync(filePath, content, 'utf8');
            stats.filesModified++;
            stats.totalFixed += fixCount;
            console.log(`✓ Fixed ${fixCount} in: ${path.relative(process.cwd(), filePath)}`);
        }

    } catch (err) {
        stats.errors.push(`Error processing ${filePath}: ${err.message}`);
    }
}

function main() {
    console.log('🔧 Starting Sixth Pass (ULTRA AGGRESSIVE)...\n');
    console.log('⚠️  This will replace ALL remaining any with unknown\n');

    const directories = [APPS_DIR, SERVICES_DIR, PACKAGES_DIR].filter(dir =>
        fs.existsSync(dir)
    );

    let allFiles = [];
    directories.forEach(dir => {
        console.log(`📂 Scanning ${path.basename(dir)}...`);
        allFiles = allFiles.concat(getAllTypeScriptFiles(dir));
    });

    stats.filesScanned = allFiles.length;
    console.log(`\n📊 Found ${allFiles.length} TypeScript files\n`);

    console.log('🔨 Applying ULTRA AGGRESSIVE fixes...\n');
    allFiles.forEach(fixFile);

    console.log('\n' + '='.repeat(60));
    console.log('📈 SIXTH PASS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`Files skipped: ${stats.skipped}`);
    console.log(`Total violations fixed: ${stats.totalFixed}`);

    if (stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Sixth pass complete!');
    console.log('\n🎯 Run: pnpm lint | grep "@typescript-eslint/no-explicit-any" | wc -l');
}

main();
