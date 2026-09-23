---
title: "What I actually do all day"
date: 2026-08-18
lastmod: 2026-09-23
draft: false
content_type: "Essay"
description: "One Saturday produced 31 pushes across three repositories. This is what I was doing while agents wrote the code."
featuredImage: "/images/posts/what-i-actually-do-all-day.webp"
image_alt: "Interwoven painted paths connect symbols for reading, decisions, waiting, redirection and approval."
ogImage: "https://www.varyvoda.com/images/posts/what-i-actually-do-all-day.jpg"
---

On Saturday 15 August 2026, my GitHub log showed thirty-one pushes across three repositories, and two brand-new repositories created eight seconds apart at 20:04. First push at 06:41, last at 22:04.

I did not type the code. So what was I doing all day?

Mostly reading, deciding and being suspicious.

## Morning: what ran overnight

The day starts with whatever ran while I slept. What landed, what got blocked and what says it's finished. That last group gets the most attention. A weak test, a skipped check or a diff that doesn't match its summary can make bad work look done.

The fleet works from written plans. At each gate I either approve the next step or say what's missing. A quick approval saves time. A careless one wastes the afternoon.

The morning burst was ten pushes between 06:41 and 10:01. Most of it was infrastructure: fleet cost tracking and a deployment change.

The deployment change is a good example of what a decision looks like. VibeQ served its frontend assets from the same Cloudflare Worker that owned the agent work cells. So a CSS change could replace the Worker and disrupt running jobs. I separated frontend deployment from the execution runtime. The check had to cover ordinary pages, authenticated API routes and the service worker, because moving the assets could fix one problem and break another.

It cost me one more deployment boundary to maintain. In exchange, a design tweak can no longer disrupt a long agent run.

## Afternoon: away from the desk

Then the log went quiet. Long jobs kept running while I was away from the computer. I checked progress from my phone and approved the next steps when needed.

## Evening: new things

From 18:34 there was a twelve-push run on [imageguide](https://imageguide.dev): charts, guides and homepage work. At 20:04:43 and 20:04:51, two new repositories appeared: a Chrome extension that audits every image on a page, and a clipper for Sirv Studio. Neither was finished, but both had moved from an idea to working code.

## What the log doesn't show

A lot of the day is waiting. A model quota or a long test blocks one lane, so I keep other work ready and the day doesn't stop with it.

Most reviews come back clean. I still read every one properly, because the occasional serious finding hides in the boring ones.

And I lost something. I used to spend hours inside one implementation. Now I jump between many threads and make short decisions. I get far more done, but I miss that old concentration sometimes.

## So what is the job?

That Saturday I read roughly forty plans, diffs, verdicts and completion reports. I typed no code. I still take responsibility for every line that shipped.

The job isn't mainly typing anymore. It's deciding what should happen, checking that it did and owning the result.
