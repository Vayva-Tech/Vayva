#!/usr/bin/env node

/**
 * Fourth Pass: Final Cleanup
 * 
 * Patterns fixed:
 * 1. Function return types: ): any =>
 * 2. Variable declarations: const x: any
 * 3. Interface/type properties in objects
 * 4. Array.map/filter/reduce callbacks
 * 5. Object.keys/values/entries
 */

import fs from 'fs';
import path from 'path';

const APPS_DIR = path.join(process.cwd(), 'apps');
const SERVICES_DIR = path.join(process.cwd(), 'services');
const PACKAGES_DIR = path.join(process.cwd(), 'packages');

const stats = {
    filesScanned: 0,
    filesModified: 0,
    returnTypesFixed: 0,
    variableDeclarationsFixed: 0,
    interfacePropsFixed: 0,
    callbacksFixed: 0,
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

        // Pattern 1: ): any => → ): unknown =>
        const returnTypeArrowPattern = /\):\s*any\s*=>/g;
        if (returnTypeArrowPattern.test(content)) {
            content = content.replace(returnTypeArrowPattern, '): unknown =>');
            stats.returnTypesFixed++;
            modified = true;
        }

        // Pattern 2: ): any { → ): unknown {
        const returnTypeBracePattern = /\):\s*any\s*\{/g;
        if (returnTypeBracePattern.test(content)) {
            content = content.replace(returnTypeBracePattern, '): unknown {');
            stats.returnTypesFixed++;
            modified = true;
        }

        // Pattern 3: const x: any = → const x: unknown =
        const constAnyPattern = /const\s+(\w+):\s*any\s*=/g;
        if (constAnyPattern.test(content)) {
            content = content.replace(constAnyPattern, 'const $1: unknown =');
            stats.variableDeclarationsFixed++;
            modified = true;
        }

        // Pattern 4: let x: any = → let x: unknown =
        const letAnyPattern = /let\s+(\w+):\s*any\s*=/g;
        if (letAnyPattern.test(content)) {
            content = content.replace(letAnyPattern, 'let $1: unknown =');
            stats.variableDeclarationsFixed++;
            modified = true;
        }

        // Pattern 5: var x: any = → var x: unknown =
        const varAnyPattern = /var\s+(\w+):\s*any\s*=/g;
        if (varAnyPattern.test(content)) {
            content = content.replace(varAnyPattern, 'var $1: unknown =');
            stats.variableDeclarationsFixed++;
            modified = true;
        }

        // Pattern 6: .map((x: any) => → .map((x: unknown) =>
        const mapCallbackPattern = /\.map\(\((\w+):\s*any\)\s*=>/g;
        if (mapCallbackPattern.test(content)) {
            content = content.replace(mapCallbackPattern, '.map(($1: unknown) =>');
            stats.callbacksFixed++;
            modified = true;
        }

        // Pattern 7: .filter((x: any) => → .filter((x: unknown) =>
        const filterCallbackPattern = /\.filter\(\((\w+):\s*any\)\s*=>/g;
        if (filterCallbackPattern.test(content)) {
            content = content.replace(filterCallbackPattern, '.filter(($1: unknown) =>');
            stats.callbacksFixed++;
            modified = true;
        }

        // Pattern 8: .reduce((acc: any, → .reduce((acc: unknown,
        const reduceCallbackPattern = /\.reduce\(\((\w+):\s*any,/g;
        if (reduceCallbackPattern.test(content)) {
            content = content.replace(reduceCallbackPattern, '.reduce(($1: unknown,');
            stats.callbacksFixed++;
            modified = true;
        }

        // Pattern 9: property: any; → property: unknown;
        const propertyAnyPattern = /(\w+):\s*any;/g;
        const matches = content.match(propertyAnyPattern);
        if (matches && matches.length > 0) {
            // Only replace if it looks like an interface/type property (indented)
            const lines = content.split('\n');
            let lineModified = false;

            for (let i = 0; i < lines.length; i++) {
                const line = lines[i];
                // Check if line is indented (likely a property)
                if (/^\s{2,}\w+:\s*any;/.test(line)) {
                    lines[i] = line.replace(/:\s*any;/, ': unknown;');
                    lineModified = true;
                    stats.interfacePropsFixed++;
                }
            }

            if (lineModified) {
                content = lines.join('\n');
                modified = true;
            }
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
    console.log('🔧 Starting Fourth Pass Cleanup...\n');

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
    console.log('📈 FOURTH PASS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`Return types fixed: ${stats.returnTypesFixed}`);
    console.log(`Variable declarations fixed: ${stats.variableDeclarationsFixed}`);
    console.log(`Interface properties fixed: ${stats.interfacePropsFixed}`);
    console.log(`Callbacks fixed: ${stats.callbacksFixed}`);

    const total = stats.returnTypesFixed + stats.variableDeclarationsFixed +
        stats.interfacePropsFixed + stats.callbacksFixed;
    console.log(`\nTotal violations fixed: ${total}`);

    if (stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Fourth pass complete!');
}

main();
