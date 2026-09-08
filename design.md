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

- **Geologica** (`--display`): navigation, controls, scannable career/work cards, product and index headings.
- **Literata** (`--reading`): prose, editorial headlines, reflective statements.
- **System monospace** (`--mono`): code, identifiers, dates, status, and restrained evidence labels. Not the default for navigation or ordinary supporting copy.

Shared size and reading-role tokens live in `assets/css/typography.css`. The base template loads this after the legacy shell and before route-family styles in both development and production. Its compact tokens supersede the older defaults in `custom.css`; change the role token here rather than adding another local override.

At a 16px browser default (the existing root is 62.5%), compact metadata is 12.5px, ordinary controls 14px, supporting copy 13px, scannable card copy 16px, introductions 17–19px, and long-form prose 18–20px with 1.72 leading. Keep sizes in rem-based tokens so browser text-size preferences still scale them. Uppercase is reserved for short metadata and established brand lettering; normal controls and supporting sentences retain their authored case.

The homepage uses a sans headline, serif introduction, and sans personal line. On small screens, let the scene grow to accommodate the text instead of restoring the old 9–13.5px overrides. Article navigation uses Geologica and a 44px minimum row target. Fenced code stays monospace at the action size; nested `code` inherits that size instead of shrinking it again.

Font files and loading remain self-hosted and unchanged. Real Literata italic files are not supplied by this typography pass: italic synthesis remains enabled until matching licensed italic assets and their Unicode subsets are added and verified. Do not declare a nonexistent local font URL or disable synthesis before supplying the face.

Headline scale follows the page's job. The homepage statement, an index masthead, and an article title are different roles; they do not need one shared size. Reuse the existing role before adding another clamp.

Body copy uses a narrow measure, generous leading, and no automatic hyphenation. Balance headings, pretty-wrap short introductions, and allow long URLs or identifiers to break only when they must.

### Layout

- Main canvas: `--canvas: 120rem`.
- Responsive edge: `--gutter`.
- Metadata rail: `--rail`.
- Reading layout column: `--measure-reading` (`74rem`); wider project prose may reach `86rem`. Article text uses `--measure-prose: 64ch`, resolved in Literata at the paragraph size; do not apply that limit to technical project diagrams.
- Section rhythm: `--section-space`.
- Minimum control target: `--control-min` (`44px`).
- Borders and spacing create hierarchy. Cards are used only when the content is genuinely a separate object.

Keep grid and flex children at `min-width: 0`. Full-bleed bands may escape the canvas, but their content returns to the shared gutter.

## Page families

### Homepage

Use the full interactive scene. The hero carries one sentence, one short introduction, and one personal line. Current focus comes first; career, selected work, care, and writing follow as separate bands.

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
| Site shell, navigation, footer | `layouts/partials/header.html`, `layouts/partials/footer.html` | `assets/css/custom.css` |
| Shared typography roles | `layouts/_default/baseof.html` | `assets/css/typography.css` |
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
- Homepage hero phrases stay on one line when they fit; on mobile, an enlarged phrase may wrap inside its link rather than clip. At rest they use a crisp, full-color dotted underline with proportional weight and offset; on hover or keyboard focus it becomes the animated shoreline wave.
- Keep that established wave for the hero and the small latest-post link; do not replace it with native wavy text decoration.
- Keyboard focus uses `--focus-ring` and `--focus-ring-offset`. Do not remove an outline without a replacement.
- Buttons and primary navigation controls use at least `--control-min`.
- Motion may clarify state; it must not move surrounding content. Respect reduced-motion preferences.

## Responsive rules

- Core checks: `1280x800` desktop and `390x844` mobile.
- No page may make `document.documentElement.scrollWidth` exceed `clientWidth`.
- Keep linked hero phrases intact when space permits, but do not use `white-space: nowrap` on paragraphs or metadata rows that need to adapt.
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

1. Run Hugo `0.161.1+extended` and `make quality-gate`. `make test-typography` also runs the dependency-free source contracts independently; these are not a visual pass.
2. Check home, work, one project, writing, one article, about, and contact at desktop and mobile sizes.
3. Check dark and light modes, keyboard focus, reduced motion, hover, and horizontal overflow. Include 320px width, short landscape, larger browser text, and Ukrainian glyphs (`Ґґ Єє Іі Її`). Confirm actual Geologica/Literata faces load, hero corners do not overlap, and long table-of-contents links wrap. Do not count a fallback-font fixture as full visual verification.
4. Confirm the production smoke test after the SFTP sync.

Production lives on Igor's own server. GitHub Actions syncs `public/` over SFTP; Cloudflare may proxy the traffic but does not host the site.
