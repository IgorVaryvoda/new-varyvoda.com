#!/usr/bin/env bash
set -euo pipefail

SITE="${SITE:-https://www.varyvoda.com}"
SITE="${SITE%/}"
CACHE_BUSTER="${CACHE_BUSTER:-$(date +%s)}"

check_page() {
  local path="$1"
  local expected="$2"
  local url="${SITE}${path}?smoke=${CACHE_BUSTER}"
  local body

  body="$(curl -fsSL --retry 5 --retry-delay 2 --retry-all-errors "$url")"
  if ! printf '%s' "$body" | grep -Fq "$expected"; then
    printf 'DEPLOY SMOKE FAILED: %s does not contain %s\n' "$url" "$expected" >&2
    exit 1
  fi
  printf 'OK %s\n' "$path"
}

check_page "/" "I build products—and I keep them alive."
check_page "/projects/" "A living portfolio"
check_page "/projects/first-internet-business/" "The first business"
check_page "/projects/sirv-studio/" "Ownership"
check_page "/posts/" "Start here"

STRICT_HEADERS=0 SITE="$SITE" bash scripts/check-headers.sh
