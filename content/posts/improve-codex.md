---
title: "How improve-codex works"
date: 2026-07-06
draft: false
content_type: "Build record"
description: "A codebase audit becomes reviewed plans, isolated Codex worktrees, and implementation branches that still require a human merge decision."
---

[improve-codex](https://github.com/IgorVaryvoda/improve-codex) packages the audit and implementation loop I use on mature repositories.

```bash
npx skills add igorvaryvoda/improve-codex
/improve-codex
```

It audits a repository, writes implementation plans, reviews each plan, runs approved work in isolated git worktrees, and reviews the resulting diffs. It never merges the work.

## The four stages

1. **Audit.** Claude reads the repository and writes self-contained plans with file scope and done criteria.
2. **Review the plans.** A read-only OpenAI critic checks each plan against the code. It looks for false assumptions, ambiguous instructions, missing failure paths, and weak done criteria.
3. **Execute.** Each accepted plan gets a fresh git worktree and a sandboxed Codex process. Two Codex processes can run at once, with lower CPU priority and a hard timeout.
4. **Review the diff.** Claude reruns the plan's checks, compares the changed files with the declared scope, reads the diff, and checks whether new tests exercise real behaviour. Claude and OpenAI critics then review the result independently.

The final verdict is **APPROVE**, **REVISE**, or **BLOCK**. An approved branch still waits for a human merge decision.

## Why use two model families

The split is practical. Claude handles repository-wide audit and review. Codex is good at following a detailed implementation plan and producing a focused diff.

The cross-model review matters too. A model family can share the author's blind spots and find its own output reasonable. In this workflow, OpenAI reviews Claude's plans and Claude reviews Codex's implementation. Neither critic can edit the work it is judging.

This does not make the review independent in a scientific sense. It gives the same artifact two different failure profiles.

## The limits

Most of the repository is there to limit what an executor can do.

- MCP servers, plugins, and browser tools are removed from executor sessions.
- Writes are confined to the plan's git worktree.
- Critics run read-only.
- Dev servers, watch mode, broad E2E suites, and other long-running processes are forbidden unless the plan explicitly needs them.
- Every Codex process runs with a timeout and lower CPU priority.
- A missing or malformed completion report fails the run.

These rules came from real failures. Parallel browser sessions exhausted machines. Unbounded processes outlived their workers. Completion reports claimed tests had passed without running them.

One rule now covers every review report: **a claim needs evidence from the session**. "All tests pass" is not accepted without the test command and its result. Critics must cite a file, line, or command output. Speculative suggestions and style complaints do not block a run.

## What a run looks like

```bash
/improve-codex                    # audit, plan, execute, review
/improve-codex deep security      # focus the audit
/improve-codex execute            # run existing TODO plans
/improve-codex execute 012 014    # run selected plans
/improve-codex execute low effort # use cheaper executor settings
```

Before execution, the skill prints the plan count, order, and concurrency. Each plan is reviewed, assigned a worktree, executed, and checked. Dependent plans wait for their prerequisites.

A revision gets at most two implementation rounds. If the same major problem survives, the plan is blocked and needs to be rewritten. More feedback cannot repair an ambiguous plan.

## Limits

- **No browser verification.** UI work returns with visual checks marked as skipped. A human or separate browser lane must do them.
- **No automatic merge.** Approved branches remain in their worktrees.
- **Limited concurrency.** The workflow should not produce diffs faster than one person can review properly.

The repository is [MIT-licensed and available on GitHub](https://github.com/IgorVaryvoda/improve-codex).
