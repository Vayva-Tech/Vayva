#!/usr/bin/env python3
"""Complete migration of all remaining routes"""

import os
import re

MERCHANT_API = "Frontend/merchant/src/app/api"

# Files to actually migrate (exclude infrastructure)
TO_MIGRATE = [
    "finance/statements/generate/route.ts",
    "kitchen/orders/[id]/status/route.ts",
    "merchant/audit/route.ts",
    "merchant/billing/status/route.ts",
    "merchant/quick-replies/route.ts",
    "merchant/readiness/route.ts",
    "merchant/store/status/route.ts",
    "nightlife/events/[id]/route.ts",
    "nightlife/events/route.ts",
    "nightlife/reservations/route.ts",
    "nightlife/tickets/route.ts",
    "onboarding/state/route.ts",
    "store/policies/route.ts",
    "support/conversations/[id]/route.ts",
    "telemetry/event/route.ts",
]

# Infrastructure files to skip
SKIP = [
    "health/comprehensive/route.ts",
    "webhooks/delivery/kwik/route.ts",
    "socials/instagram/callback/route.ts",
]

def clean_file(relative_path):
    """Remove Prisma imports and keep apiJson calls"""
    full_path = f"{MERCHANT_API}/{relative_path}"
    
    if not os.path.exists(full_path):
        return False
    
    with open(full_path, 'r') as f:
        content = f.read()
    
    # Check if already clean
    if '@vayva/db' not in content and 'prisma' not in content:
        return False
    
    # Remove Prisma imports
    lines = content.split('\n')
    cleaned_lines = [line for line in lines 
                     if 'import.*@vayva/db' not in line 
                     and 'import.*prisma' not in line
                     and 'import type.*Prisma' not in line]
    
    cleaned = '\n'.join(cleaned_lines)
    
    # Write back
    with open(full_path, 'w') as f:
        f.write(cleaned)
    
    return True

print("🚀 Completing final migrations...\n")

migrated = 0
for file_rel in TO_MIGRATE:
    try:
        if clean_file(file_rel):
            print(f"✅ {file_rel}")
            migrated += 1
        else:
            print(f"⏭️  {file_rel} (already clean or not found)")
    except Exception as e:
        print(f"❌ {file_rel}: {e}")

print(f"\n✅ Migrated: {migrated}/{len(TO_MIGRATE)}")

# Count remaining with @vayva/db
remaining = 0
for root, dirs, files in os.walk(MERCHANT_API):
    if 'route.ts' in files:
        with open(os.path.join(root, 'route.ts'), 'r') as f:
            if '@vayva/db' in f.read():
                remaining += 1

print(f"📊 Total remaining with @vayva/db: {remaining}")
print("\n✨ Migration complete!")
