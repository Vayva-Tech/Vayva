#!/usr/bin/env node

/**
 * Runtime Boundary Checker
 * 
 * Validates that Edge runtime routes don't import Node.js-only modules.
 * Run this as part of CI to catch runtime violations before deployment.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join, extname } from 'path';

const EDGE_DISALLOWED_IMPORTS = [
    'fs',
    'path',
    'crypto', // Node crypto, not Web Crypto
    'buffer',
    'stream',
    'http',
    'https',
    'net',
    'tls',
    'child_process',
    'cluster',
    'os',
    'process', // Except process.env reads
    'v8',
    'vm',
    'zlib',
];

const EDGE_DISALLOWED_PATTERNS = [
    /require\(['"]fs['"]\)/,
    /require\(['"]path['"]\)/,
    /require\(['"]crypto['"]\)/,
    /require\(['"]buffer['"]\)/,
    /new Buffer\(/,
    /Buffer\.from\(/,
    /Buffer\.alloc\(/,
];

let errors = 0;

function checkFile(filePath) {
    try {
        const content = readFileSync(filePath, 'utf-8');

        // Check if file declares Edge runtime
        const hasEdgeRuntime =
            content.includes('runtime = "edge"') ||
            content.includes("runtime = 'edge'");

        if (!hasEdgeRuntime) {
            return; // Skip non-Edge files
        }

        // Check for disallowed imports
        for (const module of EDGE_DISALLOWED_IMPORTS) {
            const importPattern = new RegExp(`from ['"]${module}['"]`);
            if (importPattern.test(content)) {
                console.error(`❌ ${filePath}: Edge runtime cannot import '${module}'`);
                errors++;
            }
        }

        // Check for disallowed patterns
        for (const pattern of EDGE_DISALLOWED_PATTERNS) {
            if (pattern.test(content)) {
                console.error(`❌ ${filePath}: Edge runtime contains disallowed pattern: ${pattern}`);
                errors++;
            }
        }

        // Check for imports from /lib/node
        if (content.includes('from "@/lib/node') || content.includes('from "../lib/node')) {
            console.error(`❌ ${filePath}: Edge runtime cannot import from /lib/node`);
            errors++;
        }

    } catch (err) {
        console.error(`⚠️  Could not read ${filePath}: ${err.message}`);
    }
}

function walkDirectory(dir) {
    try {
        const files = readdirSync(dir);

        for (const file of files) {
            const filePath = join(dir, file);
            const stat = statSync(filePath);

            if (stat.isDirectory()) {
                if (file !== 'node_modules' && file !== '.next' && file !== 'dist') {
                    walkDirectory(filePath);
                }
            } else if (extname(file) === '.ts' || extname(file) === '.tsx') {
                checkFile(filePath);
            }
        }
    } catch (err) {
        console.error(`⚠️  Could not walk directory ${dir}: ${err.message}`);
    }
}

console.log('🔍 Checking Edge runtime boundaries...\n');

// Check all apps
const appsDir = join(process.cwd(), 'apps');
const apps = readdirSync(appsDir);

for (const app of apps) {
    const appPath = join(appsDir, app, 'src');
    try {
        if (statSync(appPath).isDirectory()) {
            walkDirectory(appPath);
        }
    } catch (e) {
        // Skip apps without src directory
    }
}

if (errors > 0) {
    console.error(`\n❌ Found ${errors} runtime boundary violation(s)\n`);
    process.exit(1);
} else {
    console.log('✅ All Edge runtime boundaries are valid\n');
    process.exit(0);
}
