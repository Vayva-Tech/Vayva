import fs from 'fs';
import path from 'path';

const ROOT_DIR = process.cwd();
const TARGET_DIRS = ['Frontend', 'Backend', 'packages', 'platform']
    .map((dir) => path.join(ROOT_DIR, dir))
    .filter((dir) => fs.existsSync(dir));

const SKIP_DIRS = new Set([
    'node_modules',
    '.git',
    '.next',
    'dist',
    'build',
    'coverage',
    'playwright-report',
    'test-results',
    'generated',
]);

const SCANNABLE_EXTENSIONS = new Set(['.ts', '.tsx', '.js', '.jsx', '.json', '.mjs', '.cjs', '.yml', '.yaml', '.env']);

const PATTERNS = [
    { name: 'Paystack Secret', regex: /sk_live_[a-zA-Z0-9]{32,}/g },
    { name: 'Paystack Test', regex: /sk_test_[a-zA-Z0-9]{32,}/g },
    { name: 'GitHub Token', regex: /ghp_[a-zA-Z0-9]{36}/g },
    { name: 'AWS Key', regex: /AKIA[0-9A-Z]{16}/g },
    { name: 'Slack Token', regex: /xox[baprs]-([0-9a-zA-Z]{10,48})/g },
    { name: 'Generic Private Key', regex: /-----BEGIN PRIVATE KEY-----/g },
    { name: 'Hardcoded Secret Assignment', regex: /const\s+[A-Z_]+_KEY\s*=\s*["'](?!process\.env).{20,}["']/g }, // simplistic check
];

function getAllFiles(dirPath, arrayOfFiles = []) {
    if (!fs.existsSync(dirPath)) return arrayOfFiles;

    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
        const fullPath = path.join(dirPath, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (SKIP_DIRS.has(file)) return;
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (/\.(test|spec)\.[jt]sx?$/.test(file)) return;
            if (SCANNABLE_EXTENSIONS.has(path.extname(file))) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function scan() {
    console.log('🕵️‍♀️ Starting Secret Scan...');
    const files = TARGET_DIRS.flatMap((dir) => getAllFiles(dir));
    let issuesFound = 0;

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(process.cwd(), file);

        PATTERNS.forEach(pattern => {
            pattern.regex.lastIndex = 0;
            if (pattern.regex.test(content)) {

                // Allow exceptions if explicitly commented
                if (content.includes('// nosecret') || content.includes('// ignore-secret')) {
                    return;
                }

                console.error(`🚨 POTENTIAL SECRET FOUND: [${pattern.name}] in ${relativePath}`);
                // Print snippet (obfuscated)
                const matches = content.match(pattern.regex);
                if (matches) {
                    matches.forEach(m => console.log(`   Match: ${m.substring(0, 5)}...`));
                }
                issuesFound++;
            }
        });
    });

    if (issuesFound > 0) {
        console.log(`\n❌ Found ${issuesFound} potential secrets.`);
        process.exit(1);
    } else {
        console.log('\n✅ No secrets found.');
        process.exit(0);
    }
}

scan();
