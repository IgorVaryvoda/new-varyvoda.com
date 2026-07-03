# Plan 005: Drop the icon-font dependency, unblock twemoji, and preconnect the origins that matter

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- layouts/_default/baseof.html layouts/partials/home.html layouts/posts/single.html layouts/projects/single.html config.toml`
> Plans 003/004 legitimately changed script/img lines in some of these files;
> anything else that differs from the "Current state" excerpts is a STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (icons must not visually vanish; needs network access to fetch SVG sources)
- **Depends on**: none (recommended after 003/004 to avoid merge noise in the same files)
- **Category**: perf
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

Every page of this site blocks first render on the Fork Awesome icon-font stylesheet (which then pulls a woff2 font) — all to draw **eight small icons**: calendar + clock on posts, four link-button icons on project pages, and three social icons on the homepage. A twemoji script also loads render-blocking in `<head>` and then scans the entire DOM on every page, though most pages contain no emoji. Meanwhile the origins the site actually hammers — `scripts.sirv.com` (the image lazy-loader) and the image CDNs — get no preconnect, so the heaviest resources start from a cold connection. Replacing the icon font with inline SVGs removes a render-blocking request chain; `defer` on twemoji unblocks parsing with identical behavior; preconnects warm the connections that matter.

## Current state

- `layouts/_default/baseof.html:26` — the Fork Awesome stylesheet (versioned cdnjs URL with `sha512` integrity — this line gets deleted):
  ```html
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/fork-awesome/1.1.7/css/fork-awesome.min.css" integrity="sha512-..." crossorigin="anonymous" />
  ```
- `layouts/_default/baseof.html:27` — normalize.css from cdnjs. **Keep it** (the theme's SCSS may assume normalized defaults; removing it is out of scope).
- `layouts/_default/baseof.html:80` — twemoji, render-blocking in head:
  ```html
  <script src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/12.0.4/2/twemoji.min.js" integrity="sha512-..." crossorigin="anonymous"></script>
  ```
  and `baseof.html:126-127` — the body tag runs `onload='twemoji.parse(document.body)'`. (`onload` on `<body>` is the window load event, which fires **after** deferred scripts execute — so adding `defer` is safe.)
- `layouts/_default/baseof.html:85-87` — existing preconnects (Google Fonts only):
  ```html
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  ```
- Icon usage — the complete list (verified by grep; there are no others in custom layouts):
  - `layouts/posts/single.html:64` — `<i class="fa fa-calendar" aria-hidden="true"></i>`
  - `layouts/posts/single.html:70` — `<i class="fa fa-clock-o" aria-hidden="true"></i>`
  - `layouts/projects/single.html:63` — `<i class="fa fa-external-link" aria-hidden="true"></i> Visit Project`
  - `layouts/projects/single.html:68` — `<i class="fa fa-github" aria-hidden="true"></i> GitHub`
  - `layouts/projects/single.html:73` — `<i class="fa fa-apple" aria-hidden="true"></i> iOS`
  - `layouts/projects/single.html:78` — `<i class="fa fa-android" aria-hidden="true"></i> Android`
  - `layouts/partials/home.html:38` — `<i class="{{ .icon }}" aria-hidden="true"></i>` inside the social-links loop; the classes come from `config.toml` `[[params.social]]` entries: `"fa fa-twitter fa-2x"`, `"fa fa-linkedin"`, `"fa fa-github fa-2x"`. The loop also has an icon-less fallback branch that renders `{{ .name }}` as text.
  - The **vendored theme** also references `fa` classes in its own partials, but the custom layouts override every rendered template (`baseof.html`, `home.html`, `header.html`, `posts/single.html`, `projects/*`); verify at the end that no `fa fa-` class survives in rendered output.
- Origins used by rendered pages (for preconnect selection): `scripts.sirv.com` (every content page — lazy-loader), `cdnjs.cloudflare.com` (every page — normalize + twemoji), `cdn.earthroulette.com` (project thumbnails on home/list — Sirv-backed), `iantiark.sirv.com` (homepage avatar), `sirv-cdn.sirv.com` (post images).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 (two known deprecation WARNs are fine) |
| Fetch an SVG source | `curl -sf https://raw.githubusercontent.com/ForkAwesome/Fork-Awesome/1.2.0/src/icons/svg/<name>.svg` | SVG markup on stdout |
| Rendered-icon check | `grep -rn 'fa fa-' public/` | (final state) no matches |

## Scope

**In scope**:
- `layouts/_default/baseof.html` (lines 26, 80, 85-87 region)
- `layouts/posts/single.html` (the two `<i>` icons)
- `layouts/projects/single.html` (the four `<i>` icons)
- `layouts/partials/home.html` (the social-links loop)
- `layouts/partials/icons.html` (create)
- Small CSS additions to the affected `<style>` blocks for SVG sizing only

**Out of scope** (do NOT touch):
- `baseof.html:27` normalize.css — folding it into the SCSS pipeline is deferred (see Maintenance)
- `config.toml` `[[params.social]]` entries — leave the `icon` strings; the template maps by `.name`
- `enableTwemoji` setting — behavior stays on, just deferred
- The vendored theme's own templates under `themes/hugo-coder/`

## Git workflow

- Branch: `advisor/005-head-payload`
- Commit style: imperative sentence case (e.g. `Replace Fork Awesome with inline SVG icons`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Fetch the eight Fork Awesome SVG sources

Fetch each of these from `https://raw.githubusercontent.com/ForkAwesome/Fork-Awesome/1.2.0/src/icons/svg/<name>.svg`: `calendar`, `clock-o`, `external-link`, `github`, `apple`, `android`, `twitter`, `linkedin`.

**Verify**: each curl exits 0 and the response starts with `<svg` or `<?xml`. If the network is unavailable or the path 404s, STOP (do not hand-draw brand icons).

### Step 2: Create an icons partial

Create `layouts/partials/icons.html`: a partial that takes a string name and prints the matching inline SVG. Normalize each fetched SVG to: `<svg class="icon" viewBox="<original viewBox>" fill="currentColor" aria-hidden="true"><path d="..."/></svg>` (strip width/height/xmlns clutter; keep the original `viewBox` and path data byte-exact). Structure:

```
{{- $name := . -}}
{{- if eq $name "calendar" -}}
<svg class="icon" viewBox="..." fill="currentColor" aria-hidden="true"><path d="..."/></svg>
{{- else if eq $name "clock-o" -}}
...
{{- end -}}
```

**Verify**: `hugo --gc --minify` still exits 0 (unused partial parses cleanly).

### Step 3: Swap the six hard-coded icons

Replace each `<i class="fa fa-X" aria-hidden="true"></i>` in `layouts/posts/single.html` and `layouts/projects/single.html` with `{{ partial "icons.html" "X" }}` (names: `calendar`, `clock-o`, `external-link`, `github`, `apple`, `android`). Keep surrounding text/spacing identical.

**Verify**: `grep -rn 'fa fa-' layouts/posts/single.html layouts/projects/single.html` → 0 matches.

### Step 4: Swap the social icons on the homepage

In `layouts/partials/home.html:35-40`, the icon branch currently renders `<i class="{{ .icon }}" ...>`. Replace that `<i>` element with a name-based partial call: `{{ partial "icons.html" (lower .name) }}` (config names are `Twitter`, `LinkedIn`, `Github` → partial keys `twitter`, `linkedin`, `github`; add those keys in the partial if you named them differently). Keep the `{{ if .icon }}` branching and the anchor markup untouched.

**Verify**: rebuild; `grep -oc '<svg class=.icon' public/index.html` → `3` (minify-robust: `hugo --minify` strips attribute quotes in rendered HTML).

### Step 5: Add sizing CSS

The icon font sized glyphs by font-size (`fa-2x` = 2em). Add to the `<style>` block of `layouts/partials/home.html` (social icons) and reuse in posts/projects style blocks as needed:

```css
.icon { width: 1em; height: 1em; display: inline-block; vertical-align: -0.125em; }
.social-link .icon { width: 1.6em; height: 1.6em; }
```

**Verify**: rebuild, then view `public/index.html` in a browser if available; otherwise confirm the CSS is present: `grep -c '.social-link .icon' public/index.html` → 1.

### Step 6: Remove Fork Awesome, defer twemoji, add preconnects

In `layouts/_default/baseof.html`:
1. Delete line 26 (the fork-awesome `<link>`). Do NOT delete line 27 (normalize).
2. Add `defer` to the twemoji script tag (line 80): `<script src="https://cdnjs.cloudflare.com/ajax/libs/twemoji/..." integrity="sha512-..." crossorigin="anonymous" defer></script>` (keep the existing integrity attribute — it's a versioned URL, SRI is correct there).
3. After the two existing font preconnects (lines 85-87), add:
   ```html
   <link rel="preconnect" href="https://scripts.sirv.com" crossorigin>
   <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin>
   <link rel="preconnect" href="https://cdn.earthroulette.com">
   <link rel="preconnect" href="https://sirv-cdn.sirv.com">
   ```
   (Four is deliberate — browsers deprioritize excess preconnects; `iantiark.sirv.com` serves only the homepage avatar and is omitted.)

**Verify**: rebuild;
- `grep -c 'fork-awesome' public/index.html` → 0
- `grep -c 'twemoji' public/index.html` → 2 (script + onload) and the script line contains `defer`
- `grep -c 'rel=preconnect\|rel="preconnect"' public/index.html` → 6

### Step 7: Full-site icon sweep

```bash
rm -rf public && hugo --gc --minify
grep -rln 'fa fa-' public/ || echo CLEAN
```

**Verify**: prints `CLEAN`. If any page still emits `fa fa-` classes, a theme partial (not overridden by custom layouts) renders them — STOP and report which page/partial rather than chasing it into the vendored theme.

## Test plan

No test suite. Gates: the per-step greps; the Step 7 sweep is the regression gate. If a browser tool (e.g. Playwright skill) is available, screenshot the homepage and one post before/after and compare icon rendering — otherwise note the skip.

## Done criteria

ALL must hold:

- [ ] `grep -rln 'fa fa-' public/` after a clean build → no matches
- [ ] `grep -c 'fork-awesome' public/index.html` → 0; normalize.css link still present
- [ ] Twemoji script carries `defer` and its `sha512` integrity attribute
- [ ] 6 preconnects render on every page (spot-check `public/index.html` and one post)
- [ ] `<svg class=.icon` (minify-robust grep) appears on homepage (3×), a post page (2×), and a project page with links
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 1 network fetches fail — do not improvise SVG path data by hand.
- Step 7 finds `fa fa-` classes coming from a theme partial the custom layouts don't override.
- Removing the fork-awesome link visibly changes anything other than icons (it shouldn't — it only defines `.fa-*` classes — but if a layout style depended on it, report).

## Maintenance notes

- Adding a new social entry in `config.toml` now requires a matching key in `layouts/partials/icons.html` (the icon-less fallback branch renders the name as text, so nothing breaks silently — it just shows text).
- **Deferred**: self-hosting normalize.css through the SCSS pipeline (removes the last render-blocking cdnjs stylesheet); safe but needs a visual regression pass.
- **Deferred**: subsetting/self-hosting the Outfit Google Font — the current setup (preconnect + display=swap) is acceptable.
- Reviewer should scrutinize: SVG `viewBox` values (a wrong viewBox renders a clipped icon), and that `aria-hidden="true"` survived onto every SVG.
