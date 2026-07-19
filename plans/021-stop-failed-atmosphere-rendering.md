# Plan 021: Stop failed atmospheric rendering and complete fallback handoff

> **Executor instructions**: This corrective plan starts from Plan 018's rejected cumulative commit. Follow every step, do not launch a browser, and stop on a STOP condition. The reviewer maintains `plans/README.md`.
>
> **Dispatcher note**: Before execution, the reviewer creates the named branch/worktree from the exact rejected Plan 018 commit below.
>
> **Execution precondition**: Run `test "$(git branch --show-current)" = "improve/021-stop-failed-atmosphere-rendering" && test "$(git rev-parse HEAD)" = "c06f2c7dddb770d9b9813c2739629f93baa6031b" && test -z "$(git status --porcelain)"`. STOP unless all pass. Set `BASE_REF=c06f2c7dddb770d9b9813c2739629f93baa6031b`.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: MED
- **Depends on**: 018 implementation commit (rejected review baseline)
- **Category**: perf/bug
- **Planned at**: commit `c06f2c7`, 2026-07-19

## Why this matters

Plan 018's final review confirmed that a skyline image failure locks the visible fallback but leaves `contextAvailable` true. The recursive renderer therefore keeps drawing a full-screen WebGL scene behind the fallback indefinitely. The fallback's `hidden` property is also overridden by the shared `.ambient-canvas { display: block; }` rule, so the successful path keeps painting the gradient beneath an opaque canvas. Correct both failure and success handoffs without changing shaders, texture selection, scheduling, or layout.

## Scope

**In scope**:
- `assets/js/atmosphere.js`
- `assets/css/custom.css`
- `scripts/test-atmosphere-sources.js`

**Out of scope**: templates, shaders, source assets/URLs, GL setup/uploads, responsive selection, bootstrap delays, renderer eligibility rules, observer inventory, content, and layouts.

## Git workflow

- Branch: `improve/021-stop-failed-atmosphere-rendering`
- Commit: `Stop failed atmospheric rendering`
- Do not push or open a PR.

## Steps

### Step 1: Make both handoffs real

Add this exact CSS rule after the ready-canvas rule:

```css
.ambient-canvas-fallback[hidden] {
  display: none;
}
```

This restores the native `hidden` contract despite `.ambient-canvas { display: block; }`, so a successful first draw stops painting the gradient layer.

Change only `skylineImage.onerror` to set `contextAvailable = false`, call `updateAnimationState(performance.now())` to cancel and account for the active renderer segment, then call `showAtmosphereFallback()`. Keep that exact order. This works whether the error races before frame one or arrives later: `fallbackLocked` prevents reveal, and renderer eligibility becomes permanently false. Do not put renderer cancellation into the shared helper because the getContext/program failure paths return before lifecycle setup and context loss already owns its state transition.

### Step 2: Strengthen focused regression checks

Update the existing skyline-slice normalization so its exact new three-line failure body normalizes back to Plan 019's single `canvas.classList.add("ambient-canvas-fallback");` line before asserting the unchanged hash. Require the normalization target exactly once.

Add source assertions for:

- the exact three-line skyline failure order;
- one `.ambient-canvas-fallback[hidden]` CSS rule with `display: none`;
- exactly two `requestAnimationFrame(` call sites;
- one `requestIdleCallback(` site containing `{ timeout: 800 }`;
- one bootstrap `setTimeout` with delay `100`;
- `restartBootstrap()` incrementing generation, calling `cancelBootstrap()`, resetting the frame count, checking `document.hidden`, and scheduling only one fresh RAF in that order;
- the final idle/timer path still calling `bootWhenReady(generation)`, whose first guard checks generation, `document.hidden`, and `booted`.

Keep every existing image-dimension, URL, shader/upload, draw/lifecycle hash, fallback latch, and DOM-free assertion. The new scheduler assertions are focused structural coverage; do not attempt a second scheduler implementation inside the test.

### Step 3: Verify and commit

Run:

```bash
node --check assets/js/atmosphere.js
node scripts/test-atmosphere-sources.js
PATH=/tmp/new-varyvoda-improve-codex-tUy9MH/hugo-0.161.1:/home/igor/Projects/new-varyvoda.com/bin:$PATH HUGO_CACHEDIR=/tmp/new-varyvoda-hugo-cache-021 make quality-gate
git diff --check
```

Inspect the complete base diff and require only the two-line behavior addition in the skyline handler, the hidden CSS rule, and matching tests. Commit, then run `git diff --check "$BASE_REF"...HEAD`, require exactly the three in-scope paths, and require clean status. Reviewer browser verification remains required for the cumulative branch.

## Done criteria

- [ ] Skyline failure makes renderer eligibility false and cancels any recursive frame.
- [ ] Fallback stays visible for failure regardless of event order.
- [ ] Successful handoff actually removes the fallback layer from display.
- [ ] Bootstrap timing, shaders, textures, and Plan 013 lifecycle are otherwise unchanged.
- [ ] Syntax, focused tests, production-pinned full gate, scope, and clean status pass.

## STOP conditions

- Fix requires changing shaders, texture selection, or bootstrap timing.
- Existing focused invariant hashes fail outside the intended skyline normalization.
- Build/source test fails twice.
- Any out-of-scope path changes.

## Maintenance notes

Integrate Plan 021 instead of rejected Plan 018. Its branch cumulatively includes reviewed Plans 014/019 plus the corrected delayed bootstrap.
