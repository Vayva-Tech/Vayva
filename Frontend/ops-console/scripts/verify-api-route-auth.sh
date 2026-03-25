#!/usr/bin/env bash
# Fail if any Next.js Route Handler under src/app/api lacks session/auth wrappers,
# except documented public or alternate-auth endpoints (see docs/08_reference/remaining-tenancy-security-scope.md §8.2).
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
API_ROOT="$ROOT/src/app/api"

if [[ ! -d "$API_ROOT" ]]; then
  echo "FAIL: expected API root at $API_ROOT"
  exit 1
fi

# Paths relative to API_ROOT
ALLOWLIST=(
  "auth/[...nextauth]/route.ts"
  "health/route.ts"
  "ops/auth/login/route.ts"
  "ops/auth/signout/route.ts"
  "ops/health/route.ts"
  "ops/invitations/validate/route.ts"
  "ops/invitations/accept/route.ts"
  "webhooks/fraud-detection/route.ts"
)

is_allowed() {
  local rel="$1"
  local a
  for a in "${ALLOWLIST[@]}"; do
    if [[ "$rel" == "$a" ]]; then
      return 0
    fi
  done
  return 1
}

AUTH_PATTERN='(OpsAuthService\.requireSession|withOpsAPI|withOpsAuth)'

fail=0
while IFS= read -r -d '' file; do
  rel="${file#"${API_ROOT}/"}"
  if is_allowed "$rel"; then
    continue
  fi
  if ! grep -qE "$AUTH_PATTERN" "$file"; then
    echo "FAIL: missing auth helper ($AUTH_PATTERN): $file"
    fail=1
  fi
done < <(find "$API_ROOT" -name route.ts -print0)

if [[ "$fail" -ne 0 ]]; then
  echo "Ops API route auth verification failed."
  exit 1
fi

echo "OK: all non-allowlisted ops-console API routes declare session/auth helpers."
