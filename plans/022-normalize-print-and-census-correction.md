# Plan 022: Preserve Normalize print parity and current dependency census

> **Executor instructions**: This corrective plan starts from Plan 017's rejected cumulative commit. Follow every step, do not launch a browser or fetch dependencies, and stop on a STOP condition. The reviewer maintains `plans/README.md`.
>
> **Dispatcher note**: Before execution, the reviewer creates the named branch/worktree from the exact rejected Plan 017 commit below.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/022-normalize-print-and-census-correction" && test "$(git rev-parse HEAD)" = "138e745710fa4a720afd8a8edd45b0278d314842" && test -z "$(git status --porcelain)"`. STOP unless all pass. Later Git commands use this literal baseline SHA so they do not depend on shell state persisting between tool calls.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 017 implementation commit (rejected review baseline)
- **Category**: perf/bug
- **Planned at**: commit `138e745`, 2026-07-19

## Why this matters

Plan 017 successfully localized Normalize and scoped Twemoji, but review found three small correctness/scope issues: both local Normalize links became screen-only even though the external predecessor applied to print, the edited cdnjs census retained its old global count and provenance date, and the Ukraine post lost one trailing blank line outside frontmatter. Correct only those issues. The previous revision attempts failed in throwaway shell/JavaScript quoting, not in the Hugo build or rendered site.

## Scope

**In scope**:
- `layouts/_default/baseof.html`
- `docs/edge-headers.md`
- `content/posts/help-ukraine.md`

**Out of scope**: Normalize bytes/path/integrity, other post frontmatter/bodies, Twemoji conditions/version, CSP directives besides the already-updated cdnjs row/count, other templates, assets, and scripts.

## Git workflow

- Branch: `improve/022-normalize-print-and-census-correction`
- Commit: `Preserve localized dependency parity`
- Do not push or open a PR.

## Steps

### Step 1: Preflight immutable prerequisites

Before editing, run this block as one shell command. STOP immediately while the worktree is still clean if any assertion fails:

```bash
set -eu
test -f /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css
test -x /tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo
test -x /home/igor/Projects/new-varyvoda.com/bin/htmltest
test "$(wc -c < /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css)" = "1816"
test "$(sha256sum /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css | cut -d' ' -f1)" = "62add248168d176068865b526234294392ef86736fab23e66c5c99853987994e"
/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo version | grep -F 'v0.161.1'
/home/igor/Projects/new-varyvoda.com/bin/htmltest --version | grep -F '0.17.0'
```

### Step 2: Apply exactly three corrections

1. Remove only ` media="screen"` from both Normalize links in `baseof.html`; leave coder/custom links untouched.
2. Change the cdnjs origin-census count from `63` to `5`; keep its `script-src` treatment and scoped-Twemoji explanation unchanged. In the evidence preamble, preserve the original 2026-07-03 full-census date and add one sentence stating that the cdnjs row was revalidated from a clean production render on 2026-07-19.
3. Restore the single trailing blank line removed from `help-ukraine.md`, so the cumulative diff from Plan 016 changes that file only by adding `twemoji: true` in frontmatter.

### Step 3: Verify without a generated parser

The fixture must remain exactly 1,816 bytes with SHA-256 `62add248168d176068865b526234294392ef86736fab23e66c5c99853987994e`. Run the asset comparisons and production-pinned gate as one shell command and STOP if any assertion fails:

```bash
set -eu
wc -c /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css assets/css/vendor/normalize.css
sha256sum /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css assets/css/vendor/normalize.css
cmp /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css assets/css/vendor/normalize.css
PATH=/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1:/home/igor/Projects/new-varyvoda.com/bin:/usr/bin:/bin HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-022 make quality-gate
```

Render and verify with the following single shell block. It must exit 0 and print `rendered verification passed`. The five positive pages require exactly one script tag and one parse hook each; the four negative pages require zero of both. Do not replace this with an inline JavaScript/Python verifier or create a helper file.

```bash
set -eu
scratch=$(mktemp -d)
trap 'rm -rf "$scratch"' EXIT
HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-022 /tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo --gc --minify --destination "$scratch/render"
test "$(rg -l 'cdnjs\.cloudflare\.com/ajax/libs/normalize' "$scratch/render" --glob '*.html' | wc -l)" = "0"
normalize_tag=$(grep -oE '<link rel=("stylesheet"|stylesheet) href=("/css/vendor/normalize\.[a-f0-9]+\.css"|/css/vendor/normalize\.[a-f0-9]+\.css)[^>]*>' "$scratch/render/index.html")
test "$(printf '%s\n' "$normalize_tag" | wc -l)" = "1"
! printf '%s\n' "$normalize_tag" | grep -q 'media='
normalize_rel=$(printf '%s\n' "$normalize_tag" | grep -oE '/css/vendor/normalize\.[a-f0-9]+\.css')
normalize_file="$scratch/render$normalize_rel"
test -f "$normalize_file"
cmp /home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css "$normalize_file"
test "$(wc -c < "$normalize_file")" = "1816"
test "$(sha256sum "$normalize_file" | cut -d' ' -f1)" = "62add248168d176068865b526234294392ef86736fab23e66c5c99853987994e"
expected_integrity="sha384-$(openssl dgst -sha384 -binary "$normalize_file" | openssl base64 -A)"
printf '%s\n' "$normalize_tag" | grep -F "integrity=$expected_integrity"
grep -Eq 'normalize\.[a-f0-9]+\.css"?[^>]*>[[:space:]]*<link rel=("stylesheet"|stylesheet) href=("/css/coder|/css/coder)' "$scratch/render/index.html"
test "$(rg -o 'https://cdnjs\.cloudflare\.com' "$scratch/render" | wc -l)" = "5"
for page in experts-nuxt-Sirv/index.html posts/image-personalization/index.html posts/image-seo/index.html posts/image-seo-2026/index.html posts/help-ukraine/index.html; do
  test "$(grep -o '<script[^>]*twemoji\.min\.js[^>]*>' "$scratch/render/$page" | wc -l)" = "1"
  test "$(grep -o 'twemoji\.parse(document\.body)' "$scratch/render/$page" | wc -l)" = "1"
done
for page in index.html projects/index.html projects/sirv-studio/index.html posts/two-theories-of-a-programmer/index.html; do
  test "$(grep -o '<script[^>]*twemoji\.min\.js[^>]*>' "$scratch/render/$page" | wc -l)" = "0"
  test "$(grep -o 'twemoji\.parse(document\.body)' "$scratch/render/$page" | wc -l)" = "0"
done
printf '%s\n' 'rendered verification passed'
```

### Step 4: Verify scope and commit

Inspect `git diff 138e745710fa4a720afd8a8edd45b0278d314842` and require exactly the two Normalize attribute removals, the cdnjs count/provenance correction, and the restored trailing blank line. Also compare `content/posts/help-ukraine.md` with `3f8aa311e175bb5610b8842e0f6982d91a0db46c` and confirm its only cumulative content change is the `twemoji: true` frontmatter line.

Run `git diff --check`, commit, then require `git diff --check 138e745710fa4a720afd8a8edd45b0278d314842...HEAD`, `git diff --name-only 138e745710fa4a720afd8a8edd45b0278d314842...HEAD` to list exactly the three in-scope paths, and clean status.

## Done criteria

- [ ] Local Normalize remains byte-identical/fingerprinted and applies to screen and print.
- [ ] Current clean-render cdnjs count is 5 and documentation says script-only with an accurate revalidation date.
- [ ] Ukraine post cumulative diff is frontmatter-only.
- [ ] Twemoji scoping and normal-page absence remain correct.
- [ ] Production-pinned gate, rendered checks, scope, and clean status pass.

## STOP conditions

- Fixture bytes/hash changed.
- Any change beyond the precise corrections listed in Step 1 is required.
- Hugo gate or direct rendered checks fail twice.
- Any out-of-scope path changes.

## Maintenance notes

Integrate Plan 022 instead of rejected Plan 017. Its cumulative branch includes approved Plans 015/020/016 plus localized Normalize and scoped Twemoji.

Scrutiny note: two critic passes were exhausted. Every substantive issue was accepted: pinned prerequisites now preflight before edits, all rendered assertions are explicit, baseline SHAs are literal, census provenance is dated, and Normalize checks accept Hugo's quoted or unquoted minified attributes.
