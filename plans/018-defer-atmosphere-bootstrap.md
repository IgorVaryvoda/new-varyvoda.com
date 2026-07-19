# Plan 018: Defer WebGL bootstrap until after first paint

> **Executor instructions**: Follow this plan exactly. Do not launch a browser. Run every verification and stop on a STOP condition. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Dispatcher note**: Before execution, the reviewer creates and checks out the named branch/worktree from the exact approved Plan 019 commit below.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/018-defer-atmosphere-bootstrap" && test "$(git rev-parse HEAD)" = "e7760f962f1205e56fd3cccafaaf15e87dd412c6" && test -z "$(git status --porcelain)"`. STOP unless all checks pass. Set `BASE_REF=e7760f962f1205e56fd3cccafaaf15e87dd412c6`.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: HIGH
- **Depends on**: 019
- **Category**: perf
- **Planned at**: commit `8819dc5`, 2026-07-18

## Why this matters

The deferred atmosphere script still compiles and links two shader programs and starts texture requests as soon as HTML parsing finishes. That competes with first paint on every route. A CSS fallback can own initial paint while initialization moves to the browser's idle window with a bounded timeout.

## Current state

- `baseof.html` renders the canvas and a deferred atmosphere bundle on every route.
- `atmosphere.js` is one IIFE. It creates WebGL state, compiles/links shaders synchronously, then requests four textures.
- Plan 013 already centralizes renderer lifecycle and pauses it away from visible atmospheric surfaces. Preserve all of that behavior.
- Plan 014 changes the canvas data attributes and responsive texture source selection. Preserve those changes.
- `.ambient-canvas-fallback` already provides a non-WebGL visual fallback.

## Scope

**In scope**:
- `layouts/_default/baseof.html`
- `assets/js/atmosphere.js`
- `scripts/test-atmosphere-sources.js`
- `assets/css/custom.css`

**Out of scope**: shaders, GL setup/uploads, textures and source selection, renderer lifecycle, resolution, canvas visibility rules, CSS colors, content, dependencies, service workers, and route-specific removal.

## Git workflow

- Branch: `improve/018-defer-atmosphere-bootstrap`
- Commit: `Defer atmospheric rendering bootstrap`
- Do not push or open a PR.

## Steps

### Step 1: Make fallback state explicit at first paint

The existing gradient cannot safely remain on an opaque WebGL canvas after context creation. Render a separate, non-canvas `<div class="ambient-canvas ambient-canvas-fallback" data-atmosphere-fallback aria-hidden="true"></div>` immediately before the existing canvas. Keep every existing canvas data attribute unchanged, add `ambient-canvas-renderer` to the canvas class, and leave the fallback layer initially visible beneath it.

In CSS, make `.ambient-canvas-renderer` transparent until it has `shader-ready`; the ready class reveals it with no transition. Keep the existing light/dark fallback gradients on the separate layer. Do not add visual styles beyond the visibility handoff.

In JavaScript, require both `[data-atmosphere]` and `[data-atmosphere-fallback]`, binding the latter as `atmosphereFallback`. Add `fallbackLocked = false`. Centralize failure handoff in one `showAtmosphereFallback()` that first sets `fallbackLocked = true`, then sets `atmosphereFallback.hidden = false` and removes `shader-ready` from the canvas. Replace the existing getContext, program-link, skyline-error, and context-loss canvas-class additions with that helper. Add `firstDrawCompleted = false`; only while it is false and fallback has never been locked, at the end of the first successfully completed `drawFrame()` after both GL draw calls, use this exact block:

```js
    if (!firstDrawCompleted && !fallbackLocked) {
      canvas.classList.add("shader-ready");
      atmosphereFallback.hidden = true;
      firstDrawCompleted = true;
    }
```

This keeps the existing `shader-ready` success marker at the same boundary, covers reduced-motion's synchronous draw, and prevents a skyline error that races before the first frame—or any later fallback re-shown by skyline/context failure—from being erased by subsequent frames. Every early return, context failure, shader compile/link failure, or exception before the first successful draw leaves the separate fallback visible.

### Step 2: Schedule one idempotent bootstrap

Refactor only the outer ownership of the existing IIFE into an idempotent `bootAtmosphere()`; do not reformat or change the internal shader/texture/lifecycle implementation. Use one finite bootstrap `requestAnimationFrame` call site plus a frame counter to wait for exactly two frames, then use `requestIdleCallback(callback, { timeout: 800 })`. Where idle callbacks are unsupported, use `setTimeout(callback, 100)` after those frames. The 800 ms idle timeout begins after the two frames and is a best-effort browser deadline, not an absolute page-load guarantee. Ensure only one boot can occur if callbacks race or lifecycle events fire.

The entire bootstrap scheduler must return before any `window`/`document` access when `typeof document === "undefined"`, preserving Plan 019's Node/VM contract. Install one named temporary bootstrap visibility listener before any bootstrap RAF. A single `restartBootstrap()` must always increment the generation, cancel/invalidate every recorded RAF/idle/timer handle with its matching cancellation API, reset the frame count, and then schedule exactly one RAF only when `document.hidden` is false. Call that function once initially, so an initially hidden document schedules nothing. On every hidden or visible transition call the same restart function; visible therefore always starts a fresh two-frame sequence and no stale RAF can share its frame counter. Check generation and visibility inside every RAF plus the idle/timer callback immediately before `bootAtmosphere()`. Remove only that temporary listener after boot; preserve Plan 013's separate permanent runtime visibility listener inside `bootAtmosphere()`.

The delay must not create an ongoing timer, duplicate RAF render chain, or block reduced-motion behavior. The finite bootstrap RAF site is distinct from Plan 013's recursive renderer scheduler, producing exactly two `requestAnimationFrame(` call sites in the file. Plan 013's historical one-call verification is superseded by this plan and must not be edited; only `scheduleFrame()` may recursively own renderer frames.

### Step 3: Verify invariants and commit

Plan 019's source test currently normalizes the five corrective URL/selector edits and hashes the entire JavaScript file. Replace only that full-file hash guard because this plan intentionally changes outer bootstrap ownership and first-draw fallback handoff. Keep every helper, WebP-dimension, source URL, template dataset, and DOM-free VM assertion. Remove `crypto` only if the focused hashes below do not use it.

Add a helper that extracts each start-inclusive/end-exclusive source slice, fails when either marker is absent, and asserts these Plan 019 SHA-256 values:

| Protected slice | Start marker / end marker | SHA-256 |
|---|---|---|
| vertex shader | `  var vertexSource = \`` / `\n\n  // afl_ext` | `181b7db17fa69106a847ca79021eb99e252063769793de71a6632356fa1d3452` |
| ocean shader | `  var oceanFragmentSource = \`` / `\n\n  var postVertexSource` | `59944c79be8111be0318a9bb482e0d4beea43386c8d9a617b0c7e15f744005af` |
| post vertex shader | `  var postVertexSource = \`` / `\n\n  // Film-grain` | `7d435a767a23cb773f038a8f99f3789d0eb1c0320ce43f3dda468d7a3129135b` |
| post fragment shader | `  var postFragmentSource = \`` / `\n\n  function compile(` | `1c0388543b9ea196a2f46338e17ad64ab0366cb8bb2d906e529be135d5f9d5a0` |
| day upload/onload | `  var dayPhotoReady = 0;` / `  dayPhotoImage.src =` | `8760012bc73769da861e7e05508f0c7d9e136b6453a3529897d05cebbdbf6386` |
| mountain upload/onload | `  var mountainPhotoReady = 0;` / `  mountainPhotoImage.src =` | `a7dce3d56519fb85e12662f1d0fb1511947d689d720f1182e51db7475558caeb` |
| ship upload/onload | `  var shipReady = 0;` / `  shipImage.src =` | `e0e5379338d58c6ac6fe5ab658db430875da47095f685fd613763d616cf6c732` |
| resize | `  function resize() {` / `\n\n  var ripples` | `a676a6c302fe18af4f8e07187125c253b25af5a941f1bcce02be0d60be4287aa` |
| runtime scheduler | `  function animationEligible() {` / `\n\n  function drawFrame` | `9930f25f8309b9a75f43ccf1ca3167324275ca1d8d2fcc28cae71a578cc9542c` |

These focused hashes deliberately exclude only the outer wrapper/scheduler and `drawFrame()` fallback-success line owned by this plan; they keep shaders, GL texture uploads, source selection, resize, and Plan 013's recursive renderer scheduler protected without making every future JavaScript edit regenerate a whole-file checksum.

Add these further protections from the Plan 019 source:

| Protected slice | Start marker / end marker | SHA-256 |
|---|---|---|
| framebuffer setup | `  var framebuffer = gl.createFramebuffer();` / `\n\n  function resize()` | `d4ad862aa35b943eec54aec3a55cae6b737c07dee0bbe51ffcf03e5cde5164ae` |
| interaction and active clock | `  var ripples = [];` / `\n\n  function animationEligible()` | `9f1ff88b2fef294d39bad3de1fab47a5d452aa5eb20e4d7c95e313f0716b5af9` |

For the three slices that intentionally receive only fallback plumbing, normalize exact planned snippets back to their Plan 019 form before hashing and require every normalization target exactly once:

- skyline upload/error slice (`  var skylineImage = new Image();` / `\n\n  var dayPhotoReady`) → `78b8763da96e2943a22e6b5d30704a51c0a0960e09f1e1badb42faf5d14c759b` after replacing its one `showAtmosphereFallback();` with baseline `canvas.classList.add("ambient-canvas-fallback");`;
- complete `drawFrame` slice (`  function drawFrame(` / `\n\n  function refreshFrame()`) → `5e5cd51bdd73aaefc234c7a8a6ebe900d93f5af5055d3e8f5115b0129bca8769` after replacing the exact one-time ready/fallback/sentinel block with baseline `canvas.classList.add("shader-ready");`;
- post-draw lifecycle (`  function refreshFrame()` / `\n\n  resize();`) → `7a76e2de5e0193aa8f088d3b895a8d87e54a942d550e53d55f8637c38ec6d4c8` after replacing its one context-loss `showAtmosphereFallback();` with baseline `canvas.classList.add("ambient-canvas-fallback");`.

Also assert the separate fallback element, hidden/ready CSS rules, a single `fallbackLocked = false` initialization, the `fallbackLocked = true` statement inside `showAtmosphereFallback`, a single helper definition, exactly four helper call sites, and the exact one `if (!firstDrawCompleted && !fallbackLocked)` guard. These checks cover the previously omitted skyline, framebuffer, input/clock, draw, resize/theme/visibility/context, and observer regions while allowing only this plan's explicit fallback plumbing.

Run `node --check assets/js/atmosphere.js`, `node scripts/test-atmosphere-sources.js`, and `PATH=/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1:/home/igor/Projects/new-varyvoda.com/bin:$PATH HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-018 make quality-gate`. Plan 019's real helper and DOM-free VM evaluation must still pass. Then run static assertions:

```bash
test "$(rg -o 'getContext\("webgl"' assets/js/atmosphere.js | wc -l)" -eq 1
test "$(rg -o 'requestAnimationFrame\(' assets/js/atmosphere.js | wc -l)" -eq 2
rg -n 'requestIdleCallback|timeout: 800|setTimeout|document\.hidden|visibilitychange|ambient-canvas-fallback|shader-ready' assets/js/atmosphere.js
node -e 'const s=require("fs").readFileSync("assets/js/atmosphere.js","utf8");const hide=s.indexOf("atmosphereFallback.hidden = true");const lastDraw=s.lastIndexOf("gl.drawArrays");if(hide<0||hide<lastDraw)process.exit(1)'
```

Inspection must confirm the fallback timer is exactly 100 ms, the callback performs the final hidden check, the temporary visibility listener is named/removed, and only `scheduleFrame()` recursively owns renderer frames. Review the diff and verify shader strings, GL statements, texture URLs/selection, resize math, active-time clock, observer selector inventory, and renderer scheduler are byte-for-byte unchanged aside from the outer wrapper/fallback handoff.

Commit, then run `git diff --check "$BASE_REF"...HEAD` and confirm the plan-local diff contains exactly the four in-scope files. Status must be clean. Executor verdict remains provisional until reviewer-only browser verification passes.

## Test plan

Executor performs static/syntax/build tests only. Reviewer-only browser verification must inspect homepage and article at desktop/mobile sizes in both themes:

1. fallback is present at first paint with no blank/transparent flash;
2. WebGL initializes after first paint and removes fallback once ready;
3. texture loading/scene appearance still completes;
4. hidden initial tab does not initialize until visible;
5. instrument `HTMLCanvasElement.prototype.getContext` and `requestAnimationFrame` before reload to count one WebGL context and one recursive renderer chain;
6. reduced motion and Plan 013 pause/resume behavior remain intact;
7. hide after bootstrap frame one, then show; two new visible frames occur before boot;
8. force `getContext("webgl")` to return null and separately force shader compilation failure; both retain fallback permanently.

## Done criteria

- [ ] Initial markup has a separate fallback layer beneath a hidden-until-ready canvas.
- [ ] Boot occurs after exactly two frames plus an 800 ms-timeout idle callback or exact 100 ms fallback timer.
- [ ] Hidden documents wait for visibility; boot is idempotent.
- [ ] Fallback remains through WebGL/bootstrap/first-draw failures and is removed only after the first successful complete draw; later texture/renderer semantics are unchanged.
- [ ] Plan 013 lifecycle and Plan 014 responsive-source behavior remain unchanged.
- [ ] Syntax, quality gate, scope, and clean-status checks pass.

## STOP conditions

- The immutable reviewed Plan 019 SHA is not the exact starting HEAD or Plan 013 lifecycle invariants are absent.
- Correctness requires shader, texture, resolution, or lifecycle changes.
- Fallback cannot cover the delay without new visual CSS.
- Syntax/build verification fails twice.

## Maintenance notes

The 800 ms timeout bounds time-to-scene; it is not a recurring render timer. Reviewer browser proof is required because executor policy forbids browser access.
