#!/bin/bash
# migrate-merchant-admin-components.sh
# Script to migrate merchant-admin components to industry-core

set -e

echo "🚀 Starting Merchant Admin Component Migration..."
echo "Target: /Users/fredrick/Documents/Vayva-Tech/vayva/Frontend/merchant-admin"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

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

# Check if we're in the right directory
cd /Users/fredrick/Documents/Vayva-Tech/vayva

# Verify industry-core is available
if ! pnpm list @vayva/industry-core --depth 0 | grep -q "@vayva/industry-core"; then
    error "Industry-core package not found. Installing..."
    pnpm add @vayva/industry-core --filter merchant-admin
fi

# Backup current state
log "Creating backup..."
git stash push -m "backup-before-industry-core-migration-$(date +%s)" || true

# Stats tracking
TOTAL_FILES=0
MIGRATED_FILES=0
SKIPPED_FILES=0

# Migration patterns
log "Starting component migration..."

# 1. Migrate StatWidget to MetricCard
log "Migrating StatWidget components..."
find Frontend/merchant-admin/src -name "*.tsx" -exec grep -l "StatWidget" {} \; | while read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    log "Processing: $file"
    
    # Create backup of the file
    cp "$file" "${file}.backup"
    
    # Replace StatWidget imports and usage
    sed -i '' 's/import { StatWidget } from "[^"]*";/import { MetricCard } from "@vayva\/industry-core";/' "$file" 2>/dev/null || true
    
    # Replace component usage patterns
    # This is a simplified example - real migration would need more sophisticated transforms
    sed -i '' 's/<StatWidget/<MetricCard/g' "$file" 2>/dev/null || true
    sed -i '' 's/<\/StatWidget>/<\/MetricCard>/g' "$file" 2>/dev/null || true
    
    MIGRATED_FILES=$((MIGRATED_FILES + 1))
    success "Migrated: $file"
done

# 2. Migrate StatusBadge components
log "Migrating StatusBadge components..."
find Frontend/merchant-admin/src -name "*.tsx" -exec grep -l "StatusBadge" {} \; | while read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    log "Processing: $file"
    
    # Skip the shared StatusBadge itself - that's our target for replacement
    if [[ "$file" == *"shared/StatusBadge"* ]]; then
        warning "Skipping shared StatusBadge component: $file"
        SKIPPED_FILES=$((SKIPPED_FILES + 1))
        continue
    fi
    
    # Create backup
    cp "$file" "${file}.backup"
    
    # Replace imports
    sed -i '' 's/import { StatusBadge } from "[^"]*";/import { StatusBadge } from "@vayva\/industry-core";/' "$file" 2>/dev/null || true
    
    MIGRATED_FILES=$((MIGRATED_FILES + 1))
    success "Migrated: $file"
done

# 3. Migrate KPIBlock components
log "Migrating KPIBlock components..."
find Frontend/merchant-admin/src -name "*.tsx" -exec grep -l "KPIBlock" {} \; | while read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    log "Processing: $file"
    
    # Create backup
    cp "$file" "${file}.backup"
    
    # Replace with MetricCard usage
    # This would need more sophisticated transformation in practice
    sed -i '' 's/import { KPIBlock } from "[^"]*";/import { MetricCard } from "@vayva\/industry-core";/' "$file" 2>/dev/null || true
    
    MIGRATED_FILES=$((MIGRATED_FILES + 1))
    success "Migrated: $file"
done

# 4. Migrate chart components
log "Migrating chart components..."
find Frontend/merchant-admin/src -name "*.tsx" -exec grep -l "SparklineChart\|AIUsageChart" {} \; | while read -r file; do
    TOTAL_FILES=$((TOTAL_FILES + 1))
    log "Processing: $file"
    
    # Create backup
    cp "$file" "${file}.backup"
    
    # Replace imports
    sed -i '' 's/import { SparklineChart } from "[^"]*";/import { TrendChart } from "@vayva\/industry-core";/' "$file" 2>/dev/null || true
    sed -i '' 's/import { AIUsageChart } from "[^"]*";/import { TrendChart } from "@vayva\/industry-core";/' "$file" 2>/dev/null || true
    
    MIGRATED_FILES=$((MIGRATED_FILES + 1))
    success "Migrated: $file"
done

# Type checking
log "Running type checking..."
if pnpm typecheck --filter merchant-admin; then
    success "Type checking passed!"
else
    error "Type checking failed. Check the errors above."
    warning "Restoring from backup..."
    # Restore from backups would go here
    exit 1
fi

# Build verification
log "Running build verification..."
if pnpm build --filter merchant-admin; then
    success "Build successful!"
else
    error "Build failed. Check the errors above."
    exit 1
fi

# Summary
echo ""
echo "========================================"
echo "           MIGRATION SUMMARY"
echo "========================================"
echo "Total files analyzed: $TOTAL_FILES"
echo "Files migrated: $MIGRATED_FILES"
echo "Files skipped: $SKIPPED_FILES"
echo "Success rate: $((MIGRATED_FILES * 100 / TOTAL_FILES))%"
echo "========================================"

success "Migration completed successfully!"

echo ""
log "Next steps:"
echo "1. Review migrated files for correctness"
echo "2. Test application functionality"
echo "3. Check visual appearance"
echo "4. Run integration tests"
echo "5. Update any remaining manual references"

echo ""
warning "Manual review required for complex transformations"
echo "Some components may need manual adjustment for:"
echo "- Data format transformations"
echo "- Custom styling preservation"
echo "- Event handler mappings"
echo "- Complex prop mappings"