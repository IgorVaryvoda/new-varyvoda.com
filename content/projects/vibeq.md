---
title: "VibeQ"
date: 2026-03-05
lastmod: 2026-08-09
draft: true
featured: false
project_url: "https://work.sirv.studio"
image: "/images/studio/studio-vibeq.webp"
description: "The shared task board and agent control plane behind Sirv Studio. Humans and agents work from the same queue, Sirvant enters through Slack, and every run has to leave evidence."
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
    href: "#delivery-truth"
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
weight: 5
---

## I needed a queue I could trust

Asking an agent to write code is easy now. Knowing what it is doing, why it is doing it, who approved it, what failed, and whether the result actually reached GitHub is the harder product.

I did not start VibeQ with that grand plan. On 5 March 2026, I needed a task board for [Sirv Studio](/projects/sirv-studio/) that Veniamin and I would actually use. The first version had a pinned backlog, GitHub login and enough structure to stop work disappearing into chats and terminal windows.

The agent part arrived on day one. VibeQ could turn rough text into tasks, attach screenshots and videos through Cloudflare R2, and expose the queue through MCP so coding agents could read and update the same work as the humans. Within the first week it had search, due dates, checklists, dependencies, digests and a dependency graph.

It was briefly called VibeQueue. I renamed the interface to VibeQ before discovering that renaming deployed Workers, databases and secrets for aesthetic consistency is a fine way to break a working system. The repository is still called `vibequeue`. The product is VibeQ. Both are correct.

## The board grew eyes

A normal task board tells you what somebody wrote on a card. I needed it to tell me what was actually happening.

By April, the home screen had **Who's working on what**, a **Needs attention** radar, domain views and a triage queue. Tasks could show that work had gone quiet, a review had stalled, a blocker chain had formed or a promised branch had never become a pull request. The Activity view became a chronological record of people and agents creating, moving, discussing and shipping work.

Then the QA Monitor moved into the same interface. Instead of a green badge that says “tests passed”, it tracks harnesses, product areas, stale evidence, blocking findings, runtime coverage and the next useful action. The point is not another dashboard. It is to make weak proof visible before it gets mistaken for confidence.

That changed the unit of work. A task was no longer only a title, status and assignee. It could carry a branch, commit, pull request, screenshots, test output, review verdicts, dependencies, comments and the evidence that closed it.

I do not need a prettier Jira. I need to know what changed while I was looking somewhere else.

## Then the agents moved in

VibeQ treats agents as workers, not integrations hanging off the side of the real system.

The MCP server lets Codex, Claude and other agent runtimes search the queue, create tasks, claim work, record progress, attach artifacts and close the loop. A human and an agent see the same task ID, same blockers and same delivery evidence. Agents appear in the activity roster beside us because hiding their work in a separate console would defeat the point.

This became particularly useful once I started running the workflow described in [improve-codex](/projects/improve-codex/): audit a mature codebase, scrutinise the plans, execute them in isolated worktrees, attack the diffs and land only the work that survives. VibeQ holds the queue around that machinery. It remembers which plans exist, who is doing what, which branches are real and what still needs a human decision.

The important boundary is that an agent seeing a task does not grant it authority. Creating, claiming, changing or closing work must follow the user's instruction and the task's approval state. VibeQ is the record of that authority, not an excuse to infer it.

## The board is no longer the product

In June, VibeQ changed category. River and **Sirvant**, the Slack-facing work partner, landed in the same repository.

Slack is the cockpit. VibeQ is the truth.

```text
Slack, GitHub, API, cron, or the VibeQ interface
                     ↓
          Cloudflare gateway and secret boundary
                     ↓
       VibeQ sessions, events, tasks, and artifacts
                     ↓
            Hermes or OMP supervisor
                     ↓
       short-lived session decides what is needed
              ↙                    ↘
        answer directly      start disposable hands
                                   ↓
                  code, browser, tests, and CLI work
                                   ↓
                      evidence returns to VibeQ
```

A Slack message, scheduled documentation sweep and batch coding job are three ways into the same system. They use the same event history, memory, approval model and evidence store. The mode changes how work starts and where the result goes. It does not create a separate bot with a separate memory.

The planner and the hands are also separate. Hermes or OMP owns the session and decides what needs doing. If the request needs a repository, shell, browser or test run, it starts a disposable Cloudflare Container work cell with scoped credentials. A Hetzner Docker worker remains as a pinned fallback and cleanup lane. The risky environment can disappear when the job ends while VibeQ keeps the durable record.

That split matters more than the choice of model. One agent can plan while another executes. The ledger records both identities, because “Claude planned it and Codex typed it” is useful information when billing, permissions or a failure needs to be traced later.

Sirvant can answer a Slack thread, act on a voice message, reproduce a bug, run a focused fix, open a pull request, sweep documentation, check Sentry or ask for approval. It can also review a pull request and run a bounded review-to-fix loop. The loop stops on a clean review, refuses a moved or unsafe branch, never force-pushes and has a hard round limit. Autonomy is useful when the exit conditions are part of the design.

## Delivery truth

Most of the difficult VibeQ work begins where an agent demo normally ends.

What happens when a token expires halfway through a two-hour run? What if a Cloudflare deploy restarts the coordinator but the container is still working? What if GitHub delivers the same webhook twice? What if one poisoned Slack event blocks everything behind it? What if a trigger dies but its session still says running? What if an agent makes a lovely local commit in a workspace that will be destroyed ten seconds later?

VibeQ has had to learn all of those lessons.

A job cannot be claimed only because a worker can see it. Approval, live parent session, provider, profile, lease and current run state must agree in one guarded transition. Long Cloudflare runs have three ways to return a result so a coordinator restart does not automatically eat the answer. Webhook retries adopt the existing work instead of creating a second review. Dead sessions and stuck ingress lanes have explicit reapers and alerts.

And a local commit is not delivery. Implementation counts only when the commit exists on the remote as a pushed branch and pull request, or when an explicitly requested landing reaches the named shared branch. The system is deliberately rude about this because a polished summary cannot rescue code that vanished with its container.

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

Those numbers describe surface area, not quality. The more useful inventory is what the system can now keep together:

- a board, Today view, Activity ledger, cycles, triage and QA Monitor
- task, branch, pull request, commit, dependency and artifact state
- MCP, API, Slack, GitHub and scheduled ingress
- replayable sessions, approvals, memory, search and evidence
- profile-aware supervisors and disposable execution cells
- browser push for the moments when a human is genuinely needed

VibeQ is private and tailored to the way we build Sirv Studio. The public URL leads to GitHub login unless you are part of the team. It is also far more infrastructure than a normal two-person task board needs. Cloudflare Workers, D1, R2, Durable Objects, Containers and external supervisors are justified by the agent runtime, not by draggable cards.

I would rather keep that specialisation honest than prematurely turn it into a generic SaaS product.

## What I learned

The board was the first interface. The ledger became the product.

When implementation gets cheap, coordination does not disappear. It becomes more important. Someone still has to preserve intent, choose the next problem, control authority, spot weak evidence, recover interrupted work and decide whether a technically valid result makes any product sense.

VibeQ externalises the parts my brain should not be trying to retain across a dozen parallel sessions. The task says what should happen. The event trail shows what did happen. The artifact carries the proof. The human still decides what matters.

That is the real connection between VibeQ and [my theory of the programmer](/posts/two-theories-of-a-programmer/). An agent fleet is not mainly a pile of models. It is a work system that lets human judgement operate at a larger scale without quietly giving up control.

The useful question is no longer “can the model make this change?” It is “what system will know that it did, challenge it when it lies and put the result somewhere another person can inspect?”

[Open VibeQ](https://work.sirv.studio) *(Sirv team access only)*
