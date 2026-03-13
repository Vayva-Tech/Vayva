const fs = require('fs');
const path = require('path');

const ROOT_DIRS = ['apps', 'packages'];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    // Regex to find catch (_e) { or catch (_err) { and replace with catch {
    // We target _\w+ to catch any underscored variable
    const catchRegex = /catch\s*\(\s*_\w+\s*\)\s*\{/g;

    if (catchRegex.test(content)) {
        content = content.replace(catchRegex, 'catch {');
        fs.writeFileSync(filePath, content);
        console.log(`Fixed unused catch var in ${filePath}`);
        return 1;
    }
    return 0;
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += traverse(fullPath);
        } else if (entry.isFile() && (entry.name.endsWith('.ts') || entry.name.endsWith('.tsx'))) {
            count += processFile(fullPath);
        }
    }
    return count;
}

console.log('Starting global unused catch var fix...');
let total = 0;
for (const dir of ROOT_DIRS) {
    const target = path.resolve(process.cwd(), dir);
    total += traverse(target);
}
console.log(`Total files fixed: ${total}`);
