#!/usr/bin/env node

/**
 * Final Button Refactoring Script - All Remaining Apps
 * Processes storefront, ops-console, marketing, and any other apps
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Get all files with <button tags across all apps
const getFilesWithButtons = () => {
    try {
        const output = execSync(
            'find apps -name "*.tsx" -type f -exec grep -l "<button" {} \\;',
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
        return { success: false, reason: 'not_found' };
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Skip UI primitive files
    const skipPatterns = [
        '/ui/toast.tsx',
        '/ui/switch.tsx',
        '/ui/Switch.tsx',
        '/ui/button.tsx',
        '/ui/Button.tsx'
    ];

    if (skipPatterns.some(pattern => filePath.includes(pattern))) {
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

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        return { success: true, count: buttonsBefore, file: filePath };
    }

    return { success: false, reason: 'no_changes' };
}

// Run the script
console.log('🚀 Final Button Refactoring - All Remaining Apps\n');
console.log('='.repeat(70));

const files = getFilesWithButtons();
console.log(`\nFound ${files.length} files with <button tags\n`);

// Group files by app
const filesByApp = {};
files.forEach(file => {
    const app = file.split('/')[1]; // apps/[app-name]/...
    if (!filesByApp[app]) filesByApp[app] = [];
    filesByApp[app].push(file);
});

console.log('Files by application:');
Object.entries(filesByApp).forEach(([app, files]) => {
    console.log(`  ${app}: ${files.length} files`);
});
console.log('\n' + '='.repeat(70) + '\n');

let totalSuccess = 0;
let totalButtons = 0;
let totalSkipped = 0;
const results = {};

Object.entries(filesByApp).forEach(([app, appFiles]) => {
    console.log(`\n📦 Processing ${app}...`);

    let appSuccess = 0;
    let appButtons = 0;

    appFiles.forEach(file => {
        try {
            const result = refactorFile(file);
            if (result.success) {
                appSuccess++;
                appButtons += result.count || 0;
                totalSuccess++;
                totalButtons += result.count || 0;
                console.log(`  ✅ ${file.split('/').slice(2).join('/')} (${result.count} buttons)`);
            } else if (result.reason === 'primitive') {
                totalSkipped++;
            }
        } catch (error) {
            console.error(`  ❌ Error: ${file}: ${error.message}`);
        }
    });

    results[app] = { files: appSuccess, buttons: appButtons };
    console.log(`  └─ ${app}: ${appSuccess} files, ${appButtons} buttons`);
});

console.log('\n' + '='.repeat(70));
console.log('✨ FINAL RESULTS');
console.log('='.repeat(70));

Object.entries(results).forEach(([app, stats]) => {
    if (stats.files > 0) {
        console.log(`${app.padEnd(20)} ${stats.files} files, ${stats.buttons} buttons`);
    }
});

console.log('='.repeat(70));
console.log(`✅ Total files refactored: ${totalSuccess}`);
console.log(`🔄 Total buttons converted: ${totalButtons}`);
console.log(`⏭️  Skipped (UI primitives): ${totalSkipped}`);
console.log('='.repeat(70));

// Final verification
console.log('\n🔍 Final Verification...');
const remaining = getFilesWithButtons();
const remainingNonPrimitive = remaining.filter(f =>
    !f.includes('/ui/toast.tsx') &&
    !f.includes('/ui/switch.tsx') &&
    !f.includes('/ui/Switch.tsx')
);

if (remainingNonPrimitive.length === 0) {
    console.log('✅ SUCCESS! All <button tags have been refactored!\n');
} else {
    console.log(`⚠️  ${remainingNonPrimitive.length} files still have <button tags:\n`);
    remainingNonPrimitive.slice(0, 10).forEach(f => console.log(`  - ${f}`));
    if (remainingNonPrimitive.length > 10) {
        console.log(`  ... and ${remainingNonPrimitive.length - 10} more`);
    }
}
