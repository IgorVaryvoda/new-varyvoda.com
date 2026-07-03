# Plan 001: Untrack orphaned dependencies and junk files, fix dead config keys, delete the stale draft stub

> **Executor instructions**: Follow this plan step by step. Run every
> verification command and confirm the expected result before moving to the
> next step. If anything in the "STOP conditions" section occurs, stop and
> report — do not improvise. When done, update the status row for this plan
> in `plans/README.md`.
>
> **Drift check (run first)**: `git diff --stat 438a91e..HEAD -- .gitignore .gitmodules config.toml CLAUDE.md content/posts/new.md`
> If any of these files changed since this plan was written, compare the
> "Current state" excerpts against the live code before proceeding; on a
> mismatch, treat it as a STOP condition.

## Status

- **Priority**: P1
- **Effort**: S
- **Risk**: LOW
- **Depends on**: none
- **Category**: tech-debt
- **Planned at**: commit `438a91e`, 2026-07-03

## Why this matters

This Hugo site's git repo tracks 796 files of `node_modules/` with **no `package.json` anywhere** — the dependencies are orphaned and unreproducible, and they bloat every clone and pollute every search. It also tracks macOS/IDE artifacts (`.DS_Store`, `.idea/`), Hugo's build lock, and the theme's regenerate-on-build SCSS cache. A stale `.gitmodules` points at a directory that no longer exists. Separately, `config.toml` contains a typo'd key (`colorsheme`) that no template ever reads — the site is dark only because of a template fallback — and CLAUDE.md documents the typo as if it were correct. Finally, `content/posts/new.md` is an empty draft stub dated 1970. All of this is safe, mechanical cleanup.

## Current state

- `git ls-files | grep -c '^node_modules/'` → **796**. There is no `package.json` or `package-lock.json` at the repo root (verify: `ls package.json` → No such file). `config.toml` sets `customCSS = []` / `customSCSS = []`, so Hugo's PostCSS pipeline (the only thing that could use node_modules) is not in use.
- Also tracked (verify with `git ls-files <path>`): `.DS_Store`, `.hugo_build.lock`, `.idea/.gitignore`, `.idea/modules.xml`, `.idea/new-varyvoda.com.iml`, `.idea/vcs.xml`, and four theme build-cache files under `themes/hugo-coder/resources/_gen/assets/scss/scss/` (two `coder*.scss_*.content` and two `.json`).
- `.gitmodules` (entire file):
  ```
  [submodule "bak/themes/hugo-coder"]
  	path = bak/themes/hugo-coder
  	url = https://github.com/luizdepra/hugo-coder.git
  ```
  There is no `bak/` directory; the theme is fully vendored (committed) at `themes/hugo-coder`. No active submodules exist.
- `.gitignore` (entire file, 3 lines):
  ```
  public
  resources/_gen/
  .Codex/
  ```
- `config.toml:32` — `colorsheme = "dark"` (note the missing "c" in "scheme"). Both `layouts/_default/baseof.html:121` and the theme's own baseof read `.Site.Params.colorScheme`:
  ```
  {{ $csClass := "colorscheme-dark" }}
  {{ if eq .Site.Params.colorScheme "dark" }}
    {{ $csClass = "colorscheme-dark" }}
  {{ else if eq .Site.Params.colorScheme "auto" }}
    {{ $csClass = "colorscheme-auto" }}
  ```
  Because `colorsheme` ≠ `colorscheme`, the config value is never read; dark mode works only via the `$csClass` default on the first line. The adjacent key `hidecolorschemetoggle` is fine (Hugo params are case-insensitive; that one has no missing letter).
- `CLAUDE.md:88` — `- Site is dark mode only (colorsheme = "dark", hidecolorschemetoggle = true)` — repeats the typo.
- `content/posts/new.md` (entire file — an empty draft stub, never published):
  ```
  ---
  title: "360 product viewer for vue3"
  date: 1970-01-01
  url: /vue3-360-product-view-zoom-gallery/
  draft: true
  ---

  #360 Product viewer for Vue 3
  ```

## Commands you will need

| Purpose | Command | Expected on success |
|---------|---------|---------------------|
| Clean production build | `rm -rf public && hugo --gc --minify` | exit 0; summary table shows ~28 EN pages; two known deprecation WARNs (`languageCode`, `.Site.Languages`) are expected and fine |
| Tracked-file check | `git ls-files <path>` | empty output = untracked |

Note: the local `public/` directory accumulates stale pages from old builds — always `rm -rf public` before a verification build.

## Scope

**In scope** (the only files you may modify):
- `.gitignore`, `.gitmodules` (delete), `config.toml` (line 32 only), `CLAUDE.md` (line 88 only), `content/posts/new.md` (delete)
- Git index entries for: `node_modules/`, `.DS_Store`, `.hugo_build.lock`, `.idea/`, `themes/hugo-coder/resources/_gen/`

**Out of scope** (do NOT touch):
- Anything else in `config.toml` (deprecation warnings about `languagecode` are handled elsewhere)
- Any file under `themes/hugo-coder/` other than the four `resources/_gen` cache entries
- The `node_modules/` directory **on disk** — untrack it, do not delete it
- `netlify.toml`, `.github/` (plan 002's territory)

## Git workflow

- Branch: `advisor/001-repo-hygiene`
- Commit style: imperative sentence case, matching the repo (e.g. `Untrack generated assets and .Codex; repair mangled .gitignore` from `git log`). One commit for the untracking, one for the config/docs/stub fixes is fine.
- Do NOT push or open a PR unless the operator instructed it.

## Steps

### Step 1: Untrack node_modules and junk files (keep them on disk)

```bash
git rm -r -q --cached node_modules
git rm -q --cached .DS_Store .hugo_build.lock
git rm -r -q --cached .idea
git rm -r -q --cached themes/hugo-coder/resources/_gen
```

**Verify**: `git ls-files | grep -cE '^(node_modules/|\.DS_Store|\.hugo_build\.lock|\.idea/|themes/hugo-coder/resources/_gen/)'` → `0`; and `ls node_modules | head -1` still shows content (directory untouched on disk).

### Step 2: Delete the stale .gitmodules

```bash
git rm .gitmodules
```

**Verify**: `git submodule status` → empty output, exit 0; `ls .gitmodules` → No such file.

### Step 3: Replace .gitignore with the full corrected version

Overwrite `.gitignore` with exactly:

```
public
**/resources/_gen/
.Codex/
node_modules/
.DS_Store
.hugo_build.lock
.idea/
```

(`**/resources/_gen/` covers both the root and the theme-nested cache that Step 1 untracked.)

**Verify**: `git status --porcelain | grep -E 'node_modules|\.idea|\.DS_Store|\.hugo_build\.lock|resources/_gen'` → no `??` (untracked) lines for these paths.

### Step 4: Fix the colorScheme typo in config.toml

Change `config.toml` line 32 from `colorsheme = "dark"` to `colorScheme = "dark"`. Change nothing else in the file.

**Verify**: `grep -c 'colorsheme' config.toml` → `0`; `grep -c 'colorScheme = "dark"' config.toml` → `1`.

### Step 5: Fix the same typo in CLAUDE.md

Change `CLAUDE.md` line 88 from `(colorsheme = "dark", ...)` to `(colorScheme = "dark", hidecolorschemetoggle = true)`.

**Verify**: `grep -c 'colorsheme' CLAUDE.md` → `0`.

### Step 6: Delete the dead draft stub

```bash
git rm content/posts/new.md
```

**Verify**: `test ! -f content/posts/new.md && echo gone` → `gone`. (It is `draft: true`, so no published URL is affected.)

### Step 7: Full verification build

```bash
rm -rf public && hugo --gc --minify
```

**Verify**: exit 0, no ERROR lines; then `grep -c 'colorscheme-dark' public/index.html` → at least `1` (the `<body>` class is unchanged — the site still renders dark).

## Test plan

This repo has no test suite; the verification gate is the production build plus the grep assertions above. No new tests to write.

## Done criteria

ALL must hold:

- [ ] `git ls-files | grep -cE '^(node_modules/|\.DS_Store|\.hugo_build\.lock|\.idea/|themes/hugo-coder/resources/_gen/)'` → 0
- [ ] `.gitmodules` and `content/posts/new.md` do not exist
- [ ] `grep -rc 'colorsheme' config.toml CLAUDE.md` → 0 in both
- [ ] `rm -rf public && hugo --gc --minify` exits 0
- [ ] `grep -c 'colorscheme-dark' public/index.html` ≥ 1
- [ ] `git status` shows no modified files outside the in-scope list
- [ ] `plans/README.md` status row updated

## STOP conditions

Stop and report back (do not improvise) if:

- A `package.json` exists anywhere in the repo root (the "orphaned node_modules" premise would be false).
- `grep -rn 'postcss\|npm ' netlify.toml .github/workflows/ Makefile` returns any match (something might consume node_modules after all).
- After Step 4 the rendered `<body>` tag in `public/index.html` no longer contains `colorscheme-dark`.
- `git submodule status` errors after Step 2.

## Maintenance notes

- If a CSS toolchain is ever actually wanted (PostCSS via `customSCSS`), add a real `package.json` + lockfile and remove `node_modules/` from `.gitignore` deliberately — don't resurrect the orphaned copy.
- Fixing the `colorScheme` key makes it live: setting it to `"auto"` in the future will now actually switch the template branch. That's the intent.
- Reviewer should scrutinize: that the untracking commit contains only deletions of index entries (renames/content changes would be a red flag).
