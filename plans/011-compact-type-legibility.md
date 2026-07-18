# Plan 011: Give compact interface type a legible minimum scale

> **Executor instructions**: Follow this plan exactly and run every verification. Stop on a STOP condition instead of improvising. The reviewer maintains `plans/README.md`; do not edit it.
>
> **Execution precondition and drift check (run first)**: This clean isolated worktree must start directly from approved Plan 010 commit `5be6ec09c819c2e9d8c057bb78e44617089ce4f7`. Record that value as `PLAN_010_SHA` in the executor report, then run `test "$(git branch --show-current)" = "improve/011-compact-type-legibility" && test "$(git rev-parse HEAD)" = "5be6ec09c819c2e9d8c057bb78e44617089ce4f7" && test -z "$(git status --porcelain)"`. STOP unless all three conditions pass; this approved dependency SHA is the scope baseline.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: `plans/010-typography-cascade.md`
- **Category**: bug
- **Planned at**: commit `a450b29`, 2026-07-18

## Why this matters

Workflow indices, screenshot captions, card metadata, article rails, and overlay actions currently render at roughly 7.8–10px. These elements carry real navigation and status information, so treating them like decorative microtype makes the site harder to scan, particularly on mobile and lower-density displays. A small tokenized scale can improve legibility without changing the site's compact technical character.

## Current state

- `html` uses `font-size: 62.5%`, so `0.8rem` is 8px and `0.95rem` is 9.5px.
- The smallest interactive rule is `assets/css/custom.css:1499-1514`:
  ```css
  .project-system-visual-actions a {
    min-height: 2.8rem;
    font-size: 0.78rem;
    line-height: 1;
  }
  ```
- Workflow indices and labels use 8–11.5px at `assets/css/custom.css:973-974`, `1184-1185`, and `1566-1578`. The `1507-1510` selector is instead a group of standalone links over the project visual.
- Screenshot captions/card metadata use 9–9.5px at `assets/css/custom.css:936-939`, `963`, `1130-1133`, `1170`, and `1460-1463`.
- Article navigation and metadata use 9–9.5px at `assets/css/custom.css:2411-2443`.
- The site intentionally uses uppercase mono labels with restrained tracking. Preserve that style, ellipsis behavior, borders, and content hierarchy.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Find obsolete compact literals | `rg -n "font-size: (0\.[0-9]+|1|1\.05|1\.15)rem" assets/css/custom.css` | no matches after implementation |
| Build and HTML gate | `make quality-gate` | exit 0; htmltest passes |
| Scope | `git diff --name-only 5be6ec09c819c2e9d8c057bb78e44617089ce4f7...HEAD` | exactly `assets/css/custom.css` after the implementation commit |

## Scope

**In scope**:
- `assets/css/custom.css`

**Out of scope**:
- Headline families, sizes, or wrapping from Plan 010
- Template/content changes
- Color or contrast-token redesign
- Shader, images, card order, copy, or desktop/mobile breakpoints

## Git workflow

- Branch: `improve/011-compact-type-legibility`
- One commit after verification: `Raise compact interface type legibility`
- Do not push or open a PR.

## Steps

### Step 1: Define a compact type scale

Add a small set of root custom properties beside the existing typography tokens. The smallest visible label must compute to at least 11px (`1.1rem` with this root), and interactive compact text should use at least 12px (`1.2rem`). Keep the number of tokens small (for example, compact label and compact action); do not create a token per selector.

**Verify**: `rg -n -- "--type-.*compact|--compact-.*type" assets/css/custom.css` → shows the shared compact scale, including values no smaller than `1.1rem`.

### Step 2: Apply the scale to every visible microtype selector

Replace every raw compact `0.xrem`, `1rem`, `1.05rem`, and `1.15rem` font declaration with the appropriate shared token. This is the complete inventory and assignment:

- Label token (`1.1rem` minimum): `.artifact-rail`; `.eyebrow`, `.quiet-meta`, `.project-year`; `.author-portrait-cue`; `.author-mark figcaption`; `.intro-index-label`; `.build-status`, `.work-status`; `.writing-meta`; `.selected-project-visual figcaption`; `.selected-project-meta`; `.selected-project-flow span`; `.selected-project-flow strong`; `.writing-lead-meta`, `.work-masthead-meta`, `.project-masthead-meta`, `.article-header-meta`; `.work-atlas-visual figcaption`; `.work-atlas-meta`; `.work-atlas-flow span`; `.work-atlas-flow strong`; `.project-highlights li::before`; `.project-system-mark`; `.project-system-windowbar`; `.project-system-flow span`; `.project-chapters-label`; `.project-chapter-facts`; `.footer-index`; `.writing-feature-meta`; `.contact-panel-header`; `.contact-brief li span`, `.contact-brief-action p`; `.article-hero-top`, `.article-hero-bottom`; `.article-rail-label`; `.article-rail dt`, `.article-rail dd`. These containers may stay label-sized, but nested links named below must explicitly override inheritance with the action token.
- Strong workflow exception: `.project-system-flow strong` previously rendered at `1.15rem`; use `var(--type-compact-action)` (`1.2rem`) as the existing larger compact scale so this legibility plan never reduces it to the `1.1rem` label size. This does not make the label interactive.
- Action token (`1.2rem` minimum): `.theme-toggle`; `.author-portrait-menu a`; `.intro-index-action`; `.project-cta`; `.selected-project-action`; `.work-atlas-visual-action`; `.work-atlas-action`; `.article-end`; `.project-primary-action`, `.project-secondary-action`; `.project-system-visual-actions a`; `.project-chapters-rail nav a`; `.footer-closing .footer-cta`; `.footer-links a`; mobile `.menu-button`; `.contact-links a`; `.article-rail a`; `.article-hero-top a`; `.article-start`; `.contact-panel-header a`; `.project-masthead-meta a`.

If the same grouped rule contains both label and action selectors today, split it just enough to preserve this assignment. Do not convert ordinary prose sizes such as em-based `.prose code` or the existing `1.1rem` footer CTA; they are not obsolete literals in this inventory.

`.work-atlas-visual-action` is an `aria-hidden` decorative span inside a full-card link: give its visible text the action token but do not invent hit-area or focus behavior for the span. `.project-system-visual-actions a` are independent links: use the action token and set their own declaration to the unambiguous `min-height: 4rem`, with vertical/horizontal padding that keeps text and focus treatment unclipped. Preserve their `white-space: nowrap` and the existing group layout.

Preserve workflow behavior exactly: `.selected-project-flow strong` and `.work-atlas-flow strong` must retain `overflow: hidden`, `text-overflow: ellipsis`, and `white-space: nowrap`; `.project-system-flow strong` must retain its current wrapping behavior and must not gain overflow hiding, ellipsis, or `white-space: nowrap`.

**Verify with explicit assertions**:

1. `! rg -n "font-size: (0\.[0-9]+|1|1\.05|1\.15)rem" assets/css/custom.css` → no obsolete compact literals remain.
2. `rg -n -- "--type-compact-label: 1\.1rem|--compact-label-type: 1\.1rem" assets/css/custom.css` and `rg -n -- "--type-compact-action: 1\.2rem|--compact-action-type: 1\.2rem" assets/css/custom.css` → both shared values exist.
3. `node -e 'const fs=require("fs");const c=fs.readFileSync("assets/css/custom.css","utf8");for(const s of [".selected-project-flow strong",".work-atlas-flow strong"]){const e=s.replace(/[.*+?^${}()|[\]\\]/g,"\\$&");if(!new RegExp(e+"[^}]*overflow:\\s*hidden[^}]*text-overflow:\\s*ellipsis[^}]*white-space:\\s*nowrap").test(c))throw new Error(s+" lost ellipsis")};const p=c.match(/\.project-system-flow strong\s*\{([^}]*)\}/);if(!p||/(overflow:\s*hidden|text-overflow:\s*ellipsis|white-space:\s*nowrap)/.test(p[1]))throw new Error("project-system flow wrapping changed")'` → the two ellipsis contracts and the project-system wrapping contract are intact.
4. `node -e 'const fs=require("fs");const css=fs.readFileSync("assets/css/custom.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m=>({selectors:m[1].split(",").map(s=>s.trim()),body:m[2]}));const actions=[".theme-toggle",".author-portrait-menu a",".intro-index-action",".project-cta",".selected-project-action",".work-atlas-visual-action",".work-atlas-action",".article-end",".project-primary-action",".project-secondary-action",".project-system-visual-actions a",".project-chapters-rail nav a",".footer-closing .footer-cta",".footer-links a",".menu-button",".contact-links a",".article-rail a",".article-hero-top a",".article-start",".contact-panel-header a",".project-masthead-meta a"];for(const selector of actions){if(!rules.some(r=>r.selectors.includes(selector)&&/font-size:\s*var\(--(?:type-compact-action|compact-action-type)\)/.test(r.body)))throw new Error(selector+" lacks owned action token")}'` → every action selector belongs to a rule block that explicitly owns the action token rather than inheriting the label token.
5. `node -e 'const fs=require("fs");const c=fs.readFileSync("assets/css/custom.css","utf8");const m=c.match(/\.project-system-visual-actions a\s*\{([^}]*)\}/);if(!m||!/(?:var\(--(?:type-compact-action|compact-action-type)\))/.test(m[1])||!/min-height:\s*4rem\s*;/.test(m[1]))throw new Error("standalone project visual actions lack action token or exact 4rem minimum")'` → independent overlay links own the action token and exact `4rem` minimum.

### Step 3: Verify layout-safe completion

Run the full gate and inspect all changed selectors. Ensure the plan did not alter headline sizes, colors, or HTML.

Commit the verified implementation, then substitute the recorded SHA in the following command.

**Verify**: `make quality-gate && git diff --check 5be6ec09c819c2e9d8c057bb78e44617089ce4f7...HEAD && test "$(git diff --name-only 5be6ec09c819c2e9d8c057bb78e44617089ce4f7...HEAD)" = "assets/css/custom.css" && test -z "$(git status --porcelain)"` → passes, has no whitespace errors, and the dependent commit range contains exactly CSS with no residual worktree changes.

## Test plan

- No browser test dependency is installed; do not add one or launch a browser.
- Static checks must prove no obsolete compact literals remain, the named token values exist, workflow overflow contracts are unchanged, and standalone visual actions own their minimum height.
- Responsive outcomes and any resulting spacing adjustments are exclusively a reviewer acceptance gate, not an executor DONE or STOP claim. The reviewer must check at 1440×900 and 390×844: homepage, Work index, Sirv Studio project, one article, and mobile menu/footer have no horizontal overflow, clipped focus outlines, or unwanted workflow wrapping.

## Done criteria

- [ ] `make quality-gate` passes.
- [ ] Shared compact-type tokens exist and the minimum visible size is 1.1rem.
- [ ] No `font-size: 0.xrem` declarations remain.
- [ ] Interactive compact actions use at least 1.2rem and retain visible focus treatment.
- [ ] Selected-project and work-atlas workflows keep ellipsis; project-system workflows keep their current wrapping behavior.
- [ ] Standalone project-system visual links use the action token and at least a 4rem minimum height; the work-atlas decorative overlay remains non-interactive.
- [ ] No headline, template, content, color, or JavaScript changes.
- [ ] The committed range from the recorded approved Plan 010 SHA contains exactly `assets/css/custom.css`.

## STOP conditions

- Plan 010's typography foundation is absent or substantially different.
- Legibility requires changing card structure or copy rather than the CSS scale.
- The quality gate fails twice.

## Maintenance notes

New uppercase mono labels should use the compact scale rather than raw rem values. Review mobile workflow cells and the article rail whenever the minimum changes; those are the tightest consumers.
