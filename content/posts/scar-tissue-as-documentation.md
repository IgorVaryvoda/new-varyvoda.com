---
title: "Why every agent rule has an incident"
date: 2026-08-16
draft: false
content_type: "Essay"
description: "Most rules in my agent skills folder exist because ignoring them already damaged real work."
---

There is a folder on my machine called `skills`. It explains how agents should commit on a shared branch, run a bug-fix loop, and audit a codebase.

Most of it is an incident log written as instructions.

One file says it directly: **"Every rule below exists because its violation destroyed real work."**

## The incident log, read from the rules

The rules are specific because the failures were specific.

**"Full output, never `| head -N`."** An agent truncated `git status`, missed two files, and committed the tests without the fix. The tests passed in its worktree because the source changes were still present there. The shared branch received only the tests.

**"Never `git commit --amend` on the shared branch."** Concurrent Claude and Codex sessions use the same checkout. `HEAD` can move between two tool calls, so amend can target another session's commit. That happened twice. The recovery procedure now starts by creating a backup branch.

**"Commit with explicit pathspecs whenever any foreign staged entry exists."** The index is shared too. A plain `git commit` once included another session's half-staged rename of forty plan files inside a one-line demo fix.

**"Never bare `git stash pop`."** If `git stash` saved nothing, a later bare pop can apply an older stash from another session. That happened with conflicts.

**"No browsers for executors."** Several parallel headless browsers pinned the CPU, exhausted memory, and left orphaned processes behind. Executors no longer receive browser tools. Visual checks happen in a separate review lane.

**"Verify at source first. Many are already fixed."** Roughly forty percent of the QA tasks I checked were already resolved by other work. Without this rule, agents attempted a second fix against code that had already moved on.

## Why the incidents live inside the rules

Human teams carry much of their incident history in people. Someone remembers why a command is unsafe and warns the next person.

Agent sessions do not remember the previous incident. The reason has to live in a file.

A bare rule is also easy for a model to reconsider. "Never amend" looks negotiable until the file explains that amend already folded changes into unrelated commits twice on this machine. The reason makes the boundary harder to dismiss.

My skill files therefore keep the failure next to the rule. The instruction says what to do, and the incident says why.

## The shared checkout

Most git incidents share one cause: several sessions use one checkout, index, stash, and commit identity. The operating rules have to account for that shared state.

The files are long because the system has been used heavily for months. I still delete rules that no longer apply, but brevity is not useful if it removes the reason behind a safety rule.

An audit finds what is wrong now. These files record what has already gone wrong and is likely to happen again.

That is why I treat incident history as part of the instructions, not as a separate archive nobody reads.
