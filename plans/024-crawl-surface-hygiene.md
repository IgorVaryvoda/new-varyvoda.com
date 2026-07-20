# Plan 024: Remove empty taxonomy pages, own robots.txt, and stop advertising externally-canonicalized posts

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. Do NOT touch `plans/` — the dispatching
> reviewer maintains the index (your worktree's copy predates this plan
> anyway).
>
> **Drift check (run first)**: `git diff 186db1d -- config.toml static/robots.txt content/posts/image-seo.md content/posts/image-personalization.md content/posts/shopify-sales.md`
> (bare `186db1d`, not `186db1d..HEAD`, so uncommitted drift shows too).
> Expected: no output. `layouts/_default/baseof.html` HAS changed since
> `186db1d` (plan 023, earlier in this lane) — that is expected and out of
> scope here. If any IN-SCOPE file above differs from the "Current state"
> excerpts, STOP. Lane-order check: `grep -q '_internal/twitter_cards.html' layouts/_default/baseof.html`
> must FAIL (plan 023 removed that line; if it's still present you were
> dispatched out of lane order — STOP).

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/023-social-share-metadata.md (lane order only — no file overlap; 023 must be reviewed first so this branch builds on it)
- **Category**: seo (crawl surface)
- **Planned at**: commit `186db1d`, 2026-07-20
- **Scrutiny notes** (sol, 2026-07-20): all six issues folded in — reviewer
  owns the index, working-tree drift check (`git diff 186db1d`), canonical
  preservation asserted for all three posts, body-diff loop proves
  front-matter-only edits, main-checkout htmltest path, `! grep -q` absence
  checks. "Require the approved 023 commit as an ancestor" was adapted: the
  023 SHA is unknowable at planning time, so lane order is checked by
  content (`_internal/twitter_cards.html` must already be gone).

## Why this matters

The site declares four taxonomies (`categories`, `series`, `tag`, `authors`) in `config.toml`, but **zero** content files use any of them. Hugo therefore builds empty `/tags/`, `/categories/`, `/series/`, and `/authors/` pages (body: a bare `<h1>`), plus `/page/1/` redirect aliases and four RSS feeds for them — roughly 12 junk URLs on a ~25-page site, all listed in `sitemap.xml`. Meanwhile the site has no robots.txt of its own: the live `https://www.varyvoda.com/robots.txt` is Cloudflare's injected content-signals boilerplate with zero directives and **no `Sitemap:` line**, so sitemap discovery depends entirely on Search Console. Finally, three old posts are canonicalized to their original homes on sirv.com yet still advertised in the sitemap. After this plan: no empty taxonomy pages exist, an owned robots.txt advertises the sitemap, and the sitemap lists only pages this site actually wants indexed.

## Current state

- `config.toml` — site config; lines 1–14 today (top-level keys end at
  `disqusShortname`; everything after belongs to `[markup...]` tables, and
  TOML top-level keys MUST be inserted before the first `[table]` header):

```toml
baseurl = "https://www.varyvoda.com"
title = "Igor Varyvoda's Website"
theme = "hugo-coder"
languagecode = "en"
defaultcontentlanguage = "en"
pygmentsstyle = "bw"
pygmentscodefences = true
pygmentscodefencesguesssyntax = true

disqusShortname = "varyvoda"
[markup.goldmark.renderer]
  unsafe= true
```

  and lines 39–44:

```toml
[taxonomies]
  category = "categories"
  series = "series"
  tag = "tags"
  author = "authors"
```

- `static/robots.txt` — does not exist. Nothing in `static/` or `layouts/`
  produces a robots.txt, and `enableRobotsTXT` is not set.
- The three externally-canonicalized posts, each carrying `canonicalUrl` in
  front matter (pointing at sirv.com) while still appearing in
  `sitemap.xml`:
  - `content/posts/image-seo.md` — front matter keys: `title`, `date`,
    `draft`, `canonicalUrl`
  - `content/posts/image-personalization.md` — same keys
  - `content/posts/shopify-sales.md` — same keys
- Verified facts at the planned commit:
  - `grep -rn "tags:\|categories:\|series:\|authors:" content/` → no matches
    (no content uses any taxonomy).
  - No layout or menu links to `/tags/`, `/categories/`, `/series/`, or
    `/authors/`. The only taxonomy-touching template is the theme partial
    `themes/hugo-coder/layouts/partials/posts/series.html`, which is guarded
    by `{{ if .Params.series }}` and renders nothing on this site.
  - The `sitemap.disable` front-matter key requires Hugo ≥ 0.125.0.
    Production builds with 0.145.0, CI with 0.161.1, local is 0.163.3 — all
    support it.
- Expected build noise: two deprecation WARNs (`languageCode`,
  `.Site.Languages`) on every build; not errors.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `rm -rf public && hugo --gc --minify` | exit 0 (2 known WARNs allowed) |
| Full gate | `make quality-gate` | exit 0 (`./bin/htmltest` present in worktree) |
| Hugo version | `hugo version` | ≥ 0.125.0 |

`bin/` is gitignored, so a fresh worktree may lack `./bin/htmltest`. In that
case run the gate with the main checkout's binary:
`make quality-gate HTMLTEST=/home/igor/Projects/new-varyvoda.com/bin/htmltest`.
Only if neither that path nor a PATH `htmltest` exists: run the build alone
and record the skip in your NOTES — do not download anything.

Zero-match expectation note: `grep -c` exits 1 when the count is 0, even
though `0` is the *desired* result. Every absence check below is therefore
written as `! grep -q ...` (exit 0 on absence) — use them exactly as given.

## Scope

**In scope** (the only files you may modify/create):
- `config.toml` (one inserted line only)
- `static/robots.txt` (create)
- `content/posts/image-seo.md`, `content/posts/image-personalization.md`,
  `content/posts/shopify-sales.md` (front matter only — do not touch the body)

**Out of scope** (do NOT touch):
- The `[taxonomies]` block in `config.toml` — leave it in place. Removing it
  would fall back to Hugo's *default* taxonomies rather than none;
  `disableKinds` is the complete fix.
- `layouts/` and `themes/` — no template changes in this plan.
- `content/posts/expets-sirv-optimization.md` — it has a custom `url` but NO
  `canonicalUrl`; it is an original post and stays in the sitemap.
- Post bodies of the three canonicalized posts (a content-level update note
  is plan 026's job for image-seo.md).

## Git workflow

- You are already on a dedicated branch in a dedicated worktree; do not create branches.
- One commit; message style: single short imperative sentence. Suggested:
  `Trim the crawl surface to pages worth indexing`.
- Do NOT push.

## Steps

### Step 1: Disable taxonomy page generation

In `config.toml`, insert one line after `pygmentscodefencesguesssyntax = true`
(keeping the blank line before `disqusShortname`):

```toml
disableKinds = ["taxonomy", "term"]
```

**Verify**: `rm -rf public && hugo --gc --minify` → exit 0, then:
- `ls public/tags public/categories public/series public/authors 2>&1 | grep -o "No such file" | wc -l` → `4`
- `! grep -qE "varyvoda.com/(tags|categories|series|authors)/" public/sitemap.xml` → exit 0

### Step 2: Create the owned robots.txt

Create `static/robots.txt` with exactly:

```
User-agent: *
Allow: /

Sitemap: https://www.varyvoda.com/sitemap.xml
```

**Verify**: `rm -rf public && hugo --gc --minify`, then
`diff static/robots.txt public/robots.txt` → no output (file copied verbatim).

### Step 3: Drop externally-canonicalized posts from the sitemap

Append to the front matter of each of the three files
(`content/posts/image-seo.md`, `content/posts/image-personalization.md`,
`content/posts/shopify-sales.md`), before the closing `---`:

```yaml
sitemap:
  disable: true
```

**Verify**: `rm -rf public && hugo --gc --minify`, then:
- `! grep -qE "posts/(image-seo|image-personalization|shopify-sales)/<" public/sitemap.xml` → exit 0
  (the `<` suffix keeps `/posts/image-seo-2026/` from matching)
- `grep -o "posts/image-seo-2026/<" public/sitemap.xml | wc -l` → `1` (the successor stays)
- All three pages still render AND keep their exact canonical links:

```bash
grep -o 'rel=canonical href=[^>]*' public/posts/image-seo/index.html          # → https://sirv.com/blog/image-seo-for-ecommerce/
grep -o 'rel=canonical href=[^>]*' public/posts/image-personalization/index.html  # → https://sirv.com/blog/image-personalization-examples/
grep -o 'rel=canonical href=[^>]*' public/posts/shopify-sales/index.html      # → https://sirv.com/blog/increase-shopify-sales/
```

  Each command must print exactly one line containing the shown sirv.com URL.
- Bodies untouched — for each of the three posts, the content after the
  front matter is byte-identical to `186db1d` (no output on success):

```bash
for p in image-seo image-personalization shopify-sales; do
  f="content/posts/$p.md"
  git show 186db1d:"$f" | awk '/^---$/{c++;next} c>=2' > /tmp/old-body
  awk '/^---$/{c++;next} c>=2' "$f" > /tmp/new-body
  diff /tmp/old-body /tmp/new-body || echo "BODY CHANGED: $f"
done
```

## Test plan

No unit tests in this repo; the automated gate is:

- `make quality-gate` → exit 0. htmltest re-crawls every internal link, which
  proves nothing linked to the removed taxonomy pages.
- The grep assertions above, re-run once after the final commit.

## Done criteria

Machine-checkable. ALL must hold (after `rm -rf public && hugo --gc --minify`):

- [ ] Build exits 0
- [ ] `public/tags`, `public/categories`, `public/series`, `public/authors` do not exist
- [ ] `public/sitemap.xml` contains no taxonomy URLs and none of the three canonicalized post URLs (`! grep -q` checks from Steps 1 and 3)
- [ ] `public/sitemap.xml` still contains `posts/image-seo-2026/`, `/about/`, `/contact/`
- [ ] All three canonicalized posts still render with their exact sirv.com canonical links (Step 3 checks)
- [ ] The Step 3 body-diff loop prints nothing (front matter was the only edit)
- [ ] `public/robots.txt` is byte-identical to `static/robots.txt`
- [ ] `make quality-gate` exits 0 (using the main-checkout htmltest path if needed; skip recorded in NOTES only if no binary exists)
- [ ] After the final commit the worktree is clean (`git status --porcelain` empty) and `git diff-tree --no-commit-id --name-only -r HEAD` lists exactly: `config.toml`, `static/robots.txt`, and the three post files

## STOP conditions

Stop and report back (do not improvise) if:

- `hugo version` reports < 0.125.0.
- The build errors after adding `disableKinds` (would mean some template
  hard-references taxonomy pages — reviewer decision needed).
- After Step 3 the three posts disappear from `public/posts/` entirely
  (they must still render; only the sitemap entry goes).
- `make quality-gate` fails with dead internal links pointing at `/tags/`
  or similar (contradicts the verified "nothing links to them" fact).
- Any fix appears to require editing a file outside the in-scope list.

## Maintenance notes

- **Operator, after deploy**: `curl https://www.varyvoda.com/robots.txt` —
  Cloudflare's managed content-signals block may be merged with the origin
  file; the owned `User-agent`/`Sitemap` lines must both survive. If
  Cloudflare *replaces* rather than merges, resolve in the Cloudflare
  dashboard (Content Signals settings). Executors cannot verify this.
- If tags/categories are ever actually adopted for content, delete the
  `disableKinds` line — the `[taxonomies]` block was left intact for that
  future.
- The three canonicalized posts stay reachable and internally linked; if one
  is ever rewritten as original content, remove both its `canonicalUrl` and
  its `sitemap.disable`.
