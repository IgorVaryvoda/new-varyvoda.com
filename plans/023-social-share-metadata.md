# Plan 023: Emit correct social share metadata from the base template

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT touch `plans/` — the dispatching
> reviewer maintains the index (your worktree's copy predates this plan
> anyway).
>
> **Drift check (run first)**: `git diff --stat 186db1d..HEAD -- layouts/_default/baseof.html`
> If the file changed since this plan was written, compare the "Current
> state" excerpt against the live code before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: seo (metadata correctness)
- **Planned at**: commit `186db1d`, 2026-07-20
- **Scrutiny notes** (sol, 2026-07-20): all four issues folded in — occurrence
  counts instead of line counts, reviewer-owned index + diff-tree scope check,
  strict ≤160/single-line python gate, and the 0.161 `get-page-images`
  `*feature*/*cover*/*thumbnail*` selectors documented with a site-wide
  duplicate sweep. "Drop the internal opengraph template" was declined:
  it still supplies og:title/url/type/article:* correctly; the sweep is the
  regression detector.

## Why this matters

Every page on www.varyvoda.com currently ships `<meta name="twitter:card" content="summary">` with **no** `twitter:image`, because the site relies on Hugo's internal `_internal/twitter_cards.html` template, which only emits a `summary_large_image` card when `.Params.images` is set — and no page or site config on this site sets `images`. The hand-set `ogImage` front matter on two posts and one project never reaches the Twitter card. Result: every share on X renders as a small text-only card, and the crafted OG images are wasted there. Separately, the meta-description fallback pastes the raw untruncated page `.Summary` (first ~70 words, embedded newlines included) into `<meta name="description">`, and the homepage `<title>` is the bare site title with no positioning. This plan makes the base template emit an explicit, version-stable social metadata block. It deliberately changes **templates only** — copy/config-string changes are a separate plan (025).

## Current state

- `layouts/_default/baseof.html` — the only base template (overrides the hugo-coder theme); the whole `<head>` lives here. Lines 8–19 today:

```html
    {{ with .Site.Params.author }}<meta name="author" content="{{ . }}">{{ end }}
    <meta name="description" content="{{ if .Description }}{{ .Description }}{{ else if .Summary }}{{ .Summary | plainify }}{{ else }}{{ .Site.Params.description }}{{ end }}">
    <meta name="keywords" content="{{ (delimit .Keywords ',') | default .Site.Params.keywords }}">
    <link rel="canonical" href="{{ with .Params.canonicalUrl }}{{ . }}{{ else }}{{ $.Permalink }}{{ end }}">
    {{ if .Params.ogImage }}
      <meta property="og:image" content="{{ .Params.ogImage }}">
    {{ else }}
      <meta property="og:image" content="https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900">
    {{ end }}
    {{ template "_internal/twitter_cards.html" . }}
    {{ template "_internal/opengraph.html" . }}
    <title>{{ block "title" . }}{{ .Site.Title }}{{ end }}</title>
```

- Verified facts at the planned commit (do not re-derive, but STOP if a
  verification below contradicts them):
  - No content file and no site config sets `images`, so
    `_internal/opengraph.html` emits **no** `og:image` today — the only
    `og:image` comes from the explicit block above. `_internal/twitter_cards.html`
    emits `twitter:card = summary` and no image.
  - Pages with `ogImage` front matter: `content/posts/two-theories-of-a-programmer.md`,
    `content/posts/expets-sirv-optimization.md`, `content/projects/sirv-studio.md`.
  - `config.toml` has `[params] info = "Products, systems, writing"` and
    `description = "Sensible marketing blog by Igor Varyvoda."` (strings change
    in plan 025, not here).
  - The `<meta name="keywords">` tag is ignored by every major search engine;
    this plan deletes the tag. Its config key is removed later by plan 025.
- Repo conventions: templates are plain Go templates with 4-space indent
  inside `<head>`; production builds run Hugo 0.145.0 (Cloudflare Pages, no
  minify), CI runs 0.161.1, local is 0.163.3 — every template function used
  must exist in 0.145.0 (all functions in this plan do: `plainify`,
  `truncate`, `replaceRE`, `strings.TrimSpace`, `default`).
- Expected build noise: two deprecation WARNs (`languageCode`,
  `.Site.Languages`) appear on every build. They are not errors.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `rm -rf public && hugo --gc --minify` | exit 0 (2 known WARNs allowed) |
| Full gate | `make quality-gate` | exit 0 (`./bin/htmltest` is present in the worktree) |
| Inspect head | `grep -o '<meta[^>]*twitter[^>]*>' public/index.html` | see per-step expectations |

`bin/` is gitignored, so a fresh worktree may lack `./bin/htmltest`. In that
case run the gate with the main checkout's binary:
`make quality-gate HTMLTEST=/home/igor/Projects/new-varyvoda.com/bin/htmltest`.
Only if neither that path nor a PATH `htmltest` exists: run the build alone
and record the skip in your NOTES — do not download anything.

Zero-match expectation note: `grep -c` exits 1 when the count is 0 even
though 0 is the desired result; absence checks below use `! grep -q ...`
(exit 0 on absence) — use them exactly as given.

## Scope

**In scope** (the only file you may modify):
- `layouts/_default/baseof.html`

**Out of scope** (do NOT touch, even though they look related):
- `config.toml` — string/config changes belong to plans 024/025.
- Any file under `content/` — descriptions are written in plan 025.
- `layouts/posts/single.html`, `layouts/partials/home.html` — structured
  data belongs to plan 026.
- The CSS/JS blocks in `baseof.html` (lines 21–92) — leave untouched.

## Git workflow

- You are already on a dedicated branch in a dedicated worktree; do not create branches.
- One commit for the whole change; message style matches repo history: a
  single short imperative sentence (e.g. "Hint that the sun and moon are the
  theme toggle"). Suggested: `Ship real social share cards from the head`.
- Do NOT push.

## Steps

### Step 1: Compute one meta description, truncating only the Summary fallback

In `layouts/_default/baseof.html`, replace the single `<meta name="description">`
line (line 9) with a computed variable plus the meta tag, and delete the
`<meta name="keywords">` line (line 10) entirely:

```html
    {{ $metaDescription := .Site.Params.description }}
    {{ if .Description }}
      {{ $metaDescription = .Description }}
    {{ else if .Summary }}
      {{ $metaDescription = .Summary | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace | truncate 160 }}
    {{ end }}
    {{ $metaDescription = strings.TrimSpace (replaceRE `\s+` " " $metaDescription) }}
    <meta name="description" content="{{ $metaDescription }}">
```

Hand-written `description:` front matter passes through untruncated by design;
only the automatic Summary fallback is clipped. The backtick-quoted `` `\s+` ``
regex is required (double quotes would make `\s` an invalid Go escape).
Two tokens in the Summary branch are load-bearing:

- `htmlUnescape`: `plainify` strips tags but leaves goldmark's typographer
  entities (`&rsquo;` etc.) as literal 7-char text — without the unescape
  they render double-escaped (`&amp;rsquo;`) in the attribute (visible junk
  in SERP snippets) and break the 160-char accounting.
- **`truncate` must run LAST, after `strings.TrimSpace`**, so it operates on
  the final normalized plain text. Note Hugo's `truncate N` is word-aware
  and can OVERSHOOT N by a few characters (measured: it may complete the
  word at the cut point before appending the ellipsis — `truncate 159` on
  prose produced 162). The verification gate below therefore allows ≤175:
  its purpose is to prove the raw ~400-char Summary dump is gone, not to
  enforce an exact display width.

**Verify**: `rm -rf public && hugo --gc --minify` → exit 0, then:

```bash
python3 - <<'EOF'
import re, sys, html
h = open('public/about/index.html', encoding='utf-8').read()
m = re.search(r'<meta name="?description"? content="([^"]*)"', h)
assert m, "no description meta found"
v = html.unescape(m.group(1))
assert len(v) <= 175, f"too long: {len(v)}"   # truncate 160 + word-completion overshoot
assert '\n' not in v and '\r' not in v, "contains newline"
assert '&rsquo;' not in v and '&amp;' not in v, "double-escaped entities leaked"
print("OK", len(v), repr(v))
EOF
```

→ prints `OK` with the full single-line value (the About page has no
hand-written description yet, so this exercises the truncated Summary
fallback; hand-written descriptions elsewhere may legitimately exceed 160).
`! grep -q 'name=.\?keywords' public/index.html` → exit 0 (keywords meta gone).

### Step 2: Replace the internal twitter_cards template with an explicit block

Replace the six-line `og:image` if/else block **and** the
`{{ template "_internal/twitter_cards.html" . }}` line with:

```html
    {{ $ogImage := .Params.ogImage | default "https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900" }}
    <meta property="og:image" content="{{ $ogImage }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{{ $ogImage }}">
    <meta name="twitter:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }}{{ end }}">
    <meta name="twitter:description" content="{{ $metaDescription }}">
```

Keep `{{ template "_internal/opengraph.html" . }}` exactly where it is — it
supplies `og:title`, `og:description`, `og:url`, `og:type`, and the
`article:*` tags, and (verified) emits no `og:image` on this site.

Note on verification: the build is minified, so a whole page is ONE line —
`grep -c` counts lines and would report `1` even for duplicated tags. Every
count below therefore uses `grep -o ... | wc -l` (occurrences), never `grep -c`.

**Verify**: `rm -rf public && hugo --gc --minify`, then all of:
- `grep -o 'twitter:card[^>]*' public/index.html` → exactly ONE match, and it
  contains `summary_large_image`
- `grep -o 'content="\?summary"\?[ />]' public/index.html | wc -l` → `0`
  (no leftover plain-`summary` card from the internal template)
- `grep -o 'twitter:image' public/index.html | wc -l` → `1`
- `grep -o 'og:image' public/posts/two-theories-of-a-programmer/index.html | wc -l` → `1`
- `grep -o '<meta[^>]*twitter:image[^>]*>' public/posts/two-theories-of-a-programmer/index.html` → contains `sirv-studio-og.png`
- `grep -o '<meta[^>]*twitter:image[^>]*>' public/posts/help-ukraine/index.html` → contains `cdn.earthroulette.com/varyvoda/og.jpg`
- Site-wide duplicate sweep (no output on success):

```bash
for f in $(find public -name index.html); do
  for pat in 'og:image' 'twitter:card' 'twitter:image'; do
    n=$(grep -o "$pat" "$f" | wc -l)
    [ "$n" -le 1 ] || echo "DUP $pat x$n $f"
  done
done
```

### Step 3: Give the homepage title its positioning suffix

Change the `<title>` line to:

```html
    <title>{{ block "title" . }}{{ if .IsHome }}{{ .Site.Title }} — {{ .Site.Params.info }}{{ else }}{{ .Site.Title }}{{ end }}{{ end }}</title>
```

Templates that `define "title"` (posts, projects, lists) are unaffected; only
pages falling through to the default block (home, 404) change, and 404 is not
home so it keeps the bare site title.

**Verify**: `rm -rf public && hugo --gc --minify`, then
`grep -o '<title>[^<]*' public/index.html` → `<title>Igor Varyvoda&#39;s Website — Products, systems, writing` (entity-encoding of the apostrophe may vary; the em-dash suffix must be present) and
`grep -o '<title>[^<]*' public/posts/image-seo-2026/index.html` → unchanged post title ending in `· Igor Varyvoda&#39;s Website`.

## Test plan

This repo has no unit tests; the automated gate is the build plus htmltest:

- `make quality-gate` → exit 0 (build + `./bin/htmltest -c .htmltest.yml`).
- The grep assertions in each step above are the regression checks; run all
  of them once more after the final commit.

## Done criteria

Machine-checkable. ALL must hold (after `rm -rf public && hugo --gc --minify`):

- [ ] Build exits 0
- [ ] `grep -o 'twitter:card[^>]*' public/index.html` → exactly one match containing `summary_large_image`
- [ ] `grep -o 'twitter:image' public/index.html | wc -l` → 1
- [ ] `grep -o 'og:image' public/posts/two-theories-of-a-programmer/index.html | wc -l` → 1
- [ ] The Step 2 site-wide duplicate sweep prints nothing
- [ ] `! grep -q 'name=.\?keywords' public/index.html` → exit 0
- [ ] `grep -o '<title>[^<]*' public/index.html` contains `Products, systems, writing`
- [ ] Step 1 python check prints `OK` (About description ≤ 175 chars, single line, no double-escaped entities)
- [ ] `make quality-gate` exits 0 (or skip recorded in NOTES if htmltest absent)
- [ ] After the final commit the worktree is clean (`git status --porcelain` empty) and `git diff-tree --no-commit-id --name-only -r HEAD` lists exactly `layouts/_default/baseof.html`

## STOP conditions

Stop and report back (do not improvise) if:

- The "Current state" excerpt does not match `layouts/_default/baseof.html`.
- After Step 2, any rendered page contains **two** `og:image` metas (means
  the internal opengraph template started emitting one — the local Hugo
  version behaves differently than verified; removing the internal template
  is a design decision the reviewer must make).
- The build errors on `strings.TrimSpace`, `replaceRE`, or the backtick
  regex literal.
- Any fix appears to require editing a file outside the in-scope list.

## Maintenance notes

- Plan 025 changes `title` and `params.description` strings in `config.toml`;
  after it lands, the home title becomes "Igor Varyvoda — Products, systems,
  writing" with no other edit here.
- If a future page ever sets `images` in front matter — or becomes a page
  *bundle* containing an image resource whose name matches `*feature*`,
  `*cover*`, or `*thumbnail*` (Hugo ≥ 0.161's internal `get-page-images`
  helper auto-selects those) — the internal opengraph template will start
  emitting a second `og:image`; at that point drop the internal template in
  favor of this explicit block. The duplicate sweep in Step 2 is the
  regression detector.
- Reviewer: eyeball one share preview (X card validator or
  metatags.io) after deploy — executors are browser-free and cannot.
