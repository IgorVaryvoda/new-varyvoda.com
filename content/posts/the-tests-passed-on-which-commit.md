---
title: "The tests passed. On which commit?"
date: 2026-09-04
draft: false
content_type: "Build record"
description: "VibeQ accepted an agent's commit and test report as text. The closeout now checks those claims against the actual pull request head."
---

[VibeQ](/projects/vibeq/) had a closeout path that accepted an agent's reported commit and test result as text. Those values reached the task comment and activity record without being checked against the pull request.

The agent could report a successful test for a commit that never reached the PR. The report would still look complete.

## Check the head that will be reviewed

The September change reads the PR head from GitHub and compares it with the reported commit. It also reads the check runs attached to that head.

A commit mismatch or failed checks forces the terminal evidence flag to false, even when the agent supplied a positive claim. The note and event record carry the same verdict and head SHA.

That joins two facts which used to sit separately: what the agent says it tested and what the reviewer can actually inspect.

## Unverified is still a possible result

GitHub may be unavailable. The token may lack permission. A report may have no PR URL.

The verifier records those cases as unverified and allows the closeout to finish. It does not convert them into a successful external check. It also does not universally replace every existing evidence flag on an unverified result. A reader still needs to look at the verification state.

This is a limit of the current implementation. Ending a session and accepting its work are separate decisions.

## The review found a missing permission

The first implementation reused a GitHub read-token path that requested contents and metadata permissions. Reading PRs and check runs also needed the corresponding permissions. Without them, the feature could have produced unverified results for every attempt.

Review added `pull_requests:read` and `checks:read` to that mint. A verifier which always degrades gracefully can appear healthy while verifying nothing. The failure result needs testing, but so does the successful external read.

The implementation notes record passing local gates after that correction. They are evidence for the code change, not a substitute for checking a deployed run.

## Close the task after the merge

Related work verifies a PR merge before closing the task and checks whether a human has taken over a branch before starting another agent run. Each check belongs at a different transition.

For the closeout path, the improvement is narrower: the completion record now says whether its commit matches the current PR head and what checks GitHub reports there. "Tests passed" finally has a commit to be questioned against.

*Source: VibeQ plan 267, implementation `b8bd0902` and the read-permission correction `fc952bf9`, merged on 3 September 2026. The repository is private.*
