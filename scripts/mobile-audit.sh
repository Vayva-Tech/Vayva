#!/bin/bash

# Mobile Responsiveness Audit Script
# Runs Lighthouse audits on key dashboards and generates report

set -e

echo "🔍 Starting Mobile Responsiveness Audit..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# URLs to audit
URLS=(
  "http://localhost:3000/dashboard/nonprofit"
  "http://localhost:3000/dashboard/nightlife"
  "http://localhost:3000/dashboard/fashion"
  "http://localhost:3000/dashboard/courses"
  "http://localhost:3000/dashboard/bookings"
)

# Check if dev server is running
echo "Checking if dev server is running..."
if ! curl -s http://localhost:3000 > /dev/null 2>&1; then
  echo -e "${RED}❌ Dev server not running on port 3000${NC}"
  echo "Please start the dev server first:"
  echo "  cd Frontend/merchant && pnpm dev"
  exit 1
fi

echo -e "${GREEN}✅ Dev server detected${NC}"
echo ""

# Create results directory
mkdir -p .lighthouseci/results

# Run audits
echo "Running Lighthouse audits on ${#URLS[@]} dashboards..."
echo ""

for url in "${URLS[@]}"; do
  echo "Auditing: $url"
  
  # Extract dashboard name from URL
  dashboard=$(echo $url | sed 's|.*/dashboard/||')
  
  # Run Lighthouse
  pnpm exec lhci autorun \
    --collect.url="$url" \
    --collect.numberOfRuns=1 \
    --assert.assertions."categories.performance".minScore=0.8 \
    --assert.assertions."categories.accessibility".minScore=0.9 \
    --output-path=".lighthouseci/results/lighthouse-report-$dashboard.html" \
    2>&1 | grep -E "(performance|accessibility|passed|failed)" || true
  
  echo -e "${GREEN}✓ Completed: $dashboard${NC}"
  echo ""
done

echo "=================================="
echo "Audit Complete!"
echo "=================================="
echo ""
echo "Results saved to: .lighthouseci/results/"
echo ""
echo "To view reports:"
echo "  open .lighthouseci/results/lighthouse-report-*.html"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo "1. Review any failed assertions"
echo "2. Fix mobile responsiveness issues"
echo "3. Re-run audit to verify fixes"
