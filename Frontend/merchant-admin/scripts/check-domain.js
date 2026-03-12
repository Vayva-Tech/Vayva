#!/usr/bin/env node

/**
 * DOMAIN REGRESSION CHECK
 * Ensures no vayva.com references exist in the codebase
 * 
 * Run: node scripts/check-domain.js
 * Exit code: 0 if clean, 1 if .com found
 */

const fs = require('fs');
const path = require('path');

const FORBIDDEN_PATTERNS = [
    /vayva\.com/,
    /@vayva\.com/,
];

const EXCLUDE_PATTERNS = [
    /node_modules/,
    /\.next/,
    /\.git/,
    /dist/,
    /build/,
    /coverage/,
    /\.lock$/,
    /package-lock\.json$/,
    /check-domain\.js$/, // Exclude this file itself
    /migrate-domain\.js$/, // Exclude migration script
];

function shouldCheckFile(filePath) {
    return EXCLUDE_PATTERNS.every(pattern => !pattern.test(filePath));
}

function checkFile(filePath) {
    if (!shouldCheckFile(filePath)) return [];

    try {
        const content = fs.readFileSync(filePath, 'utf8');
        const violations = [];

        content.split('\n').forEach((line, index) => {
            FORBIDDEN_PATTERNS.forEach(pattern => {
                if (pattern.test(line)) {
                    violations.push({
                        file: filePath,
                        line: index + 1,
                        content: line.trim(),
                        pattern: pattern.toString()
                    });
                }
            });
        });

        return violations;
    } catch (_error) {
        // Skip files that can't be read as text
        return [];
    }
}

function walkDir(dir, callback) {
    try {
        const files = fs.readdirSync(dir);

        files.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat.isDirectory()) {
                if (shouldCheckFile(filePath)) {
                    walkDir(filePath, callback);
                }
            } else {
                callback(filePath);
            }
        });
    } catch (_error) {
        // Skip directories we can't read
    }
}

// Main execution
const srcDir = path.join(__dirname, '../src');
const publicDir = path.join(__dirname, '../public');

console.log('🔍 Checking for vayva.com references...\n');

const allViolations = [];

[srcDir, publicDir].forEach(dir => {
    if (fs.existsSync(dir)) {
        walkDir(dir, (filePath) => {
            const violations = checkFile(filePath);
            allViolations.push(...violations);
        });
    }
});

if (allViolations.length === 0) {
    console.log('✅ PASS: No vayva.com references found!');
    console.log('   Domain migration is complete and verified.\n');
    process.exit(0);
} else {
    console.log(`❌ FAIL: Found ${allViolations.length} vayva.com reference(s):\n`);

    allViolations.forEach(v => {
        const relativePath = path.relative(process.cwd(), v.file);
        console.log(`   ${relativePath}:${v.line}`);
        console.log(`   ${v.content}`);
        console.log('');
    });

    console.log('⚠️  Please replace all vayva.com with vayva.ng');
    console.log('   Run: node scripts/migrate-domain.js\n');
    process.exit(1);
}
