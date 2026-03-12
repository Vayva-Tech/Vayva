#!/usr/bin/env bash

# Rule 43.9: Fail if new req.formData() upload endpoints are added.
# New uploads MUST use the signed-upload flow (/api/uploads/create + finalize).

echo "🔍 Checking for unauthorized req.formData() usage in API routes..."

# Find all route.ts files in merchant-admin and ops-console
ROUTES=$(find apps/merchant-admin/src/app/api apps/ops-console/src/app/api -name "route.ts")

FORBIDDEN_USAGE=0

for file in $ROUTES; do
  # Check for req.formData() usage
  # We allow it in some specific cases if explicitly ignored, but by default it's banned.
  if grep -q "req.formData()" "$file"; then
    echo "❌ Forbidden usage of req.formData() found in: $file"
    echo "   -> Rule 43.2: Use signed-upload flow (/api/uploads/create + finalize) instead."
    FORBIDDEN_USAGE=$((FORBIDDEN_USAGE + 1))
  fi
done

if [ $FORBIDDEN_USAGE -gt 0 ]; then
  echo "🚨 CI Guard Failed: $FORBIDDEN_USAGE unauthorized upload endpoint(s) detected."
  exit 1
fi

echo "✅ No unauthorized req.formData() usage found."
exit 0
