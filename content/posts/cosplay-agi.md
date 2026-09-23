---
title: "Cosplay AGI"
date: 2026-08-20
draft: false
content_type: "Essay"
description: "One of my agent skills is triggered by 'cosplay AGI'. It started as a joke. Then I noticed it was an accurate name for what I built."
lastmod: 2026-09-23
featuredImage: "/images/posts/cosplay-agi.webp"
image_alt: "A smooth reflective sheet lifts at one corner to reveal an uneven structure of blocks beneath it."
ogImage: "https://www.varyvoda.com/images/posts/cosplay-agi.jpg"
---

One of my agent skills is triggered by **"cosplay AGI"**. It asks for a source-checked audit with file references and a fixed scoring scale.

It started as a joke. It took me a while to notice that the name is accurate.

## The costume

Nobody handed me a general intelligence. I have very capable models with specific gaps, and around each gap I built a prosthetic, one incident at a time. Put them side by side and they look a lot like parts of a mind.

**Skill files are procedural memory.** A model starts every session brilliant and amnesiac. How we do things here has to live in files it reads on the way in. [Every one of those rules is scar tissue](/posts/scar-tissue-as-documentation/) from a real incident.

**Plans are working memory.** A model can't hold a project in its head across sessions. So the intent lives in numbered plan files, each written for an executor with zero context.

**Adversarial review is self-doubt.** Left alone, a model believes its own work. So the doubt comes from outside. [improve-codex](/projects/improve-codex/) wants a usable completion report and a critic verdict tied to that exact run. Missing evidence fails the run even when the process exits zero. Each review round gets its own report, so a later verdict can't quietly overwrite an earlier objection.

**Orchestration is executive function.** Something has to decide what runs where, what waits for quota and what gets merged. Right now that something is me.

Put it all together and, inside my repos, you get something that behaves a lot like a careful, tireless general intelligence. From the outside it looks like AGI. From the inside it's a costume with a person holding it up.

## The score is part of the costume

The skill ends with a number. That number is where I have to be careful.

I ran it on [Sirv Studio](/projects/sirv-studio/): ten reviewer agents, one per domain. It was great at turning vague suspicions into specific defects I could check and fix. It also produced a score, 8.25 out of 10. That number is on the case study, with a label: ten passes from one model family are a self-audit, not ten independent opinions. More reviewers from the same family don't make it an outside rating.

The useful questions were small. Does this billing path have production callers? Does this test fail when the behaviour breaks? Did the reviewer read the current version of the file? A score makes those questions easy to skip.

## The costume gets thinner

Every prosthetic exists because a model once couldn't do something by itself. So every rule is a dated claim about a model limitation, and those claims expire.

That gives me a private obsolescence meter. I don't need to argue about benchmarks. I can count which rules each new model lets me delete.

The catch is that a new model name proves nothing. To retire a rule, I need the old failure and a check that now catches it. Otherwise I'm deleting a guard because a release note sounded confident.

## What doesn't shed

The prosthetics that expire all cover capability gaps: memory, rigour, following instructions to the letter. None of them touch the part where someone decides what is worth building, what good looks like before it exists and who signs the result. Every commit the fleet makes carries my name.

"Cosplay AGI" can stay as the name of the skill. The wanting still has to come from me.
