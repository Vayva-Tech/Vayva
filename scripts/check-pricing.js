const fs = require('fs');
const path = require('path');

const FORBIDDEN = [
    "25k", "40k",
    "25,000", "40,000",
    "₦25,000", "₦40,000"
    // "25000", "40000" // Caution
];

const EXCLUDED_FILES = [
    'pricing.ts',
    'check-pricing.js',
    'pricing.spec.ts',
    'package.json',
    'pnpm-lock.yaml',
    'check-pricing.ts',
    'test-pricing-unit.ts'
];

const ROOT_DIRS = [
    'apps/marketing/src',
    'apps/merchant-admin/src'
];

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;

    const files = fs.readdirSync(dir);

    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else {
            if (EXCLUDED_FILES.includes(file)) continue;
            if (!file.match(/\.(ts|tsx|js|jsx)$/)) continue;

            const content = fs.readFileSync(fullPath, 'utf-8');

            for (const bad of FORBIDDEN) {
                if (content.includes(bad)) {
                    console.error(`ERROR: Found forbidden hardcoded price string "${bad}" in ${fullPath}`);
                    process.exitCode = 1;
                }
            }
        }
    }
}

console.log("Scanning for hardcoded pricing strings...");
ROOT_DIRS.forEach(d => scanDir(path.join(process.cwd(), d)));
console.log("Scan complete.");
