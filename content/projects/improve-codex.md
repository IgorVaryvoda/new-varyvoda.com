---
title: "improve-codex"
date: 2026-07-18
draft: false
project_url: "https://github.com/IgorVaryvoda/improve-codex"
image: "https://opengraph.githubassets.com/varyvoda-projects/IgorVaryvoda/improve-codex"
image_alt: "improve-codex open-source repository overview"
description: "A codebase audit becomes reviewed plans and bounded implementation, through repo-local orchestration or isolated worktrees. Approved branches still need a merge decision."
hero_title: "improve-codex"
hero_title_size: "compact"
hero_kicker: "Agent workflow"
hero_intro: "I built an agent skill that turns a codebase audit into reviewed plans and bounded implementation work, using the repository's runner or isolated worktrees."
hero_mark: "Codebase improvement"
hero_scope: "Audit to reviewed branch"
hero_primary_label: "View on GitHub"
hero_frame_label: "improve-codex / repository"
hero_frame_status: "Open source"
hero_flow:
  - "Audit the codebase"
  - "Scrutinize the plans"
  - "Execute in worktrees"
  - "Review every diff"
tech_stack: ["Agent Skills", "Codex CLI", "Shell", "Git Worktrees"]
role: "Creator and maintainer"
stewardship:
  state: "evolving"
  note: "I change the workflow when a real audit, review, or worktree run exposes a weak check."
last_tended: "2026-09-04"
feedback_url: "https://github.com/IgorVaryvoda/improve-codex/issues"
proof:
  - value: "4 stages"
    label: "Audit, plan, execute, review"
  - value: "Isolated"
    label: "One git worktree per plan"
users_changed: "Failed runs and reviewer feedback led to nonce-verified reports, checks for incomplete runs, and checks against live local services."
imperfect: "It stops before merge and depends on each repository having good checks. It is slower than an autonomous code bot and much less likely to wreck the main checkout."
highlights:
  - "Repo-local orchestration or isolated worktrees"
  - "Guarded Terra executors and read-only Sol criticism"
  - "Independent plan and diff reviews"
  - "Approved work waits for a human merge decision"
weight: 11
lastmod: 2026-09-04
---

## The plan comes first

I built improve-codex because an audit finding is not yet an implementation task. "Fix the billing" leaves an executor to invent the scope, failure cases and proof.

The orchestrating session turns findings into self-contained plans. Sol checks those plans against the repository. Terra implements accepted work. The main session and Sol review the resulting diffs.

Codex or Claude Code can orchestrate. The important split is between proposing work, implementing it and checking it.

## Use the repository's execution path

A repository with the full reviewed Symphony/Clanker contract can run its own serialized execution and integration workflow. Elsewhere, the portable runner creates an isolated git worktree for each plan.

That fallback confines writes, removes browser and MCP tools, applies a timeout and runs at lower CPU priority. It returns browser checks as skipped for the main session to finish. It does not try to install a fleet into a repository that only needs one worker.

## A clean exit is not a review

The portable runner fails when an executor produces no usable status, even if the process exits zero. Critic verdicts are tied to a particular run, and each round has its own report path. A later attempt cannot erase the first review.

After two rounds, a surviving major finding means the plan needs to be split or reconsidered. Repeating the same request is not a repair for unclear intent.

## Approved still means waiting

The skill returns approve, revise or block. It never merges or pushes approved implementation branches. The human merge decision and any remaining browser verification stay visible.

[Read how the current workflow runs](/posts/improve-codex/) or [install the skill](https://github.com/IgorVaryvoda/improve-codex#install).
