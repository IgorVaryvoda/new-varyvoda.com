---
title: "Pointing the fleet at itself"
date: 2026-08-16
draft: false
description: "I told the agents that wrote my codebase to prove it's bad. The method — calibration, falsification, file-level re-verification — turned out to matter more than the score."
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
---

Commit counts measure motion, not quality. By July, [Sirv AI Studio](/projects/sirv-studio/) had almost twelve thousand of them, and I could no longer tell whether I was looking at a production platform or a very fast pile. So I ran the obvious experiment: I pointed the fleet that wrote the code at the code, and told it to prove me wrong.

This post is about the method, because the method is the part worth stealing. The score is just what fell out of it.

## The setup

On July 9 I launched ten reviewer agents in parallel, one per domain: architecture, security, data model, testing, frontend, and the major feature areas. Each one read the code, the schema, the migrations, the tests, and the CI configuration — at that point roughly 512K lines of hand-written TypeScript across 7,800 files and 162 database tables.

Two rules made the difference.

**First, an explicit calibration.** Every reviewer scored against the same stated scale: 5 is a typical startup codebase, 7 is solid production quality, 9+ is exceptional. Without a pinned scale, an LLM reviewer drifts toward polite 8s the way a wine review drifts toward "notes of cherry." With one, a 7 is a claim you can argue with.

**Second, an instruction to falsify.** The prompt was not "assess this codebase." It was closer to "find what is wrong with it, and rate what remains." Reviewers were expected to withhold or lower scores where evidence was missing — not to extrapolate quality from the parts that looked good.

## The verification pass

A first-pass finding from a single agent is a hypothesis, not a fact. So the heaviest findings went through file-level deep-dives: a second pass that re-read the actual implementation behind each claim and checked whether the problem was real, exaggerated, or imagined.

The result surprised me in the right direction. Every re-verified claim came back **equal to or smaller than first reported**. The scariest finding — a supposedly divergent legacy billing path inside the workflow orchestrator — turned out to be dead code with zero production callers. Two scores were revised *up* after verification: the orchestrator from 8 to 8.5, the PIM from 6.5 to 7. The codebase was better than its own audit notes.

That is the property you want from a review process: errors that shrink under scrutiny instead of growing. If your findings get bigger every time someone looks closer, you have a rumor mill, not an audit.

The final verdict landed at **8.25 out of 10**, and — more useful than the number — a plain list of what keeps it off a 9: the PIM's back half is unfinished, storage quotas still run in warn mode, and the tracked-but-tolerated debt (a few 2,000-line components, circular imports in the lib layer) is ratcheted but not blocked.

## The caveats that make it credible

Two things I want to say out loud, because leaving them unsaid would make the whole exercise weaker.

**The reviewers are not independent.** Ten agents from the same model family, reading the same repository with related instructions, are ten adversarial passes — not ten independent opinions. Redundancy catches sloppiness; it does not catch a shared blind spot. That is exactly why the deep-dive re-verification exists, and why I read the result as a rigorous self-audit rather than a third-party benchmark.

**Evidence goes stale fast.** In a codebase moving at fleet speed, an audit that doesn't re-check live state will confidently report yesterday's problems. I have watched an "unfinished work" finding dissolve on inspection because the batches in question had already landed — the evidence was real, and expired. Any finding older than a few days gets re-verified against the current tree before it counts.

## The audit is an intake, not a report

The part of this system I would defend hardest: nothing from the audit terminated in a document. Every confirmed finding became an executor-ready implementation plan — the repo now carries more than 900 of them, ranked P0–P3, 261 tagged `bug`, nearly every one opening with a *why this matters* paragraph that names the exact failure mode before a line changes. Findings become plans; plans become fleet work; the fleet's output goes back through the same review gates that produced the findings.

An audit that ends in a PDF is a mood. An audit that ends in a queue is a mechanism.

## If you run one on your own codebase

- Pin the scale before anyone scores. "8" means nothing until "5" and "9" do.
- Instruct for falsification, not assessment. Reward withheld scores where evidence is thin.
- Re-verify every heavy finding at file level before you believe it. Watch which direction the errors move under scrutiny.
- Write down what keeps you off the next number. That list is the deliverable.
- Route every confirmed finding into your actual work queue, or admit you ran the audit for the feeling.

And say your caveats in public. The score is only as trustworthy as the list of ways it could be wrong.
