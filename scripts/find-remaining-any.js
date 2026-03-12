/* eslint-disable */
const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    try {
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                if (!['node_modules', '.next', 'dist', 'build', 'tests', 'generated'].includes(file)) {
                    results = results.concat(walk(filePath));
                }
            } else {
                if ((file.endsWith('.ts') || file.endsWith('.tsx')) && !file.includes('.test.') && !file.includes('.spec.')) {
                    results.push(filePath);
                }
            }
        });
    } catch (_e) { }
    return results;
}

const dirs = ['apps', 'services', 'packages'].filter(d => fs.existsSync(path.join(process.cwd(), d)));
let files = [];
dirs.forEach(d => {
    files = files.concat(walk(path.join(process.cwd(), d)));
});

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n');
        lines.forEach((line, i) => {
            if (line.includes('any') && !line.includes('eslint-disable') && !line.trim().startsWith('//') && !line.trim().startsWith('*')) {
                // More specific check to avoid false positives in text
                if (/([:<>|,\[\(\s])any([:<>|,\]\)\s]|$)/.test(line)) {
                    console.log(`${path.relative(process.cwd(), file)}:${i + 1}: ${line.trim()}`);
                }
            }
        });
    } catch (_e) { }
});
