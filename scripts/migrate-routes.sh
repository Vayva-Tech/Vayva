#!/bin/bash

# Merchant BFF Extraction - Automated Migration Script
# This script migrates all remaining frontend routes from Prisma to backend API calls

set -e

echo "🚀 Starting automated migration of remaining 53 routes..."

# Define migration mappings
declare -A MIGRATIONS=(
    # Beauty routes
    ["beauty/stylists/route.ts"]="beauty/stylists"
    ["beauty/stylists/availability/route.ts"]="beauty/stylists/availability"
    ["beauty/gallery/route.ts"]="beauty/gallery"
    ["beauty/gallery/[id]/route.ts"]="beauty/gallery"
    ["beauty/packages/route.ts"]="beauty/packages"
    ["beauty/services/performance/route.ts"]="beauty/services/performance"
    ["beauty/inventory/[id]/route.ts"]="beauty/inventory"
    
    # Health & Beta
    ["beta/desktop-app-waitlist/route.ts"]="beta/desktop-app-waitlist"
    
    # Marketplace & Education
    ["marketplace/vendors/route.ts"]="marketplace/vendors"
    ["education/enrollments/route.ts"]="education/enrollments"
    
    # Dashboard & B2B
    ["calendar-sync/[id]/route.ts"]="calendar-sync"
    ["dashboard/sidebar-counts/route.ts"]="dashboard/sidebar-counts"
    ["b2b/credit/applications/route.ts"]="b2b/credit/applications"
    ["b2b/rfq/route.ts"]="b2b/rfq"
    
    # Support
    ["support/chat/route.ts"]="support/chat"
    ["support/conversations/route.ts"]="support/conversations"
    ["support/conversations/[id]/route.ts"]="support/conversations"
    ["support/create/route.ts"]="support/create"
    
    # Affiliates
    ["affiliates/route.ts"]="affiliates"
    ["affiliates/[id]/details/route.ts"]="affiliates"
    ["affiliates/[id]/route.ts"]="affiliates"
    
    # Marketing
    ["marketing/flash-sales/route.ts"]="marketing/flash-sales"
    ["marketing/flash-sales/[id]/route.ts"]="marketing/flash-sales"
    
    # Finance
    ["finance/activity/route.ts"]="finance/activity"
    ["finance/transactions/route.ts"]="finance/transactions"
    ["finance/statements/route.ts"]="finance/statements"
    ["finance/statements/generate/route.ts"]="finance/statements/generate"
    ["finance/overview/route.ts"]="finance/overview"
    ["finance/banks/route.ts"]="finance/banks"
    ["finance/payouts/route.ts"]="finance/payouts"
    ["finance/stats/route.ts"]="finance/stats"
    
    # Affiliate Dashboard
    ["affiliate/dashboard/route.ts"]="affiliate/dashboard"
    ["affiliate/payout/approvals/route.ts"]="affiliate/payout"
    
    # Nightlife
    ["nightlife/tickets/route.ts"]="nightlife/tickets"
    ["nightlife/reservations/route.ts"]="nightlife/reservations"
    ["nightlife/events/route.ts"]="nightlife/events"
    ["nightlife/events/[id]/route.ts"]="nightlife/events"
    
    # Social & Editor
    ["socials/instagram/callback/route.ts"]="socials/instagram"
    ["editor-data/extensions/route.ts"]="editor-data/extensions"
    
    # Telemetry & Kitchen
    ["telemetry/event/route.ts"]="telemetry/event"
    ["kitchen/orders/[id]/status/route.ts"]="kitchen/orders"
    
    # Webhooks & Onboarding
    ["webhooks/delivery/kwik/route.ts"]="webhooks/delivery"
    ["onboarding/state/route.ts"]="onboarding/state"
    
    # Analytics & Merchant
    ["analytics/events/route.ts"]="analytics/events"
    ["merchant/quick-replies/route.ts"]="merchant/quick-replies"
    ["merchant/policies/publish-defaults/route.ts"]="merchant/policies"
    ["merchant/audit/route.ts"]="merchant/audit"
    ["merchant/readiness/route.ts"]="merchant/readiness"
    ["merchant/billing/status/route.ts"]="merchant/billing"
    ["merchant/store/status/route.ts"]="merchant/store-status"
    
    # Store Policies
    ["store/policies/route.ts"]="store/policies"
)

MERCHANT_DIR="Frontend/merchant/src/app/api"
BACKEND_URL='${process.env.BACKEND_API_URL}'
MIGRATED=0
SKIPPED=0
FAILED=0

# Function to migrate a single route file
migrate_route() {
    local file_path="$1"
    local endpoint="$2"
    local relative_path="${file_path#$MERCHANT_DIR/}"
    
    echo ""
    echo "📝 Migrating: $relative_path"
    
    # Skip files that should remain as-is
    if [[ "$relative_path" == *"health/comprehensive"* ]] || \
       [[ "$relative_path" == *"webhooks/"* ]] || \
       [[ "$relative_path" == *"callback"* ]]; then
        echo "⏭️  Skipping (infrastructure/webhook): $relative_path"
        ((SKIPPED++))
        return 0
    fi
    
    # Check if file exists
    if [ ! -f "$file_path" ]; then
        echo "❌ File not found: $file_path"
        ((FAILED++))
        return 1
    fi
    
    # Read current file content
    local content=$(cat "$file_path")
    
    # Check if already migrated
    if [[ "$content" == *"apiJson"* ]]; then
        echo "✓ Already migrated: $relative_path"
        ((SKIPPED++))
        return 0
    fi
    
    # Create backup
    cp "$file_path" "${file_path}.bak"
    
    # Extract the route pattern from endpoint
    local api_path="/api/v1/${endpoint}"
    
    # Generate new migrated content
    cat > "$file_path" << 'TEMPLATE'
import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Forward relevant query parameters
    for (const [key, value] of searchParams.entries()) {
      if (value) {
        queryParams.set(key, value);
      }
    }

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}` + apiPath + (queryParams.toString() ? `?${queryParams}` : ""),
      { headers: auth.headers }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, { endpoint: "`$relative_path`", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
TEMPLATE
    
    # Add POST export if original had it
    if [[ "$content" == *"export async function POST"* ]]; then
        cat >> "$file_path" << 'POST_TEMPLATE'

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    
    const response = await apiJson(
      `${process.env.BACKEND_API_URL}` + apiPath,
      {
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify(body),
      }
    );

    return NextResponse.json(response);
  } catch (error) {
    handleApiError(error, { endpoint: "`$relative_path`", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
POST_TEMPLATE
    fi
    
    echo "✅ Migrated: $relative_path"
    ((MIGRATED++))
    return 0
}

# Main migration loop
echo ""
echo "📊 Migration Progress:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

for file_path in $(find "$MERCHANT_DIR" -name "route.ts" -exec grep -l "@vayva/db" {} \;); do
    relative_path="${file_path#$MERCHANT_DIR/}"
    
    # Find matching endpoint
    endpoint=""
    for key in "${!MIGRATIONS[@]}"; do
        if [[ "$relative_path" == *"$key"* ]]; then
            endpoint="${MIGRATIONS[$key]}"
            break
        fi
    done
    
    # If no specific mapping found, use generic pattern
    if [ -z "$endpoint" ]; then
        # Extract endpoint from path
        endpoint=$(echo "$relative_path" | sed 's|/\[.*\]||g' | sed 's|/route.ts||g')
    fi
    
    migrate_route "$file_path" "$endpoint"
done

# Summary
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎉 Migration Summary:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "✅ Successfully migrated: $MIGRATED routes"
echo "⏭️  Skipped: $SKIPPED routes"
echo "❌ Failed: $FAILED routes"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Count remaining
REMAINING=$(find "$MERCHANT_DIR" -name "route.ts" -exec grep -l "@vayva/db" {} \; | wc -l)
echo ""
echo "📈 Remaining routes with @vayva/db: $REMAINING"
echo ""

if [ $REMAINING -eq 0 ]; then
    echo "🎊 SUCCESS! All routes migrated!"
else
    echo "🔍 Manual review needed for $REMAINING routes"
fi

echo ""
echo "📝 Backup files created with .bak extension"
echo "💡 To restore backups: find $MERCHANT_DIR -name '*.bak' -exec sh -c 'mv \"\$1\" \"\${1%.bak}\"' _ {} \;"
echo ""
