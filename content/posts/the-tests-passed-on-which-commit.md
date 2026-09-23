---
title: "The tests passed. On which commit?"
date: 2026-09-04
lastmod: 2026-09-23
draft: false
content_type: "Build record"
description: "VibeQ accepted an agent's commit and test report as text. The closeout now checks those claims against the actual pull request head."
featuredImage: "/images/posts/the-tests-passed-on-which-commit.webp"
image_alt: "Two contrasting panels of checked rows are joined by lines that fragment between them."
ogImage: "https://www.varyvoda.com/images/posts/the-tests-passed-on-which-commit.jpg"
---

When an agent finishes a task in [VibeQ](/projects/vibeq/), it reports two things: the commit it made and whether the tests passed. Until September, VibeQ just believed it.

Those two values went straight into the task comment and the activity log. Nothing checked them against the pull request. An agent could report green tests on a commit that never reached the PR, and the task would still look done.

## Check the commit someone will actually review

The fix asks GitHub for the PR's current head and compares it with the commit the agent reported. Then it reads the check runs on that head.

If the commits don't match, or the checks failed, the task is not marked verified. It doesn't matter how confident the agent's report sounds. The note and the activity log both record the verdict and the head SHA.

So "the agent says it tested this" and "this is what the reviewer will see" are finally the same record.

## "Couldn't check" is a valid answer

Sometimes GitHub is down. Sometimes the token lacks a permission. Sometimes the report has no PR link.

In those cases VibeQ records the result as unverified and lets the task close anyway. It never turns "couldn't check" into "checked". You still have to look at the verification state before you trust the task.

## The bug that would have hidden everything

A verifier that fails gracefully can look healthy while it verifies nothing. The first version almost did exactly that.

It reused an existing GitHub token path that asked for contents and metadata access. Reading PRs and check runs needs two more permissions. Without them, every single task would have come back "unverified". Nothing would have crashed. Nothing would have looked wrong.

Review caught it, and the fix added `pull_requests:read` and `checks:read` to the token. The lesson for me: test the path where the external read works, not only the path where it fails.

## What's next

Related work checks that a PR is merged before VibeQ closes its task, and checks whether a human took over a branch before another agent starts on it. Each check sits at a different step.

This one is smaller. When a task says the tests passed, it now also says on which commit, and whether that commit is the one in the PR.

*Source: VibeQ plan 267, implementation `b8bd0902` and the read-permission correction `fc952bf9`, merged on 3 September 2026. The repository is private.*
