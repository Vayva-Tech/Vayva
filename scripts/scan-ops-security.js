const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_DIRS = [
    'apps/ops-console/src/app/ops',
    'apps/ops-console/src/app/api/ops'
];

const FORBIDDEN_TERMS = ['mock', 'stub', 'dummy', 'localhost'];
const REQUIRED_AUTH = 'OpsAuthService.requireSession';

let hasError = false;

// 1. Scan for Forbidden Terms
console.log('🔍 Scanning for forbidden terms...');
try {
    // Use grep recursively
    // Exclude node_modules, .git, and this script itself if it were in the target (it's not)
    // We use grep because it's fast.
    const cmd = `grep -rE "${FORBIDDEN_TERMS.join('|')}" ${TARGET_DIRS.join(' ')} --include="*.ts" --include="*.tsx" --exclude="*.test.ts" --exclude="*.spec.ts"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    if (output.trim()) {
        console.error('❌ FAILURE: Forbidden terms found in production code:');
        console.error(output);
        hasError = true;
    }
} catch (e) {
    // grep returns exit code 1 if no matches, which throws error in execSync. This is SUCCESS.
    if (e.status !== 1) {
        console.error('grep failed with error:', e);
        // If status is not 1, it might be a real error.
    }
}

// 2. Scan for Missing Auth in API
console.log('🔒 Scanning API routes for Auth Enforcement...');
const apiDir = 'apps/ops-console/src/app/api/ops';

function walk(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const stat = fs.statSync(path.join(dir, file));
        if (stat.isDirectory()) {
            walk(path.join(dir, file), fileList);
        } else {
            if (file === 'route.ts') fileList.push(path.join(dir, file));
        }
    }
    return fileList;
}

const apiRoutes = walk(apiDir);
apiRoutes.forEach(routePath => {
    // Exception: Login API is public
    if (routePath.includes('auth/login')) return;

    const content = fs.readFileSync(routePath, 'utf-8');
    if (!content.includes(REQUIRED_AUTH)) {
        console.error(`❌ SECURITY RISK: Route missing '${REQUIRED_AUTH}': ${routePath}`);
        hasError = true;
    }
});

if (hasError) {
    console.log('---------------------------------------------------');
    console.error('🛑 SECURITY SCAN FAILED');
    process.exit(1);
} else {
    console.log('✅ SECURITY SCAN PASSED');
}
