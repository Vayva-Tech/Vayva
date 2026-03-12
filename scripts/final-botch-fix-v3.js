/* eslint-disable */
const fs = require('fs');
const path = require('path');

const dirs = [
    'apps/merchant-admin/src',
    'apps/merchant-admin/tests',
    'packages/policies/src'
];

function walk(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx')) {
                results.push(file);
            }
        }
    });
    return results;
}

const files = dirs.flatMap(walk);

const replacements = [
    { from: /: unknown(?=[, )=])/g, to: ': any' },
    { from: /: unknown\[\]/g, to: ': any[]' },
    { from: /catch \(error\)/g, to: 'catch (error: any)' },
    { from: /catch \(e\)/g, to: 'catch (e: any)' },
    { from: /catch \(_e\)/g, to: 'catch (_e: any)' },
    { from: /\(_req: unknown\)/g, to: '(_req: any)' },
    { from: /\(req: unknown\)/g, to: '(req: any)' },
    { from: /\(request: unknown\)/g, to: '(request: any)' },
    { from: /_storeId/g, to: 'storeId' },
    { from: /_NextRequest/g, to: 'NextRequest' },
    { from: /_useRouter/g, to: 'useRouter' },
    { from: /_usePathname/g, to: 'usePathname' },
];

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    replacements.forEach(r => {
        content = content.replace(r.from, r.to);
    });
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Updated: ${file}`);
    }
});
