#!/bin/bash

# Vayva Platform - Complete Test Suite Runner
# Executes all tests in proper sequence

set -e  # Exit on error

echo "======================================"
echo "🧪 VAYVA COMPLETE TEST SUITE"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test suite
run_test() {
    local test_name=$1
    local test_command=$2
    
    echo -e "${YELLOW}Running: ${test_name}${NC}"
    TOTAL_TESTS=$((TOTAL_TESTS + 1))
    
    if eval "$test_command"; then
        echo -e "${GREEN}✓ PASSED: ${test_name}${NC}"
        PASSED_TESTS=$((PASSED_TESTS + 1))
    else
        echo -e "${RED}✗ FAILED: ${test_name}${NC}"
        FAILED_TESTS=$((FAILED_TESTS + 1))
    fi
    
    echo ""
}

# Step 1: Environment Setup
echo "📦 Step 1: Environment Setup"
echo "----------------------------"
run_test "Node.js version check" "node --version"
run_test "pnpm version check" "pnpm --version"
run_test "Install dependencies" "pnpm install --frozen-lockfile"
echo ""

# Step 2: Type Checking
echo "🔍 Step 2: Type Checking"
echo "------------------------"
run_test "TypeScript type check" "pnpm typecheck"
echo ""

# Step 3: Linting
echo "🎨 Step 3: Linting"
echo "------------------"
run_test "ESLint check" "pnpm lint"
run_test "Prettier format check" "pnpm format:check"
echo ""

# Step 4: Unit Tests
echo "🧪 Step 4: Unit Tests"
echo "---------------------"
run_test "Vitest unit tests" "pnpm test:unit"
echo ""

# Step 5: Integration Tests
echo "🔗 Step 5: Integration Tests"
echo "-----------------------------"
run_test "Dashboard integration tests" "pnpm test:integration"
echo ""

# Step 6: E2E Tests (if Playwright is set up)
echo "🌐 Step 6: E2E Tests"
echo "--------------------"
if [ -f "playwright.config.ts" ]; then
    run_test "Playwright E2E tests" "pnpm test:e2e"
else
    echo -e "${YELLOW}⚠️  Playwright not configured, skipping E2E tests${NC}"
fi
echo ""

# Step 7: Load Testing (optional, requires k6)
echo "⚡ Step 7: Load Testing"
echo "-----------------------"
if command -v k6 &> /dev/null; then
    echo -e "${YELLOW}Starting load test (this may take 30+ minutes)...${NC}"
    run_test "k6 load test" "k6 run tests/load-testing/dashboard-load-test.ts"
else
    echo -e "${YELLOW}⚠️  k6 not installed, skipping load tests${NC}"
    echo "   Install k6: brew install k6 (macOS) or see https://k6.io/docs/"
fi
echo ""

# Step 8: Security Scans
echo "🔒 Step 8: Security Scans"
echo "-------------------------"
run_test "npm audit" "pnpm audit --audit-level=high"
if [ -f "package.json" ] && grep -q "snyk" package.json; then
    run_test "Snyk security scan" "pnpm snyk test"
fi
echo ""

# Final Summary
echo "======================================"
echo "📊 TEST SUMMARY"
echo "======================================"
echo ""
echo -e "Total Tests Run:  ${TOTAL_TESTS}"
echo -e "Passed:           ${GREEN}${PASSED_TESTS}${NC}"
echo -e "Failed:           ${RED}${FAILED_TESTS}${NC}"
echo ""

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}✅ ALL TESTS PASSED!${NC}"
    echo ""
    echo "🚀 Ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Review COMPLIANCE_SECURITY_TODO.md"
    echo "2. Schedule HIPAA/IOLTA audits"
    echo "3. Configure production environment"
    echo "4. Deploy to staging"
    echo "5. Run smoke tests"
    echo "6. Deploy to production"
    exit 0
else
    echo -e "${RED}❌ SOME TESTS FAILED${NC}"
    echo ""
    echo "Please fix the failing tests before proceeding."
    exit 1
fi
