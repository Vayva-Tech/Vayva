#!/bin/bash
# Pre-Push Security Verification Script
# Run this before pushing to GitHub to ensure no secrets are exposed

set -e

echo "🔍 Vayva - Pre-Push Security Check"
echo "==========================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

ERRORS=0

# Check 1: Verify .gitignore includes .env files
echo "📋 Checking .gitignore..."
if grep -q "^\.env$" .gitignore && grep -q "^\.env\.local$" .gitignore; then
    echo -e "${GREEN}✅ .gitignore properly configured${NC}"
else
    echo -e "${RED}❌ .gitignore missing .env exclusions${NC}"
    ERRORS=$((ERRORS + 1))
fi

# Check 2: Verify no .env files are tracked
echo ""
echo "📋 Checking for tracked .env files..."
if git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$" > /dev/null; then
    echo -e "${RED}❌ Found tracked .env files:${NC}"
    git ls-files | grep -E "\.env$|\.env\.local$|\.env\.production$"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No .env files are tracked${NC}"
fi

# Check 3: Search for Paystack live keys in code
echo ""
echo "🔑 Checking for Paystack live keys..."
if git grep -i "sk_live_[0-9a-zA-Z]" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null | grep -v "test" | grep -v "example" | grep -v "redact"; then
    echo -e "${RED}❌ Found potential Paystack live keys in code${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No Paystack live keys found${NC}"
fi

# Check 4: Search for Groq API keys
echo ""
echo "🔑 Checking for Groq API keys..."
if git grep -i "gsk_[0-9a-zA-Z]" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null | grep -v "test" | grep -v "example"; then
    echo -e "${RED}❌ Found potential Groq API keys in code${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No Groq API keys found${NC}"
fi

# Check 5: Search for OpenAI API keys
echo ""
echo "🔑 Checking for OpenAI API keys..."
if git grep -i "sk-proj-" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null; then
    echo -e "${RED}❌ Found potential OpenAI API keys in code${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No OpenAI API keys found${NC}"
fi

# Check 6: Search for database credentials
echo ""
echo "🔑 Checking for database credentials..."
if git grep -i "postgresql://.*:.*@" -- '*.ts' '*.tsx' '*.js' '*.jsx' '*.json' 2>/dev/null | grep -v "example" | grep -v "user:password"; then
    echo -e "${RED}❌ Found potential database credentials in code${NC}"
    ERRORS=$((ERRORS + 1))
else
    echo -e "${GREEN}✅ No database credentials found${NC}"
fi

# Check 7: Verify .env.example has no real keys
echo ""
echo "📋 Checking .env.example..."
if [ -f ".env.example" ]; then
    if grep -E "sk_live_[0-9a-zA-Z]{20,}|gsk_[0-9a-zA-Z]{20,}|sk-proj-[0-9a-zA-Z]{20,}" .env.example > /dev/null; then
        echo -e "${RED}❌ .env.example contains real API keys${NC}"
        ERRORS=$((ERRORS + 1))
    else
        echo -e "${GREEN}✅ .env.example looks safe${NC}"
    fi
else
    echo -e "${YELLOW}⚠️  .env.example not found${NC}"
fi

# Check 8: Verify no large files
echo ""
echo "📦 Checking for large files..."
LARGE_FILES=$(find . -type f -size +10M -not -path "*/node_modules/*" -not -path "*/.git/*" -not -path "*/dist/*" -not -path "*/build/*" 2>/dev/null || true)
if [ -n "$LARGE_FILES" ]; then
    echo -e "${YELLOW}⚠️  Found large files (>10MB):${NC}"
    echo "$LARGE_FILES"
else
    echo -e "${GREEN}✅ No large files found${NC}"
fi

# Final Report
echo ""
echo "==========================================="
if [ $ERRORS -eq 0 ]; then
    echo -e "${GREEN}✅ All security checks passed!${NC}"
    echo -e "${GREEN}Safe to push to GitHub${NC}"
    exit 0
else
    echo -e "${RED}❌ Found $ERRORS security issue(s)${NC}"
    echo -e "${RED}DO NOT push to GitHub until resolved${NC}"
    exit 1
fi
