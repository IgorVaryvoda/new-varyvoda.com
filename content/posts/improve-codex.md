---
title: "How improve-codex works"
date: 2026-07-06
draft: false
content_type: "Build record"
description: "A codebase audit becomes reviewed plans, isolated Codex worktrees and implementation branches that still require a human merge decision."
lastmod: 2026-09-23
featuredImage: "/images/posts/improve-codex.webp"
image_alt: "Three isolated platforms of blocks pass through separate inspection panels before meeting at one final gate."
ogImage: "https://www.varyvoda.com/images/posts/improve-codex.jpg"
---

[improve-codex](https://github.com/IgorVaryvoda/improve-codex) is the loop I run on mature repositories: audit the code, write plans, have a critic attack them, let agents implement them in isolation and review the result. It stops before the merge. That part stays mine.

```bash
npx skills add igorvaryvoda/improve-codex
```

Then ask the installed skill to audit the repository or execute selected plans:

```text
$improve-codex
$improve-codex deep security
$improve-codex execute 012 014
```

## The plan is the expensive part

The main session reads the repository, picks what is worth changing and writes self-contained plans. Each plan has to work for an executor that has never seen the conversation.

Before anything gets built, a critic reads each plan against the actual code. The critic is Sol (`gpt-5.6-sol` at high effort) in a read-only sandbox. It hunts for false assumptions, missing failure paths, vague scope and weak done criteria. A plan that only sounds sensible goes back.

Codex or Claude Code can run the main session. What matters is that planning, criticism and execution are separate jobs, not which model does which.

## Two execution paths

Studio has its own orchestration (Symphony and Clanker). If a repository already has that set up and reviewed, the skill uses it and runs plans one at a time through that workflow.

Everywhere else, a portable runner gives each plan its own git worktree and an executor running Terra (`gpt-5.6-terra`). Plans that depend on other plans wait for them.

The runner strips the executor down. No MCP servers, no plugins, no browser. It gets a timeout and a lower CPU priority. If a check needs a browser, the executor marks it skipped and the main session or I do it later.

## Review the result

The main session reruns the done criteria and reviews the diff. Sol does a separate final review. A clean exit code and a confident summary don't count for anything.

The runner wants a usable status report. Every critic verdict carries the ID of its run. A later round can't overwrite an earlier report. If authentication, timeout support or a valid report is missing, the run fails.

A second reviewer can still miss the same bug as the author. What helps is a specific objection you can check against a file, a test or an observed result. A different model name on the review doesn't give you that.

## Where it stops

The final verdict is **APPROVE**, **REVISE** or **BLOCK**. Review stops after two rounds per plan. If a major blocker survives both, the work gets split or rethought. It doesn't go through a third round of ceremony.

Approved work still needs me to merge it. Browser checks still need a browser. And the whole thing is only as good as the repository's tests.

The repository has the [current workflow and runner settings](https://github.com/IgorVaryvoda/improve-codex#workflow). This post matches them as of 4 September 2026.
