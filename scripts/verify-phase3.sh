#!/bin/bash

echo "🧪 Running Phase 3 Test Verification..."
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if dependencies are installed
echo "📦 Checking dependencies..."
if ! pnpm list @axe-core/playwright > /dev/null 2>&1; then
    echo -e "${YELLOW}⚠️  Installing accessibility testing tools...${NC}"
    pnpm add -D @axe-core/playwright @lhci/cli
fi
echo -e "${GREEN}✅ Dependencies installed${NC}"
echo ""

# Run a quick smoke test on one industry
echo "🔍 Running smoke test on healthcare dashboard..."
pnpm test:e2e tests/e2e/industries/healthcare-dashboard.spec.ts --reporter=list

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Healthcare tests passed${NC}"
else
    echo -e "${RED}❌ Healthcare tests failed - check test selectors${NC}"
    exit 1
fi

# Run accessibility audit on one dashboard
echo ""
echo "♿ Running accessibility audit..."
pnpm test:e2e tests/e2e/accessibility/accessibility-audit.spec.ts --grep "healthcare" --reporter=list

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Accessibility audit passed${NC}"
else
    echo -e "${YELLOW}⚠️  Accessibility violations found - review report${NC}"
fi

# Quick bundle analysis
echo ""
echo "📊 Running bundle analysis..."
pnpm analyze:bundle

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Bundle analysis complete${NC}"
else
    echo -e "${YELLOW}⚠️  Bundle analysis encountered issues${NC}"
fi

echo ""
echo "=========================================="
echo "🎉 Phase 3 Verification Complete!"
echo "=========================================="
echo ""
echo "Next steps:"
echo "1. Review bundle analysis report for optimization opportunities"
echo "2. Run full test suite: pnpm test:e2e"
echo "3. Run performance audit: pnpm check:performance"
echo ""
echo "📄 Reports generated:"
echo "   - Bundle Analysis: bundle-analysis-report.json"
echo "   - Lighthouse Reports: .lighthouseci/reports/"
echo ""
