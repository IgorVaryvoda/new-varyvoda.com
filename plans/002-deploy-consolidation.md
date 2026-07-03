# Plan 002: Establish one authoritative deploy pipeline with one pinned Hugo version, and make the docs tell the truth

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- netlify.toml .github/workflows/main.yml CLAUDE.md AGENTS.md`
> If any of these changed since this plan was written, compare the "Current
> state" excerpts against the live files before proceeding; on a mismatch,
> treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: M
- **Risk**: MED
- **Depends on**: none
- **Category**: bug / migration / docs
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

Every push to `main` currently triggers **two independent deploys**: a GitHub Actions workflow that builds with `hugo-version: 'latest'` and rclone-syncs `public/` to an SFTP server, and (per `netlify.toml` and the docs) a Netlify build pinned to Hugo **0.78.2** (November 2020). The advisor session verified: the live site `https://www.varyvoda.com` is served through Cloudflare with **no Netlify origin headers**, and the GitHub Actions workflow has consecutive green runs — so the SFTP pipeline is almost certainly production and the Netlify story in the docs is stale. Meanwhile `hugo-version: 'latest'` means production output silently changes whenever Hugo releases, and CLAUDE.md claims a third version (0.148.2) while the local binary is a fourth (0.161.1). This plan pins one exact Hugo version in the real pipeline, marks the Netlify config as suspected-dead pending operator confirmation, and corrects the docs.

## Current state

- `.github/workflows/main.yml` (the likely-live pipeline) — key excerpts:
  ```yaml
  on:
    push:
      branches:
        - main
  ...
      - name: Setup Hugo
        uses: peaceiris/actions-hugo@v2
        with:
          hugo-version: 'latest'
          extended: true

      - name: Build
        run: hugo --gc --minify
  ...
      - name: Sync public directory to server
        run: rclone sync public sftp:${{ secrets.SFTP_DIR }} --sftp-ask-password=false
  ```
- `netlify.toml` — pins `HUGO_VERSION = "0.78.2"` in `[context.production.environment]` (and 3 other contexts), build command `hugo --gc --minify`, publish `public`.
- Evidence the SFTP pipeline is production (gathered 2026-07-03):
  - `curl -sI https://www.varyvoda.com/` → `server: cloudflare`, `cf-cache-status: DYNAMIC`, **no** `x-nf-request-id` / `server: Netlify` headers.
  - `gh run list --limit 6` → six consecutive successful "Deploy Hugo Site" runs.
  - `config.toml` sets `[markup.highlight] style = "catppuccin-mocha"` — a Chroma style that does not exist in Hugo 0.78.2, so a 0.78.2 Netlify build would silently render different code-block colors than what the live site shows.
- Local Hugo: `hugo version` → `hugo v0.161.1+extended` (this machine builds the site in ~73ms, exit 0, with two known deprecation WARNs: `languageCode` and `.Site.Languages`).
- `CLAUDE.md` wrong claims to fix: line 10 (`**Hugo Version**: 0.148.2+extended (deployed version uses 0.78.2 as per netlify.toml)`), line 22 (comment `# Build for production (same as Netlify)`), lines 80–83 (`Hosted on Netlify: ... Production Hugo version: 0.78.2`).
- `AGENTS.md` wrong claims to fix: `- Deployment: Netlify via netlify.toml.` (Project section) and the "Current caveats" bullet about Netlify pinning an old Hugo version.

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0; ~28 EN pages; the two known deprecation WARNs are fine |
| Live-site headers | `curl -sI https://www.varyvoda.com/` | `server: cloudflare`; no `x-nf-request-id` |
| Workflow runs | `gh run list --limit 5` | recent "Deploy Hugo Site" runs visible |
| Workflow syntax check | `gh workflow view "Deploy Hugo Site"` | renders without error |

## Scope

**In scope**:
- `.github/workflows/main.yml` — pin `hugo-version`
- `netlify.toml` — add a warning comment header only (do NOT delete the file in this plan)
- `CLAUDE.md` — the version/deployment claims listed above
- `AGENTS.md` — the deployment/caveats claims listed above

**Out of scope** (do NOT touch):
- The workflow's rclone/secrets steps and action version bumps — that is a separately declined hardening finding; changing secret handling here risks breaking the live deploy with no way to test except production.
- Deleting `netlify.toml` or disconnecting the Netlify site — requires operator dashboard access (see Step 5 checklist).
- `config.toml` (the deprecation warnings are noted in Maintenance, not fixed here).

## Git workflow

- Branch: `advisor/002-deploy-consolidation`
- Commit style: imperative sentence case matching repo history (e.g. `Pin the deploy workflow to Hugo 0.161.1`).
- Do NOT push or open a PR unless the operator instructed it. **Note**: because the deploy fires on push to `main`, the operator should merge this at a moment they can watch the Actions run.

## Steps

### Step 1: Re-verify the deploy evidence

Run `curl -sI https://www.varyvoda.com/` and `gh run list --limit 5`.

**Verify**: headers show `server: cloudflare` and contain **no** `x-nf-request-id` or `server: Netlify`; run list shows "Deploy Hugo Site" runs with recent success. If either check contradicts this, see STOP conditions.

### Step 2: Pin the Hugo version in the workflow

In `.github/workflows/main.yml`, change:

```yaml
          hugo-version: 'latest'
```
to:
```yaml
          hugo-version: '0.161.1'
```

(0.161.1 matches the local binary that currently builds this site cleanly, so local output == CI output. Keep `extended: true` as is.)

**Verify**: `grep -n "hugo-version: '0.161.1'" .github/workflows/main.yml` → 1 match; `grep -c "hugo-version: 'latest'" .github/workflows/main.yml` → 0. (`runs-on: ubuntu-latest` also contains the word "latest" — that one is correct and stays.)

### Step 3: Confirm 0.161.1 builds the site cleanly

```bash
hugo version   # must report v0.161.1
rm -rf public && hugo --gc --minify
```

**Verify**: local Hugo is 0.161.1 and the build exits 0. If the local binary is a *different* version, still proceed with the pin (0.161.1 is known-good from the advisor session) but note the discrepancy in your report.

### Step 4: Mark netlify.toml as suspected-dead

Add this comment block at the very top of `netlify.toml` (TOML comments, keep the rest of the file byte-identical):

```toml
# SUSPECTED DEAD CONFIG (2026-07-03): the live site is served via
# Cloudflare + the GitHub Actions SFTP deploy (.github/workflows/main.yml),
# not Netlify — see plans/002-deploy-consolidation.md. If the operator
# confirms the Netlify site is disconnected or deleted, remove this file.
# Until then, note that HUGO_VERSION below (0.78.2) does NOT reflect
# production.
```

**Verify**: `head -6 netlify.toml` shows the comment; `git diff netlify.toml` shows only added comment lines.

### Step 5: Correct CLAUDE.md and AGENTS.md

In `CLAUDE.md`:
- Line 10: replace with `**Hugo Version**: 0.161.1+extended — pinned in .github/workflows/main.yml; local builds should use the same version`
- Line 22: change the comment to `# Build for production (same as CI)`
- Lines 80–83 (Deployment section): replace the Netlify block with a description of the real pipeline, e.g.:
  ```
  Deployed via GitHub Actions (.github/workflows/main.yml):
  - On push to main: builds with pinned Hugo 0.161.1 extended, then rclone-syncs public/ to an SFTP server
  - The site is fronted by Cloudflare
  - netlify.toml is legacy/suspected-dead config — see plans/002-deploy-consolidation.md
  ```

In `AGENTS.md`:
- Change `- Deployment: Netlify via \`netlify.toml\`.` to `- Deployment: GitHub Actions → rclone SFTP sync (.github/workflows/main.yml), fronted by Cloudflare. netlify.toml is legacy.`
- Replace the "Current caveats" bullet about Netlify with: `- Production Hugo is pinned in .github/workflows/main.yml; keep local Hugo on the same version for reproducible output.`

**Verify**: `grep -n '0.148.2\|0.78.2' CLAUDE.md` → only matches (if any) are inside the netlify-legacy note, not presented as the production version; `grep -c 'Hosted on Netlify' CLAUDE.md` → 0; `grep -c 'Deployment: Netlify' AGENTS.md` → 0.

### Step 6: Write the operator checklist into your final report

Include this checklist verbatim in your completion report (these need dashboard access the executor does not have):

1. In the Netlify dashboard: check whether a site is still linked to this repo and whether it ran a production deploy recently. If linked → stop auto-publishing (or delete the site), then delete `netlify.toml` in a follow-up commit.
2. In DNS/Cloudflare: confirm the origin behind www.varyvoda.com is the SFTP host the workflow syncs to.
3. After the next push to `main`, watch the Actions run and spot-check the live site (code-block highlight colors on any post with a code fence should match a local 0.161.1 build).

## Test plan

No test suite exists. The gates are: the greps above, a clean local build on 0.161.1, and — post-merge, operator-observed — a green Actions run and unchanged live pages.

## Done criteria

ALL must hold:

- [ ] `grep -n "hugo-version: '0.161.1'" .github/workflows/main.yml` → 1 match
- [ ] `rm -rf public && hugo --gc --minify` exits 0 on Hugo 0.161.1
- [ ] `netlify.toml` starts with the suspected-dead comment; rest of file unchanged
- [ ] CLAUDE.md and AGENTS.md contain no claim that Netlify is the (primary) deploy or that production Hugo is 0.78.2/0.148.2
- [ ] Operator checklist included in the completion report
- [ ] `git status` clean outside the four in-scope files
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- `curl -sI https://www.varyvoda.com/` shows `x-nf-request-id` or `server: Netlify` — Netlify may actually be live, and the premise of this plan inverts.
- `gh run list` shows the "Deploy Hugo Site" workflow failing or absent.
- The local Hugo build fails on 0.161.1 (ERROR lines, not the two known WARNs).
- You are tempted to edit the rclone/secrets steps — that is explicitly out of scope.

## Maintenance notes

- When Hugo is next upgraded: bump the pin in `.github/workflows/main.yml`, the local binary, and CLAUDE.md line 10 **together**, and fix the two deprecations while at it (`languagecode` → `languageCode`-replacement per the WARN text, and the theme's `.Site.Languages` usage).
- Once the operator confirms Netlify is disconnected, delete `netlify.toml` entirely (a follow-up one-line PR) and remove the legacy notes from the docs.
- Plans 007 (quality gate in CI) and 008 (edge headers) build on the outcome of this plan.
- Reviewer should scrutinize: that the workflow diff touches ONLY the `hugo-version` line.
