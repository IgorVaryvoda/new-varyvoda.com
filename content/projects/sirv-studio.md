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
hero_note: "Supplier intake, image processing, review and controlled publishing, with an API and MCP surface for agents."
hero_kicker: "Built end to end"
hero_intro: "I built Sirv Studio to prepare product content for stores. An enterprise supplier workflow now uses its intake, checks and review in production."
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
  - label: "The supplier workflow"
    href: "#the-supplier-workflow"
  - label: "Day one"
    href: "#it-started-over-a-beer"
  - label: "Architecture"
    href: "#how-its-built"
  - label: "Publishing"
    href: "#publishing-to-someone-elses-store"
  - label: "Incidents"
    href: "#what-the-code-had-to-survive"
  - label: "The correction"
    href: "#the-correction"
tech_stack: ["React 19", "TanStack Start", "PostgreSQL", "Drizzle", "Inngest", "Stripe", "fal.ai"]
role: "Creator, product lead, architect and principal engineer"
stewardship:
  state: "primary-focus"
  note: "My main product. I spend most of my product, engineering, and commercial time on it."
last_tended: "2026-09-04"
feedback_url: "/contact/?project=sirv-studio&type=bug"
proof:
  - value: "Production"
    label: "Enterprise supplier workflow"
  - value: "Dec 2025"
    label: "First working version"
summary:
  problem: "Keep AI-assisted product content correct from intake through publication"
  shipped: "Catalog scanning, AI batches, supplier portals, review, Shopify publishing, rollback, API and MCP"
  real_use: "Enterprise supplier workflow in production"
  team: "Igor, Max, Veniamin"
  current_state: "Primary focus, actively evolving"
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
  - "MCP server and API for agent workflows"
  - "Safe Shopify publishing with drift detection and rollback"
weight: 1
---

## The supplier workflow

An enterprise supplier workflow is the clearest evidence that Sirv Studio solves a real problem. Suppliers send product files through a scoped portal or SFTP drop. Studio checks them, prepares supported fixes and holds the result for review before delivery.

The work used to begin with a folder of images and questions: which product does this belong to, is the filename right, does it meet the image specification and who accepted it? Studio puts that information beside the submission. A reviewer can see the product, expected shots and failed checks before deciding what goes forward.

I conceived Studio and built it from the first commit. [Max Wish](https://www.linkedin.com/in/max-wish/) owns major work across the design system and virtualized data grid. [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) owns QA and its verification infrastructure.

<img src="/images/studio/studio-review-queue.webp" alt="Sirv Studio review queue with automated checks and AI autofix" width="1600" height="945" loading="lazy" decoding="async"/>

*Supplier review in Studio. Automated checks flag problems, supported autofixes prepare a result and a reviewer decides whether to accept it.*

That production workflow is evidence of use. It does not prove that every integration, launch route or recovery case is ready. Those need their own checks.

## It started over a beer

Some coworkers were visiting me in Herceg Novi. Over a beer, we started talking about what current AI models could build. I said I would build the first version in a day.

The next morning I started at six. `Initial commit from Create Next App` landed at 6:35 on 2 December 2025. Background replacement worked by 8:00, virtual try-on by 8:23 and multi-angle product shots by 8:45. Auth, billing, rate limits and Sirv storage landed before the 12:05 MVP merge. The afternoon added batch processing and side-by-side comparison. The repository records 31 commits that day.

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

The supplier portal came later. Its first implementation is recorded on 2 February 2026, alongside the approval queue, with autofix work following across 2 and 3 February. April was further development of an existing supplier system, not its first appearance.

The [build record](/projects/sirv-studio/build-record/) keeps the detailed chronology, dated repository counts and counting method. Its July snapshot remains a historical record.

## What it does

Studio connects image work to products and the people who approve them. A batch can remove backgrounds, prepare lifestyle shots or write alt text. A workflow connects those operations to review and publishing. The asset library keeps the files attached to their products instead of leaving another folder of exports to sort out.

A supplier request can start with the missing content in a catalogue. A merchant can review the submitted result and decide where it belongs. API and MCP clients can start supported work too, subject to server-side permissions and the review requirements of that path.

<img src="/images/studio/studio-products.webp" alt="Sirv Studio products view with per-product content readiness scores" width="1345" height="1343" loading="lazy" decoding="async"/>

*The products view connects content gaps to the product that needs work.*

## How it's built

Studio uses TanStack Start and React, PostgreSQL with Drizzle, and Inngest for durable background work. Jobs handle imports, processing, sync and publishing. Storage and delivery integrate with Sirv. The product has a browser interface, an API and MCP tools.

{{< studio-architecture >}}

The data grid matters because people need to inspect many assets without losing their place. The job system matters because processing a catalogue takes longer than a browser request. Permissions matter because a supplier, reviewer and merchant should not have the same authority over a store.

<img src="/images/studio/studio-assets-grid.webp" alt="Sirv Studio virtualized asset table with thumbnails and metadata" width="1350" height="1338" loading="lazy" decoding="async"/>

*The asset table uses the design system and virtualized grid developed with Max.*

In April I moved the application from Next.js to TanStack Start while users remained on it. The first slice landed on 8 April, a compatibility shim kept old imports working on 9 April and the final Next.js runtime dependencies were removed on 10 April. Routes moved separately while other work continued.

{{< studio-april >}}

The migration depended on route checks and tests. The speed of the edits alone would not have made it safe.

## Publishing to someone else's store

A file that passed review is not automatically safe to publish. The merchant may have edited the product since Studio last read it. The app may have been disconnected. A previous request may have succeeded even though its response was lost.

Studio tracks publish plans, runs and receipts. It checks for drift and uses explicit operations such as adding media, replacing it or changing alt text. Retry handling must consider the state of the earlier operation before issuing another mutation. An outbox helps deliver work reliably, but does not by itself prove what Shopify accepted.

September changes add an entitlement check close to the actual mutation and expose recent publish receipt status. The [publishing field note](/posts/before-an-ai-image-reaches-a-store/) explains why those checks belong there.

The new real-store audit requires observations from Shopify for the exact deployed candidate. A Studio receipt alone is insufficient. The procedure exists in the repository. This page does not claim that its full test floor has been completed.

## What the code had to survive

Three failures explain the work better than a tool count.

**A two-phase charge deducted nothing at the second step.** A job reserved credits, then topped up when its real cost was known. Both steps used an idempotency key derived from the job ID. The credit layer treated the top-up as a replay and debited zero. The wallet and ledger could agree on the wrong number.

**Out-of-order webhooks restored deleted products.** Rejecting duplicate events did not order two different events. Handling a repeated event and rejecting an older event are separate requirements.

**A publishing result needed an external check.** A receipt records what Studio believes happened. The real-store audit now pairs the internal identifiers with a fresh product-media read from Shopify. That is how a test can distinguish a correct internal report from the state the merchant actually sees.

These are different failure classes. None is covered by saying that the repository has many tests.

## How the work is organised

[VibeQ](/projects/vibeq/) records human and agent tasks, branches and review evidence. Repo-local orchestration runs accepted plans in isolated worktrees. Reviewers check the plan and the resulting change. I set scope, use the product and decide what is ready to ship.

The current system is described in [improve-codex](/posts/improve-codex/). Historical commit curves belong in the [build record](/projects/sirv-studio/build-record/), where their date and method are visible.

## The correction

The July assessment said we had shipped more than we had proved. Its response was a plan to restrict new surface area and get ten merchants through a complete, approved publishing loop. Ten was a target, not an adoption result.

More features meant more documentation, support, billing cases, browser checks and migration work. I wanted the next evidence to be a merchant completing useful work, with the operator effort and recovery path understood.

That is still the useful standard for this page. The enterprise supplier workflow is in production. Broader activation and publishing claims need their own observed results.

[Open Sirv Studio](https://www.sirv.studio) · [Read the dated build record](/projects/sirv-studio/build-record/)
