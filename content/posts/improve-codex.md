---
title: "How improve-codex works"
date: 2026-07-06
draft: false
content_type: "Build record"
description: "A codebase audit becomes reviewed plans, isolated Codex worktrees, and implementation branches that still require a human merge decision."
lastmod: 2026-09-04
---

[improve-codex](https://github.com/IgorVaryvoda/improve-codex) packages the audit and implementation loop I use on mature repositories.

```bash
npx skills add igorvaryvoda/improve-codex
```

Then ask the installed skill to audit the repository or execute selected plans:

```text
$improve-codex
$improve-codex deep security
$improve-codex execute 012 014
```

It returns reviewed implementation work. It never merges or pushes approved implementation branches.

## The plan is the expensive part

The orchestrating session reads the repository, chooses what is worth changing and writes self-contained plans. Each plan needs enough context for an executor that has never seen the conversation.

A read-only Sol critic checks the plan against the code before implementation starts. It looks for false assumptions, missing failure paths, ambiguous scope and weak done criteria. A plan that merely sounds sensible is not ready.

Codex or Claude Code can orchestrate. The division is by responsibility, rather than a requirement that different model families occupy every stage.

## Two execution paths

When a repository already has a complete, reviewed Symphony/Clanker contract, the skill uses its serialized execution and integration workflow. It does not copy Studio's orchestration into an unrelated repository.

Otherwise, a portable runner gives each plan an isolated git worktree and a guarded Terra executor. Dependent plans wait for their prerequisites.

The portable runner removes MCP servers, plugins, browser and other interactive tool surfaces. It applies a timeout and lower CPU priority. Browser verification stays with the main session or the user after the executor marks it skipped. These are the portable runner's rules, not a description of every repo-local execution environment.

## Review the result

The main session reruns the done criteria and reviews the diff. Sol supplies a separate final criticism. Neither a successful process exit nor a plausible completion summary is enough.

The runner requires a usable status report. Critic verdicts must carry the identifier for that run. Report paths cannot overwrite an earlier round. Missing authentication, timeout support or valid reports fail the run.

An independent reviewer can still miss the same defect as the author. The useful protection is a specific objection that can be checked against a file, test or observed result. A different model name alone does not provide that.

## Where it stops

The final verdict is **APPROVE**, **REVISE** or **BLOCK**. Review is capped at two rounds per plan. Work with a surviving major blocker must be split or approached again, rather than pushed through another ceremonial review.

Approved work still needs a merge decision. Browser-dependent checks still need a browser. Each repository still needs tests capable of catching its failures.

The public repository documents the [current workflow and runner settings](https://github.com/IgorVaryvoda/improve-codex#workflow). This article describes that contract checked on 4 September 2026.
