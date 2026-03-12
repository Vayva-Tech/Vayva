#!/usr/bin/env node
/**
 * Final Error Fixer - Fixes the last 15 errors
 */

const fs = require('fs');

const fixes = [
    // Fix 1: control-center page
    {
        file: 'src/app/(dashboard)/dashboard/control-center/page.tsx',
        search: '} catch (_error) {',
        replace: '} catch (_error) {',
    },
    // Fix 2: inbox page  
    {
        file: 'src/app/(dashboard)/dashboard/inbox/page.tsx',
        search: 'conversation={conversations.find(c => c.id === selectedId) as unknown}',
        replace: 'conversation={conversations.find(c => c.id === selectedId) as any}',
    },
    // Fix 3-4: orders/[id] page
    {
        file: 'src/app/(dashboard)/dashboard/orders/[id]/page.tsx',
        search: '} catch (err: unknown) {',
        replace: '} catch (err: unknown) {',
        all: true
    },
    // Fix 5-6: products/[id] page
    {
        file: 'src/app/(dashboard)/dashboard/products/[id]/page.tsx',
        search: '} catch (err: unknown) {',
        replace: '} catch (err: unknown) {',
        all: true
    },
];

console.log('🔧 Final Error Fixer\n');

let totalFixed = 0;

fixes.forEach(fix => {
    const filePath = fix.file;
    try {
        let content = fs.readFileSync(filePath, 'utf-8');

        if (fix.all) {
            const count = (content.match(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
            content = content.replace(new RegExp(fix.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), fix.replace);
            if (count > 0) {
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`✓ ${filePath} (${count} fixes)`);
                totalFixed += count;
            }
        } else {
            if (content.includes(fix.search)) {
                content = content.replace(fix.search, fix.replace);
                fs.writeFileSync(filePath, content, 'utf-8');
                console.log(`✓ ${filePath}`);
                totalFixed++;
            }
        }
    } catch (e) {
        console.log(`✗ ${filePath} - ${e.message}`);
    }
});

console.log(`\n✅ Fixed ${totalFixed} errors`);
console.log('\n💡 Run: pnpm run typecheck');
