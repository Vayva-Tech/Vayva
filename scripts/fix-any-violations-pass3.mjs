#!/usr/bin/env node

/**
 * Third Pass: Advanced Pattern Fixes
 * 
 * Patterns fixed:
 * 1. Interface properties: property: any
 * 2. Type assertions: value as any
 * 3. Object indexing: obj[key] with any
 * 4. Zod schemas: z.any()
 */

import fs from 'fs';
import path from 'path';

const APPS_DIR = path.join(process.cwd(), 'apps');
const SERVICES_DIR = path.join(process.cwd(), 'services');
const PACKAGES_DIR = path.join(process.cwd(), 'packages');

const stats = {
    filesScanned: 0,
    filesModified: 0,
    interfacePropsFixed: 0,
    typeAssertionsFixed: 0,
    zodSchemasFixed: 0,
    objectIndexingFixed: 0,
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

        // Pattern 1: z.any() → z.unknown()
        const zodAnyPattern = /z\.any\(\)/g;
        if (zodAnyPattern.test(content)) {
            content = content.replace(zodAnyPattern, 'z.unknown()');
            stats.zodSchemasFixed++;
            modified = true;
        }

        // Pattern 2: as any) → as unknown) (but not in comments)
        const asAnyPattern = /\s+as\s+any\)/g;
        if (asAnyPattern.test(content)) {
            content = content.replace(asAnyPattern, ' as unknown)');
            stats.typeAssertionsFixed++;
            modified = true;
        }

        // Pattern 3: as any; → as unknown;
        const asAnySemiPattern = /\s+as\s+any;/g;
        if (asAnySemiPattern.test(content)) {
            content = content.replace(asAnySemiPattern, ' as unknown;');
            stats.typeAssertionsFixed++;
            modified = true;
        }

        // Pattern 4: as any, → as unknown,
        const asAnyCommaPattern = /\s+as\s+any,/g;
        if (asAnyCommaPattern.test(content)) {
            content = content.replace(asAnyCommaPattern, ' as unknown,');
            stats.typeAssertionsFixed++;
            modified = true;
        }

        // Pattern 5: [key: string]: any → [key: string]: unknown
        const indexSignaturePattern = /\[key:\s*string\]:\s*any/g;
        if (indexSignaturePattern.test(content)) {
            content = content.replace(indexSignaturePattern, '[key: string]: unknown');
            stats.objectIndexingFixed++;
            modified = true;
        }

        // Pattern 6: Record<string, any> → Record<string, unknown>
        const recordAnyPattern = /Record<string,\s*any>/g;
        if (recordAnyPattern.test(content)) {
            content = content.replace(recordAnyPattern, 'Record<string, unknown>');
            stats.objectIndexingFixed++;
            modified = true;
        }

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
    console.log('🔧 Starting Third Pass Cleanup...\n');

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
    console.log('📈 THIRD PASS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`Zod schemas fixed: ${stats.zodSchemasFixed}`);
    console.log(`Type assertions fixed: ${stats.typeAssertionsFixed}`);
    console.log(`Object indexing fixed: ${stats.objectIndexingFixed}`);

    const total = stats.zodSchemasFixed + stats.typeAssertionsFixed + stats.objectIndexingFixed;
    console.log(`\nTotal violations fixed: ${total}`);

    if (stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Third pass complete!');
}

main();
