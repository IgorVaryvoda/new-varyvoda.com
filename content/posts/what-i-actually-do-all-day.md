---
title: "What I actually do all day"
date: 2026-08-18
draft: false
content_type: "Essay"
description: "One Saturday: 31 pushes across three repos, plus two new ones created eight seconds apart. I didn't type any of it. Here's what the day actually was."
---

Last Saturday, my GitHub log shows thirty-one pushes across three repositories, and two brand-new repositories created eight seconds apart at 20:04. First push at 06:41, last at 22:04.

I didn't type any of it. So the fair question — the one people actually mean when they ask about "AI-assisted development" — is: *then what were you doing all day?*

I wrote [a post arguing](/posts/two-theories-of-a-programmer/) that a programmer is now someone who exercises editorial judgment over a fleet that types. That was the theory. This is the phenomenology: an honest account of what the job feels like from inside, hour by hour, because everyone theorizes about agent-era work and almost nobody describes an actual day.

## The verbs

Strip the day to its verbs and almost none of them are "write code." The verbs are: **read, decide, suspect, wait, redirect, approve.**

Morning starts with reading, not typing. The fleet ran overnight — there's a sirv-studio push stamped 00:05 — so the first hour is triage: what landed, what's blocked, what's claiming to be done. That last category gets the most attention, because a fleet's most dangerous output isn't broken code, it's a **confident completion report**. Reading a diff for correctness is slow. Smelling that a diff is wrong takes about three seconds — a test that asserts too little, a plan marked done with no verification line, a change that's suspiciously smaller than its description. The smell test is most of what my seniority is for now.

Then the go-aheads. The fleet works from written plans — numbered, scrutinized, adversarially reviewed before a line changes — and my job at each gate is a single editorial act: *yes, proceed* / *no, and here's what you missed*. A "go ahead" costs me two words. A wrong "go ahead" costs the rest of the afternoon. That asymmetry is the whole texture of the work.

## The shape of the day

The log has a shape, and the shape is honest about where the human was.

The morning burst — 06:41 to 10:01, ten pushes — is the infrastructure work: cost instrumentation for the agent fleet, a CI fix, a deploy fix to stop frontend changes from needlessly rolling a container fleet. Dense, serious, my full attention.

Then the log goes quiet. Two pushes around noon, two mid-afternoon. That's not the fleet resting — that's me having a life while long-running work executes, checking in from a phone, saying "go ahead" from a bench. The dirty secret of orchestration is that its peak moments look, from the outside, exactly like doing nothing.

The evening is the interesting part. From 18:34 onward there's a twelve-push run on [imageguide](https://imageguide.dev) — measured charts, listicle guides, homepage work. And then, at 20:04:43 and 20:04:51, two new repositories appear: a Chrome extension that audits every image on a page, and a clipper extension for Sirv's AI Studio. **Eight seconds apart.** Two product ideas I'd been carrying around, bootstrapped between one sip of tea and the next, because starting is now cheaper than writing down the idea for later. Neither is finished. But the distance from "I should build that" to "it exists and has a repo" has collapsed to the length of a sentence.

## What the log doesn't show

The log shows output. It doesn't show the three things that actually consumed the day.

**Waiting, and choosing what to do while waiting.** There's a commit from this stretch that reads "blocked on model quota, not the lane." The fleet's honest bottleneck some days isn't intelligence or my judgment — it's rate limits. Orchestration means always having a second and third queue warm, so a blocked lane sends me to imageguide instead of to Twitter. Some days I win that trade. Not all days.

**Vigilance without occasion.** Most reviews find nothing. The adversarial pass comes back clean, the tests are real, the thing works. But the one time in ten it isn't clean pays for the nine, so attention can never actually relax. It's the specific tiredness of a lifeguard at a calm pool — nothing happened, and you're exhausted anyway.

**The loss of typing-flow.** I'll say this plainly because nobody does: I used to get flow from writing code, and that's gone. The state where the problem dissolves and three hours pass — that lived in the typing, and the fleet took the typing. What replaced it is a different state, more like editing a magazine the day before print: many threads, taste applied at speed, satisfaction arriving in discrete "yes, ship it" pulses instead of one long immersion. It took months to stop missing the old state. I'd be lying if I said the trade was free.

## The honest accounting

So what is the job? On the evidence of one Saturday: I read perhaps forty documents — plans, diffs, verdicts, completion claims. I made maybe sixty small decisions and three real ones. I typed no code and stand behind every line that shipped, because [my name is on all of it](/posts/two-theories-of-a-programmer/) — the agents commit as me, and the editorial responsibility was never delegable anyway.

Thirty-one pushes, two newborn repos, zero lines typed. The typing was never the job. It just took the fleet arriving for me to find out what the job had been all along.
