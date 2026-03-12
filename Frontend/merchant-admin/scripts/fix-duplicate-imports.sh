#!/bin/bash

# Fix duplicate imports created by migration script

set -e

echo "🔧 Fixing duplicate requireAuth imports..."
echo ""

cd "$(dirname "$0")/../src/app/api"

# Find files with duplicate requireAuth imports
files=$(grep -l "requireAuth" . -r --include="*.ts" | xargs grep -l "import.*requireAuth.*requireAuth" || true)

if [ -z "$files" ]; then
    # Try a different pattern - multiple import lines
    files=$(find . -name "*.ts" -type f -exec awk '/import.*requireAuth/{c++} END{if(c>1)print FILENAME}' {} \; || true)
fi

if [ -z "$files" ]; then
    echo "✅ No duplicate imports found!"
    exit 0
fi

echo "Found files with duplicate imports:"
echo "$files"
echo ""

# Fix each file
echo "$files" | while read file; do
    if [ -f "$file" ]; then
        echo "  Fixing: $file"
        
        # Remove duplicate import lines (keep only first occurrence)
        awk '!seen[$0]++ || !/import.*requireAuth/' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
        
        echo "  ✓ Fixed: $file"
    fi
done

echo ""
echo "✅ Duplicate imports removed!"
