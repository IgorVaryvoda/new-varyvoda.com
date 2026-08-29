---
title: "Scar tissue as documentation"
date: 2026-08-16
draft: false
content_type: "Essay"
description: "My agent skills folder looks like documentation. It's actually a burn ward — every rule in it is a funeral for a specific incident that destroyed real work."
---

There's a folder on my machine called `skills`. If you opened it cold you'd think it was documentation: how to commit on a shared branch, how to run a bug-fix loop, how to audit a codebase. Neatly structured, imperative voice, the works.

It is not documentation. It is a burn ward. Every rule in that folder is a funeral for a specific incident, and I can name the deceased.

One of the files says it outright, in a sentence I now consider the most honest line in my entire toolchain: **"Every rule below exists because its violation destroyed real work."**

## The incident log, read from the rules

You can reconstruct my worst months from the rules alone, the way a paleontologist reads a famine from tree rings. Let me save you the excavation.

**"Full output, never `| head -N`."** An agent once truncated `git status` to keep its context tidy, missed two files below the fold, and committed the tests for a fix while orphaning the fix itself. The tests passed on its machine, in the worktree where the source still existed. On the shared branch: a P1, filed against code that had never arrived.

**"Never `git commit --amend` on the shared branch."** My fleet runs concurrent Claude and Codex sessions that all commit as the same git user, on the same checkout, and HEAD moves between one tool call and the next. Amend targets whatever HEAD is *now*. Twice — twice — an agent has amended its edits into a completely unrelated commit some other session had just landed. There is no partial version of this mistake. Your work and a stranger's work are now legally married, and the annulment procedure is its own section of the file, starting with "make a backup branch first."

**"Commit with explicit pathspecs whenever any foreign staged entry exists."** The index is shared too. A plain `git commit` once landed another session's half-staged rename of forty plan files inside a one-line demo fix. The commit message said `fix demo`. The diffstat said career change.

**"Never bare `git stash pop`."** After git politely reports "No local changes to save," a bare pop doesn't pop nothing — it pops someone *else's* stash, from some other session, from some other week, with conflicts. This one reads like a horror trope because it is one: the call is coming from inside the checkout.

**"No browsers for executors."** This isn't in a git file; it's a standing constitutional article of the whole fleet. A couple of Codex executors running headless browsers in parallel don't make your laptop warm — they wreck the machine. Cores pinned, memory exhausted, orphaned browser processes accumulating like barnacles until nothing works, including the terminal you'd use to fix it. Browsers were stripped from the execution layer, permanently. The auditor gets eyes; the typists work blind.

**"Verify at source first — many are already fixed."** From the bug-loop file. Roughly forty percent of the QA-filed tasks on my board are not open work: some other agent already fixed them in passing, days ago, while doing something else. The rule exists because I watched agents dutifully re-fix fixed bugs, adding tests to code that had moved on, like a ghost repainting a house that was sold years back.

## Why the incidents live inside the rules

Here's the part that took me longer to understand than any individual disaster.

Human teams carry their incident history in people. Someone in the room flinches when you type `--amend`, and the flinch is the documentation. The story gets retold at onboarding, distorted but directionally right, and the institution remembers even when no document does.

My coworkers are stateless. Every session wakes up brilliant and amnesiac, with no flinch, no war stories, no scar tissue of its own. Whatever the institution remembers, it remembers **in files, or not at all**.

And I've found that the rule alone is not enough. A bare imperative — "never amend on the shared branch" — is exactly the kind of thing a confident model will helpfully reconsider. *Surely in this case an amend is cleaner.* The rule needs its corpse attached: amend has folded edits into foreign commits, twice, here, on this machine. Models, it turns out, are like people in this one respect: they follow rules better when the rule comes with a body count.

So my skills files carry their incidents inline, the way legal codes carry case law. Not "do X" but "do X, because the one time we didn't, here is precisely what died." The justification isn't commentary. It's load-bearing.

## The shared body

Step back far enough and all the git incidents are one incident. A fleet that commits as one user, on one checkout, with one index and one stash, isn't a team sharing a repository — it's several minds operating **one body**. Of course the left hand amends the right hand's commit. Of course a stash pop retrieves someone else's pocket contents. Every one of those rules is proprioception, learned the way bodies learn: by injury.

The counterintuitive consequence is that I've stopped being embarrassed by the length of these files. A short rules file means one of two things: either the process is genuinely simple, or nobody has been running it hard enough to find out where it breaks. Mine are long because the fleet ships all day, every day, and has been for months. Scar tissue only forms where there's been load.

I sometimes point the fleet at its own code and make it prove the codebase is bad. This folder is the older, humbler sibling of that idea: the fleet's rules pointed at the fleet's history. An audit tells you what's wrong now. The scar file tells you what will go wrong again the moment you delete a line from it.

Documentation describes the system you meant to build. Scar tissue describes the one you have.
