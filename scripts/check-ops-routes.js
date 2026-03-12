const fs = require('fs');
const path = require('path');

const UI_BASE = 'apps/ops-console/src/app/ops/(app)';
const API_BASE = 'apps/ops-console/src/app/api/ops';

const UI_WHITELIST = [
    'health',
    'merchants',
    'orders',
    'deliveries',
    'webhooks',
    'inbox',
    'audit',
    'rescue',
    'runbook',
    // Files
    'page.tsx',
    'layout.tsx',
    'loading.tsx',
    'error.tsx'
];

const API_WHITELIST = [
    'health',
    'metrics',
    'merchants',
    'orders',
    'deliveries',
    'webhooks',
    'support',
    'audit',
    'rescue',
    'search',
    'auth', // Needed for login!
    // Files
    'route.test.ts'
];

function getDirectories(srcPath) {
    if (!fs.existsSync(srcPath)) return [];
    return fs.readdirSync(srcPath).filter(file => {
        return fs.statSync(path.join(srcPath, file)).isDirectory();
    });
}

let hasError = false;

// Check UI
console.log('Checking UI Routes...');
const uiDirs = getDirectories(UI_BASE);
uiDirs.forEach(dir => {
    if (!UI_WHITELIST.includes(dir)) {
        console.error(`❌ VIOLATION: Orphan UI Route found: ${path.join(UI_BASE, dir)}`);
        hasError = true;
    }
});

// Check API
console.log('Checking API Routes...');
const apiDirs = getDirectories(API_BASE);
apiDirs.forEach(dir => {
    if (!API_WHITELIST.includes(dir)) {
        console.error(`❌ VIOLATION: Orphan API Route found: ${path.join(API_BASE, dir)}`);
        hasError = true;
    }
});

if (hasError) {
    console.log('---------------------------------------------------');
    console.error('FAILED: Ops Console V1 Route Contract Violated.');
    console.log('Delete the orphan directories or update the whitelist checking script.');
    process.exit(1);
} else {
    console.log('✅ SUCCESS: All routes comply with V1 Contract.');
}
