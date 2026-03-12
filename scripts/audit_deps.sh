#!/bin/bash
# Dependency Auditor
# Wraps pnpm audit

echo "🔍 Auditing dependencies..."

# Use pnpm audit, ignore dev deps if desired, or allow specific severities
# For strictness: fail on high/critical

pnpm audit --audit-level=high

if [ $? -eq 0 ]; then
    echo "✅ Dependencies look clean (no high/critical)."
    exit 0
else
    echo "❌ High vulnerability detected!"
    exit 1
fi
