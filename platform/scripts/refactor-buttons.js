#!/usr/bin/env node

/**
 * Automated Button Refactoring Script
 * 
 * This script refactors raw <button> elements to use the @vayva/ui Button component.
 * It handles common patterns and preserves functionality.
 */

const fs = require('fs');
const path = require('path');

// Files to process
const filesToProcess = [
    // Control Center
    'apps/merchant-admin/src/components/control-center/PlanUsage.tsx',
    'apps/merchant-admin/src/components/control-center/TemplatePreview.tsx',
    'apps/merchant-admin/src/components/control-center/OptimizationHub.tsx',
    'apps/merchant-admin/src/components/control-center/AutomationsHub.tsx',
    'apps/merchant-admin/src/components/control-center/MarketplaceGrid.tsx',
    'apps/merchant-admin/src/components/control-center/SeasonalBanner.tsx',
    'apps/merchant-admin/src/components/control-center/UsageAndSystem.tsx',
    'apps/merchant-admin/src/components/control-center/DataSafety.tsx',
    'apps/merchant-admin/src/components/control-center/PaymentOptimizationCard.tsx',
    'apps/merchant-admin/src/components/control-center/UpsellModal.tsx',

    // Dashboard
    'apps/merchant-admin/src/components/dashboard/InsightHub.tsx',
    'apps/merchant-admin/src/components/dashboard/ProFeatureUpsell.tsx',
    'apps/merchant-admin/src/components/dashboard/overview/ServicesOverview.tsx',
    'apps/merchant-admin/src/components/dashboard/overview/FoodOverview.tsx',
    'apps/merchant-admin/src/components/dashboard/AICoachWidget.tsx',
    'apps/merchant-admin/src/components/dashboard/ActivationWelcome.tsx',
    'apps/merchant-admin/src/components/dashboard/GoLiveCard.tsx',
];

function refactorFile(filePath) {
    const fullPath = path.join(process.cwd(), filePath);

    if (!fs.existsSync(fullPath)) {
        console.log(`⚠️  Skipping ${filePath} - file not found`);
        return false;
    }

    let content = fs.readFileSync(fullPath, 'utf8');
    const originalContent = content;

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
            // Add new import after React import
            content = content.replace(
                /(import\s+React[^;]*;)/,
                '$1\nimport { Button } from "@vayva/ui";'
            );
        }
    }

    // Replace button patterns
    // Pattern 1: Simple buttons with className
    content = content.replace(
        /<button\s+className="([^"]+)"\s*>/g,
        (match, className) => {
            const variant = inferVariant(className);
            const size = inferSize(className);
            const cleanClassName = cleanupClassName(className, variant, size);

            const props = [];
            if (variant) props.push(`variant="${variant}"`);
            if (size) props.push(`size="${size}"`);
            if (cleanClassName) props.push(`className="${cleanClassName}"`);

            return `<Button ${props.join(' ')}>`;
        }
    );

    // Pattern 2: Buttons with onClick
    content = content.replace(
        /<button\s+onClick={([^}]+)}\s+className="([^"]+)"\s*>/g,
        (match, onClick, className) => {
            const variant = inferVariant(className);
            const size = inferSize(className);
            const cleanClassName = cleanupClassName(className, variant, size);

            const props = [`onClick={${onClick}}`];
            if (variant) props.push(`variant="${variant}"`);
            if (size) props.push(`size="${size}"`);
            if (cleanClassName) props.push(`className="${cleanClassName}"`);

            return `<Button ${props.join(' ')}>`;
        }
    );

    // Replace closing tags
    content = content.replace(/<\/button>/g, '</Button>');

    if (content !== originalContent) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log(`✅ Refactored ${filePath}`);
        return true;
    }

    console.log(`⏭️  Skipped ${filePath} - no changes needed`);
    return false;
}

function inferVariant(className) {
    if (/bg-black|bg-gray-900/.test(className)) return 'primary';
    if (/border.*border-gray|border.*border-black/.test(className) && !/bg-/.test(className)) return 'outline';
    if (/bg-indigo/.test(className)) return 'primary';
    if (/bg-white/.test(className) && /border/.test(className)) return 'secondary';
    if (/hover:bg-gray-50/.test(className) && !/bg-/.test(className)) return 'ghost';
    return null;
}

function inferSize(className) {
    if (/text-xs/.test(className) || /py-1/.test(className)) return 'sm';
    if (/text-lg/.test(className) || /py-3/.test(className)) return 'lg';
    if (/w-\d+.*h-\d+/.test(className) && /p-\d+/.test(className)) return 'icon';
    return null;
}

function cleanupClassName(className, variant, size) {
    let clean = className;

    // Remove classes handled by variant
    if (variant === 'primary') {
        clean = clean.replace(/bg-black|bg-gray-900|text-white|hover:bg-gray-800/g, '');
    }
    if (variant === 'outline') {
        clean = clean.replace(/border.*border-gray-\d+|border.*border-black/g, '');
    }
    if (variant === 'ghost') {
        clean = clean.replace(/hover:bg-gray-\d+/g, '');
    }

    // Remove classes handled by size
    if (size) {
        clean = clean.replace(/text-xs|text-sm|text-lg|px-\d+|py-\d+/g, '');
    }

    // Remove default button styles
    clean = clean.replace(/rounded-lg|rounded-xl|rounded-full|font-bold|transition-colors|transition-transform/g, '');

    // Clean up extra spaces
    clean = clean.replace(/\s+/g, ' ').trim();

    return clean || null;
}

// Run the script
console.log('🚀 Starting button refactoring...\n');

let successCount = 0;
let skipCount = 0;

filesToProcess.forEach(file => {
    if (refactorFile(file)) {
        successCount++;
    } else {
        skipCount++;
    }
});

console.log(`\n✨ Complete! Refactored ${successCount} files, skipped ${skipCount} files.`);
