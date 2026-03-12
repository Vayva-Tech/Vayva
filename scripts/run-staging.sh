#!/bin/bash
# Run Staging Environment Locally
# Usage: ./run-staging.sh [merchant-admin|marketing|ops-console]

set -e

APP=${1:-merchant-admin}

if [[ ! "$APP" =~ ^(merchant-admin|marketing|ops-console)$ ]]; then
  echo "Usage: ./run-staging.sh [merchant-admin|marketing|ops-console]"
  echo ""
  echo "Examples:"
  echo "  ./run-staging.sh merchant-admin  # Run merchant-admin with staging DB"
  echo "  ./run-staging.sh marketing       # Run marketing site locally"
  echo "  ./run-staging.sh ops-console     # Run ops console with staging"
  exit 1
fi

echo "=== Running $APP in STAGING mode ==="
echo "Connecting to:"
echo "  - DB: vayva_staging @ 163.245.209.203"
echo "  - Redis: 163.245.209.203:6379"
echo ""

cd "Frontend/$APP"

# Check if staging env exists
if [[ ! -f ".env.staging" ]]; then
  echo "❌ .env.staging not found! Creating from template..."
  cat > .env.staging << 'EOF'
# STAGING Environment - Local Development
DATABASE_URL="postgresql://postgres:password@163.245.209.203:5432/vayva_staging"
REDIS_URL="redis://:changeme@163.245.209.203:6379"

NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="staging-secret-local"
AUTH_TRUST_HOST="true"

BACKEND_API_URL="http://localhost:3001"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXT_PUBLIC_API_URL="http://localhost:3000/api"

EMAIL_FROM="staging@vayva.ng"
EMAIL_PROVIDER="mock"

ENABLE_AI_ASSISTANT="true"
LAUNCH_MODE="false"

NODE_ENV="development"
STAGING_MODE="true"
EOF
  echo "✅ Created .env.staging"
fi

# Copy staging env to active
ln -sf .env.staging .env.local
echo "✅ Linked .env.staging → .env.local"

# Check if ports are already in use
check_port() {
  if lsof -Pi :$1 -sTCP:LISTEN -t >/dev/null 2>&1; then
    echo "⚠️  Port $1 is already in use!"
    echo "   Run: lsof -ti:$1 | xargs kill -9"
    exit 1
  fi
}

if [[ "$APP" == "merchant-admin" ]]; then
  check_port 3000
elif [[ "$APP" == "marketing" ]]; then
  check_port 3002
elif [[ "$APP" == "ops-console" ]]; then
  check_port 3003
fi

echo ""
echo "🚀 Starting $APP in STAGING mode..."
echo ""
npm run dev
