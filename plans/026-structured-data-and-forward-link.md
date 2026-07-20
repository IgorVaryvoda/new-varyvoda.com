# Plan 026: Add BlogPosting/Person/WebSite structured data and forward-link the 2019 image-SEO guide

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT touch `plans/` — the dispatching
> reviewer maintains the index (your worktree's copy predates this plan
> anyway).
>
> **Drift check (run first)**: `git diff 186db1d -- layouts/posts/single.html layouts/partials/home.html`
> → must be empty (these two files are untouched by plans 023–025).
> `git diff 186db1d -- content/posts/image-seo.md` → must show ONLY the
> added `sitemap:`/`  disable: true` front-matter lines (plan 024, earlier
> in this lane). Lane-order check — ALL of these must succeed, else you were
> dispatched out of lane order, STOP:
> `grep -q 'disableKinds' config.toml`,
> `grep -q 'sitemap:' content/posts/image-seo.md`,
> `grep -q 'title = "Igor Varyvoda"' config.toml` (plan 025's exact title),
> `grep -q 'author = "Igor Varyvoda"' config.toml`, and all three social
> URLs present: `grep -q 'twitter.com/igorvaryvoda' config.toml && grep -q 'linkedin.com/in/igorvaryvoda' config.toml && grep -q 'github.com/igorvaryvoda' config.toml`.

## Status

- **Priority**: P2
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/025-brand-strings-and-descriptions.md (site title
  "Igor Varyvoda" feeds the WebSite/Person names; lane order),
  plans/024-crawl-surface-hygiene.md (same content file)
- **Category**: seo (structured data)
- **Planned at**: commit `186db1d`, 2026-07-20
- **Scrutiny notes** (sol, 2026-07-20): folded in — the jsonify-sorts-keys
  BLOCKER (author.url vs top-level url) replaced grep field checks with a
  comprehensive python verifier (per-post BlogPosting cardinality, home
  entity counts, sameAs==3, all three canonical targets); `lastmod:
  2026-07-20` added for the visibly-updated 2019 post; preflight now
  asserts plan 025's title/author/social results; the pre-existing
  build-record Article block documented (baseline VALID) with a STOP path.
  The index-contract issue was already fixed before this critique arrived
  (reviewer owns `plans/`).

## Why this matters

The only structured data on the site is a hand-written BreadcrumbList on post and project pages. Posts emit `article:*` meta tags but no `BlogPosting` JSON-LD, so article rich-result eligibility and explicit authorship signals are left on the table; the homepage declares no `Person`/`WebSite` entity, so the site's strongest entity signal — one person with verifiable `sameAs` profiles (GitHub, LinkedIn, Twitter) — is absent. Separately, the 2019 post "Image SEO for E-commerce" (canonicalized to sirv.com but still live and linked) never mentions that a full 2026 re-audit exists: the 2026 post links back to it, but a reader or crawler landing on the old guide gets no path forward. This plan adds three JSON-LD emitters built with `dict`/`jsonify` (never string-interpolated JSON) and one update note at the top of the 2019 post.

## Current state

- `layouts/posts/single.html` — post template; lines 1–5 today:

```html
{{ define "title" }}{{ .Title }} · {{ .Site.Title }}{{ end }}
{{ define "content" }}
<script type="application/ld+json">
{"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[{"@type":"ListItem","position":1,"name":"Home","item":"{{ .Site.BaseURL }}"},{"@type":"ListItem","position":2,"name":"Writing","item":"{{ .Site.BaseURL }}posts/"},{"@type":"ListItem","position":3,"name":"{{ .Title }}","item":"{{ .Permalink }}"}]}
</script>
```

  (The BreadcrumbList stays exactly as-is; this plan only adds a sibling.)

- `layouts/partials/home.html` — homepage partial (included by the theme's
  `index.html`); lines 1–6 today:

```html
{{ $projects := where .Site.RegularPages "Section" "projects" }}
{{ $latestPosts := first 1 (where .Site.RegularPages "Type" "posts") }}

<div class="builder-home">
  <section class="scene-hero" aria-label="Introduction">
    <h1 class="visually-hidden">{{ .Site.Params.author }}</h1>
```

- `content/posts/image-seo.md` — the 2019 guide. After plan 024 its front
  matter is:

```yaml
---
title: "Image SEO for E-commerce"
date: 2019-06-13T22:52:03+01:00
draft: false
canonicalUrl: "https://sirv.com/blog/image-seo-for-ecommerce/"
sitemap:
  disable: true
---
```

  The body starts immediately after the closing `---` with
  `<div class="full-image__container">...` (raw HTML; `unsafe = true` is on).

- Site facts the JSON-LD consumes (post-plan-025 values):
  - `.Site.Title` = `Igor Varyvoda`; `.Site.Params.author` = `Igor Varyvoda`
  - `.Site.Params.social` = three entries (Twitter, LinkedIn, Github), each
    with a `url` key — collect them for `sameAs`.
  - Default OG image (same constant plan 023 uses):
    `https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900`
  - Three posts carry `canonicalUrl` front matter; for those, the
    BlogPosting `url`/`mainEntityOfPage` must be the canonical target.
- Convention: JSON-LD added by this plan must be built with `dict` +
  `jsonify | safeJS` (safe against quotes in titles), NOT by string
  interpolation like the legacy breadcrumb block. **`jsonify` emits map keys
  in alphabetical order** — never use `grep ... | head -1` to pick a JSON
  field out of the serialized block (e.g. `author.url` sorts before the
  top-level `url`); all JSON assertions go through the Step 4 python
  verifier.
- One page ships pre-existing JSON-LD outside the templates:
  `static/projects/sirv-studio/build-record/index.html` contains a
  hand-written `Article` block (verified VALID at planning time). It is out
  of scope; the Step 4 verifier will scan it — if it reports THAT block
  invalid, something outside this plan changed: STOP.
- `content/posts/image-seo.md` has `date: 2019-06-13` and no `lastmod`;
  `enableGitInfo` is off, so `.Lastmod` falls back to `.Date`. Step 3's
  visible update note makes 2019 a false modification date — Step 3
  therefore also adds `lastmod: 2026-07-20` to that post's front matter.
- Expected build noise: two deprecation WARNs (`languageCode`,
  `.Site.Languages`); not errors.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `rm -rf public && hugo --gc --minify` | exit 0 (2 known WARNs allowed) |
| Full gate | `make quality-gate` | exit 0 (`./bin/htmltest` present in worktree) |
| JSON-LD validity | see Step 4 python one-liner | `ALL VALID` |

`bin/` is gitignored, so a fresh worktree may lack `./bin/htmltest`. In that
case run the gate with the main checkout's binary:
`make quality-gate HTMLTEST=/home/igor/Projects/new-varyvoda.com/bin/htmltest`.
Only if neither that path nor a PATH `htmltest` exists: run the build alone
and record the skip in your NOTES — do not download anything.

## Scope

**In scope** (the only files you may modify):
- `layouts/posts/single.html`
- `layouts/partials/home.html`
- `content/posts/image-seo.md` (exactly two edits: the inserted blockquote
  and one added `lastmod: 2026-07-20` front-matter line)

**Out of scope** (do NOT touch):
- The existing BreadcrumbList scripts in `layouts/posts/single.html` and
  `layouts/projects/single.html` — they work; leave them.
- `layouts/projects/single.html` — project pages get no new schema in this
  plan (a `SoftwareApplication`/`CreativeWork` decision needs the operator).
- `layouts/_default/baseof.html`, `config.toml` — owned by plans 023/025.
- Every other content file. The body of image-seo.md below the inserted
  note. The post's front matter.

## Git workflow

- You are already on a dedicated branch in a dedicated worktree; do not create branches.
- One commit; message style: single short imperative sentence. Suggested:
  `Declare the author, the site, and each post to machines`.
- Do NOT push.

## Steps

### Step 1: Add BlogPosting JSON-LD to the post template

In `layouts/posts/single.html`, immediately after the existing closing
`</script>` of the BreadcrumbList (line 5), insert:

```html
{{ $ogImage := .Params.ogImage | default "https://cdn.earthroulette.com/varyvoda/og.jpg?cy=350&ch=900" }}
{{ $canonical := .Params.canonicalUrl | default .Permalink }}
{{ $desc := .Description | default (.Summary | plainify | htmlUnescape | replaceRE `\s+` " " | strings.TrimSpace | truncate 160) }}
{{ $article := dict
  "@context" "https://schema.org"
  "@type" "BlogPosting"
  "headline" .Title
  "description" $desc
  "url" $canonical
  "mainEntityOfPage" $canonical
  "datePublished" (.Date.Format "2006-01-02T15:04:05Z07:00")
  "dateModified" (.Lastmod.Format "2006-01-02T15:04:05Z07:00")
  "image" $ogImage
  "author" (dict "@type" "Person" "name" .Site.Params.author "url" ("about/" | absURL))
}}
<script type="application/ld+json">{{ $article | jsonify | safeJS }}</script>
```

**Verify**: `rm -rf public && hugo --gc --minify` → exit 0, then:
- `grep -o 'BlogPosting' public/posts/image-seo-2026/index.html | wc -l` → `1`
- `grep -o 'BlogPosting' public/posts/two-theories-of-a-programmer/index.html | wc -l` → `1`
- No description-less post leaks raw Summary artifacts into its JSON-LD
  (the fallback chain must match `baseof.html`'s normalization convention):

```bash
python3 - <<'EOF'
import json, re, glob, sys
bad = 0
for f in glob.glob('public/posts/*/index.html'):
    h = open(f, encoding='utf-8').read()
    for m in re.findall(r'<script type="?application/ld\+json"?>(.*?)</script>', h, re.S):
        b = json.loads(m)
        if b.get('@type') == 'BlogPosting':
            d = b.get('description', '')
            if '&rsquo;' in d or '&amp;' in d or '\n' in d or d != d.strip():
                bad += 1; print("RAW SUMMARY LEAK", f, repr(d[:60]))
print("DESCRIPTIONS CLEAN" if not bad else f"{bad} LEAKS"); sys.exit(1 if bad else 0)
EOF
```

→ `DESCRIPTIONS CLEAN`, exit 0.

(Do NOT try to grep JSON field values — `jsonify` sorts keys alphabetically
and `author.url` precedes the top-level `url`. Field-level assertions happen
in Step 4's verifier.)

### Step 2: Add Person + WebSite JSON-LD to the homepage

In `layouts/partials/home.html`, insert at the very top of the file (before
the `{{ $projects := ... }}` line):

```html
{{ $sameAs := slice }}
{{ range .Site.Params.social }}{{ $sameAs = $sameAs | append .url }}{{ end }}
{{ $person := dict
  "@context" "https://schema.org"
  "@type" "Person"
  "name" .Site.Params.author
  "url" .Site.BaseURL
  "sameAs" $sameAs
}}
{{ $website := dict
  "@context" "https://schema.org"
  "@type" "WebSite"
  "name" .Site.Title
  "url" .Site.BaseURL
}}
<script type="application/ld+json">{{ $person | jsonify | safeJS }}</script>
<script type="application/ld+json">{{ $website | jsonify | safeJS }}</script>
```

**Verify**: `rm -rf public && hugo --gc --minify`, then:
- `grep -o '"@type":"Person"' public/index.html | wc -l` → `1`
- `grep -o '"@type":"WebSite"' public/index.html | wc -l` → `1`
(Full field assertions in Step 4.)

### Step 3: Forward-link the 2019 guide to the 2026 re-audit

In `content/posts/image-seo.md`, make exactly two edits. First, add one line
to the front matter (after the `draft: false` line):

```yaml
lastmod: 2026-07-20
```

(Without it, `.Lastmod` falls back to the 2019 `date` and the new
`dateModified` in the BlogPosting would be false for the very post this
step visibly updates.)

Second, insert after the closing `---` of the front matter — separated by
one blank line, before the `<div class="full-image__container">` line —
exactly:

```markdown
> **Update, July 2026:** I re-audited every piece of advice in this guide, seven years on — what survived, what died, and what changed. Read the follow-up: [Image SEO in 2026: Everything That Changed Since 2019](/posts/image-seo-2026/).
```

**Verify**: `rm -rf public && hugo --gc --minify`, then
`grep -q '/posts/image-seo-2026/' public/posts/image-seo/index.html` → exit 0
and `grep -o '<strong>Update, July 2026:</strong>' public/posts/image-seo/index.html | wc -l` → `1`
(the `<strong>` markup uniquely identifies the rendered BODY blockquote —
measured against actual output).

Do not count the bare phrase `Update, July 2026` — it legitimately appears
~5 times on the page: the post has no hand-written `description`, so its
Summary (which now begins with the note) feeds the meta description,
twitter:description, og:description, AND the BlogPosting JSON-LD description
from Step 1, plus the body blockquote. That description side effect is
intended and accepted: searchers landing on the superseded guide see the
supersession notice in the snippet itself.

### Step 4: Run the full structured-data verifier

**Verify**:

```bash
python3 - <<'EOF'
import json, re, glob, sys
CANON = {
 'public/posts/image-seo/index.html': 'https://sirv.com/blog/image-seo-for-ecommerce/',
 'public/posts/image-personalization/index.html': 'https://sirv.com/blog/image-personalization-examples/',
 'public/posts/shopify-sales/index.html': 'https://sirv.com/blog/increase-shopify-sales/',
}
errs = []
posts_seen = 0
for f in glob.glob('public/**/index.html', recursive=True):
    h = open(f, encoding='utf-8').read()
    blocks = []
    for m in re.findall(r'<script type="?application/ld\+json"?>(.*?)</script>', h, re.S):
        try:
            blocks.append(json.loads(m))
        except Exception as e:
            errs.append(f"INVALID JSON {f}: {e}")
    types = [b.get('@type') for b in blocks]
    if 'article-page--editorial' in h:          # every rendered post page
        posts_seen += 1
        if types.count('BlogPosting') != 1:
            errs.append(f"{f}: expected exactly one BlogPosting, got {types}")
        for b in blocks:
            if b.get('@type') == 'BlogPosting' and f in CANON:
                for k in ('url', 'mainEntityOfPage'):
                    if b.get(k) != CANON[f]:
                        errs.append(f"{f}: BlogPosting {k}={b.get(k)!r}, want {CANON[f]!r}")
    if f == 'public/index.html':
        if types.count('Person') != 1 or types.count('WebSite') != 1:
            errs.append(f"home: expected one Person and one WebSite, got {types}")
        for b in blocks:
            if b.get('@type') == 'Person' and len(b.get('sameAs', [])) != 3:
                errs.append(f"home Person sameAs={b.get('sameAs')}")
assert posts_seen >= 8, f"only {posts_seen} post pages found — glob or class drifted"
print("\n".join(errs) if errs else "ALL VALID")
sys.exit(1 if errs else 0)
EOF
```

→ prints `ALL VALID`, exit 0. If the ONLY failure is an invalid block in
`projects/sirv-studio/build-record/` (a pre-existing hand-written Article,
valid at planning time): STOP and report — that file is out of scope and
something outside this plan changed it.

## Test plan

No unit tests in this repo; the automated gate is:

- `make quality-gate` → exit 0 — htmltest verifies the new internal link
  from the 2019 post to `/posts/image-seo-2026/`.
- Step 4's JSON validation across every rendered page.

## Done criteria

Machine-checkable. ALL must hold (after `rm -rf public && hugo --gc --minify`):

- [ ] Build exits 0
- [ ] Step 4 verifier prints `ALL VALID` and exits 0 (covers: every post page
      exactly one BlogPosting; home Person+WebSite with 3 sameAs; all three
      canonicalized posts' `url`/`mainEntityOfPage` pointing at sirv.com;
      every JSON-LD block on the site parses)
- [ ] `content/posts/image-seo.md` front matter contains `lastmod: 2026-07-20`
- [ ] `public/posts/image-seo/index.html` links to `/posts/image-seo-2026/` (Step 3 checks)
- [ ] `make quality-gate` exits 0 (using the main-checkout htmltest path if needed; skip recorded in NOTES only if no binary exists)
- [ ] After the final commit the worktree is clean (`git status --porcelain` empty) and `git diff-tree --no-commit-id --name-only -r HEAD` lists exactly the three in-scope files

## STOP conditions

Stop and report back (do not improvise) if:

- The layout excerpts in "Current state" don't match the files.
- `content/posts/image-seo.md` front matter lacks the `sitemap:` block
  (plan 024 did not land first — lane order violated).
- Step 4 reports an invalid block that comes from the **legacy breadcrumb**
  scripts rather than your new blocks.
- The rendered JSON-LD appears HTML-entity-escaped (e.g. `&#34;` inside the
  script tag) — the `safeJS` context isn't working as planned; report
  rather than swapping in `safeHTML` yourself.
- Any fix appears to require editing a file outside the in-scope list.

## Maintenance notes

- Google's rich-results eligibility should be checked post-deploy with the
  Rich Results Test on one post URL — reviewer/operator item; executors are
  browser-free.
- If project pages should ever declare schema (`CreativeWork` /
  `SoftwareApplication`), follow the same `dict`+`jsonify` pattern added
  here — and consider migrating the legacy string-interpolated breadcrumbs
  at the same time.
- New posts automatically get BlogPosting; nothing to remember per-post
  beyond the existing `description:`/`ogImage:` habits.
