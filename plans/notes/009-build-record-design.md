# Build Record Evidence Page Design Spike

## Scope

This spike decides how the Sirv Studio build-record evidence page should live in the Hugo site before another evidence page is created. It does not change production HTML, layouts, content, data files, or the URL.

## Current Inventory

Source file: `static/projects/sirv-studio/build-record/index.html`

Spot checks:

- Size: `22625` bytes.
- Hugo version used for the collision test: `hugo v0.161.1+extended+withdeploy`.
- The page is a standalone static HTML document with one inline `<style>` block and one inline `<script>` block.
- Fonts are loaded from Google Fonts after two preconnects: Bricolage Grotesque for display/body text and IBM Plex Mono for metadata/source labels.
- The page declares `color-scheme` as `light only` and uses its own light palette rather than the site's dark Hugo theme.
- There are no image assets.

Section and figure inventory:

| Area | Visible data or claim | Source in current page |
| --- | --- | --- |
| `<title>` / metadata | "I built Sirv AI Studio", seven months, `5,500` commits, `254` migrations, `3,695` test files | Hard-coded HTML metadata |
| Header/topbar | Site breadcrumb and `updated 2026-07` | Hard-coded HTML |
| Hero | "One person shipped this."; Sirv Studio description; `30+` AI tools; first twelve weeks solo; roughly `73%`; contributor credit links | Hard-coded HTML |
| Heatmap metadata | `5,500 commits by me`, date range `Dec 2, 2025 -> Jul 2, 2026`, one cell per day, author filter, no smoothing | Hard-coded HTML |
| Heatmap image | Day cells, color ramp, titles with per-day commit counts, month labels | Computed at runtime by the inline script from hard-coded `DATA` |
| Heatmap ARIA label | `208` active days out of `213` tracked, `December 2025 through July 2026`, peak `182` commits | Hard-coded HTML |
| Heatmap legend | "fewer" to "more" six-color scale | Hard-coded HTML/CSS |
| Heatmap caption | Seven months, `five days off`; production hardening framing | Hard-coded HTML |
| Ledger table | `Dec 2`, `7,515`, `12 wks`, `254`, `3,695`, `39/day`, `30+` with source labels | Hard-coded HTML table |
| Product section | Controlled loop and platform capabilities | Hard-coded HTML |
| Four problems section | MCP, publish, supplier, and orchestration claims, including `45` MCP tools and `36` step types | Hard-coded HTML |
| Method section | Agent workflow and quality gate framing, including `3,695` test files | Hard-coded HTML |
| Verify/CTA section | Private-code verification offer and links to Sirv Studio, case study, GitHub, LinkedIn, X | Hard-coded HTML |
| Footer | "Numbers as of July 2, 2026" and heatmap provenance | Hard-coded HTML |
| Commit dataset | `208` `[date, count]` entries, first `2025-12-02:31`, last `2026-07-02:4`, max `2026-04-09:182` | Hard-coded JavaScript `DATA` array |

The runtime script builds a `byDate` map from `DATA`, iterates calendar dates, creates heatmap cells, assigns color buckets via `ramp(n)`, adds title text, animates cells unless reduced motion is preferred, and positions month labels. Extracting CSS or JS without changing behavior would need to preserve the page's CSS variables, cell sizing, motion behavior, date iteration behavior, and current local-time/UTC lookup behavior. The known timezone bug is real but intentionally out of scope for this spike.

Important preservation finding: the visible page text says `5,500` commits, while the checked `DATA` array contains `208` entries summing to `5,501`. That mismatch is evidence for the hard rule that replacement text must preserve displayed numbers byte-exact and must not derive display copy from the heatmap data.

Reusable versus page-specific shape:

- Reusable scaffold: standalone evidence-page shell, topbar, hero, heatmap component, ledger table, narrative sections, verification CTA, typography/palette tokens, and reduced-motion handling.
- Sirv Studio-specific content: all copy, all numbers, source labels, links, problem narratives, CTAs, and the per-day commit dataset.

## URL Collision Result

A previous scratch test on Hugo `0.161.1` created `content/projects/build-record-collision-009.md` rendering to `/projects/sirv-studio/build-record/` while the static file already existed at `static/projects/sirv-studio/build-record/index.html`.

Result: the static file won silently. The rendered `public/projects/sirv-studio/build-record/index.html` was byte-identical to the static HTML file, and Hugo emitted no warning. The scratch content file was deleted.

Design implication: any migration to a Hugo-rendered page must remove or relocate `static/projects/sirv-studio/build-record/index.html` in the same implementation commit. Otherwise the new Hugo content can appear to build successfully while production still serves the old static file.

## Options

### Option A: Keep As-Is

Keep `static/projects/sirv-studio/build-record/index.html` as the production artifact. Future evidence pages, if any, would be hand-built static HTML files under `static/projects/<project>/...`.

Effort: none now; high per future page.

Benefits:

- Zero migration risk for the existing page.
- Preserves every displayed number, current styling, current script behavior, and current URL byte-for-byte.
- Avoids accidental Hugo collision because no Hugo page is introduced.

Costs and risks:

- Every future evidence page starts from a copy/paste or from scratch.
- Site-wide changes to shared head markup, analytics, navigation, security headers, or link behavior will not naturally reach these pages.
- The current page remains an island with a different font stack, theme, and maintenance workflow.
- Known script behavior, including the timezone bug, remains frozen unless edited directly.

Future evidence pages: another standalone HTML island each time.

### Option B: Dedicated Hugo Layout + Data

Create a Hugo-rendered evidence page using a dedicated layout, such as `layouts/projects/build-record.html` or `layouts/_default/evidence.html`, plus a content stub with `layout:` front matter. Store per-page facts and the heatmap counts in a structured source, likely `data/` or front matter. Preserve the current light theme and typography inside the layout rather than forcing the page into the site's dark project template.

Effort: medium. The implementation needs template work, data modeling, URL collision handling, and careful verification against the current static output.

Benefits:

- Best long-term fit if more evidence pages are planned.
- Future pages become one content stub plus one data/facts file instead of another hand-built HTML document.
- Shared evidence-page structure can improve consistently without rewriting each page.
- The light evidence-document register can be preserved intentionally while still living inside Hugo.
- The known timezone bug can be fixed as part of a deliberate migration if approved.

Costs and risks:

- Highest risk to the existing page because the current artifact must be reproduced from a template.
- Displayed numbers can drift if templates derive prose values from `DATA`; the `5,500` visible count versus `5,501` DATA sum proves this cannot be automatic.
- The static file must be removed or moved in the migration commit, or the Hugo page will be shadowed silently.
- The current page has bespoke copy density and layout details that should not be flattened into generic project-page styling.

Future evidence pages: one content stub plus structured evidence data, rendered through the shared evidence layout.

### Option C: Hybrid Static Template

Keep the current production page byte-identical, but extract a documented starter template for future evidence pages, for example `docs/templates/evidence-page.html`. The existing page remains in `static/`; new evidence pages copy from the template and edit manually.

Effort: low.

Benefits:

- No migration risk for the existing page.
- Gives future pages a starting scaffold without forcing a Hugo abstraction too early.
- Preserves the intentional evidence-document register.
- Avoids the static-versus-Hugo collision problem for the current page.

Costs and risks:

- Duplication remains permanent.
- Site-wide improvements still do not flow into existing evidence pages.
- Template drift is likely once multiple copied pages exist.
- Operators still have to manually preserve numbers, metadata, scripts, links, and accessibility labels in each copied file.

Future evidence pages: copied static files from a documented template, with manual edits per page.

## Recommendation

Choose Option B only if at least one more evidence page is planned; otherwise choose Option A and leave this page alone. Given the case-study system appears to be moving toward repeatable evidence pages, my recommendation is Option B: migrate to a dedicated Hugo evidence layout while preserving the current light theme, typography, URL, and displayed numbers byte-exact.

Option C is a useful fallback if the next evidence page is imminent but the operator is not ready to pay the verification cost of a full migration.

## Migration Checklist For Option B

1. Confirm with the operator that more evidence pages are planned and that the light evidence-document styling should be preserved.
2. Create a new Hugo content stub that owns `/projects/sirv-studio/build-record/` using explicit front matter, not a prose markdown rewrite.
3. Create a dedicated evidence layout that carries the current page's standalone visual register: light palette, Bricolage Grotesque, IBM Plex Mono, ledger table, heatmap, verification CTA, and reduced-motion behavior.
4. Move the per-day heatmap counts into a structured source, but keep all visible text and displayed numbers as explicit authored fields.
5. Preserve these displayed numbers and labels byte-exact: `5,500`, `7,515`, `12 wks`, `254`, `3,695`, `39/day`, `30+`, `45`, `36`, `208`, `213`, `182`, `Dec 2`, date labels, and "Numbers as of July 2, 2026".
6. Do not derive display copy from the `DATA` sum. The current `DATA` sum is `5,501`, while the displayed count is `5,500`.
7. Decide whether to keep the current timezone behavior or fix the local-time/UTC bug as a separately approved migration behavior change.
8. In the same commit that introduces the Hugo route, remove or relocate `static/projects/sirv-studio/build-record/index.html`; otherwise the static file silently shadows the Hugo page.
9. Build with `rm -rf public && hugo --gc --minify`.
10. Compare old and new rendered text before shipping. Preferred strategy:
    - Save the current static HTML as the old artifact before migration.
    - Build the migrated page.
    - Extract normalized visible text from both artifacts with the same tool, for example `lynx -dump` if available or a small DOM text extraction script.
    - Diff the text outputs and review every number-bearing line.
11. Add a focused numeric assertion script for the migration commit that extracts all visible number-bearing text from old and new outputs and fails unless the strings match exactly.
12. Separately verify the heatmap dataset count, sum, first date, last date, and max day so a template migration does not corrupt the graph source.
13. Recheck `/projects/sirv-studio/build-record/` in the built `public/` tree and confirm it is not byte-identical to a stale static artifact unless that is explicitly intended.
14. Commit the migration separately from this spike, with the number-preservation diff as the central done criterion.

## Operator Questions

1. Are more evidence pages actually planned? If not, Option A is the correct answer.
2. Is the build-record page's light theme and Bricolage Grotesque / IBM Plex Mono typography an intentional evidence-document register to preserve in a Hugo layout, or incidental styling from the one-off page?
3. If a migration happens, should the known timezone heatmap bug be fixed inside that migration, or should the migrated page preserve the current behavior exactly?
4. Should future evidence pages share one generic evidence layout, or should the Sirv Studio build record remain its own named layout until a second page proves the abstraction?
5. Should evidence pages inherit any global site behavior such as analytics, canonical metadata, or shared navigation, or remain intentionally standalone?
