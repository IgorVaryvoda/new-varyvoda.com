# Napkin

## Corrections
| Date | Source | What Went Wrong | What To Do Instead |
|------|--------|----------------|-------------------|

## User Preferences
- Keep personal site copy in Igor's voice; avoid generic marketing rewrites.

## Patterns That Work
- Read `CLAUDE.md` before touching Hugo content; `RTK.md` may be referenced by `AGENTS.md` but absent in this repo.
- `hugo server` may need sandbox escalation to bind `127.0.0.1:1313`; production `make build` runs normally in the sandbox.

## Patterns That Don't Work
- Do not assume the article data lives in Hugo data files; the Sirv Studio build-record page currently embeds its commit dataset inline.

## Domain Notes
- The Sirv Studio case study lives at `content/projects/sirv-studio.md`; the static build record lives at `static/projects/sirv-studio/build-record/index.html`.
