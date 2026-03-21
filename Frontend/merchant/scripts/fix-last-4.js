#!/usr/bin/env node
/**
 * Final 4 Error Fixer
 */

import fs from 'fs';

const fixes = [
    // Fix 1: KitchenService PAID enum
    {
        file: 'src/services/KitchenService.ts',
        search: 'paymentStatus: { in: ["SUCCESS", "PAID", "VERIFIED"] }',
        replace: 'paymentStatus: { in: ["SUCCESS", "VERIFIED"] }',
    },
    // Fix 2: verify-paystack script
    {
        file: 'src/scripts/verify-paystack.ts',
        search: '} catch (_error) {',
        replace: '} catch (_error) {',
    },
];

console.log('🔧 Final 4 Error Fixer\n');

let totalFixed = 0;

fixes.forEach(fix => {
    try {
        let content = fs.readFileSync(fix.file, 'utf-8');
        if (content.includes(fix.search)) {
            content = content.replace(fix.search, fix.replace);
            fs.writeFileSync(fix.file, content, 'utf-8');
            console.log(`✓ ${fix.file}`);
            totalFixed++;
        }
    } catch (e) {
        console.log(`✗ ${fix.file} - ${e.message}`);
    }
});

console.log(`\n✅ Fixed ${totalFixed} errors`);
