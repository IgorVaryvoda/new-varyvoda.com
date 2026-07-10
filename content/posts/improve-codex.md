---
title: "Claude Audits, Codex Types: Anatomy of a Fleet Skill"
date: 2026-07-06
draft: false
description: "improve-codex is a small open-source skill that turns the 'editorial judgment over a fleet' theory into a working pipeline: an expensive model audits and reviews, cheap sandboxed executors type, and a second model family attacks every plan and every diff — nothing lands without a verdict."
---

A few days ago I wrote about [two theories of a programmer](/posts/two-theories-of-a-programmer/): the old one, where a programmer types the code they thought of, and the new one, where a programmer exercises editorial judgment over a fleet that types. That post was deliberately about the *theory*. This one is about a concrete, open-source, 100%-shell-script piece of the practice.

[improve-codex](https://github.com/IgorVaryvoda/improve-codex) is an agent skill I extracted from my daily workflow and published. It does one thing: it takes the audit-to-implementation pipeline I run on my own codebases and packages it so a single command executes the whole loop.

```bash
npx skills add igorvaryvoda/improve-codex
/improve-codex
```

That's the pitch. The interesting part is *why* it's shaped the way it's shaped.

## The division of labor

The skill seats three models from two vendors, in deliberately unequal roles:

1. **Audit.** Claude — Fable specifically, Anthropic's top-end model — surveys the codebase and writes self-contained implementation plans: numbered files in `plans/`, each with scope, in-scope file lists, and done-criteria, plus an index ordered by dependency.
2. **Scrutinize.** Before any plan reaches an executor, it gets a hostile read from `gpt-5.6-sol` at high reasoning effort, running read-only against the actual repository. The critic attacks the plan the way a skeptical staff engineer would: assumptions the code contradicts, ambiguity a literal-minded executor could implement two different ways, done criteria that can pass while the goal fails, missing failure paths. Claude arbitrates the findings and edits the plan — while a flaw still costs an edit, not a revision round.
3. **Execute.** Each surviving plan gets a fresh git worktree and a sandboxed [Codex](https://github.com/openai/codex) executor running `gpt-5.6-terra` — OpenAI's CLI agent, cast as the typist. Two codex processes max (critics count against the cap too), niced down, hard one-hour timeout.
4. **Review.** Claude comes back as tech lead: re-runs every done-criterion inside the worktree, checks `git diff --stat` against the plan's declared scope, reads the full diff, and audits new tests for real behavior instead of stubs. Then the diff takes two independent adversarial passes — one from Claude, one from sol — before the verdict: **APPROVE**, **REVISE** (with a written feedback file, maximum two rounds), or **BLOCK**.
5. **You merge.** Or you don't. The skill's hard rule, straight from the README: *nothing lands on your branch without a review, and nothing gets merged at all.* Approved branches sit in their worktrees waiting for a human decision.

If you read the two-theories post, you'll recognize the shape immediately. Specification and verification — the scarce, upstream work — go to the strongest model. Typing — the thing whose marginal cost collapsed — goes to an executor chosen for how faithfully it can follow a written plan. Every artifact gets attacked by a mind that didn't author it: the plans by sol, the diff by Claude and sol both. The review gate is executable, not aspirational. And the human is positioned exactly where the new theory says they belong: at the merge decision, holding editorial responsibility for what ships.

## Why two vendors?

The question I get most often. Wouldn't Claude-orchestrating-Claude be simpler?

Simpler, yes. But every seat was cast on merit. Fable gets the orchestrator chair because audit and review are pure judgment work — reading a whole codebase, deciding what's worth fixing, and catching a plausible-but-wrong diff are exactly what you pay for the strongest model to do. And Codex gets the executor chair not as a budget pick but because it's genuinely excellent at the two things that role demands: **following a written brief to the letter, and writing code.** An executor doesn't need taste or initiative — the plan already contains the taste. It needs discipline and clean diffs, and Codex delivers both.

There's also a structural benefit to the cross-vendor split, and the current version of the skill leans into it hard: **nobody's homework goes unopposed.** An agent reviewing work produced by its own model family shares blind spots with the author — the same training, the same stylistic instincts, the same failure modes, and (the dangerous part) a subtle bias toward finding its own output reasonable. So the pipeline crosses the streams in both directions. Codex's diff is attacked by Claude, which has no authorship stake in it. And Claude's plans — the one artifact the orchestrator does author — are attacked by sol before dispatch. The skill states the design plainly: the plan is authored and judged by one mind, but attacked twice by a different model family — once before execution while fixing it is cheap, once after against the real diff.

Even the OpenAI side is cast unevenly. The critic seat runs sol at high reasoning effort; the executor seat runs terra at medium — and downgrading the executor for cheap mechanical work deliberately does not downgrade the critics. The script comments explain both defaults in one breath: critique is where the second model earns its keep, and plans are fully specified, so execution rarely needs more. You pay for thinking exactly where thinking is the job.

And the third reason is the honest one: an agent that reviews must not implement, or the roles collapse. The skill enforces this as a hard rule — the orchestrator *never edits source code itself* and *never commits, merges, or pushes to your branch*. The moment your reviewer starts "just fixing" things in the diff it's reviewing, you've lost the separation that made the review trustworthy.

## The guardrails are the product

Most of the repository is not orchestration logic. It's guardrails — four layers of them, and every layer exists because its absence burned me on a real machine:

- **Config layer.** The executor launches with `mcp_servers={}` and `plugins={}` — every MCP server and plugin stripped via command-line override. An executor with browser automation available *will* eventually decide the best way to verify a CSS change is to spawn headless Chromium. This rule isn't theoretical: a couple of agents running headless browsers in parallel can take a machine down completely — every core pinned, memory gone, orphaned browser processes outliving the agents that spawned them, the works. Once was enough.
- **Sandbox layer.** `codex exec -s workspace-write -C <worktree>` — file writes are confined to the isolated worktree. The executor physically cannot touch your checkout, your other worktrees, or your home directory. The critics get even less: `-s read-only`. A critic inspects; it cannot modify the tree it's judging.
- **Prompt layer.** The brief embeds explicit prohibitions: no dev servers, no watch mode, no E2E suites, no long-running processes. Run only the commands the plan specifies; if a verification can't be done under these constraints, *record that it was skipped* rather than improvising around it.
- **Scheduling layer.** `nice -n 10`, a hard cap of two concurrent codex processes — executors and critics both count — and `timeout -k 30` on everything: an hour of wall-clock for an executor, thirty minutes for a critic, and then the process is killed, grace period and all.

There's a theme here that generalizes well beyond this skill: agents are fast, tireless, and confidently wrong, and the wrongness includes *resource judgment*, not just code. A human engineer intuitively knows not to spin up three dev servers on a shared box. An agent knows no such thing unless the harness makes it physically impossible. You don't prompt your way to good citizenship; you configure it, sandbox it, nice it, and put a timeout on it.

My favorite small rule in the whole repo is in the review phase: **a claim in the executor's report requires command evidence from the session.** "All tests pass" with no test invocation in the transcript is treated as what it is — a confabulation. In the two-theories post I wrote that an agent will fake a green checkmark if faking is cheaper than passing. This is what the countermeasure looks like when you write it down as code instead of as a complaint.

The rule points both ways now. The critics operate under the same discipline: report only what you can point to concrete evidence for — a file, a line, a command output from the session — with no style nitpicks and no speculative "consider..." items. An adversarial reviewer that's allowed to speculate will bury you in plausible-sounding concerns, which burns review attention just as surely as a confabulated green checkmark does. The evidence bar is what keeps the attack honest.

## What a run looks like

```bash
/improve-codex                    # full cycle: audit → plans → scrutiny → execute → review
/improve-codex deep security      # focus the audit (args pass through to improve)
/improve-codex execute            # skip the audit, run existing TODO plans
/improve-codex execute 012 014    # cherry-pick specific plans
/improve-codex execute low effort # cheaper executor settings for mechanical work
```

The pipeline announces its scope before executing — how many plans, what order, what concurrency — and waits for you to trim the list. Then it grinds: sol scrutiny per plan, worktree per plan, dependencies hardlinked from the main tree where possible, plan marked IN PROGRESS in the index, executor dispatched with the plan inlined into the brief, double adversarial review on completion, index updated to DONE or BLOCKED. Plans that depend on other plans wait for their prerequisites.

The two review passes are arbitrated, not summed. A finding confirmed by either pass — verified by Claude against the actual diff — becomes REVISE feedback verbatim, weighted like a failed done criterion. A finding both passes raise independently is near-certainly real. And nothing gets discarded silently: a dismissed finding costs the reviewer a written line of reasoning in the summary.

The two-round REVISE cap deserves a note, because it encodes a lesson that took me a while to learn: **if an executor hasn't converged after two rounds of written feedback, the plan is the problem.** More feedback rounds don't fix a spec that was ambiguous at birth. BLOCK it, rewrite the plan, redispatch. Iterating endlessly on a doomed attempt is the fleet-era version of the sunk-cost fallacy, and it burns exactly the resource the whole pipeline exists to conserve — your review attention. The same logic now runs pre-dispatch too: two NEEDS REVISION verdicts from the plan critic and the findings go to the human, not into a third loop.

## What it deliberately doesn't do

Three honest limitations, all by design:

- **No browser verification.** UI changes come back with their visual checks explicitly marked as skipped, and the review flags them for you. Headless executors verifying pixel output is how you end up with either lies or Chromium farms; I chose neither.
- **No merging, ever.** Every approved plan is a branch in a worktree awaiting your decision. This is friction, and it's load-bearing friction — the entire trust model of the pipeline rests on the human owning the merge.
- **Review is the bottleneck, on purpose.** Two concurrent codex processes — critics included — is not a technical limit; it's a statement about how fast one person can *actually* review with attention. A pipeline that produces diffs faster than you can honestly judge them isn't more productive. It's just faster entropy.

That last point is the whole post in miniature. In the two-theories essay I wrote that when the marginal cost of producing code drops toward zero, everything scarce moves upstream — specification, verification, taste. improve-codex is what you get when you take that sentence seriously enough to encode it in shell scripts: the cheap thing runs sandboxed and niced at priority 10, and the scarce thing gets two gates — one on the plan before a keystroke is spent, one on the diff before the verdict — a verdict format, and the final word.

The repo is [MIT-licensed and on GitHub](https://github.com/IgorVaryvoda/improve-codex). You'll need the improve skill and an authenticated Codex CLI; everything else is one `npx skills add` away. If your charts haven't bent yet, this is one reasonably safe way to start bending them.
