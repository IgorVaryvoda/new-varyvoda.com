# varyvoda.com

<!-- impeccable:product-schema 1 -->

## Platform

web

## Product Purpose

Igor Varyvoda's personal site presents his work and writing. Its standalone product pages have distinct audiences and product identities.

**Stitch Puzzle:** The page promotes his iOS and Android game and links to its existing build article, support and privacy pages.

**Press for iPhone:** The `/press-iphone/` page explains the photo and video compressor, shows its actual interface, and links to its App Store download, development story, support and privacy pages. It helps visitors understand the compare, save and separately approve removal workflow before trying the free app.

## Users

**Stitch Puzzle — inferred from the requested promo page:** prospective players looking for a calm puzzle game, including cross-stitch hobbyists.

**Press for iPhone — inferred from the requested landing page and app capabilities:** prospective iPhone users who want more storage space and want to review smaller copies before deciding what to remove. This audience is an inference, not a supplied research finding.

## Capabilities and Constraints

**Website:** Hugo static site deployed by GitHub Actions over SFTP to Igor's server. Existing articles and support/privacy routes remain accessible. The incumbent `design.md` is the site's visual authority.

**Stitch Puzzle:** Preserve the existing article and support/privacy routes. Store metadata must link to the game lander on varyvoda.com. Confirmed by the user: this should be a separate lander in the game's cozy style, with Impeccable design guidance. These game-specific style commitments do not apply to Press.

**Press for iPhone:** The app requires iOS 26 or later and makes local smaller copies using HEVC for video and HEIC for photos. Visitors must be able to distinguish comparing a copy, saving it, and approving removal of an original. Press validates the copy and checks that it reached Photos before offering removal; removal always requires a separate system approval. Removed originals stay in Recently Deleted for about 30 days unless the user empties it sooner. Compression may change quality, so do not promise identical quality or universal savings.

Press has no account, server or analytics. Media stored only in iCloud is downloaded when chosen for compression; the user's iCloud Photos settings still apply. Free includes browsing, swipe review, removal and ten smaller copies each day. An optional one-time full-version purchase unlocks unlimited copies, similar photos and Live Photo stills. The US App Store price checked on 16 October 2026 was $9.99; local prices may vary. Support and privacy remain at `/press-iphone/support/` and `/press-iphone/privacy/`.

## Brand Commitments

**Across the site:** Preserve Igor's direct voice and factual product claims.

**Stitch Puzzle:** Use the game's real artwork and Nunito lettering.

**Press for iPhone:** Use the real app icon and native screenshots, retaining the meaning of the demonstrated file sizes. The current landing page inherits the site's Geologica/Literata typography, semantic color roles and dark/light themes. With no answer to the optional style question, this was the session's implementation assumption; it is not a stored user preference or a new global visual rule.

## Evidence on Hand

**Stitch Puzzle:** `content/posts/stitch-puzzle-reviews-first.md`, its screenshots in `assets/images/posts/`, and the sibling `stitch-puzzle` repository contain the source evidence. The current game has 616 puzzles in 77 albums, optional rewarded ads, free printable DMC charts, a cottage and a cat. No testimonials or rating claims have been supplied.

**Press for iPhone:** The sibling `press-ios/README.md` and `press-ios/docs/app-store-listing.md` document the workflow, privacy model and free/full-version split. The [current App Store listing](https://apps.apple.com/us/app/press-photo-video-compressor/id6814991311), checked on 16 October 2026, establishes the public app ID, iOS requirement and US purchase price. `assets/images/press-iphone/ORIGIN.md` and adjacent JSON sidecars record the five actual app rasters and their origins; no generated UI is used. The demonstrated library is simulator sample content, not customer evidence. No testimonials, rating claims or general savings measurements have been supplied.

## Product Principles

**Stitch Puzzle:**

- Show the real game and make both store links easy to find.
- Explain the spool-and-shelf puzzle clearly.
- Preserve the article as the development story.
- Keep downloads, support and privacy accessible on mobile.

**Press for iPhone:**

- Show the real app and make the App Store download easy to find.
- Explain the separate compare, save and removal decisions clearly.
- Keep privacy, free limits and the optional one-time purchase explicit.
- Preserve access to the development story, support and privacy on mobile.
- Present screenshot savings as that example's result, without implying every library will achieve it.
