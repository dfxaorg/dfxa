#!/bin/sh
# Lists all open "TODO" markers in content, i18n, config and docs, e.g. for
# the summary of items the experts need to confirm before launch.
cd "$(dirname "$0")/.." || exit 1
grep -rn --color=never "TODO" content i18n hugo.toml docs | sort
