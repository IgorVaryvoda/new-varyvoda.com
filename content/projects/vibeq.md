---
title: "VibeQ"
date: 2026-03-05
lastmod: 2026-08-11
draft: false
featured: true
image: "/images/vibeq/vibeq-overview.webp"
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
  - label: "Snapshot"
    href: "#what-exists-now"
  - label: "Lesson"
    href: "#what-i-learned"
tech_stack: ["React 19", "Cloudflare Workers", "D1", "R2", "Durable Objects", "Hermes"]
status: "active"
highlights:
  - "One queue for human and agent work"
  - "Slack, MCP, API, cron and GitHub ingress"
  - "Replayable sessions with approvals and evidence"
  - "Disposable Cloudflare work cells for risky execution"
weight: 2
---

<style>
.project-description .vq-visual {
  --vq-bg: #0a1018;
  --vq-line: rgba(255, 255, 255, 0.12);
  --vq-text: #edf7fb;
  --vq-muted: #94a6b4;
  --vq-cyan: #66d9ef;
  --vq-green: #a6e3a1;
  --vq-amber: #f9c97a;
  position: relative;
  margin: 3rem 0;
  padding: clamp(1.4rem, 3vw, 2rem);
  border: 1px solid var(--vq-line);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(102, 217, 239, 0.12), transparent 34%),
    linear-gradient(315deg, rgba(166, 227, 161, 0.08), transparent 38%),
    var(--vq-bg);
  color: var(--vq-text);
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
}

.project-description .vq-visual::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 78%);
}

.project-description .vq-visual > * {
  position: relative;
  z-index: 1;
}

.project-description .vq-visual-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.project-description .vq-visual-head span {
  color: var(--vq-cyan);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.project-description .vq-visual-head strong {
  color: var(--vq-muted);
  font-size: 1.1rem;
  font-weight: 500;
}

.project-description .vq-visual figcaption {
  margin-top: 1.35rem;
  color: var(--vq-muted);
  font-size: 1.25rem;
  line-height: 1.55;
}

.project-description .vq-workpath svg {
  display: block;
  width: 100%;
  height: auto;
}

.project-description .vq-workpath text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

@media (max-width: 760px) {
  .project-description .vq-visual {
    margin-left: -0.4rem;
    margin-right: -0.4rem;
  }

  .project-description .vq-workpath {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .project-description .vq-workpath svg {
    min-width: 660px;
  }
}
</style>

## I needed a queue I could trust

On 5 March 2026 I needed a task board that Veniamin and I would actually use for [Sirv Studio](/projects/sirv-studio/). Enough structure to stop work disappearing into chats and terminal windows. The first version had a pinned backlog and GitHub login.

Asking an agent to write code was already easy. Knowing what it did, who approved it and whether the result ever reached GitHub is what turned a board into a product.

The agent part arrived on day one. VibeQ could turn rough text into tasks, attach screenshots and videos through Cloudflare R2 and expose the queue through MCP so coding agents could read and update the same work as the humans. Within the first week it had the ordinary board furniture: search, due dates, checklists, dependencies. That was never going to be the hard part.

It was briefly called VibeQueue. I renamed the interface to VibeQ before discovering that renaming deployed Workers, databases and secrets for aesthetic consistency is a fine way to break a working system. The repository is still called `vibequeue`. The product is VibeQ. Both are correct.

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

In June, VibeQ changed category. River, the agent runtime, and **Sirvant**, its public Slack identity, landed in the same repository.

Sirvant is not a slash-command bot or a chat skin over the task API. It is a durable, open-ended work partner in the Sirv Slack workspace. Someone can ask a product question, send a voice note, continue an old thread, point at a bug, request a report or ask for a scoped fix. Sirvant is expected to understand the request, inspect the available systems and either answer or act.

That includes more than repository work. The profile can use VibeQ itself, authenticated Basecamp access, Sentry, the internal Outline knowledge base and Sirv Marketing Machine data when those tools are available. It can triage the queue, reproduce an issue in a browser, inspect a codebase, prepare a report, schedule real automation or open a pull request. A voice message is transcribed and treated as the instruction. A thread reply continues the existing conversation instead of starting an amnesiac new chat.

The useful distinction is between **thinking** and **hands**. Sirvant does not start a worker for every message. Hermes or OMP owns a short-lived thinking session, loads the relevant history and decides whether the request can be answered directly. Only work that needs a repository, browser, tests, files or command-line tools gets a disposable execution cell.

Slack is the cockpit. VibeQ is the logbook and source of truth. Every meaningful request, decision, tool result, approval, failure, artifact and closeout should be recoverable there. A Slack retry, supervisor restart or vanished work cell should not erase the history or make a second job look like the first one.

Sirvant also has a real authority boundary. Read-only inspection is cheap. A requested implementation can produce a pushed branch and pull request. Direct pushes to shared branches, merges, deploys, production writes and destructive actions still need explicit approval. The point is not to remove humans from the loop. It is to make the loop visible and precise.

## One system, three ways in

Interactive Slack work, scheduled automation and batch jobs all enter the same underlying system. The mode changes how work starts and where the result returns. It does not create a separate bot, memory or approval model.

<figure class="vq-visual vq-workpath" aria-labelledby="vq-workpath-title">
  <div class="vq-visual-head">
    <span id="vq-workpath-title">work path</span>
    <strong>request → durable record → evidence</strong>
  </div>
  <svg viewBox="0 0 920 620" role="img" aria-label="VibeQ work path: Slack, GitHub, API, schedule and the VibeQ interface enter one Cloudflare front door, become a durable work item in the VibeQ ledger, a Hermes or OMP supervisor runs a short thinking session, then answers directly or starts a disposable work cell, and evidence returns to VibeQ and Slack."><defs><marker id="vq-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66d9ef"/></marker><marker id="vq-arrow-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#a6e3a1"/></marker><linearGradient id="vq-node" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#152231"/><stop offset="100%" stop-color="#0d141e"/></linearGradient></defs><g><rect x="44" y="30" width="152" height="46" rx="8" fill="url(#vq-node)" stroke="rgba(102,217,239,0.5)"/><rect x="214" y="30" width="152" height="46" rx="8" fill="url(#vq-node)" stroke="rgba(255,255,255,0.16)"/><rect x="384" y="30" width="152" height="46" rx="8" fill="url(#vq-node)" stroke="rgba(255,255,255,0.16)"/><rect x="554" y="30" width="152" height="46" rx="8" fill="url(#vq-node)" stroke="rgba(255,255,255,0.16)"/><rect x="724" y="30" width="152" height="46" rx="8" fill="url(#vq-node)" stroke="rgba(255,255,255,0.16)"/><text x="120" y="58" fill="#edf7fb" font-size="14" font-weight="700" text-anchor="middle">Slack</text><text x="290" y="58" fill="#edf7fb" font-size="14" font-weight="700" text-anchor="middle">GitHub</text><text x="460" y="58" fill="#edf7fb" font-size="14" font-weight="700" text-anchor="middle">API</text><text x="630" y="58" fill="#edf7fb" font-size="14" font-weight="700" text-anchor="middle">Schedule</text><text x="800" y="58" fill="#edf7fb" font-size="14" font-weight="700" text-anchor="middle">VibeQ UI</text></g><g stroke="rgba(102,217,239,0.45)" stroke-width="1.6" fill="none"><line x1="120" y1="76" x2="120" y2="96"/><line x1="290" y1="76" x2="290" y2="96"/><line x1="630" y1="76" x2="630" y2="96"/><line x1="800" y1="76" x2="800" y2="96"/><line x1="120" y1="96" x2="800" y2="96"/></g><g stroke="#66d9ef" stroke-width="2.2" fill="none" marker-end="url(#vq-arrow)" opacity="0.85"><line x1="460" y1="76" x2="460" y2="114"/><line x1="460" y1="182" x2="460" y2="208"/><line x1="460" y1="288" x2="460" y2="310"/><path d="M 460 378 L 460 392 Q 460 402 450 402 L 260 402 Q 250 402 250 412 L 250 422"/><path d="M 460 378 L 460 392 Q 460 402 470 402 L 660 402 Q 670 402 670 412 L 670 422"/></g><rect x="300" y="120" width="320" height="62" rx="10" fill="url(#vq-node)" stroke="rgba(102,217,239,0.38)"/><text x="460" y="146" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Cloudflare front door</text><text x="460" y="167" fill="#94a6b4" font-size="12" text-anchor="middle">signed ingress · secret boundary</text><rect x="300" y="214" width="320" height="70" rx="12" fill="#07131c" stroke="rgba(249,201,122,0.72)" stroke-width="2"/><text x="460" y="242" fill="#f9c97a" font-size="18" font-weight="800" text-anchor="middle">VibeQ ledger</text><text x="460" y="264" fill="#edf7fb" font-size="12" text-anchor="middle">durable work item · D1 state · R2 artifacts</text><rect x="300" y="316" width="320" height="62" rx="10" fill="url(#vq-node)" stroke="rgba(102,217,239,0.38)"/><text x="460" y="342" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Hermes / OMP supervisor</text><text x="460" y="363" fill="#94a6b4" font-size="12" text-anchor="middle">short-lived thinking session</text><rect x="110" y="426" width="280" height="62" rx="10" fill="url(#vq-node)" stroke="rgba(166,227,161,0.44)"/><text x="250" y="452" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Answer directly</text><text x="250" y="473" fill="#94a6b4" font-size="12" text-anchor="middle">reply lands in the thread</text><rect x="530" y="426" width="280" height="62" rx="10" fill="url(#vq-node)" stroke="rgba(203,166,247,0.44)"/><text x="670" y="452" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Disposable work cell</text><text x="670" y="473" fill="#94a6b4" font-size="12" text-anchor="middle">repo · browser · tests · CLI</text><g stroke="#a6e3a1" stroke-width="2.2" fill="none" marker-end="url(#vq-arrow-g)" opacity="0.85"><line x1="250" y1="488" x2="250" y2="540"/><line x1="670" y1="488" x2="670" y2="540"/></g><rect x="64" y="546" width="792" height="46" rx="23" fill="rgba(166,227,161,0.05)" stroke="rgba(166,227,161,0.22)"/><circle cx="96" cy="569" r="4" fill="#a6e3a1"/><text x="114" y="574" fill="#c9d6de" font-size="13" font-weight="700">evidence returns to VibeQ and Slack</text><text x="856" y="574" fill="#94a6b4" font-size="13" text-anchor="end">pushed branch · PR · artifacts · closeout</text></svg>
  <figcaption>Every way in produces the same durable record. The thinking session is short-lived. The work cell is disposable. The evidence outlives both.</figcaption>
</figure>

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

VibeQ is private and tailored to the way we build Sirv Studio. It is also far more infrastructure than a normal two-person task board needs. Cloudflare Workers, D1, R2, Durable Objects, Containers and external supervisors are justified by the agent runtime, not by draggable cards.

I would rather keep it specialized and honest than sand it into a generic SaaS product.

## What I learned

The board was the first interface. The ledger became the product.

When implementation gets cheap, coordination does not disappear. It becomes more important. Someone still has to preserve intent, choose the next problem and decide whether a technically valid result makes any product sense. That last one is not a small residue of the job. It is most of it.

VibeQ externalizes the parts my brain should not be trying to retain across a dozen parallel sessions. The task says what should happen. The event trail shows what did happen. The artifact carries the proof. The human still decides what matters.

Which is [the theory of the programmer](/posts/two-theories-of-a-programmer/) applied to plumbing. An agent fleet is not a pile of models. It is a work system that lets one person's judgement operate at a scale they cannot hold in their head, without quietly giving up control of it.

"Can the model make this change?" is no longer the interesting question. The interesting one is what will know that it did, challenge it when it lies and put the result where another person can inspect it.
