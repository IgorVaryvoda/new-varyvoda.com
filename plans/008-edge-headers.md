# Plan 008: Specify and verify security + caching headers at the real edge (Cloudflare)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- netlify.toml .github/workflows/main.yml`
> Also read the outcome of plan 002 in `plans/README.md` — this plan assumes
> plan 002 confirmed the SFTP + Cloudflare pipeline as production. If plan 002
> is not DONE, STOP.

## Status

- **Priority**: P3
- **Effort**: M
- **Risk**: MED (a too-strict CSP can break Sirv images, Typeform, or twemoji — hence report-only first)
- **Depends on**: plans/002-deploy-consolidation.md (must be DONE — the header target depends on which host is production)
- **Category**: security / perf
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

The live site has no Content-Security-Policy and no long-lived caching on its fingerprinted assets. Verified live headers (2026-07-03): Cloudflare already injects `x-content-type-options: nosniff` and `referrer-policy: strict-origin-when-cross-origin`, but `cache-control` is `public, max-age=0, must-revalidate` **even for content-hashed CSS/JS** that could safely be cached immutable for a year, and any XSS or compromised third-party script runs with no CSP backstop. Because production is (per plan 002) an SFTP origin behind Cloudflare — not Netlify — headers cannot be set from this repo alone; they're configured in the Cloudflare dashboard. What the executor CAN do: build the exact, evidence-based header specification from the rendered site, commit it as an operator runbook, and commit a verification script that proves the headers landed once the operator applies them.

## Current state

- Live header sample (`curl -sI https://www.varyvoda.com/`):
  ```
  server: cloudflare
  cache-control: public, max-age=0, must-revalidate
  x-content-type-options: nosniff
  referrer-policy: strict-origin-when-cross-origin
  ```
  No `content-security-policy`, no `x-frame-options`/`frame-ancestors`, no `permissions-policy`.
- Fingerprinted assets: Hugo builds `public/css/coder.<hash>.css`, `coder-dark.<hash>.css` (and `css/custom.<hash>.css` if plan 006 landed) — content-hashed, safe for `immutable`.
- Known external origins in rendered pages (re-derive in Step 1; the set changes if plans 005/003 landed): `scripts.sirv.com`, `cdnjs.cloudflare.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, `sirv-cdn.sirv.com`, `cdn.earthroulette.com`, `iantiark.sirv.com`, `embed.typeform.com` (contact page script + iframe), `sirv.com` (botui demo scripts in one post), `platform.twitter.com` (embedded tweets in old posts, if any survive), `https://utteranc.es` only if comments were ever wired (they are currently dead).
- `netlify.toml` is legacy/suspected-dead after plan 002 — do NOT add headers there unless plan 002 concluded Netlify is live (see STOP conditions).

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 |
| Origin census | `grep -rhoE 'https?://[a-zA-Z0-9.-]+' public/ \| sort \| uniq -c \| sort -rn` | frequency-ranked origin list |
| Live headers | `curl -sI https://www.varyvoda.com/` | current header set |

## Scope

**In scope** (files to create):
- `docs/edge-headers.md` — the operator runbook (header values + where to set them in Cloudflare)
- `scripts/check-headers.sh` — executable verification script

**Out of scope** (do NOT touch):
- `netlify.toml` (legacy; see STOP conditions)
- The GitHub Actions workflow
- Any layout/content changes (if the census finds an origin that should be removed, report it — don't remove it)
- Actually applying Cloudflare configuration — operator-only; the executor has no dashboard access

## Git workflow

- Branch: `advisor/008-edge-headers`
- Commit style: imperative sentence case (e.g. `Add edge-header runbook and verification script`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Build the evidence-based origin allowlist

```bash
rm -rf public && hugo --gc --minify
grep -rhoE 'https?://[a-zA-Z0-9.-]+' public/ | sort | uniq -c | sort -rn > /tmp/origin-census.txt
```

Classify each origin by directive: `script-src` (script tags), `style-src` (stylesheet links), `font-src`, `img-src`, `frame-src` (Typeform/YouTube/Twitter iframes), `connect-src` (Sirv.js fetches images from `*.sirv.com` and `cdn.earthroulette.com`). Read the actual usage in `public/` for anything ambiguous (`grep -rl '<origin>' public/ | head` then inspect the tag type).

**Verify**: the classification table (origin → directive) is written into `docs/edge-headers.md`; every origin with ≥2 occurrences in the census is classified or explicitly excluded with a reason.

### Step 2: Write docs/edge-headers.md

The runbook must contain, concretely:

1. **The CSP**, built from Step 1's table, in report-only form first. Starting skeleton (adjust to the census — do not ship this blind):
   ```
   Content-Security-Policy-Report-Only:
     default-src 'self';
     script-src 'self' 'unsafe-inline' https://scripts.sirv.com https://cdnjs.cloudflare.com https://embed.typeform.com;
     style-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com https://fonts.googleapis.com;
     font-src https://fonts.gstatic.com https://cdnjs.cloudflare.com;
     img-src 'self' data: https:;
     frame-src https://form.typeform.com https://embed.typeform.com;
     connect-src 'self' https://*.sirv.com https://cdn.earthroulette.com;
     frame-ancestors 'self';
   ```
   Note in the doc: `'unsafe-inline'` for script-src is required today (inline `onload='twemoji.parse(...)'` on `<body>` plus inline scripts in old posts); tightening to nonces would require template changes — listed as future work, not this rollout.
2. **The caching rules**: Cloudflare Cache Rules matching `/css/*` and `/js/*` (fingerprinted) → `Cache-Control: public, max-age=31536000, immutable`; `/images/*` → `public, max-age=86400, must-revalidate`; HTML → leave as-is.
3. **Where to click**: Cloudflare dashboard → Rules → Transform Rules (response headers) for the CSP; Caching → Cache Rules for caching. Plus the promotion path: run report-only ≥1 week, check the report endpoint / browser consoles on the four key pages (`/`, `/projects/sirv-studio/`, `/posts/image-seo/`, `/contact/`), then rename the header to `Content-Security-Policy`.

**Verify**: the doc exists and contains all three sections; every origin in the CSP appears in the Step 1 census (no invented entries).

### Step 3: Write scripts/check-headers.sh

An executable bash script that asserts, via `curl -sI`, once the operator has applied the config:

- `https://www.varyvoda.com/` → has `content-security-policy-report-only` (or, post-promotion, `content-security-policy`; accept either), `x-content-type-options: nosniff`, `referrer-policy`
- The current fingerprinted CSS URL (parse it from the live homepage: `curl -s https://www.varyvoda.com/ | grep -oE '/css/coder[^"]*\.css' | head -1`) → `cache-control` containing `immutable`
- Exit non-zero listing each failed assertion; exit 0 with `ALL HEADERS OK` otherwise.

**Verify**: `bash scripts/check-headers.sh` runs and (before the operator applies anything) **fails with a clear list of the missing headers** — that failing-by-design output goes in your report as proof the script detects the current gap. `shellcheck scripts/check-headers.sh` if available → no errors.

### Step 4: Hand off

Final report includes: the origin→directive table, the full recommended header set, the failing check-headers output, and the instruction that the operator applies the Cloudflare config then re-runs `scripts/check-headers.sh` until it passes.

## Test plan

`scripts/check-headers.sh` is itself the test artifact. Gate: it must fail informatively against today's live site and be structured to pass after the runbook is applied (assert on header names/values exactly as the runbook specifies).

## Done criteria

ALL must hold:

- [ ] `docs/edge-headers.md` committed with census-derived CSP, cache rules, and dashboard steps
- [ ] `scripts/check-headers.sh` committed, executable, fails informatively today
- [ ] No origin in the CSP that isn't in the census; no census origin ≥2 occurrences left unclassified
- [ ] No changes to netlify.toml, workflow, layouts, or content
- [ ] `plans/README.md` status row updated (status: DONE = artifacts delivered; the Cloudflare application itself is tracked in the runbook, not this plan)

## STOP conditions

Stop and report back (do not improvise) if:

- Plan 002's status is not DONE, or its outcome concluded **Netlify** is the live host — in that case this plan's deliverable changes shape (headers belong in `netlify.toml` `[[headers]]` blocks instead); report and wait for re-scoping.
- The origin census surfaces an origin that looks like tracking/malware you can't attribute to any known feature — report it as a possible content-injection finding before proceeding.
- You're tempted to "quickly" apply a header by editing repo files — there is no repo-side mechanism for the SFTP+Cloudflare path; don't fake one.

## Maintenance notes

- Every new third-party embed in a post (new iframe, new script origin) will need a CSP allowlist update — the runbook's census command is the refresh procedure. Consider re-running `scripts/check-headers.sh` after content additions that embed new services.
- After plan 005 lands, `cdnjs.cloudflare.com` drops from one stylesheet (fork-awesome) but keeps normalize + twemoji — the census, not this plan's prose, is the source of truth.
- Once CSP is enforcing (not report-only), moving the twemoji `onload` handler and inline post scripts to nonce'd script tags would allow dropping `'unsafe-inline'` — meaningful hardening, template work, own task.
