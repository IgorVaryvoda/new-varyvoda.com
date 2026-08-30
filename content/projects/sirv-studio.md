---
title: "Sirv AI Studio"
date: 2026-07-02
lastmod: 2026-07-24
draft: false
hero: true
atmosphere: true
page_css: ["studio"]
page_js: ["studio"]
project_url: "https://www.sirv.studio"
image: "/images/studio/studio-create-prompt.webp"
image_alt: "Sirv Studio AI batch creation interface"
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
description: "I created and built Sirv Studio. It scans Shopify catalogs, runs AI work in batches, routes supplier uploads through review, and publishes with versioning and rollback."
hero_note: "30+ AI tools, a workflow orchestrator, a production MCP server and API platform for AI agents, supplier portals, Stripe billing, and the reliability infrastructure underneath."
hero_kicker: "Built end to end"
hero_intro: "I built Sirv AI Studio from zero into the system Sirv uses to scan catalogs, run AI work in batches, review supplier uploads, and publish safely to Shopify."
hero_mark: "Product system"
hero_scope: "Catalog to Shopify"
hero_primary_label: "Open Sirv Studio"
hero_frame_label: "Studio / create"
hero_frame_status: "Live product"
hero_secondary_url: "/projects/sirv-studio/build-record/"
hero_secondary_label: "Read the build record"
homepage_label: "Current focus"
homepage_cta: "Explore Sirv Studio"
hero_flow:
  - "Catalog scan"
  - "AI batch"
  - "Human review"
  - "Safe publish"
project_chapters:
  - label: "Day one"
    href: "#it-started-over-a-beer"
  - label: "Product"
    href: "#what-it-does"
  - label: "Architecture"
    href: "#how-its-built"
  - label: "Correction"
    href: "#the-correction"
  - label: "Verdict"
    href: "#so-is-it-any-good"
tech_stack: ["React 19", "TanStack Start", "PostgreSQL", "Drizzle", "Inngest", "Stripe", "fal.ai"]
role: "Creator, product lead, architect and principal engineer"
stewardship:
  state: "primary-focus"
  note: "My main product. I spend most of my product, engineering, and commercial time on it."
last_tended: "2026-08-29"
feedback_url: "/contact/?project=sirv-studio&type=bug"
proof:
  - value: "Production"
    label: "Enterprise supplier workflow"
  - value: "47"
    label: "Tools in the MCP server snapshot"
summary:
  problem: "Govern AI-assisted product content from intake through safe publication"
  shipped: "Catalog scanning, AI batches, supplier portals, review, Shopify publishing, rollback, API and MCP"
  real_use: "Enterprise supplier workflow in production"
  team: "Igor, Max, Veniamin"
  current_state: "Primary focus; actively evolving"
collaborators:
  - name: "Max Wish"
    url: "https://www.linkedin.com/in/max-wish/"
    contribution: "Major contributor across the internal design system and virtualized data grid, working alongside Igor across those systems."
  - name: "Veniamin Krachun"
    url: "https://www.linkedin.com/in/veniamin-krachun/"
    contribution: "Owns QA, including the testing and verification infrastructure."
users_changed: "A real supplier workflow turned the portal from a simple upload link into intake, review, and publishing."
imperfect: "I have shipped more than I have proved. Activation, onboarding, rollback evidence, and the unfinished PIM work matter more now than another tool."
highlights:
  - "Creator & architect, first commit to production"
  - "Supplier portal live with a real enterprise customer"
  - "47-tool MCP server + API platform for AI agents"
  - "Safe Shopify publishing with drift detection and rollback"
weight: 1
---


## It started over a beer

Some coworkers were visiting me in Herceg Novi, Montenegro. Over a beer the conversation drifted to AI — what it could actually build now, not what the keynotes promised — and at some point I told the table: I'm going to build this in a day.

The next morning I was up at six. `Initial commit from Create Next App` landed at 6:35 on December 2, 2025. The first AI tool — background replacement, with model selection — was working by 8:00. Virtual try-on by 8:23. Multi-angle product shots and lighting removal by 8:45. Auth, billing, rate limiting, and Sirv storage went in before noon, and the MVP merge is timestamped 12:05. The afternoon added batch processing with multi-select and a side-by-side compare mode. Thirty-one commits, day one — every timestamp in the log. The bet stood by lunch; the rest of this page is what happened when I kept going.

<figure class="studio-visual studio-dayone" aria-labelledby="studio-dayone-title">
  <div class="studio-visual-head">
    <span id="studio-dayone-title">day one timeline</span>
    <strong>Dec 2, 2025 · git log timestamps</strong>
  </div>
  <ol>
    <li><time>06:35</time><b>Create Next App</b><span>the empty repo becomes a product bet</span></li>
    <li><time>08:00</time><b>first AI tool</b><span>background replacement and model selection</span></li>
    <li><time>08:23</time><b>virtual try-on</b><span>second tool family is already live</span></li>
    <li><time>08:45</time><b>product-shot tools</b><span>angles, lighting removal, more image work</span></li>
    <li><time>12:05</time><b>MVP merge</b><span>auth, billing, rate limits, Sirv storage</span></li>
    <li><time>17:14</time><b>cleanup pass</b><span>batch mode and compare mode were already in</span></li>
  </ol>
  <figcaption>Six of the 31 day-one commits, timestamps straight from the repo history. The story sounds like a dare because it was one.</figcaption>
</figure>

That pace turned out to be the project's resting heart rate, not a launch spike. Six days in: the workflow orchestrator canvas — the drag-and-drop pipeline builder that's still the center of the product. Twelve days in: durable background jobs on Inngest. Eighteen days: an MCP server, before most people knew what MCP was. Twenty-five days: the embedded Shopify app. December closed at 602 commits, and the repo already had the skeleton of everything Studio is today.


I built Studio from `create-next-app` on a December morning to the production platform it is today: the AI tool layer, workflow orchestrator, supplier portal, Shopify publishing pipeline, MCP and API platform, and the reliability machinery underneath. Along the way [Max Wish](https://www.linkedin.com/in/max-wish/) and [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) took ownership of critical parts: the design system and data grid, and the QA proof machine. This page is the product story. The separate [build record](/projects/sirv-studio/build-record/) carries the forensic version, with 48 dated milestones and every large number tied to a counting rule.

<figure class="studio-visual studio-timeline" aria-labelledby="studio-timeline-title">
  <div class="studio-visual-head">
    <span id="studio-timeline-title">what shipped, in order</span>
    <strong>Dec 2, 2025 → Jul 2026 · condensed from 48 milestones</strong>
  </div>
  <ol>
    <li><time>Dec 2</time><div><b>A product before lunch</b><span>Image tools, auth, billing, rate limits, Sirv storage, batch mode, and compare mode all land on day one.</span></div></li>
    <li><time>Dec 18</time><div><b>Durable jobs and the first MCP server</b><span>Long runs leave the request cycle for Inngest and stream progress; agents get a real tool surface before most people knew what MCP was.</span></div></li>
    <li><time>Dec 27</time><div><b>Five entry surfaces in four days</b><span>Shopify, Zapier, n8n, MCP OAuth, and the OpenAI Apps SDK — the platform can be driven from a store, an automation, or an agent.</span></div></li>
    <li><time>Jan 20</time><div><b>The asset library lands in a day</b><span>Assets, tags, filters, R2 storage, product links, and operation history — the DAM underneath the AI tools.</span></div></li>
    <li><time>Jan 26</time><div><b>Multi-org, roles, and share links</b><span>Nested collections, role-based access, and subfolder share navigation turn the library into a team product.</span></div></li>
    <li><time>Feb 3</time><div><b>The first supplier portal</b><span>Scoped upload links, an approval queue, and before-and-after autofix review — intake becomes a pipeline, not an inbox.</span></div></li>
    <li><time>Feb 16</time><div><b>SFTP, SAP, catalog import, live Shopify sync</b><span>Supplier delivery and product edits flow in through retry-safe GraphQL handling.</span></div></li>
    <li><time>Mar 7</time><div><b>A real supplier spec, proven end to end</b><span>The Alkosto pipeline drives reusable validation, product assignment, autofix, review, and delivery.</span></div></li>
    <li><time>Mar 19</time><div><b>Imports and side-effects go durable</b><span>Cancellable background jobs and an event outbox, so a retry can't casually duplicate work.</span></div></li>
    <li><time>Apr 9</time><div><b>Next.js replaced in 72 hours, live</b><span>A route-by-route migration to TanStack Start on a billing, multi-tenant, job-running app — with users on it.</span></div></li>
    <li><time>Apr 28</time><div><b>Workflows gain real triggers</b><span>Uploads, schedules, product changes, and authenticated webhooks start runs, with dry-runs and attempt history.</span></div></li>
    <li><time>May 15</time><div><b>The product-content graph gets a constitution</b><span>One canonical path from org to source, product, variant, assignment, asset, publish projection, and readiness.</span></div></li>
    <li><time>May 22</time><div><b>Workflows learn DAM and PIM operations</b><span>The orchestrator reads from and writes into the content system through a typed Effect-based operation kernel.</span></div></li>
    <li><time>Jun 11</time><div><b>Risk-tiered quality gates</b><span>Edit, session, and ship gates keep feedback fast; an analytics command centre and a tool-owned coverage matrix ship.</span></div></li>
    <li><time>Jun 26</time><div><b>The catalog-health loop becomes executable</b><span>A detected product gap connects to a controlled action: AI fix, supplier request, Shopify sync, or channel export.</span></div></li>
    <li><time>Jul 4</time><div><b>The product points at activation</b><span>Catalog health leads the dashboard; named workflow recipes and drift-aware publish confirmation run on product selections.</span></div></li>
  </ol>
  <figcaption>Sixteen of the 48 milestones on the <a href="/projects/sirv-studio/build-record/">build record</a>, which dates each one to its commits. Tools became workflows, workflows grew a DAM and PIM, and supplier intake became governed publishing.</figcaption>
</figure>

## What it does

The product is organized around one loop: **ingest → fix → validate → review → publish → track**.

- **30+ AI tools** for product content — background removal and replacement, upscaling, lifestyle-shot generation, ghost mannequin, virtual try-on (image and video), alt text, product descriptions, image translation, image-to-3D, video generation — backed by 57 registered models routed through fal.ai, OpenAI, and OpenRouter.
- **A visual workflow orchestrator**: a drag-and-drop DAG builder with 40 registered step types, so a merchant can chain "remove background → generate lifestyle shot → write alt text → human review → push to Shopify" and run it across an entire catalog. Workflows execute on durable background jobs with pause/resume, review gates, and live progress, and can be triggered from the UI, the API, webhooks, or an AI agent.
- **A supplier portal**: brands give their suppliers an upload link or SFTP drop. Incoming files are validated against filename/SKU/spec rules, run through AI autofix, and routed into an approval queue — so supplier content goes through review instead of straight into the catalog.
- **Marketplace compliance built in**: an image-review tool validates against Amazon, eBay, Walmart, and Shopify listing rules — dimensions, backgrounds, watermarks, frame fill — and one-click autofix repairs what fails.
- **Asset and product management** (DAM + PIM) underneath it all — with search-by-image, duplicate detection, auto-tagging, and license tracking that can gate a publish — plus Stripe billing on top and integrations out the sides: Shopify, Zapier, n8n, a REST API, and MCP for AI agents.

<figure class="studio-visual studio-toolwall" aria-labelledby="studio-toolwall-title">
  <div class="studio-visual-head">
    <span id="studio-toolwall-title">the toolbox</span>
    <strong>34 tool routes · 57 models · counted from the code</strong>
  </div>
  <div class="studio-toolwall-grid">
    <div class="studio-toolwall-cat">
      <b>create</b>
      <span>image generation</span><span>SVG generation</span><span>video generation · up to 4K</span><span>image → 3D · GLB/OBJ/FBX/USDZ</span><span>AI fashion model</span><span>fashion video</span>
    </div>
    <div class="studio-toolwall-cat">
      <b class="is-green">edit</b>
      <span>background removal</span><span>background replace</span><span>object removal</span><span>prompt-based editing</span><span>upscaling · up to 8×</span><span>smart crop</span><span>shadows</span><span>ghost mannequin</span><span>color variants</span><span>depth maps</span><span>GLB optimizer</span>
    </div>
    <div class="studio-toolwall-cat">
      <b class="is-amber">product content</b>
      <span>lifestyle scenes · 44 presets</span><span>virtual try-on · image &amp; video</span><span>alt text</span><span>descriptions · 12+ languages</span><span>image translation</span><span>PDF translation</span><span>document summary</span><span>bundle composer</span><span>video captions</span>
    </div>
    <div class="studio-toolwall-cat">
      <b class="is-violet">automate &amp; govern</b>
      <span>batch · every tool, catalog-scale</span><span>orchestrator · 40 step types</span><span>AI routing</span><span>review gates &amp; autofix loops</span><span>marketplace optimizer</span><span>image review · Amazon/eBay/Walmart</span><span>webhooks · API · Zapier · n8n · MCP</span>
    </div>
    <div class="studio-toolwall-cat studio-toolwall-wide">
      <b>asset intelligence</b>
      <span>search by image</span><span>semantic search</span><span>find similar</span><span>duplicate detection</span><span>auto-tagging</span><span>smart collections</span><span>saved views</span><span>license tracking · publish gates</span><span>license alerts</span><span>watermark templates</span><span>asset &amp; search analytics</span>
    </div>
  </div>
  <figcaption>The toolbox, by category. Every chip is a shipped tool route or orchestrator capability; the models behind them route through fal.ai, OpenAI, and OpenRouter. The interface all of this lives in runs on the internal design system and virtualized data grid built by <a href="https://www.linkedin.com/in/max-wish/">Max Wish</a>.</figcaption>
</figure>

<img src="/images/studio/studio-products.webp" alt="Sirv AI Studio products view with per-product readiness scores" width="1345" height="1343" loading="lazy" decoding="async"/>

*The products view: every product scored for content readiness against its channel's requirements.*

## How it's built

The app is a TanStack Start + React 19 application (migrated off Next.js, running the React Compiler) built with Vite and deployed on Vercel. Data lives in PostgreSQL 17 behind Drizzle ORM, with 286 committed migrations in the July 24 snapshot. Background work runs on Inngest across sync, publishing, billing, imports, repair jobs, and workflow execution, self-hosted on Hetzner with a Patroni HA Postgres cluster behind it. Redis handles rate limiting, Sentry/PostHog/Grafana handle observability, and the repo contains 5,244 tracked test and spec files across unit, integration, contract, Storybook, and browser layers. Capacitor shells package it for iOS and Android. The infrastructure bill for all of this, at current capacity, is about $70 a month.

{{< studio-architecture >}}

Two teammates own critical pieces of this: [Max Wish](https://www.linkedin.com/in/max-wish/) built the internal design system and the custom virtualized data grid that powers the asset and product tables, and [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) built out the E2E/QA harness that keeps the velocity you'll read about below honest.

<img src="/images/studio/studio-assets-grid.webp" alt="Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table" width="1350" height="1338" loading="lazy" decoding="async"/>

*The assets table, running on the in-house virtualized data grid built by [Max Wish](https://www.linkedin.com/in/max-wish/) — live thumbnails, sortable metadata, virtualized rows. And near the top: `Herceg-Novi-bg.jpg`, the town where the bet was made.*

Three problems were harder than the rest.

## Publishing to someone else's store, safely

The scariest thing Studio does is write to a merchant's live Shopify catalog. The naive version of this feature silently overwrites a product edit the merchant made an hour ago — once, and they never trust the product again.

So publishing is built around **drift detection**: before writing, Studio compares when a product was last synced, when it changed in Shopify, and when it changed in Studio, and classifies every product as `in_sync`, `shopify_newer`, or `studio_newer`. If Shopify is newer — the merchant edited since the last sync — Studio won't blindly overwrite; the conflict is surfaced instead. A second reconciliation layer catches identity drift, like a source image that was deleted or replaced out from under a sync.

Writes themselves are versioned and idempotent: publishes go through explicit strategies (add alongside the original, replace, set featured, alt-text-only), every published asset keeps its version history with rollback, and an event outbox guarantees that a retried job can't double-publish. "Publish safely, roll back instantly" is the promise the whole layer is built to keep.

## Supplier uploads without the chaos

Every merchant with suppliers has the same intake problem: product content arrives by email and shared drives — named wrong, sized wrong, missing SKUs — and someone has to chase it into shape before it can go anywhere near the store.

Studio turns intake into a pipeline. Each supplier gets a scoped upload portal — a link, chunked batch upload, or an SFTP drop. Submissions are validated on arrival against filename patterns, SKU matching, gallery-slot requirements, and image specs. AI autofix repairs what can be repaired automatically. Everything then lands in an approval queue where the reviewer sees the product context, the shot list, and exactly which checks failed before accepting anything; rejected work goes back to the supplier with reasons. The approval boundary is enforced at the database layer — hardened guards make it structurally impossible for supplier content to skip review on its way to a live store.

The portal is also the one place on this page where demand has caught up with construction: it runs live with a real enterprise customer today, moving real supplier files through validation, review, and delivery.

<img src="/images/studio/studio-review-queue.webp" alt="Sirv AI Studio review queue with automated checks and AI autofix" width="1600" height="945" loading="lazy" decoding="async"/>

*The review queue — the human gate between supplier intake and a live store. Automated checks flag problems, AI autofix repairs them, a reviewer approves.*

## Making it operable by AI agents

Studio ships a production MCP server (published on npm, stdio and hosted HTTP transports) exposing **47 tools** — AI processing, asset search and management, product CRUD, Shopify sync, supplier-portal review — plus a published **64-operation OpenAPI surface** for ChatGPT-style integrations and conventional clients.

The design position: agents don't need raw endpoints, they need *operations inside a governed system*. So the agent surface gets the same context, permissions, approvals, budgets, and rollback as the UI. Auth is OAuth 2.0 with PKCE or API keys; every credit-spending or mutating tool re-authorizes server-side and fails closed if the workspace lacks entitlement; org scoping is validated against membership on every call; tools carry MCP safety annotations (read-only, destructive, idempotent) so agent runtimes can reason about blast radius. An agent can run a batch fix or execute a workflow — but it can't skip the review gate a human would hit.

## The commits are the boring number

Twelve thousand commits is the number people notice, and it's the least interesting one on this page. A commit is motion. The number that says something about software that writes to live stores and moves real money is the count of problems it was built to survive — and those are on the record too. For the last stretch of the project they're written down as plans: more than 900 of them now, nearly every one opening with a *Why this matters* paragraph that names the exact failure mode before a line changes, 261 tagged `bug`, ranked P0–P3 like any real backlog. Most are closed; a handful are still moving through the fleet — the plan is the paper trail either way. And the plans only reach back about a month: the first six months of hard problems live where they happened, in the git log and the changelog. A sampler from both, all real, each a trap a naive version walks straight into.

**Money, where the tolerance is zero.**

- **A two-phase charge that deducted nothing.** Tool jobs bill in two steps — reserve, then top up once the real cost is known — but both used an idempotency key derived from the job id alone, so the credit layer read the top-up as a replay and debited zero. The reconciliation you'd trust to catch it was blind: the wallet and the ledger agreed with each other, at the wrong number.
- **A ledger you couldn't rebuild a balance from.** The credit `transactions` table had no sign discipline — the same type written positive, negative, and zero, `REFUND` mapping to both — so `balance = sum(ledger)` was simply impossible, and a disputed balance couldn't be reconstructed. The fix is a canonical signed journal that reconciles by construction, shadow-run for a full billing cycle before cutover.
- **A free extra month on every upgrade.** Paying a mid-cycle proration invoice fired a Stripe `invoice.paid` webhook that fell through to the renewal path and granted a whole month of credits — and the invoice's brand-new id slipped straight past an idempotency key scoped to the invoice id. Full refills now fire only on true renewals.

**Writing into a store you don't own.**

- **Day 25, before there were users to lose.** The embedded Shopify app shipped its security with the MVP: HMAC-verified OAuth callbacks, an AES-256-GCM-encrypted state cookie, and mandatory session-token verification on the `x-shopify-shop` header, so nobody can pass someone else's store and act on it. (`fix: Shopify integration security hardening`, Dec 27, 2025.)
- **Out-of-order webhooks that resurrected the dead.** Per-event idempotency dedupes a redelivered event; it does nothing to order two different ones. An older `products/update` arriving after a `products/delete` re-created assets for a product the merchant had deleted. Fixed with per-product keys, staleness checks, and a delete tombstone.
- **A batch push that reported failure as success.** A partial failure fired the success path anyway — last toast wins — erasing the failed items, and a naive retry duplicated catalog images because Shopify's media API has no idempotency key. Every item now resolves to pushed, failed-and-retryable, pushed-with-warning, or indeterminate-don't-retry.

**The failures that raise no error.**

- **A dead-letter that reported success.** An outbox event that exhausted its ten retries returned a success value to the queue and alerted no one; a customer whose endpoint was down for a day lost every delivery, permanently and silently. The absence of an error was the bug.
- **The 1,000-step wall.** Inngest caps a run at 1,000 durable steps. The natural one-step-per-item batch design worked in dev, then hit the ceiling on the 100k-item production jobs — so the fan-out was restructured to two steps per 100-item chunk (`42k / 100 = 420 chunks × 2 = 840 steps`, under the cap). (`fix: reduce Inngest step count to stay under 1000 limit`, Dec 25, 2025.)
- **Uploads billed forever, invisible to quota.** A direct-to-R2 upload that was never confirmed left an object nobody tracked — unbounded storage billed to the org, absent from quota — and the obvious fix, a bucket expiry rule, would have deleted live assets sharing the same key prefix. Solved with app-level bookkeeping instead.

**Tenant walls and agent blast radius.**

- **A cross-tenant store hijack no single change caused.** Two individually-correct changes composed into it: one turned a fail-closed email collision into a fail-open reuse, the other left a synthetic store address registerable through public signup — so an attacker could pre-register it and have a real merchant's store bind into the attacker's org. Only adversarial review of the *composition* caught it.
- **A bulk delete that destroyed first, checked ownership second.** The destructive R2 delete ran against the asset ids the client posted — filtered by permission, never by org — before the org-scoped database delete ran. A user in one org could irrecoverably wipe another org's version history.
- **An `idempotentHint` that lied to agents.** Several credit-charging tools were annotated `idempotentHint: true`, telling an auto-retrying MCP client that repeating the call was free — so a transport timeout re-charged the customer and minted duplicate outputs, amplified across up to 100 images in the batch variants.
- **The account-linking default that hands over accounts.** `allowDangerousEmailAccountLinking` silently merges an OAuth login into any existing account with the same email — instant takeover if an attacker controls an unverified provider. Disabled in the first security pass, alongside an IDOR fix scoping payment queries by `user_id`. (`Fix 8 security vulnerabilities`, Dec 18, 2025.)

**Guardrails that caught what a review wouldn't.**

- **Isolation tests that proved nothing.** The tests asserting cross-tenant isolation stubbed `db.execute`, so the org `WHERE` clauses that actually enforce it had never once run in CI. Rewritten to execute the real SQL against two seeded orgs, including the case where org A asks for org B's asset and must get nothing back.
- **The money gate with zero real coverage.** The out-of-credits check — the workspace's entire payment boundary — was "tested" against a hardcoded rich user, so the branch that blocks a paid run never executed. A regression letting a zero-credit user fire a paid job would have shipped green.
- **A type guard that never ran.** A `satisfies AppSession` annotation meant to keep every Storybook story honest sat in a directory outside the typechecked project, so it never fired — and every story had quietly been rendering a "connected" user as disconnected.

None of this is the exotic part. It's the ordinary tax of software that touches money, live stores, and other people's data — the work that doesn't screenshot. It's also the honest answer to whether the throughput is real or just slop: the git log measures how much got written, and this measures what it had to get right.

## April, or: changing the wings mid-flight

By spring, Studio had outgrown its framework. The answer wasn't a rewrite branch that ships "next quarter" — it was a live migration of a production app, with users on it.

The log tells it plainly. April 2: the supplier portal ships. April 8: `Add TanStack Start bootstrap slice` — the Next.js → TanStack Start migration begins. April 9: 182 commits in one day, the largest day of the project at that point, mid-migration, with a compatibility shim keeping the old framework's imports alive while routes moved one by one. April 10: `build: remove final next runtime dependencies`. The runtime swap of a billing, multi-tenant, background-job-running platform took about seventy-two hours, and nothing froze. The same month carried 1,337 commits from me alone.

{{< studio-april >}}

A two-day framework migration isn't a typing achievement. It's what happens when the test suite is dense enough to catch every regression an automated refactor introduces, and the review gates are strict enough to trust the throughput. Which brings up the part of this story that's actually about method.

## How three people and a fleet ship this fast

The quietest month of the run — February, spent wiring billing, supplier intake, permissions, and the unglamorous plumbing that turns a demo into a business — still carried 316 of my commits. In the first 235 calendar days there were exactly five blank ones.

{{< commit-curve >}}

<figure class="studio-visual studio-snapshot" aria-labelledby="studio-snapshot-title">
  <div class="studio-visual-head">
    <span id="studio-snapshot-title">repository snapshot</span>
    <strong>dev @ 86a69aac · Jul 24, 2026</strong>
  </div>
  <div class="studio-snapshot-grid">
    <div class="studio-snapshot-card"><strong>11,950</strong><span>commits in the repo</span></div>
    <div class="studio-snapshot-card"><strong>8,317</strong><span>under my primary author identity</span></div>
    <div class="studio-snapshot-card"><strong>230 / 235</strong><span>calendar days with a commit</span></div>
    <div class="studio-snapshot-card"><strong>5,244</strong><span>tracked test and spec files</span></div>
    <div class="studio-snapshot-card"><strong>286</strong><span>Drizzle migrations</span></div>
    <div class="studio-snapshot-card"><strong>47</strong><span>tools in the MCP server</span></div>
  </div>
  <figcaption>A moving snapshot, not decorative numerology. The build record includes the exact command behind each count.</figcaption>
</figure>

At the July 24 snapshot, the core three account for **11,792 commits**: 8,317 mine, 2,748 from Veniamin, 727 from Max, and 158 more from other contributors, bots, and alternate identities. Raw commit volume isn't value — agent-heavy histories make it especially noisy — but the *shape* is worth explaining: output accelerated as the system around the agents matured. The explanation is the method: **I run a fleet of AI coding agents the way a lead runs a team.** And the fleet has real infrastructure, not vibes:

- **VibeQueue** — a task queue I built as a standalone product, with Veniamin adding its QA lanes — is the fleet's control plane. Agents claim work from it over MCP, check for duplicate tasks before opening new ones, and maintain todo checklists inside each task, the way an engineer works a ticket.
- **The clanker army** turns a reviewed plan into isolated worker worktrees, runs them in supervised batches, and converges the results — with a terminal dashboard, a supervisor for detached workers, and an autopilot that keeps pulling eligible tasks off the queue.
- **The agent roles live in the repo with written charters** — qa-lead, qa-explorer, qa-security-lead, perf-reviewer — the way a real team has job descriptions.
- **Sirvant**, the fleet's Slack-facing work partner, takes a bug report in plain English and dispatches disposable workers to reproduce and fix it. Slack is the cockpit; VibeQueue is the ledger.

<img src="/images/studio/studio-vibeq.webp" alt="VibeQueue dashboard showing who's working on what, the bug pipeline, and the coverage-matrix quality gate" width="1340" height="1314" loading="lazy" decoding="async"/>

*VibeQueue, live: who's working on what (the 164 open tasks are mine), stalled reviews flagged for attention, the bug pipeline by priority, hotspot domains — and the coverage-matrix gate at the bottom deciding whether work is allowed to ship.*

My job in that loop is editorial: specs before code, tests before behavior changes, a blocking quality gate on every stop, and adversarial review agents that try to break each change before it lands. Architecture, judgment, taste — and standing behind every line that ships.

The human layer is deliberately simple. We run daily branch ownership: one person owns the dev branch for the day and pushes to it directly — no pull requests, no review queue, no merge conflicts. A ten-minute morning sync, a handoff, and everyone stays in flow. The coordination ceremony that eats most teams' velocity simply isn't there. The internal team doc ends with the whole philosophy in six words: build fast, trust each other, ship often.

I wrote the broader argument behind this operating model in [Two theories of a programmer](/posts/two-theories-of-a-programmer/). This page keeps the claim grounded in the Studio evidence.

The evidence it's a system and not a slogan is in other people's curves. When Veniamin joined on QA, his weekly output ran near twenty commits while he built the harness — coverage matrix, anti-forgery checks, agent workflows. Two months later his weeks read 277, 309, 188. A fifteen-fold personal ramp inside one quarter isn't a person learning to type faster; it's infrastructure coming online and paying compound interest. Manual coding scales with hours. Fleet coding scales with the infrastructure you've built for the agents — and infrastructure compounds.

## The correction

Every number on this page measures supply. Commits, step types, MCP tools, migrations, test files, problems solved — all of it counts what got built. The closest thing to a demand number anywhere here is one clause in the audit below: the supplier portal is live with a real enterprise customer. That is the entire demand side of a twelve-thousand-commit page, and you probably noticed before I said it.

The repo's own July assessment is blunt: **we have shipped more than we have proved**.

The mechanism is worth writing down because it isn't really about me. When implementation gets cheap, the bottleneck moves — and it doesn't move somewhere convenient. Every surface here was nearly free to build and is permanently expensive to own: each one owes documentation, support answers, billing edges, browser proof, and a migration every time the schema shifts underneath it. That bill comes due in a currency the fleet doesn't print. Agents write code. They don't generate demand, and they will never tell you what to stop building.

So Q3 is a surface freeze — no new tools, channels, or step types without an explicit decision — and the same fleet is aimed at the unglamorous half: activation, onboarding, rollback proof, and walking real merchants from catalog scan to a first approved publish.

The velocity was never the hard part. Aiming it is.

## So is it any good?

Commit counts measure motion, not quality — a fair objection, so a week after writing this page I turned the fleet on the codebase itself. Ten reviewer agents in parallel, one per domain, read the code, schema, migrations, tests, and CI configuration — by then roughly 512K lines of hand-written TypeScript across 7,800 files and 162 database tables, with 4,751 tracked test and spec files by the next morning's repository snapshot — and Claude Fable compiled the reviews into a scorecard, then ran four file-level deep-dives to re-verify the heaviest findings. The calibration was explicit: 5 is a typical startup, 7 is solid production quality, 9+ is exceptional.

The verdict: **8.25 out of 10**.

One honesty note before the chart: ten reviewer agents from the same model family, reading the same repository with related instructions, are ten adversarial passes — not ten independent opinions. That is exactly why the deep-dives exist: every heavy finding was re-verified at file level before the score stood, and the scores below should be read as a rigorous self-audit, not a third-party benchmark.

{{< studio-scorecard >}}

The theme every reviewer independently landed on is the same one that explains the velocity chapter above: the guardrails are executable, not prose. Import-safety tests function as a machine-checked log of architecture decisions. The e2e coverage matrix refuses to count a flow as covered without a signed receipt from a real run. Org scoping is a static-analysis gate that fails pull requests. Tenancy is enforced by the schema itself, so cross-tenant data links are structurally impossible rather than merely discouraged. That apparatus is what lets fleet-scale output land at production quality — and the audit is the measurement of it.

The scorecard is just as plain about what keeps it off a 9: the PIM's back half is unfinished (variant editing, channel sync beyond Shopify), storage quotas still run in warn mode instead of enforce, and the tracked-but-tolerated debt — a few 2,000-line components, circular imports in the lib layer — is ratcheted but not blocked. Every one of those tracks left the audit with an executor-ready implementation plan, because that's the pipeline here: findings become plans, plans become fleet work.

Two findings stuck with me. First, when the deep-dives re-verified the audit's heaviest weaknesses, every re-checked claim turned out equal to or smaller than first reported — the scariest one, a supposedly divergent legacy billing path in the orchestrator, was dead code with zero production callers. The codebase was better than its own audit notes. Second, the economics line: the reviewers put comparable scope at 200+ engineer-months for a conventional team, and this took about ten — with no quality cliff between the domains I built solo and the ones with dedicated owners. That's the fleet claim from the previous section, measured.

---

Studio also carries the less glamorous machinery a production platform needs: exponential-backoff retries with jitter, per-operation circuit breakers on AI providers, content-based idempotency keys, Redis-backed rate limits, and restore-drilled database backups. That layer has no screenshots, but it's why the rest works.

<a href="https://www.sirv.studio" target="_blank">Try Sirv AI Studio →</a> · [Check the build record →](/projects/sirv-studio/build-record/)
