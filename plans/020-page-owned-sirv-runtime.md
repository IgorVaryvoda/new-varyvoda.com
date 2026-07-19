# Plan 020: Make the Sirv opt-in work for every content type

> **Executor instructions**: This corrective plan starts from Plan 015's rejected commit. Follow every step, do not launch a browser, and stop on a STOP condition. The reviewer maintains `plans/README.md`.
>
> **Dispatcher note**: Before execution, the reviewer creates the named branch/worktree from the exact rejected baseline below.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/020-page-owned-sirv-runtime" && test "$(git rev-parse HEAD)" = "79d80a3b1677c65208b56124ca36b0e68b909db3" && test -z "$(git status --porcelain)"`. STOP unless all pass.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: 015 implementation commit (rejected review baseline)
- **Category**: perf/bug
- **Planned at**: commit `79d80a3`, 2026-07-18

## Why this matters

Plan 015 correctly removed Sirv.js from generic routes, but its independent review found that `sirv: true` loads the runtime only in the post template. A future project/page containing an opted-in raw Sirv widget would receive the preconnect but no runtime. The base layout already calculates the page-owned boolean, so it should own the one conditional script for all content types.

## Scope

**In scope**:
- `layouts/_default/baseof.html`
- `layouts/posts/single.html`
- `CLAUDE.md`

**Out of scope**: image markup/partials, frontmatter flags, content bodies, project templates, script URL/version, CSS, and loading priority.

## Git workflow

- Branch: `improve/020-page-owned-sirv-runtime`
- Commit: `Honor Sirv opt-in across content`
- Do not push or open a PR.

## Steps

### Step 1: Move the one conditional runtime to baseof

In `baseof.html`, reuse the existing `$needsSirv` value to render exactly one `<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js" defer></script>` after the main shell and before unrelated first-party scripts. Remove the conditional script from `layouts/posts/single.html`. Do not call the helper twice, change preconnect behavior, or load the script on pages without the flag.

Replace the relevant Image Handling text in `CLAUDE.md` with these exact bullets:

- `Template-owned project images use native src/srcset/sizes/loading/decoding and do not need Sirv.js.`
- `Any content page with raw Sirv widgets opts in with sirv: true.`
- `The base layout loads one Sirv.js runtime for an opted-in page.`

Also replace the Custom Templates description of `layouts/projects/single.html` so it says `native responsive image delivery`, not `Sirv lazy loading`.

### Step 2: Verify posts, normal routes, and a project fixture

The dispatcher provides Hugo extended 0.161.1 at `/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo`. STOP unless that executable reports exactly v0.161.1. Run the full gate with that binary first on `PATH`:

```bash
PATH=/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1:/home/igor/Projects/new-varyvoda.com/bin:$PATH HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-020 make quality-gate
```

Render the real content to the first fresh `mktemp -d` destination with this exact command:

```bash
/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo --gc --minify --destination "$REAL_RENDER"
```

Use a small inline Node checker that extracts only opening `<script\b[^>]*>` and `<link\b[^>]*>` tags, parses quoted or unquoted attributes independent of order, and counts a script only when `src` exactly equals `https://scripts.sirv.com/sirvjs/v3/sirv.js` and the `defer` attribute exists; count a preconnect only when `rel` contains the token `preconnect` and `href` exactly equals `https://scripts.sirv.com`. This avoids matching the image SEO article's code example and Hugo minifier's unquoted attributes. Assert one script and one preconnect in these exact files:

- `experts-nuxt-Sirv/index.html`
- `posts/image-personalization/index.html`
- `posts/image-seo/index.html`
- `posts/shopify-sales/index.html`

Assert zero of both in:

- `index.html`
- `projects/index.html`
- `projects/sirv-studio/index.html`
- `posts/two-theories-of-a-programmer/index.html`

Create a second disposable `mktemp -d` root containing `copied-content/projects/` and `rendered-output/`. Copy all content into `copied-content/` so section structure and `_index.md` files are preserved, then add `sirv: true` only to `copied-content/projects/earth-roulette.md`. Render exactly with:

```bash
/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo --gc --minify --contentDir "$FIXTURE_ROOT/copied-content" --destination "$FIXTURE_ROOT/rendered-output"
```

Run the same element checker specifically against `rendered-output/projects/earth-roulette/index.html` and require exactly one script/preconnect. Use a trap and explicit cleanup so both temporary roots are removed before commit. This proves the opt-in is page-owned and exercises `layouts/projects/single.html`, not the generic page template.

Run `git diff --check`, inspect the three-file diff, and require this exact sorted changed-path list before commit:

```text
CLAUDE.md
layouts/_default/baseof.html
layouts/posts/single.html
```

Commit, then verify `git diff --check 79d80a3b1677c65208b56124ca36b0e68b909db3...HEAD`, the same exact scope, and clean status.

## Done criteria

- [ ] One base-layout conditional owns Sirv.js for every `sirv: true` page.
- [ ] Post template has no separate Sirv.js emission.
- [ ] Four legacy posts still load exactly one script; normal routes load none.
- [ ] Temporary opted-in project loads exactly one script/preconnect.
- [ ] Documentation matches page-owned behavior.
- [ ] Quality gate, rendered assertions, scope, and clean status pass.

## STOP conditions

- A page receives duplicate scripts or script/preconnect conditions diverge.
- A normal route loads Sirv.js.
- Correctness requires changing content bodies, image templates, or script version.
- Gate/render verification fails twice.

## Maintenance notes

The list lead remains intentionally lazy: the full-height Work masthead precedes the atlas, so that image is below the initial viewport. Plan 016 must branch from this reviewed correction.
