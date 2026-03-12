/**
 * KEYWORD VALIDATOR (ANTI-CANNIBALIZATION)
 * Ensures every template has a unique primary keyword.
 */
const fs = require('fs');
const path = require('path');

// We simulate importing the maps by reading the manifest or the file itself.
// However, the manifest is the generated "truth". Let's use the manifest if it contains them.
// Otherwise, we can parse the source file.
const MANIFEST_PATH = process.argv[2] || 'seo/manifest.json';

if (!fs.existsSync(MANIFEST_PATH)) {
    console.error(`❌ Manifest not found at: ${MANIFEST_PATH}`);
    process.exit(1);
}

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const errors = [];
const seenKeywords = new Map();

console.log('🔍 Validating Template Keyword Map...');

manifest.forEach(page => {
    if (page.pageType === 'template_detail' && page.indexable) {
        const keyword = page.primaryKeyword;
        const ctx = `[TEMPLATE ${page.path}]`;

        if (!keyword) {
            errors.push(`${ctx} Missing primary keyword.`);
            return;
        }

        const normalized = keyword.toLowerCase().trim();

        // Generic keyword check
        const genericTerms = ['template', 'store template', 'website', 'online store'];
        if (genericTerms.includes(normalized)) {
            errors.push(`${ctx} Primary keyword "${keyword}" is too generic.`);
        }

        if (seenKeywords.has(normalized)) {
            errors.push(`${ctx} Primary keyword cannibalization: "${keyword}" already used by ${seenKeywords.get(normalized)}`);
        } else {
            seenKeywords.set(normalized, page.path);
        }
    }
});

// Since the manifest in V1 might not have all real templates yet, 
// we also validate the source file src/lib/seo/keywords/templates.ts if possible.
// But for CI, the manifest is the target.

if (errors.length > 0) {
    console.error(`\n❌ KEYWORD VALIDATION FAILED with ${errors.length} errors:`);
    errors.forEach(e => console.error(e));
    process.exit(1);
} else {
    console.log(`\n✅ Keyword Map passes anti-cannibalization gates.`);
    process.exit(0);
}
