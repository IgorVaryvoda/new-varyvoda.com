# Plan 010: Make the intended typography own every redesigned page

> **Executor instructions**: Follow this plan step by step. Run every verification command and confirm the expected result before moving on. If a STOP condition occurs, stop and report; do not improvise. The reviewer maintains `plans/README.md`, so do not edit the index.
>
> **Execution precondition and drift check (run first)**: This plan must run in a clean isolated worktree created from `756cff0`. Run `test "$(git branch --show-current)" = "improve/010-typography-cascade" && test "$(git rev-parse HEAD)" = "756cff0b45e6b896ceba2572db1cf4cb00142ac5" && test -z "$(git status --porcelain)"`. STOP unless all three conditions pass; do not execute on `main` or over any tracked/untracked worktree change.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug
- **Planned at**: commit `756cff0`, 2026-07-18 (scoped files unchanged from audited `a450b29`)

## Why this matters

The redesign loads Geologica for display type and Literata for editorial type, but hugo-coder still assigns its system stack to every heading. Many new selectors set size and tracking without setting a family, so the homepage title, Work/Writing mastheads, About/Contact headings, and project-card headings render in the old system font. A more-specific theme rule also forces article cover titles to 42px on desktop and 40px on mobile instead of the authored 54–90px Literata scale. The result is a visibly inconsistent identity and a broken article hierarchy.

## Current state

- `assets/css/custom.css` is the first-party visual system. It defines:
  ```css
  --display: "Geologica", system-ui, sans-serif;
  --reading: "Literata", Georgia, serif;
  --tracking-display: -0.01em;
  --tracking-display-xl: -0.02em;
  --tracking-reading-display: -0.01em;
  ```
- `themes/hugo-coder/assets/scss/_base.scss:40-49` assigns the vendored system stack to `h1`–`h6`. Do not edit this vendored file.
- `themes/hugo-coder/assets/scss/_content.scss:6-17` compiles to `.content article header h1 { font-size: 4.2rem; line-height: 4.6rem }` plus a 4rem mobile override. Do not edit this vendored file.
- `assets/css/custom.css:375-391` sets the homepage title size but omits its family; the Literata thesis uses a one-off `-0.025em` tracking value tighter than the shared `-0.01em` token.
- `assets/css/custom.css:960`, `1079`, `1172`, `2045-2052`, `2171-2177`, and `2210-2217` likewise size major headings without assigning `var(--display)`.
- `assets/css/custom.css:2345-2353` correctly asks for Literata and a 54–90px scale, but loses the cascade to the more-specific theme article-header rule.
- Existing intentionally editorial headings (`.writing-title-group`, `.writing-feature`, `.article-hero-title`) use `var(--reading)`. Preserve that distinction.
- Preserve existing copy, content, colors, layout widths, and the approved tracking limits: regular display/Literata headings about `-0.01em`, largest Geologica headings no tighter than `-0.02em`.

## Commands you will need

| Purpose | Command | Expected on success |
|---|---|---|
| Build and HTML gate | `make quality-gate` | exit 0; htmltest passes all documents |
| Confirm theme files untouched | `git diff --exit-code -- themes/hugo-coder/assets/scss/_base.scss themes/hugo-coder/assets/scss/_content.scss` | exit 0 |
| Inspect committed scope | `git diff --name-only 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD` | exactly `assets/css/custom.css` after the implementation commit |

## Scope

**In scope**:
- `assets/css/custom.css`

**Out of scope**:
- `themes/hugo-coder/**` — vendored theme remains unchanged
- Templates, content, JavaScript, colors, canvas/shader, image presentation
- Reducing headline scale or changing page copy to avoid wrapping

## Git workflow

- Branch: `improve/010-typography-cascade`
- One commit after all checks pass, matching the repo's imperative style, e.g. `Restore the intended typography cascade`
- Do not push or open a PR.

## Steps

### Step 1: Establish a first-party heading-family boundary

In `assets/css/custom.css`, near the body/base rules, add the exact low-specificity boundary `body.builder-index :where(h1, h2, h3, h4, h5, h6) { font-family: var(--display); }`. Do not replace it with direct `body.builder-index h1`–`h6` selectors: those would outrank later one-class editorial rules. The boundary must beat the vendored element-only family rule while allowing `.writing-title-group`, `.writing-feature`, and article rules using `var(--reading)` to win without `!important`.

Also replace the vendored article size collision with the explicit first-party selector `.article-page--editorial .article-hero-title h1`, which must win against `.content article header h1` for font family, size, and line height. Change both the base article-title rule and its `@media (max-width: 680px)` title-size override to this exact scoped selector. Keeping the same specificity in both places lets the later mobile clamp win by source order. Do not broaden this reset to legacy generic articles.

The non-system project fallback has the same theme collision. Change all three fallback ownership occurrences—the shared family/weight rule, base size/leading rule, and mobile size rule—to `.project-page:not(.project-page--system) .project-heading h1`. The `:not(...)` guard is required so the later generic mobile rule cannot override the more expansive system-project title scale. Because narrowing the shared family/weight selector excludes system titles, explicitly set `font-weight: 500` on `.project-masthead--system .project-system-copy h1`. Also set `.work-atlas-heading h2` to the established display weight `500`; the global theme's `700` must not survive on either project masthead family or the live “Pick a system.” heading.

**Verify with separate assertions**:

1. `rg -n -F "body.builder-index :where(h1, h2, h3, h4, h5, h6)" assets/css/custom.css` → finds the exact low-specificity heading boundary; `! rg -n "body\.builder-index h[1-6]" assets/css/custom.css` rejects direct high-specificity variants.
2. `test "$(rg -n "^\.article-page--editorial \.article-hero-title h1" assets/css/custom.css | wc -l)" -ge 2` → confirms both base and mobile article-title rules use the scoped selector.
3. `! rg -n "^\.article-hero-title h1" assets/css/custom.css` → confirms no weaker article-title rule remains.

### Step 2: Normalize headline rhythm without shrinking it

Use the existing tracking variables everywhere; replace the homepage thesis's `-0.025em` with `var(--tracking-reading-display)`. Add grouped wrapping rules with the following exact ownership:

- `text-wrap: balance`: `.intro-copy h1`, `.current-build-header h2`, `.home-section-heading h2`, `.archive-heading h2`, `.selected-project-copy h3`, `.page-lead h1`, `.project-page:not(.project-page--system) .project-heading h1`, `.work-atlas-thesis h1`, `.work-atlas-heading h2`, `.work-atlas-copy h3`, `.work-masthead h1`, `.writing-masthead h1`, `.writing-title-group h2`, `.writing-title-group h3`, `.writing-feature h2`, `.about-heading h1`, `.contact-heading h1`, `.contact-brief-lead`, `.project-masthead--system .project-system-copy h1`, and `.article-page--editorial .article-hero-title h1`.
- `text-wrap: pretty`: `.intro-thesis`, `.page-dek`, `.selected-project-copy > p:not(.selected-project-meta)`, `.work-atlas-copy > p:not(.work-atlas-meta)`, `.writing-title-group p`, `.writing-feature > p`, `.contact-heading > p:not(.eyebrow)`, `.project-masthead--system .project-dek`, and `.article-hero-bottom .article-dek`.

Group selectors instead of copying the declaration repeatedly. Do not apply `text-wrap` to metadata, navigation, workflow labels, or body prose.

Open the most compressed multiline display headings while preserving their scale: no large Geologica multiline headline should use a line-height below `0.88`, and prefer a shared custom property for repeated large-display leading. Do not globally loosen reading/prose line height, card body type, or single-line metadata.

The known compressed headline declarations to open are the desktop `.work-atlas-thesis h1` (`0.79`), mobile `.work-atlas-thesis h1` (`0.82`), `.project-masthead--system .project-system-copy h1` (`0.84`), and `.writing-masthead h1` (`0.84`). Use at least `0.88` for all four; a shared leading token is preferred if it makes the ownership clearer.

**Verify with positive and negative assertions**:

1. `! rg -n -- "-0\.025em" assets/css/custom.css` → the one-off Literata tracking is gone.
2. `! rg -n "line-height: 0\.(79|82|84);" assets/css/custom.css` → all four known compressed headline values are gone.
3. `node -e 'const fs=require("fs");const css=fs.readFileSync("assets/css/custom.css","utf8").replace(/\/\*[\s\S]*?\*\//g,"");const rules=[...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map(m=>({selectors:m[1].split(",").map(s=>s.trim()),body:m[2]}));const groups={balance:[".intro-copy h1",".current-build-header h2",".home-section-heading h2",".archive-heading h2",".selected-project-copy h3",".page-lead h1",".project-page:not(.project-page--system) .project-heading h1",".work-atlas-thesis h1",".work-atlas-heading h2",".work-atlas-copy h3",".work-masthead h1",".writing-masthead h1",".writing-title-group h2",".writing-title-group h3",".writing-feature h2",".about-heading h1",".contact-heading h1",".contact-brief-lead",".project-masthead--system .project-system-copy h1",".article-page--editorial .article-hero-title h1"],pretty:[".intro-thesis",".page-dek",".selected-project-copy > p:not(.selected-project-meta)",".work-atlas-copy > p:not(.work-atlas-meta)",".writing-title-group p",".writing-feature > p",".contact-heading > p:not(.eyebrow)",".project-masthead--system .project-dek",".article-hero-bottom .article-dek"]};for(const [value,selectors] of Object.entries(groups)){for(const selector of selectors){if(!rules.some(r=>r.selectors.includes(selector)&&new RegExp("(?:^|;)\\s*text-wrap:\\s*"+value+"\\s*(?:;|$)").test(r.body)))throw new Error(selector+" lacks owned text-wrap: "+value)}}'` → exits 0 only when every enumerated selector belongs to the same CSS rule block that owns the required value.

### Step 3: Build and inspect the final diff

Run the full gate and confirm the change is CSS-only. Review the diff for accidental font-size reductions, copy edits, or `!important`.

Commit the verified implementation, then run the baseline-aware scope check.

**Verify**: `make quality-gate && git diff --check 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD && test "$(git diff --name-only 756cff0b45e6b896ceba2572db1cf4cb00142ac5...HEAD)" = "assets/css/custom.css" && test -z "$(git status --porcelain)"` → quality gate and whitespace checks pass; the committed range contains exactly the CSS file with no residual worktree changes.

## Test plan

- No automated browser suite exists. Do not install one or launch a browser from the executor.
- Static regression checks:
  - the scoped first-party heading family exists;
  - the article hero override has enough specificity to beat `.content article header h1`;
  - flagship wrapping declarations exist;
  - `make quality-gate` passes.
- Reviewer-only visual verification: computed styles at 1440×900 and 390×844 must show Geologica on display headings, Literata on article/writing headings, article cover sizes from the custom clamp rather than 42/40px, no horizontal overflow, and sensible title wrapping in both themes.

## Done criteria

- [ ] `make quality-gate` exits 0.
- [ ] Vendored theme files have no diff.
- [ ] Major display headings resolve from an explicit first-party Geologica rule.
- [ ] Article hero title size/leading is protected from the theme's `.content article header h1` rule.
- [ ] Flagship headings use balanced wrapping; associated deks/theses use pretty wrapping.
- [ ] The homepage Literata thesis uses the shared `-0.01em` tracking token.
- [ ] No large multiline headline remains below 0.88 line-height.
- [ ] No `!important`, content, JavaScript, or template changes.
- [ ] The committed range from `756cff0b45e6b896ceba2572db1cf4cb00142ac5` contains exactly `assets/css/custom.css`.

## STOP conditions

- The relevant selectors no longer match the excerpts above.
- Correcting the cascade appears to require editing vendored theme files.
- The build fails twice after a reasonable CSS correction.
- The solution requires shrinking titles or changing copy rather than fixing ownership/wrapping.

## Maintenance notes

Future page families should inherit Geologica from the first-party boundary and opt into Literata explicitly. Reviewers should inspect the article-title selector's specificity whenever hugo-coder is upgraded. This plan deliberately does not restructure the 2,500-line stylesheet; it fixes the visible cascade bug with a narrow foundation.
