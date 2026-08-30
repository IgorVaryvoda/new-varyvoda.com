---
title: "improve-codex"
date: 2026-07-18
draft: false
project_url: "https://github.com/IgorVaryvoda/improve-codex"
image: "https://opengraph.githubassets.com/varyvoda-projects/IgorVaryvoda/improve-codex"
image_alt: "improve-codex open-source repository overview"
description: "An agent skill that audits a codebase, turns the findings into executable plans, and sends each plan to a sandboxed Codex worker in its own git worktree. The main agent reviews everything; nothing lands automatically."
hero_title: "improve-codex"
hero_title_size: "compact"
hero_kicker: "Agent workflow"
hero_intro: "I built an agent skill that audits a codebase, writes the plans, and gives each one to a guarded Codex executor in its own git worktree."
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
  note: "I change the workflow when a real audit, review, or worktree run exposes a weak guardrail."
last_tended: "2026-08-16"
feedback_url: "https://github.com/IgorVaryvoda/improve-codex/issues"
proof:
  - value: "4 stages"
    label: "Audit, plan, execute, review"
  - value: "Isolated"
    label: "One git worktree per plan"
users_changed: "Failed runs and reviewer feedback led to nonce-verified reports, fail-closed orchestration, and checks against live local services."
imperfect: "It stops before merge and depends on each repository having good checks. It is slower than an autonomous code bot and much less likely to wreck the main checkout."
highlights:
  - "One isolated git worktree per plan"
  - "Sandboxed, browser-free, CPU-capped Codex executors"
  - "Independent plan and diff reviews"
  - "Approved work waits for a human merge decision"
weight: 11
---

## The failure mode

One agent can audit a codebase, propose a fix, implement it, and declare itself correct. That is convenient. It also lets one set of blind spots survive every stage of the work.

I wanted the useful parts separated properly. The orchestrating agent should understand the repository and decide what is worth changing. A bounded executor should implement one explicit plan. Independent critics should try to break both the plan and the resulting diff. The human should still own the decision to merge.

## The plan is the product

The expensive reasoning happens before implementation. `improve-codex` begins with a read-only audit, turns each finding into a self-contained plan, then subjects that plan to hostile scrutiny before an executor receives it.

That order matters. A cheap executor with a precise plan can do good work. A powerful executor with a vague plan can produce a large, polished mistake. Spending intelligence on scope, done criteria, and repository-specific verification is usually the better trade.

## Worktrees are a boundary

Every portable execution runs in its own git worktree. Browser tools, MCP servers, plugins, watch processes, and interactive surfaces are removed from the worker. CPU priority and runtime are bounded. Report paths are validated before the run starts, and an executor that exits without a usable status is treated as failed.

Isolation is not theatre here. It keeps one plan from contaminating another, protects the main checkout, and leaves a branch that can be inspected or thrown away without archaeological work.

## Review has to fail closed

The workflow requires both an advisor review and an adversarial diff review. Reports cannot silently overwrite an earlier round, critic verdicts are tied to the run that produced them, and partial orchestration contracts are rejected instead of guessed around.

Review is capped at two rounds. If a major finding survives the second, the plan is too broad or the approach is wrong. It gets split or retired rather than pushed through a third ceremonial pass.

Those rules came from real failure paths: vacuous assertions, incomplete reports, stale local facts, and reviewers unable to verify a claim against a live local service. Each one made the system stricter in the place where the previous version had been too trusting.

## The last move stays human

The skill can return **approve**, **revise**, or **block**. It never merges or pushes an implementation branch. That is deliberately less autonomous than the usual agent demo and much closer to how I want serious repository work handled.

[Install improve-codex](https://github.com/IgorVaryvoda/improve-codex#install)
