#!/bin/bash
set -e

API_URL="http://localhost:4000/v1"

echo "🔥 Starting Smoke Test against $API_URL..."

# 1. Health Check (if exists) or simple fetch
# echo "Checking API health..."
# curl -f "$API_URL/health" || echo "Health check skipped/failed"

# 2. Login Flow (Mock)
echo "Attempting Login..."
# In real scenario, would capture token
# TOKEN=$(curl -s -X POST "$API_URL/auth/login" -d '{"email":"owner@vayva.ng", "password":"password"}' | jq -r .accessToken)

# 3. List Products (Public)
echo "Fetching Public Products..."
# curl -s "$API_URL/public/store/demo-store/products"

# 4. Webhook Test
echo "Simulating Paystack Webhook..."
# curl -X POST "$API_URL/webhooks/paystack" \
#   -H "X-Paystack-Signature: mock-sig" \
#   -d '{"event":"charge.success", "data":{...}}'

echo "✅ Smoke test script exists. (Uncomment lines when API is running)"
