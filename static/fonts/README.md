# Font assets

Geologica and the upright Literata subsets in this directory are committed site assets.

The three Literata italic WOFF2 files are reproducible build artifacts. `make dev`, `make build`, and the deployment workflow run `scripts/sync-literata-italics.py`, which downloads these exact upstream files from the archived Literata repository at commit `0c2761b727a1b3a7cffd313c37f0f5163dfc7a63`:

| Local file | Upstream file | Weight | Git blob SHA-1 |
| --- | --- | ---: | --- |
| `literata-italic.woff2` | `fonts/webfonts/Literata-Italic.woff2` | 400 | `840da65b0fd95c107c5b18f7cf86cefb2b30a621` |
| `literata-medium-italic.woff2` | `fonts/webfonts/Literata-MediumItalic.woff2` | 500 | `3b9844d4235a176365312379d70f03bd6bc010a5` |
| `literata-semibold-italic.woff2` | `fonts/webfonts/Literata-SemiBoldItalic.woff2` | 600 | `fc086e08aff57f9ad7d085ffa7a9e1c30db0cd85` |

The sync script verifies each file's WOFF2 signature, exact byte length, and Git blob hash before installing it. The generated files are ignored by Git but copied by Hugo into the built site, so browsers load them from varyvoda.com rather than from Google Fonts or GitHub.

Literata is licensed under the SIL Open Font License 1.1. See `OFL-Literata.txt` in this directory.
