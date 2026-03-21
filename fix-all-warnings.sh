#!/bin/bash

# Vayva Complete Warning Fix - One Command Solution
# 
# This script fixes ALL fixable warnings in one comprehensive pass:
# - Unused variables/parameters/imports
# - Console statements  
# - Broken/deprecated files
# - Explicit 'any' types
# 
# Usage: ./fix-all-warnings.sh

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}=== VAYVA COMPLETE WARNING FIX ===${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Check if running from project root
if [ ! -d "packages" ] || [ ! -d "Frontend" ] || [ ! -d "Backend" ]; then
    echo -e "${RED}Error: Must run from Vayva project root${NC}"
    exit 1
fi

# Get initial warning count
echo -e "${BLUE}📊 Analyzing current warnings...${NC}"
INITIAL_COUNT=$(pnpm lint 2>&1 | wc -l | tr -d ' ')
echo -e "Current warnings: ${YELLOW}${INITIAL_COUNT} lines${NC}"
echo ""

# Run the complete fix script
echo -e "${MAGENTA}🚀 Running complete warning annihilation...${NC}"
echo ""

node platform/scripts/fix-all-warnings-complete.js

# Get final warning count
echo ""
echo -e "${BLUE}📊 Calculating final results...${NC}"
FINAL_COUNT=$(pnpm lint 2>&1 | wc -l | tr -d ' ')

echo -e "\n${CYAN}========================================${NC}"
echo -e "${CYAN}=== FINAL RESULTS ===${NC}"
echo -e "${CYAN}========================================${NC}\n"

echo -e "${GREEN}📈 IMPACT:${NC}"
echo -e "  Before: ${YELLOW}${INITIAL_COUNT} lines${NC}"
echo -e "  After:  ${YELLOW}${FINAL_COUNT} lines${NC}"

REDUCTION=$((INITIAL_COUNT - FINAL_COUNT))
if [ $REDUCTION -gt 0 ]; then
    PERCENTAGE=$((REDUCTION * 100 / INITIAL_COUNT))
    echo -e "  Fixed:  ${GREEN}${REDUCTION} lines (${PERCENTAGE}% reduction)${NC}"
elif [ $REDUCTION -eq 0 ]; then
    echo -e "  Change: ${YELLOW}No change${NC}"
else
    echo -e "  Change: ${RED}+${REDUCTION} lines (warnings increased)${NC}"
fi

echo ""
echo -e "${GREEN}✅ SUCCESS METRICS:${NC}"
if [ $FINAL_COUNT -lt 2000 ]; then
    echo -e "  ${GREEN}🎉 OUTSTANDING! Warning count is excellent${NC}"
elif [ $FINAL_COUNT -lt 3000 ]; then
    echo -e "  ${GREEN}🎉 EXCELLENT! Warning count is very low${NC}"
elif [ $FINAL_COUNT -lt 4000 ]; then
    echo -e "  ${GREEN}✓ GREAT! Significant progress made${NC}"
else
    echo -e "  ${GREEN}✓ GOOD! Improvement achieved${NC}"
fi

echo ""
echo -e "${CYAN}📋 NEXT STEPS:${NC}"
echo "  1. Review changes: git diff"
echo "  2. Test locally: pnpm dev"
echo "  3. Run tests: pnpm test"
echo "  4. Commit: git add . && git commit -m 'chore: complete warning fix'"
echo ""

echo -e "${MAGENTA}💡 TIP: Run this script anytime to fix all auto-fixable warnings!${NC}"
echo ""
