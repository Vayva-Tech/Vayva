#!/bin/bash
# Simple Secret Scanner
# Fails if specific high-entropy or known patterns are found in src/

echo "🔍 Scanning for secrets..."

KEYWORDS="sk_live_ Bearer gh_token AWS_ACCESS_KEY PRIVATE_KEY"
FOUND=0

for KEY in $KEYWORDS; do
    if grep -r "$KEY" src/ apps/ --exclude-dir=node_modules --exclude=*.test.ts --exclude=*.spec.ts; then
        echo "❌ Potential secret found: $KEY"
        FOUND=1
    fi
done

if [ $FOUND -eq 1 ]; then
    echo "⚠️  Secrets detected! Please remove them before committing."
    exit 1
else
    echo "✅ No obvious secrets found."
    exit 0
fi
