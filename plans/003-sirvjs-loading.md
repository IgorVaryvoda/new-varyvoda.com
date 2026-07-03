# Plan 003: Load Sirv.js exactly once per page, deferred, from the layouts — never from content

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- layouts/ content/posts/ content/projects/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED (image lazy-loading must keep working on every content type)
- **Depends on**: none (001 recommended first, but not required)
- **Category**: bug / perf
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

This site's images are lazy-loaded by Sirv.js: `<img class="Sirv" data-src="...">` stays a placeholder until the script swaps `data-src` → `src`. The script loading is currently a mess with a real failure mode:

1. **The blog-post layout (`layouts/posts/single.html`) never loads Sirv.js at all.** Posts contain 70+ `class="Sirv"` images that render **only** because four post markdown files happen to have a `<script>` tag hand-pasted into their body. Any new post written without that pasted tag silently renders zero images.
2. Project pages load the script **twice** (once from the layout, once from each project's markdown body).
3. No copy uses `defer`, so each one is parser-blocking, including copies in the middle of article bodies.
4. Bonus bug found during the audit: `content/posts/image-seo.md:431` contains an **unescaped** `<script>` tag inside a `<pre>` code sample. In the rendered page it executes (loading the legacy v2 `sirv.js` a second time) and the "sample" displays as an empty box.

After this plan: each layout that renders Sirv images loads the script exactly once with `defer`; content files contain no live script tags for Sirv.js.

## Current state

The canonical script tag (used by layouts):

```html
<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js?modules=lazyimage"></script>
```

Where it appears today (`grep -rn 'sirv.js' layouts/ content/`):

- Layouts (keep, add `defer`):
  - `layouts/partials/home.html:611`
  - `layouts/projects/list.html:386`
  - `layouts/projects/single.html:340`
- `layouts/posts/single.html` — **zero** occurrences (this is the gap; the file's `<style>` block ends at line 275, and the template ends shortly after).
- Content, live script tags to REMOVE (one line each; all are the v3 tag above except where noted):
  - `content/projects/budjet.md:24`, `cryptotracker.md:21`, `earth-roulette.md:25`, `lowtax-guide.md:24`, `sirv-experts.md:23`, `sirv-studio.md:440`, `slovocard.md:22`, `travelbot.md:25`, `uahelp.md:21`, `viddl.md:21` (all `content/projects/`)
  - `content/posts/expets-sirv-optimization.md:139` — `<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js"></script>` (no modules param)
  - `content/posts/image-personalization.md:378` — same v3-no-modules form
  - `content/posts/image-seo.md:507` — same v3-no-modules form
  - `content/posts/shopify-sales.md:493` — same v3-no-modules form
- Content script-like lines that must NOT be touched:
  - `content/posts/expets-sirv-optimization.md:44` — `script.src = 'https://scripts.sirv.com/sirvjs/v3/sirv.js'` — this is JavaScript **inside a displayed code example**, not a live tag.
  - `content/posts/image-personalization.md:372-373` — botui scripts from `sirv.com/wp-content/...` — unrelated third-party embeds for that article's demo; leave them.
  - `content/posts/image-seo.md:431` — `<pre class="prettyprint"><script src="https://scripts.sirv.com/sirv.js"></script></pre>` — this is *meant* to be a displayed sample but is unescaped (Step 4 escapes it; do not delete it).

Repo convention: layouts place the Sirv script tag at the very end of the template, after the closing `</style>` (see `layouts/partials/home.html:610-611`).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 (two known deprecation WARNs are fine) |
| Occurrence census | `grep -rn 'scripts.sirv.com' layouts/ content/` | matches only the expected set for the current step |

Local `public/` accumulates stale pages from old builds — always `rm -rf public` first.

## Scope

**In scope**:
- `layouts/posts/single.html`, `layouts/partials/home.html`, `layouts/projects/list.html`, `layouts/projects/single.html`
- The 14 content lines listed under "live script tags to REMOVE"
- `content/posts/image-seo.md:431` (escape only)

**Out of scope** (do NOT touch):
- `content/posts/expets-sirv-optimization.md:44` and `content/posts/image-personalization.md:372-373` (see above)
- Image markup (`<img>` tags, `data-src`, query params) — that's plan 004
- `layouts/_default/baseof.html` (preconnects are plan 005)

## Git workflow

- Branch: `advisor/003-sirvjs-loading`
- Commit style: imperative sentence case (e.g. `Load Sirv.js once per layout, deferred`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Confirm the advanced-Sirv usage census

```bash
grep -rln 'data-type="zoom"\|data-options' content/ layouts/
```

**Verify**: matches are confined to `content/posts/shopify-sales.md`, `content/posts/image-seo.md`, and `content/posts/expets-sirv-optimization.md`. These posts embed Sirv Media Viewer zoom galleries, which is WHY the layouts must load the **full** `sirv.js` build (no `?modules=lazyimage` restriction) — the module-restricted build would break their zoom viewers. If matches appear in `content/projects/` or in layouts, note them in your report (the full build covers them anyway) but do not stop.

### Step 2: Replace the three existing layout script tags with the full deferred build

In each of `layouts/partials/home.html:611`, `layouts/projects/list.html:386`, `layouts/projects/single.html:340`, change:

```html
<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js?modules=lazyimage"></script>
```
to:
```html
<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js" defer></script>
```

(Full build, matching what post pages successfully load today; preserve each file's existing leading indentation.)

**Deliberate decision — no `integrity` attribute on this tag**: Subresource Integrity is only safe on versioned, immutable URLs (the cdnjs links in `baseof.html` correctly carry `sha512` hashes). `scripts.sirv.com/sirvjs/v3/sirv.js` is a mutable vendor endpoint that Sirv updates in place; an SRI hash would silently break every image on the site the next time Sirv releases. Do not add one. (Self-hosting a pinned copy is the alternative — see Maintenance notes.)

**Verify**: `grep -rn 'sirvjs/v3/sirv.js" defer' layouts/ | wc -l` → `3`; `grep -rc 'modules=lazyimage' layouts/` → 0 in every layout.

### Step 3: Add the deferred loader to the posts layout

In `layouts/posts/single.html`, immediately after the closing `</style>` (currently line 275), add on its own line:

```html
  <script src="https://scripts.sirv.com/sirvjs/v3/sirv.js" defer></script>
```

**Verify**: `grep -c 'sirvjs/v3/sirv.js" defer' layouts/posts/single.html` → `1`.

### Step 4: Escape the code sample in image-seo.md

In `content/posts/image-seo.md` line 431, change:

```html
<pre class="prettyprint"><script src="https://scripts.sirv.com/sirv.js"></script></pre>
```
to:
```html
<pre class="prettyprint">&lt;script src="https://scripts.sirv.com/sirv.js"&gt;&lt;/script&gt;</pre>
```

**Verify**: `grep -c '&lt;script src="https://scripts.sirv.com/sirv.js"&gt;' content/posts/image-seo.md` → `1`.

### Step 5: Remove the 14 live script tags from content

Delete the single `<script src="https://scripts.sirv.com/...sirv.js..."></script>` line at each location listed in "Current state" (10 project files, 4 post files). Delete only that line in each file.

**Verify**:
```bash
grep -rln '<script src="https://scripts.sirv.com' content/
```
→ **no output** (the remaining `scripts.sirv.com` mentions in content are the escaped sample and the JS-example line, neither of which starts a live `<script src=` tag).

### Step 6: Build and verify per-page script counts

**Minification note**: `hugo --minify` strips attribute quotes in rendered HTML (`class=Sirv`, `src=https://... defer`) — never grep built output for quoted attributes.

```bash
rm -rf public && hugo --gc --minify
for p in public/index.html public/projects/index.html public/projects/budjet/index.html public/posts/image-seo/index.html public/posts/shopify-sales/index.html; do
  echo "$p: count=$(grep -c 'scripts.sirv.com/sirvjs/v3/sirv.js' $p) tag=$(grep -oE '<script[^>]*sirvjs/v3/sirv\.js[^>]*>' $p | head -1)"
done
```

**Verify**: every listed page reports `count=1` and the extracted tag contains `defer`. Also confirm images still carry their lazy markers: `grep -o 'class=["]\?Sirv' public/posts/image-seo/index.html | wc -l` → ≥ 10 (matches both quoted and minified-unquoted forms; verified 21 at review time).

### Step 7: Runtime smoke test (if a browser tool is available)

If you can run a browser (e.g. a Playwright-based skill): `hugo server` and load `http://localhost:1313/posts/image-seo/`, scroll to the bottom, and confirm images become visible (Sirv.js swapped `data-src`). If no browser tooling is available, skip this step and note it in your report — the grep gates in Step 6 plus Sirv.js's documented defer-compatibility (it initializes on DOMContentLoaded) cover the change.

## Test plan

No test suite exists. The gates are the greps in Steps 1–6; Step 6 is the regression gate proving every page class that shows Sirv images loads the script exactly once.

## Done criteria

ALL must hold:

- [ ] `grep -rn 'sirvjs/v3/sirv.js" defer' layouts/ | wc -l` → 4 (home, projects list, projects single, posts single); no `modules=lazyimage` remains anywhere in layouts/
- [ ] `grep -rln '<script src="https://scripts.sirv.com' content/` → no output
- [ ] `grep -c '&lt;script' content/posts/image-seo.md` → 1
- [ ] Clean build exits 0; every page sampled in Step 6 contains exactly one Sirv.js tag (minify-robust patterns per Step 6) and that tag carries `defer`
- [ ] `content/posts/expets-sirv-optimization.md:44` region and `image-personalization.md:372-373` are untouched (`git diff` shows no changes at those lines)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 finds `data-type="zoom"` / `data-options` usage in files OTHER than the three named posts AND you believe it changes the approach (the full build should cover any such usage — note-and-continue is the default; stop only if something contradicts the full-build assumption, e.g. a page loading a pinned older Sirv version deliberately).
- Any file's actual content at the listed line numbers doesn't match the excerpts (content has drifted — recount before deleting anything).
- After Step 6 any sampled page reports 0 or ≥2 script tags.
- You find yourself editing an `<img>` tag — that is plan 004's scope.

## Maintenance notes

- New posts and projects now need **no** script tag — the layout provides it. If a future content type (new section) uses Sirv images, its layout must load the script once, deferred; copy the tag from `layouts/posts/single.html`.
- If supply-chain exposure from the mutable Sirv.js endpoint ever becomes a concern, the correct mitigation is self-hosting a pinned copy under `static/js/` (re-vendored deliberately on upgrades) — NOT adding an SRI hash to the live endpoint, which breaks on every vendor update.
- Plan 004 (image optimization) edits `<img>` markup in these same layouts/content files — execute it after this plan to avoid conflicts.
- Reviewer should scrutinize: the content diffs are pure single-line deletions (plus the one escape edit), nothing else.
