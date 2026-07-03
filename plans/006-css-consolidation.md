# Plan 006: Extract the duplicated component CSS (breadcrumbs, project cards, badges) into one fingerprinted stylesheet

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- layouts/`
> Plans 003/004/005 legitimately changed script tags, img markup, and icon
> markup in these files. Diff the `<style>` blocks specifically; if the CSS
> rules named below moved or changed, STOP and re-map before extracting.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: MED (visual regressions possible; the duplicated copies have drifted, so consolidation necessarily changes some pages slightly)
- **Depends on**: plans/003, 004, 005 (they edit the same layout files; extract from final markup)
- **Category**: tech-debt
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

All styling for the custom templates lives in per-file `<style>` blocks — about 1,460 lines total across six layouts — and the shared components are pasted between files. The copies have already drifted: breadcrumbs on posts use `margin-bottom: 3rem; font-size: 1.3rem` while the near-identical block on project pages uses `2rem; 1.4rem`. Project-card styles are defined independently in the homepage partial and the projects list. Every visual tweak is a multi-file lockstep edit, and nothing guards against further drift. This plan extracts the **duplicated components only** (not a full CSS refactor) into one minified, fingerprinted stylesheet loaded from `baseof.html`, and reconciles the drifted values with explicit choices.

## Current state

`<style>` block locations (line numbers at commit 438a91e; they will have shifted slightly after plans 003–005 — locate by the `<style>`/`</style>` tags):

| File | `<style>` range | ~lines |
|------|-----------------|--------|
| `layouts/partials/home.html` | 100–610 | 510 |
| `layouts/projects/list.html` | 67–385 | 318 |
| `layouts/partials/header.html` | 43–261 | 218 |
| `layouts/projects/single.html` | 131–339 | 208 |
| `layouts/posts/single.html` | 94–275 | 181 |
| `layouts/_default/baseof.html` | 88–117 | 29 (`:root` variables — the design tokens: `--font-body`, `--accent: #66d9ef`, `--accent-green`, etc.) |

Known duplications (verified by reading both copies):

1. **Breadcrumbs** — `.breadcrumbs`, `.breadcrumbs ol/li/a/a:hover/.separator/.current` defined in BOTH `layouts/posts/single.html` (~lines 100–139) and `layouts/projects/single.html` (~lines 132–171). Identical structure; drifted values:
   | property | posts | projects |
   |----------|-------|----------|
   | `.breadcrumbs margin-bottom` | 3rem | 2rem |
   | `.breadcrumbs` animation | `fadeIn 0.4s ease-out` | none |
   | `ol font-size` | 1.3rem | 1.4rem |
   | `ol color` | #666 | #888 |
   | `.separator margin` | 0 0.5rem | 0 0.75rem |
   | `.current font-weight` | 500 | (unset) |
   Shared identical rules: `a { color: #9090a0; ... padding: 0.3rem 0.5rem; border-radius: 4px; }`, `a:hover { color: #66d9ef; background: rgba(102, 217, 239, 0.06); ... }`, `.current color: #d0d0d8`.
2. **Project cards** — `.project-title`, `.project-description`, `.project-tech`, `.tech-badge`, `.project-thumbnail`, `.project-info`, `.project-link` defined independently in `layouts/partials/home.html` and `layouts/projects/list.html`. Degree of drift not fully mapped — Step 2 measures it.
3. The `@keyframes fadeIn` animation is defined in `layouts/posts/single.html` (and possibly elsewhere — check).

How the site already loads pipelined CSS — `layouts/_default/baseof.html:29-35` (production branch):

```
{{ $cssOpts := (dict "targetPath" "css/coder.css" ) }}
{{ $styles := resources.Get "scss/coder.scss" | resources.ExecuteAsTemplate "style.coder.css" . | toCSS $cssOpts | minify | fingerprint }}
<link rel="stylesheet" href="{{ $styles.RelPermalink }}" integrity="{{ $styles.Data.Integrity }}" crossorigin="anonymous" media="screen" />
```

`resources.Get` resolves from the project-root `assets/` directory first, then the theme's. The project currently has **no** root `assets/` directory — creating `assets/css/custom.css` is the intended mechanism.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 (two known deprecation WARNs are fine) |
| Duplicate census | `grep -n '\.breadcrumbs\|\.tech-badge\|\.project-thumbnail' layouts/**/*.html` | shrinks as steps land |
| Rendered check | `grep -oE 'css/custom[^" >]*\.css' public/index.html \| head -1` | one fingerprinted URL (minify-robust — `hugo --minify` strips attribute quotes) |

## Scope

**In scope**:
- Create `assets/css/custom.css`
- `layouts/_default/baseof.html` (add one stylesheet link)
- The `<style>` blocks of `layouts/posts/single.html`, `layouts/projects/single.html`, `layouts/partials/home.html`, `layouts/projects/list.html` (remove only the rules that move)

**Out of scope** (do NOT touch):
- `layouts/partials/header.html` styles (nav-specific, no duplication mapped)
- Page-specific rules that exist in only one file — leave them in their `<style>` blocks; this is a dedup, not a migration
- The theme's SCSS under `themes/hugo-coder/`
- Any HTML markup outside the `<style>` blocks (plans 003–005 own those changes)
- The `:root` design tokens in `baseof.html` — they're already in the one right place

## Git workflow

- Branch: `advisor/006-css-consolidation`
- Commit style: imperative sentence case (e.g. `Extract shared breadcrumb and card CSS into assets/css/custom.css`). One commit per component family keeps review sane.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Wire up the custom stylesheet

Create `assets/css/custom.css` containing only a comment header (`/* Shared component styles extracted from per-layout style blocks */`). In `layouts/_default/baseof.html`, after the existing coder-css pipeline block, add (both the `hugo.IsServer` and production branches follow the theme's existing pattern — mirror the excerpt above):

```
{{ $custom := resources.Get "css/custom.css" | minify | fingerprint }}
<link rel="stylesheet" href="{{ $custom.RelPermalink }}" integrity="{{ $custom.Data.Integrity }}" crossorigin="anonymous" media="screen" />
```

**Verify**: `rm -rf public && hugo --gc --minify` exits 0; `grep -oE 'css/custom[^" >]*\.css' public/index.html | head -1` → one fingerprinted path (minify-robust pattern); the file exists under `public/css/`.

### Step 2: Map the real project-card drift

Extract the `.project-*` / `.tech-badge` rule sets from `layouts/partials/home.html` and `layouts/projects/list.html` into two scratch files and diff them.

**Verify**: you have a written list (goes in your final report) of which properties differ. If the two copies differ on more than ~10 properties, STOP — the "duplication" may actually be two intentionally different designs, and merging them would redesign one of the pages.

### Step 3: Move the breadcrumbs component

Add to `assets/css/custom.css` one canonical breadcrumbs block. **Explicit reconciliation decisions** (chosen for consistency; posts values win where they drifted, since posts are the higher-traffic template):

```css
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}
.breadcrumbs { margin-bottom: 2.5rem; animation: fadeIn 0.4s ease-out; }
.breadcrumbs ol { list-style: none; padding: 0; margin: 0; display: flex; align-items: center; font-size: 1.3rem; color: #888; }
.breadcrumbs li { display: inline; }
.breadcrumbs a { color: #9090a0; text-decoration: none; transition: all 0.2s ease; padding: 0.3rem 0.5rem; border-radius: 4px; }
.breadcrumbs a:hover { color: #66d9ef; background: rgba(102, 217, 239, 0.06); text-decoration: none; }
.breadcrumbs .separator { margin: 0 0.5rem; color: #4a4a5a; }
.breadcrumbs .current { color: #d0d0d8; font-weight: 500; }
```

(`margin-bottom: 2.5rem` deliberately splits the 2rem/3rem drift; everything else takes the posts values.) Then delete the breadcrumb rules (and the now-moved `@keyframes fadeIn`, if nothing else in that file uses it) from BOTH `layouts/posts/single.html` and `layouts/projects/single.html` style blocks.

**Verify**: rebuild; `grep -c '\.breadcrumbs' public/css/custom.*.css` → ≥ 7 (minified file — grep the pattern, count rules); `grep -rn '\.breadcrumbs {' layouts/` → 0 matches; breadcrumb markup still styled: `grep -c 'breadcrumbs' public/posts/image-seo/index.html` → ≥ 1.

### Step 4: Move the project-card component

Using the Step 2 diff: move the rules that are **identical** into `assets/css/custom.css` verbatim. For drifted properties, take the `layouts/partials/home.html` value (the homepage was iterated most recently per git churn) and note each choice in your report. Keep any rule that exists in only one file in that file. Delete the moved rules from both source files.

**Verify**: rebuild; `grep -rn '\.tech-badge {' layouts/` → at most 0 matches (fully moved) — and the badge still renders styled: the fingerprinted custom.css contains `.tech-badge`, and `grep -c 'tech-badge' public/index.html public/projects/index.html` → ≥ 1 each.

### Step 5: Visual spot-check

If a browser/screenshot tool is available: `hugo server`, screenshot `/`, `/projects/`, `/projects/sirv-studio/`, `/posts/image-seo/` and eyeball breadcrumbs, cards, and badges against production `https://www.varyvoda.com`. If not available, note the skip and rely on the grep gates; flag in your report that a human should eyeball those four pages before merge.

## Test plan

No test suite. The gates are the grep assertions per step plus a final full sweep:

```bash
rm -rf public && hugo --gc --minify
grep -rn '\.breadcrumbs {\|\.tech-badge {' layouts/   # → 0 matches
```

## Done criteria

ALL must hold:

- [ ] `assets/css/custom.css` exists; every page links its fingerprinted build (spot-check `public/index.html`, one post, one project page)
- [ ] Zero definitions of `.breadcrumbs` / `.tech-badge` / moved `.project-*` rules remain in `layouts/` style blocks
- [ ] Clean build exits 0
- [ ] The reconciliation decisions (every drifted property and which value won) are listed in the completion report
- [ ] No markup (non-`<style>`) lines changed in any layout (`git diff` inspection)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Step 2 finds the two card implementations differ on more than ~10 properties (merging would be a redesign, not a dedup).
- `resources.Get "css/custom.css"` returns nil / the build errors (assets path mechanism differs from expectation).
- Removing a rule from a layout leaves an element visibly unstyled in the Step 5 screenshots and the fix isn't simply "the rule didn't get moved".
- You find yourself editing rules that exist in only one file — that's migration creep, out of scope.

## Maintenance notes

- New shared components should go straight into `assets/css/custom.css`; per-layout `<style>` blocks are for genuinely page-specific rules only. Consider adding this convention to CLAUDE.md when a docs pass happens.
- The remaining ~1,000 lines of page-specific inline CSS are left in place **deliberately** — inlining avoids extra requests and they aren't duplicated. Full migration was considered and rejected as risk without payoff.
- This plan slightly changes breadcrumb spacing on both posts (3rem→2.5rem) and projects (2rem→2.5rem, plus the fade-in animation) — intentional, noted here for the reviewer.
- Reviewer should scrutinize: the Step 4 drift decisions — each one is a small visual change to either the homepage or the projects list.
