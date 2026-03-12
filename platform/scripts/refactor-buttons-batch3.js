#!/usr/bin/env node

/**
 * Comprehensive Button Refactoring Script - Batch 3+
 * Processes all remaining merchant-admin files
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with <button tags
const getFilesWithButtons = () => {
    try {
        const output = execSync(
            'find apps/merchant-admin/src -name "*.tsx" -type f -exec grep -l "<button" {} \\;',
            { encoding: 'utf8', cwd: process.cwd() }
        );
        return output.trim().split('\n').filter(Boolean);
    } catch (_error) {
        return [];
    }
};

function refactorFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} - file not found`);
        return { success: false, reason: 'not_found' };
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Skip UI primitive files
    if (filePath.includes('/ui/toast.tsx') || filePath.includes('/ui/switch.tsx')) {
        console.log(`⏭️  Skipping ${filePath} - UI primitive`);
        return { success: false, reason: 'primitive' };
    }

    // Check if Button is already imported
    const hasButtonImport = /import\s+{[^}]*Button[^}]*}\s+from\s+["']@vayva\/ui["']/.test(content);

    if (!hasButtonImport) {
        // Add Button to existing @vayva/ui import or create new one
        if (/import\s+{[^}]*}\s+from\s+["']@vayva\/ui["']/.test(content)) {
            content = content.replace(
                /(import\s+{)([^}]*)(}\s+from\s+["']@vayva\/ui["'])/,
                (match, p1, p2, p3) => {
                    const imports = p2.split(',').map(s => s.trim()).filter(Boolean);
                    if (!imports.includes('Button')) {
                        imports.push('Button');
                    }
                    return `${p1} ${imports.join(', ')} ${p3}`;
                }
            );
        } else {
            // Add new import after first import statement
            content = content.replace(
                /(import\s+[^;]+;)/,
                '$1\nimport { Button } from "@vayva/ui";'
            );
        }
    }

    // Count buttons before
    const buttonsBefore = (content.match(/<button/g) || []).length;

    // Replace all <button with <Button (opening tags)
    content = content.replace(/<button/g, '<Button');

    // Replace all </button> with </Button> (closing tags)
    content = content.replace(/<\/button>/g, '</Button>');

    // Count buttons after
    const _buttonsAfter = (content.match(/<Button/g) || []).length;

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Refactored ${filePath} (${buttonsBefore} buttons)`);
        return { success: true, count: buttonsBefore };
    }

    console.log(`⏭️  Skipped ${filePath} - no changes needed`);
    return { success: false, reason: 'no_changes' };
}

// Run the script
console.log('🚀 Starting comprehensive button refactoring...\n');

const files = getFilesWithButtons();
console.log(`Found ${files.length} files with <button tags\n`);

let successCount = 0;
let totalButtons = 0;
let skipCount = 0;
const errors = [];

files.forEach(file => {
    try {
        const result = refactorFile(file);
        if (result.success) {
            successCount++;
            totalButtons += result.count || 0;
        } else {
            skipCount++;
        }
    } catch (error) {
        console.error(`❌ Error processing ${file}:`, error.message);
        errors.push({ file, error: error.message });
    }
});

console.log(`\n${'='.repeat(60)}`);
console.log(`✨ Refactoring Complete!`);
console.log(`${'='.repeat(60)}`);
console.log(`✅ Successfully refactored: ${successCount} files`);
console.log(`🔄 Total buttons converted: ${totalButtons}`);
console.log(`⏭️  Skipped: ${skipCount} files`);
if (errors.length > 0) {
    console.log(`❌ Errors: ${errors.length} files`);
    errors.forEach(({ file, error }) => {
        console.log(`   - ${file}: ${error}`);
    });
}
console.log(`${'='.repeat(60)}\n`);

// Verify no remaining <button tags
console.log('🔍 Verifying...');
const remaining = getFilesWithButtons();
if (remaining.length === 0) {
    console.log('✅ All <button tags have been refactored!\n');
} else {
    console.log(`⚠️  ${remaining.length} files still have <button tags (may need manual review)\n`);
}
