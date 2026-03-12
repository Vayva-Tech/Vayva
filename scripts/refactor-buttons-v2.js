#!/usr/bin/env node

/**
 * Smart Button Refactoring Tool v2
 * Direct file search approach
 */

const fs = require('fs');
const path = require('path');
const { _execSync } = require('child_process');

const WORKSPACE_ROOT = '/Users/fredrick/Documents/GitHub/Vayva-platform';

// Priority files to refactor
const PRIORITY_FILES = [
    'apps/merchant-admin/src/components/dashboard/StoreSwitcher.tsx',
    'apps/merchant-admin/src/components/ai/CommandPalette.tsx',
    'apps/merchant-admin/src/components/products/ProductCard.tsx',
    'apps/merchant-admin/src/components/products/ProductDrawer.tsx',
    'apps/merchant-admin/src/components/support/SupportDrawer.tsx',
    'apps/merchant-admin/src/components/support/SupportInbox.tsx',
    'apps/merchant-admin/src/components/control-center/TemplateCard.tsx',
    'apps/merchant-admin/src/components/control-center/IntegrationsPanel.tsx',
    'apps/merchant-admin/src/components/control-center/ThemeSelector.tsx',
    'apps/merchant-admin/src/components/dashboard/StorefrontSnapshot.tsx',
    'apps/merchant-admin/src/components/dashboard/LaunchChecklist.tsx',
    'apps/merchant-admin/src/components/dashboard/DashboardSetupChecklist.tsx',
];

// Determine appropriate variant
function determineVariant(className = '', content = '', attrs = '') {
    const combined = `${className} ${content} ${attrs}`.toLowerCase();

    if (/close|dismiss|×|x-icon|x\s+size|xicon/.test(combined)) {
        return { variant: 'ghost', size: 'icon' };
    }
    if (/delete|remove|destroy|danger|red-|destructive/.test(combined)) {
        return { variant: 'destructive' };
    }
    if (/primary|submit|save|create|add|bg-primary|bg-green|bg-\[#22c55e\]/.test(combined)) {
        return { variant: 'primary' };
    }
    if (/secondary|outline|border-/.test(combined)) {
        return { variant: 'outline' };
    }
    if (/link|underline|text-primary|text-blue/.test(combined)) {
        return { variant: 'link' };
    }
    if (/ghost|transparent|bg-white\/|bg-gray-/.test(combined)) {
        return { variant: 'ghost' };
    }

    return { variant: 'ghost' };
}

// Refactor a single file
function refactorFile(filePath) {
    const fullPath = path.join(WORKSPACE_ROOT, filePath);

    if (!fs.existsSync(fullPath)) {
        return { success: false, reason: 'not found' };
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

    // Skip if it's a UI primitive
    if (filePath.includes('/ui/toast.') || filePath.includes('/ui/Switch.') || filePath.includes('/ui/switch.')) {
        return { success: true, skipped: true, reason: 'UI primitive' };
    }

    // Count buttons before
    const buttonsBefore = (content.match(/<button[\s>]/g) || []).length;

    if (buttonsBefore === 0) {
        return { success: true, skipped: true, reason: 'no buttons' };
    }

    // Check if Button is already imported
    const hasButtonImport = /import\s+{[^}]*\bButton\b[^}]*}\s+from\s+["']@vayva\/ui["']/.test(content);

    if (!hasButtonImport) {
        // Try to add to existing @vayva/ui import
        const vayvaImportMatch = content.match(/import\s+{([^}]+)}\s+from\s+["']@vayva\/ui["'];?/);
        if (vayvaImportMatch) {
            const imports = vayvaImportMatch[1].split(',').map(s => s.trim()).filter(Boolean);
            if (!imports.some(imp => imp.includes('Button'))) {
                imports.push('Button');
                const newImport = `import { ${imports.join(', ')} } from "@vayva/ui";`;
                content = content.replace(vayvaImportMatch[0], newImport);
            }
        } else {
            // Add new import after the last import
            const importMatches = content.match(/import[^;]+;/g);
            if (importMatches && importMatches.length > 0) {
                const lastImport = importMatches[importMatches.length - 1];
                const insertPos = content.indexOf(lastImport) + lastImport.length;
                content = content.slice(0, insertPos) + '\nimport { Button } from "@vayva/ui";' + content.slice(insertPos);
            }
        }
    }

    // Simple replacement for opening tags
    content = content.replace(
        /<button(\s+[^>]*?)>/g,
        (match, attrs) => {
            // Skip special cases
            if (attrs.includes('role="switch"') || attrs.includes('toast-action')) {
                return match;
            }

            // Extract className
            const classNameMatch = attrs.match(/className=(?:{[^}]+}|["'][^"']*["'])/);
            const className = classNameMatch ? classNameMatch[0] : '';

            // Determine variant
            const { variant, size } = determineVariant(className, '', attrs);

            let newAttrs = attrs;

            // Add variant if not present
            if (!attrs.includes('variant=')) {
                newAttrs += ` variant="${variant}"`;
            }

            // Add size if determined and not present
            if (size && !attrs.includes('size=')) {
                newAttrs += ` size="${size}"`;
            }

            return `<Button${newAttrs}>`;
        }
    );

    // Replace closing tags
    content = content.replace(/<\/button>/g, '</Button>');

    const buttonsAfter = (content.match(/<button[\s>]/g) || []).length;
    const refactored = buttonsBefore - buttonsAfter;

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        return {
            success: true,
            count: refactored,
            remaining: buttonsAfter,
            modified: true
        };
    }

    return {
        success: true,
        count: 0,
        remaining: buttonsAfter,
        modified: false
    };
}

// Main execution
console.log('🚀 Smart Button Refactoring Tool v2\n');
console.log(`📋 Processing ${PRIORITY_FILES.length} priority files...\n`);

let totalRefactored = 0;
let filesModified = 0;
let filesSkipped = 0;

PRIORITY_FILES.forEach((file, index) => {
    const result = refactorFile(file);

    if (result.skipped) {
        filesSkipped++;
        console.log(`⏭️  [${index + 1}/${PRIORITY_FILES.length}] ${path.basename(file)} - ${result.reason}`);
    } else if (result.success && result.modified) {
        filesModified++;
        totalRefactored += result.count || 0;
        console.log(`✅ [${index + 1}/${PRIORITY_FILES.length}] ${path.basename(file)} - ${result.count} buttons (${result.remaining} remaining)`);
    } else if (result.success) {
        console.log(`⏭️  [${index + 1}/${PRIORITY_FILES.length}] ${path.basename(file)} - no changes`);
    } else {
        console.log(`❌ [${index + 1}/${PRIORITY_FILES.length}] ${path.basename(file)} - ${result.reason}`);
    }
});

console.log('\n📊 Summary:');
console.log(`   Files processed: ${PRIORITY_FILES.length}`);
console.log(`   Files modified: ${filesModified}`);
console.log(`   Files skipped: ${filesSkipped}`);
console.log(`   Buttons refactored: ${totalRefactored}`);

console.log('\n✅ Automated refactoring complete!');
console.log('⚠️  Next: Run type checking...');
