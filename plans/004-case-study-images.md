# Plan 004: Fix image delivery on the Sirv Studio case study and the project grids (lazy-loading, dimensions, no double-fetch)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- layouts/partials/home.html layouts/projects/ content/projects/sirv-studio.md static/images/studio/`
> If any in-scope file changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition. (Plan 003 legitimately changes the
> Sirv `<script>` lines in these files — that specific drift is expected.)

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/003-sirvjs-loading.md (touches the same files; execute 003 first)
- **Category**: perf
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

The Sirv Studio case study is the page the homepage CTA funnels visitors to, and it has the worst image delivery on the site. Its screenshots are **local** files in `static/images/studio/` (~700 KB total), but the templates treat every image as if it were Sirv-CDN-hosted: they append Sirv query params (`?w=600`, `?q=10`) that static file serving ignores. Concretely: the project page's "blur-up placeholder" `src="{{ image }}?q=10"` is a no-op on a local file, so the browser downloads the full 133 KB hero as the "placeholder" and then Sirv.js downloads it **again** via `data-src`. The four in-article screenshots are plain markdown images — no lazy-loading, no width/height, so the article reflows (CLS) as each one loads. The homepage and projects-list thumbnails eager-load with no placeholder at all. The 140 KB OG PNG is also over-size for a social card.

After this plan: templates distinguish local images from Sirv-hosted ones; local images get native `loading="lazy"` + explicit dimensions; the double-fetch is gone; Sirv-hosted images keep their existing CDN treatment.

## Current state

Verified image dimensions (from `identify`, 2026-07-03):

| File | Dimensions | Size |
|------|-----------|------|
| static/images/studio/studio-products.webp | 1345×1343 | 116 KB |
| static/images/studio/studio-assets-grid.webp | 1350×1338 | 135 KB |
| static/images/studio/studio-review-queue.webp | 1600×945 | 86 KB |
| static/images/studio/studio-vibeq.webp | 1340×1314 | 87 KB |
| static/images/studio/studio-create-prompt.webp | 1342×1336 | 134 KB |
| static/images/studio/sirv-studio-og.png | 1200×630 | 140 KB |

Template excerpts as they exist today:

- `layouts/projects/single.html:85-93` (the hero; `$.Params.image` may be local or remote):
  ```html
  <div class="project-image">
    {{ with $.Params.project_url }}
    <a href="{{ . }}" target="_blank">
      <img class="Sirv" data-src="{{ $.Params.image }}" src="{{ $.Params.image }}?q=10" alt="{{ $.Title }} screenshot"/>
    </a>
    {{ else }}
    <img class="Sirv" data-src="{{ $.Params.image }}" src="{{ $.Params.image }}?q=10" alt="{{ $.Title }} screenshot"/>
    {{ end }}
  </div>
  ```
- `layouts/partials/home.html:75-79` (homepage featured grid):
  ```html
  {{ with .Params.image }}
  <div class="project-thumbnail">
    <img class="Sirv" src="{{ . }}?w=600"  alt="{{ $.Title }} thumbnail"/>
  </div>
  {{ end }}
  ```
- `layouts/projects/list.html:13-15` (hero card) and `:43-46` (grid) use the same pattern with `?w=900` and `?w=600` respectively.
- `content/projects/sirv-studio.md` — front matter line 8: `image: "/images/studio/studio-create-prompt.webp"`; in-article markdown images at lines 340, 358, 377, 423:
  ```
  ![Sirv AI Studio products view with per-product readiness scores](/images/studio/studio-products.webp)
  ![Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table](/images/studio/studio-assets-grid.webp)
  ![Sirv AI Studio review queue with automated checks and AI autofix](/images/studio/studio-review-queue.webp)
  ![VibeQueue dashboard showing who's working on what, the bug pipeline, and the coverage-matrix quality gate](/images/studio/studio-vibeq.webp)
  ```
  (Line numbers may have shifted by ±2 after plan 003 removed a script line at the end of the file — match by content.)
- Remote project images (e.g. `content/projects/budjet.md` front matter) point at `https://cdn.earthroulette.com/...` — that host IS Sirv-backed (it honors `?w=`/`?q=` params), so remote images must keep the existing Sirv treatment.
- The rule that distinguishes the two cases: **local images start with `/`**, remote ones start with `http`.
- `[markup.goldmark.renderer] unsafe = true` is set in `config.toml`, so raw HTML in markdown content renders fine (the site already uses `<img>` tags in posts).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 (two known deprecation WARNs are fine) |
| Image dimensions | `identify -format "%f %wx%h\n" static/images/studio/*.webp` | matches the table above |
| PNG recompress | `magick static/images/studio/sirv-studio-og.png -strip -quality 85 <out>` | smaller file, same 1200×630 |

## Scope

**In scope**:
- `layouts/projects/single.html` (hero image block only)
- `layouts/partials/home.html` (thumbnail block only)
- `layouts/projects/list.html` (hero-card and grid thumbnail blocks only)
- `content/projects/sirv-studio.md` (the four markdown image lines only)
- `static/images/studio/sirv-studio-og.png` (recompress in place)

**Out of scope** (do NOT touch):
- `<script>` tags anywhere (plan 003's territory)
- The `<style>` blocks in these layouts (plan 006's territory)
- Images in `content/posts/` — the posts-wide width/height sweep is explicitly deferred (see Maintenance notes)
- `content/projects/sirv-studio.md` prose — this page's claims are editorially locked; change only the four image lines
- `static/images/studio/*.webp` files themselves (no re-encoding of content screenshots)

## Git workflow

- Branch: `advisor/004-case-study-images`
- Commit style: imperative sentence case (e.g. `Lazy-load local case-study images with explicit dimensions`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Make the project-page hero handle local vs Sirv images

In `layouts/projects/single.html`, replace the two `<img class="Sirv" data-src=...>` lines (inside and outside the `<a>`) so the block becomes:

```html
<div class="project-image">
  {{ $img := $.Params.image }}
  {{ with $.Params.project_url }}
  <a href="{{ . }}" target="_blank" rel="noopener noreferrer">
    {{ if hasPrefix $img "/" }}
    <img src="{{ $img }}" alt="{{ $.Title }} screenshot" decoding="async"/>
    {{ else }}
    <img class="Sirv" data-src="{{ $img }}" src="{{ $img }}?q=10" alt="{{ $.Title }} screenshot"/>
    {{ end }}
  </a>
  {{ else }}
  {{ if hasPrefix $img "/" }}
  <img src="{{ $img }}" alt="{{ $.Title }} screenshot" decoding="async"/>
  {{ else }}
  <img class="Sirv" data-src="{{ $img }}" src="{{ $img }}?q=10" alt="{{ $.Title }} screenshot"/>
  {{ end }}
  {{ end }}
</div>
```

Notes: the hero is the page's LCP candidate — local heroes load **eagerly** (no `loading="lazy"`), and the fake `?q=10` placeholder + double-fetch disappears. The `rel="noopener noreferrer"` addition matches the convention already used in content (e.g. `content/posts/image-seo.md` external links).

**Verify**: `rm -rf public && hugo --gc --minify` exits 0, then:
- `grep -c 'studio-create-prompt.webp?q=10' public/projects/sirv-studio/index.html` → `0`
- `grep -c 'data-src' public/projects/budjet/index.html` → ≥ 1 (remote images keep Sirv treatment)

### Step 2: Same split for the homepage grid thumbnails

In `layouts/partials/home.html:75-79`, replace the thumbnail `<img>` so the block becomes:

```html
{{ with .Params.image }}
<div class="project-thumbnail">
  {{ if hasPrefix . "/" }}
  <img src="{{ . }}" alt="{{ $.Title }} thumbnail" loading="lazy" decoding="async"/>
  {{ else }}
  <img class="Sirv" data-src="{{ . }}?w=600" src="{{ . }}?w=600&q=10" alt="{{ $.Title }} thumbnail"/>
  {{ end }}
</div>
{{ end }}
```

(This also brings the grid in line with the site's documented lazy pattern — previously these were eager `src=?w=600` with no placeholder.)

**Verify** (note: `hugo --minify` strips attribute quotes in rendered HTML — grep `loading=.lazy`, never `loading="lazy"`): after rebuild, `grep -c 'loading=.lazy' public/index.html` → ≥ 1 if any featured project uses a local image; `grep -c '?w=600&amp;q=10\|?w=600&q=10' public/index.html` → ≥ 1 for the remote-image cards.

### Step 3: Same split for the projects-list hero card and grid

In `layouts/projects/list.html`, apply the identical `hasPrefix . "/"` split to:
- the hero-card image (line ~14, currently `<img class="Sirv" src="{{ .Params.image }}?w=900" alt="{{ .Title }} screenshot"/>`) — local branch: `<img src="{{ .Params.image }}" alt="{{ .Title }} screenshot" decoding="async"/>` (eager: it's the page's top element); remote branch: `<img class="Sirv" data-src="{{ .Params.image }}?w=900" src="{{ .Params.image }}?w=900&q=10" alt="{{ .Title }} screenshot"/>`
- the grid thumbnail (line ~45, `?w=600`) — same shape as Step 2 (lazy).

**Verify**: rebuild; `grep -c '.webp?w=900' public/projects/index.html` → `0` (the local sirv-studio hero no longer gets a no-op param).

### Step 4: Give the four case-study screenshots dimensions and lazy-loading

In `content/projects/sirv-studio.md`, replace each of the four markdown image lines with an HTML `<img>` carrying the verified dimensions (keep the alt text **exactly** as it is):

```html
<img src="/images/studio/studio-products.webp" alt="Sirv AI Studio products view with per-product readiness scores" width="1345" height="1343" loading="lazy" decoding="async"/>
<img src="/images/studio/studio-assets-grid.webp" alt="Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table" width="1350" height="1338" loading="lazy" decoding="async"/>
<img src="/images/studio/studio-review-queue.webp" alt="Sirv AI Studio review queue with automated checks and AI autofix" width="1600" height="945" loading="lazy" decoding="async"/>
<img src="/images/studio/studio-vibeq.webp" alt="VibeQueue dashboard showing who's working on what, the bug pipeline, and the coverage-matrix quality gate" width="1340" height="1314" loading="lazy" decoding="async"/>
```

First confirm the dimensions still match reality: `identify -format "%f %wx%h\n" static/images/studio/*.webp` against the table in Current state; if any differ, use the `identify` output.

**Verify**: rebuild; `grep -oc 'loading=.lazy' public/projects/sirv-studio/index.html` → ≥ 4 (minify-robust pattern); the images render at their natural place in the article (check `grep -c 'studio-products.webp' public/projects/sirv-studio/index.html` → 1).

### Step 5: Recompress the OG PNG

```bash
magick static/images/studio/sirv-studio-og.png -strip png:static/images/studio/sirv-studio-og.png
identify -format "%f %wx%h %B bytes\n" static/images/studio/sirv-studio-og.png
```

If `-strip` alone doesn't get it under ~110 KB, try palette reduction: `magick static/images/studio/sirv-studio-og.png -strip -colors 255 png:...`. **Inspect the result visually** (open the file) — it's a designed social card; if palette reduction visibly bands the gradients, keep the larger file and note it. Must stay 1200×630 PNG (the front matter `ogImage` URL references `.png`).

**Verify**: `identify` reports 1200×630; file is smaller than 140175 bytes (or you've documented why you kept it).

## Test plan

No test suite. Gates: the per-step greps above, plus a final sweep — `rm -rf public && hugo --gc --minify` and confirm `grep -rc 'webp?q=10\|webp?w=600\|webp?w=900' public/projects/index.html public/projects/sirv-studio/index.html public/index.html` → 0 total (no Sirv params on any local .webp anywhere).

## Done criteria

ALL must hold:

- [ ] Clean build exits 0
- [ ] No local (leading-`/`) image URL in rendered HTML carries `?q=` or `?w=` params (sweep grep above → 0)
- [ ] `public/projects/sirv-studio/index.html` has ≥4 `loading=.lazy` matches and width/height attributes on those images
- [ ] Remote-image project pages (e.g. budjet) still render Sirv markup (`grep -oc 'class=.Sirv' public/projects/budjet/index.html` ≥ 1 and `data-src` present)
- [ ] `sirv-studio-og.png` still 1200×630
- [ ] Alt texts byte-identical to the originals (`git diff content/projects/sirv-studio.md` shows only the image-tag structure changed)
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- Any project front matter `image:` value starts with something other than `/` or `http` (the two-case split would mis-handle it).
- The four markdown image lines in `sirv-studio.md` don't match the excerpts (content drifted — realign by alt text before editing).
- After Step 1, `public/projects/budjet/index.html` loses its `data-src` markup (the remote branch broke).
- You are tempted to edit prose in `sirv-studio.md` — the page's claims are editorially locked.

## Maintenance notes

- **Deferred**: the width/height sweep across `content/posts/` (69 `<img>` tags, only 8 have width) — same technique as Step 4, but it's a long hand-edit across old articles with Sirv-hosted images whose dimensions must be fetched; do it as its own task if post-page CLS matters.
- **Deferred**: uploading the studio screenshots to the Sirv account (would restore CDN resizing/format negotiation for them); needs operator's Sirv credentials. If that happens, the front matter `image:` becomes an `https://...sirv.com` URL and the templates' remote branch takes over automatically — that's why the template split keys on the URL shape, not on the specific page.
- Plan 006 (CSS consolidation) touches the `<style>` blocks in these same layouts — run it after this plan.
- Reviewer should scrutinize: the alt texts and the `hasPrefix` conditionals (a typo there silently breaks one branch for every project page).
