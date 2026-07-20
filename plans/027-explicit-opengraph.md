# Plan 027: Replace the internal Open Graph template with explicit tags fed by the normalized description

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT touch `plans/` — the dispatching
> reviewer maintains the index (your worktree's copy predates this plan
> anyway).
>
> **Drift check (run first)**: your branch descends from plan 023's approved
> commit. Verify: `grep -q '_internal/opengraph.html' layouts/_default/baseof.html`
> → must SUCCEED (the internal template is still referenced), and
> `grep -q '_internal/twitter_cards.html' layouts/_default/baseof.html`
> → must FAIL (plan 023 removed it). The "Current state" excerpt below must
> match `layouts/_default/baseof.html` exactly; on mismatch, STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/023-social-share-metadata.md (branches from its
  approved commit; uses its `$metaDescription`/`$ogImage` variables)
- **Category**: seo (metadata correctness)
- **Planned at**: post-023 review, 2026-07-20 (base: plan 023's commit on
  branch `improve/023-social-share-metadata`)
- **Scrutiny notes** (sol, 2026-07-20): all three issues folded in — the
  standalone `build-record` static page (internally divergent descriptions,
  pre-existing) is excluded from the alignment gate; timestamps now use
  `.PublishDate` with `.IsZero` guards (About/Contact are undated — plain
  `with` would not skip zero time structs); the verifier now covers every
  non-redirect `*.html` including `404.html`, requires the full OG set
  exactly once per page, and fails on zero-value timestamp leaks.

## Why this matters

Plan 023 normalized the meta description and Twitter card, but kept Hugo's internal `_internal/opengraph.html` — and adversarial diff review confirmed that template is a second, divergent description source: it emits `og:description` from the raw page Summary, so the About page ships a 582-character multiline og:description containing unedited prose ("I enjoy building shit…") to Facebook/LinkedIn while the same page's meta/twitter descriptions are the clean 161-character normalized value. Replacing the internal template with explicit tags makes `$metaDescription` the single source of truth for every description surface, and makes the emitted OG set version-stable across the three Hugo versions that build this site (0.145.0 prod / 0.161.1 CI / 0.163.3 local).

## Current state

- `layouts/_default/baseof.html` — the only base template; after plan 023
  its metadata block (lines 8–26) is exactly:

```html
    {{ with .Site.Params.author }}<meta name="author" content="{{ . }}">{{ end }}
    {{ $metaDescription := .Site.Params.description }}
    {{ if .Description }}
      {{ $metaDescription = .Description }}
    {{ else if .Summary }}
      {{ $metaDescription = .Summary | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace | truncate 160 }}
    {{ end }}
    {{ $metaDescription = strings.TrimSpace (replaceRE `\s+` " " $metaDescription) }}
    <meta name="description" content="{{ $metaDescription }}">
    <link rel="canonical" href="{{ with .Params.canonicalUrl }}{{ . }}{{ else }}{{ $.Permalink }}{{ end }}">
    {{ $ogImage := .Params.ogImage | default "https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900" }}
    <meta property="og:image" content="{{ $ogImage }}">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:image" content="{{ $ogImage }}">
    <meta name="twitter:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }}{{ end }}">
    <meta name="twitter:description" content="{{ $metaDescription }}">
    {{ template "_internal/opengraph.html" . }}
    <title>{{ block "title" . }}{{ if .IsHome }}{{ .Site.Title }} — {{ .Site.Params.info }}{{ else }}{{ .Site.Title }}{{ end }}{{ end }}</title>
```

- What the internal template currently emits on this site (verified in
  rendered output — this is the set the replacement must cover):
  `og:url`, `og:site_name`, `og:title`, `og:description` (raw Summary —
  the defect), `og:locale`, `og:type` (`article` for pages / `website`
  otherwise), and for pages in a section additionally `article:section`,
  `article:published_time`, `article:modified_time`. It emits NO `og:image`
  on this site (nothing sets `images`).
- Expected build noise: two deprecation WARNs (`languageCode`,
  `.Site.Languages`); not errors.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `rm -rf public && hugo --gc --minify` | exit 0 (2 known WARNs allowed) |
| Full gate | `make quality-gate HTMLTEST=/home/igor/Projects/new-varyvoda.com/bin/htmltest` | exit 0 |

If `./bin/htmltest` exists in the worktree, plain `make quality-gate` works
too. Only if no htmltest binary exists anywhere: run the build alone and
record the skip in your NOTES — do not download anything.

## Scope

**In scope** (the only file you may modify):
- `layouts/_default/baseof.html`

**Out of scope** (do NOT touch):
- Everything else. In particular do not "improve" `$metaDescription`,
  the twitter block, the canonical line, or the title line — plan 023's
  reviewed work.

## Git workflow

- You are already on a dedicated branch in a dedicated worktree; do not create branches.
- One commit; message style: single short imperative sentence. Suggested:
  `Feed every share description from one normalized source`.
- Do NOT push.

## Steps

### Step 1: Replace the internal template reference with explicit tags

In `layouts/_default/baseof.html`, replace the single line
`{{ template "_internal/opengraph.html" . }}` with:

```html
    <meta property="og:url" content="{{ .Permalink }}">
    <meta property="og:site_name" content="{{ .Site.Title }}">
    <meta property="og:title" content="{{ if .IsHome }}{{ .Site.Title }}{{ else }}{{ .Title }}{{ end }}">
    <meta property="og:description" content="{{ $metaDescription }}">
    <meta property="og:locale" content="{{ .Site.Language.Lang }}">
    {{ if .IsPage }}
      <meta property="og:type" content="article">
      {{ with .Section }}<meta property="article:section" content="{{ . }}">{{ end }}
      {{ if not .PublishDate.IsZero }}<meta property="article:published_time" content="{{ .PublishDate.Format "2006-01-02T15:04:05Z07:00" }}">{{ end }}
      {{ if not .Lastmod.IsZero }}<meta property="article:modified_time" content="{{ .Lastmod.Format "2006-01-02T15:04:05Z07:00" }}">{{ end }}
    {{ else }}
      <meta property="og:type" content="website">
    {{ end }}
```

The `.IsZero` guards and `.PublishDate` (not `.Date`) are load-bearing:
`content/about.md` and `content/contact.md` have NO date in front matter —
the internal template omits their timestamps, and unconditional
`.Date.Format` would emit `0001-01-01T00:00:00Z` garbage instead. (`with`
is NOT a substitute: Go templates treat zero-value time structs as truthy.)

**Verify**: `rm -rf public && hugo --gc --minify` → exit 0, then:
- `! grep -q '_internal/opengraph' layouts/_default/baseof.html` → exit 0
- The full-coverage verifier — every rendered page must carry the complete
  OG set exactly once with og:description equal to the meta description.
  Excluded: redirect stubs (meta-refresh alias pages) and the standalone
  hand-authored `projects/sirv-studio/build-record/` page (copied verbatim
  from `static/`; its internally divergent descriptions are pre-existing
  and out of scope):

```bash
python3 - <<'EOF'
import re, glob, html, sys
REQUIRED = ['og:description', 'og:title', 'og:url', 'og:type',
            'og:site_name', 'og:locale']
bad = 0
checked = 0
for f in sorted(glob.glob('public/**/*.html', recursive=True)):
    h = open(f, encoding='utf-8').read()
    if 'http-equiv="refresh"' in h or 'http-equiv=refresh' in h:
        continue                       # alias/redirect stubs
    if '/build-record/' in f:
        continue                       # standalone static page, out of scope
    checked += 1
    md = re.findall(r'<meta name="?description"? content="([^"]*)"', h)
    if len(md) != 1:
        bad += 1; print(f"{f}: {len(md)} meta descriptions"); continue
    for prop in REQUIRED:
        n = len(re.findall(re.escape(prop) + r'"? content=', h))
        if n != 1:
            bad += 1; print(f"{f}: {prop} x{n}")
    og = re.search(r'property="og:description" content="([^"]*)"', h)
    if og:
        a, b = html.unescape(md[0]), html.unescape(og.group(1))
        if a != b:
            bad += 1; print(f"DIVERGENT {f} {len(a)} {len(b)}")
        if '\n' in b:
            bad += 1; print(f"MULTILINE OG {f}")
    if re.match(r'public/(posts|projects)/[^/]+/index\.html$', f):
        # single post/project pages only — NOT the section list pages
        # (public/posts/index.html, public/projects/index.html), which are
        # og:type=website and correctly carry no article timestamps
        if 'article:published_time' not in h:
            bad += 1; print(f"{f}: missing article:published_time")
    if '0001-01-01' in h:
        bad += 1; print(f"{f}: zero-value timestamp leaked")
assert checked >= 20, f"only {checked} pages checked — exclusions too broad"
print("ALL ALIGNED" if not bad else f"{bad} PROBLEMS"); sys.exit(1 if bad else 0)
EOF
```

→ `ALL ALIGNED`, exit 0. This covers `404.html` and every section/list page,
not just `index.html` leaf pages; About/Contact are checked for the full OG
set but not timestamps (they are undated by design).

### Step 2: Confirm the emitted OG set matches the old template's coverage

**Verify** (all on the fresh build from Step 1 — spot checks; the Step 1
verifier is the authoritative gate):
- `grep -o 'article:published_time' public/posts/image-seo-2026/index.html | wc -l` → `1`
- `grep -o 'og:type[^>]*' public/index.html` → contains `website`
- `grep -o 'og:type[^>]*' public/posts/image-seo-2026/index.html` → contains `article`
- `grep -o 'og:url[^>]*' public/about/index.html` → contains `https://www.varyvoda.com/about/`
- `! grep -q 'article:published_time\|article:modified_time' public/about/index.html` → exit 0
  (undated page: timestamps correctly omitted)
- `make quality-gate HTMLTEST=/home/igor/Projects/new-varyvoda.com/bin/htmltest` → exit 0

## Test plan

No unit tests in this repo; the Step 1 alignment script plus the Step 2
coverage checks and `make quality-gate` are the gates. Re-run all after the
final commit.

## Done criteria

Machine-checkable. ALL must hold (after `rm -rf public && hugo --gc --minify`):

- [ ] Build exits 0
- [ ] `! grep -q '_internal/opengraph' layouts/_default/baseof.html` → exit 0
- [ ] Step 1 full-coverage verifier prints `ALL ALIGNED`, exit 0 (≥20 pages
      checked incl. 404 and list pages; complete OG set exactly once per
      page; og:description == meta description; no multiline OG; timestamps
      on all posts/projects; no `0001-01-01` zero-value leaks)
- [ ] Step 2 spot checks all pass (article on posts, website on home,
      timestamps absent on undated About)
- [ ] Quality gate exits 0
- [ ] After the final commit the worktree is clean (`git status --porcelain`
      empty) and `git diff-tree --no-commit-id --name-only -r HEAD` lists
      exactly `layouts/_default/baseof.html`

## STOP conditions

Stop and report back (do not improvise) if:

- The "Current state" excerpt doesn't match the file (plan 023's commit is
  not your base — lane-order violation).
- Any page renders TWO `og:description` or `og:title` tags after Step 1
  (something else emits OG tags — reviewer decision needed).
- The alignment script fails on a page whose divergence you cannot explain
  by your own change.
- Any fix appears to require editing a file outside the in-scope list.

## Maintenance notes

- `$metaDescription` is now the single source for: meta description,
  twitter:description, og:description. If a fourth description surface is
  ever added, feed it from the same variable.
- og:url intentionally uses `.Permalink` even for the three posts whose
  `<link rel=canonical>` points at sirv.com — OG describes the URL being
  shared, canonical handles indexing; this matches the prior behavior.
- Reviewer: spot-check one Facebook/LinkedIn share preview after deploy
  (executors are browser-free).
