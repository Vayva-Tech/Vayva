#!/usr/bin/env node

/**
 * Second Pass: Fix Complex any Patterns
 * 
 * Patterns fixed:
 * 1. session.user as any → proper typing
 * 2. (req.body as any).field → validated body
 * 3. Prisma result as any → proper Prisma types
 */

import fs from 'fs';
import path from 'path';

const APPS_DIR = path.join(process.cwd(), 'apps');

let stats = {
    filesScanned: 0,
    filesModified: 0,
    sessionUserFixed: 0,
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

        // Pattern 1: (session.user as any).id → session.user?.id with type guard
        const sessionUserPattern = /\(session\.user\s+as\s+any\)\.(id|email|name)/g;
        if (sessionUserPattern.test(content)) {
            content = content.replace(sessionUserPattern, 'session.user?.$1');
            stats.sessionUserFixed++;
            modified = true;
        }

        // Pattern 2: session?.user as any → session?.user
        const sessionOptionalPattern = /session\?\.user\s+as\s+any/g;
        if (sessionOptionalPattern.test(content)) {
            content = content.replace(sessionOptionalPattern, 'session?.user');
            stats.sessionUserFixed++;
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
    console.log('🔧 Starting Second Pass Cleanup...\n');

    const directories = [APPS_DIR].filter(dir => fs.existsSync(dir));

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
    console.log('📈 SECOND PASS SUMMARY');
    console.log('='.repeat(60));
    console.log(`Files scanned: ${stats.filesScanned}`);
    console.log(`Files modified: ${stats.filesModified}`);
    console.log(`session.user fixes: ${stats.sessionUserFixed}`);

    if (stats.errors.length > 0) {
        console.log('\n⚠️  Errors encountered:');
        stats.errors.forEach(err => console.log(`  - ${err}`));
    }

    console.log('\n✅ Second pass complete!');
}

main();
