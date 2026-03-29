#!/bin/bash
echo "Migrating remaining business logic services from core-api to fastify-server..."

# List of services to migrate
declare -a services=(
  "paystack-webhook.ts"
  "email-automation.ts"
  "DeletionService.ts"
  "dashboard-actions.ts"
  "dashboard-alerts.ts"
  "dashboard-industry.server.ts"
  "dashboard.server.ts"
  "kyc.ts"
  "referral.service.ts"
)

echo "Services to migrate:"
for service in "${services[@]}"; do
  echo "  - $service"
done

echo ""
echo "Checking which files exist in core-api..."
for service in "${services[@]}"; do
  if [ -f "Backend/core-api/src/services/$service" ]; then
    echo "✅ Found: $service"
  else
    echo "❌ Not found: $service"
  fi
done

echo ""
echo "Migration preparation complete!"
