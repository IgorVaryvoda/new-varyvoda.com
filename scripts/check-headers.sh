#!/usr/bin/env bash
set -u

SITE="${SITE:-https://www.varyvoda.com}"
SITE="${SITE%/}"
STRICT_HEADERS="${STRICT_HEADERS:-1}"

failures=()
warnings=()
tmpdir="$(mktemp -d)"
trap 'rm -rf "$tmpdir"' EXIT

add_failure() {
  failures+=("$1")
}

add_policy_result() {
  if [ "$STRICT_HEADERS" = "1" ]; then
    failures+=("$1")
  else
    warnings+=("$1")
  fi
}

headers_for() {
  curl -sI "$1" | tr -d '\r' | tr '[:upper:]' '[:lower:]'
}

has_header() {
  local headers="$1"
  local name="$2"
  printf '%s\n' "$headers" | grep -q "^${name}:"
}

header_value() {
  local headers="$1"
  local name="$2"
  printf '%s\n' "$headers" | awk -v prefix="${name}:" '
    index($0, prefix) == 1 {
      sub(/^[^:]+:[ \t]*/, "", $0)
      value = $0
    }
    END { print value }
  '
}

home_url="${SITE}/"
home_headers="$(headers_for "$home_url")"

if ! has_header "$home_headers" "content-security-policy-report-only" &&
   ! has_header "$home_headers" "content-security-policy"; then
  add_policy_result "${home_url}: missing content-security-policy-report-only or content-security-policy"
fi

if ! printf '%s\n' "$home_headers" | grep -q '^x-content-type-options:[[:space:]]*nosniff$'; then
  observed="$(header_value "$home_headers" "x-content-type-options")"
  add_failure "${home_url}: expected x-content-type-options: nosniff; observed: ${observed:-<missing>}"
fi

if ! has_header "$home_headers" "referrer-policy"; then
  add_failure "${home_url}: missing referrer-policy"
fi

if ! printf '%s\n' "$home_headers" | grep -q '^content-type:[[:space:]]*text/html'; then
  observed="$(header_value "$home_headers" "content-type")"
  add_failure "${home_url}: expected an HTML content type; observed: ${observed:-<missing>}"
fi

home_file="${tmpdir}/home.html"
if curl -fsSL "$home_url" -o "$home_file"; then
  css_path="$(grep -oE '/css/site(\.min)?\.[a-f0-9]+\.css' "$home_file" | head -n 1 || true)"
  if [ -z "$css_path" ]; then
    add_failure "${home_url}: could not find the fingerprinted /css/site*.css bundle"
  else
    css_url="${SITE}${css_path}"
    css_headers="$(headers_for "$css_url")"
    css_cache_control="$(header_value "$css_headers" "cache-control")"
    if ! printf '%s\n' "$css_headers" | grep -q '^content-type:[[:space:]]*text/css'; then
      observed="$(header_value "$css_headers" "content-type")"
      add_failure "${css_url}: expected a CSS content type; observed: ${observed:-<missing>}"
    fi
    if ! printf '%s\n' "$css_cache_control" | grep -q 'immutable'; then
      add_policy_result "${css_url}: expected cache-control to contain immutable; observed: ${css_cache_control:-<missing>}"
    fi
  fi
else
  add_failure "${home_url}: failed to fetch homepage HTML for CSS discovery"
fi

if [ "${#warnings[@]}" -gt 0 ]; then
  printf 'HEADER POLICY WARNINGS\n'
  for warning in "${warnings[@]}"; do
    printf -- '- %s\n' "$warning"
  done
fi

if [ "${#failures[@]}" -gt 0 ]; then
  printf 'HEADER CHECK FAILED\n'
  for failure in "${failures[@]}"; do
    printf -- '- %s\n' "$failure"
  done
  exit 1
fi

printf 'ALL HEADERS OK\n'
