#!/bin/bash

# BATCH A EXECUTION SCRIPT
# Removes all mock data and implements production-ready code
# Run from: apps/merchant-admin/

set -e

echo "🚀 BATCH A EXECUTION - LAUNCH BLOCKERS"
echo "======================================"
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# TASK 1: DELETE MOCK FILES
echo "📦 TASK 1: Deleting mock files..."
echo ""

if [ -f "src/lib/mockData.ts" ]; then
    echo "Deleting src/lib/mockData.ts..."
    rm src/lib/mockData.ts
    echo -e "${GREEN}✅ Deleted mockData.ts${NC}"
else
    echo -e "${YELLOW}⚠️  mockData.ts already deleted${NC}"
fi

if [ -f "src/lib/mock-db.ts" ]; then
    echo "Deleting src/lib/mock-db.ts..."
    rm src/lib/mock-db.ts
    echo -e "${GREEN}✅ Deleted mock-db.ts${NC}"
else
    echo -e "${YELLOW}⚠️  mock-db.ts already deleted${NC}"
fi

if [ -f "src/services/MockWhatsAppParser.ts" ]; then
    echo "Deleting src/services/MockWhatsAppParser.ts..."
    rm src/services/MockWhatsAppParser.ts
    echo -e "${GREEN}✅ Deleted MockWhatsAppParser.ts${NC}"
else
    echo -e "${YELLOW}⚠️  MockWhatsAppParser.ts already deleted${NC}"
fi

# Delete debug endpoint that uses MockWhatsAppParser
if [ -f "src/app/api/debug/mock-whatsapp-order/route.ts" ]; then
    echo "Deleting debug endpoint..."
    rm -rf src/app/api/debug/mock-whatsapp-order
    echo -e "${GREEN}✅ Deleted mock WhatsApp debug endpoint${NC}"
fi

echo ""
echo -e "${GREEN}✅ TASK 1 COMPLETE: All mock files deleted${NC}"
echo ""

# TASK 2-8 will be implemented in code changes
echo "📝 Remaining tasks require code modifications:"
echo "  - Task 2: Authentication hardening"
echo "  - Task 3: Payment hardening"
echo "  - Task 4: Store configuration"
echo "  - Task 5: WhatsApp decision"
echo "  - Task 6: KYC hardening"
echo "  - Task 7: Remove dead-clicks"
echo "  - Task 8: Production gates (already done)"
echo ""
echo "These will be implemented via code edits..."
echo ""

echo "======================================"
echo -e "${GREEN}✅ BATCH A SCRIPT COMPLETE${NC}"
echo "======================================"
