# Plan 007: Make `make quality-gate` actually gate quality (build + internal link/HTML check)

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- Makefile .github/workflows/main.yml .gitignore`
> Plan 002 legitimately changed the workflow's `hugo-version` line; plan 001
> legitimately rewrote `.gitignore`. Anything else differing from "Current
> state" is a STOP.

## Status

- **Priority**: P2
- **Effort**: M
- **Risk**: LOW
- **Depends on**: plans/002-deploy-consolidation.md (CI wiring assumes the GitHub Actions pipeline is the keeper)
- **Category**: dx
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

The repo's named quality gate is `make quality-gate`, and it is literally just `hugo --gc --minify` — it catches hard template errors and nothing else. All HTML/CSS on this site is hand-written in layouts and raw-HTML markdown (goldmark `unsafe = true`), so broken internal links, missing images, and malformed markup ship silently. This plan adds [htmltest](https://github.com/wjdp/htmltest) (a single-binary HTML/link checker built for static sites) to the Makefile and CI, checking **internal** links and references against the built `public/` directory. External-link checking stays off by default (flaky in CI; old blog posts inevitably have dead external links).

## Current state

- `Makefile` (entire file):
  ```make
  .PHONY: dev dev-drafts build drafts quality-gate

  dev:
  	hugo server

  dev-drafts:
  	hugo server -D

  build:
  	hugo --gc --minify

  drafts:
  	hugo list drafts

  quality-gate: build
  ```
- `.github/workflows/main.yml` — has a `Build` step (`run: hugo --gc --minify`) followed by rclone SFTP sync steps. No test/check step of any kind.
- No lint/format/link-check config anywhere at repo root. `bin/` does not exist.
- Known content quirk the checker must tolerate: the local `public/` accumulates stale files — always build clean. Blog posts embed third-party iframes/scripts (Typeform on `/contact/`, botui in one post); internal-only checking avoids flagging those.
- htmltest release: v0.17.0, linux amd64 binary tarball at
  `https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz`

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean build | `rm -rf public && hugo --gc --minify` | exit 0 |
| Run checker | `./bin/htmltest -c .htmltest.yml` | exit 0, `✔✔✔ passed` summary |
| Gate | `make quality-gate` | build + checker both run, exit 0 |

## Scope

**In scope**:
- `Makefile` (extend `quality-gate`, add an install helper target)
- `.htmltest.yml` (create)
- `.gitignore` (add `bin/` and `tmp/.htmltest/`)
- `.github/workflows/main.yml` (insert one check step between Build and the rclone steps)
- `content/posts/image-seo.md` (ONLY the two anchor hrefs named in Step 3)

**Out of scope** (do NOT touch):
- Fixing external links in old posts (external checking is off)
- Any other workflow steps (rclone/secrets — untouchable per plan 002)
- Adding formatters/linters for the layouts — considered and rejected for now (hand-formatted templates, low churn)

## Git workflow

- Branch: `advisor/007-quality-gate`
- Commit style: imperative sentence case (e.g. `Add htmltest to the quality gate`).
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Install htmltest locally (pinned)

```bash
mkdir -p bin
curl -sfL https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz | tar -xz -C bin htmltest
chmod +x bin/htmltest
```

**Verify**: `./bin/htmltest --version` → `htmltest v0.17.0`.

### Step 2: Create .htmltest.yml

```yaml
DirectoryPath: public
CheckExternal: false
CheckInternal: true
# CheckImages stays OFF: the site's Sirv lazy-load pattern renders
# <img class="Sirv" data-src=...> with no src attribute BY DESIGN, which
# htmltest reports as ~50 false "src attribute missing" errors (verified
# 2026-07-03). Revisit if htmltest gains a src-less-img ignore option.
CheckImages: false
CheckScripts: true
IgnoreAltMissing: true
IgnoreDirectoryMissingTrailingSlash: true
CacheExpires: "720h"
OutputDir: tmp/.htmltest
```

(`IgnoreAltMissing: true` for now — alt-text coverage is a content task, not a gate; flipping it later is one line.)

**Verify**: file exists; YAML parses (`./bin/htmltest -c .htmltest.yml --version` still runs).

### Step 3: Fix the two known-broken anchors, then establish the baseline

The reviewer already ran the baseline (2026-07-03) with `CheckImages: false`: exactly **2 real errors** remain, both dead in-page anchors in `content/posts/image-seo.md` (raw-HTML headings in that post carry explicit ids):

1. Line 74: `<a href="#structured-data-is-a-must-have">` → change the href to `#structured-data` (the real id of the h3 "Structured data is a must" at line 257).
2. Line 183: `<a href="#image-optimization">` → change the href to `#optimize` (the real id of the h2 "Image Optimization" at line 298).

Change only those two `href` values, nothing else in the file. Then:

```bash
rm -rf public && hugo --gc --minify
./bin/htmltest -c .htmltest.yml
```

**Verify**: `./bin/htmltest -c .htmltest.yml` exits 0 (`✔✔✔ passed`). If NEW errors appear beyond the two anchors described above, STOP and report them — do not add IgnoreURLs entries without reviewer sign-off.

### Step 4: Extend the Makefile

Replace the `quality-gate` target and add an install helper:

```make
HTMLTEST := $(shell command -v htmltest 2>/dev/null || echo ./bin/htmltest)

quality-gate: build
	$(HTMLTEST) -c .htmltest.yml

install-tools:
	mkdir -p bin
	curl -sfL https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz | tar -xz -C bin htmltest
	chmod +x bin/htmltest
```

Add `install-tools` to the `.PHONY` line.

**Verify**: `make quality-gate` → builds then runs htmltest, exit 0.

### Step 5: Gitignore the tool and cache

Append to `.gitignore`:

```
bin/
tmp/
```

**Verify**: `git status --porcelain | grep -E 'bin/|tmp/'` → no untracked entries.

### Step 6: Wire into CI

In `.github/workflows/main.yml`, insert between the `Build` step and the rclone install step:

```yaml
    - name: Check links and HTML
      run: |
        curl -sfL https://github.com/wjdp/htmltest/releases/download/v0.17.0/htmltest_0.17.0_linux_amd64.tar.gz | tar -xz htmltest
        ./htmltest -c .htmltest.yml
```

(A failing check now blocks the SFTP sync — that is the point.)

**Verify**: `gh workflow view "Deploy Hugo Site"` renders without error; YAML indentation matches the surrounding steps (2-space, steps at 4).

## Test plan

No unit tests. Prove the gate actually gates: temporarily add `<a href="/definitely-not-a-page/">x</a>` to `content/about.md`, run `make quality-gate`, confirm it **fails** with a target-not-found error, then revert the line and confirm it passes again. Include both outcomes in your report.

## Done criteria

ALL must hold:

- [ ] `make quality-gate` runs build + htmltest and exits 0
- [ ] The deliberate-breakage test failed the gate and passed after revert
- [ ] `.htmltest.yml` committed; any `IgnoreURLs` entries individually justified with comments
- [ ] `bin/` and `tmp/` gitignored; no binary committed (`git ls-files bin/` → empty)
- [ ] CI workflow has the check step between Build and rclone; only that step added
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- The htmltest release URL 404s or the binary won't run on this machine.
- Step 3 produces >20 distinct errors.
- Fixing a broken internal reference would require editing `content/projects/sirv-studio.md` prose (editorially locked — add an ignore entry and flag it instead).
- The workflow edit would touch anything beyond inserting the one step.

## Maintenance notes

- To upgrade htmltest: bump the version in `Makefile` `install-tools` and the CI step together.
- Flip `IgnoreAltMissing: false` when someone wants to do an alt-text pass over old posts.
- `CheckExternal: true` can be run manually now and then (`./bin/htmltest -c .htmltest.yml --check-external` isn't a flag — temporarily flip the YAML key) to find dead external links; do not enable it in CI.
- If plan 002's operator checklist concludes the GH workflow is NOT the production pipeline after all, move the CI step to whatever pipeline survives.
