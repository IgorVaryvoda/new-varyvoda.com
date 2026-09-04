# Content review · 4 September 2026

This pass updates existing articles, project pages and featured writing, and adds five posts and three project pages. It changes content and local images only. It does not publish the site or change the sibling repositories used as sources.

## Evidence behind the additions

| Content | Source checked | Boundary kept in the copy |
|---|---|---|
| Press and the 59 false WebPs | `imageguide-desktop` initial commit `19dc00d1389dbc6793a92e4ae045e5dcd0812bc9`; ImageGuide blobs at `e8c14e1`; current scanner and output code | Historical sample independently reproduced: 169 `.webp` files, 59 with PNG signatures and 110 WebP. Current replacement mode has an originals backup; ordinary conversion makes copies. |
| ImageGuide and browser measurements | `imageguide-extension` at `df71a12695a5380037ef87090bcd0bd0838f8815`, collector, analyzer, permission flow and fixture tests | Resource and usage records differ. Measured input bytes do not make modeled savings measured. Scan limits remain explicit. |
| Wanderer and random discovery | `ER-NUXT3`: `971cbdf`, `24a934e83da7db26e4afcdce9b172bfa302c251d`, `7312c57ed609fbc5b3876f64757cba916545b967`; digest tests | Checkout and recurring delivery implementation do not establish paid demand. Cached fare observations are not live quotes. |
| VibeQ closeout verification | `vibequeue`: plan 267, `b8bd0902`, `fc952bf9`, `src/lib/river-closeout.ts` | Mismatch and failed checks invalidate terminal evidence. Unverified results still allow closeout and do not universally override every existing flag. Local gates are not deployment proof. |
| Studio publishing | `ai-image-tools`: `c34534f59ff87756c6761a9d306f39b675acc55e`, `63f838e246e2cdc095c79b394dab6151d3359544`, `1dee4416fde3d3262843b6b9cd628e0cb85b713d`; `docs/testing/shopify-beta-real-store-audit.md` | The procedure requires the exact deployed candidate, 20 lifecycle cycles and 50 publish/reconcile operations with external observations. This content pass did not run that audit or claim it passed. |
| Marketing Machine | `Sirv-Marketing-Machine`: `a23fcc7420d3d53cda8d232aafa9ab453d9bae52`, implementation and regression tests | Cash revenue and point-in-time MRR differ. The $1,200 annual payment and $100 monthly value are test inputs, not disclosed business revenue. |

Project screenshots are unedited repository assets. Press captures are dated August 2026. The ImageGuide extension capture comes from its 0.4.0 source tree; it is not an independent benchmark.

## Existing content corrections

- Studio now leads with the supplier workflow and selected failures. Supplier code starts in February, not April. Historical commit statistics remain in the dated build record. Self-rating and engineer-month guesses were removed from the case study. The ten-merchant figure remains a target.
- The orchestration article and project page match the [public improve-codex contract](https://github.com/IgorVaryvoda/improve-codex): Sol scrutiny, Terra execution, optional repository orchestration and a worktree fallback, without automatic merge or push.
- Repeated essays were tightened around separate examples. The daily-work article uses an absolute date and distinguishes its morning burst from deployment work later that day. Its original activity counts were retained; the historical GitHub event stream was not reconstructed.
- BudJet (`384dbe4d646aab06942e4ebe9fbbcc9e7ed4d0b2`), SlovoCard (`c61a31e72b533e5198bf88724c1735f2fcf570d7`) and Viddl (`7d6a558`) now have concrete maintenance examples.
- Older Shopify, personalization and Nuxt articles have historical context. The Nuxt script-loading example now rejects on a load failure. The Shopify notice cites [Google's Optimize shutdown record](https://support.google.com/analytics/answer/12979939?hl=en).
- Ukraine resources were narrowed to official current pages: Come Back Alive, KOLO, Leleka, UNITED24, Happy Paw, UAnimals and UNHCR, with UAHelp retained as a directory. Verification covered link destination and stated purpose on 4 September, not a financial audit. Removed links were not all classified as broken.

## Validation

- Hugo **0.161.1 extended**, matching CI: `make quality-gate` passed. It built 82 pages, validated 14 public project records, checked 41 HTML documents and passed agent-readiness checks.
- The published JavaScript example was executed with a failing script-load stub. The promise correctly rejected with the stated error.
- `git diff --check` passed.
- Local browser review covered desktop and mobile layouts, including the new project hero with an image, the internal project without an image, and article tables. Preview screenshots were saved outside the repository.

At the end of this review, the changes were local. Publication is a separate step authorised by the subsequent landing request; the Git history and deployment workflow record that result.
