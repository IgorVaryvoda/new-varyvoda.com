# Stitch Puzzle lander

Mode: Persuade. Route: /stitch-puzzle/. User-pinned visual authority: the existing game's cozy style, presented as a separate lander. Source: game/main.gd colors, Nunito font, artwork and real article screenshots. This extends the game's identity; it does not change the personal site's visual system.

## Direction contract

THESIS: A little craft table for a puzzle you can later stitch on real fabric. Real game screens and finished pictures carry the page.

OWN-WORLD: Walnut (#4a3934), linen (#f6eee2), ink (#2a2420), moss (#52643c) and thread red (#c8553d). Self-hosted Nunito. Real birch, cloth and cottage assets from the game, never generic stock decoration.

STORY: Understand spools, stitches and shelf; download for iPhone/iPad or Android; discover the free real chart and the cottage; read the making-of article.

FIRST VIEWPORT: Compact game wordmark and page anchors above a broad cloth welcome. A central stitched fox and real game screen sit with a short invitation and two conspicuous store links. The page opens on the game's material, with no personal-site masthead.

FORM: A craft-table composition with a central game demonstration, followed by alternating screenshot-and-prose passages and a clear closing download shelf. Precisely specified extension of the game's established world; no concept seed required. Interaction: in-page links lead from the craft-table note to the printable chart, with simple download actions. Motion is limited to anchor scrolling and control feedback; reduced motion removes transitions.

FINISH: The finish review returned **ship** after one fix batch and bounded verification of the two findings: mobile store labels now stack within the paper, and the desktop chart note no longer obscures the removed hero caption. The initial review found the direction contract matched and required no rebuild. This verdict is limited to that finish review and its fix-list verification, not a claim of exhaustive browser or accessibility testing. Latest shared captures: `.impeccable/review/desktop.png` (1440px), `mobile.png` (390px), and `mobile-320.png` (320px).

## Scoped design authority

The implemented token system is documented in `.impeccable/surfaces/stitch-puzzle.design.md`, with extension metadata and self-contained component examples in `.impeccable/surfaces/stitch-puzzle.design.json`. These files apply to the standalone `/stitch-puzzle/` lander only. Root `design.md` is the incumbent personal-site authority and remains unchanged; the lander's complete HTML template bypasses its base layout and loads a separate game-identity stylesheet.

## Asset evidence

Existing game art comes from sibling `stitch-puzzle` commit `7adab31`; the three real screenshots come from the existing build article. The raster metadata pass reported four game rasters and zero missing provenance records, and the reused article screenshots also carry embedded origin metadata. No image generation or approved visual comp was part of this implementation. See `assets/images/stitch-puzzle/ORIGIN.md` and the source-asset metadata records for origin details.
