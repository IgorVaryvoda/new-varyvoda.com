# Plan 019: Correct atmospheric textures for WebGL1 completeness

> **Executor instructions**: This corrective plan starts from Plan 014's rejected commit and replaces only the invalid mountain variants plus its regression-gate wiring. Follow every step, do not launch a browser, and stop on a STOP condition. The reviewer maintains `plans/README.md`.
>
> **Dispatcher note**: Before execution, the reviewer creates the named branch/worktree from the exact rejected baseline below.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/019-power-of-two-atmosphere-assets" && test "$(git rev-parse HEAD)" = "dc10707a82754d28e340fda8eda070111bbb6131" && test -z "$(git status --porcelain)"`. STOP unless all pass.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: 014 implementation commit (rejected review baseline)
- **Category**: perf/bug
- **Planned at**: commit `dc10707`, 2026-07-18

## Why this matters

Plan 014's review found that its 1280×640 and 1600×800 mountain textures are non-power-of-two. The unchanged WebGL1 upload path uses `LINEAR_MIPMAP_LINEAR` and `generateMipmap`, so those textures are incomplete in WebGL1 even though builds and source tests pass. Replace them with power-of-two 1024×512 and 2048×1024 assets, and make the focused source test part of the actual local and CI gates.

## Scope

**In scope**:
- remove `static/images/herceg-novi-mountains-1280.webp`
- remove `static/images/herceg-novi-mountains-1600.webp`
- add `static/images/herceg-novi-mountains-1024.webp`
- add `static/images/herceg-novi-mountains-2048.webp`
- `layouts/_default/baseof.html`
- `assets/js/atmosphere.js`
- `scripts/test-atmosphere-sources.js`
- `Makefile`
- `.github/workflows/main.yml`

**Out of scope**: day/ship variants, shaders, GL upload/filter/mipmap behavior, resize/lifecycle code, CSS, content, and responsive reloading after viewport resize.

## Git workflow

- Branch: `improve/019-power-of-two-atmosphere-assets`
- Commit: `Keep atmospheric mipmaps WebGL1-safe`
- Do not push or open a PR.

## Steps

### Step 1: Replace invalid mountain assets

Require `/usr/bin/magick`. Generate from the committed original:

```bash
magick static/images/herceg-novi-mountains.webp -resize '1024x512!' -quality 72 static/images/herceg-novi-mountains-1024.webp
magick static/images/herceg-novi-mountains.webp -resize '2048x1024!' -quality 76 static/images/herceg-novi-mountains-2048.webp
```

Both dimensions are exact powers of two and preserve the source's 2:1 aspect. Verify 1024×512 and 2048×1024 with `identify`, each smaller than the 79,444-byte original, then remove only the two invalid Plan 014 files.

### Step 2: Rewire names without touching GL behavior

Change the base canvas's small/large mountain datasets to the 1024/2048 files and update the JavaScript fallback name. Extend `selectAtmosphereSceneSource` with a required `smallMaxWidth` argument and compare `effectiveWidth` against it. Pass `1280` from the day call (preserving day selection exactly) and `1024` from the mountain call. Test day at 1279/1280/1281 and mountain at 1023/1024/1025 so a 1280-pixel mountain render is never assigned the 1024 texture.

Update the source test's exact template/source expectations. Add a self-contained WebP dimension reader to the Node test (parse RIFF `VP8X`, `VP8L`, and lossy `VP8` headers directly; do not shell out). Assert these actual committed files and dimensions: day 1280×854 and 1920×1280, mountains 1024×512 and 2048×1024, and cruise ship 512×256. Assert both mountain axes are powers of two; day remains exempt because its upload path uses `LINEAR` and never generates mipmaps. The ship assertion exercises `VP8L`; also construct a minimal in-memory `VP8X` header with known dimensions and run it through the same reader. Fail on malformed RIFF/WEBP signatures, truncated chunks, unsupported chunks, or invalid dimensions.

Protect the entire JavaScript file, not selected slices. In the committed test, read `assets/js/atmosphere.js`, require each of the five intended edits below to occur exactly once, normalize only those exact new strings back to the baseline strings, and assert the normalized full-file SHA-256 is `9166c64b5600dacd7ca8797d5729a3fab01b533da8997ebe7930caca31830cd1` (the complete file at `dc10707a82754d28e340fda8eda070111bbb6131`):

1. the helper signature with added `smallMaxWidth` → the baseline five-argument signature;
2. the `effectiveWidth <= smallMaxWidth` condition → baseline `effectiveWidth <= 1280`;
3. the day call's final `window.devicePixelRatio || 1,\n    1280` → its baseline form without the comma/limit;
4. the mountain call's final `window.devicePixelRatio || 1,\n    1024` → its baseline form without the comma/limit;
5. mountain fallback `/images/herceg-novi-mountains-2048.webp` → `/images/herceg-novi-mountains-1600.webp`.

This self-contained normalization replaces history-dependent `git show` comparisons, works in shallow CI, and proves skyline upload, shaders, every GL upload/mipmap/filter block, drawing, resize, scheduler, listeners, observer, and bootstrap remain byte-for-byte identical outside the intended selector/URL edits. Keep exact independent expectations for day, mountain, and ship assignments as well.

### Step 3: Put the focused test in both gates

Change the Make target to this exact ordering so the focused test terminates before Hugo work starts:

```make
quality-gate:
	node scripts/test-atmosphere-sources.js
	$(MAKE) build
	$(HTMLTEST) -c .htmltest.yml
```

Add the same terminating Node command to `.github/workflows/main.yml` after checkout/Hugo setup and before the Hugo build. Do not otherwise edit workflow actions, versions, deploy, or Make targets.

Run:

```bash
node --check assets/js/atmosphere.js
node scripts/test-atmosphere-sources.js
PATH=/home/igor/Projects/new-varyvoda.com/bin:$PATH HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-019 make quality-gate
git diff --check
```

Commit, then verify `git diff --check dc10707a82754d28e340fda8eda070111bbb6131...HEAD`, exact in-scope path changes, and clean status. Reviewer browser verification remains required for the final cumulative branch.

## Done criteria

- [ ] Selected mountain assets are 1024×512 and 2048×1024, power-of-two, and smaller than the original.
- [ ] Invalid NPOT mountain variants are absent.
- [ ] Canvas datasets/test/fallback name the new files.
- [ ] WebGL upload/mipmap/filter/shader/resize/lifecycle code is unchanged.
- [ ] Focused test runs directly, via `make quality-gate`, and in CI workflow.
- [ ] Full gate, scope, whitespace, and clean-status checks pass.

## STOP conditions

- Correctness requires changing GL upload/filter/mipmap behavior.
- Generated files are not exact power-of-two dimensions or fail the original-size budget.
- Gate/source test fails twice.
- Any day/ship asset or out-of-scope workflow behavior changes.

## Maintenance notes

Responsive source selection remains intentionally one-shot at page load to avoid loading two texture sizes during ordinary window resizing. Plan 018 must branch from this reviewed correction, not rejected Plan 014 directly.
