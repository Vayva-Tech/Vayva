/* eslint-disable */
const fs = require('fs');
const path = require('path');

const dirs = [
    'apps/merchant-admin/src',
    'apps/merchant-admin/tests'
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

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let original = content;
    content = content.split(': unknown').join(': any');
    content = content.split('as unknown').join('as any');
    if (content !== original) {
        fs.writeFileSync(file, content);
        console.log(`Fixed: ${file}`);
    }
});
