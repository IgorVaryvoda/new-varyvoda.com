# Edge headers runbook

Production is the GitHub Actions SFTP deploy behind Cloudflare. Do not add
these headers to `netlify.toml`; that file is suspected-dead legacy config.

Evidence was generated from a clean local build on 2026-07-03:

```bash
rm -rf public && hugo --gc --minify
grep -rhoE 'https?://[a-zA-Z0-9.-]+' public/ | sort | uniq -c | sort -rn > /tmp/origin-census.txt
```

The exact grep emitted one binary-file warning for `public/images/apple-touch-icon.png`,
then wrote the origin census. A second read-only parser over `public/` was used
to separate fetched resources from canonical URLs, schema URLs, RSS/sitemap
entries, and outbound article links.

## Origin census

Every origin with at least 2 occurrences in `/tmp/origin-census.txt` is either
assigned to a CSP directive or explicitly excluded below.

| Origin | Count | CSP treatment | Evidence / reason |
|---|---:|---|---|
| `https://www.varyvoda.com` | 130 | `'self'` covers same-origin loads | Absolute canonical/meta/feed/sitemap/internal URLs; not added as a host source. |
| `https://sirv.com` | 70 | `script-src`, `style-src`; outbound links excluded | Old image-personalization post loads `sirv.com/wp-content/.../botui.js`, `bot-article.js`, and `personalization.css`; most other hits are links/footer text. |
| `https://sirv.sirv.com` | 68 | `img-src`, `media-src` | Sirv image, spin, and one video source URLs in older posts. |
| `https://cdn.earthroulette.com` | 67 | `img-src`, `connect-src` | Project images, OG images, Sirv lazy placeholders, and preconnects. |
| `https://cdnjs.cloudflare.com` | 63 | `script-src`, `style-src` | Normalize stylesheet and twemoji script. Fork Awesome is gone from the clean current build. |
| `https://sirv-cdn.sirv.com` | 61 | `img-src`, `media-src`, `connect-src` | Sirv-hosted images/video and preconnects. |
| `https://schema.org` | 60 | Excluded | Structured-data `@context`, breadcrumb `itemtype`, and article links; no browser resource fetch. |
| `https://fonts.googleapis.com` | 46 | `style-src` | Google Fonts stylesheet. |
| `https://scripts.sirv.com` | 38 | `script-src` | Site Sirv.js plus preconnects. |
| `https://fonts.gstatic.com` | 22 | `font-src` | Google Fonts font host, present as preconnect in the rendered HTML and loaded by the Google Fonts CSS. |
| `https://stats.varyvoda.com` | 21 | `script-src`, `connect-src` | Plausible-style analytics script. |
| `https://gohugo.io` | 21 | Excluded | Footer link only. |
| `https://demo.sirv.com` | 16 | `img-src` | Sirv spin/image examples in old posts. |
| `https://www.uahelp.me` | 14 | Excluded | Project/content outbound links only. |
| `https://apps.shopify.com` | 13 | Excluded | Article outbound links only. |
| `https://www.linkedin.com` | 10 | Excluded | Social/profile/build-record outbound links only. |
| `https://experts.sirv.com` | 8 | Excluded | Project outbound links only. |
| `http://www.w3.org` | 8 | Excluded | RSS/sitemap XML namespaces only. |
| `https://iantiark.sirv.com` | 7 | `img-src` | Avatar and Earth Roulette project images. |
| `https://www.sirv.studio` | 6 | Excluded | Sirv Studio outbound links only. |
| `https://unpkg.com` | 6 | `style-src` | BotUI stylesheets in the image-personalization post. |
| `https://github.com` | 6 | Excluded | Social/project outbound links only. |
| `https://my.sirv.com` | 5 | Excluded | Article outbound links only. |
| `https://www.slovocard.com` | 4 | Excluded | Project outbound links only. |
| `https://www.budjet.app` | 4 | Excluded | Project outbound links only. |
| `https://t.co` | 4 | Excluded | Links inside embedded tweet markup; not a first-party resource. |
| `https://support.google.com` | 4 | Excluded | Article outbound links only. |
| `https://earthroulette.com` | 4 | Excluded | Project outbound links only. |
| `https://www.shopify.com` | 3 | Excluded | Article outbound links only. |
| `https://www.blog.google` | 3 | Excluded | Article outbound links only. |
| `https://reallygoodemails.com` | 3 | Excluded | Article outbound links only. |
| `https://play.google.com` | 3 | Excluded | Project outbound links only. |
| `https://experts-content.sirv.com` | 3 | Excluded | Literal URLs inside a highlighted code sample, not executed. |
| `https://caniuse.com` | 3 | Excluded | Article outbound links only. |
| `https://apps.apple.com` | 3 | Excluded | Project outbound links only. |
| `https://www.intercom.com` | 2 | Excluded | Article outbound links only. |
| `https://twitter.com` | 2 | Excluded | Social/tweet outbound links; `platform.twitter.com` is the fetched script origin. |
| `https://snap36.com` | 2 | Excluded | Article outbound links only. |
| `https://linktr.ee` | 2 | Excluded | Article outbound links only. |
| `https://httparchive.org` | 2 | Excluded | Article outbound links only. |
| `https://developers.google.com` | 2 | Excluded | Article outbound links only. |
| `https://blog.hubspot.com` | 2 | Excluded | Article outbound links only. |
| `https://backlinko.com` | 2 | Excluded | Article outbound links only. |

Additional load-bearing origins with 1 static occurrence were inspected because
they are resource tags:

| Origin | CSP treatment | Evidence / reason |
|---|---|---|
| `https://cdn.jsdelivr.net` | `script-src` | Vue 2 script in the image-personalization post. |
| `https://embed.typeform.com` | `script-src`, `frame-src` | Protocol-relative Typeform embed script in `/contact/`. The exact `https?://` grep does not count protocol-relative URLs, but the rendered tag is present. |
| `https://api.typeform.com` | `connect-src` | Runtime origin found by fetching `https://embed.typeform.com/next/embed.js` with Node. |
| `https://form.typeform.com` | `frame-src` | Runtime origin found by fetching `https://embed.typeform.com/next/embed.js` with Node. |
| `https://platform.twitter.com` | `script-src`, `frame-src` | Embedded tweet script in `/posts/image-seo/`; runtime frame origin is from `widgets.js`. |
| `https://syndication.twitter.com` | `frame-src`, `connect-src` | Runtime origin found by fetching `https://platform.twitter.com/widgets.js` with Node. |
| `https://cdn.syndication.twimg.com` | `connect-src` | Runtime origin found by fetching `https://platform.twitter.com/widgets.js` with Node. |
| `https://demo-cdn.sirv.com` | `img-src` | Sirv spin demo in `/posts/image-seo/`; covered by `img-src https:`. |

## Content Security Policy

Install this header as report-only first. Keep it in report-only mode for at
least 1 week, then inspect browser consoles and reports on these pages:

- `https://www.varyvoda.com/`
- `https://www.varyvoda.com/projects/sirv-studio/`
- `https://www.varyvoda.com/posts/image-seo/`
- `https://www.varyvoda.com/contact/`

Header name:

```text
Content-Security-Policy-Report-Only
```

Header value:

```text
default-src 'self'; script-src 'self' 'unsafe-inline' https://scripts.sirv.com https://cdnjs.cloudflare.com https://stats.varyvoda.com https://platform.twitter.com https://cdn.jsdelivr.net https://sirv.com https://embed.typeform.com; style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com https://unpkg.com https://sirv.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; media-src https://sirv-cdn.sirv.com https://sirv.sirv.com; frame-src https://embed.typeform.com https://form.typeform.com https://platform.twitter.com https://syndication.twitter.com; connect-src 'self' https://*.sirv.com https://cdn.earthroulette.com https://stats.varyvoda.com https://api.typeform.com https://syndication.twitter.com https://cdn.syndication.twimg.com; frame-ancestors 'self'; object-src 'none'; base-uri 'self'; form-action 'self'
```

Notes:

- `'unsafe-inline'` is required today. The rendered site has
  `onload=twemoji.parse(document.body)` on `<body>`, many inline `<style>`
  blocks, and an inline `SirvOptions` script in `/posts/image-seo/`.
- Dropping `'unsafe-inline'` requires template/content work with nonces or
  moving the inline scripts/styles out of HTML. That is future work, not this
  rollout.
- `img-src 'self' data: https:` is deliberately broad because old posts contain
  many remote image examples and embeds. Tighten it only after a separate
  content cleanup pass.
- After the report-only period is clean, promote by renaming the header to
  `Content-Security-Policy` with the same value.

## Cache rules

Create Cloudflare Cache Rules for static assets. HTML should stay as-is because
new deploys should be visible without a long browser TTL.

| Match | Browser cache TTL / header | Reason |
|---|---|---|
| Path starts with `/css/` | `Cache-Control: public, max-age=31536000, immutable` | Hugo fingerprints CSS filenames, for example `coder.min.<hash>.css`, `coder-dark.min.<hash>.css`, and `custom.min.<hash>.css`. |
| Path starts with `/js/` | `Cache-Control: public, max-age=31536000, immutable` | Safe for any future fingerprinted JS assets. |
| Path starts with `/images/` | `Cache-Control: public, max-age=86400, must-revalidate` | Local image files are not consistently content-hashed. |
| HTML and feeds | Leave current behavior | Avoid stale pages after SFTP deploys. |

## Cloudflare setup

1. Go to Cloudflare dashboard -> the `varyvoda.com` zone.
2. Go to Rules -> Transform Rules -> Modify Response Header.
3. Add a response header rule for all hostname requests under
   `www.varyvoda.com`.
4. Set `Content-Security-Policy-Report-Only` to the value above.
5. Go to Caching -> Cache Rules.
6. Add the `/css/*`, `/js/*`, and `/images/*` cache rules from the table above.
7. Run `bash scripts/check-headers.sh`.
8. Leave CSP in report-only mode for at least 1 week and check the four key
   pages listed above.
9. If the reports are clean, rename
   `Content-Security-Policy-Report-Only` to `Content-Security-Policy` and run
   `bash scripts/check-headers.sh` again.

The current live site is expected to fail `scripts/check-headers.sh` until the
Cloudflare response-header and cache rules are applied.
