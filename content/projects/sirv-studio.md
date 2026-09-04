---
title: "Sirv AI Studio"
date: 2026-07-02
lastmod: 2026-09-04
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
hero_note: "30+ AI tools, workflows, an MCP server and API for agents, supplier portals, Stripe billing, retries, idempotency, and rollback."
hero_kicker: "Built end to end"
hero_intro: "I started Sirv Studio in December 2025. Sirv now uses it to scan catalogs, run AI batches, review supplier uploads, and publish to Shopify."
hero_mark: "Product content"
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
  problem: "Keep AI-assisted product content correct from intake through publication"
  shipped: "Catalog scanning, AI batches, supplier portals, review, Shopify publishing, rollback, API and MCP"
  real_use: "Enterprise supplier workflow in production"
  team: "Igor, Veniamin and other contributors. Max Wish contributed substantially from March to June 2026."
  current_state: "Primary focus, actively evolving"
collaborators:
  - name: "Max Wish"
    url: "https://www.linkedin.com/in/max-wish/"
    contribution: "Made substantial contributions to the design system, virtualized data grid and asset interface from March to June 2026, including reusable grid packaging, column sizing and Sid-Kit components."
  - name: "Veniamin Krachun"
    url: "https://www.linkedin.com/in/veniamin-krachun/"
    contribution: "QA, including the testing and verification infrastructure."
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

Some coworkers were visiting me in Herceg Novi. Over a beer, we started talking about what current AI models could build. I said I would build the first version in a day.

The next morning I started at six. `Initial commit from Create Next App` landed at 6:35 on 2 December 2025. Background replacement worked by 8:00, virtual try-on by 8:23, and multi-angle product shots by 8:45. Auth, billing, rate limits, and Sirv storage landed before the 12:05 MVP merge. The afternoon added batch processing and side-by-side comparison. The repository records 31 commits that day.

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
  <figcaption>Six of the 31 first-day commits, with timestamps from the repository.</figcaption>
</figure>

Six days later, the workflow canvas existed. Durable Inngest jobs followed after twelve days, an MCP server after eighteen, and the embedded Shopify app after twenty-five. December closed at 602 commits. The main product areas were already visible.

I took Studio from that first commit to the production platform described here. [Max Wish](https://www.linkedin.com/in/max-wish/) made major contributions to the design system, virtualized data grid and asset interface from March to June 2026. [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) built QA and verification infrastructure. The separate [build record](/projects/sirv-studio/build-record/) has 48 dated milestones and the commands behind its repository counts.

<figure class="studio-visual studio-timeline" aria-labelledby="studio-timeline-title">
  <div class="studio-visual-head">
    <span id="studio-timeline-title">what shipped, in order</span>
    <strong>Dec 2, 2025 → Jul 2026 · condensed from 48 milestones</strong>
  </div>
  <ol>
    <li><time>Dec 2</time><div><b>A product before lunch</b><span>Image tools, auth, billing, rate limits, Sirv storage, batch mode, and compare mode all land on day one.</span></div></li>
    <li><time>Dec 18</time><div><b>Durable jobs and the first MCP server</b><span>Long runs move to Inngest and stream progress. Agents get a dedicated tool surface.</span></div></li>
    <li><time>Dec 27</time><div><b>Five entry surfaces in four days</b><span>Shopify, Zapier, n8n, MCP OAuth, and the OpenAI Apps SDK can start the same work.</span></div></li>
    <li><time>Jan 20</time><div><b>The asset library lands in a day</b><span>Assets, tags, filters, R2 storage, product links, and operation history form the DAM.</span></div></li>
    <li><time>Jan 26</time><div><b>Multi-org, roles, and share links</b><span>Nested collections, role-based access, and subfolder share navigation turn the library into a team product.</span></div></li>
    <li><time>Feb 3</time><div><b>The first supplier portal</b><span>Scoped upload links, an approval queue, and before-and-after autofix review turn intake into a defined process.</span></div></li>
    <li><time>Feb 16</time><div><b>SFTP, SAP, catalog import, live Shopify sync</b><span>Supplier delivery and product edits flow in through retry-safe GraphQL handling.</span></div></li>
    <li><time>Mar 7</time><div><b>A real supplier spec, proven end to end</b><span>The Alkosto pipeline drives reusable validation, product assignment, autofix, review, and delivery.</span></div></li>
    <li><time>Mar 19</time><div><b>Imports and side-effects go durable</b><span>Cancellable background jobs and an event outbox, so a retry can't casually duplicate work.</span></div></li>
    <li><time>Apr 9</time><div><b>Next.js replaced in 72 hours, live</b><span>The billing, multi-tenant application moves route by route to TanStack Start while users remain on it.</span></div></li>
    <li><time>Apr 28</time><div><b>Workflows gain real triggers</b><span>Uploads, schedules, product changes, and authenticated webhooks start runs, with dry-runs and attempt history.</span></div></li>
    <li><time>May 15</time><div><b>One product-content data path</b><span>A documented path from org to source, product, variant, assignment, asset, publish projection, and readiness.</span></div></li>
    <li><time>May 22</time><div><b>Workflows learn DAM and PIM operations</b><span>The orchestrator reads from and writes into the content system through a typed Effect-based operation kernel.</span></div></li>
    <li><time>Jun 11</time><div><b>Risk-tiered quality gates</b><span>Edit, session, and release gates are joined by an analytics dashboard and a coverage matrix checked by tooling.</span></div></li>
    <li><time>Jun 26</time><div><b>The catalog-health loop becomes executable</b><span>A detected product gap connects to a controlled action: AI fix, supplier request, Shopify sync, or channel export.</span></div></li>
    <li><time>Jul 4</time><div><b>The product points at activation</b><span>Catalog health leads the dashboard. Workflow recipes and drift-aware publishing run on selected products.</span></div></li>
  </ol>
  <figcaption>Sixteen of the 48 milestones on the <a href="/projects/sirv-studio/build-record/">build record</a>, which dates each one to its commits. Tools became workflows, workflows grew a DAM and PIM, and supplier intake gained review and publishing.</figcaption>
</figure>

## What it does

The product is organized around one loop: **ingest → fix → validate → review → publish → track**.

- **30+ AI tools** for background work, upscaling, lifestyle images, ghost mannequin, virtual try-on, alt text, descriptions, translation, 3D, and video. The snapshot contains 57 registered models routed through fal.ai, OpenAI, and OpenRouter.
- **A visual workflow orchestrator**: a drag-and-drop DAG builder with 40 registered step types, so a merchant can chain "remove background → generate lifestyle shot → write alt text → human review → push to Shopify" and run it across an entire catalog. Workflows execute on durable background jobs with pause/resume, review gates, and live progress, and can be triggered from the UI, the API, webhooks, or an AI agent.
- **A supplier portal** gives brands a scoped upload link or SFTP drop. Files are checked against filename, SKU, and image rules, sent through AI autofix, and held for review before they can reach the catalog.
- **Marketplace checks** validate dimensions, backgrounds, watermarks, and frame fill against Amazon, eBay, Walmart, and Shopify rules. Autofix can repair some failures.
- **Asset and product management** adds search by image, duplicate detection, auto-tagging, and licence tracking that can block a publish. Integrations include Shopify, Zapier, n8n, a REST API, and MCP.

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
      <b class="is-violet">automate &amp; review</b>
      <span>batch · every tool, catalog-scale</span><span>orchestrator · 40 step types</span><span>AI routing</span><span>review gates &amp; autofix loops</span><span>marketplace optimizer</span><span>image review · Amazon/eBay/Walmart</span><span>webhooks · API · Zapier · n8n · MCP</span>
    </div>
    <div class="studio-toolwall-cat studio-toolwall-wide">
      <b>asset intelligence</b>
      <span>search by image</span><span>semantic search</span><span>find similar</span><span>duplicate detection</span><span>auto-tagging</span><span>smart collections</span><span>saved views</span><span>license tracking · publish gates</span><span>license alerts</span><span>watermark templates</span><span>asset &amp; search analytics</span>
    </div>
  </div>
  <figcaption>Every chip is a shipped route or workflow capability. Models are routed through fal.ai, OpenAI, and OpenRouter. <a href="https://www.linkedin.com/in/max-wish/">Max Wish</a> made substantial contributions to the design system and virtualized data grid used by the interface.</figcaption>
</figure>

<img src="/images/studio/studio-products.webp" alt="Sirv AI Studio products view with per-product readiness scores" width="1345" height="1343" loading="lazy" decoding="async"/>

*The products view: every product scored for content readiness against its channel's requirements.*

## How it's built

The app is a TanStack Start + React 19 application (migrated off Next.js, running the React Compiler) built with Vite and deployed on Vercel. Data lives in PostgreSQL 17 behind Drizzle ORM, with 286 committed migrations in the July 24 snapshot. Background work runs on Inngest across sync, publishing, billing, imports, repair jobs, and workflow execution, self-hosted on Hetzner with a Patroni HA Postgres cluster behind it. Redis handles rate limiting, Sentry/PostHog/Grafana handle observability, and the repo contains 5,244 tracked test and spec files across unit, integration, contract, Storybook, and browser layers. Capacitor shells package it for iOS and Android. The infrastructure bill for all of this, at current capacity, is about $70 a month.

{{< studio-architecture >}}

[Max Wish](https://www.linkedin.com/in/max-wish/) helped build the internal design system and custom virtualized data grid behind the asset and product tables. His commits include extracting a reusable grid package, fixing column auto-fit sizing and refining Sid-Kit components. Development continued after his June contributions: September commits from me and other contributors cover scroll performance, accessibility and dependency updates. [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) built the E2E and QA systems used to verify releases.

<img src="/images/studio/studio-assets-grid.webp" alt="Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table" width="1350" height="1338" loading="lazy" decoding="async"/>

*The assets table uses the shared virtualized data grid for live thumbnails, sortable metadata, and large result sets. [Max Wish](https://www.linkedin.com/in/max-wish/) made substantial contributions to its development.*

Three problems were harder than the rest.

## Publishing to someone else's store, safely

Studio writes to live Shopify catalogs. A publish must not overwrite a newer merchant edit.

Before writing, Studio compares the last sync with changes in Shopify and Studio. Each product is classified as `in_sync`, `shopify_newer`, or `studio_newer`. If Shopify is newer, Studio surfaces the conflict instead of overwriting it. Reconciliation also catches a source image that was deleted or replaced after the last sync.

Writes themselves are versioned and idempotent: publishes go through explicit strategies (add alongside the original, replace, set featured, alt-text-only), every published asset keeps its version history with rollback, and an event outbox guarantees that a retried job can't double-publish. "Publish safely, roll back instantly" is the promise the whole layer is built to keep.

## Supplier uploads without the chaos

Supplier files often arrive by email or shared drive with wrong names, dimensions, or missing SKUs. Somebody then has to prepare them for the store.

Each supplier gets a scoped upload portal, chunked batch upload, or SFTP drop. Studio checks filename patterns, SKU matches, gallery slots, and image rules. AI autofix repairs supported failures. A reviewer sees the product, shot list, and failed checks before accepting or rejecting the submission. Database guards stop supplier content from skipping review on its way to a live store.

This supplier workflow is in production with an enterprise customer.

<img src="/images/studio/studio-review-queue.webp" alt="Sirv AI Studio review queue with automated checks and AI autofix" width="1600" height="945" loading="lazy" decoding="async"/>

*The review queue holds supplier files before publication. Automated checks flag problems, autofix repairs supported failures, and a reviewer approves the result.*

## Making it operable by AI agents

Studio ships a production MCP server with stdio and hosted HTTP transports. The snapshot exposes **47 tools** for AI processing, asset management, product changes, Shopify sync, and supplier review. A published OpenAPI surface contains **64 operations**.

Agents receive the same permissions, approvals, budgets, and rollback rules as the UI. Authentication uses OAuth 2.0 with PKCE or API keys. Mutating and credit-spending tools check authorisation on the server. Every call validates organisation membership, and MCP annotations identify read-only, destructive, and idempotent operations. An agent can run a batch or workflow, but it cannot skip a required review.

## What the code had to survive

The repository count is large, but commits alone say little about quality. The stronger evidence is in the failure cases. More than 900 written plans now record why a change matters, how it should work, and how it will be checked. The earlier record lives in the git log and changelog. These are examples from both.

**Money, where the tolerance is zero.**

- **A two-phase charge that deducted nothing.** Tool jobs bill in two steps: reserve, then top up once the real cost is known. Both used an idempotency key derived from the job ID, so the credit layer treated the top-up as a replay and debited zero. The wallet and ledger agreed on the wrong number.
- **A ledger that could not rebuild a balance.** The credit `transactions` table allowed the same type to be positive, negative, or zero. `REFUND` also mapped to both signs. A disputed balance could not be reconstructed. A signed journal now enforces the direction of every entry and will run beside the old system for a full billing cycle before cutover.
- **A free extra month on every upgrade.** A mid-cycle proration invoice fell through to the renewal path and granted a full month of credits. Full refills now run only on true renewals.

**Writing into a store you don't own.**

- **Day 25, before there were users to lose.** The embedded Shopify app shipped its security with the MVP: HMAC-verified OAuth callbacks, an AES-256-GCM-encrypted state cookie, and mandatory session-token verification on the `x-shopify-shop` header, so nobody can pass someone else's store and act on it. (`fix: Shopify integration security hardening`, Dec 27, 2025.)
- **Out-of-order webhooks restored deleted products.** Per-event idempotency handles a repeated event, but it does not order two different events. An older `products/update` arriving after `products/delete` re-created assets. Per-product keys, staleness checks, and a delete tombstone fixed it.
- **A batch push reported failure as success.** A partial failure still fired the success path and removed the failed items from view. A retry then duplicated catalog images because Shopify's media API has no idempotency key. Every item now finishes as pushed, retryable failure, pushed with warning, or indeterminate and unsafe to retry.

**The failures that raise no error.**

- **A dead letter reported success.** An outbox event exhausted ten retries, returned success to the queue, and alerted nobody. A customer endpoint that stayed down for a day lost every delivery. The missing error was the bug.
- **The 1,000-step limit.** Inngest caps a run at 1,000 durable steps. One step per item worked in development, then failed on large production jobs. The fan-out now uses two steps per 100-item chunk. A 42,000-item job takes 840 steps.
- **Unconfirmed uploads escaped quota.** A direct R2 upload that was never confirmed left an untracked object billed to the organisation. A bucket expiry rule would also have deleted live assets sharing the prefix, so the cleanup uses application-level bookkeeping.

**Tenant isolation and agent permissions.**

- **A cross-tenant store hijack appeared across two changes.** One change reused an account after an email collision. Another left a synthetic store address available through public signup. Together, they let an attacker bind a merchant's store to the wrong organisation. Review of the combined changes caught it.
- **A bulk delete checked ownership too late.** The R2 delete used client-posted asset IDs before the organisation-scoped database delete ran. A user in one organisation could delete another organisation's version history.
- **An `idempotentHint` misled agents.** Several credit-charging tools claimed retries were safe. A transport timeout could therefore charge again and create duplicate outputs across batches of up to 100 images.
- **A dangerous account-linking default.** `allowDangerousEmailAccountLinking` merged an OAuth login into an existing account with the same email. It was disabled in the first security pass, together with an IDOR fix that scoped payment queries by `user_id`.

**Checks that caught bad code.**

- **Isolation tests that proved nothing.** The tests asserting cross-tenant isolation stubbed `db.execute`, so the org `WHERE` clauses that actually enforce it had never once run in CI. Rewritten to execute the real SQL against two seeded orgs, including the case where org A asks for org B's asset and must get nothing back.
- **The money gate had no real coverage.** The out-of-credits check used a hardcoded funded user, so the branch that blocks a paid run never executed in the test.
- **A type guard never ran.** A `satisfies AppSession` annotation sat outside the typechecked project. Storybook had been rendering a connected user as disconnected without failing CI.

This is normal production work for software that touches money, stores, and customer data. The git log measures output. These incidents show some of the correctness work behind it.

## Replacing the framework in production

By spring, Studio had outgrown Next.js. I moved the production application to TanStack Start while users remained on it.

The supplier portal shipped on 2 April. The first TanStack Start slice landed on 8 April. On 9 April, a compatibility shim kept old imports working while routes moved one by one. The final Next.js runtime dependencies were removed on 10 April. The migration took about 72 hours without freezing other work.

{{< studio-april >}}

The migration depended on broad tests, route-by-route checks, and review gates. Fast edits would not have been enough without them.

## How three people and a fleet ship this fast

February was the quietest month. It focused on billing, supplier intake, permissions, and other production work, and still contained 316 of my commits. In the first 235 calendar days, five had no commit.

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

At the 24 July snapshot, the core three account for **11,792 commits**: 8,317 mine, 2,748 from Veniamin, 727 from Max, and 158 from other contributors, bots, and alternate identities. Commit volume is not value. The relevant observation is that output increased after the agent workflow became more structured.

- **VibeQ** holds human and agent tasks. Agents claim work through MCP, check for duplicates, and update the task as they work.
- **The Clanker Army** turns reviewed plans into isolated worktrees and runs them in supervised batches.
- **Agent roles** such as QA lead, security lead, and performance reviewer have written instructions in the repository.
- **Sirvant** accepts a Slack request and can dispatch a disposable worker to investigate or implement it.

<img src="/images/studio/studio-vibeq.webp" alt="VibeQueue dashboard showing who's working on what, the bug pipeline, and the coverage-matrix quality gate" width="1340" height="1314" loading="lazy" decoding="async"/>

*VibeQ shows active work, stalled reviews, bug priority, product hotspots, and the coverage gate used before release.*

My work in that loop is to set scope, approve plans, use the product, review evidence, and decide what ships. Behaviour changes need tests, and every release passes a blocking quality gate.

One person owns the development branch each day and pushes to it directly. A short morning sync and handoff replace an internal pull-request queue. This works because branch ownership is explicit and the automated checks are blocking.

I wrote the broader argument behind this operating model in [Two theories of a programmer](/posts/two-theories-of-a-programmer/). This page keeps the claim grounded in the Studio evidence.

When Veniamin joined QA, his weekly output was near twenty commits while he built the coverage matrix, anti-forgery checks, and agent workflows. Two months later, the weekly counts were 277, 309, and 188. The increase followed the QA system, not a change in typing speed.

## The correction

Most numbers on this page measure what was built. The supplier portal running with an enterprise customer is the clearest evidence of real demand.

The repo's own July assessment is blunt: **we have shipped more than we have proved**.

Fast implementation created more features than the team had proved it needed. Every feature adds documentation, support, billing cases, browser checks, and migration work. Agents can produce code, but they do not create demand or decide what should be removed.

Q3 therefore froze new tools, channels, and workflow steps unless approved explicitly. Work moved to activation, onboarding, rollback proof, and helping merchants reach a first approved publish.

Building quickly is no longer the main problem. Choosing what to build is.

## So is it any good?

I also ran a structured self-audit. Ten reviewer agents, one per domain, inspected the code, schema, migrations, tests, and CI configuration. The repository then contained roughly 512,000 lines of handwritten TypeScript, 7,800 files, 162 database tables, and 4,751 test and spec files. Claude Fable combined the reports and rechecked the largest findings at file level. The scoring guide treated 5 as typical startup quality, 7 as solid production quality, and 9 or above as exceptional.

The verdict: **8.25 out of 10**.

These were ten passes from one model family, not ten independent opinions. The result is a self-audit, not an external benchmark. Larger findings were checked again against the files before scoring.

{{< studio-scorecard >}}

The strongest areas use executable checks. Import-safety tests protect architecture boundaries. The E2E coverage matrix requires a signed result from a real run. Static analysis checks organisation scoping, and the schema prevents cross-tenant links.

The audit also identified unfinished variant editing, limited channel sync beyond Shopify, storage quotas still in warning mode, several 2,000-line components, and circular imports in the library layer. Each confirmed finding received an implementation plan.

Rechecking reduced several findings. One suspected legacy billing path had no production callers. The reviewers also estimated that comparable scope would require more than 200 engineer-months in a conventional team. That estimate is directional, but it gives context for the roughly ten months spent here.

---

Studio also has exponential-backoff retries with jitter, per-operation circuit breakers on AI providers, content-based idempotency keys, Redis-backed rate limits, and restore-drilled database backups. They have no screenshots, but the product depends on them.

<a href="https://www.sirv.studio" target="_blank">Try Sirv AI Studio →</a> · [Check the build record →](/projects/sirv-studio/build-record/)
