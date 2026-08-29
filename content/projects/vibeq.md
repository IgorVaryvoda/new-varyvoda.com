---
title: "VibeQ"
date: 2026-03-05
lastmod: 2026-08-18
draft: false
homepage_weight: 2
atmosphere: true
page_css: ["vibeq"]
image: "/images/vibeq/vibeq-overview.webp"
image_alt: "VibeQ overview showing active work, attention signals, and human-agent activity"
ogImage: "https://www.varyvoda.com/images/vibeq/vibeq-today.jpg"
description: "The control plane behind Sirv Studio: humans and agents work one queue, Slack is the cockpit and no run counts until the code is on the remote."
hero_title: "vibeq"
hero_kicker: "Human and agent work"
hero_intro: "I started VibeQ as a task board for Sirv Studio. It became the durable work system behind Sirvant, our Slack-facing partner for answering, investigating and shipping work."
hero_mark: "Work control plane"
hero_scope: "Request to evidence"
hero_frame_label: "Sirvant / control room"
hero_frame_status: "Runtime + memory"
hero_flow:
  - "Ask in Slack"
  - "Record durable work"
  - "Run within limits"
  - "Return the evidence"
project_chapters:
  - label: "Origin"
    href: "#i-needed-a-queue-i-could-trust"
  - label: "Why not Linear"
    href: "#why-not-linear"
  - label: "The board"
    href: "#the-board-grew-eyes"
  - label: "Agents"
    href: "#then-the-agents-moved-in"
  - label: "Sirvant"
    href: "#sirvant-is-the-front-door"
  - label: "Architecture"
    href: "#one-system-three-ways-in"
  - label: "Reliability"
    href: "#a-local-commit-is-not-delivery"
  - label: "Incidents"
    href: "#the-incidents-that-hardened-it"
  - label: "Snapshot"
    href: "#what-exists-now"
  - label: "Next"
    href: "#where-this-goes"
  - label: "Lesson"
    href: "#what-i-learned"
tech_stack: ["React 19", "Cloudflare Workers", "D1", "R2", "Durable Objects", "Hermes"]
role: "Creator, product lead and principal builder"
stewardship:
  state: "evolving"
  note: "The control plane changes as real agent runs, Slack conversations, and incidents expose missing evidence or weak recovery."
last_tended: "2026-08-28"
feedback_url: "/contact/?project=vibeq&type=question"
proof:
  - value: "One queue"
    label: "Human and agent work"
  - value: "5 ingress paths"
    label: "Slack, MCP, API, cron, GitHub"
users_changed: "Veniamin's QA work and the team's Slack habits changed the board from a task list into a shared control plane with proof age, attention signals, and incident history."
imperfect: "It is an internal operating system, not a polished public SaaS. The runtime is still consolidating around fewer execution profiles, clearer recovery, and cheaper disposable work cells."
highlights:
  - "One queue for human and agent work"
  - "Slack, MCP, API, cron and GitHub ingress"
  - "Replayable sessions with approvals and evidence"
  - "Disposable Cloudflare work cells for risky execution"
weight: 3
---


## I needed a queue I could trust

On 5 March 2026 I needed a task board that Veniamin and I would actually use for [Sirv Studio](/projects/sirv-studio/). Enough structure to stop work disappearing into chats and terminal windows. The first version had a pinned backlog and GitHub login.

Asking an agent to write code was already easy. Knowing what it did, who approved it and whether the result ever reached GitHub is what turned a board into a product.

The agent part arrived on day one. VibeQ could turn rough text into tasks, attach screenshots and videos through Cloudflare R2 and expose the queue through MCP so coding agents could read and update the same work as the humans. Within the first week it had the ordinary board furniture: search, due dates, checklists, dependencies. That was never going to be the hard part.

It was briefly called VibeQueue. I renamed the interface to VibeQ before discovering that renaming deployed Workers, databases and secrets for aesthetic consistency is a fine way to break a working system. The repository is still called `vibequeue`. The product is VibeQ. Both are correct.

## Why not Linear

Linear is a good product. So is Height. Jira exists. The honest answer has three parts, and none of them is "I can build a better board".

I did not want to pay per seat. We are two humans about to be outnumbered by agents, and seat pricing punishes exactly that experiment. Every agent identity on the roster would be another subscription line for the privilege of running my own workers.

I wanted the freedom to customize everything. A promised-branch card, a QA staleness monitor, an MCP surface for coding agents and a Slack-facing runtime in the same repository are not feature requests any vendor would take seriously. Here they are a normal week of work, wired exactly the way we operate.

And I wanted to own the data. Every task, event, session, approval and artifact sits in my own D1 database and R2 bucket. The ledger is the whole point of the system. Renting it from someone else's API, behind someone else's rate limits and export rules, puts the most valuable byproduct of the work in the one place I cannot fully reach.

## The board grew eyes

A normal task board tells you what somebody wrote on a card. I needed it to tell me what was actually happening.

By April, the home screen had **Who's working on what**, a **Needs attention** radar, domain views and a triage queue. Tasks could show that work had gone quiet, that a review had stalled, that a blocker chain had formed. The one that earns its place on the home screen is the promised branch: a task moves to done, the summary says the fix is in and no pull request ever appears. On a normal board that gap stays invisible until somebody goes looking for the diff. Here it becomes a card with a name on it.

The Activity view became a chronological record of people and agents creating, moving, discussing and shipping work.

Then the QA Monitor moved into the same interface, with Veniamin behind the QA side too. Instead of a green badge that says "tests passed", it tracks how old the proof is and which product areas have none. It exists to make weak proof visible before it gets mistaken for confidence.

That changed the unit of work. A task stopped being a title, status and assignee. It started carrying the branch, the pull request and whatever a reviewer would need to argue with the result.

I do not need a prettier Jira. I need to know what changed while I was looking somewhere else.

<img src="/images/vibeq/vibeq-today.jpg" alt="VibeQ Today view showing the best next move, the live pulse, failing QA, stalled reviews and work that still needs evidence" width="1276" height="718" loading="lazy" decoding="async"/>
<p><em>Today reduces the queue to one next move, then shows the work that is stuck, failing or still missing a receipt.</em></p>

## Then the agents moved in

VibeQ treats agents as workers, not integrations hanging off the side of the real system.

The MCP server lets Codex, Claude and other agent runtimes search the queue, create tasks, claim work, record progress, attach artifacts and close the loop. A human and an agent see the same task ID, same blockers, same unpushed branch. Agents appear in the activity roster beside us, because an agent's work in a separate console is work nobody reviews.

That paid off once I started running the [improve-codex](/projects/improve-codex/) workflow: audit a mature codebase, scrutinize the plans, execute them in isolated worktrees, attack the diffs and land only the work that survives. The execution muscle is the **Clanker Army**, the batch runner that lives inside the Sirv Studio repository. It compiles vetted plans into batches, polls VibeQ for orders and runs several isolated worktrees at once. VibeQ holds the queue around that machinery. It remembers which plans exist, who is doing what, which branches are real and what still needs a human decision.

The important boundary is that an agent seeing a task does not grant it authority. Creating, claiming, changing or closing work must follow the user's instruction and the task's approval state. VibeQ is the record of that authority, not an excuse to infer it.

<img src="/images/vibeq/vibeq-activity.jpg" alt="VibeQ Activity view showing work health, human and agent presence, and a chronological ledger of task, branch and commit events" width="1280" height="720" loading="lazy" decoding="async"/>
<p><em>The Activity ledger puts people and Sirvant in the same roster, then records the task, comment, branch and commit events underneath. Designed by <a href="https://www.linkedin.com/in/veniamin-krachun/">Veniamin Krachun</a>.</em></p>

## Sirvant is the front door

In June, VibeQ changed category. **Sirvant**, the agent runtime with a public Slack identity, landed in the same repository.

Sirvant is not a slash-command bot or a chat skin over the task API. It is a durable, open-ended work partner in the Sirv Slack workspace. Someone can ask a product question, send a voice note, continue an old thread, point at a bug, request a report or ask for a scoped fix. Sirvant is expected to understand the request, inspect the available systems and either answer or act.

That includes more than repository work. The profile can use VibeQ itself, authenticated Basecamp access, Sentry, the internal Outline knowledge base and Sirv Marketing Machine data when those tools are available. It can triage the queue, reproduce an issue in a browser, inspect a codebase, prepare a report, schedule real automation or open a pull request. A voice message is transcribed and treated as the instruction. A thread reply continues the existing conversation instead of starting an amnesiac new chat.

The useful distinction is between **thinking** and **hands**. Sirvant does not start a worker for every message. Hermes or OMP owns a short-lived thinking session, loads the relevant history and decides whether the request can be answered directly. Only work that needs a repository, browser, tests, files or command-line tools gets a disposable execution cell.

Slack is the cockpit. VibeQ is the logbook and source of truth. Every meaningful request, decision, tool result, approval, failure, artifact and closeout should be recoverable there. A Slack retry, supervisor restart or vanished work cell should not erase the history or make a second job look like the first one.

Sirvant also has a real authority boundary. Read-only inspection is cheap. A requested implementation can produce a pushed branch and pull request. Direct pushes to shared branches, merges, deploys, production writes and destructive actions still need explicit approval. The point is not to remove humans from the loop. It is to make the loop visible and precise.

## One system, three ways in

Interactive Slack work, scheduled automation and batch jobs all enter the same underlying system. The mode changes how work starts and where the result returns. It does not create a separate bot, memory or approval model.

{{< vibeq-workpath >}}

Cloudflare receives signed ingress and guards the Slack and API secrets. VibeQ records session and task state in D1 and keeps larger artifacts in R2. A profile-matched Hermes or OMP supervisor claims the durable work item and starts the thinking session. If hands are needed, the normal path is a short-lived Cloudflare work cell with only the identity and permissions required for that job. A Hetzner Docker worker remains as a pinned fallback and cleanup lane. The risky environment can disappear when the work ends while VibeQ keeps the durable record.

That split matters more than the choice of model. One agent can plan while another executes. The ledger records both identities, because "Claude planned it and Codex typed it" is useful information when billing, permissions or a failure needs to be traced later.

Profiles give that substrate a job without forking the whole architecture. Sirvant uses the open-ended `vibeq-codex` profile. Documentation sweeps and pull-request reviews have narrower profiles, tools and approval rules. A GitHub webhook can go straight to a disposable clone-and-review job. A scheduled docs sweep can use the same ledger and still return through Slack.

The pull-request path can run a bounded review-to-fix loop. It stops on a clean review, refuses a moved or unsafe branch, never force-pushes and has a three-round limit. Autonomy is useful when the exit conditions are part of the design.

Memory follows the same rule as the work itself: useful recollection must have provenance. Search can point back to the session, event or artifact that supports an answer. Reusable lessons can be promoted and deduplicated, while task state stays in VibeQ instead of dissolving into a model's private memory.

<img src="/images/vibeq/vibeq-sirvant.jpg" alt="Sirvant control room showing supervisor and runner health, failed runs, harness warnings and the Hermes to Cloudflare execution topology" width="1280" height="720" loading="lazy" decoding="async"/>
<p><em>Sirvant's control room: supervisor and runner health above, the durable Hermes-to-Cloudflare execution path below and warnings where scheduled work can strand.</em></p>

## A local commit is not delivery

Most of the difficult VibeQ work begins where an agent demo normally ends.

An agent finishes a fix inside a disposable Cloudflare work cell. Tests pass. It writes a clean local commit, reports success, and the summary reads beautifully. Ten seconds later the work cell is destroyed on schedule and the commit goes with it. Nothing errored, so nothing alerted. The task says done and the branch does not exist.

So implementation counts only when the commit exists on the remote as a pushed branch and pull request, or when an explicitly requested landing reaches the named shared branch. A worker that prints plausible handoff JSON without a real job behind it does not count either. Everything short of that is a story about code. VibeQ is deliberately rude about the difference, because a polished summary cannot rescue work that vanished with its container.

The other lessons arrived the same way. A token expires halfway through a two-hour run. A Cloudflare deploy restarts the coordinator while the container is still working. GitHub delivers the same webhook twice. One poisoned Slack event blocks everything queued behind it.

A job cannot be claimed only because a worker can see it. Approval, live parent session, provider, profile, lease and current run state must agree in one guarded transition. Long Cloudflare runs have three ways to return a result so a coordinator restart does not automatically eat the answer. Webhook retries adopt the existing work instead of creating a second review. Dead sessions and stuck ingress lanes have explicit reapers and alerts.

This is the part of VibeQ I find most valuable. It does not ask me to trust that an agent probably did the work. It keeps making the agent, runtime and delivery path produce receipts.

## The incidents that hardened it

The architecture diagram is the easy part. What makes a runtime trustworthy is the list of specific ways it failed and what each failure forced. A sampler from the log, all real:

- **A deploy that silently killed overnight jobs.** Three identical overnight deaths — "lease expired before completion", three for three — traced to a Worker deploy landing 40–60 seconds after each dispatch. The deploy restarted the work-cell Durable Object and severed the held-open container fetch. Because `@cloudflare/containers` tracks activity in memory only, the rewoken object's persisted alarm read an expired window and stopped the container a minute later. Nothing errored; the job just vanished. Two-part fix: the container can now post its own completion through a token scoped to its one job — coordinator and fallback channels race safely, the loser gets a benign 409 — and the activity window is persisted and budget-scaled, so a restarted object keeps the cell alive until the job's budget actually runs out. The interface has since moved into its own Worker script, so a frontend change no longer rolls the container fleet at all.
- **A backup is a theory until the restore is drilled.** The remote restore path went six drill iterations against the real 205MB production dump, each one peeling off a layer no fixture predicted. D1 validates foreign keys mid-import while dumps are written in creation order, so replay is per-table in FK-topological order with counts verified against the manifest before anything imports. D1 caps a statement near 100KB while real rows exceed it, so oversized rows replay with bound parameters instead. Newline-bearing values arrive encoded as nested `replace(…, char(10))` calls, so the decomposer became a recursive evaluator — validated against all 75,018 statements of the dump with zero failures. Twenty-seven tables restored into a scratch database with verified counts. Both recovery paths drilled to green.
- **Tokens that fail closed.** Sandbox-token authorization used to treat an empty action set as allow — a deliberate compatibility bridge that had gone vestigial. It now denies, and a regression test pins the deny path so the bridge cannot quietly reopen. In the same spirit: a write token that dies mid-run is not accepted as a security boundary, and webhook signatures compare in constant time.
- **Tests that are checked for lying.** The RPC driver core landed with a mutation-proven fixture matrix: mutate the code, prove the fixtures notice, and only then trust a green run. Scheduled lanes carry a cron deadman that alerts when an expected lane goes silent — because a missing run raises no error on its own.
- **An error code is not the message.** Sirvant's live Slack cards stopped rendering and degraded to a plain "Thinking…", which is exactly what a refused stream looks like from the Slack side: nothing. The refusal said `invalid_arguments`, no commit of ours lined up with the day it broke, and I spent two deploys on a theory about link markup in card titles. Slack had narrowed an enum. A `task_display_mode` value accepted forty-three times was now rejected, and Slack said so plainly in a `response_metadata` field the code never logged — so two unrelated failures read identically. The fix is smaller than the lesson: when a third-party API starts refusing what used to work and nothing local explains it, log the whole response body before theorising.
- **A migration declined in writing.** When "shouldn't this be Cloudflare Workflows?" came up, the answer became a decision record instead of a refactor: Workflows is built on Durable Objects, three of the four objects here are the canonical use of the primitive, and migrating the fourth would create the second lifecycle implementation another plan exists to forbid. The record exists so the question stops being re-asked every few months.

None of this is exotic. It is the ordinary tax of running other people's work through disposable infrastructure — and it is the difference between a runtime that demos well and one I let touch production repositories.

## What exists now

The repository snapshot on 18 August 2026 looked like this:

| Surface | Snapshot |
|---|---:|
| Repository commits | 1,397 |
| Tracked files | 1,358 |
| TypeScript and TSX files | 543 |
| D1 migrations | 45 |
| Worker and frontend test files | 167 |
| Smoke scripts | 86 |
| Agent profile bundles | 8 |

Those count surface area, which is the least interesting thing a repository can tell you. The board's own ledger is better evidence: by 9 August it had taken in 6,228 tasks since 5 March and closed 4,936 of them, from humans and agents working the same queue. The more useful inventory is what the system keeps together:

- a board, Today view, Activity ledger, cycles, triage and QA Monitor
- task, branch, pull request, commit, dependency and artifact state
- MCP, API, Slack, GitHub and scheduled ingress
- replayable sessions, approvals, memory, search and evidence
- profile-aware supervisors and disposable execution cells
- browser push for the moments when a human is genuinely needed

VibeQ is private and tailored to the way we build Sirv Studio; reviewer access to the repository is available on request. It is also far more infrastructure than a normal two-person task board needs. Cloudflare Workers, D1, R2, Durable Objects, Containers and external supervisors are justified by the agent runtime, not by draggable cards.

I would rather keep it specialized and honest than sand it into a generic SaaS product.

## Where this goes

VibeQ is becoming a full agentic orchestration engine.

Today the flow mostly starts with a person. Someone asks in Slack, a webhook fires or a schedule ticks. The next step is the board dispatching work itself. A failing QA area, a stalled review, a fresh Sentry error or a task that promised a branch and never produced one should not wait for me to notice. The queue already knows. It should hand the job to Sirvant and let him fix it.

That does not loosen the boundaries. The same rules hold: durable record first, scoped credentials, receipts on the way out and explicit approval for anything that touches production. I want the queue to notice, the agent to act and my own job to shrink to reviewing intent instead of chasing status.

## What I learned

The board was the first interface. The ledger became the product.

When implementation gets cheap, coordination does not disappear. It becomes more important. Someone still has to preserve intent, choose the next problem and decide whether a technically valid result makes any product sense. That last one is not a small residue of the job. It is most of it.

VibeQ externalizes the parts my brain should not be trying to retain across a dozen parallel sessions. The task says what should happen. The event trail shows what did happen. The artifact carries the proof. The human still decides what matters.

Which is [the theory of the programmer](/posts/two-theories-of-a-programmer/) applied to plumbing. An agent fleet is not a pile of models. It is a work system that lets one person's judgement operate at a scale they cannot hold in their head, without quietly giving up control of it.

"Can the model make this change?" is no longer the interesting question. The interesting one is what will know that it did, challenge it when it lies and put the result where another person can inspect it.
