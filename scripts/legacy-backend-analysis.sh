#!/bin/bash
# Legacy Backend Cleanup Analysis Script
# Maps legacy API directories to Fastify services

echo "======================================"
echo "LEGACY BACKEND MIGRATION ANALYSIS"
echo "======================================"
echo ""

# Fastify services directory
FASTIFY_SERVICES="Backend/fastify-server/src/services"

# Legacy directories
LEGACY_API="Backend/core-api/src/app/api"

# Get list of legacy directories
LEGACY_DIRS=$(ls $LEGACY_API | sort)

echo "Analyzing $(echo "$LEGACY_DIRS" | wc -w | tr -d ' ') legacy directories..."
echo ""

# Mapping of legacy directories to Fastify service files
declare -A SERVICE_MAPPING=(
    # Core services
    ["account"]="core/account.service.ts"
    ["auth"]="auth.ts"
    ["bookings"]="core/bookings.service.ts"
    ["carts"]="commerce/cart.service.ts"
    ["checkout"]="commerce/checkout.service.ts"
    ["collections"]="commerce/collections.service.ts"
    ["coupons"]="commerce/coupons.service.ts"
    ["customers"]="core/customers.service.ts"
    ["discount-rules"]="commerce/discount-rules.service.ts"
    ["fulfillment"]="core/fulfillment.service.ts"
    ["inventory"]="inventory/inventory.service.ts"
    ["invoices"]="core/invoices.service.ts"
    ["ledger"]="core/ledger.service.ts"
    ["orders"]="commerce/orders.service.ts"
    ["payment-methods"]="financial/payment-methods.service.ts"
    ["payments"]="financial/payments.service.ts"
    ["products"]="commerce/products.service.ts"
    ["refunds"]="core/refunds.service.ts"
    ["returns"]="core/returns.service.ts"
    ["reviews"]="commerce/reviews.service.ts"
    ["settlements"]="core/settlements.service.ts"
    ["subscriptions"]="subscriptions/subscription.service.ts"
    ["wallet"]="financial/wallet.service.ts"
    ["workflows"]="core/workflows.service.ts"
    
    # Industry-specific
    ["beauty"]="industry/beauty.service.ts"
    ["education"]="education/courses.service.ts"
    ["events"]="industry/events.service.ts"
    ["fashion"]="fashion/style-quiz.service.ts"
    ["grocery"]="industry/grocery.service.ts"
    ["healthcare"]="industry/healthcare.service.ts"
    ["nightlife"]="industry/nightlife.service.ts"
    ["pos"]="pos/pos.service.ts"
    ["professional-services"]="professional-services/professional-services.service.ts"
    ["rentals"]="rentals/rentals.service.ts"
    ["restaurant"]="industry/restaurant.service.ts"
    ["retail"]="industry/retail.service.ts"
    ["travel"]="travel/travel.service.ts"
    ["wellness"]="wellness/wellness.service.ts"
    ["wholesale"]="industry/wholesale.service.ts"
    
    # Platform services
    ["analytics"]="platform/analytics.service.ts"
    ["blog"]="platform/blog.service.ts"
    ["campaigns"]="platform/campaigns.service.ts"
    ["compliance"]="platform/compliance.service.ts"
    ["creative"]="platform/creative.service.ts"
    ["credits"]="platform/credits.service.ts"
    ["dashboard"]="platform/dashboard.service.ts"
    ["domains"]="platform/domains.service.ts"
    ["integrations"]="platform/integrations.service.ts"
    ["marketing"]="platform/marketing.service.ts"
    ["nonprofit"]="platform/nonprofit.service.ts"
    ["notifications"]="platform/notifications.service.ts"
    ["referrals"]="platform/referrals.service.ts"
    ["rescue"]="platform/rescue.service.ts"
    ["sites"]="platform/sites.service.ts"
    ["socials"]="platform/socials.service.ts"
    ["storage"]="platform/storage.service.ts"
    ["support"]="platform/support.service.ts"
    ["templates"]="platform/templates.service.ts"
    ["webhooks"]="platform/webhooks.service.ts"
    ["websocket"]="platform/websocket.service.ts"
    ["webstudio"]="platform/webstudio.service.ts"
    
    # Admin services
    ["merchant"]="admin/merchants.service.ts"
    ["system"]="admin/admin-system.service.ts"
    
    # AI services
    ["ai"]="ai/ai.service.ts"
    ["ai-agent"]="ai/aiAgent.service.ts"
    ["automation"]="ai/automation.service.ts"
    ["wa-agent"]="ai/wa-agent.service.ts"
    
    # Financial
    ["billing"]="financial/billing.service.ts"
    ["finance"]="financial/finance.service.ts"
    
    # Security
    ["security"]="security/risk.service.ts"
    
    # Subscriptions
    ["subscriptions"]="subscriptions/subscriptions.service.ts"
    
    # Industry verticals
    ["donations"]="platform/nonprofit.service.ts"
    ["portfolio"]="industry/portfolio.service.ts"
    ["properties"]="industry/properties.service.ts"
    ["vehicles"]="industry/vehicles.service.ts"
    ["quotes"]="industry/quotes.service.ts"
    
    # Other
    ["leads"]="marketing/leads.service.ts"
    ["services"]="commerce/services.service.ts"
    ["settings"]="core/settings.service.ts"
    ["store"]="core/store.service.ts"
)

MIGRATED=0
NEEDS_AUDIT=0
NOT_MIGRATED=0

echo "MAPPING STATUS:"
echo "==============="
echo ""

for dir in $LEGACY_DIRS; do
    if [[ -n "${SERVICE_MAPPING[$dir]}" ]]; then
        service_file="${SERVICE_MAPPING[$dir]}"
        if [[ -f "$FASTIFY_SERVICES/$service_file" ]]; then
            echo "✅ $dir → $service_file [MIGRATED]"
            ((MIGRATED++))
        else
            echo "⚠️  $dir → $service_file [SERVICE FILE MISSING]"
            ((NEEDS_AUDIT++))
        fi
    else
        echo "❌ $dir → [NO MAPPING FOUND - NEEDS AUDIT]"
        ((NOT_MIGRATED++))
    fi
done

echo ""
echo "======================================"
echo "SUMMARY"
echo "======================================"
echo "Total legacy directories: $(echo "$LEGACY_DIRS" | wc -w | tr -d ' ')"
echo "Successfully migrated: $MIGRATED"
echo "Service file missing: $NEEDS_AUDIT"
echo "Needs audit (no mapping): $NOT_MIGRATED"
echo ""

if [[ $NOT_MIGRATED -gt 0 ]]; then
    echo "Directories needing manual audit:"
    echo "--------------------------------"
    for dir in $LEGACY_DIRS; do
        if [[ -z "${SERVICE_MAPPING[$dir]}" ]]; then
            echo "  - $dir"
        fi
    done
fi
