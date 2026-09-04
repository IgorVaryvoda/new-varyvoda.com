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

  for attempt in {1..12}; do
    if body="$(curl -fsSL --retry 2 --retry-delay 2 --retry-all-errors "$url")" &&
      [[ "$body" == *"$expected"* ]]; then
      printf 'OK %s\n' "$path"
      return
    fi
    if ((attempt < 12)); then
      sleep 5
    fi
  done

  printf 'DEPLOY SMOKE FAILED: %s does not contain %s\n' "$url" "$expected" >&2
  exit 1
}

check_page "/" "living portfolio of independent software."
check_page "/projects/" "Choose a product."
check_page "/about/" "I started by building and operating a profitable content website."
check_page "/projects/sirv-studio/" "Contributions"
check_page "/posts/" "Start here"

STRICT_HEADERS=0 SITE="$SITE" bash scripts/check-headers.sh
