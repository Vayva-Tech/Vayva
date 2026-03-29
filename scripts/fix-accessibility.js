#!/usr/bin/env node

/**
 * Accessibility Auto-Fix Script
 * Scans all industry dashboards and fixes common accessibility violations
 * 
 * Usage: node scripts/fix-accessibility.js
 */

const fs = require('fs');
const path = require('path');

// Use built-in glob pattern matching via file system traversal
function globSync(pattern, options = {}) {
  const ignorePatterns = options.ignore || [];
  const basePath = pattern.split('**')[0];
  const extension = pattern.match(/\.(tsx?)$/)?.[1] || '';
  
  const results = [];
  
  function walkDir(dir) {
    if (!fs.existsSync(dir)) return;
    
    const files = fs.readdirSync(dir);
    
    for (const file of files) {
      const fullPath = path.join(dir, file);
      const stat = fs.statSync(fullPath);
      
      // Skip ignored patterns
      if (ignorePatterns.some(ignore => fullPath.includes(ignore.replace(/\*\*/g, '')))) {
        continue;
      }
      
      if (stat.isDirectory()) {
        walkDir(fullPath);
      } else if (stat.isFile() && (extension === '' || fullPath.endsWith(`.${extension}`))) {
        results.push(fullPath);
      }
    }
  }
  
  walkDir(basePath || '.');
  return results;
}

// Configuration
const DASHBOARD_PATH = 'Frontend/merchant/src/app/(dashboard)/dashboard';
const EXCLUDE_PATTERNS = ['**/__tests__/**', '**/*.test.tsx', '**/*.spec.tsx'];

// Common accessibility fixes
const FIXES = {
  // Fix 1: Ensure images have alt text
  fixImages: {
    pattern: /<img\s+([^>]*?)\s*\/?>/g,
    replacement: (match, attributes) => {
      if (attributes.includes('alt=')) {
        return match; // Already has alt
      }
      // Add empty alt for decorative images
      return `<img ${attributes} alt="" />`;
    },
  },

  // Fix 2: Add aria-label to icon-only buttons
  fixIconButtons: {
    pattern: /<Button\s+([^>]*?)>\s*<(Pencil|Trash|Eye|Edit|Delete|Plus|X|Check|Alert)Icon/g,
    replacement: (match, attributes, iconName) => {
      if (attributes.includes('aria-label')) {
        return match; // Already has aria-label
      }
      const label = `Toggle ${iconName.toLowerCase()} action`;
      return `<Button ${attributes} aria-label="${label}"> <${iconName}Icon`;
    },
  },

  // Fix 3: Ensure form inputs have labels or aria-label
  fixFormInputs: {
    pattern: /<(input|textarea|select)\s+([^>]*?)>/gi,
    replacement: (match, tagName, attributes) => {
      if (attributes.includes('aria-label') || attributes.includes('aria-labelledby')) {
        return match; // Already accessible
      }
      if (attributes.includes('id=') && attributes.includes('type="hidden"')) {
        return match; // Hidden fields don't need labels
      }
      
      // Try to infer label from placeholder or name
      const placeholderMatch = attributes.match(/placeholder=["'](.*?)["']/);
      const nameMatch = attributes.match(/name=["'](.*?)["']/);
      const idMatch = attributes.match(/id=["'](.*?)["']/);
      
      const labelText = placeholderMatch?.[1] || nameMatch?.[1] || idMatch?.[1] || 'Field';
      
      // Check if there's a preceding label
      // This is a simplified check - full implementation would need AST parsing
      return match; // Skip for now, requires manual review
    },
  },

  // Fix 4: Add scope to table headers
  fixTableHeaders: {
    pattern: /<th([^>]*?)>/gi,
    replacement: (match, attributes) => {
      if (attributes.includes('scope=')) {
        return match; // Already has scope
      }
      return `<th${attributes} scope="col">`;
    },
  },

  // Fix 5: Ensure buttons have accessible names
  fixEmptyButtons: {
    pattern: /<Button\s+([^>]*?)>\s*<\/Button>/gi,
    replacement: (match, attributes) => {
      if (attributes.includes('aria-label')) {
        return match;
      }
      console.warn('⚠️  Empty button found - requires manual review:', match);
      return match;
    },
  },
};

// Main execution
async function main() {
  console.log('🔧 Starting accessibility auto-fix...\n');

  // Find all dashboard files
  const files = globSync(`${DASHBOARD_PATH}/**/*.tsx`, {
    ignore: EXCLUDE_PATTERNS,
  });

  console.log(`Found ${files.length} dashboard files to process\n`);

  let fixedCount = 0;
  let skippedCount = 0;

  for (const file of files) {
    try {
      const content = fs.readFileSync(file, 'utf8');
      let newContent = content;
      let fileChanged = false;

      // Apply each fix
      for (const [fixName, fix] of Object.entries(FIXES)) {
        const before = newContent;
        newContent = newContent.replace(fix.pattern, fix.replacement);
        
        if (before !== newContent) {
          console.log(`✓ Applied ${fixName} to ${file}`);
          fileChanged = true;
          fixedCount++;
        }
      }

      // Write back if changed
      if (fileChanged) {
        fs.writeFileSync(file, newContent, 'utf8');
        console.log(`💾 Saved: ${file}\n`);
      } else {
        skippedCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${file}:`, error.message);
    }
  }

  console.log('\n✅ Accessibility auto-fix complete!');
  console.log(`   Fixed: ${fixedCount} issues`);
  console.log(`   Skipped: ${skippedCount} files (no changes needed)`);
  console.log('\n📝 Next steps:');
  console.log('   1. Run: pnpm test:e2e accessibility-audit.spec.ts');
  console.log('   2. Review HTML report for remaining violations');
  console.log('   3. Manually fix complex issues (form labels, heading hierarchy)');
}

// Run if called directly
if (require.main === module) {
  main().catch(console.error);
}

module.exports = { main, FIXES };
