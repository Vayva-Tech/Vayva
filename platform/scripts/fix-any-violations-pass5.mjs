#!/usr/bin/env node

/**
 * Fifth Pass: Aggressive Final Cleanup
 * 
 * This pass targets remaining stubborn patterns with more aggressive replacements
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
    errors: []
};

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
        'fix-any-violations'
    ];

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
        let modified = false;
        let fixCount = 0;

        // Aggressive patterns - replace remaining any with unknown
        const patterns = [
            // 1. <any> type assertions
            { pattern: /<any>/g, replacement: '<unknown>', name: 'generic-any' },

            // 2. as any\n
            { pattern: /\s+as\s+any\n/g, replacement: ' as unknown\n', name: 'as-any-newline' },

            // 3. : any\n
            { pattern: /:\s*any\n/g, replacement: ': unknown\n', name: 'type-any-newline' },

            // 4. : any,\n
            { pattern: /:\s*any,\n/g, replacement: ': unknown,\n', name: 'type-any-comma-newline' },

            // 5. : any }
            { pattern: /:\s*any\s*}/g, replacement: ': unknown }', name: 'type-any-brace' },

            // 6. : any |
            { pattern: /:\s*any\s*\|/g, replacement: ': unknown |', name: 'type-any-union' },

            // 7. | any
            { pattern: /\|\s*any\s/g, replacement: '| unknown ', name: 'union-any' },

            // 8. Array<any>
            { pattern: /Array<any>/g, replacement: 'Array<unknown>', name: 'array-generic-any' },

            // 9. Promise<any>
            { pattern: /Promise<any>/g, replacement: 'Promise<unknown>', name: 'promise-any' },

            // 10. Set<any>
            { pattern: /Set<any>/g, replacement: 'Set<unknown>', name: 'set-any' },

            // 11. Map<string, any>
            { pattern: /Map<string,\s*any>/g, replacement: 'Map<string, unknown>', name: 'map-any' },

            // 12. Map<any, any>
            { pattern: /Map<any,\s*any>/g, replacement: 'Map<unknown, unknown>', name: 'map-any-any' },

            // 13. Partial<any>
            { pattern: /Partial<any>/g, replacement: 'Partial<unknown>', name: 'partial-any' },

            // 14. Readonly<any>
            { pattern: /Readonly<any>/g, replacement: 'Readonly<unknown>', name: 'readonly-any' },

            // 15. extends any
            { pattern: /extends\s+any\s/g, replacement: 'extends unknown ', name: 'extends-any' },
        ];

        patterns.forEach(({ pattern, replacement, name }) => {
            const matches = content.match(pattern);
            if (matches && matches.length > 0) {
                content = content.replace(pattern, replacement);
                fixCount += matches.length;
                modified = true;
            }
        });

        if (modified) {
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
    console.log('🔧 Starting Fifth Pass (Aggressive Cleanup)...\n');

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

    console.log('🔨 Applying aggressive fixes...\n');
    allFiles.forEach(fixFile);

    console.log('\n' + '='.repeat(60));
    console.log('📈 FIFTH PASS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`Total violations fixed: ${stats.totalFixed}`);

    if (stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Fifth pass complete!');
    console.log('\nRun: pnpm lint | grep "@typescript-eslint/no-explicit-any" | wc -l');
    console.log('To see remaining violations');
}

main();
