#!/bin/sh
# Fails if any published file in public/ still contains a TODO marker, so that
# draft text is never deployed to production. Run after `hugo`.
# Open items: docs/open-items.md, scripts/list-todos.sh.
cd "$(dirname "$0")/.." || exit 1
if grep -rl "TODO" public --include="*.html" --include="*.md" --include="*.txt" --include="*.json"; then
  echo "ERROR: published files contain TODO markers (listed above); see docs/open-items.md." >&2
  exit 1
fi
echo "No TODO markers in public/."
