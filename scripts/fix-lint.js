#!/usr/bin/env node

/**
 * Automated Lint Fixer
 * Fixes common ESLint violations across the codebase
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Patterns to fix
const fixes = {
    // Fix unused error variables by prefixing with underscore
    unusedErrors: {
        pattern: /catch\s*\(\s*error\s*[:\s]*[^)]*\)\s*{/g,
        replacement: 'catch (_error) {',
        description: 'Prefix unused error variables with underscore'
    },

    // Fix prefer-const violations
    preferConst: {
        files: [
            'apps/marketplace/src/app/api/cart/route.ts',
            'apps/marketplace/src/components/cart/CartDrawer.tsx'
        ],
        description: 'Convert let to const for variables that are never reassigned'
    }
};

console.log('🔧 Starting automated lint fixes...\n');

// Fix 1: Unused error variables
console.log('📝 Fixing unused error variables...');
const filesToScan = [
    'apps/marketing/src/app/(pages)/legal/cookies/page.tsx',
    'apps/marketplace/src/app/api/**/*.ts',
    'apps/marketplace/src/components/**/*.tsx'
];

let fixCount = 0;

function fixUnusedErrors(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Fix: catch (error) => catch (_error)
    content = content.replace(
        /catch\s*\(\s*error\s*(?::\s*unknown|:\s*any)?\s*\)\s*{/g,
        'catch (_error) {'
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Fixed: ${filePath}`);
        fixCount++;
    }
}

// Fix 2: Prefer const
console.log('\n📝 Fixing prefer-const violations...');

function fixPreferConst(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    const original = content;

    // Fix specific patterns from lint output
    content = content.replace(
        /let\s+(variantId|quantity)\s*=/g,
        'const $1 ='
    );

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`  ✅ Fixed: ${filePath}`);
        fixCount++;
    }
}

// Apply fixes
const specificFiles = [
    'apps/marketing/src/app/(pages)/legal/cookies/page.tsx',
    'apps/marketplace/src/app/api/cart/route.ts',
    'apps/marketplace/src/components/cart/CartDrawer.tsx',
    'apps/marketplace/src/app/api/cart/[itemId]/route.ts',
    'apps/marketplace/src/app/api/orders/[id]/route.ts',
    'apps/marketplace/src/lib/error.ts'
];

specificFiles.forEach(file => {
    const fullPath = path.join(process.cwd(), file);
    fixUnusedErrors(fullPath);
    fixPreferConst(fullPath);
});

console.log(`\n✨ Fixed ${fixCount} files`);

// Run ESLint auto-fix for remaining issues
console.log('\n🔧 Running ESLint auto-fix...');
try {
    execSync('pnpm lint:fix', { stdio: 'inherit' });
    console.log('✅ ESLint auto-fix completed');
} catch (error) {
    console.log('⚠️  Some lint issues remain (non-blocking)');
}

console.log('\n✅ Automated fixes complete!');
console.log('Run `pnpm lint` to verify remaining issues.');
