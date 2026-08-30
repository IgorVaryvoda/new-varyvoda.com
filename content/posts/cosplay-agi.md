---
title: "Cosplay AGI"
date: 2026-08-20
draft: false
content_type: "Essay"
description: "One of my agent skills is triggered by 'cosplay AGI'. The joke is useful because the model alone is never the whole system."
---

One of my agent skills is triggered by **"cosplay AGI"**. It tells the agents to verify every claim at source, cite files and lines, and use a fixed scoring scale.

It started as a joke. The name stuck because the model alone is never the whole system.

## What the system adds

The models are capable, but each session starts with limited context and no memory of the last incident. The surrounding files and checks make them useful for sustained work.

**Skills files hold working rules.** They describe how to commit on a shared branch, run a review, or close a bug. Most rules exist because the system previously got something wrong.

**Memory files hold decisions and corrections.** Without them, the same preference or mistake has to be explained in every session.

**Plans carry intent between sessions.** Each plan has enough context for an executor that has never seen the task before.

**Independent review checks the author.** A second model family reviews plans and diffs, and the reviewer has to point to evidence rather than give a vague approval.

**Orchestration routes the work.** Different models audit, plan, implement, and review. I choose what runs, what waits, and what is worth doing.

Inside a repository, that combination can look much more capable than a model used on its own. It is still a collection of explicit parts, with a person directing them.

## Models keep removing rules

Every instruction records a limitation. Newer models make some of those instructions unnecessary.

Output formatting that needed pages of instruction two years ago now works by default. Some review checks used to catch failures every week, then stopped firing, then were deleted. I can measure progress by the rules I no longer need.

That is more useful to me than a benchmark argument. I care about which parts of the real workflow became simpler.

## What still stays human

Better models have reduced capability gaps. They have not decided what deserves to exist.

An audit can find defects. It cannot choose which product deserves the next month of work. An executor can produce a clean diff. It cannot decide whether the result is good for the people using it. Every fleet commit is signed with my name because I am still responsible for what ships.

I do not know how long that remains true. I only know how the current system works.

The models do much more of the work than they did a year ago. I still decide why the work exists and take responsibility for the result.
