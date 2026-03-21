#!/bin/bash

# Quick Mac DMG Build Script (Standalone)
# Builds desktop app without full monorepo dependencies

set -e

echo "🚀 Building Vayva Desktop for Mac (Quick Build)"
echo "================================================"
echo ""

cd "$(dirname "$0")/.."

# Check if node_modules exist
if [ ! -d "node_modules" ]; then
    echo "❌ Dependencies not installed!"
    echo "Run: pnpm install --ignore-workspace"
    exit 1
fi

echo "✅ Dependencies found"

# Compile TypeScript only for desktop app
echo "📝 Compiling TypeScript..."
pnpm exec tsc

if [ $? -eq 0 ]; then
    echo "✅ TypeScript compiled successfully"
else
    echo "❌ TypeScript compilation failed"
    exit 1
fi

# Skip renderer build (assume already built or use placeholder)
echo "⚠️  Skipping renderer build (using existing build)"

# Build DMG
echo "📦 Building Mac DMG..."
pnpm exec electron-builder --mac

echo ""
echo "✅ Build complete!"
echo ""
echo "📦 Your DMG is located at:"
ls -lh release/*.dmg 2>/dev/null || echo "Check release/ directory"
echo ""
echo "🎉 Ready to test!"
