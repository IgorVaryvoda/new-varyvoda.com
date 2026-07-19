# Plan 015: Remove Sirv.js from routes that only need native images

> **Executor instructions**: Follow this plan exactly. Do not launch a browser. Run every verification and stop on a STOP condition. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/015-native-media-loading" && test "$(git rev-parse HEAD)" = "8819dc5b2b31a697838439734608a9b07a63e353" && test -z "$(git status --porcelain)"`. STOP unless all checks pass.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `8819dc5`, 2026-07-18

## Why this matters

Sirv.js transfers about 153 KB compressed. It is loaded on the homepage and every project/list/article route even though template-owned remote images only need ordinary responsive image URLs and no project content contains Sirv widgets. Only four legacy posts contain raw Sirv markup that needs the library.

## Current state

- `layouts/partials/home.html`, `layouts/projects/list.html`, `layouts/projects/single.html`, and `layouts/posts/single.html` each append an unconditional Sirv.js script.
- Remote template images use `class="Sirv"`, `data-src`, and a low-quality `src` placeholder.
- Raw executable Sirv media exists only in `expets-sirv-optimization.md`, `image-personalization.md`, `image-seo.md`, and `shopify-sales.md` (verify this inventory before editing). Some of these posts also show Sirv markup inside code samples, so runtime ownership must not be inferred from raw string matching.
- `layouts/_default/baseof.html` unconditionally preconnects to `scripts.sirv.com`.

## Scope

**In scope**:
- `layouts/partials/home.html`
- `layouts/projects/list.html`
- `layouts/projects/single.html`
- `layouts/posts/single.html`
- `layouts/_default/baseof.html`
- `layouts/partials/needs-sirv.html`
- `layouts/partials/remote-project-image.html`
- frontmatter only in `content/posts/expets-sirv-optimization.md`
- frontmatter only in `content/posts/image-personalization.md`
- frontmatter only in `content/posts/image-seo.md`
- frontmatter only in `content/posts/shopify-sales.md`
- `CLAUDE.md` image-handling guidance only

**Out of scope**: post bodies/markup, local image branches, visual CSS, Sirv URL ownership, external galleries/zooms, image files, JavaScript dependencies, and unrelated head preconnects.

## Git workflow

- Branch: `improve/015-native-media-loading`
- Commit: `Scope Sirv media loading`
- Do not push or open a PR.

## Steps

### Step 1: Prove and encode the legacy-content exception

Run a content inventory for `Sirv`, `sirv.com`, `sirv-cdn`, `data-src`, zoom/gallery/spin markup and record the exact posts. Distinguish rendered widgets from fenced/preformatted documentation examples. STOP if any project or more than the four named posts require Sirv.js.

Add the explicit frontmatter flag `sirv: true` to exactly those four posts. Create `layouts/partials/needs-sirv.html` that returns true only when `.Params.sirv` is true. Do not inspect `.RawContent` or `.Content`: explicit ownership prevents fenced examples and ordinary links from activating a 153 KB runtime. In `baseof.html`, bind the result once for the current page, conditionally emit the `scripts.sirv.com` preconnect, and use the same deterministic partial in the post template.

### Step 2: Convert template-owned remote images to native delivery

Create one `remote-project-image.html` partial accepting source URL, alt, default width, candidate widths, `sizes`, loading, and optional fetch priority. Parse the hostname and treat exactly `iantiark.sirv.com`, `sirv-cdn.sirv.com`, and `cdn.earthroulette.com` as transformable; `opengraph.githubassets.com` and every unlisted host are unsupported. Preserve existing query parameters by appending new width parameters with `&` when `?` already exists.

Use this exact placement matrix for every current non-local branch:

| Placement | Default width | Candidates | `sizes` |
|---|---:|---|---|
| Homepage current build | 1500 | 640, 960, 1500 | `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) calc(100vw - 16rem - 15vw), 95rem` |
| Homepage selected work | 1400 | 480, 800, 1400 | `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 65vw, 78rem` |
| Project-list lead | 1600 | 640, 1000, 1600 | `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 66vw, 80rem` |
| Project-list regular | 1000 | 480, 720, 1000 | `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 46vw, 57rem` |
| System project hero | 1600 | 640, 1000, 1600 | `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 58vw, 72rem` |
| Non-system project stage | 1600 | 640, 1000, 1600 | `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 1480px) calc(100vw - 8vw), 134rem` |

For each branch:

- remove `class="Sirv"` and `data-src`;
- use a real `src` URL with an appropriate default width;
- on an allowed hostname, provide exactly the matrix's candidate `srcset` and `sizes` using Sirv's `w=` transformation;
- for unsupported remote hosts such as `opengraph.githubassets.com`, emit a valid native `src` but no fake width descriptors or transform parameters;
- retain current alt text;
- set `decoding="async"`;
- for remote branches, set `loading="lazy"` on every homepage/list placement, including the list lead because the full-height Work masthead puts it below the fold. Only a remote project hero/stage may remain eager and receive `fetchpriority="high"`. The actual local Studio hero is deliberately unchanged here and receives explicit priority plus responsive variants in dependent Plan 016.

Do not change the local-image branches or visible markup. Preserve any existing remote query parameters when appending width/quality parameters; use Hugo template variables to avoid malformed double `?` URLs.

Remove the unconditional Sirv.js script from home, project list, and project single. In the post template, render the same deferred script only when `needs-sirv.html` returns true.

Update only the stale Image Handling notes in `CLAUDE.md`: template-owned project images now use native `src/srcset/sizes/loading/decoding`; Sirv.js loads only for legacy posts carrying `sirv: true`; new raw Sirv widgets must opt in explicitly.

### Step 3: Verify rendered ownership and commit

Record `hugo version` before running the gate. CI is pinned to 0.161.1 while this workstation currently has 0.163.3; that known newer-version mismatch is allowed for executor verification but must be reported for reviewer/CI follow-up. STOP if the installed version is older than 0.161.1.

Run `make quality-gate`, then build to a clean temporary destination outside `public/` with `hugo --gc --minify --destination "$PWD/.tmp-plan015-public"` and remove that directory after inspection. Verify:

- homepage, `/projects/`, and a project page have no `scripts.sirv.com/sirvjs` reference and no template-owned `class="Sirv"`/`data-src`;
- the four inventoried legacy posts include exactly one actual `<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js" defer>` element (count opening script tags, not URL substrings that can appear inside code samples);
- a normal post includes none;
- `scripts.sirv.com` preconnect exists only on pages that load the script;
- transformable native remote images contain `src`, `srcset`, `sizes`, `loading`, and `decoding`; unsupported-host images contain `src`, `loading`, and `decoding` with no invalid width query or fake `srcset`.
- `rg -n 'class="Sirv"|data-src=' layouts/partials/home.html layouts/projects/list.html layouts/projects/single.html` returns no matches, and source inspection confirms all five remote template branches call the shared partial with the exact placement matrix (the list branch selects lead versus regular values by index);
- Earth Roulette/iantiark rendered images have `srcset`; Image & Media Skills/opengraph rendered images preserve the original URL and have no `srcset` or appended `w=`.

If executor network access exists, `curl -I -L` one rendered candidate on each of `iantiark.sirv.com` and `cdn.earthroulette.com` and require 2xx plus `Content-Type: image/*`; otherwise record this as skipped for reviewer rather than improvising around the sandbox. Reviewer must complete the two candidate requests before approval.

Commit, then run `git diff --check 8819dc5b2b31a697838439734608a9b07a63e353...HEAD`, confirm the committed range contains only the twelve in-scope template/partial/content/docs paths, and confirm a clean status.

## Done criteria

- [ ] Sirv.js is absent from generic home/project/normal-post routes.
- [ ] Every raw Sirv-media legacy post still loads it once.
- [ ] Transformable remote images use valid responsive attributes; unsupported hosts receive no invented transforms.
- [ ] Remote-image priority/lazy behavior matches visual position; homepage/list images are lazy and only project-page heroes may be eager/high.
- [ ] Sirv script preconnect is conditional and aligned with actual loading.
- [ ] Content and visual CSS are unchanged; quality gate and rendered assertions pass.
- [ ] Repository image guidance documents native template images and the explicit legacy Sirv flag.
- [ ] Reviewer validates representative transformed candidates over the network before approval.

## STOP conditions

- Content inventory finds an unclassified Sirv dependency outside the four named posts.
- Explicit `sirv: true` flags do not cover every executable Sirv widget found by the inventory.
- Valid native URLs require changing content or the Sirv account path.
- Build/render verification fails twice.

## Maintenance notes

Plan 016 should branch from this approved commit because it touches the same three image templates. Any future raw Sirv widget post must contain one of the helper's documented stable markers.
