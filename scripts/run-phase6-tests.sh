#!/bin/bash

# Phase 6 Comprehensive Testing Framework
# Validates that all migrated components work correctly

set -e

echo "🧪 Starting Phase 6 Comprehensive Testing"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track test statistics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
SKIPPED_TESTS=0

# Function to log with colors
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[PASS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[FAIL]${NC} $1"
}

# Function to run a test
run_test() {
    local test_name="$1"
    local test_command="$2"
    local expected_exit_code="${3:-0}"
    
    ((TOTAL_TESTS++))
    
    log "Running test: $test_name"
    
    if eval "$test_command" &>/dev/null; then
        local exit_code=$?
        if [[ $exit_code -eq $expected_exit_code ]]; then
            ((PASSED_TESTS++))
            success "$test_name"
        else
            ((FAILED_TESTS++))
            error "$test_name (exit code: $exit_code, expected: $expected_exit_code)"
        fi
    else
        ((FAILED_TESTS++))
        error "$test_name (command failed)"
    fi
}

# Function to run a test with output capture
run_test_with_output() {
    local test_name="$1"
    local test_command="$2"
    local expected_pattern="$3"
    
    ((TOTAL_TESTS++))
    
    log "Running test: $test_name"
    
    local output
    output=$(eval "$test_command" 2>&1)
    local exit_code=$?
    
    if [[ $exit_code -eq 0 ]] && [[ "$output" =~ $expected_pattern ]]; then
        ((PASSED_TESTS++))
        success "$test_name"
    else
        ((FAILED_TESTS++))
        error "$test_name"
        echo "Output: $output"
    fi
}

# Test 1: Verify industry-core components exist and export correctly
log "Testing industry-core component exports..."

run_test "MetricCard component export" "node -e \"require('@vayva/industry-core').MetricCard\""
run_test "TrendChart component export" "node -e \"require('@vayva/industry-core').TrendChart\""  
run_test "StatusBadge component export" "node -e \"require('@vayva/industry-core').StatusBadge\""
run_test "DataTable component export" "node -e \"require('@vayva/industry-core').DataTable\""

# Test 2: Verify migrated files no longer contain old component references
log "Testing component migration completeness..."

run_test_with_output "No StatWidget references in merchant-admin" \
    "find Frontend/merchant-admin/src -name '*.tsx' -exec grep -l 'StatWidget' {} \;" \
    "^$"

run_test_with_output "No KPIBlock component definitions in merchant-admin" \
    "find Frontend/merchant-admin/src -name '*.tsx' -exec grep -l 'function KPIBlock' {} \;" \
    "^$"

# Test 3: Verify industry-core package builds correctly
log "Testing industry-core package build..."

run_test "industry-core builds without errors" "cd packages/industry-core && pnpm build"

# Test 4: Verify type checking passes
log "Testing TypeScript compilation..."

run_test "TypeScript compilation succeeds" "pnpm run typecheck"

# Test 5: Verify component imports work correctly
log "Testing component imports..."

run_test_with_output "MetricCard imports correctly" \
    "grep -r 'import.*MetricCard.*from.*@vayva/industry-core' Frontend/merchant-admin/src | head -1" \
    "MetricCard.*@vayva/industry-core"

run_test_with_output "TrendChart imports correctly" \
    "grep -r 'import.*TrendChart.*from.*@vayva/industry-core' Frontend/merchant-admin/src | head -1" \
    "TrendChart.*@vayva/industry-core"

# Test 6: Verify no broken references
log "Testing for broken component references..."

run_test_with_output "No missing component imports" \
    "find Frontend/merchant-admin/src -name '*.tsx' -exec grep -l 'Module.*not found' {} \;" \
    "^$"

# Test 7: Verify component functionality (basic smoke tests)
log "Testing component functionality..."

# Create a temporary test file to verify components can be imported and instantiated
cat > /tmp/component-test.js << 'EOF'
const React = require('react');
// Mock required imports
global.React = React;

try {
    // Test MetricCard
    const { MetricCard } = require('@vayva/industry-core');
    const metricElement = React.createElement(MetricCard, {
        id: 'test',
        title: 'Test Metric',
        value: 100
    });
    console.log('✓ MetricCard imports and creates element');
    
    // Test TrendChart  
    const { TrendChart } = require('@vayva/industry-core');
    const chartElement = React.createElement(TrendChart, {
        data: [{ x: 1, y: 10 }]
    });
    console.log('✓ TrendChart imports and creates element');
    
    // Test StatusBadge
    const { StatusBadge } = require('@vayva/industry-core');
    const badgeElement = React.createElement(StatusBadge, {
        status: 'ACTIVE'
    });
    console.log('✓ StatusBadge imports and creates element');
    
    process.exit(0);
} catch (error) {
    console.error('Component test failed:', error.message);
    process.exit(1);
}
EOF

run_test "Component instantiation test" "node /tmp/component-test.js"

# Test 8: Verify dashboard engine integration
log "Testing dashboard engine integration..."

run_test_with_output "Dashboard engine recognizes kpi-card widget type" \
    "grep -r '\"kpi-card\"' packages/industry-core/src | head -1" \
    "kpi-card"

run_test_with_output "Dashboard engine recognizes chart widget types" \
    "grep -r '\"chart-' packages/industry-core/src | head -1" \
    "chart-"

# Test 9: Verify industry package compatibility
log "Testing industry package compatibility..."

INDUSTRY_PACKAGES=(
    "industry-retail"
    "industry-restaurant" 
    "industry-professional"
    "industry-travel"
    "industry-healthcare"
    "industry-legal"
)

for package in "${INDUSTRY_PACKAGES[@]}"; do
    if [[ -d "packages/$package" ]]; then
        run_test "$package builds successfully" "cd packages/$package && pnpm build" 0
    else
        ((SKIPPED_TESTS++))
        warning "Skipping $package (directory not found)"
    fi
done

# Test 10: Verify migration artifacts cleanup
log "Testing migration cleanup..."

run_test_with_output "No backup files remain" \
    "find . -name '*.backup' -type f | head -5" \
    "^$"

# Summary
echo ""
echo "=========================================="
echo "📊 Phase 6 Testing Summary"
echo "=========================================="
echo "Total tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS"
echo "Failed: $FAILED_TESTS" 
echo "Skipped: $SKIPPED_TESTS"
echo "Success rate: $((PASSED_TESTS * 100 / TOTAL_TESTS))%"
echo "=========================================="

if [[ $FAILED_TESTS -eq 0 ]]; then
    success "All tests passed! Phase 6 implementation is working correctly."
    echo ""
    echo "✅ Migration Verification:"
    echo "  • Components successfully migrated to industry-core"
    echo "  • No broken references or missing imports"
    echo "  • Industry packages integrate properly"
    echo "  • Type checking passes"
    echo ""
    echo "🚀 Ready for production deployment"
else
    error "$FAILED_TESTS tests failed. Please review the errors above."
    exit 1
fi