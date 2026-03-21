#!/bin/bash

# Migration Script: Replace hardcoded mer_1 with session-based storeId
# Phase 5: Security & Multi-Tenancy

set -e

echo "🔍 Phase 5: Removing hardcoded 'mer_1' references..."
echo ""

# Navigate to API directory
cd "$(dirname "$0")/../src/app/api"

# Find all files with hardcoded mer_1
echo "📋 Finding files with hardcoded storeId..."
files=$(grep -r "storeId = 'mer_1'" . --include="*.ts" -l | grep -v node_modules || true)

if [ -z "$files" ]; then
    echo "✅ No hardcoded 'mer_1' found!"
    exit 0
fi

echo "Found $(echo "$files" | wc -l) files to update:"
echo "$files"
echo ""

# Backup
echo "💾 Creating backup..."
backup_dir="/tmp/vayva_backup_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$backup_dir"
echo "$files" | while read file; do
    if [ -f "$file" ]; then
        cp "$file" "$backup_dir/$(basename $file)"
    fi
done
echo "Backup created at: $backup_dir"
echo ""

# Process each file
echo "🔧 Updating files..."
echo "$files" | while read file; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        
        # Check if requireAuth is already imported
        if ! grep -q "requireAuth" "$file"; then
            # Add import at the top (after other imports)
            sed -i '' "/^import.*from/a\\
import { requireAuth } from '@/lib/auth/session';
" "$file"
        fi
        
        # Replace hardcoded storeId patterns
        # Pattern 1: const storeId = 'mer_1';
        sed -i '' "s/const storeId = 'mer_1';/const session = await requireAuth();\n    const storeId = session.user.storeId;/g" "$file"
        
        # Pattern 2: const storeId = 'mer_1' (without semicolon)
        sed -i '' "s/const storeId = 'mer_1'/const session = await requireAuth();\n    const storeId = session.user.storeId/g" "$file"
        
        # Pattern 3: storeId: 'mer_1' in object literals
        sed -i '' "s/storeId: 'mer_1'/storeId/g" "$file"
        
        echo "  ✓ Updated: $file"
    fi
done

echo ""
echo "✅ Migration complete!"
echo ""
echo "📊 Summary:"
echo "  Files updated: $(echo "$files" | wc -l)"
echo "  Backup location: $backup_dir"
echo ""
echo "🔍 Verifying..."
remaining=$(grep -r "mer_1" . --include="*.ts" | grep -v node_modules | wc -l || true)
if [ "$remaining" -eq 0 ]; then
    echo "✅ No 'mer_1' references remaining!"
else
    echo "⚠️  Warning: $remaining 'mer_1' references still found (may be in comments or strings)"
    echo "   Run: grep -r \"mer_1\" src/app/api --include=\"*.ts\" to review"
fi
echo ""
echo "Next steps:"
echo "  1. Review changes: git diff"
echo "  2. Test API routes"
echo "  3. Run: pnpm tsc --noEmit"
echo "  4. Commit changes"
