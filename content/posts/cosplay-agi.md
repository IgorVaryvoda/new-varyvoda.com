---
title: "Cosplay AGI"
date: 2026-08-20
draft: false
content_type: "Essay"
description: "One of my agent skills is triggered by 'cosplay AGI'. The joke is useful because the model alone is never the whole system."
lastmod: 2026-09-04
---

One of my agent skills is triggered by **"cosplay AGI"**. It asks for a source-checked audit with file references and a fixed scoring scale.

The name is a joke. The score is where I have to be careful.

## A convincing report can still be wrong

An agent can produce a verdict, cite a file and finish without checking the behaviour that matters. A process exiting successfully tells me that the process ended. It does not tell me that the work passed review.

[improve-codex](/projects/improve-codex/) checks for a usable completion report and a critic verdict tied to that run. Missing evidence fails the run even when the process exits zero. Each review round gets a separate report, so a later verdict cannot silently overwrite the earlier objection.

That is a useful distinction when the output looks finished. The workflow has to inspect the evidence behind it.

## The score has limits

I used a multi-agent self-audit on [Sirv Studio](/projects/sirv-studio/). It helped turn suspected defects into things I could check and fix. It did not provide an independent product rating, and counting reviewers did not make it one.

The useful questions were narrower. Does this billing path have production callers? Does the test fail when the behaviour breaks? Did the reviewer inspect the current file?

A numerical verdict makes those questions easy to lose. I have removed the self-rating from the main case study. The failures and the resulting changes are more useful to a reader.

## Keep the incident, question the rule

My [skills folder records incidents](/posts/scar-tissue-as-documentation/). That history earns a rule its place. It should also make the rule possible to retire: identify the failure it prevents, check whether the failure is still possible and remove the instruction when the system makes it unnecessary.

I cannot infer that from a newer model name. If I claim a rule is obsolete, I need the old failure and a check that now handles it.

"Cosplay AGI" can stay as a shortcut. It cannot be the evidence.
