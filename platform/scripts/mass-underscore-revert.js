/* eslint-disable */
const fs = require('fs');
const path = require('path');

const targetDir = '/Users/fredrick/Documents/GitHub/vayva/apps/merchant-admin/src';

const patterns = [
    '_Button', '_Card', '_Icon', '_Badge', '_Input', '_Select', '_Textarea',
    '_Save', '_Trash2', '_Plus', '_Minus', '_Check', '_X',
    '_AlertCircle', '_AlertTriangle', '_Clock', '_Zap', '_Bell', '_Key',
    '_Activity', '_Separator', '_Drawer', '_StatusChip', '_GlassPanel',
    '_CheckCircle', '_MessageSquare', '_ArrowDownRight', '_ArrowUpRight',
    '_ShoppingBag', '_Users', '_DollarSign', '_ChevronRight', '_ChevronLeft',
    '_Eye', '_FileText', '_CheckCircle2', '_Search', '_MoreHorizontal',
    '_ShieldCheck', '_Shield', '_CreditCard', '_Globe', '_User', '_Inbox',
    '_Scale', '_GripVertical', '_Switch', '_Image', '_AnimatePresence',
    '_motion', '_VayvaLogo', '_IndustrySlug', '_IndustryConfig', '_IconName',
    '_formatDate', '_formatCurrency', '_formatDistanceToNow', '_logApiError'
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let originalContent = content;

    patterns.forEach(p => {
        const replacement = p.substring(1);
        // Word boundary for symbols
        const regex = new RegExp(`\\b${p}\\b`, 'g');
        content = content.replace(regex, replacement);
    });

    if (content !== originalContent) {
        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            processFile(fullPath);
        }
    });
}

walk(targetDir);
console.log('Mass remediation complete.');
