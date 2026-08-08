#!/usr/bin/env bash
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
BACKUP="$(mktemp -d)"

restore_routes() {
  for d in api admin admin61; do
    if [ -d "$BACKUP/$d" ] && [ ! -d "src/app/$d" ]; then
      mv "$BACKUP/$d" "src/app/$d"
    fi
  done
  rm -rf "$BACKUP"
}
trap restore_routes EXIT

if [ -d src/app/api ]; then mv src/app/api "$BACKUP/api"; fi
if [ -d src/app/admin ]; then mv src/app/admin "$BACKUP/admin"; fi
if [ -d src/app/admin61 ]; then mv src/app/admin61 "$BACKUP/admin61"; fi

export GITHUB_PAGES=1
export NEXT_PUBLIC_APP_URL="${NEXT_PUBLIC_APP_URL:-https://tolwex.com}"
npm run build
touch out/.nojekyll
printf 'tolwex.com\n' > out/CNAME
echo "Static site ready in ./out"
