# AGENTS.md

## Project
Igor's personal website/blog.

- Path: `/home/igor/Projects/new-varyvoda.com`
- Production: `https://www.varyvoda.com`
- Stack: Hugo static site using a customized hugo-coder theme.
- Deployment: Netlify via `netlify.toml`.

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
2. Do not rewrite personal voice into generic AI marketing copy.
3. For new posts/projects, use existing front matter patterns from neighboring files.
4. Preserve Sirv image URLs and lazy-loading behavior.
5. For template/style changes, run `make build`.

## Current caveats

- Netlify production config pins an old Hugo version. Local newer Hugo may pass while Netlify differs; mention version-sensitive changes.
