# varyvoda.com design system

## Purpose

The site explains Igor's body of work: products, operating experience, writing, and software he still maintains. Visitors should understand the current focus quickly, then move through the work without the interface competing with it.

Herceg Novi is the visual signature. It sets the atmosphere. The rest of the site stays structural, readable, and direct.

## Foundations

### Color

The source of truth is `assets/css/custom.css`.

| Role | Tokens | Use |
| --- | --- | --- |
| Reading surface | `--paper`, `--paper-raised` | Articles, project stories, cards |
| Text | `--ink`, `--slate`, `--muted` | Primary, secondary, metadata |
| Structure | `--rule`, `--rule-dark` | Dividers and frames |
| Action | `--accent`, `--accent-soft`, `--accent-ink` | Links, focus, state, primary actions |
| Scene | `--harbor*`, `--footer-scene*`, `--scene-panel*` | Mastheads, atmosphere, footer |
| Technical | `--stage`, `--code-*` | Product screenshots, diagrams, code |

Dark is the default. Light mode is a full theme, not an inverted afterthought. Add new colors as role tokens only when the existing roles cannot do the job.

### Type

Shared type roles and size tokens live in `assets/css/typography.css`. It loads after the legacy theme/custom/font styles and before page-family styles, in both development and the production bundle. Keep page-specific headline scales and layout in their existing owners.

- **Geologica** (`--display`): navigation, controls, ordinary labels, short project/career summaries, product and index headings. Use sentence case for ordinary interface copy.
- **Literata** (`--reading`): prose, editorial headlines, reflective statements and the homepage introduction.
- **System monospace** (`--mono`): code, dates, identifiers and technical evidence. It is an accent, not the default treatment for anything secondary.

At the usual 16px browser default, the existing 62.5% root makes `1rem` equal 10px. Shared compact labels are `1.3rem`, actions `1.4rem`, supporting summaries `1.6rem`, and prose scales from `1.8rem` to `2rem` with 1.7 leading. The mobile hero introduction has a `1.7rem` floor. Do not add smaller mobile overrides to make copy fit. Let it wrap or grow the section instead. Preserve the existing larger mobile navigation.

Headline scale follows the page's job. The homepage statement, an index masthead, and an article title are different roles; they do not need one shared size. Reuse the existing role before adding another clamp.

Body copy uses a narrow measure, generous leading, and no automatic hyphenation. Articles additionally cap their prose at `--measure-prose: 65ch`; project/diagram canvases keep their existing width. Balance headings, pretty-wrap short introductions, and allow long URLs or identifiers to break only when they must.

Geologica and Literata stay self-hosted; do not add a third downloaded family. The current assets contain normal faces only. True Literata italics remain a font-asset follow-up: vendor the licensed files and appropriate character subsets before declaring them. Do not introduce missing-file URLs or disable emphasis synthesis before a replacement is available.

### Layout

- Main canvas: `--canvas: 120rem`.
- Responsive edge: `--gutter`.
- Metadata rail: `--rail`.
- Reading canvas: `--measure-reading` (`74rem`), with article text additionally capped at `--measure-prose` (`65ch`); wider project prose may reach `86rem`.
- Section rhythm: `--section-space`.
- Minimum control target: `--control-min` (`44px`).
- Borders and spacing create hierarchy. Cards are used only when the content is genuinely a separate object.

Keep grid and flex children at `min-width: 0`. Full-bleed bands may escape the canvas, but their content returns to the shared gutter.

## Page families

### Homepage

Use the full interactive scene. The hero carries one sentence, one short introduction, and one personal line. Current focus comes first; career, selected work, care, and writing follow as separate bands. On mobile, origin and latest-post labels follow the message in normal flow so readable text does not collide with absolute corners.

### Work index and projects

The work index uses a scenic masthead and a paper atlas. Project pages lead with what the product is, Igor's role, current stewardship, and evidence. A system hero is reserved for projects whose interface or workflow needs it.

### Writing

The index uses a large sans-serif masthead and compact metadata. Articles use a serif editorial cover followed by a plain reading surface. Old articles may keep their original embedded media, but they inherit the current reading rhythm.

### About and contact

These use the static scene. About is a portrait and one reading panel. Contact is one short invitation and one clear route to the form or email. Do not add résumé furniture or another dashboard.

### Footer

Keep the landscape visible. The closing question and action may use local contrast, but never a viewport-wide opaque veil.

## Component map

This is a reuse map, not a separate component library. Check it before adding another partial or stylesheet.

| Pattern | Template | Styles |
| --- | --- | --- |
| Shared typography | `layouts/_default/baseof.html` | `assets/css/typography.css` |
| Site shell, navigation, footer | `layouts/partials/header.html`, `layouts/partials/footer.html` | `assets/css/custom.css` |
| Homepage scene and bands | `layouts/partials/home.html` | `assets/css/pages/home.css` |
| Portfolio cards and care feed | `layouts/partials/recent-care.html` | `assets/css/components/portfolio.css` |
| Start-here groups | `layouts/partials/start-here.html` | `assets/css/components/start-here.css` |
| Writing list and article | `layouts/partials/writing-item.html`, `layouts/posts/*.html` | `assets/css/pages/posts.css` |
| Work index and project story | `layouts/projects/*.html` | `assets/css/pages/projects.css` |
| About and contact | `layouts/_default/single.html` | `assets/css/pages/pages.css` |
| Project-specific technical visuals | `layouts/shortcodes/*.html` | `assets/css/systems/*.css` |

## Links and controls

- Reading-prose links keep a subtle underline at rest.
- Navigation, cards, labels, and buttons do not inherit prose underlines.
- Homepage hero phrases stay on one line. At rest they use a crisp, full-color dotted underline with proportional weight and offset; on hover or keyboard focus it becomes the animated shoreline wave.
- Keep that established wave for the hero and the small latest-post link; do not replace it with native wavy text decoration.
- Keyboard focus uses `--focus-ring` and `--focus-ring-offset`. Do not remove an outline without a replacement.
- Buttons and primary navigation controls use at least `--control-min`.
- Motion may clarify state; it must not move surrounding content. Respect reduced-motion preferences.

## Responsive rules

- Core checks: `1280x800` desktop and `390x844` mobile; include `320x568` and `768x1024` for typography changes.
- No page may make `document.documentElement.scrollWidth` exceed `clientWidth`.
- Keep linked hero phrases intact, but do not use `white-space: nowrap` on paragraphs or metadata rows that need to adapt.
- At the mobile breakpoint, rails become rows or stack above the content.
- A component that needs horizontal scrolling must own it explicitly; the page never does.

## Images and atmosphere

- Preserve the Herceg Novi scene. It is the site's one large visual gesture.
- Run WebGL only on the homepage and project pages with `atmosphere: true`.
- Use the static scene elsewhere.
- Keep Sirv transforms, responsive `srcset`, intrinsic dimensions for local images, image descriptions, and lazy loading.
- Product screenshots live in framed technical surfaces. Portraits and editorial images do not reuse that frame by default.

## Voice

Write like Igor: direct, specific, conversational, and technically precise. State what happened, what was difficult, and what remains imperfect. Do not add generic marketing language, inflated claims, tidy three-part slogans, or AI stock phrases.

## Verification

Before shipping a visual change:

1. Run Hugo `0.161.1+extended` and `make quality-gate`.
2. With Hugo serving locally, run `python3 scripts/check-typography.py`. Its module docstring contains the optional development-only Playwright setup. It checks seven page families at four viewports in both themes, including font loading, computed sizes, hero overlap, article measure and navigation. Use `--article-path` to repeat on a long-title or legacy article, and `--browser webkit` for a WebKit pass.
3. Check home, work, one project, writing, one article, about, and contact visually at desktop and mobile sizes. Review the real font rendering over the scene; computed-style checks cannot establish contrast or optical quality.
4. Check dark and light modes, keyboard focus, reduced motion, hover, text enlargement, and horizontal overflow.
5. Confirm the production smoke test after the SFTP sync.

Production lives on Igor's own server. GitHub Actions syncs `public/` over SFTP; Cloudflare may proxy the traffic but does not host the site.
