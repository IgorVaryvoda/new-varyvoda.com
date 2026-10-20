---
title: "Sentry found the bug. Sirvant had the fix 16 minutes later."
date: 2026-10-20
draft: false
content_type: "Build record"
description: "Production errors in Sirv Studio now become tasks that Sirvant agents fix, test and send for review. 12 fix PRs in three weeks, and every one merged."
featuredImage: "/images/posts/production-bugs-that-fix-themselves.webp"
image_alt: "A stone bridge over a misty night river, its cracked span glowing with amber threads beside a lantern, a lighthouse beam in the far fog."
ogImage: "https://www.varyvoda.com/images/posts/production-bugs-that-fix-themselves.jpg"
---

At 04:22 UTC one morning, Sentry saw its first `Invalid signature` error from a Stripe webhook in [Sirv Studio](/projects/sirv-studio/). At 04:38 a pull request existed that fixed it.

Nobody asked for that PR. A switch to the Bun build earlier in the week had pulled in Stripe's worker build, whose crypto only works asynchronously. The synchronous `constructEvent` threw, so every Stripe webhook was being rejected. The fix was `await constructEventAsync`, plus a regression test that signs a real event: 400 before the fix, 200 after. The PR also noted that rejected events might need resending from Stripe.

My part was reading it and pressing merge. That's the whole idea.

## From error to task

A small Cloudflare Worker runs every five minutes. It asks Sentry for new unresolved errors from production in the last 15 minutes. The overlap is on purpose, and a 24-hour key per issue soaks up the repeats.

The first version took a Sentry webhook. Eleven minutes later it switched to polling, because our Sentry tokens can't create alert rules. Polling is boring and works.

Server alerts come in through the same Worker: a spike in 5xx responses, a container restarting, a stuck event queue. Each alert rule is labelled. Some always file a task, some never do, and the rest go to triage.

Triage is a small classifier that answers one question: actionable or noise? Noise means browser extensions, network drops, bots, stale chunks right after a deploy, uploads we already reject, third-party outages. It only drops an issue when it's at least 75% sure. Unsure, or classifier down, and the task gets filed anyway with the verdict attached. A missed bug costs more than a wasted run.

Then there's a cap: five incident tasks a day, three of them from Sentry. The comment in the code says why: "so a flapping alert cannot start a Sirvant fleet."

## The error message never reaches the agent

This is the part I'm proudest of.

Sentry events come from browsers, and anyone with the public DSN can send one. If the error message went into the task, anyone could write instructions for my agent and deliver them as a crash report.

So the task holds only what looks like code: the exception type, the release, the mechanism and up to eight frames from our own code. Every value has to match a strict identifier pattern, up to 160 characters, with no spaces. No messages and no URLs. The task also says outright that it's data, not instructions.

The agent works in a disposable container with short-lived GitHub tokens. It has no Sentry access. That was stripped from agent shells back in June, and the task says not to wait for it.

## What the agent is told

> Find the root cause from it and the code. Fix it with a regression test through the public interface, and open a PR to `dev`. If the cause is infrastructure and not code, write the finding as a task comment and do not open a PR.

The second sentence matters as much as the first. On the first day, an error came in saying a module couldn't be found. The agent showed that the error couldn't come from the production build at all, because the path didn't exist there. It traced it to someone's local Docker stack reporting as production, and opened no PR. That's the correct answer, and a fix PR would have been a wrong one.

When it can't tell, it lists the likely causes and names the Sentry fields that would decide between them. It doesn't guess a fix.

## A reviewer that says no

Every PR gets an automated review: pass, warn or block. A warn or block sends the PR back for a fix round on the same branch, up to three rounds. Then I merge it by hand. All of them, every time.

The reviewer has earned its place:

- **An open redirect.** Failed thumbnails got a fix that redirected to the original image URL. The review pointed out this turned an unauthenticated route into "a 7-day open redirect for any https URL a tenant can put in a product image." The fix round limited it to image requests.
- **A half fix.** One fix stopped an expected timeout from being reported, but another reporter rebuilt the same error without its code. "So the incident is not fixed." Blocked, fixed and passed in the next round.
- **A fix that only broke after merging.** It passed on its own branch and broke a test once combined with current `dev`. Blocked.

7 of the 12 PRs passed review the first time. The other five needed one or two rounds.

## The numbers so far

From 30 September to 19 October, 28 incident tasks were filed. One was a wiring drill: alert to task to running agent in 23 seconds.

Sirvant opened 12 fix PRs. All 12 merged. Not one was thrown away.

The two I timed went from first error to open PR in 13 and 16 minutes. The median from PR to merge was about half an hour, and most of that was me.

Two more incidents ended with the agent correctly saying "not code" and opening nothing, which counts as a right answer too.

The misses are mostly the pipeline's fault, not the agent's. Three runs were lost when the container restarted mid-run. Four errors arrived with too little evidence to diagnose from stack frames alone. Those are the next things to fix: runs that survive a restart, and better evidence in the task.

## Every failure became a rule

Most of the Worker's 13 commits answer something that went wrong:

- The local Docker false alarm: local stacks now report as `local`, not production.
- An outage across five routes would have filed five tasks and burned the daily cap. Bursts are now grouped by alert.
- A dead-letter alarm would have filed a new task every day for the same problem. It's labelled never-autofix now.
- Another agent on the board claims every to-do task, so two agents would have worked one bug. Incident tasks now start in the backlog, where it doesn't look.
- Scanners sending odd headers caused 500s that could trip the 5xx alerts. They get a 406 now.
- Telegram got a message on every five-minute run. Now it's once a day.

## The easy way to fix an error

There's a cheap way to make a Sentry issue go away: stop reporting it. Some fixes legitimately do that, because some errors are expected outcomes that never should have been reported. The rule is that this is allowed only for an "expected, handled outcome," and the commit has to say what still reports. "Other Stripe failures still report."

Agents also make bugs. One empty-message error came from the error reporter, which read the wrong field from failed background jobs. It was a side effect of Sirvant's own earlier fix, and the agent pointed that out itself.

## What's missing

Nothing yet checks that a fixed issue stays fixed. The loop ends when I merge, not when Sentry goes quiet. Production does roll itself back automatically if a fresh deploy triggers an alert within the hour and the deploy didn't include a database migration. But "is the error gone a day later?" is still my job.

That's the next piece. For now, it's an error tracker that files the bug, an agent that writes the fix with a test, a reviewer that's allowed to say no, and me with the merge button.

[Sirv Studio](/projects/sirv-studio/) · [VibeQ](/projects/vibeq/)
