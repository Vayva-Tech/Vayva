import fs from 'fs';
import path from 'path';

const ROOT_DIR = path.resolve(__dirname, '..');
const API_DIR = path.join(ROOT_DIR, 'apps/merchant/src/app/api');

const UNSAFE_PATTERNS = [
  /\.(findUnique|findUniqueOrThrow|update|delete|upsert)\(\{\s*where:\s*\{/g,
];

// Models that are global and allowed to use findUnique by id
const GLOBAL_MODELS = [
  'templateManifest',
];

// Subtrees that are public-facing (scoped by slug, not storeId from session)
const PUBLIC_SUBTREES = [
  'api/storefront',
  'api/support',
  'api/billing/template-switch/verify',
];

// Helper to check if a where clause contains storeId or merchantId
function isScoped(content, matchIndex) {
  const remaining = content.slice(matchIndex);
  
  // Find the closing of the where object
  let depth = 0;
  let endOfWhere = -1;
  let startSearch = remaining.indexOf('where:');
  if (startSearch === -1) return false;
  
  let i = remaining.indexOf('{', startSearch);
  if (i === -1) return false;
  
  for (; i < remaining.length; i++) {
    if (remaining[i] === '{') depth++;
    if (remaining[i] === '}') {
      depth--;
      if (depth === 0) {
        endOfWhere = i;
        break;
      }
    }
  }
  
  if (endOfWhere === -1) return false;
  const whereClause = remaining.slice(startSearch, endOfWhere);
  
  // Check if it's a global model
  const beforeMatch = content.slice(0, matchIndex);
  const lastDot = beforeMatch.lastIndexOf('.');
  if (lastDot !== -1) {
    const modelName = beforeMatch.slice(lastDot + 1).trim();
    if (GLOBAL_MODELS.includes(modelName)) return true;
  }

  // Check for scoping variables (including compound unique keys)
  return /\b(storeId|merchantId|userId|user\.id|ctx\.storeId|context\.storeId|slug|storeId_)\b/.test(whereClause);
}

// Directories that MUST be store-scoped
const STORE_OWNED_SUBTREES = [
  'api/orders',
  'api/products',
  'api/customers',
  'api/fulfillment',
  'api/domains',
  'api/payouts',
  'api/wallet',
  'api/inbox',
  'api/bookings',
  'api/exports',
  'api/templates',
  'api/properties',
  'api/nightlife',
  'api/stays',
  'api/courses',
  'api/projects',
  'api/marketing',
  'api/merchant',
  'api/ai',
  'api/ai-agent',
  'api/analytics',
  'api/appeals',
  'api/audit',
  'api/billing',
  'api/campaigns',
  'api/checkout',
  'api/collections',
  'api/compliance',
  'api/control-center',
  'api/finance',
  'api/integrations',
  'api/invoices',
  'api/jobs',
  'api/kitchen',
  'api/kyc',
  'api/leads',
  'api/marketplace',
  'api/notifications',
  'api/paystack',
  'api/portfolio',
  'api/quotes',
  'api/resources',
  'api/reviews',
  'api/seller',
  'api/services',
  'api/socials',
  'api/storage',
  'api/store',
  'api/storefront',
  'api/stores',
  'api/support',
  'api/vehicles',
  'api/whatsapp',
];

// Ops routes that should NOT be in merchant
const FORBIDDEN_OPS_SUBTREE = 'api/ops';

let idorViolations = 0;
let opsViolations = 0;

function walk(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stats = fs.statSync(fullPath);
    
    if (stats.isDirectory()) {
      walk(fullPath);
    } else if (stats.isFile() && (file.endsWith('.ts') || file.endsWith('.tsx'))) {
      const relativePath = path.relative(ROOT_DIR, fullPath);
      const apiRelativePath = path.relative(path.join(ROOT_DIR, 'apps/merchant/src/app'), fullPath);

      // Check for forbidden ops routes
      if (apiRelativePath.startsWith(FORBIDDEN_OPS_SUBTREE)) {
        console.error(`❌ FORBIDDEN OPS ROUTE in ${relativePath}: Move ops routes to ops-console.`);
        opsViolations++;
        continue;
      }

      // Check for IDOR only in store-owned subtrees
      const isStoreOwned = STORE_OWNED_SUBTREES.some(subtree => apiRelativePath.startsWith(subtree));
      if (!isStoreOwned) continue;

      // Skip public-facing subtrees (scoped by slug, not session storeId)
      const isPublic = PUBLIC_SUBTREES.some(subtree => apiRelativePath.startsWith(subtree));
      if (isPublic) continue;

      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      // If the file uses withVayvaAPI, storeId is guaranteed in context.
      // If the file references storeId anywhere, it's using it for scoping.
      const usesVayvaAPI = /withVayvaAPI/.test(content);
      const referencesStoreId = /\bstoreId\b/.test(content);
      if (usesVayvaAPI && referencesStoreId) continue;
      
      UNSAFE_PATTERNS.forEach(pattern => {
        let match;
        // Reset regex state for global matches
        pattern.lastIndex = 0;
        
        while ((match = pattern.exec(content)) !== null) {
          if (!isScoped(content, match.index)) {
            const lineNum = content.substring(0, match.index).split('\n').length;
            console.error(`❌ IDOR Violation in ${relativePath}:${lineNum}: Use store-scoped findFirst/updateMany instead of findUnique/update by id.`);
            idorViolations++;
          }
        }
      });
    }
  }
}

console.log('🔍 Checking for IDOR patterns and forbidden ops routes in merchant API...');
walk(API_DIR);

if (idorViolations > 0 || opsViolations > 0) {
  console.error(`\nFound ${idorViolations} potential IDOR violations and ${opsViolations} forbidden ops routes.`);
  process.exit(1);
} else {
  console.log('\n✅ No critical boundary violations found.');
}
