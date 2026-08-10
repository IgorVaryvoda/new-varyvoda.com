---
title: "VibeQ"
date: 2026-03-05
lastmod: 2026-08-10
draft: true
featured: false
project_url: "https://work.sirv.studio"
image: "/images/vibeq/vibeq-overview.jpg"
ogImage: "https://www.varyvoda.com/images/vibeq/vibeq-today.jpg"
description: "The control plane behind Sirv Studio: humans and agents work one queue, Slack is the cockpit, and no run counts until the code is on the remote."
hero_title: "vibeq"
hero_kicker: "Human and agent work"
hero_intro: "I started VibeQ as a task board for Sirv Studio. It became the control plane and permanent record for the people and agents building it."
hero_mark: "Work control plane"
hero_scope: "Request to evidence"
hero_primary_label: "Open VibeQ"
hero_frame_label: "VibeQ / overview"
hero_frame_status: "Humans + agents"
hero_flow:
  - "Capture the work"
  - "Choose the worker"
  - "Run within limits"
  - "Keep the receipt"
project_chapters:
  - label: "Origin"
    href: "#i-needed-a-queue-i-could-trust"
  - label: "The board"
    href: "#the-board-grew-eyes"
  - label: "Agents"
    href: "#then-the-agents-moved-in"
  - label: "Architecture"
    href: "#the-board-is-no-longer-the-product"
  - label: "Reliability"
    href: "#a-local-commit-is-not-delivery"
  - label: "Snapshot"
    href: "#what-exists-now"
  - label: "Lesson"
    href: "#what-i-learned"
tech_stack: ["React 19", "Cloudflare Workers", "D1", "R2", "Durable Objects", "Hermes"]
status: "active"
highlights:
  - "One queue for human and agent work"
  - "Slack, MCP, API, cron, and GitHub ingress"
  - "Replayable sessions with approvals and evidence"
  - "Disposable Cloudflare work cells for risky execution"
weight: 2
---

## I needed a queue I could trust

On 5 March 2026 I needed a task board that Veniamin and I would actually use for [Sirv Studio](/projects/sirv-studio/) — enough structure to stop work disappearing into chats and terminal windows. The first version had a pinned backlog and GitHub login.

Asking an agent to write code was already easy. Knowing what it did, who approved it, and whether the result ever reached GitHub is what turned a board into a product.

The agent part arrived on day one. VibeQ could turn rough text into tasks, attach screenshots and videos through Cloudflare R2, and expose the queue through MCP so coding agents could read and update the same work as the humans. Within the first week it had the ordinary board furniture — search, due dates, checklists, dependencies. That was never going to be the hard part.

It was briefly called VibeQueue. I renamed the interface to VibeQ before discovering that renaming deployed Workers, databases and secrets for aesthetic consistency is a fine way to break a working system. The repository is still called `vibequeue`. The product is VibeQ. Both are correct.

## The board grew eyes

A normal task board tells you what somebody wrote on a card. I needed it to tell me what was actually happening.

By April, the home screen had **Who's working on what**, a **Needs attention** radar, domain views and a triage queue. Tasks could show that work had gone quiet, that a review had stalled, that a blocker chain had formed. The one that earns its place on the home screen is the promised branch: a task moves to done, the summary says the fix is in, and no pull request ever appears. On a normal board that gap stays invisible until somebody goes looking for the diff. Here it becomes a card with a name on it.

The Activity view became a chronological record of people and agents creating, moving, discussing and shipping work.

Then the QA Monitor moved into the same interface. Instead of a green badge that says "tests passed", it tracks how old the proof is and which product areas have none. It exists to make weak proof visible before it gets mistaken for confidence.

That changed the unit of work. A task stopped being a title, status and assignee. It started carrying the branch, the pull request, and whatever a reviewer would need to argue with the result.

I do not need a prettier Jira. I need to know what changed while I was looking somewhere else.

<img src="/images/vibeq/vibeq-today.jpg" alt="VibeQ Today view showing the best next move, the live pulse, failing QA, stalled reviews and work that still needs evidence" width="1276" height="718" loading="lazy" decoding="async"/>
<p><em>Today reduces the queue to one next move, then shows the work that is stuck, failing or still missing a receipt.</em></p>

## Then the agents moved in

VibeQ treats agents as workers, not integrations hanging off the side of the real system.

The MCP server lets Codex, Claude and other agent runtimes search the queue, create tasks, claim work, record progress, attach artifacts and close the loop. A human and an agent see the same task ID, same blockers, same unpushed branch. Agents appear in the activity roster beside us, because an agent's work in a separate console is work nobody reviews.

That paid off once I started running the [improve-codex](/projects/improve-codex/) workflow: audit a mature codebase, scrutinize the plans, execute them in isolated worktrees, attack the diffs and land only the work that survives. VibeQ holds the queue around that machinery. It remembers which plans exist, who is doing what, which branches are real and what still needs a human decision.

The important boundary is that an agent seeing a task does not grant it authority. Creating, claiming, changing or closing work must follow the user's instruction and the task's approval state. VibeQ is the record of that authority, not an excuse to infer it.

<img src="/images/vibeq/vibeq-activity.jpg" alt="VibeQ Activity view showing work health, human and agent presence, and a chronological ledger of task, branch and commit events" width="1280" height="720" loading="lazy" decoding="async"/>
<p><em>The Activity ledger puts people and Sirvant in the same roster, then records the task, comment, branch and commit events underneath.</em></p>

## The board is no longer the product

In June, VibeQ changed category. **Sirvant**, the Slack-facing work partner, landed in the same repository.

Slack is the cockpit. VibeQ is the truth.

```text
Slack / GitHub / API / cron / VibeQ UI
  |
  v   Cloudflare gateway + secrets
  |
  v   VibeQ sessions, events, tasks
  |
  v   Hermes / OMP supervisor
  |
  +-> answer directly
  |
  +-> disposable work cell
        code, browser, tests, CLI
          |
          v   evidence back to VibeQ
```

A Slack message, a scheduled documentation sweep and a batch coding job are three ways into the same system. They use the same event history, memory, approval model and evidence store. The mode changes how work starts and where the result goes. It does not create a separate bot with a separate memory.

The planner and the hands are also separate. The supervisor — Hermes, or its OMP sibling — owns the session and decides what needs doing. If the request needs a repository, shell, browser or test run, it starts a disposable Cloudflare Container work cell with scoped credentials. A Hetzner Docker worker remains as a pinned fallback and cleanup lane. The risky environment can disappear when the job ends while VibeQ keeps the durable record.

That split matters more than the choice of model. One agent can plan while another executes. The ledger records both identities, because "Claude planned it and Codex typed it" is useful information when billing, permissions or a failure needs to be traced later.

Sirvant can answer a Slack thread, act on a voice message, reproduce a bug, run a focused fix, open a pull request, sweep documentation, check Sentry or ask for approval. It can also review a pull request and run a bounded review-to-fix loop. The loop stops on a clean review, refuses a moved or unsafe branch, never force-pushes and has a hard round limit. Autonomy is useful when the exit conditions are part of the design.

<img src="/images/vibeq/vibeq-sirvant.jpg" alt="Sirvant control room showing supervisor and runner health, failed runs, harness warnings, and the Hermes to Cloudflare execution topology" width="1280" height="720" loading="lazy" decoding="async"/>
<p><em>Sirvant's control room: supervisor and runner health above, the durable Hermes-to-Cloudflare execution path below, and warnings where scheduled work can strand.</em></p>

## A local commit is not delivery

Most of the difficult VibeQ work begins where an agent demo normally ends.

An agent finishes a fix inside a disposable Cloudflare work cell. Tests pass. It writes a clean local commit, reports success, and the summary reads beautifully. Ten seconds later the work cell is destroyed on schedule and the commit goes with it. Nothing errored, so nothing alerted. The task says done and the branch does not exist.

So implementation counts only when the commit exists on the remote as a pushed branch and pull request, or when an explicitly requested landing reaches the named shared branch. Everything short of that is a story about code. VibeQ is deliberately rude about the difference, because a polished summary cannot rescue work that vanished with its container.

The other lessons arrived the same way. A token expires halfway through a two-hour run. A Cloudflare deploy restarts the coordinator while the container is still working. GitHub delivers the same webhook twice. One poisoned Slack event blocks everything queued behind it.

A job cannot be claimed only because a worker can see it. Approval, live parent session, provider, profile, lease and current run state must agree in one guarded transition. Long Cloudflare runs have three ways to return a result so a coordinator restart does not automatically eat the answer. Webhook retries adopt the existing work instead of creating a second review. Dead sessions and stuck ingress lanes have explicit reapers and alerts.

This is the part of VibeQ I find most valuable. It does not ask me to trust that an agent probably did the work. It keeps making the agent, runtime and delivery path produce receipts.

## What exists now

The repository snapshot on 9 August 2026 looked like this:

| Surface | Snapshot |
|---|---:|
| Repository commits | 1,245 |
| Tracked files | 1,216 |
| TypeScript and TSX files | 489 |
| D1 migrations | 40 |
| Worker and frontend test files | 150 |
| Source smoke scripts | 72 |
| Agent profile bundles | 8 |

Those count surface area, which is the least interesting thing a repository can tell you. The board's own ledger is better evidence: since 5 March it has taken in 6,228 tasks and closed 4,936 of them, from humans and agents working the same queue. The more useful inventory is what the system keeps together:

- a board, Today view, Activity ledger, cycles, triage and QA Monitor
- task, branch, pull request, commit, dependency and artifact state
- MCP, API, Slack, GitHub and scheduled ingress
- replayable sessions, approvals, memory, search and evidence
- profile-aware supervisors and disposable execution cells
- browser push for the moments when a human is genuinely needed

VibeQ is private and tailored to the way we build Sirv Studio. The public URL leads to GitHub login unless you are part of the team. It is also far more infrastructure than a normal two-person task board needs. Cloudflare Workers, D1, R2, Durable Objects, Containers and external supervisors are justified by the agent runtime, not by draggable cards.

I would rather keep it specialized and honest than sand it into a generic SaaS product.

## What I learned

The board was the first interface. The ledger became the product.

When implementation gets cheap, coordination does not disappear. It becomes more important. Someone still has to preserve intent, choose the next problem, and decide whether a technically valid result makes any product sense. That last one is not a small residue of the job. It is most of it.

VibeQ externalizes the parts my brain should not be trying to retain across a dozen parallel sessions. The task says what should happen. The event trail shows what did happen. The artifact carries the proof. The human still decides what matters.

Which is [the theory of the programmer](/posts/two-theories-of-a-programmer/) applied to plumbing. An agent fleet is not a pile of models. It is a work system that lets one person's judgement operate at a scale they cannot hold in their head, without quietly giving up control of it.

"Can the model make this change?" is no longer the interesting question. The interesting one is what will know that it did, challenge it when it lies, and put the result where another person can inspect it.

[Open VibeQ](https://work.sirv.studio) *(Sirv team access only)*
