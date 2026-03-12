#!/usr/bin/env node

import { readFileSync, writeFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * CI Error Correction Script
 * Fixes the issues introduced by the first automated pass
 * and addresses remaining blocking errors.
 */

function fixFile(filePath) {
    if (!filePath.endsWith('.ts') && !filePath.endsWith('.tsx') && !filePath.endsWith('.js')) {
        return false;
    }

    let content = readFileSync(filePath, 'utf8');
    const original = content;

    // 1. REVERT: If (_error) is caught but (error) is used, rename back to (error)
    // This happens if my previous script renamed catch(error) to catch(_error) but error was used inside.

    // Look for catch (_error) { ... error ... }
    // We use a simple check: if "catch (_error)" exists AND "error" exists in the same file (imperfect but usually safe here)
    if (content.includes('catch (_error)') && /\berror\b/.test(content)) {
        // More precise check: only rename if error is used AFTER catch (_error)
        const catchIndex = content.indexOf('catch (_error)');
        const errorAfterCatch = content.indexOf('error', catchIndex + 14);

        if (errorAfterCatch !== -1) {
            // Find the closing brace of the catch block to be even more precise? 
            // For now, let's just rename back if we see it in the file and it's causing issues.
            // Actually, many files might have error used elsewhere.
            // Let's use a regex that looks into the block.

            content = content.replace(/catch\s*\(\s*_error\s*\)\s*{([^}]*?\berror\b[^}]*?)}/g, 'catch (error) {$1}');
        }
    }

    // 2. Fix 'any' in other places (return types, etc.)
    // Replace ": any" with ": unknown" or similar where it's causing errors
    // content = content.replace(/:\s*any/g, ': unknown'); // TOO DANGEROUS for global replace

    // Target specific known patterns from lint output
    content = content.replace(/:\s*any\s*(=|;|,|\))/g, ': unknown$1');

    if (content !== original) {
        writeFileSync(filePath, content, 'utf8');
        return true;
    }

    return false;
}

function walkDir(dir, callback) {
    const files = readdirSync(dir);

    files.forEach(file => {
        const filePath = join(dir, file);
        const stat = statSync(filePath);

        if (stat.isDirectory()) {
            if (!file.startsWith('.') && file !== 'node_modules' && file !== 'dist' && file !== 'build') {
                walkDir(filePath, callback);
            }
        } else {
            callback(filePath);
        }
    });
}

console.log('🔧 Starting CI error correction...\n');

let fixCount = 0;
const dirs = ['apps', 'packages', 'services'];

dirs.forEach(dir => {
    if (statSync(dir, { throwIfNoEntry: false })) {
        walkDir(dir, (file) => {
            if (fixFile(file)) {
                console.log(`✅ Fixed/Corrected: ${file}`);
                fixCount++;
            }
        });
    }
});

console.log(`\n✨ Corrected ${fixCount} files`);
