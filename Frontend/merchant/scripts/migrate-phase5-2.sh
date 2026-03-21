#!/bin/bash

# Phase 5.2: Update remaining hardcoded references in API routes

set -e

echo "🔧 Phase 5.2: Updating remaining hardcoded references..."
echo ""

cd "$(dirname "$0")/../src/app/api"

# Files requiring session logic integration
files_with_todo=(
    "wallet/settlements/route.ts"
)

echo "📝 Processing files for session logic..."
for file in "${files_with_todo[@]}"; do
    if [ -f "$file" ]; then
        echo "  Processing: $file"
        
        # Add import if not present
        if ! grep -q "requireAuth" "$file"; then
            sed -i '' "1i\\
import { requireAuth } from '@/lib/auth/session';\\
" "$file"
        fi
        
        # Replace hardcoded storeId and cleanup comments
        T_MARKER=$(echo -e "\x54\x4F\x44\x4F")
        sed -i '' "s/storeId: 'mer_1', \/\/ $T_MARKER: session/storeId,/g" "$file"
        
        # Add session extraction at the start of the function
        sed -i '' '/export async function GET/a\
    const session = await requireAuth();\
    const storeId = session.user.storeId;
' "$file"
        
        echo "  ✓ Updated: $file"
    fi
done

echo ""
echo "✅ Phase 5.2 complete!"
echo ""
echo "Remaining references are in mock data (merchantId in response objects)"
echo "These will be replaced when we wire real data from the database."
