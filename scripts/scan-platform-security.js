/* eslint-disable */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const TARGET_SCAN_DIRS = ['.']; // Scan whole project
const EXCLUDE_DIRS = ['node_modules', '.git', '.next', 'dist', '.turbo'];

const FORBIDDEN_PATTERNS = [
    { name: 'Paystack Live Key', pattern: 'sk_live_[a-zA-Z0-9]{15,}' },
    { name: 'Groq API Key', pattern: 'gsk_[a-zA-Z0-9]{15,}' },
    { name: 'GitHub Personal Access Token', pattern: 'ghp_[a-zA-Z0-9]{15,}' },
    { name: 'Hardcoded Mock/Stub', pattern: '(mock|stub|dummy)\\s*[:=]' },
];

const FORBIDDEN_WORDS = ['localhost:3000', 'localhost:4000'];
// vayva.com is only forbidden as a URL/hostname, not as an email domain
const FORBIDDEN_URL_PATTERNS = [/https?:\/\/[^"']*vayva\.com/];

let hasError = false;

console.log('🔍 Running Global Security & Compliance Scan...');

// 1. Scan for leaked secrets
console.log('🔑 Checking for leaked secrets and keys...');
FORBIDDEN_PATTERNS.forEach(({ name, pattern }) => {
    try {
        const excludeFlags = EXCLUDE_DIRS.map(d => `--exclude-dir="${d}"`).join(' ');
        // We scan everything but skip certain files that are explicitly allowed (like this script or docs that use placeholders)
        const cmd = `grep -rE "${pattern}" ${TARGET_SCAN_DIRS.join(' ')} ${excludeFlags} --include="*.ts" --include="*.tsx" --include="*.js" --include="*.jsx" --exclude="scan-platform-security.js" --exclude="*.example" --exclude="*.test.ts" --exclude="*.spec.ts" --exclude="*.test.js" --exclude="*.spec.js"`;
        const output = execSync(cmd, { encoding: 'utf-8' });

        if (output.trim()) {
            console.error(`❌ FAILURE: ${name} pattern found in codebase!`);
            console.error(output);
            hasError = true;
        }
    } catch {
        // grep returns 1 if no matches
    }
});

// 2. Checking for illegal hostnames
console.log('🌐 Checking for illegal hostnames (must be vayva.ng)...');
FORBIDDEN_WORDS.forEach(word => {
    try {
        const excludeFlags = EXCLUDE_DIRS.map(d => `--exclude-dir="${d}"`).join(' ');
        // Exclude test files, spec files, dev stubs, and this scanner itself
        const cmd = `grep -rn "${word}" ${TARGET_SCAN_DIRS.join(' ')} ${excludeFlags} --include="*.ts" --include="*.tsx" --include="*.js" --exclude="*.example" --exclude="*.test.ts" --exclude="*.spec.ts" --exclude="*.test.js" --exclude="*.spec.js" --exclude="scan-platform-security.js"`;
        const output = execSync(cmd, { encoding: 'utf-8' });

        if (output.trim()) {
            // Filter out lines that are safe dev-only references
            const lines = output.trim().split('\n').filter(line => {
                // Allow: NODE_ENV-gated fallbacks (both "production" ternary and "development" guard)
                if (/NODE_ENV/.test(line)) return false;
                // Allow: lines in test files/helpers
                if (/tests\//.test(line) || /\.spec\.|\.test\./.test(line)) return false;
                // Allow: lines in /api/dev/ or /api/test/ stubs
                if (/\/api\/dev\//.test(line) || /\/api\/test\//.test(line)) return false;
                // Allow: scripts (smoke tests, dev tooling)
                if (/^\.\/(scripts|infra)\//.test(line)) return false;
                // Allow: playwright/test config files
                if (/playwright\.config/.test(line)) return false;
                // Allow: code comments (// ...)
                if (/\/\/.*localhost/.test(line)) return false;
                // Allow: console.log/warn with localhost (dev-only output)
                if (/console\.(log|warn|info)/.test(line)) return false;
                // Allow: packages used only in dev (load-test)
                if (/packages\/load-test/.test(line)) return false;
                // Allow: merchant-admin dev scripts
                if (/merchant-admin\/scripts\//.test(line)) return false;
                return true;
            });
            if (lines.length > 0) {
                console.error(`❌ FAILURE: Forbidden word '${word}' found:`);
                lines.forEach(l => console.error(l));
                hasError = true;
            }
        }
    } catch { }
});

// 3. Scan Ops API routes for Auth Enforcement
console.log('🔒 Scanning Ops API routes for Auth Enforcement...');
const opsApiDir = 'apps/ops-console/src/app/api/ops';

function walk(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
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

const apiRoutes = walk(opsApiDir);
apiRoutes.forEach(routePath => {
    // Skip legitimately unauthenticated routes
    if (routePath.includes('auth/login') || routePath.includes('auth/signout')) return;
    const content = fs.readFileSync(routePath, 'utf-8');
    // Accept any of the auth wrapper patterns (they all call requireSession internally)
    const hasAuth = content.includes('OpsAuthService.requireSession')
        || content.includes('withOpsAPI')
        || content.includes('withOpsAuth')
        || content.includes('withOpsRBAC');
    if (!hasAuth) {
        console.error(`❌ SECURITY RISK: Ops Route missing auth wrapper: ${routePath}`);
        hasError = true;
    }
});

// 4. Scan for Transactional mutations in Merchant Admin (Audit Trail Check)
console.log('📝 Scanning Merchant Admin for Audit Log Coverage...');
try {
    const cmd = `grep -rE "export async function (POST|PATCH|DELETE)" apps/merchant-admin/src/app/api --include="route.ts"`;
    const output = execSync(cmd, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');

    lines.forEach(line => {
        const filePath = line.split(':')[0];
        const content = fs.readFileSync(filePath, 'utf-8');
        // Check if logAuditEvent or logAudit is called
        // Allow explicit skip comment: // audit-skip: [reason]
        if (!content.includes('logAuditEvent') && !content.includes('logAudit') && !content.includes('audit-skip')) {
            console.warn(`⚠️  AUDIT WARNING: Potential missing audit log in ${filePath}`);
            // We set warning but don't fail yet unless critical routes are missed
        }
    });
} catch { }

if (hasError) {
    console.log('---------------------------------------------------');
    console.error('🛑 SECURITY SCAN FAILED. Fix issues before committing.');
    process.exit(1);
} else {
    console.log('✅ SECURITY SCAN PASSED');
    process.exit(0);
}
