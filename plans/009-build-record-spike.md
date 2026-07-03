# Plan 009 (spike): Decide how the build-record evidence page should live inside Hugo — design doc only, no production changes

> **Executor instructions**: This is a **design spike** — the deliverable is a
> written recommendation, NOT code changes. Investigate, write the doc, stop.
> If anything in the "STOP conditions" section occurs, stop and report. When
> done, update the status row for this plan in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- static/projects/sirv-studio/build-record/ layouts/projects/`
> If the build-record page changed materially since planning, read the new
> version before writing anything.

## Status

- **Priority**: P3
- **Effort**: M (investigation + writing; implementation is a future plan)
- **Risk**: LOW (no production changes permitted)
- **Depends on**: none
- **Category**: direction
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

The Sirv Studio case study links to a "build record" evidence page that lives as a **hand-written standalone HTML file** at `static/projects/sirv-studio/build-record/index.html` — completely outside Hugo's template system. It has its own fonts (Bricolage Grotesque + IBM Plex Mono vs the site's Outfit), its own light theme (the site is dark-only), its own inline CSS and JS, and its data (per-day commit counts) is hard-coded in an inline script. That's fine for a one-off. But if more case studies with evidence pages are coming (the projects section was recently reworked around this format), each new one would be another hand-maintained HTML island. This spike decides: keep as-is, or absorb into Hugo — and if so, how — **before** a second evidence page gets hand-built.

## Current state

- `static/projects/sirv-studio/build-record/index.html` — ~22.6 KB standalone page: one inline `<style>`, one inline `<script>` (renders a contribution-graph heatmap from a hard-coded `byDate` map at runtime), zero images, one external dependency (Google Fonts stylesheet with preconnect). Because it's in `static/`, Hugo copies it verbatim to `public/projects/sirv-studio/build-record/index.html`.
- The case study (`content/projects/sirv-studio.md`) links to `/projects/sirv-studio/build-record/`.
- Its light theme and distinct typography are **plausibly intentional** (an "evidence document" register, distinct from the essay) — the recommendation must not assume they're accidents.
- Known bug in the page (separately reported, fix declined for now — do not fix in this spike): the heatmap iterates dates in local time but keys lookups via `toISOString()` (UTC), shifting every cell by one day for viewers east of UTC.
- **Editorial constraints (hard)**: the numbers on this page were hand-verified against the source repo; a rival markdown version of the build record was deliberately deleted. Any absorption approach must (a) preserve every displayed number byte-exact, (b) preserve the URL `/projects/sirv-studio/build-record/`, (c) not recreate a markdown-prose variant of the page.
- Relevant Hugo mechanics for the options analysis: content pages can specify `layout: <name>` in front matter (rendered by `layouts/projects/<name>.html`); site data can live in `data/*.json` and be read by templates; a `static/` file and a Hugo page at the same path conflict (static wins, silently, in older Hugo versions — verify behavior on the pinned version as part of the spike).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 |
| Page inspection | `wc -c static/projects/sirv-studio/build-record/index.html` | ~22600 bytes |
| URL collision test (scratch only) | build with a test content file, inspect `public/` | documented behavior |

## Scope

**In scope** (create only):
- `plans/notes/009-build-record-design.md` — the design doc
- Throwaway experiments in a scratch directory or discarded branch (never committed to `main`, never left in the working tree)

**Out of scope** (do NOT touch):
- `static/projects/sirv-studio/build-record/index.html` — zero edits, including the known timezone bug
- `content/projects/sirv-studio.md`, all layouts, `config.toml`
- No new production content files, no `data/` files committed

## Git workflow

- Branch: `advisor/009-build-record-spike`
- The only committed artifact is the design doc.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Characterize the page

Read `static/projects/sirv-studio/build-record/index.html` fully. Inventory: section structure, which numbers appear where, what the inline JS computes at runtime vs what's hard-coded, what would break if CSS/JS were extracted. Estimate how much of it is reusable scaffold vs sirv-studio-specific content.

**Verify**: the inventory section of the design doc lists every data table/figure on the page and the source of each (hard-coded HTML vs computed by the inline script).

### Step 2: Test the URL-collision behavior

On the pinned Hugo version, create a scratch content file that would render to the same path and build. Document which wins (static file vs page), whether any warning is emitted, and clean up the scratch file completely.

**Verify**: `git status` clean; the behavior is documented with the exact Hugo version tested.

### Step 3: Write the options analysis

The design doc must evaluate at least these three options, each with effort estimate, risk, and what future evidence pages would look like:

- **A. Keep as-is** (status quo): hand-built static HTML per evidence page. Zero migration risk; every future page is a from-scratch build; site-wide changes (fonts, nav, analytics) never reach these pages.
- **B. Dedicated Hugo layout + data file**: `layouts/projects/build-record.html` (or a `layouts/_default/evidence.html`) + a content stub with `layout:` front matter + per-day counts in `data/` or front matter; the light theme and typography preserved as the layout's own embedded style. Future evidence pages = one data file + one content stub.
- **C. Hybrid**: keep the current page byte-identical, but extract the reusable skeleton into a documented HTML template file (e.g. `docs/templates/evidence-page.html`) that future pages copy from. No migration risk, some duplication forever.

The doc ends with a **recommendation** and a migration checklist for the chosen option, including how to verify number-preservation (e.g. `diff <(lynx -dump old) <(lynx -dump new)` or a text-content extraction comparison) and the URL-collision handling from Step 2.

**Verify**: doc contains all three options with trade-offs, one explicit recommendation, and the verification strategy for byte-exact numbers.

### Step 4: Flag the open questions for the operator

End the doc with the questions only the maintainer can answer, at minimum: (1) are more evidence pages actually planned? (option A is correct if not); (2) is the light theme/typography an intentional register to preserve in a layout, or incidental?; (3) should the timezone bug be fixed as part of a migration if one happens (it was declined as a standalone fix)?

**Verify**: the questions section exists and none of them is answered by assumption elsewhere in the doc.

## Test plan

Not applicable (no production changes). The Step 2 experiment must leave `git status` clean.

## Done criteria

ALL must hold:

- [ ] `plans/notes/009-build-record-design.md` committed with: inventory, collision-test result, 3+ options with trade-offs, one recommendation, migration checklist, open questions
- [ ] `git diff 438a91e..HEAD --stat` shows ONLY the design doc (and `plans/README.md`) added — zero changes elsewhere
- [ ] `rm -rf public && hugo --gc --minify` still exits 0
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- You find yourself editing the build-record HTML, any layout, or any content file — the spike forbids it.
- The page at `static/projects/sirv-studio/build-record/index.html` no longer exists or was substantially rewritten (drift — re-plan).

## Maintenance notes

- If the recommendation is B and it's approved, the implementation becomes its own plan with the number-preservation diff as its central done-criterion.
- Whoever implements a migration must re-read the editorial constraints in "Current state" — the deleted-markdown-version and byte-exact-numbers rules are not optional.
