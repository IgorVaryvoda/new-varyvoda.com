# Plan 013: Pause the atmospheric renderer when no scene surface is visible

> **Executor instructions**: Follow this plan exactly, running each verification. Do not launch a browser; report browser verification as skipped for the reviewer. Stop on a STOP condition. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Execution precondition and drift check (run first)**: Run `test "$(git branch --show-current)" = "improve/013-route-aware-atmosphere" && test "$(git rev-parse HEAD)" = "756cff0b45e6b896ceba2572db1cf4cb00142ac5" && test -z "$(git status --porcelain)"` in the isolated worktree. STOP unless the branch, baseline, and completely clean state all match. The user's concurrent uncommitted shader tuning remains only in the main checkout; this lifecycle branch intentionally starts from committed shader state so its diff stays separable and cherry-pickable.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: HIGH
- **Depends on**: none
- **Category**: perf
- **Planned at**: commit `756cff0`, 2026-07-18 (committed scoped file unchanged from audited `a450b29`)

## Why this matters

The fixed WebGL renderer runs on every animation frame for every route, including while long opaque article/project reading surfaces completely cover the scene. That wastes GPU/battery without changing visible pixels. The scene must keep animating in the homepage opening, atmospheric inner-page heroes, immersive project mastheads, and shared footer, but pause between those regions and resume without a jump, duplicate loop, or broken theme transition.

## Current state

- `layouts/_default/baseof.html:63` renders one fixed `[data-atmosphere]` canvas on every route; lines 71-76 load `assets/js/atmosphere.js` everywhere.
- Existing scene-bearing surfaces are stable first-party classes in `assets/css/custom.css`: `.site-header`, `.home-intro`, `.tide-gate`, `.project-masthead--system` (not the opaque base `.project-masthead`), `.work-masthead`, `.writing-masthead`, `.about-stage`, `.contact-stage`, `.article-hero`, and `.site-footer`.
- `assets/js/atmosphere.js:1110-1164` draws both passes and recursively schedules `requestAnimationFrame(render)` while `running`.
- `assets/js/atmosphere.js:1181-1184` toggles `running` for document visibility but can directly request another frame.
- Reduced motion has no recursive RAF loop, but intentionally permits one-shot redraws for the initial frame, async texture uploads, resize, and theme changes. Preserve that contract so static canvases receive loaded textures.
- Pointer ripples are registered globally at lines 1101-1108. They should not accumulate while animation is paused under an opaque surface.
- Do not change shader strings, uniforms, GL texture upload/setup statements, scene composition, color, resolution policy, or canvas markup. Lifecycle-only calls to the centralized one-shot refresh are explicitly permitted in all four texture `onload` handlers, including `skylineImage.onload`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Syntax | `node --check assets/js/atmosphere.js` | exit 0 |
| Build and HTML gate | `make quality-gate` | exit 0; htmltest passes |
| Scope | `git diff --name-only 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD` | exactly `assets/js/atmosphere.js` after the implementation commit |

## Scope

**In scope**:
- `assets/js/atmosphere.js`

**Out of scope**:
- GLSL/shader source, textures, scene geometry, resolution and DPR logic
- CSS, HTML/templates, content, copy, theme system
- Adding dependencies, tests requiring a browser, service workers, or timers that run in the background

## Git workflow

- Branch: `improve/013-route-aware-atmosphere`
- One commit after verification: `Pause hidden atmospheric rendering`
- Do not push or open a PR.

## Steps

### Step 1: Centralize animation-frame ownership

Split rendering into a side-effect-free scheduling boundary: `drawFrame(now, sceneTime)` owns resize/uniform/draw work and never reads, clears, cancels, or schedules a RAF; one RAF callback alone clears `frameRequest`, confirms eligibility, updates active time, calls `drawFrame`, and reschedules through one idempotent scheduler. The scheduler requests only when animation is eligible and `frameRequest === null`.

Define animation eligibility from all of: not reduced-motion, document not hidden, WebGL context still available, and at least one scene surface intersecting the viewport (or the documented observer fallback). Preserve a one-shot refresh for reduced motion, resize, theme changes while visibly paused, and async texture loads. Each of the four texture load completions must call the centralized refresh after its unchanged GL upload statements; this adds lifecycle hooks without altering texture setup. The refresh must return without drawing while `document.hidden`; the next visible eligible frame will use the current texture/theme state. Otherwise, a one-shot refresh must cancel and clear any pending RAF before drawing synchronously, then schedule at most one replacement only if eligibility remains true. This prevents a leave → refresh → re-enter sequence from forking render chains.

Replace the fixed wall-clock `startTime` calculation with an accumulated active-time clock. On an eligible→paused transition, add only the completed active segment; on paused→eligible, start a new segment. `sceneTime` must exclude time spent hidden or with no visible scene so clouds, ship, water, and noise resume continuously rather than jumping. Use the same `currentSceneTime(now)` helper for draw uniforms and `screenToWater` ripple timestamps. Reduced motion may keep its fixed static time of `3`.

Name the scheduler `scheduleFrame`. **Verify**: `test "$(rg -o "requestAnimationFrame\(" assets/js/atmosphere.js | wc -l)" -eq 1 && rg -n "requestAnimationFrame|cancelAnimationFrame|function scheduleFrame" assets/js/atmosphere.js` → exactly one request call exists and inspection confirms it is inside `scheduleFrame`; every cancellation site is visible for lifecycle review.

### Step 2: Observe actual atmospheric surfaces

Collect exactly `.site-header, .home-intro, .tide-gate, .project-masthead--system, .work-masthead, .writing-masthead, .about-stage, .contact-stage, .article-hero, .site-footer` and attach one `IntersectionObserver` with a minimal positive threshold. Do not include the opaque base `.project-masthead`. Track a Set of intersecting elements instead of trusting only the most recent entry. Treat eligibility as continuous until the observer delivers its initial entries, then transition from the complete Set. When the first region becomes visible, resume through the scheduler; when the last leaves, stop scheduling after/cancel the current pending frame through the centralized lifecycle.

Use a safe fallback: if `IntersectionObserver` is unavailable or no scene regions are found, retain continuous animation rather than producing a frozen site. Keep the observer local to this script and do not add DOM marker attributes or template changes.

Update document-visibility handling to run the same active-clock eligibility transition and scheduler. While visibly paused, theme changes and resizes must request one one-shot refresh so the next visible scene is current without starting a loop; hidden documents defer the draw. While animation is eligible, resize must only call `resize()` and the idempotent scheduler so repeated resize events coalesce into the already-pending RAF instead of synchronously running the shader. For visibly paused or reduced-motion theme changes, set `nightBlend` directly to the current target before the one-shot draw; retain gradual interpolation only during an eligible recursive animation chain. Add an eligibility guard to the global pointer handler so invisible regions do not collect ripples. Preserve a separate terminal `contextAvailable`/`contextLost` flag: `webglcontextlost` cancels any pending RAF, marks the context unavailable, and later visibility/intersection/theme/resize/texture events must never render or restart it.

**Verify**: `rg -n "IntersectionObserver|home-intro|article-hero|site-footer|document\.hidden|ripples" assets/js/atmosphere.js` → observer, representative regions, visibility, and ripple guard are present.

### Step 3: Preserve the shader and pass static verification

Confirm the diff contains lifecycle/scheduling code only. GLSL strings, uniforms, GL texture upload/setup statements, and `resize()` math must be byte-for-byte unchanged. Added calls to the centralized one-shot refresh inside all four image `onload` callbacks are the only permitted texture-loader edits.

Commit the verified implementation, then run `node --check assets/js/atmosphere.js && make quality-gate && git diff --check 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD && test "$(git diff --name-only 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD)" = "assets/js/atmosphere.js" && test -z "$(git status --porcelain)"` → all pass; the committed range contains exactly atmosphere.js with no residual worktree changes.

## Test plan

- Static/syntax checks only in the executor; do not launch a server or browser.
- Read the lifecycle code and reason through:
  1. initial hero visible → one animation chain;
  2. opaque reading surface → chain stops;
  3. footer enters → chain resumes once;
  4. tab hide/show while hero visible → stops/resumes once;
  5. rapid leave → paused theme/resize refresh → re-enter → never more than one RAF chain;
  6. long pause → active scene time resumes continuously without a wall-clock jump;
  7. context loss followed by visibility/intersection/theme changes → no restart;
  8. base `.project-masthead` does not confer eligibility; on the current all-system project routes the separate header and `.project-masthead--system` do. Verify the ordinary fallback statically from the selector list/template branch, since no current content route lacks `hero_flow`; pausing would begin only after any separately observed header leaves the viewport;
  9. theme change while paused → one refresh frame, remains paused;
  10. reduced motion → no recursive RAF; initial and async texture one-shot refreshes remain allowed;
  11. missing IntersectionObserver/scene regions → old continuous behavior.
- Execution remains provisional until reviewer-only browser verification passes. Use a local Hugo preview on homepage, article, and a current system project; inspect both themes and instrument `requestAnimationFrame`/scene time to verify the rapid-transition, long-pause continuity, context-loss, surface-inventory, reduced-motion texture/theme snap, and single-chain cases above. Verify the absent ordinary-project fallback statically against the template and observer selector list rather than inventing content.

## Done criteria

- [ ] `node --check assets/js/atmosphere.js` and `make quality-gate` pass.
- [ ] One scheduler owns every `requestAnimationFrame(render)` request.
- [ ] Animation runs only while a scene surface intersects and the document is visible.
- [ ] Active scene time excludes paused intervals and ripple timestamps use the same clock.
- [ ] Reduced motion has no recursive RAF loop while retaining one-shot redraws for initial state, async texture uploads, resize, and theme changes.
- [ ] Resize/theme changes refresh a paused scene once without starting a loop.
- [ ] Pointer ripples do not accumulate while paused.
- [ ] Missing observer/regions safely retains continuous rendering.
- [ ] WebGL context loss is terminal and later lifecycle events cannot restart rendering.
- [ ] Shader, texture, resolution, CSS, template, and content code are unchanged.
- [ ] Only `assets/js/atmosphere.js` is modified.

## STOP conditions

- Scene-bearing class names no longer match Current state.
- Correctness requires changing GLSL, GL texture setup/upload statements, canvas markup, or CSS beyond the explicitly permitted lifecycle refresh hooks.
- More than one direct `requestAnimationFrame(render)` call remains.
- Syntax/build verification fails twice.
- The implementation cannot explain how duplicate loops are prevented.

## Maintenance notes

Any future atmospheric page family must add its visible surface selector to the observer list. Reviewers should scrutinize scheduler idempotency and theme/visibility transitions more than code compactness; duplicate loops are the highest-risk failure here.
