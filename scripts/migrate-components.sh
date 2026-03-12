#!/bin/bash

# Component Migration Script - Phase 6
# Migrates frontend applications to use @vayva/industry-core components

set -e

echo "🚀 Starting Component Migration - Phase 6"
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Track migration statistics
TOTAL_FILES=0
MIGRATED_FILES=0
SKIPPED_FILES=0
ERROR_FILES=0

# Function to log with colors
log() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to migrate a single file
migrate_file() {
    local file_path="$1"
    local app_name="$2"
    
    ((TOTAL_FILES++))
    
    log "Processing: $file_path"
    
    # Check if file exists
    if [[ ! -f "$file_path" ]]; then
        warning "File not found: $file_path"
        ((SKIPPED_FILES++))
        return
    fi
    
    # Backup original file
    cp "$file_path" "${file_path}.backup"
    
    # Perform migrations
    local changes_made=false
    
    # Migrate StatWidget imports and usage
    if grep -q "StatWidget\|stat-widget" "$file_path"; then
        sed -i '' 's/from ".\/components\/ui\/stat-widget"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/from "..\/..\/components\/ui\/stat-widget"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/import { StatWidget }/import { MetricCard as StatWidget }/g' "$file_path"
        sed -i '' 's/<StatWidget/<MetricCard/g' "$file_path"
        sed -i '' 's/<\/StatWidget>/<\/MetricCard>/g' "$file_path"
        changes_made=true
    fi
    
    # Migrate StatusBadge imports and usage
    if grep -q "StatusBadge\|status-badge" "$file_path"; then
        sed -i '' 's/from ".\/components\/ui\/status-badge"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/from "..\/..\/components\/ui\/status-badge"/from "@vayva\/industry-core"/g' "$file_path"
        changes_made=true
    fi
    
    # Migrate KPIBlock imports and usage
    if grep -q "KPIBlock\|kpi-block" "$file_path"; then
        sed -i '' 's/from ".\/components\/ui\/kpi-block"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/from "..\/..\/components\/ui\/kpi-block"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/import { KPIBlock }/import { MetricCard as KPIBlock }/g' "$file_path"
        sed -i '' 's/<KPIBlock/<MetricCard/g' "$file_path"
        sed -i '' 's/<\/KPIBlock>/<\/MetricCard>/g' "$file_path"
        changes_made=true
    fi
    
    # Migrate ChartComponent imports and usage
    if grep -q "ChartComponent\|chart-component" "$file_path"; then
        sed -i '' 's/from ".\/components\/ui\/chart-component"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/from "..\/..\/components\/ui\/chart-component"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/import { ChartComponent }/import { TrendChart as ChartComponent }/g' "$file_path"
        sed -i '' 's/<ChartComponent/<TrendChart/g' "$file_path"
        sed -i '' 's/<\/ChartComponent>/<\/TrendChart>/g' "$file_path"
        changes_made=true
    fi
    
    # Migrate DataTable imports and usage
    if grep -q "DataTable\|data-table" "$file_path"; then
        sed -i '' 's/from ".\/components\/ui\/data-table"/from "@vayva\/industry-core"/g' "$file_path"
        sed -i '' 's/from "..\/..\/components\/ui\/data-table"/from "@vayva\/industry-core"/g' "$file_path"
        changes_made=true
    fi
    
    if [[ "$changes_made" == true ]]; then
        ((MIGRATED_FILES++))
        success "Migrated: $file_path"
    else
        # Restore backup if no changes were made
        mv "${file_path}.backup" "$file_path"
        ((SKIPPED_FILES++))
        log "No changes needed: $file_path"
    fi
}

# Main migration process
log "Starting migration of merchant-admin application..."

# Process merchant-admin files (continue from where we left off)
MERCHANT_ADMIN_FILES=(
    "Frontend/merchant-admin/src/components/dashboard-v2/StatWidget.tsx"
    "Frontend/merchant-admin/src/components/dashboard-v2/KPIBlocks.tsx"
    "Frontend/merchant-admin/src/components/dashboard-v2/DashboardLegacyContent.tsx"
    "Frontend/merchant-admin/src/components/trend-chart.tsx"
    "Frontend/merchant-admin/src/app/(dashboard)/dashboard/analytics/page.tsx"
    "Frontend/merchant-admin/src/components/analytics/ActivePerformanceCard.tsx"
    "Frontend/merchant-admin/src/components/analytics/CashFlowForecastChart.tsx"
    "Frontend/merchant-admin/src/components/analytics/SalesForecastChart.tsx"
    "Frontend/merchant-admin/src/components/orders/OrderCard.tsx"
    "Frontend/merchant-admin/src/components/orders/BulkOrderActions.tsx"
    "Frontend/merchant-admin/src/components/products/ProductList.tsx"
    "Frontend/merchant-admin/src/components/customers/CustomerSegmentationDashboard.tsx"
    "Frontend/merchant-admin/src/components/marketing/FunnelAnalysis.tsx"
    "Frontend/merchant-admin/src/components/finance/ForecastingDashboard.tsx"
)

for file in "${MERCHANT_ADMIN_FILES[@]}"; do
    migrate_file "$file" "merchant-admin"
done

log "Starting migration of ops-console application..."

# Process ops-console files
OPS_CONSOLE_FILES=(
    "Frontend/ops-console/src/app/ops/(app)/analytics/page.tsx"
    "Frontend/ops-console/src/app/ops/(app)/merchants/page.tsx"
    "Frontend/ops-console/src/app/ops/(app)/marketplace/page.tsx"
    "Frontend/ops-console/src/components/dashboard/MetricsOverview.tsx"
    "Frontend/ops-console/src/components/dashboard/SystemHealth.tsx"
    "Frontend/ops-console/src/components/dashboard/PerformanceMetrics.tsx"
    "Frontend/ops-console/src/components/monitoring/AlertList.tsx"
    "Frontend/ops-console/src/components/monitoring/SystemStatus.tsx"
    "Frontend/ops-console/src/components/reports/OperationalReport.tsx"
    "Frontend/ops-console/src/components/settings/TeamManagement.tsx"
)

for file in "${OPS_CONSOLE_FILES[@]}"; do
    migrate_file "$file" "ops-console"
done

# Summary
echo ""
echo "=========================================="
echo "📊 Migration Summary"
echo "=========================================="
echo "Total files processed: $TOTAL_FILES"
echo "Files migrated: $MIGRATED_FILES"
echo "Files skipped: $SKIPPED_FILES"
echo "Files with errors: $ERROR_FILES"
echo "=========================================="

if [[ $ERROR_FILES -eq 0 ]]; then
    success "Migration completed successfully!"
    echo "Next steps:"
    echo "1. Run type checking: pnpm run typecheck"
    echo "2. Test applications: pnpm run dev"
    echo "3. Verify functionality in browser"
else
    error "Migration completed with errors. Check the logs above."
fi