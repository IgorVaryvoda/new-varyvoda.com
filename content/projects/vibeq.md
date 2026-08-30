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
description: "The work queue behind Sirv Studio. Humans and agents share tasks, approvals, branches, activity, and evidence."
hero_title: "vibeq"
hero_kicker: "Human and agent work"
hero_intro: "VibeQ started as a task board for Sirv Studio. Now it runs the queue behind Sirvant, the Slack bot my team uses to investigate and ship work."
hero_mark: "Shared work queue"
hero_scope: "Request to delivery"
hero_frame_label: "Sirvant / control room"
hero_frame_status: "Runtime + memory"
hero_flow:
  - "Ask in Slack"
  - "Record the work"
  - "Run within limits"
  - "Return the evidence"
project_chapters:
  - label: "Origin"
    href: "#i-needed-a-queue-i-could-trust"
  - label: "Why not Linear"
    href: "#why-not-linear"
  - label: "The board"
    href: "#the-board-started-tracking-evidence"
  - label: "Agents"
    href: "#agents-use-the-same-queue"
  - label: "Sirvant"
    href: "#the-team-uses-it-from-slack"
  - label: "Architecture"
    href: "#one-system-three-ways-in"
  - label: "Reliability"
    href: "#a-local-commit-is-not-delivery"
  - label: "Incidents"
    href: "#the-incidents-that-changed-it"
  - label: "Snapshot"
    href: "#what-exists-now"
  - label: "Next"
    href: "#next"
  - label: "Why"
    href: "#why-i-keep-it"
tech_stack: ["React 19", "Cloudflare Workers", "D1", "R2", "Durable Objects", "Hermes"]
role: "Creator, product lead and principal builder"
stewardship:
  state: "evolving"
  note: "I change it when a real run, Slack thread, or incident exposes a gap."
last_tended: "2026-08-28"
feedback_url: "/contact/?project=vibeq&type=question"
proof:
  - value: "One queue"
    label: "Human and agent work"
  - value: "5 ingress paths"
    label: "Slack, MCP, API, cron, GitHub"
users_changed: "Veniamin's QA work and the team's Slack use added proof age, attention signals, and incident history."
imperfect: "It is internal software. The runtime still has too many execution profiles and recovery paths, and disposable work cells cost too much."
highlights:
  - "One queue for human and agent work"
  - "Slack, MCP, API, cron and GitHub ingress"
  - "Replayable sessions with approvals and evidence"
  - "Disposable Cloudflare work cells for risky execution"
weight: 3
---


## I needed a queue I could trust

On 5 March 2026 I needed a task board that Veniamin and I would actually use for [Sirv Studio](/projects/sirv-studio/). Enough structure to stop work disappearing into chats and terminal windows. The first version had a pinned backlog and GitHub login.

Asking an agent to write code was easy. I needed to know what it did, who approved it, and whether the result reached GitHub.

The agent part arrived on day one. VibeQ could turn rough text into tasks, attach screenshots and videos through Cloudflare R2 and expose the queue through MCP so coding agents could read and update the same work as the humans. Within the first week it had the ordinary board furniture: search, due dates, checklists, dependencies. That was never going to be the hard part.

It was briefly called VibeQueue. I renamed the interface to VibeQ, but kept the deployed Worker, database, secret, and repository names. Renaming infrastructure for visual consistency was not worth the risk.

## Why not Linear

Linear and Height are good products. Jira also exists. I still needed something different.

I did not want to pay per seat. We are two humans about to be outnumbered by agents, and seat pricing punishes exactly that experiment. Every agent identity on the roster would be another subscription line for the privilege of running my own workers.

I wanted to change the system around our own workflow. A promised-branch warning, QA proof age, an MCP surface, and a Slack runtime can all live in the same repository and data model.

I also wanted to own the data. Tasks, events, sessions, approvals, and artifacts live in my D1 database and R2 bucket. That record needs to remain queryable without another vendor's rate limits or export rules.

## The board started tracking evidence

A normal task board tells you what somebody wrote on a card. I needed it to tell me what was actually happening.

By April, the home screen showed active work, items needing attention, domain views, and triage. It could flag quiet work, stalled reviews, and blocker chains. It also checks promised branches: if a task says a fix exists but no pull request appears, the gap becomes visible on the board.

The Activity view became a chronological record of people and agents creating, moving, discussing and shipping work.

The QA Monitor tracks how old the latest proof is and which product areas have none. Veniamin owns this side of the system. A green badge is less useful when the run behind it is stale.

A task now carries its branch, pull request, checks, and review evidence alongside its title and status.

I need to know what changed while I was looking elsewhere.

<img src="/images/vibeq/vibeq-today.jpg" alt="VibeQ Today view showing the best next move, the live pulse, failing QA, stalled reviews and work that still needs evidence" width="1276" height="718" loading="lazy" decoding="async"/>
<p><em>Today reduces the queue to one next move, then shows the work that is stuck, failing, or still missing delivery evidence.</em></p>

## Agents use the same queue

Agents use the same tasks as the human team.

The MCP server lets Codex, Claude, and other runtimes search the queue, create tasks, claim work, record progress, attach artifacts, and close tasks. Humans and agents see the same task ID, blockers, and branch state. Agent activity appears beside human activity.

The [improve-codex](/projects/improve-codex/) workflow uses this queue for codebase audits, reviewed plans, isolated worktrees, and diff reviews. The **Clanker Army** inside the Studio repository runs accepted plans in batches. VibeQ records the plan, owner, branch, status, and remaining human decision.

Seeing a task does not grant authority to change it. Agent actions still depend on the user's instruction and the task's approval state. VibeQ records that authority.

<img src="/images/vibeq/vibeq-activity.jpg" alt="VibeQ Activity view showing work health, human and agent presence, and a chronological ledger of task, branch and commit events" width="1280" height="720" loading="lazy" decoding="async"/>
<p><em>The Activity ledger puts people and Sirvant in the same roster, then records the task, comment, branch and commit events underneath. Designed by <a href="https://www.linkedin.com/in/veniamin-krachun/">Veniamin Krachun</a>.</em></p>

## The team uses it from Slack

In June, VibeQ changed category. **Sirvant**, the agent runtime with a public Slack identity, landed in the same repository.

Sirvant is the Slack interface for this system. It can answer a product question, continue an old thread, investigate a bug, prepare a report, or handle a scoped implementation request. Voice notes are transcribed into the same flow.

Depending on the profile, Sirvant can use VibeQ, Basecamp, Sentry, the internal knowledge base, and Sirv Marketing Machine data. It can triage work, reproduce an issue, inspect code, schedule automation, or open a pull request. Thread replies continue the existing session.

Sirvant does not start a worker for every message. Hermes or OMP first loads the relevant history and decides whether it can answer directly. Work that needs a repository, browser, tests, or command-line tools receives a disposable execution cell.

VibeQ stores the request, decisions, tool results, approvals, failures, artifacts, and final status. A Slack retry, supervisor restart, or deleted work cell should not erase that history or create a duplicate job.

Read-only inspection needs no extra approval. A requested implementation can produce a branch and pull request. Direct shared-branch pushes, merges, deploys, production writes, and destructive actions still need explicit approval.

## One system, three ways in

Slack work, scheduled automation, and batch jobs use the same sessions, memory, and approval model. Only the trigger and return channel change.

{{< vibeq-workpath >}}

Cloudflare verifies ingress and protects Slack and API secrets. VibeQ stores session and task state in D1 and larger artifacts in R2. A profile-matched Hermes or OMP supervisor claims the work item. If execution is needed, it starts a short-lived Cloudflare work cell with scoped identity and permissions. A Hetzner Docker worker remains as a fallback and cleanup lane.

Planning and execution can use different agents. VibeQ records both identities for later review, billing, permissions, and incident tracing.

Profiles narrow the tools and approval rules for each kind of work. Sirvant uses the open-ended `vibeq-codex` profile. Documentation sweeps and pull-request reviews use narrower profiles. GitHub webhooks and scheduled jobs still use the same underlying record.

The pull-request path can run a review-and-fix loop. It stops on a clean review, refuses a moved or unsafe branch, never force-pushes, and allows at most three rounds.

Memory results point back to the session, event, or artifact that supports them. Reusable lessons can be promoted and deduplicated. Task state remains in VibeQ rather than a model's private memory.

<img src="/images/vibeq/vibeq-sirvant.jpg" alt="Sirvant control room showing supervisor and runner health, failed runs, verification warnings and the Hermes to Cloudflare execution topology" width="1280" height="720" loading="lazy" decoding="async"/>
<p><em>Sirvant's control room: supervisor and runner health above, the durable Hermes-to-Cloudflare execution path below and warnings where scheduled work can strand.</em></p>

## A local commit is not delivery

Most VibeQ failures happen after an agent says the code is finished.

An agent can finish a fix inside a disposable Cloudflare work cell, pass tests, create a local commit, and report success. If the work cell is then deleted before pushing, the commit disappears. Nothing necessarily throws an error. The task says done and the branch does not exist.

Implementation counts only when the commit exists on the remote as a branch and pull request, or when an explicitly requested landing reaches the named shared branch. Handoff JSON is also checked against a real job. A completion summary is not delivery evidence.

The other lessons arrived the same way. A token expires halfway through a two-hour run. A Cloudflare deploy restarts the coordinator while the container is still working. GitHub delivers the same webhook twice. One poisoned Slack event blocks everything queued behind it.

A job claim checks approval, parent session, provider, profile, lease, and current run state in one guarded transition. Long Cloudflare runs have three result paths so a coordinator restart does not lose the answer. Webhook retries adopt existing work. Reapers and alerts handle dead sessions and stuck ingress.

The system asks the agent, runtime, and delivery path for evidence instead of trusting the final summary.

## The incidents that changed it

These incidents changed the design:

- **A deploy killed overnight jobs without an application error.** Three Worker deploys landed 40 to 60 seconds after dispatch and restarted the work-cell Durable Object. Its in-memory activity state disappeared, so the persisted alarm stopped the container. Containers can now post completion through a token scoped to one job, and the activity window survives restarts. The interface also moved to a separate Worker, so frontend deploys no longer restart work cells.
- **Restore drills found problems fixtures missed.** The remote restore path needed six iterations against a 205 MB production dump. D1 checks foreign keys during import, limits statement size, and received newline values as nested SQL expressions. Restore now orders tables by foreign keys, uses bound parameters for oversized rows, evaluates the nested expressions, and verifies table counts. All 75,018 statements in the dump parsed successfully.
- **Empty token permissions used to allow access.** A compatibility path treated an empty action set as allowed. It now denies access, and a regression test protects that behaviour. Webhook signatures also use constant-time comparison.
- **Tests are mutation-checked.** The RPC fixture matrix is checked by changing the implementation and confirming the fixtures fail. Scheduled lanes have a deadman alert because a missing run produces no normal error.
- **Slack hid the useful error.** Live cards stopped rendering and fell back to "Thinking…". The code logged `invalid_arguments` but not Slack's `response_metadata`, which identified a rejected `task_display_mode` value. Logging the full response made the cause visible.
- **A migration declined in writing.** When "shouldn't this be Cloudflare Workflows?" came up, the answer became a decision record instead of a refactor: Workflows is built on Durable Objects, three of the four objects here are the canonical use of the primitive, and migrating the fourth would create the second lifecycle implementation another plan exists to forbid. The record exists so the question stops being re-asked every few months.

These are the checks I need before letting the runtime touch production repositories.

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

Those numbers describe repository size. The board gives better usage evidence: by 9 August it had received 6,228 tasks since 5 March and closed 4,936 of them. Humans and agents worked from the same queue.

- a board, Today view, Activity ledger, cycles, triage and QA Monitor
- task, branch, pull request, commit, dependency and artifact state
- MCP, API, Slack, GitHub and scheduled ingress
- replayable sessions, approvals, memory, search and evidence
- profile-aware supervisors and disposable execution cells
- browser push for the moments when a human is genuinely needed

VibeQ is private and tailored to the way we build Sirv Studio. Reviewer access is available on request. Cloudflare Workers, D1, R2, Durable Objects, Containers, and external supervisors exist for the agent runtime, not for the task board alone.

I currently prefer keeping it specialised over turning it into a general task-board product.

## Next

Most work currently starts with a person, webhook, or schedule. The next step is to let known conditions start specific jobs automatically. Examples include a failing QA area, stalled review, new Sentry error, or completed task with no remote branch.

The same boundaries still apply: record the work first, scope credentials, require delivery evidence, and ask for approval before production changes.

## Why I keep it

VibeQ began as a board. Its most useful part is now the record connecting intent, execution, approval, and delivery.

It keeps details I cannot reliably retain across many parallel sessions. The task says what should happen. Events show what happened. Artifacts provide the evidence. A human still decides what matters.

The relevant question is no longer only whether a model can make a change. I also need to know who approved it, what checked it, where it was delivered, and how another person can inspect the result.
