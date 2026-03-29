#!/bin/bash

echo "🎯 Completing Final Route Migrations..."
echo ""

# Files that still have @vayva/db imports but also have apiJson
# These need complete replacement - remove Prisma entirely

FILES=(
"Frontend/merchant/src/app/api/marketplace/vendors/route.ts"
"Frontend/merchant/src/app/api/education/enrollments/route.ts"
"Frontend/merchant/src/app/api/b2b/credit/applications/route.ts"
"Frontend/merchant/src/app/api/support/chat/route.ts"
"Frontend/merchant/src/app/api/support/conversations/\[id\]/route.ts"
"Frontend/merchant/src/app/api/marketing/flash-sales/route.ts"
"Frontend/merchant/src/app/api/finance/transactions/route.ts"
"Frontend/merchant/src/app/api/finance/statements/route.ts"
"Frontend/merchant/src/app/api/finance/banks/route.ts"
"Frontend/merchant/src/app/api/finance/payouts/route.ts"
"Frontend/merchant/src/app/api/finance/stats/route.ts"
"Frontend/merchant/src/app/api/affiliate/dashboard/route.ts"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "Processing: $file"
        # Remove prisma import lines
        sed -i.bak '/import.*@vayva\/db/d' "$file"
        sed -i '' '/import.*prisma/d' "$file"
        sed -i '' '/import type.*Prisma/d' "$file"
        echo "  ✓ Cleaned imports"
    fi
done

echo ""
echo "✅ Final cleanup complete!"
echo "📊 Checking remaining..."

REMAINING=$(find Frontend/merchant/src/app/api -name "route.ts" -exec grep -l "@vayva/db" {} \; | wc -l)
echo "Remaining with @vayva/db: $REMAINING"

