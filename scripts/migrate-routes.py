#!/usr/bin/env python3
"""
Merchant BFF Extraction - Intelligent Route Migration Script
Migrates frontend routes from Prisma to backend API calls
"""

import os
import re
import sys
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Configuration
MERCHANT_API_DIR = "Frontend/merchant/src/app/api"
BACKEND_API_URL = "${process.env.BACKEND_API_URL}"

# Endpoint mappings
ENDPOINT_MAP = {
    "beauty/stylists": "beauty/stylists",
    "beauty/stylists/availability": "beauty/stylists/availability",
    "beauty/gallery": "beauty/gallery",
    "beauty/packages": "beauty/packages",
    "beauty/services/performance": "beauty/services/performance",
    "beta/desktop-app-waitlist": "beta/desktop-app-waitlist",
    "marketplace/vendors": "marketplace/vendors",
    "education/enrollments": "education/enrollments",
    "calendar-sync": "calendar-sync",
    "dashboard/sidebar-counts": "dashboard/sidebar-counts",
    "b2b/credit/applications": "b2b/credit/applications",
    "b2b/rfq": "b2b/rfq",
    "support/chat": "support/chat",
    "support/conversations": "support/conversations",
    "affiliates": "affiliates",
    "marketing/flash-sales": "marketing/flash-sales",
    "finance/activity": "finance/activity",
    "finance/transactions": "finance/transactions",
    "finance/statements": "finance/statements",
    "finance/overview": "finance/overview",
    "finance/banks": "finance/banks",
    "finance/payouts": "finance/payouts",
    "finance/stats": "finance/stats",
    "affiliate/dashboard": "affiliate/dashboard",
    "affiliate/payout/approvals": "affiliate/payout",
    "nightlife/tickets": "nightlife/tickets",
    "nightlife/reservations": "nightlife/reservations",
    "nightlife/events": "nightlife/events",
    "telemetry/event": "telemetry/event",
    "kitchen/orders": "kitchen/orders",
    "onboarding/state": "onboarding/state",
    "analytics/events": "analytics/events",
    "merchant/quick-replies": "merchant/quick-replies",
    "merchant/policies/publish-defaults": "merchant/policies",
    "merchant/audit": "merchant/audit",
    "merchant/readiness": "merchant/readiness",
    "merchant/billing/status": "merchant/billing",
    "merchant/store/status": "merchant/store-status",
    "store/policies": "store/policies",
}

# Files to skip (infrastructure, webhooks, etc.)
SKIP_PATTERNS = [
    r"health/comprehensive",
    r"webhooks/",
    r"callback",
    r"instagram/callback",
]


def should_skip_file(file_path: str) -> bool:
    """Check if file should be skipped"""
    for pattern in SKIP_PATTERNS:
        if re.search(pattern, file_path):
            return True
    return False


def get_endpoint_for_path(file_path: str) -> Optional[str]:
    """Get backend endpoint for a frontend route file"""
    relative_path = file_path.replace(f"{MERCHANT_API_DIR}/", "")
    
    # Check direct mappings
    for key, endpoint in ENDPOINT_MAP.items():
        if key in relative_path:
            return f"/api/v1/{endpoint}"
    
    # Generic fallback - extract from path
    clean_path = re.sub(r'/\[.*?\]', '', relative_path)
    clean_path = clean_path.replace('/route.ts', '')
    return f"/api/v1/{clean_path}"


def generate_get_method(endpoint: str, relative_path: str) -> str:
    """Generate GET method for route"""
    return f'''
export async function GET(request: NextRequest) {{
  try {{
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {{
      return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
    }}

    const {{ searchParams }} = new URL(request.url);
    const queryParams = new URLSearchParams();
    
    // Forward relevant query parameters
    for (const [key, value] of searchParams.entries()) {{
      if (value) {{
        queryParams.set(key, value);
      }}
    }}

    const response = await apiJson(
      `{BACKEND_API_URL}{endpoint}` + (queryParams.toString() ? `?${{queryParams}}` : ""),
      {{ headers: auth.headers }}
    );

    return NextResponse.json(response);
  }} catch (error) {{
    handleApiError(error, {{ endpoint: "/api/{relative_path}", operation: "GET" }});
    return NextResponse.json(
      {{ error: "Failed to complete operation" }},
      {{ status: 500 }}
    );
  }}
}}
'''


def generate_post_method(endpoint: str, relative_path: str) -> str:
    """Generate POST method for route"""
    return f'''
export async function POST(request: NextRequest) {{
  try {{
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {{
      return NextResponse.json({{ error: "Unauthorized" }}, {{ status: 401 }});
    }}

    const body = await request.json();
    
    const response = await apiJson(
      `{BACKEND_API_URL}{endpoint}`,
      {{
        method: "POST",
        headers: auth.headers,
        body: JSON.stringify(body),
      }}
    );

    return NextResponse.json(response);
  }} catch (error) {{
    handleApiError(error, {{ endpoint: "/api/{relative_path}", operation: "POST" }});
    return NextResponse.json(
      {{ error: "Failed to complete operation" }},
      {{ status: 500 }}
    );
  }}
}}
'''


def migrate_file(file_path: str) -> Tuple[bool, str]:
    """Migrate a single route file"""
    relative_path = file_path.replace(f"{MERCHANT_API_DIR}/", "")
    
    # Check if should skip
    if should_skip_file(file_path):
        return False, f"⏭️  Skipped (infrastructure): {relative_path}"
    
    # Read current content
    with open(file_path, 'r') as f:
        content = f.read()
    
    # Check if already migrated
    if 'apiJson' in content:
        return False, f"✓ Already migrated: {relative_path}"
    
    # Get endpoint
    endpoint = get_endpoint_for_path(file_path)
    if not endpoint:
        return False, f"❌ Could not determine endpoint: {relative_path}"
    
    # Generate new content
    imports = '''import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
'''
    
    methods = []
    methods.append(generate_get_method(endpoint, relative_path))
    
    # Add POST if original had it
    if 'export async function POST' in content:
        methods.append(generate_post_method(endpoint, relative_path))
    
    new_content = imports + '\n'.join(methods)
    
    # Create backup
    backup_path = f"{file_path}.bak"
    with open(backup_path, 'w') as f:
        f.write(content)
    
    # Write migrated content
    with open(file_path, 'w') as f:
        f.write(new_content)
    
    return True, f"✅ Migrated: {relative_path} → {endpoint}"


def find_routes_with_prisma() -> List[str]:
    """Find all route files that still use Prisma"""
    routes = []
    for root, dirs, files in os.walk(MERCHANT_API_DIR):
        if 'route.ts' in files:
            file_path = os.path.join(root, 'route.ts')
            with open(file_path, 'r') as f:
                content = f.read()
                if '@vayva/db' in content:
                    routes.append(file_path)
    return routes


def main():
    """Main migration function"""
    print("🚀 Starting automated route migration...")
    print("=" * 60)
    print()
    
    # Find routes to migrate
    routes = find_routes_with_prisma()
    total = len(routes)
    
    print(f"📊 Found {total} routes to migrate\n")
    print("=" * 60)
    print()
    
    # Migrate each route
    migrated = 0
    skipped = 0
    failed = 0
    
    for route_path in routes:
        try:
            success, message = migrate_file(route_path)
            print(message)
            
            if success:
                migrated += 1
            else:
                skipped += 1
        except Exception as e:
            print(f"❌ Error migrating {route_path}: {str(e)}")
            failed += 1
    
    # Summary
    print()
    print("=" * 60)
    print("🎉 Migration Summary:")
    print("=" * 60)
    print(f"✅ Successfully migrated: {migrated}")
    print(f"⏭️  Skipped: {skipped}")
    print(f"❌ Failed: {failed}")
    print("=" * 60)
    
    # Count remaining
    remaining = len(find_routes_with_prisma())
    print(f"\n📈 Remaining with @vayva/db: {remaining}\n")
    
    if remaining == 0:
        print("🎊 SUCCESS! All routes migrated!")
    else:
        print(f"🔍 Manual review needed for {remaining} routes")
    
    print("\n💡 Backup files created with .bak extension")
    print("💡 To restore: find Frontend/merchant/src/app/api -name '*.bak' -exec sh -c 'mv \"$1\" \"${1%.bak}\"' _ {{}} \\;")
    print()


if __name__ == "__main__":
    main()
