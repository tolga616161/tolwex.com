#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BACKUP="$(mktemp -d)"
trap 'rm -rf "$BACKUP"' EXIT

if [ -d src/app/api ]; then mv src/app/api "$BACKUP/api"; fi
if [ -d src/app/admin ]; then mv src/app/admin "$BACKUP/admin"; fi

export GITHUB_PAGES=1
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://tolwex.com}"
npm run build
echo 'tolwex.com' > out/CNAME
echo 'www.tolwex.com' >> out/CNAME
echo "Static site ready in ./out"
