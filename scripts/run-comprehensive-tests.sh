#!/bin/bash

# Comprehensive Test Suite Runner
# Runs all test suites in sequence with proper reporting

set -e

echo "🚀 Starting Comprehensive Test Suite..."
echo "======================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Test counters
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

# Function to run a test suite
run_test_suite() {
    local suite_name=$1
    local command=$2
    local description=$3
    
    echo -e "\n${BLUE}Running: ${suite_name}${NC}"
    echo "${description}"
    echo "----------------------------------------"
    
    if eval $command; then
        echo -e "${GREEN}✅ ${suite_name} PASSED${NC}"
        ((PASSED_TESTS++))
    else
        echo -e "${RED}❌ ${suite_name} FAILED${NC}"
        ((FAILED_TESTS++))
    fi
    
    ((TOTAL_TESTS++))
    echo ""
}

# Function to start services
start_services() {
    echo -e "${YELLOW}Starting required services...${NC}"
    
    # Start frontend (if not already running)
    if ! lsof -i :3000 >/dev/null 2>&1; then
        echo "Starting frontend..."
        cd /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin
        pnpm dev > /tmp/frontend.log 2>&1 &
        FRONTEND_PID=$!
        sleep 10
    fi
    
    # Start backend API (if not already running)
    if ! lsof -i :3001 >/dev/null 2>&1; then
        echo "Starting backend API..."
        cd /Users/fredrick/Documents/Vayva-Tech/vayva/Backend/core-api
        pnpm dev > /tmp/backend.log 2>&1 &
        BACKEND_PID=$!
        sleep 10
    fi
    
    echo -e "${GREEN}Services started successfully${NC}"
}

# Function to stop services
stop_services() {
    echo -e "${YELLOW}Stopping services...${NC}"
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    echo -e "${GREEN}Services stopped${NC}"
}

# Main execution
main() {
    trap stop_services EXIT
    
    # Start services
    start_services
    
    # Wait for services to be ready
    echo "Waiting for services to be ready..."
    sleep 5
    
    # Run test suites in order
    run_test_suite "Unit Tests" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:unit" \
        "Testing individual components and functions"
    
    run_test_suite "AI Hub Unit Tests" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:unit tests/unit/ai-hub.test.ts" \
        "Testing AI Hub functionality"
    
    run_test_suite "Social Hub Unit Tests" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:unit tests/unit/social-hub.test.ts" \
        "Testing Social Hub functionality"
    
    run_test_suite "Integration Tests" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:integration" \
        "Testing component and API integrations"
    
    run_test_suite "Backend API Integration" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:integration tests/integration/backend-api.test.ts" \
        "Testing backend API endpoints"
    
    run_test_suite "End-to-End Tests" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:e2e" \
        "Testing full user workflows"
    
    run_test_suite "AI/Social Hub E2E Tests" \
        "cd /Users/fredrick/Documents/Vayva-Tech/vayva && pnpm test:e2e tests/e2e/ai-social-hub.test.ts" \
        "Testing AI Hub and Social Hub user interfaces"
    
    # Summary
    echo "======================================"
    echo -e "${BLUE}TEST SUITE SUMMARY${NC}"
    echo "======================================"
    echo -e "Total Tests: ${TOTAL_TESTS}"
    echo -e "${GREEN}Passed: ${PASSED_TESTS}${NC}"
    echo -e "${RED}Failed: ${FAILED_TESTS}${NC}"
    
    if [ $FAILED_TESTS -eq 0 ]; then
        echo -e "\n${GREEN}🎉 All tests passed! System is ready for deployment.${NC}"
        exit 0
    else
        echo -e "\n${RED}⚠️  Some tests failed. Please review and fix issues before deployment.${NC}"
        exit 1
    fi
}

# Run main function
main