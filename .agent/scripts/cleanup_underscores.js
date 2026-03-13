const fs = require('fs');
const path = require('path');

const SCAN_DIRS = ['apps', 'packages', 'services', 'infra'];

// Names we know are "botched" underscores
const BOTCHED_NAMES = [
    'asChild',
    'activeSubcategory',
    'useState',
    'useEffect',
    'useMemo',
    'useCallback',
    'useContext',
    'useReducer',
    'useRef',
    'cn',
    'user',
    'userContext',
    'merchantContext',
    'authMeResponse',
    'Prisma',
    'PrismaClient',
    'ChinaSyncService',
    'MapPin',
    'Star',
    'Clock',
    'ChevronRight',
    'Package',
    'HelpCircle',
    'Home',
    'Search',
    'ShoppingCart',
    'Plus',
    'Minus',
    'Loader2'
];

function processFile(filePath) {
    if (!filePath.endsWith('.tsx') && !filePath.endsWith('.ts') && !filePath.endsWith('.js')) return 0;

    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;
    let modified = false;

    // 1. Fix underscored imports: { ..., _Name as Name, ... } or { ..., _Name, ... }
    for (const name of BOTCHED_NAMES) {
        // Pattern: _Name as Name -> Name
        const importAsRegex = new RegExp(`\\b_${name}\\s+as\\s+${name}\\b`, 'g');
        if (importAsRegex.test(content)) {
            content = content.replace(importAsRegex, name);
            modified = true;
        }

        // Pattern: { ..., _Name, ... } where it should be { ..., Name, ... }
        // This is tricky because we don't want to break actual private fields.
        // But in the context of Vayva's botched fixes, it's usually in { } for imports or params.

        // Fix import/destructuring: { ..., _Name, ... }
        const braceRegex = new RegExp(`([{,]\\s*)_${name}(\\s*[},])`, 'g');
        if (braceRegex.test(content)) {
            content = content.replace(braceRegex, `$1${name}$2`);
            modified = true;
        }

        // Fix default assignment/destructuring: { ..., _Name = ..., ... }
        const assignRegex = new RegExp(`([{,]\\s*)_${name}(\\s*=[^,}]+)`, 'g');
        if (assignRegex.test(content)) {
            content = content.replace(assignRegex, `$1${name}$2`);
            modified = true;
        }

        // Fix React._useState or similar
        const dotRegex = new RegExp(`\\._${name}\\b`, 'g');
        if (dotRegex.test(content)) {
            content = content.replace(dotRegex, `.${name}`);
            modified = true;
        }

        // Fix standalone usage of botched names if they were renamed
        // Only if we see it was likely a rename. 
        // For simplicity, we only fix those that are clearly botched in common patterns above.
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        return 1;
    }
    return 0;
}

function traverse(dir) {
    if (!fs.existsSync(dir)) return 0;
    let count = 0;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === '.next' || entry.name === 'generated') continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            count += traverse(fullPath);
        } else if (entry.isFile()) {
            count += processFile(fullPath);
        }
    }
    return count;
}

console.log('Starting global underscore botch fix removal...');
let total = 0;
for (const dir of SCAN_DIRS) {
    const target = path.resolve(process.cwd(), dir);
    total += traverse(target);
}
console.log(`Total files cleaned: ${total}`);
