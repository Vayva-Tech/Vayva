const fs = require('fs');
const path = require('path');

const rootDir = process.cwd();
const targetDeps = [
    'react',
    'react-dom',
    'next',
    'typescript',
    'zod',
    '@prisma/client',
    'tailwindcss',
    'framer-motion',
    'lucide-react',
    'date-fns'
];

function findPackageJsons(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
                findPackageJsons(filePath, fileList);
            }
        } else if (file === 'package.json') {
            fileList.push(filePath);
        }
    });
    return fileList;
}

const packageJsons = findPackageJsons(rootDir);
const versionMap = {};

targetDeps.forEach(dep => versionMap[dep] = new Set());

packageJsons.forEach(pkgPath => {
    try {
        const content = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
        const allDeps = {
            ...(content.dependencies || {}),
            ...(content.devDependencies || {}),
            ...(content.peerDependencies || {})
        };

        targetDeps.forEach(dep => {
            if (allDeps[dep]) {
                versionMap[dep].add(allDeps[dep]);
            }
        });
    } catch (_e) {
        // ignore
    }
});

console.log('--- Dependency Version Mismatch Report (Detailed) ---');
targetDeps.forEach(dep => {
    const versions = Array.from(versionMap[dep]);
    if (versions.length > 1) {
        console.log(`\n❌ Mismatch found for ${dep}:`);

        versions.forEach(v => {
            console.log(`   Version: ${v}`);
            packageJsons.forEach(p => {
                const content = JSON.parse(fs.readFileSync(p, 'utf8'));
                const all = { ...content.dependencies, ...content.devDependencies, ...content.peerDependencies };
                if (all[dep] === v) {
                    console.log(`      - ${path.relative(rootDir, p)}`);
                }
            });
        });
    }
});
