# varyvoda.com

Igor Varyvoda's personal site: a Hugo portfolio and writing archive organized around a living body of work.

Production: <https://www.varyvoda.com>

## Local development

Use Hugo `0.161.1+extended`, the version pinned in `.github/workflows/main.yml`.

```bash
make dev             # live server
make dev-drafts      # live server with drafts
make build           # production build
make drafts          # list drafts
make quality-gate    # build, schema, HTML/link, and agent-output checks
```

`make quality-gate` expects `htmltest` on `PATH` or at `./bin/htmltest`. Run `make install-tools` to install the pinned local copy.

## Content model

- `content/projects/` contains public project records and case studies.
- `content/posts/` contains essays, build records, guides, postmortems, and the older archive.
- `content/about.md` and `content/contact.md` are standalone pages.
- `data/career.yaml` drives the homepage career strip.
- `data/care.yaml` drives Recently tended. Entries are editorial records of verified work, not a live GitHub feed.
- `data/writing_start.yaml` drives the curated Start here section.

Every public project must include:

```yaml
role: "Creator and sole builder"
stewardship:
  state: "maintained"
  note: "How the project is cared for now."
last_tended: "2026-08-30"
description: "What it is and why it matters."
image_alt: "Useful image description"
feedback_url: "/contact/?project=example&type=bug"
proof:
  - value: "1,000+"
    label: "Downloads"
```

Allowed stewardship states are `primary-focus`, `evolving`, `maintained`, `long-running`, and `formative`. `node scripts/validate-projects.mjs` enforces the schema and accepts a non-date `last_tended` only for formative records.

Posts use `content_type`: `Essay`, `Build record`, `Guide`, `Postmortem`, or `Field note`. Add `older_archive: true` when a post belongs in the historical archive rather than a current writing group.

## Rendering and assets

The site overrides hugo-coder in `layouts/`.

- `layouts/partials/home.html` renders the homepage narrative.
- `layouts/projects/` renders the living portfolio and project case studies.
- `layouts/posts/` renders the curated writing index and article pages.
- `layouts/shortcodes/` owns reusable visual systems extracted from Markdown.
- `assets/css/custom.css` contains shared design primitives.
- `assets/css/pages/` contains route-family styles.
- `assets/css/components/` contains shared portfolio and Start here components.
- `assets/css/systems/` and `assets/js/pages/` contain page-specific case-study systems loaded through `page_css` and `page_js` front matter.

The interactive Herceg Novi atmosphere runs on the homepage and on project pages with `atmosphere: true`. Other pages keep the visual signature with a static scene instead of creating a WebGL context. Preserve Sirv URLs and native lazy loading when editing images.

## Machine-readable output

Hugo emits HTML and Markdown for home, section, and page routes. `functions/_middleware.js` contains the edge content negotiation and read-only `/api` index; `static/openapi.json` documents it. The SFTP workflow does not deploy the edge function, so edge changes need their existing separate Cloudflare deployment path.

Verify the generated surface with:

```bash
node scripts/test-agent-readiness.mjs
```

## Deployment

Pushes to `main`, daily scheduled runs, and manual dispatches run `.github/workflows/main.yml`:

1. Build with Hugo `0.161.1+extended`.
2. Validate project records, generated HTML, links, and machine-readable output.
3. Sync `public/` to the production server over SFTP with rclone.
4. Smoke-test the new homepage, projects, first-business record, Studio, writing, and fingerprinted CSS.
5. Submit changed URLs to IndexNow on push events.

Cloudflare fronts production. `netlify.toml` is legacy. Header and cache policy lives at the edge; see `docs/edge-headers.md`. Run `bash scripts/check-headers.sh` for the strict policy audit or `STRICT_HEADERS=0 bash scripts/check-headers.sh` for the reachability/header smoke used after deployment.
