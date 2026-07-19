# Plan 014: Serve right-sized atmospheric textures

> **Executor instructions**: Follow this plan exactly. Do not launch a browser. Run every verification and stop on a STOP condition. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Execution precondition**: The dispatcher creates the isolated worktree/branch at the named commit and supplies this uncommitted plan out-of-tree through the executor runner. Run `test "$(git branch --show-current)" = "improve/014-responsive-atmosphere-assets" && test "$(git rev-parse HEAD)" = "8819dc5b2b31a697838439734608a9b07a63e353" && test -z "$(git status --porcelain)"`. STOP unless all checks pass.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `8819dc5`, 2026-07-18

## Why this matters

The atmospheric renderer immediately downloads about 426 KB of scene textures on every route. The day and mountain sources are substantially larger than the renderer's effective mobile and standard-desktop resolution, while the transparent ship is still PNG. Right-sized WebP variants reduce the scene payload to roughly 136 KB on mobile and 192 KB on standard desktop without changing the composition.

## Current state

- `static/images/herceg-novi-day.webp` is 2560×1707 and 241,502 bytes.
- `static/images/herceg-novi-mountains.webp` is 2048×1024 and 79,444 bytes.
- `static/images/herceg-novi-cruise-ship.png` is 512×256 and 104,708 bytes.
- `layouts/_default/baseof.html` exposes one URL per photo through canvas data attributes.
- `assets/js/atmosphere.js` assigns those URLs directly to `Image.src` before its renderer starts.
- `resize()` uses a 1.0 scale below DPR 1.5 and 0.5 otherwise. Preserve that math and all shader/texture upload behavior.

## Scope

**In scope**:
- `static/images/herceg-novi-day-1280.webp`
- `static/images/herceg-novi-day-1920.webp`
- `static/images/herceg-novi-mountains-1280.webp`
- `static/images/herceg-novi-mountains-1600.webp`
- `static/images/herceg-novi-cruise-ship.webp`
- `layouts/_default/baseof.html`
- `assets/js/atmosphere.js`
- `scripts/test-atmosphere-sources.js`

**Out of scope**: original assets, skyline, GLSL, WebGL setup/uploads, canvas resolution policy, CSS, content, preload tags, and renderer scheduling.

## Git workflow

- Branch: `improve/014-responsive-atmosphere-assets`
- Commit: `Right-size atmospheric textures`
- Do not push or open a PR.

## Steps

### Step 1: Generate deterministic variants

Require ImageMagick: `command -v magick`. STOP if unavailable. Generate the five files from the committed originals:

```bash
magick static/images/herceg-novi-day.webp -resize '1280x1280>' -quality 72 static/images/herceg-novi-day-1280.webp
magick static/images/herceg-novi-day.webp -resize '1920x1920>' -quality 76 static/images/herceg-novi-day-1920.webp
magick static/images/herceg-novi-mountains.webp -resize '1280x1280>' -quality 72 static/images/herceg-novi-mountains-1280.webp
magick static/images/herceg-novi-mountains.webp -resize '1600x1600>' -quality 76 static/images/herceg-novi-mountains-1600.webp
magick static/images/herceg-novi-cruise-ship.png -define webp:lossless=true static/images/herceg-novi-cruise-ship.webp
```

Verify dimensions, alpha, and budgets. The day variants must be 1280×854 and 1920×1280; mountain variants 1280×640 and 1600×800; ship 512×256 with alpha. Each mobile day/mountain variant must be smaller than its larger counterpart; each new file must be smaller than its original. Use `identify` and `stat -c '%n %s'` to record evidence.

### Step 2: Expose both scene sizes and choose before requesting

In the canvas markup, change `data-day-scene` to `/images/herceg-novi-day-1920.webp` and `data-mountain-scene` to `/images/herceg-novi-mountains-1600.webp`; add `data-day-scene-small` and `data-mountain-scene-small` for the matching 1280 variants. Change the ship source in JavaScript to the lossless WebP.

Define one pure top-level `selectAtmosphereSceneSource(largeUrl, smallUrl, fallbackUrl, viewportWidth, pixelRatio)` helper before the IIFE. Export it only through the browser-safe exact guard `if (typeof module !== "undefined" && module.exports) { module.exports = selectAtmosphereSceneSource; }`, and make the IIFE return before DOM access when `typeof document === "undefined"` so Node can require/evaluate the file. Calculate `effectiveWidth = Math.round(viewportWidth * pixelRatio * (pixelRatio < 1.5 ? 1 : 0.5))`. Return `smallUrl` only when `effectiveWidth <= 1280` and it exists; otherwise return `largeUrl`, then `fallbackUrl`. Immediately before assigning the day and mountain `Image.src`, call it with `canvas.clientWidth || window.innerWidth`, `window.devicePixelRatio || 1`, the matching datasets, and the named new large variant as fallback. The choice must happen before either request; do not load both sizes, use `<picture>`, add preloads, or switch sources after resize.

Do not alter the `onload` handlers, GL upload statements, shader strings, or `resize()`.

### Step 3: Verify and commit

Run:

```bash
node --check assets/js/atmosphere.js
node scripts/test-atmosphere-sources.js
make quality-gate
git diff --check
```

The Node test must require the real helper and cover DPR 1, 1.25, 1.5, and 2; exact effective widths 1279, 1280, and 1281; missing-small fallback; missing-large fallback; and one returned URL per call. It must also evaluate the real source in a VM with neither `module` nor `document` defined and receive no exception; read the real base template/source to assert the four exact dataset values, helper-based day/mountain assignments using `canvas.clientWidth || window.innerWidth`, the WebP ship assignment, and absence of original large URL assignments. Compare the shader strings, four `onload` upload blocks, and `resize()` slice with `git show 8819dc5b2b31a697838439734608a9b07a63e353:assets/js/atmosphere.js`; only source assignments/helper wiring may differ. Do not duplicate the selection formula inside the test as the implementation under test.

Record `hugo version`; CI is pinned to 0.161.1 while this workstation currently has newer 0.163.3. The newer local version is allowed but must be reported; STOP if local Hugo is older than 0.161.1.

Commit only after the commands pass, then run `git diff --check 8819dc5b2b31a697838439734608a9b07a63e353...HEAD`; confirm `git diff --name-only 8819dc5b2b31a697838439734608a9b07a63e353...HEAD` lists exactly the eight in-scope files and `git status --porcelain` is empty.

## Done criteria

- [ ] Five correctly sized WebP assets exist and beat the stated original-size budgets.
- [ ] Small/large day and mountain URLs are selected before any request.
- [ ] Mobile/effective widths at or below 1280 select small assets; larger widths select large assets.
- [ ] The real source-selection helper passes boundary, DPR, and fallback tests.
- [ ] The ship uses the lossless WebP.
- [ ] Originals, shader, GL uploads, and resolution math are unchanged.
- [ ] Syntax and quality gate pass; committed scope is exact and clean.
- [ ] Reviewer visually compares generated assets with originals before approval; executor acceptance remains provisional until that check passes.

## STOP conditions

- ImageMagick is unavailable or generated dimensions/alpha are wrong.
- A required budget cannot be met without visibly destructive quality reduction.
- Responsive selection requires altering shader, GL upload, or resize behavior.
- Build/syntax verification fails twice.

## Maintenance notes

Plan 018 depends on this plan and must branch from its approved commit because both edit `baseof.html` and `atmosphere.js`.
