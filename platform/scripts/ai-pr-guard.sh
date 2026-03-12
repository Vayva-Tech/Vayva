#!/bin/bash

# AI PR Guardrail Script
# Prevents AI bots from modifying protected files

set -e

PR_AUTHOR="${GITHUB_ACTOR}"
CHANGED_FILES=$(git diff --name-only origin/main...HEAD)

# Protected file patterns
PROTECTED_PATTERNS=(
  "GlobalHeader.tsx"
  "GlobalFooter.tsx"
  "terms-of-service.md"
  "privacy-policy.md"
)

# AI bot usernames (add more as needed)
AI_BOTS=(
  "dependabot"
  "renovate"
  "github-actions"
  "copilot"
)

# Check if PR author is an AI bot
is_ai_bot=false
for bot in "${AI_BOTS[@]}"; do
  if [[ "$PR_AUTHOR" == *"$bot"* ]]; then
    is_ai_bot=true
    break
  fi
done

# If not an AI bot, allow all changes
if [ "$is_ai_bot" = false ]; then
  echo "✅ Human author detected. All changes allowed."
  exit 0
fi

# Check if any protected files were changed
for pattern in "${PROTECTED_PATTERNS[@]}"; do
  if echo "$CHANGED_FILES" | grep -q "$pattern"; then
    echo "⛔ AI bot attempted to modify protected file: $pattern"
    echo ""
    echo "Protected files cannot be modified by automated systems."
    echo "These files require human review and approval."
    echo ""
    echo "Changed files:"
    echo "$CHANGED_FILES"
    exit 1
  fi
done

echo "✅ No protected files modified by AI bot."
exit 0
