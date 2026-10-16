---
name: Stitch Puzzle lander
description: The existing game's cozy craft identity, scoped to its standalone promotional page.
colors:
  walnut: "#4a3934"
  walnut-deep: "#302622"
  linen: "#f6eee2"
  linen-veil: "#f6eee2e8"
  ink: "#2a2420"
  soft-ink: "#5d4c40"
  moss: "#52643c"
  moss-hover: "#3f512c"
  gold: "#f2c784"
  cream: "#fff6e6"
  supporting-cream: "#e7d4bf"
  footer-muted: "#ceb9a5"
  seam: "#a27b5c"
  wood-edge: "#a67b4b"
  footer-rule: "#806655"
  note-paper: "#e5c68e"
  note-ink: "#483a2c"
  scrollbar: "#b8946c"
typography:
  display:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "clamp(42px, 4.8vw, 68px)"
    fontWeight: 850
    lineHeight: 1.08
    letterSpacing: "-.035em"
  headline:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "clamp(34px, 3.8vw, 52px)"
    fontWeight: 850
    lineHeight: 1.08
    letterSpacing: "-.035em"
  body:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "18px"
    fontWeight: 400
    lineHeight: 1.65
  introduction:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "25px"
    fontWeight: 750
    lineHeight: 1.4
  navigation:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "16px"
    fontWeight: 750
    lineHeight: 1.65
  store-label:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "22px"
    fontWeight: 850
    lineHeight: 1.15
  store-kicker:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "11px"
    fontWeight: 650
    lineHeight: 1.15
    letterSpacing: ".02em"
  action:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "17px"
    fontWeight: 850
    lineHeight: 1.65
  text-action:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "18px"
    fontWeight: 850
    lineHeight: 1.65
  legal:
    fontFamily: "Nunito, ui-rounded, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.5
rounded:
  control: "10px"
  icon: "12px"
  game-screen: "22px"
  cottage-screen: "18px"
  paper: "6px 6px 38px 6px"
  paper-seam: "2px 2px 26px 2px"
spacing:
  compact: "8px"
  small: "12px"
  inline: "16px"
  mobile-gutter: "18px"
  paragraph: "24px"
  desktop-gutter: "32px"
  mobile-section: "48px"
  cloth-section: "74px"
  cottage-section: "90px"
  wide-column-gap: "100px"
components:
  store-link:
    backgroundColor: "{colors.walnut-deep}"
    textColor: "{colors.cream}"
    typography: "{typography.store-label}"
    rounded: "{rounded.control}"
    padding: "8px 16px"
  store-link-hover:
    backgroundColor: "{colors.moss}"
  download-button:
    backgroundColor: "{colors.moss}"
    textColor: "{colors.cream}"
    typography: "{typography.action}"
    rounded: "{rounded.control}"
    padding: "12px 22px"
  download-button-hover:
    backgroundColor: "{colors.moss-hover}"
  welcome-paper:
    backgroundColor: "{colors.linen}"
    textColor: "{colors.ink}"
    rounded: "{rounded.paper}"
    padding: "48px 44px 40px"
  navigation:
    textColor: "{colors.cream}"
    typography: "{typography.navigation}"
  navigation-hover:
    textColor: "{colors.gold}"
  text-link:
    textColor: "{colors.moss}"
    typography: "{typography.text-action}"
  table-note:
    backgroundColor: "{colors.note-paper}"
    textColor: "{colors.note-ink}"
    padding: "16px 24px"
---

# Design System: Stitch Puzzle lander

## Overview

**Creative North Star: "A Little Craft Table"**

This scoped identity carries the existing game's cozy craft world into its standalone lander. Walnut surrounds light linen, rounded Nunito lettering feels friendly, and real screenshots supply the visual detail. Paper, cloth, the cottage and the orange cat come from the game rather than a new illustration style.

Depth comes from the physical character of a few objects: a stitched paper edge, gently tilted screens and diffuse shadows. Reading areas remain open and calm. The established craft-table language and descriptive color names are extracted from the implemented page and its direction contract; they do not introduce a new visual world.

**Key Characteristics:**

- Warm walnut and linen surfaces with clear dark-on-light or light-on-dark text.
- One self-hosted rounded type family with strong, compact headings.
- Actual game screens, game artwork and modest physical depth.
- Spacious prose bands and conspicuous, comfortably sized download actions.

This document applies only to `/stitch-puzzle/`, rendered by `layouts/stitch/single.html` with `assets/css/systems/stitch-puzzle.css`. That template is a complete HTML document and bypasses the personal site's base layout. The root `design.md` remains authoritative for the personal site, its article, support and privacy pages; it is preserved unchanged. The matching extension sidecar is `stitch-puzzle.design.json` in this directory. These scoped filenames are intentional and are not the root-level Impeccable panel defaults.

## Colors

The palette follows the game's warm materials; the frontmatter preserves the exact CSS values.

### Primary

- **Moss** (`moss`): download buttons, the browser-play link and quiet reassurance on linen. The darker `moss-hover` is the closing button's hover state.
- **Warm Gold** (`gold`): focus outlines on walnut, navigation hover and the cat aside.

### Neutral

- **Walnut / Deep Walnut** (`walnut`, `walnut-deep`): the page canvas and dark store controls.
- **Linen / Linen Veil** (`linen`, `linen-veil`): the light reading bands and translucent wash over the real linen texture.
- **Dark Ink / Soft Ink** (`ink`, `soft-ink`): headings and secondary prose on linen.
- **Cream / Supporting Cream / Footer Muted** (`cream`, `supporting-cream`, `footer-muted`): primary, supporting and small footer text on walnut.
- **Stitched Seam / Wood Edge / Footer Rule** (`seam`, `wood-edge`, `footer-rule`): the welcome-paper seam, cloth-band edge and footer divider.
- **Note Paper / Note Ink** (`note-paper`, `note-ink`): the small desktop chart note. **Warm Scrollbar** (`scrollbar`) belongs to the browser chrome treatment.

**The Material Contrast Rule.** Put dark ink on linen and cream on walnut; keep moss for actions and quiet reassurance.

The stylesheet also declares thread red (`--thread`), but no current selector consumes it. It is not promoted into the active token set here. Colors inside game screenshots and artwork remain part of those assets rather than additional UI tokens.

## Typography

**Display and body font:** Nunito, with `ui-rounded, sans-serif` fallbacks. The variable face is self-hosted at `/fonts/stitch-puzzle/Nunito.ttf`, supports the declared weight range (200–900), preloads in the page head and uses `font-display: swap`. Font synthesis is disabled.

**Character:** Soft letterforms and heavy, closely spaced headings establish the game's friendly voice. Body text retains ample leading; the system uses no separate editorial or monospace family.

- **Display:** `display` is the page title. At the mobile breakpoint it becomes `clamp(37px, 9vw, 58px)`; the narrowest override is fixed (36px) at 360px and below.
- **Headline:** `headline` supplies section headings. Headings use balanced wrapping.
- **Body:** `body` is the base. Most supporting passages use a local size (17px); the welcome description becomes smaller (16px) on mobile. Observed prose measures range from 42ch to 47ch, with shorter heading support and an upper mobile feature measure (48ch).
- **Introduction:** `introduction` becomes smaller (22px) at 760px and below.
- **Navigation:** `navigation` becomes smaller (14px) on mobile and smaller again (13px) at 360px and below. The brand uses a heavier weight (850), with desktop/mobile sizes (24px/21px).
- **Store label and kicker:** `store-label` and `store-kicker` keep the platform name distinct from its supporting line. The final 480px rule restores the full label size in vertically stacked controls.
- **Action and legal:** `action` supplies the closing download links; they become smaller (16px) on mobile. `text-action` preserves the base-size browser-play link (18px). `legal` is used for purchase disclosures, with a narrow-screen note override (12px).

**The One Family Rule.** Use self-hosted Nunito for this lander, including its controls; do not import the personal site's display and reading type roles.

## Layout

The shared content canvas has a maximum width (1180px) and desktop side gutters (32px). At 760px and below, gutters become narrower (18px). Grid and flex children must remain able to shrink; `.wrap` establishes `min-width: 0`.

The reusable spatial pattern is a two-column pairing of a real game image and prose, with generous gaps (100px at full width, then 64px and 40px as the viewport narrows). At 760px and below, pairings become a single column. The cottage copy precedes its image on mobile. Real screenshots retain their intrinsic portrait proportions, with image widths capped independently of the text canvas. The three feature paragraphs become one column on mobile.

Section space follows the material bands: larger desktop passages use vertical padding (74px–90px), while the main mobile bands use more compact padding (48px–52px). Paragraphs use normal document flow; the base adjacent-paragraph gap is proportional (1.2em).

Responsive boundaries reflect the source exactly:

- At 1243px and below, reduce welcome spacing and the principal column gaps.
- At 920px and below, reduce gaps and store-label sizing; hide the small chart note.
- At 760px and below, stack the main layout, reduce gutters and hide only the first header anchor. Real charts and Support remain visible.
- At 480px and below, stack store links vertically, stretch them across the paper, and retain a comfortable target height (58px).
- At 360px and below, tighten paper padding and navigation, with the final 480px store rules still taking precedence.

The desktop note stays separate from captions and controls. The current hero game screenshot has no caption; the printable-chart screenshot retains its visible caption below the image. Future edits must preserve those clearances. No content column should create page-level horizontal scrolling.

## Elevation & Depth

Depth is physical and selective. The page places a linen wash over the game's room texture, then lifts paper and screenshots with soft shadows. Plain prose bands do not become cards. Exact shadows, rotations, overlay settings and responsive variants live in the JSON sidecar because they exceed the frontmatter component schema.

The shadow vocabulary is differentiated by object: welcome paper (`0 18px 45px #1f17174d`), hero screen (`0 24px 55px #21150f80`), cottage screen (`0 20px 45px #20161366`), chart screen (`0 18px 40px #49352033`), desktop note (`0 7px 18px #21150f4d`), and store control at rest/hover (`0 3px 6px #30262224` / `0 5px 12px #30262236`).

**The Physical Surface Rule.** Use diffuse shadows for paper and real screen images; keep prose bands flat.

## Shapes

Controls use modest rounded corners (`control`), while the welcome sheet has a distinctive curled lower corner (`paper`) and an inset dashed seam (`paper-seam`). Its seam is decorative, inset from the edge (13px), and does not intercept pointer input. Image corners follow the object: the hero, cottage and chart each retain their observed radius rather than inheriting a universal card shape.

Small fixed rotations make the objects feel placed by hand: welcome paper (-1.2deg; -.6deg on mobile), hero screen (3deg; 2deg on mobile), cottage screen (-3deg), chart (3deg) and the desktop note (-5deg). These are static compositions, not animated entrances.

## Components

### Store links

Dark, compact platform controls sit together on wide paper and stack on narrow paper. The `store-link` component uses an inline SVG platform mark, a small supporting line and a bold platform name. The minimum height is comfortable (58px), with no underline. Hover changes the background to moss and deepens the shadow over a short ease-out transition (0.2s). Keyboard focus uses a visible moss outline on the linen paper (3px, offset 6px).

At intermediate widths the labels and inline padding shrink as implemented; at 480px and below each link occupies its own full-width row. Preserve this final override so labels cannot collide or spill outside the paper.

### Closing download links

Plain, confident moss controls use `download-button` with a minimum height (54px). Hover uses `download-button-hover`; keyboard focus uses the same visible moss outline on linen. The group wraps on desktop and becomes a full-width vertical stack at the mobile breakpoint. The two platform destinations stay separate.

### Welcome paper and cloth bands

The welcome-paper surface uses the game's linen texture under `linen-veil`, the curled-paper radius, a dashed inset seam and the paper shadow. Its padding steps down from the frontmatter desktop value to smaller tablet and mobile values (40px 32px, 34px 28px, then 28px 22px at the narrowest breakpoint). Cloth bands repeat the same material without a floating-card shadow. Only the instructional band receives the wood-colored horizontal edge (8px).

### Navigation and text links

The header brand and navigation use plain text rather than boxed pills. Header items have a minimum control height (44px), no resting underline, a gold hover color and a gold keyboard outline. Header spacing tightens on mobile, where the first anchor is hidden. Footer links retain their underlines and minimum row height (44px).

The browser-play `text-link` is moss, bold and underlined, with a minimum height (44px). Ordinary link hover thickens the underline. The page supplies a skip link that becomes visible on focus.

### Screens and chart note

Screens are semantic figures, not interactive imitations of the app. The real game preview loads eagerly; lower screenshot images and the cat load lazily. The shared responsive-image partial preserves intrinsic sizing and responsive candidates. The chart caption is regular document content below its screenshot. The chart note is a desktop-only paper aside with an in-page link; it disappears at 920px and below.

### Motion and input scope

Only anchor scrolling and background/shadow feedback move over time. `prefers-reduced-motion: reduce` removes transitions and animations and returns scrolling to normal. There are no inputs, selected chips, dialogs or loading states on this page; none are invented for the component catalogue.

## Do's and Don'ts

### Do:

- **Do** use the game's real artwork and screenshots, preserving responsive images, intrinsic proportions and origin metadata.
- **Do** keep dark ink on linen and cream on walnut, with visible focus rings on both materials.
- **Do** retain the final vertical store-link stack at 480px and below and keep labels inside the paper.
- **Do** reserve diffuse shadows and static rotations for the physical paper and image objects.
- **Do** preserve support, privacy, the making-of article and both store destinations when adjusting the composition.

### Don't:

- **Don't** import the personal site's masthead, theme switch or Geologica/Literata type roles into this standalone lander.
- **Don't** replace the game's art with generic decoration or invent testimonials, ratings or product claims.
- **Don't** place notes or decoration over a screenshot caption or download control.
- **Don't** introduce automatic entrance motion or remove the existing reduced-motion behavior.
