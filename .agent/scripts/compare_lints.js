const fs = require('fs');
const path = require('path');

function parseLintFile(content) {
    const lines = content.split('\n');
    let currentFile = null;
    const errors = [];

    for (const line of lines) {
        if (line.trim() === '') continue;
        if (line.startsWith('/')) {
            currentFile = line.trim();
            continue;
        }
        // Match standard format
        const match = line.match(/^\s+(\d+):(\d+)\s+(\w+)\s+(.+?)\s+(@?[\w\-\/]+)$/);
        if (match && currentFile) {
            errors.push({
                file: currentFile,
                ruleId: match[5]
            });
        }
    }
    return errors;
}

const oldContent = fs.readFileSync('final_lint.txt', 'utf8');
const newContent = fs.readFileSync('final_lint_v2.txt', 'utf8');

const oldErrors = parseLintFile(oldContent);
const newErrors = parseLintFile(newContent);

console.log(`Original Errors: ${oldErrors.length}`);
console.log(`Current Errors: ${newErrors.length}`);
console.log(`Fixed: ${oldErrors.length - newErrors.length}`);

const oldCounts = {};
oldErrors.forEach(e => oldCounts[e.ruleId] = (oldCounts[e.ruleId] || 0) + 1);

const newCounts = {};
newErrors.forEach(e => newCounts[e.ruleId] = (newCounts[e.ruleId] || 0) + 1);

console.log('\nBreakdown by Rule (Fixed):');
const allRules = new Set([...Object.keys(oldCounts), ...Object.keys(newCounts)]);

for (const rule of allRules) {
    const original = oldCounts[rule] || 0;
    const current = newCounts[rule] || 0;
    const fixed = original - current;

    // Only show rules that had fixes or changes
    if (fixed !== 0 || original > 0) {
        console.log(`${rule}: ${fixed} fixed (Original: ${original} -> Remaining: ${current})`);
    }
}
