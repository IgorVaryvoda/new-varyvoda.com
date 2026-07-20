# Plan 025: Make the brand metadata say what the site is, and give every page a written description

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. All copy strings in this plan are **final for
> execution**: use them verbatim; do not rephrase, "improve", or
> re-punctuate them. (They are advisor-authored; the operator reviews them
> on the branch before merging — that review is not your concern.)
> Do NOT touch `plans/` — the dispatching
> reviewer maintains the index (your worktree's copy predates this plan
> anyway).
>
> **Drift check (run first)**: `git diff 186db1d -- content/about.md content/contact.md content/posts/help-ukraine.md content/posts/expets-sirv-optimization.md`
> → must be empty. `git diff 186db1d -- config.toml` → must show ONLY the
> added `disableKinds` line (plan 024, earlier in this lane).
> `layouts/_default/baseof.html` has also changed since `186db1d` (plan 023)
> — expected, out of scope here. Lane-order check:
> `grep -q 'disableKinds' config.toml` must SUCCEED and
> `grep -q '_internal/twitter_cards.html' layouts/_default/baseof.html` must
> FAIL; otherwise you were dispatched out of lane order — STOP.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: plans/023-social-share-metadata.md (the head template this
  plan's strings flow through), plans/024-crawl-surface-hygiene.md (same
  `config.toml`; lane order)
- **Category**: seo (metadata copy)
- **Planned at**: commit `186db1d`, 2026-07-20
- **Scrutiny notes** (sol, 2026-07-20): folded in — corrected the false
  "every other post has a description" claim (the three canonicalized posts
  don't; keeping their Summary fallback is now recorded as deliberate),
  documented that `.Description` renders visibly (hero dek + archive rows)
  with rendered checks added, replaced substring greps with a byte-exact
  five-string python assertion, and resolved the "operator-reviewed"
  contradiction (strings are final-for-execution, advisor-authored,
  operator-reviewed at branch review). Expanding scope with descriptions
  for the canonicalized posts was declined — off-site canonicals + out of
  sitemap makes it copy churn with no search surface.

## Why this matters

The highest-CTR search result this site will ever have is its own brand query, and that result currently reads **"Igor Varyvoda's Website — Sensible marketing blog by Igor Varyvoda"** — stale copy that contradicts the site's own positioning ("Products, systems, writing"; the homepage introduces a product builder, not a marketing blog). Four pages (About, Contact, and two posts) have no `description` front matter at all, so their SERP snippets and share descriptions fall back to raw first-paragraph prose — the About page's snippet literally contains "I enjoy building shit and promoting it". This plan replaces the site-level strings and writes deliberate descriptions for the four pages. It is a **data-only** change: config values and front matter; zero template edits.

## Current state

- `config.toml` (after plan 024; relevant lines — note `disableKinds` is
  present from plan 024):

```toml
baseurl = "https://www.varyvoda.com"
title = "Igor Varyvoda's Website"
...
[params]
  author = "Igor Varyvoda"
  info = "Products, systems, writing"
  description = "Sensible marketing blog by Igor Varyvoda."
  keywords = "blog,developer,personal"
```

- After plan 023, `layouts/_default/baseof.html` (do not edit it here):
  - uses `.Site.Params.description` as the last-resort meta description,
  - renders the home `<title>` as `{{ .Site.Title }} — {{ .Site.Params.info }}`,
  - no longer emits a keywords meta tag, so `params.keywords` is dead config.
  - `og:site_name` and default `twitter:title` come from `.Site.Title`.
- Pages missing `description` front matter (verified) and their current
  front matter keys:
  - `content/about.md` — `template`, `title: About me`, `slug`, `draft`
  - `content/contact.md` — `template`, `title: Contact Igor Varyvoda`,
    `slug`, `draft`, `form_url`
  - `content/posts/help-ukraine.md` — `title`, `date`, `draft`
  - `content/posts/expets-sirv-optimization.md` — `title`, `date`,
    `url: /experts-nuxt-Sirv/`, `draft`, `ogImage`
- Every remaining post/project carries a hand-written description EXCEPT the
  three sirv.com-canonicalized posts (`image-seo.md`,
  `image-personalization.md`, `shopify-sales.md`). Leaving those three on
  the truncated-Summary fallback is **deliberate**: their canonical URLs
  point off-site and plan 024 removed them from the sitemap, so their
  snippet quality is low-stakes and not worth new copy. Do not add
  descriptions to them.
- `description` front matter is NOT metadata-only on posts:
  `layouts/posts/single.html:20` renders it visibly as the `article-dek`
  paragraph on the post hero, and `layouts/posts/list.html:42-46` prefers it
  over the Summary excerpt in the Writing archive rows. Adding descriptions
  to the two posts below therefore **changes visible page copy** — that is
  intended and part of this plan. (About/Contact use `_default/single.html`,
  which never renders `.Description`; for them it is metadata-only.)
- Expected build noise: two deprecation WARNs (`languageCode`,
  `.Site.Languages`); not errors.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Build | `rm -rf public && hugo --gc --minify` | exit 0 (2 known WARNs allowed) |
| Full gate | `make quality-gate` | exit 0 (`./bin/htmltest` present in worktree) |

`bin/` is gitignored, so a fresh worktree may lack `./bin/htmltest`. In that
case run the gate with the main checkout's binary:
`make quality-gate HTMLTEST=/home/igor/Projects/new-varyvoda.com/bin/htmltest`.
Only if neither that path nor a PATH `htmltest` exists: run the build alone
and record the skip in your NOTES — do not download anything.

Zero-match expectation note: `grep -c` exits 1 when the count is 0 even
though 0 is the desired result; absence checks below use `! grep -q ...`
(exit 0 on absence) — use them exactly as given.

## Scope

**In scope** (the only files you may modify):
- `config.toml`
- `content/about.md`, `content/contact.md`,
  `content/posts/help-ukraine.md`, `content/posts/expets-sirv-optimization.md`
  (front matter only — do not change any body text)

**Out of scope** (do NOT touch):
- `layouts/` — the templates already consume these values (plan 023).
- Every other content file — their descriptions are hand-written and final.
- `params.info` — "Products, systems, writing" is correct and load-bearing
  (it is the home title suffix).
- The `url: /experts-nuxt-Sirv/` front matter — the mixed-case URL is
  established and has inbound links; do not "fix" it.

## Git workflow

- You are already on a dedicated branch in a dedicated worktree; do not create branches.
- One commit; message style: single short imperative sentence. Suggested:
  `Say what the site is in titles and descriptions`.
- Do NOT push.

## Steps

### Step 1: Update the site-level strings

In `config.toml`:

1. `title = "Igor Varyvoda's Website"` → `title = "Igor Varyvoda"`
2. `description = "Sensible marketing blog by Igor Varyvoda."` →
   `description = "Igor Varyvoda builds products — AI tooling for e-commerce imagery, travel apps, personal utilities — and writes about the systems behind them."`
3. Delete the line `keywords = "blog,developer,personal"` (dead config since
   plan 023 removed the keywords meta tag).

**Verify**: `grep -o 'title = .*' config.toml | head -1` → exactly
`title = "Igor Varyvoda"`, then `rm -rf public && hugo --gc --minify` → exit 0, then:
- `grep -o '<title>[^<]*' public/index.html` → `<title>Igor Varyvoda — Products, systems, writing`
- `grep -o '<title>[^<]*' public/posts/image-seo-2026/index.html` → ends `· Igor Varyvoda`
- `grep -o 'og:site_name[^>]*' public/index.html` → contains `Igor Varyvoda` and NOT `Website`
- `! grep -q 'Sensible marketing blog' public/index.html` → exit 0

### Step 2: Add the four page descriptions

Add a `description` line to each front matter block, verbatim:

`content/about.md`:
```yaml
description: "Made in Ukraine, based in Montenegro. A decade building and promoting Sirv, now creating Sirv AI Studio end to end — plus tools that solve my own problems."
```

`content/contact.md`:
```yaml
description: "Get in touch with Igor Varyvoda — product questions, collaboration, or anything worth building. Contact form and social profiles."
```

`content/posts/help-ukraine.md`:
```yaml
description: "Actionable ways to help Ukraine: verified donation routes, army support funds, and humanitarian resources, curated at UAHelp.me."
```

`content/posts/expets-sirv-optimization.md`:
```yaml
description: "How I pushed a Vue/Nuxt site to top performance with Sirv: on-the-fly image optimization, lazy loading, CDN delivery, and a faster contentful paint."
```

**Verify**: `rm -rf public && hugo --gc --minify`, then assert the rendered
meta descriptions are **byte-exact** (HTML-unescaped) matches of the strings
above, and the site description likewise:

```bash
python3 - <<'EOF'
import re, html, sys
expect = {
 'public/index.html': "Igor Varyvoda builds products — AI tooling for e-commerce imagery, travel apps, personal utilities — and writes about the systems behind them.",
 'public/about/index.html': "Made in Ukraine, based in Montenegro. A decade building and promoting Sirv, now creating Sirv AI Studio end to end — plus tools that solve my own problems.",
 'public/contact/index.html': "Get in touch with Igor Varyvoda — product questions, collaboration, or anything worth building. Contact form and social profiles.",
 'public/posts/help-ukraine/index.html': "Actionable ways to help Ukraine: verified donation routes, army support funds, and humanitarian resources, curated at UAHelp.me.",
 'public/experts-nuxt-Sirv/index.html': "How I pushed a Vue/Nuxt site to top performance with Sirv: on-the-fly image optimization, lazy loading, CDN delivery, and a faster contentful paint.",
}
bad = 0
for f, want in expect.items():
    h = open(f, encoding='utf-8').read()
    m = re.search(r'<meta name="?description"? content="([^"]*)"', h)
    got = html.unescape(m.group(1)) if m else None
    if got != want:
        bad += 1
        print("MISMATCH", f, repr(got))
print("ALL EXACT" if not bad else f"{bad} MISMATCHES")
sys.exit(1 if bad else 0)
EOF
```

→ prints `ALL EXACT`, exit 0. Then the visible-copy effects:
- `grep -o 'article-dek[^<]*<\|article-dek' public/posts/help-ukraine/index.html | head -1` →
  a match exists (the post hero now shows a dek where none existed)
- `grep -o 'article-dek' public/experts-nuxt-Sirv/index.html | wc -l` → `1`
- `grep -o 'UAHelp.me' public/posts/index.html | wc -l` → ≥ `1` (archive row
  copy switched from Summary excerpt to the description)
- `! grep -q 'shit' public/about/index.html` → **exit 1 is expected** — the
  About page *body* legitimately still contains its original prose; only the
  meta tag changed. Do not "fix" the body.

## Test plan

No unit tests in this repo; the automated gate is:

- `make quality-gate` → exit 0.
- The grep assertions above, re-run once after the final commit.

## Done criteria

Machine-checkable. ALL must hold (after `rm -rf public && hugo --gc --minify`):

- [ ] Build exits 0
- [ ] `config.toml` contains exactly `title = "Igor Varyvoda"`
- [ ] Home `<title>` is `Igor Varyvoda — Products, systems, writing`
- [ ] `! grep -rq 'Sensible marketing blog' public/` → exit 0
- [ ] Step 2 python check prints `ALL EXACT` and exits 0 (all five strings byte-exact)
- [ ] Step 2 visible-copy checks pass (dek present on both posts, archive row updated)
- [ ] `! grep -q 'keywords' config.toml` → exit 0
- [ ] `make quality-gate` exits 0 (using the main-checkout htmltest path if needed; skip recorded in NOTES only if no binary exists)
- [ ] After the final commit the worktree is clean (`git status --porcelain` empty) and `git diff-tree --no-commit-id --name-only -r HEAD` lists exactly the five in-scope files

## STOP conditions

Stop and report back (do not improvise) if:

- `layouts/_default/baseof.html` still contains
  `_internal/twitter_cards.html` or a `<meta name="keywords"` tag (plan 023
  did not land first — this plan depends on it).
- Any of the four content files already has a `description` front matter key.
- A grep verification fails twice after re-checking your edit.
- You feel the need to edit any body text or any template — that is out of
  scope by definition.

## Maintenance notes

- The home `<title>`/`params.info` pair is the one place the positioning
  line lives; if the positioning changes, change `params.info` only.
- New posts/projects should always ship a `description:` — the Summary
  fallback (truncated by plan 023) is a safety net, not the intended path.
- Reviewer: the five strings are copy decisions proposed by the advisor;
  surface them verbatim in the review summary so the operator can veto or
  reword before merging the branch. The two post descriptions also render
  as visible hero deks and archive copy — include a rendered check in
  review.
- The three sirv.com-canonicalized posts intentionally keep the truncated
  Summary fallback (see Current state); if one is ever de-canonicalized,
  write it a real description then.
