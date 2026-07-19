# Plan 017: Remove cdnjs from the critical path and scope Twemoji

> **Executor instructions**: Follow this plan exactly. Do not launch a browser or network-fetch dependencies. Run every verification and stop on a STOP condition. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Dispatcher note**: Before execution, the reviewer creates the named branch/worktree from approved Plan 016. The audited uncommitted fixture remains readable at `/home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css`.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/017-local-critical-css" && test "$(git rev-parse HEAD)" = "3f8aa311e175bb5610b8842e0f6982d91a0db46c" && test -z "$(git status --porcelain)"`. STOP unless all checks pass. Set `BASE_REF=3f8aa311e175bb5610b8842e0f6982d91a0db46c`.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 016
- **Category**: perf
- **Planned at**: commit `8819dc5`, 2026-07-18

## Why this matters

Every page blocks on a third-party Normalize stylesheet even though it is under 2 KB, adding avoidable connection latency. Twemoji also traverses every document after load while only five posts contain emoji. Vendoring the exact Normalize release and opting emoji pages in removes both global costs without visual redesign.

## Current state

- `layouts/_default/baseof.html` loads Normalize 8.0.1 from cdnjs before the Hugo CSS pipeline.
- The same layout globally loads Twemoji 12.0.4 and calls `twemoji.parse(document.body)` when site-wide `enableTwemoji` is true.
- Emoji exists in five posts: `expets-sirv-optimization.md`, `image-personalization.md`, `image-seo.md`, `image-seo-2026.md`, and `help-ukraine.md`.
- `plans/fixtures/normalize-8.0.1.min.css` contains the audited exact MIT minified source for offline execution.

## Scope

**In scope**:
- `assets/css/vendor/normalize.css`
- `layouts/_default/baseof.html`
- frontmatter only in the five named posts
- `docs/edge-headers.md` cdnjs/Twemoji census only

**Out of scope**: CSS rules, theme/custom stylesheet contents, Twemoji version/CDN URL/integrity, post bodies, global site config, fonts, and unrelated scripts/preconnects.

## Git workflow

- Branch: `improve/017-local-critical-css`
- Commit: `Localize critical CSS loading`
- Do not push or open a PR.

## Steps

### Step 1: Vendor the audited Normalize source

The trusted fixture at `/home/igor/Projects/new-varyvoda.com/plans/fixtures/normalize-8.0.1.min.css` is exactly 1,816 bytes with SHA-256 `62add248168d176068865b526234294392ef86736fab23e66c5c99853987994e`. Verify both values with `wc -c` and `sha256sum`, create the missing parent with `mkdir -p assets/css/vendor`, then copy it byte-for-byte to `assets/css/vendor/normalize.css`; do not fetch it. Verify `cmp` against that absolute fixture succeeds and the license banner remains.

Use one unambiguous implementation: emit Normalize as its own same-origin Hugo asset immediately before coder.css. In both server and production branches, fingerprint the already-minified fixture without re-minifying it and render a stylesheet link with integrity/crossorigin. The emitted bytes must therefore remain exactly identical to the trusted fixture. Remove the cdnjs Normalize link entirely. Do not modify the existing coder/custom resource statements; this preserves coder's server source-map branch and both existing production pipelines byte-for-byte.

### Step 2: Make Twemoji page-owned

Add `twemoji: true` to only the five named posts. Bind one shared condition equivalent to `and .Site.Params.enableTwemoji .Params.twemoji` and gate both the existing deferred Twemoji script and body parse hook on it. The site setting remains the master switch. Normal pages must have neither the script nor onload attribute. Do not auto-detect emoji at template time and do not change the Twemoji library/version.

Update `docs/edge-headers.md` to match the emitted dependency census: cdnjs is no longer needed by `style-src` for Normalize, remains a `script-src` source for scoped Twemoji (and any separately documented current script use), and the inline body parse hook exists only on `twemoji: true` pages. Remove cdnjs from the recommended `style-src` only if the clean production render confirms no remaining stylesheet uses it; do not change unrelated CSP guidance.

### Step 3: Verify emitted HTML/CSS and commit

Require `/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo` to report v0.161.1. Run `PATH=/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1:/home/igor/Projects/new-varyvoda.com/bin:$PATH HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-017 make quality-gate`, then create a fresh temporary directory and render with `HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-017 /tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo --gc --minify --destination "$scratch/render"`. Inspect only that clean render and remove it afterward. Verify:

- no HTML contains the Normalize cdnjs URL;
- the homepage has a same-origin fingerprinted Normalize stylesheet link immediately before coder.css; the linked file exists under the render root, `cmp`s byte-for-byte with the fixture, has the exact trusted SHA-256, and its `sha384-...` integrity value matches the file;
- each expected output—`experts-nuxt-Sirv/index.html`, `posts/image-personalization/index.html`, `posts/image-seo/index.html`, `posts/image-seo-2026/index.html`, and `posts/help-ukraine/index.html`—contains exactly one Twemoji `<script ...twemoji.min.js...>` opening tag and exactly one `twemoji.parse(document.body)` body hook;
- `index.html`, `projects/index.html`, `projects/sirv-studio/index.html`, and one named normal-post output contain neither Twemoji token;
- every same-origin stylesheet link resolves to an existing file under the render root and every same-origin stylesheet carrying integrity matches that file's SHA-384 digest; external Google Fonts/content stylesheet URLs are excluded from local existence checks and must remain unchanged.

Use `git show "$BASE_REF":layouts/_default/baseof.html` plus a focused comparison to prove the existing server coder/custom resource statements are byte-identical. Source inspection must confirm the new server Normalize statement uses `assets/css/vendor/normalize.css`, `fingerprint`, integrity, and crossorigin without disturbing `enableSourceMap: true`.

Commit, then run `git diff --check "$BASE_REF"...HEAD`. `git diff --name-only "$BASE_REF"...HEAD` must list exactly `assets/css/vendor/normalize.css`, `docs/edge-headers.md`, the five named post files, and `layouts/_default/baseof.html`. Status must be clean.

## Done criteria

- [ ] Normalize is a separate same-origin fingerprinted asset, license-preserved, linked immediately before coder.css, and absent from cdnjs.
- [ ] Production CSS remains minified/fingerprinted with valid integrity metadata.
- [ ] Only the five emoji posts load/parse Twemoji.
- [ ] Post bodies, CSS semantics, and library versions are unchanged.
- [ ] Quality gate and rendered assertions pass.

## STOP conditions

- Fixture byte count or SHA-256 differs from the trusted values above.
- Hugo resource composition changes CSS order or breaks server source maps/production integrity.
- Emoji inventory differs materially from the five named posts.
- Build/render verification fails twice.

## Maintenance notes

New emoji-heavy pages must opt in with `twemoji: true`. Do not reintroduce global parsing merely for isolated symbols.
