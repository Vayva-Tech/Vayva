#!/usr/bin/env python3
"""
Legacy Backend Migration Analysis
Maps legacy API directories to Fastify services and identifies gaps
"""

import os
from pathlib import Path

# Directories
FASTIFY_SERVICES = "Backend/fastify-server/src/services"
LEGACY_API = "Backend/core-api/src/app/api"

# Service file mapping (legacy dir -> fastify service)
SERVICE_MAPPING = {
    # Core
    "account": "core/account.service.ts",
    "auth": "../auth.ts",
    "bookings": "core/booking.service.ts",
    "customers": "core/customers.service.ts",
    "fulfillment": "core/fulfillment.service.ts",
    "invoices": "core/invoice.service.ts",
    "ledger": "core/ledger.service.ts",
    "orders": "core/orders.service.ts",
    "products": "core/products.service.ts",
    "refunds": "core/refund.service.ts",
    "returns": "core/return.service.ts",
    "settings": "core/settings.service.ts",
    "settlements": "core/settlement.service.ts",
    "subscriptions": "core/subscriptions.service.ts",
    "workflows": "core/workflow.service.ts",
    
    # Commerce
    "carts": "commerce/cart.service.ts",
    "checkout": "commerce/checkout.service.ts",
    "collections": "commerce/collections.service.ts",
    "coupons": "commerce/coupons.service.ts",
    "discount-rules": "commerce/discount-rules.service.ts",
    "reviews": "commerce/reviews.service.ts",
    "services": "commerce/services.service.ts",
    
    # Financial
    "payments": "financial/payments.service.ts",
    "payment-methods": "financial/payment-methods.service.ts",
    "wallet": "financial/wallet.service.ts",
    "billing": "financial/billing.service.ts",
    
    # Inventory
    "inventory": "inventory/inventory.service.ts",
    
    # Industry
    "beauty": "industry/beauty.service.ts",
    "events": "industry/events.service.ts",
    "grocery": "industry/grocery.service.ts",
    "healthcare": "industry/healthcare.service.ts",
    "nightlife": "industry/nightlife.service.ts",
    "restaurant": "industry/restaurant.service.ts",
    "retail": "industry/retail.service.ts",
    "wholesale": "industry/wholesale.service.ts",
    "portfolio": "industry/portfolio.service.ts",
    "properties": "industry/properties.service.ts",
    "vehicles": "industry/vehicles.service.ts",
    "quotes": "industry/quotes.service.ts",
    
    # Education
    "education": "education/courses.service.ts",
    
    # Fashion
    "fashion": "fashion/style-quiz.service.ts",
    
    # Meal Kit
    "meal-kit": "meal-kit/recipes.service.ts",
    
    # POS
    "pos": "pos/pos.service.ts",
    
    # Rentals
    "rentals": "rentals/rentals.service.ts",
    
    # Platform
    "analytics": "platform/analytics.service.ts",
    "blog": "platform/blog.service.ts",
    "campaigns": "platform/campaigns.service.ts",
    "compliance": "platform/compliance.service.ts",
    "creative": "platform/creative.service.ts",
    "credits": "platform/credits.service.ts",
    "dashboard": "platform/dashboard.service.ts",
    "domains": "platform/domains.service.ts",
    "integrations": "platform/integrations.service.ts",
    "marketing": "platform/marketing.service.ts",
    "nonprofit": "platform/nonprofit.service.ts",
    "notifications": "platform/notifications.service.ts",
    "referrals": "platform/referrals.service.ts",
    "rescue": "platform/rescue.service.ts",
    "sites": "platform/sites.service.ts",
    "socials": "platform/socials.service.ts",
    "storage": "platform/storage.service.ts",
    "support": "platform/support.service.ts",
    "templates": "platform/templates.service.ts",
    "webhooks": "platform/webhooks.service.ts",
    "websocket": "platform/websocket.service.ts",
    "webstudio": "platform/webstudio.service.ts",
    
    # Admin
    "merchant": "admin/merchants.service.ts",
    "system": "admin/admin-system.service.ts",
    
    # AI
    "ai": "ai/ai.service.ts",
    "ai-agent": "ai/aiAgent.service.ts",
    "automation": "ai/automation.service.ts",
    
    # Security
    "security": "security/risk.service.ts",
    
    # Marketing
    "leads": "marketing/leads.service.ts",
}

def check_service_exists(service_path):
    """Check if a service file exists"""
    full_path = os.path.join(FASTIFY_SERVICES, service_path)
    return os.path.isfile(full_path)

def get_legacy_directories():
    """Get list of legacy API directories"""
    if not os.path.isdir(LEGACY_API):
        print(f"Error: Legacy API directory not found: {LEGACY_API}")
        return []
    
    dirs = [d for d in os.listdir(LEGACY_API) 
            if os.path.isdir(os.path.join(LEGACY_API, d))]
    return sorted(dirs)

def main():
    print("=" * 70)
    print("LEGACY BACKEND MIGRATION ANALYSIS")
    print("=" * 70)
    print()
    
    legacy_dirs = get_legacy_directories()
    print(f"Analyzing {len(legacy_dirs)} legacy directories...")
    print()
    
    migrated = []
    missing_service = []
    needs_audit = []
    
    for directory in legacy_dirs:
        if directory in SERVICE_MAPPING:
            service_file = SERVICE_MAPPING[directory]
            if check_service_exists(service_file):
                status = "✅ MIGRATED"
                migrated.append((directory, service_file))
            else:
                status = f"⚠️  SERVICE MISSING ({service_file})"
                missing_service.append((directory, service_file))
        else:
            status = "❌ NEEDS AUDIT"
            needs_audit.append(directory)
        
        print(f"{directory:30s} → {status}")
    
    print()
    print("=" * 70)
    print("SUMMARY")
    print("=" * 70)
    print(f"Total legacy directories: {len(legacy_dirs)}")
    print(f"✅ Successfully migrated: {len(migrated)}")
    print(f"⚠️  Service file missing: {len(missing_service)}")
    print(f"❌ Needs manual audit: {len(needs_audit)}")
    print()
    
    if migrated:
        print("MIGRATED (can delete legacy):")
        print("-" * 70)
        for dir_name, service_file in sorted(migrated):
            print(f"  ✅ {dir_name:25s} → {service_file}")
        print()
    
    if missing_service:
        print("MISSING SERVICE FILES (need to create/extend):")
        print("-" * 70)
        for dir_name, service_file in sorted(missing_service):
            print(f"  ⚠️  {dir_name:25s} → {service_file}")
        print()
    
    if needs_audit:
        print("NEEDS MANUAL AUDIT (no mapping defined):")
        print("-" * 70)
        for dir_name in sorted(needs_audit):
            print(f"  ❌ {dir_name}")
        print()
    
    # Generate deletion script for migrated directories
    if migrated:
        print("=" * 70)
        print("CLEANUP COMMAND (review before executing!)")
        print("=" * 70)
        print("# Delete these migrated legacy directories:")
        for dir_name, _ in sorted(migrated):
            print(f"rm -rf {LEGACY_API}/{dir_name}")

if __name__ == "__main__":
    main()
