#!/bin/bash
# Master CI Gate Script
# Must pass before Deployment

echo "🚧 Starting Pre-Flight Checks..."
EXIT_CODE=0

# 1. Dependency Audit
echo "1️⃣  Checking Dependencies..."
./scripts/audit_deps.sh
if [ $? -ne 0 ]; then
    echo "❌ Dependency check failed."
    EXIT_CODE=1
fi

# 2. Secret Scan
echo "2️⃣  Scanning for Secrets..."
./scripts/audit_secrets.sh
if [ $? -ne 0 ]; then
    echo "❌ Secret scan failed."
    EXIT_CODE=1
fi

# 3. Tenant Isolation Suite (Critical)
echo "3️⃣  Verifying Tenant Isolation..."
npx playwright test tests/integration/tenant-isolation.spec.ts
if [ $? -ne 0 ]; then
    echo "❌ Tenant Isolation tests failed."
    EXIT_CODE=1
fi

# 4. Header Security
echo "4️⃣  Verifying Security Headers..."
npx playwright test tests/integration/security-pack.spec.ts
if [ $? -ne 0 ]; then
    echo "❌ Security Header tests failed."
    EXIT_CODE=1
fi

if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ ALL GATES PASSED. READY FOR DEPLOY."
else
    echo "⛔️ GATES FAILED. DEPLOYMENT BLOCKED."
fi

exit $EXIT_CODE
