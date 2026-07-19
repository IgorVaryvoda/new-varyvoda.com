# Plan 016: Right-size the Sirv Studio feature image

> **Executor instructions**: Follow this plan exactly. Do not launch a browser. Run every verification and stop on a STOP condition. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Dispatcher note**: Before execution, the reviewer creates and checks out the named branch/worktree from the exact approved Plan 020 commit below.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/016-responsive-studio-feature" && test "$(git rev-parse HEAD)" = "5e28c1368174aa37b2dad79a4ce02ad05b50cd1c" && test -z "$(git status --porcelain)"`. STOP unless all checks pass. Set `BASE_REF=5e28c1368174aa37b2dad79a4ce02ad05b50cd1c` for final scope checks.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: LOW
- **Depends on**: 020
- **Category**: perf
- **Planned at**: commit `8819dc5`, 2026-07-18

## Why this matters

The 1342×1336, 133 KB Studio screenshot is eagerly downloaded below the homepage opening and is also reused in wide, cropped cards. Purpose-built responsive square and wide variants reduce bytes, provide intrinsic dimensions, and avoid making a below-the-fold homepage image compete with first paint.

## Current state

- `content/projects/sirv-studio.md` defines one local `image` only.
- Homepage, project list, and project hero render that image without a source set or intrinsic dimensions.
- `.build-visual img` presents the homepage slot at a wide 16/8.8 crop with `object-fit: cover` and top-center positioning.
- The project hero uses the near-square composition; preserve it.

## Scope

**In scope**:
- `static/images/studio/studio-create-prompt-640.webp`
- `static/images/studio/studio-create-prompt-960.webp`
- `static/images/studio/studio-create-prompt-wide-640.webp`
- `static/images/studio/studio-create-prompt-wide-1200.webp`
- `content/projects/sirv-studio.md` frontmatter only
- `layouts/partials/home.html`
- `layouts/projects/list.html`
- `layouts/projects/single.html`

**Out of scope**: project prose/style block, existing source/OG image, CSS, remote image branches, copy, or layout.

## Git workflow

- Branch: `improve/016-responsive-studio-feature`
- Commit: `Right-size the Studio feature image`
- Do not push or open a PR.

## Steps

### Step 1: Create aspect-preserving and wide variants

Require ImageMagick. Run these exact commands from the committed source:

```bash
magick static/images/studio/studio-create-prompt.webp -resize '640x640>' -quality 76 static/images/studio/studio-create-prompt-640.webp
magick static/images/studio/studio-create-prompt.webp -resize '960x960>' -quality 76 static/images/studio/studio-create-prompt-960.webp
magick static/images/studio/studio-create-prompt.webp -resize '640x352^' -gravity north -extent 640x352 -quality 76 static/images/studio/studio-create-prompt-wide-640.webp
magick static/images/studio/studio-create-prompt.webp -resize '1200x660^' -gravity north -extent 1200x660 -quality 76 static/images/studio/studio-create-prompt-wide-1200.webp
```

The aspect-preserving variants must be exactly 640×637 and 960×956; the top-centered wide crops exactly 640×352 and 1200×660. Do not upscale or overwrite the original. Verify dimensions with `identify`; each 640 variant must be smaller than its corresponding large variant, and every variant must be smaller than the 133,508-byte original.

### Step 2: Add optional image metadata and consume it safely

Add these exact single-line frontmatter fields while keeping `image` unchanged as the canonical fallback/OG-compatible project image:

```yaml
image_srcset: "/images/studio/studio-create-prompt-640.webp 640w, /images/studio/studio-create-prompt-960.webp 960w, /images/studio/studio-create-prompt.webp 1342w"
image_width: 1342
image_height: 1336
image_wide: "/images/studio/studio-create-prompt-wide-1200.webp"
image_wide_srcset: "/images/studio/studio-create-prompt-wide-640.webp 640w, /images/studio/studio-create-prompt-wide-1200.webp 1200w"
image_wide_width: 1200
image_wide_height: 660
```

Consume these optional fields in all five local-image branches: homepage current build and selected work, project list, and system/non-system project single. Preserve the existing single-`src` fallback with no empty optional attributes for every other project. Homepage/list placements prefer the wide source/variants; both project-single branches prefer the aspect-preserving variants. Add explicit `width` and `height` only when matching metadata exists.

Use these exact per-placement `sizes` values when the matching srcset exists:

- homepage current build: `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 12rem - 15vw), (max-width: 1200px) calc(100vw - 16rem - 15vw), 95rem`;
- homepage selected work: `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 65vw, 78rem`;
- project-list lead: `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 66vw, 80rem`;
- project-list regular: `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 46vw, 57rem`;
- system project single: `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 900px) calc(100vw - 8vw), (max-width: 1200px) 58vw, 72rem`;
- non-system project single: `(max-width: 680px) calc(100vw - 3.6rem), (max-width: 1480px) calc(100vw - 8vw), 134rem`.

Inside homepage and list `with .Params.image` blocks, read metadata only from the already bound `$project.Params`; `.` is the image string there. In both single-page branches, read page metadata from the root `$` context. Do not resolve optional fields from the image string context.

- Homepage current-build image: `loading="lazy"`, `decoding="async"`.
- Every project-list image, including the lead below the full-height masthead: `loading="lazy"`, no fetch priority.
- Project hero: `loading="eager"`, `fetchpriority="high"`, `decoding="async"`.

Do not add preload links, CSS, hard-coded checks for the Studio title, or change remote-image behavior established by Plan 015.

### Step 3: Verify and commit

Require the dispatcher-provided production binary at `/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1/hugo` to report v0.161.1. Run the gate with `PATH=/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1:/home/igor/Projects/new-varyvoda.com/bin:$PATH HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-016 make quality-gate`. Render to a newly created temporary destination with the same Hugo binary and `HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-016`. Inspect home, project list, and Studio project HTML for the exact variant URLs, `srcset`, `sizes`, dimensions, and priority attributes above.

Then create a second disposable content fixture under a new `mktemp -d` and copy all of `content/` while preserving section structure. In that scratch copy only:

1. Change Earth Roulette's `image` and add all seven Studio metadata fields—`image_srcset`, `image_width`, `image_height`, `image_wide`, `image_wide_srcset`, `image_wide_width`, and `image_wide_height`—then remove its `hero_flow` block. This exercises metadata on selected work, a regular list entry, and a non-system project.
2. Change BudJet's `image` to the canonical local Studio image, add none of the seven optional fields, and remove its `hero_flow` block. This exercises the metadata-free local fallback in the same homepage/list/non-system contexts.
3. Leave Slovocard unchanged as a remote-image control.

Render with the exact Hugo binary, the same writable cache, `--contentDir` pointing to that copy, and a separate temporary destination. For Earth Roulette inspect the correct `$project.Params`/root-context metadata, per-placement `sizes`, loading, dimensions, and valid fallback `src`. For BudJet assert the canonical local `src` is present and `srcset`, `sizes`, `width`, and `height` are absent in every exercised placement. For Slovocard assert its remote-image markup remains unchanged and valid. Remove both scratch trees before committing; no fixture may enter Git.

Before committing, inspect `git diff "$BASE_REF"` in full: require the Studio content hunk to be frontmatter-only and layout hunks to modify only local-image branches, with project prose, embedded CSS, and remote branches byte-for-byte unchanged. Commit, then use the recorded `BASE_REF` to run `git diff --check "$BASE_REF"...HEAD` and confirm the plan-local diff includes exactly the eight in-scope paths. The cumulative branch may also contain Plan 015/020 files before `BASE_REF`. Status must be clean.

## Done criteria

- [ ] Four correctly dimensioned, smaller WebP variants exist.
- [ ] Homepage/list use wide variants; project single uses aspect-preserving variants.
- [ ] All five local branches support the optional metadata without empty fallback attributes.
- [ ] Homepage and every project-list image are lazy; only the project hero retains deliberate eager/high priority.
- [ ] Other projects retain a valid fallback.
- [ ] Project prose, CSS, source image, and remote-image branches are unchanged.

## STOP conditions

- ImageMagick is unavailable or required crops damage the UI's focal area.
- Optional metadata cannot be implemented without breaking other projects.
- The immutable reviewed Plan 020 SHA is not the exact starting HEAD or its cumulative Plan 015 image branches have materially drifted.
- Build/render verification fails twice.

## Maintenance notes

Plan 017 may branch from this approved commit. Future featured projects can opt into the same metadata without requiring template changes.
