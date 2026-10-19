#!/bin/sh
# Build command for Cloudflare Workers Builds (see docs/cloudflare.md).
#
# Language parity, Hugo build and SEO check must all pass, otherwise the build
# fails and nothing is deployed. The TODO guard is not run here but in the
# deploy command (sh scripts/check-no-todo.sh && npx wrangler deploy), so it
# blocks every production deployment, whichever branch is the production
# branch, while previews (public, noindex) may show draft text.
# Builds of branches other than main are marked noindex so that previews are
# not indexed.
# Requires the build variable HUGO_VERSION=0.166.0 (Hugo extended).
set -eu
cd "$(dirname "$0")/.."

# enableGitInfo needs the full history for correct "last updated" dates.
git fetch --unshallow --quiet 2>/dev/null || true

hugo version
node scripts/check-language-parity.mjs
hugo --gc
node scripts/check-seo.mjs

branch="${WORKERS_CI_BRANCH:-}"
if [ "$branch" != "main" ]; then
  echo "Build of branch '${branch:-local}' (not main): adding X-Robots-Tag: noindex."
  printf '\n/*\n  X-Robots-Tag: noindex\n' >> public/_headers
fi
