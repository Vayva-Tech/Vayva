/* eslint-disable */
const fs = require('fs');
const path = require('path');

const rootDir = 'apps/merchant-admin/src';

function walk(dir) {
    let results = [];
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

const files = walk(rootDir);

const replacements = [
    { from: /\(e: unknown\)/g, to: '(e: any)' },
    { from: /\(e:unknown\)/g, to: '(e: any)' },
    { from: /catch \(error\)/g, to: 'catch (error: any)' },
    { from: /catch \(e\)/g, to: 'catch (e: any)' },
    { from: /import { _NextRequest/g, to: 'import { NextRequest' },
    { from: /import { _useRouter/g, to: 'import { useRouter' },
    { from: /import { _usePathname/g, to: 'import { usePathname' },
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
