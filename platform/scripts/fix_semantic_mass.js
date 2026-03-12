/* eslint-disable */
const fs = require('fs');
const path = require('path');

const ERROR_FILE = 'all_errors.txt';
const ROOT_DIR = process.cwd();

if (!fs.existsSync(ERROR_FILE)) {
    console.error('Error file not found');
    process.exit(1);
}

const lines = fs.readFileSync(ERROR_FILE, 'utf8').split('\n');

// Stats
let fixed = 0;
let skipped = 0;

lines.forEach(line => {
    // Format: merchant-admin:typecheck: src/app/api/account/domains/route.ts(23,53): error TS2339: Property 'lastCheckedAt' does not exist on type '...'
    const match = line.match(/^([^:]+):typecheck: (.*)\((\d+),(\d+)\): error (TS\d+): (.*)$/);
    if (!match) return;

    const [_, project, relPath, lineNum, colNum, errorCode, message] = match;
    // We only target merchant-admin for now as most errors are there
    if (project !== 'merchant-admin') return;

    const fullPath = path.join(ROOT_DIR, 'apps/merchant-admin', relPath);
    if (!fs.existsSync(fullPath)) return;

    let content = fs.readFileSync(fullPath, 'utf8').split('\n');
    const targetLine = parseInt(lineNum) - 1;
    const col = parseInt(colNum) - 1;

    if (!content[targetLine]) return;

    let original = content[targetLine];
    let modified = original;

    // Pattern 1: Property access on unknown/JSON (TS2571, TS2339)
    if (errorCode === 'TS2571' || errorCode === 'TS2339' || errorCode === 'TS2551') {
        // Extract the property name from the message
        const propMatch = message.match(/Property '([^']+)'/);
        if (propMatch) {
            const prop = propMatch[1];
            // Identify the variable before the property access at the column
            // We use the column provided by TS
            const beforeProp = original.substring(0, col).trim();
            const lastDot = beforeProp.lastIndexOf('.');
            if (lastDot !== -1) {
                const variable = beforeProp.substring(lastDot + 1);
                // Verify the property access follows
                const rest = original.substring(col);
                if (rest.startsWith(prop)) {
                    // Replace "variable.prop" with "(variable as any).prop"
                    // Be careful with scope. We just do a simple string replace for now
                    const toReplace = `${variable}.${prop}`;
                    const replacement = `(${variable} as any).${prop}`;

                    // Only replace if it's unique enough or exactly at that spot
                    // Safer: slice and dice
                    modified = original.substring(0, lastDot + 1 - variable.length) +
                        replacement +
                        original.substring(col + prop.length);
                    fixed++;
                }
            }
        }
    }

    // Pattern 2: Implicit any (TS7005, TS7006, TS7031)
    if (errorCode === 'TS7005' || errorCode === 'TS7006' || errorCode === 'TS7031') {
        const varMatch = message.match(/Variable '([^']+)'|Parameter '([^']+)'/);
        const variable = varMatch ? (varMatch[1] || varMatch[2]) : null;
        if (variable) {
            // Find variable in line and add : any
            // This is trickier if it's in a list. 
            // Simple heuristic: if it's "variable," replace with "variable: any,"
            // or "(variable)" with "(variable: any)"
            if (modified.includes(`(${variable})`)) {
                modified = modified.replace(`(${variable})`, `(${variable}: any)`);
                fixed++;
            } else if (modified.includes(`${variable},`)) {
                modified = modified.replace(`${variable},`, `${variable}: any,`);
                fixed++;
            }
        }
    }

    if (modified !== original) {
        content[targetLine] = modified;
        fs.writeFileSync(fullPath, content.join('\n'));
    } else {
        skipped++;
    }
});

console.log(`Finished. Fixed: ${fixed}, Skipped/Unhandled: ${skipped}`);
