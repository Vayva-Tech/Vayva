#!/usr/bin/env node

/**
 * DOMAIN MIGRATION SCRIPT
 * Replaces all vayva.com references with vayva.ng
 * 
 * Run: node scripts/migrate-domain.js
 */

const fs = require('fs');
const path = require('path');

const REPLACEMENTS = [
    // URLs
    { from: /https:\/\/vayva\.com/g, to: 'https://vayva.ng' },
    { from: /http:\/\/vayva\.com/g, to: 'http://vayva.ng' },
    { from: /"vayva\.com"/g, to: '"vayva.ng"' },
    { from: /'vayva\.com'/g, to: "'vayva.ng'" },

    // Emails
    { from: /@vayva\.com/g, to: '@vayva.ng' },
    { from: /support@vayva\.io/g, to: 'support@vayva.ng' },
    { from: /hello@vayva\.io/g, to: 'hello@vayva.ng' },
    { from: /careers@vayva\.io/g, to: 'careers@vayva.ng' },
    { from: /legal@vayva\.io/g, to: 'legal@vayva.ng' },

    // Subdomains (storage, api, etc.)
    { from: /storage\.vayva\.com/g, to: 'storage.vayva.ng' },
    { from: /api\.vayva\.com/g, to: 'api.vayva.ng' },
    { from: /pay\.vayva\.com/g, to: 'pay.vayva.ng' },
    { from: /docs\.vayva\.com/g, to: 'docs.vayva.ng' },
    { from: /cdn\.vayva\.com/g, to: 'cdn.vayva.ng' },
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
];

function shouldProcessFile(filePath) {
    return EXCLUDE_PATTERNS.every(pattern => !pattern.test(filePath));
}

function processFile(filePath) {
    if (!shouldProcessFile(filePath)) return { changed: false };

    try {
        let content = fs.readFileSync(filePath, 'utf8');
        let changed = false;

        REPLACEMENTS.forEach(({ from, to }) => {
            if (from.test(content)) {
                content = content.replace(from, to);
                changed = true;
            }
        });

        if (changed) {
            fs.writeFileSync(filePath, content, 'utf8');
            return { changed: true, file: filePath };
        }

        return { changed: false };
    } catch (error) {
        console.error(`Error processing ${filePath}:`, error.message);
        return { changed: false, error: true };
    }
}

function walkDir(dir, callback) {
    const files = fs.readdirSync(dir);

    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);

        if (stat.isDirectory()) {
            if (shouldProcessFile(filePath)) {
                walkDir(filePath, callback);
            }
        } else {
            callback(filePath);
        }
    });
}

// Main execution
const srcDir = path.join(__dirname, '../src');
const publicDir = path.join(__dirname, '../public');

console.log('🔄 Starting domain migration: vayva.com → vayva.ng\n');

const changedFiles = [];
let errorCount = 0;

[srcDir, publicDir].forEach(dir => {
    if (fs.existsSync(dir)) {
        walkDir(dir, (filePath) => {
            const result = processFile(filePath);
            if (result.changed) {
                changedFiles.push(result.file);
                console.log(`✅ Updated: ${path.relative(process.cwd(), result.file)}`);
            }
            if (result.error) {
                errorCount++;
            }
        });
    }
});

console.log(`\n📊 Migration Summary:`);
console.log(`   Files updated: ${changedFiles.length}`);
console.log(`   Errors: ${errorCount}`);

if (changedFiles.length > 0) {
    console.log(`\n✨ Migration complete! All vayva.com references replaced with vayva.ng`);
} else {
    console.log(`\n✅ No files needed updating - domain already migrated!`);
}
