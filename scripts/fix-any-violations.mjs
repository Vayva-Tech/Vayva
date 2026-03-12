#!/usr/bin/env node

/**
 * Automated Type Safety Cleanup Script
 * 
 * Fixes common `any` type violations across the codebase
 * Patterns fixed:
 * 1. catch (error: any) → catch (error: unknown)
 * 2. req.user as any → req.user as AuthUser
 * 3. req.body as any → proper typing
 * 4. req.params as any → typed params
 * 5. : any[] → : unknown[]
 * 6. : any = → : unknown =
 * 7. Function params: (param: any) → (param: unknown)
 */

import fs from 'fs';
import path from 'path';

const APPS_DIR = path.join(process.cwd(), 'apps');
const SERVICES_DIR = path.join(process.cwd(), 'services');
const PACKAGES_DIR = path.join(process.cwd(), 'packages');

// Patterns to fix
const PATTERNS = [
    // Pattern 1: catch (error: any)
    {
        name: 'catch-error-any',
        pattern: /catch\s*\(\s*(\w+)\s*:\s*any\s*\)/g,
        replacement: 'catch ($1: unknown)',
        needsErrorHandling: true
    },

    // Pattern 2: req.user as any
    {
        name: 'req-user-any',
        pattern: /req\.user\s+as\s+any/g,
        replacement: 'req.user as { sub: string; email?: string }',
        needsImport: false
    },

    // Pattern 3: req.body as any
    {
        name: 'req-body-any',
        pattern: /req\.body\s+as\s+any/g,
        replacement: 'req.body as unknown',
        needsValidation: true
    },

    // Pattern 4: req.params as any
    {
        name: 'req-params-any',
        pattern: /req\.params\s+as\s+any/g,
        replacement: 'req.params as Record<string, string>',
        needsImport: false
    },

    // Pattern 5: : any[]
    {
        name: 'any-array',
        pattern: /:\s*any\[\]/g,
        replacement: ': unknown[]',
        needsImport: false
    },

    // Pattern 6: : any =
    {
        name: 'any-assignment',
        pattern: /:\s*any\s*=/g,
        replacement: ': unknown =',
        needsImport: false
    },

    // Pattern 7: Function params (param: any)
    {
        name: 'function-param-any',
        pattern: /\((\w+):\s*any\)/g,
        replacement: '($1: unknown)',
        needsImport: false
    },

    // Pattern 8: event: any
    {
        name: 'event-any',
        pattern: /(\w+):\s*any\s*\)/g,
        replacement: '$1: unknown)',
        needsImport: false
    },

    // Pattern 9: response: any
    {
        name: 'response-any',
        pattern: /response:\s*any/g,
        replacement: 'response: unknown',
        needsImport: false
    },

    // Pattern 10: data: any
    {
        name: 'data-any',
        pattern: /data:\s*any/g,
        replacement: 'data: unknown',
        needsImport: false
    }
];

let stats = {
    filesScanned: 0,
    filesModified: 0,
    patternsFixed: {},
    errors: []
};

// Initialize pattern stats
PATTERNS.forEach(p => {
    stats.patternsFixed[p.name] = 0;
});

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
        '.config.js'
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
        let originalContent = content;

        PATTERNS.forEach(pattern => {
            const matches = content.match(pattern.pattern);
            if (matches && matches.length > 0) {
                content = content.replace(pattern.pattern, pattern.replacement);
                stats.patternsFixed[pattern.name] += matches.length;
                modified = true;
            }
        });

        if (modified) {
            fs.writeFileSync(filePath, content, 'utf8');
            stats.filesModified++;
            console.log(`✓ Fixed: ${path.relative(process.cwd(), filePath)}`);
        }

    } catch (err) {
        stats.errors.push(`Error processing ${filePath}: ${err.message}`);
    }
}

function main() {
    console.log('🔧 Starting Automated Type Safety Cleanup...\n');

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

    console.log('🔨 Applying fixes...\n');
    allFiles.forEach(fixFile);

    console.log('\n' + '='.repeat(60));
    console.log('📈 CLEANUP SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log('\nPatterns fixed:');

    Object.entries(stats.patternsFixed).forEach(([pattern, count]) => {
        if (count > 0) {
            console.log(`  ${pattern}: ${count}`);
        }
    });

    const totalFixed = Object.values(stats.patternsFixed).reduce((a, b) => a + b, 0);
    console.log(`\nTotal violations fixed: ${totalFixed}`);

    if (stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Cleanup complete!');
    console.log('\nNext steps:');
    console.log('1. Run: pnpm run typecheck');
    console.log('2. Run: pnpm lint');
    console.log('3. Review changes and commit');
}

main();
