---
title: "Cosplay AGI"
date: 2026-08-20
draft: false
description: "I have a skill whose literal trigger phrase is 'cosplay AGI.' The joke turned out to be load-bearing: everything I've built is a general intelligence made of prosthetics."
---

There is a skill file on my machine whose literal trigger phrase is **"cosplay AGI."** I type those two words and my fleet snaps into its most rigorous mode: every claim verified at source, findings cited by file and line, zero hedging, scores pinned to a calibrated scale. The file even defines the term, deadpan: *maximum rigor, zero hedging, every claim verified at source, no mistakes. It does NOT mean grandiose prose.*

It started as a joke command. It took me embarrassingly long to notice the joke was load-bearing — that "cosplay AGI" is not a funny name for what I built. It's an exact one.

## The costume, itemized

Nobody handed me a general intelligence. What I have is very capable models with specific, stubborn gaps — and around those gaps I've built prosthetics, one incident at a time. Lay the whole apparatus out and it maps onto a mind with unsettling precision:

**Skills files are procedural memory.** A model wakes up brilliant and amnesiac every session, so how-we-do-things-here lives in files it reads on the way in — my commit rituals, my review loops, my bug-triage liturgy. [Every one of them scar tissue](/posts/scar-tissue-as-documentation/) from a real incident, because that's how procedural memory forms in biological systems too.

**Memory files are episodic memory.** Who I am, what I corrected last month, which framing of my own biography I've explicitly rejected. Written down because otherwise the fleet re-learns me from scratch daily, and gets me wrong in the same ways daily.

**Plans are working memory.** A model can't hold a campaign in its head across sessions, so intent lives in numbered plan files — currently over nine hundred in one repo — each written for an executor with zero context, because zero context is the honest assumption.

**Adversarial review is self-doubt.** Left alone, a model believes its own work with the serene confidence of a golden retriever. So I bolt doubt on from outside: [a second model family attacks every plan and every diff](/posts/improve-codex/), reviewers are prompted to refute rather than assess, and nothing lands without surviving an attempt to kill it. The doubt isn't in the intelligence. It's in the plumbing.

**Orchestration is executive function.** Claude Fable audits, plans, and reviews; Codex executes — chosen for the lane not because it's cheap but because it follows instructions with monastic literalism. Deciding what runs where, what's foreground, what waits on quota: that's a prefrontal cortex, and currently the prefrontal cortex is me.

Assemble it all and you get something that behaves — within my repos, on my problems — remarkably like a single, careful, tireless general intelligence. From the outside: AGI. From the inside: a costume with a person holding it upright.

## The costume is getting thinner

Here's what makes this an observation worth writing down rather than a bit: **the cosplay is falsifiable, and I can watch it decay.**

Every prosthetic in that list exists because a model, at some specific point in time, couldn't do the thing itself. Which means every prosthetic is a dated claim about model limitations — and model limitations keep expiring. Each generation, I get to delete rules. Instructions about output formatting that were load-bearing two years ago would be insulting today. Whole categories of "check the model didn't do X" review steps have quietly gone from *fires weekly* to *never fires* to *deleted*. The scaffolding I maintain today is noticeably lighter than a year ago, and a year ago it was lighter than the year before.

This gives me something almost nobody in the AGI-timeline argument has: **a private, empirical obsolescence meter.** I don't need to argue about benchmarks. I can just count which of my prosthetics each new model generation lets me throw away. The costume-shedding rate is my personal AGI forecast, measured in deleted lines of skills files.

## What refuses to shed

And that same meter shows something else, which is the actual point of this post.

The prosthetics that expire are all of one kind: compensations for *capability* gaps — memory, care, rigor, literalism. The ones that show no sign of expiring are of a different kind entirely. Nothing in any model generation so far has touched the layer where someone decides **what is worth building, what good looks like before it exists, and who stands behind the result when it ships.** My audit skill can verify every claim at source; it cannot originate the desire to have the codebase be good, or choose which product deserves to exist this quarter. Every commit the fleet makes is signed with my name, and no amount of capability makes that signature transferable — responsibility isn't a skill gap, so there's no prosthetic for it and nothing to expire.

A costume worn long enough just becomes clothes. I genuinely don't know if that's where this ends — whether one day the executive function and the wanting migrate into the fleet too, and the cosplay completes itself. What I know is what the meter says today: the rigor was always rentable. The amnesia is curable. The doubt can be installed.

The wanting, so far, still has to be brought from home.
