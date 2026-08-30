# AGENTS.md

## Project
Igor's personal website/blog.

- Path: `/home/igor/Projects/new-varyvoda.com`
- Production: `https://www.varyvoda.com`
- Stack: Hugo static site using a customized hugo-coder theme.
- Hosting: Igor's own server. Cloudflare may proxy traffic, but it does not host the site.
- Deployment: `.github/workflows/main.yml` builds and validates the site, then syncs `public/` to the production server over SFTP. `netlify.toml` is legacy.

## Commands

```bash
make dev
make dev-drafts
make build
make drafts
make quality-gate
```

Equivalent raw commands:

```bash
hugo server
hugo server -D
hugo --gc --minify
hugo list drafts
```

## Agent workflow

1. Read `CLAUDE.md` first for content structure and template overrides.
2. Read `design.md` before changing templates or styles.
3. Do not rewrite personal voice into generic AI marketing copy.
4. For new posts/projects, use existing front matter patterns from neighboring files.
5. Preserve Sirv image URLs and lazy-loading behavior.
6. For template/style changes, run `make build`.

## Current caveats

- Keep Hugo `0.161.1` aligned across local builds and `.github/workflows/main.yml`.
- Never describe Cloudflare Pages as production. The SFTP target is the authoritative production host.
- The SFTP deploy does not publish `functions/`; verify any edge-function claim separately.
