---
title: "What I actually do all day"
date: 2026-08-18
draft: false
content_type: "Essay"
description: "One Saturday produced 31 pushes across three repositories. This is what I was doing while agents wrote the code."
---

Last Saturday, my GitHub log shows thirty-one pushes across three repositories, and two brand-new repositories created eight seconds apart at 20:04. First push at 06:41, last at 22:04.

I did not type the code. So what was I doing all day?

I was reading plans and diffs, making decisions, checking claims, redirecting bad work, and approving good work.

## The verbs

The main verbs were **read, decide, suspect, wait, redirect, and approve**.

Morning starts with the work that ran overnight. I check what landed, what got blocked, and what claims to be finished. Completion claims get the most attention. A weak test, missing verification, or a diff that does not match its summary can make bad work look complete.

The fleet works from written plans. At each gate I either approve the next step or explain what is missing. A quick approval can save time. A careless one can waste the afternoon.

## The shape of the day

The log also shows how the day changed.

The morning burst, ten pushes between 06:41 and 10:01, was infrastructure work: fleet cost tracking, a CI fix, and a deploy fix that stopped frontend changes from restarting a container fleet. That needed my full attention.

Then the log went quiet. Long jobs kept running while I was away from the computer. I checked progress from my phone and approved the next steps when needed.

From 18:34 there was a twelve-push run on [imageguide](https://imageguide.dev), covering charts, guides, and homepage work. At 20:04:43 and 20:04:51, two new repositories appeared: a Chrome extension that audits every image on a page, and a clipper for Sirv Studio. Neither was finished, but both had moved from an idea to working code.

## What the log doesn't show

The log misses three important parts of the work.

**Waiting.** A model quota or a long test can block one lane. I keep other work ready so the day does not stop with it.

**Review.** Most reviews come back clean. The occasional serious finding is why the other reviews still need proper attention.

**The loss of coding flow.** I used to spend hours inside one implementation. Now I move between many threads and make shorter decisions. I get far more done, but I still miss the old concentration sometimes.

## What the day contained

That Saturday I read roughly forty plans, diffs, verdicts, and completion reports. I made dozens of small decisions and a few important ones. I typed no code and still take responsibility for every line that shipped.

The job is no longer mainly typing. It is deciding what should happen, checking that it did, and owning the result.
