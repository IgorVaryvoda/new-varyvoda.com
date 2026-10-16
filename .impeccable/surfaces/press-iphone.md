# Press for iPhone landing page

Mode: Persuade. Route: `/press-iphone/`. This is a scoped extension of the existing site and the app's established identity, following the standalone Hugo page pattern used by `/stitch-puzzle/`. The root `design.md` remains the visual authority. No replacement identity or generated design comp is required for this extension.

## Direction contract

THESIS: Show the actual smaller-copy preview, explain the separate decision to remove the original, and let visitors try the free app.

WORLD: Inherit the personal site's Geologica and Literata, paper/ink/slate/rule/accent tokens, dark-first theme and complete light theme. Use Press's real icon and native app screenshots. A compact product header and footer keep the download path self-contained.

FIRST VIEWPORT: “Make room for more,” a short explanation, a real comparison screen and a direct App Store download. The screenshot's file sizes describe that demonstrated video only; no universal savings claim.

STORY: Preview and download; on-device privacy; the find/compare/save/remove workflow; three real feature screens; free allowance and optional one-time purchase; practical FAQs; closing download.

INTERACTION: Native disclosure questions, in-page anchors and the site's existing accessible, persistent theme control. All content remains readable without JavaScript. Control feedback uses a short color transition; reduced motion disables transitions and smooth scrolling.

FACTS: The app makes smaller local copies, checks they reached Photos and asks before removal. Free includes ten copies each day; the full version unlocks unlimited copies, similar photos and Live Photo stills. Verified on the App Store on 16 October 2026: app ID 6814991311, iOS 26+, US one-time unlock $9.99. Source: https://apps.apple.com/us/app/press-photo-video-compressor/id6814991311 and sibling `press-ios/README.md`.

ASSUMPTION: With no style answer received during independent preparation, the session uses the existing site's restrained system. This is a session choice, not a stored workflow preference. The existing Hugo repository and server deployment remain authoritative.

QUALITY BAR: The existing site sets typography, contrast, focus, responsive and theme quality. The game landing page sets the standalone product route, download and help/footer pattern. No invented reviews, ratings, universal savings claims, or new analytics.

ASSETS: See `assets/images/press-iphone/ORIGIN.md`. Actual raw simulator screenshots and the app icon from the sibling iOS project. No AI-generated imagery.

## Implementation record

This records the scoped implementation in `layouts/press/single.html`, `layouts/partials/press-download.html` and `assets/css/systems/press-iphone.css`. It does not replace or extend the root `design.md` authority, and does not establish a new site-wide design system or require a root sidecar.

- **Inherited palette and type:** The standalone template bundles the existing `fonts.css` and `custom.css` with the scoped stylesheet. Paper/raised-paper, ink/slate, rule and accent roles come directly from `custom.css` in both themes. Geologica is the heading/control/body face; Literata supplies the introduction and section explanations. No new font family or accent palette is introduced.
- **Local type adaptation:** This route uses a 100% root size, a 16px base at the standard browser setting, a hero clamp reaching 96px, section headings reaching 44.8px and 18px feature headings. These are product-page roles in the scoped stylesheet, not changes to the site's shared typography tokens. The template loads the actual self-hosted faces.
- **Layout and depth:** A bounded 72rem canvas and responsive edge support the hero, open ruled workflow/pricing groups and three real screenshot figures. At 700px the main grids stack; at 380px pricing stacks and navigation wraps. The only substantial shadow frames the phone screenshots; the rest of the page uses inherited surface changes and rules. These local proportions and frames are not promoted to global defaults.
- **Controls:** The store action is a reusable partial. Links, disclosures and theme control use inline SVG where icons are needed. Native `details`/`summary` retains FAQ access without JavaScript. The existing `theme.js` controls the persistent theme. Scoped focus outlines, 44px navigation/footer targets, color feedback and reduced-motion overrides are present in source.
- **Assets and claims:** Five raster assets have origin sidecars, with no missing provenance recorded. Screenshots retain the app's real interface and sample content. Source copy names the free/full-version split, US price qualification, iCloud download behavior, compression-quality tradeoff and separate removal approval. No reviews or ratings are invented.

## Verification boundary

On 16 October 2026, the implementation owner reported `make quality-gate` passing with pinned Hugo 0.161.1, internal-link validation, six typography source tests and schema/font/agent checks. These checks do not by themselves establish visual quality. The owner also reported computed desktop type of 96px hero, approximately 45px section headings, 18px feature headings and 16px body, with Geologica/Literata loaded; the mechanical flat-type flag cannot resolve the generated Hugo stylesheet link and is not a reason to change the recorded system.

The reviewer’s initial disposition was FIX, with the established system, product demonstration, first viewport and responsive adaptation matching the contract. The final verdict pass returned **ship** and scored all three requested fixes resolved: SVG icon geometry, product-specific documentation, and refreshed captures with the revised heading and settled light-theme download buttons. This verdict covers the scored fixes only. Final captures are `desktop.png`, `desktop-light.png`, `mobile.png`, `mobile-light.png` and `mobile-320.png` under `.impeccable/review/press-iphone/`.

The browser checks found no horizontal overflow at 1440px, 390px or 320px, loaded both actual typefaces, and verified native FAQ opening by mouse, closing by keyboard, and the theme control. Final captures used reduced motion to settle theme transitions; the light captures retain the FAQ's visible keyboard-focus outline. These are bounded Chromium checks, not exhaustive browser or accessibility certification. Production deployment and smoke checks run through the existing GitHub Actions/SFTP workflow. No defect or tooling flag is canonized as an inherited design rule.
