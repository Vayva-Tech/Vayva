const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.join(process.cwd(), 'apps/merchant-admin');
const SRC_DIR = path.join(ROOT_DIR, 'src');

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
            getAllFiles(fullPath, arrayOfFiles);
        } else {
            if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js') || file.endsWith('.json')) {
                arrayOfFiles.push(fullPath);
            }
        }
    });

    return arrayOfFiles;
}

function scan() {
    console.log('🕵️‍♀️ Starting Secret Scan...');
    const files = getAllFiles(SRC_DIR);
    let issuesFound = 0;

    files.forEach(file => {
        const content = fs.readFileSync(file, 'utf-8');
        const relativePath = path.relative(process.cwd(), file);

        PATTERNS.forEach(pattern => {
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
