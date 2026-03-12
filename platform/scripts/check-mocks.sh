#!/bin/bash

# Configuration
FORBIDDEN_TERMS=("mock" "stub" "faker" "dummy" "todo")
EXCLUDED_DIRS=("__tests__" "tests" "cypress" ".git" "node_modules" "dist" ".next" "scripts" "mocks" ".turbo")
TARGET_DIRS=("apps/storefront/src" "apps/merchant-admin/src" "services")

echo "🔍 Starting No-Mock Enforcement Scan..."
EXIT_CODE=0

for dir in "${TARGET_DIRS[@]}"; do
  if [ -d "$dir" ]; then
    echo "Checking directory: $dir"
    for term in "${FORBIDDEN_TERMS[@]}"; do
      # Grep options:
      # -r: recursive
      # -n: line number
      # -i: case insensitive
      # -I: ignore binary
      
      # Build exclusion args
      EXCLUDE_ARGS=""
      for exclude in "${EXCLUDED_DIRS[@]}"; do
        EXCLUDE_ARGS="$EXCLUDE_ARGS --exclude-dir=$exclude"
      done

      # Run grep
      RESULT=$(grep -rniI $EXCLUDE_ARGS --exclude="env-validation.ts" --exclude="*.test.ts" --exclude="*.spec.ts" --exclude="*.test.tsx" --exclude="*.spec.tsx" "$term" "$dir" | grep -v "PAYSTACK_MOCK" || true)
      
      if [ ! -z "$RESULT" ]; then
        echo "⚠️  Found '$term' in $dir:"
        echo "$RESULT"
        # Fail on forbidden terms (mock, stub, faker)
        if [[ "$term" != "todo" ]]; then
            EXIT_CODE=1
        fi
      fi
    done
  else
    echo "Skipping missing directory: $dir"
  fi
done

echo "✅ Scan Complete."
exit $EXIT_CODE
