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
  note: "The workflow changes when real audits, reviewers, or worktree executions expose a weak guardrail."
last_tended: "2026-08-16"
feedback_url: "https://github.com/IgorVaryvoda/improve-codex/issues"
proof:
  - value: "4 stages"
    label: "Audit, plan, execute, review"
  - value: "Isolated"
    label: "One git worktree per plan"
imperfect: "It deliberately stops before merge and depends on strong repository-specific verification. That makes it slower than an autonomous code bot and much harder to let damage the main checkout."
highlights:
  - "One isolated git worktree per plan"
  - "Sandboxed, browser-free, CPU-capped Codex executors"
  - "Independent plan and diff reviews"
  - "Approved work waits for a human merge decision"
weight: 11
---

I wanted the useful parts of an agent workflow separated properly: one model understands the codebase and writes the plan, Codex handles the implementation, and independent reviewers try to break the result.

Each plan runs in an isolated git worktree with browser tooling removed, constrained resources, focused verification, and explicit review gates. The skill never merges or pushes the result. Approved branches wait for a human decision.

[Install improve-codex](https://github.com/IgorVaryvoda/improve-codex#install)
