#!/bin/bash

# ============================================
# Deployment Verification Script
# ============================================
# Tests all deployed endpoints and services

set -e

echo "🔍 Starting Deployment Verification..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Get base URL from argument or use default
BASE_URL="${1:-http://localhost:3000}"

echo "Testing against: ${BASE_URL}"
echo ""

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

# Function to test endpoint
test_endpoint() {
    local name="$1"
    local url="$2"
    local expected_status="${3:-200}"
    
    echo -n "Testing ${name}... "
    
    HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "${url}")
    
    if [ "$HTTP_STATUS" == "$expected_status" ]; then
        echo -e "${GREEN}✅ PASS${NC} (${HTTP_STATUS})"
        ((TESTS_PASSED++))
    else
        echo -e "${RED}❌ FAIL${NC} (Expected ${expected_status}, got ${HTTP_STATUS})"
        ((TESTS_FAILED++))
    fi
}

echo "============================================="
echo "📋 Running Endpoint Tests"
echo "============================================="
echo ""

# Health check
test_endpoint "Health Check" "${BASE_URL}/api/health" 200

# Creative Agency APIs
test_endpoint "Creative Dashboard API" "${BASE_URL}/api/creative/dashboard/analytics" 200
test_endpoint "Creative Resources API" "${BASE_URL}/api/creative/resources/capacity" 200
test_endpoint "AI Insights API" "${BASE_URL}/api/creative/ai/insights?storeId=1" 200

# OAuth Endpoints (should return 400 without params)
test_endpoint "QuickBooks OAuth" "${BASE_URL}/api/integrations/quickbooks/oauth" 400
test_endpoint "Xero OAuth" "${BASE_URL}/api/integrations/xero/oauth" 400

# Webhooks (should return 401/500 without proper auth)
test_endpoint "QuickBooks Webhook" "${BASE_URL}/api/webhooks/quickbooks" 500
test_endpoint "Xero Webhook" "${BASE_URL}/api/webhooks/xero" 500

# Report Export (should return 400 without body)
test_endpoint "PDF Export" "${BASE_URL}/api/reports/export/pdf" 400

echo ""
echo "============================================="
echo "📊 Test Summary"
echo "============================================="
echo ""
echo -e "Tests Passed: ${GREEN}${TESTS_PASSED}${NC}"
echo -e "Tests Failed: ${RED}${TESTS_FAILED}${NC}"
echo ""

if [ $TESTS_FAILED -gt 0 ]; then
    echo -e "${RED}❌ Some tests failed. Please check the logs above.${NC}"
    exit 1
else
    echo -e "${GREEN}✅ All tests passed! Deployment is healthy.${NC}"
    exit 0
fi
