---
title: "Sirv AI Studio"
date: 2026-07-02
draft: false
featured: true
hero: true
project_url: "https://www.sirv.studio"
image: "/images/studio/studio-create-prompt.webp"
description: "An AI product-content platform for e-commerce — I created it and built the core end to end. Merchants scan their Shopify catalog, fix product content in AI batches, route supplier uploads through review, and publish safely with versioning and rollback."
hero_note: "30+ AI tools, a workflow orchestrator, a production MCP server and API platform for AI agents, supplier portals, Stripe billing, and the reliability infrastructure underneath."
tech_stack: ["React 19", "TanStack Start", "PostgreSQL", "Drizzle", "Inngest", "Stripe", "fal.ai"]
status: "active"
highlights:
  - "Creator & architect, first commit to production"
  - "30+ AI tools backed by 57 registered models"
  - "45-tool MCP server + API platform for AI agents"
  - "Safe Shopify publishing with drift detection and rollback"
weight: 1
---

Sirv AI Studio is an AI product-content platform for e-commerce teams. Merchants connect their Shopify store, scan the catalog for weak product content — missing alt text, poor images, thin descriptions — fix it in AI-powered batches, route supplier uploads through review, and publish back safely with versioning and rollback.

I created Studio and built it solo for its first several months, from `create-next-app` to a working platform. It's since grown into a small team effort, but the architecture and the core of the product — the AI tool layer, the workflow orchestrator, the supplier portal, the Shopify publishing pipeline, the MCP/agent platform, and the background-job infrastructure — are my work, first commit to production. This page is the build story.

## What it does

The product is organized around one loop: **ingest → fix → validate → review → publish → track**.

- **30+ AI tools** for product content — background removal and replacement, upscaling, lifestyle-shot generation, ghost mannequin, virtual try-on (image and video), alt text, product descriptions, image translation, image-to-3D, video generation — backed by 57 registered models routed through fal.ai, OpenAI, and OpenRouter.
- **A visual workflow orchestrator**: a drag-and-drop DAG builder with 36 step types, so a merchant can chain "remove background → generate lifestyle shot → write alt text → human review → push to Shopify" and run it across an entire catalog. Workflows execute on durable background jobs with pause/resume, review gates, and live progress, and can be triggered from the UI, the API, webhooks, or an AI agent.
- **A supplier portal**: brands give their suppliers an upload link or SFTP drop. Incoming files are validated against filename/SKU/spec rules, run through AI autofix, and routed into an approval queue — so supplier content goes through review instead of straight into the catalog.
- **Asset and product management** (DAM + PIM) underneath it all, with Stripe billing on top.

![Sirv AI Studio products view with per-product readiness scores](/images/studio/studio-products.webp)
*The products view: every product scored for content readiness against its channel's requirements.*

## How it's built

The app is a TanStack Start + React 19 application (migrated off Next.js, running the React Compiler) built with Vite and deployed on Vercel. Data lives in PostgreSQL 17 behind Drizzle ORM — 300+ migrations and counting. Background work runs on Inngest — 87 functions across sync, publishing, billing, imports, and workflow execution — self-hosted on Hetzner with a Patroni HA Postgres cluster behind it. Redis handles rate limiting, Sentry/PostHog/Grafana handle observability, and a 768-spec Playwright E2E suite runs against merchant, vendor, and mobile personas. Capacitor shells package it for iOS and Android.

Credit where it's due: the internal design system and the custom virtualized data grid that powers the asset and product tables were authored by my colleague Max Wish, and the E2E/QA governance suite is largely the work of our QA engineer. The rest — the architecture and the systems below — is mine.

![Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table](/images/studio/studio-assets-grid.webp)
*The assets table, running on the in-house virtualized data grid (built by Max Wish) — hundreds of rows of live thumbnails, statuses, and tags.*

Three problems were harder than the rest.

## Publishing to someone else's store, safely

The scariest thing Studio does is write to a merchant's live Shopify catalog. The naive version of this feature silently overwrites a product edit the merchant made an hour ago — once, and they never trust the product again.

So publishing is built around **drift detection**: before writing, Studio compares when a product was last synced, when it changed in Shopify, and when it changed in Studio, and classifies every product as `in_sync`, `shopify_newer`, or `studio_newer`. If Shopify is newer — the merchant edited since the last sync — Studio won't blindly overwrite; the conflict is surfaced instead. A second reconciliation layer catches identity drift, like a source image that was deleted or replaced out from under a sync.

Writes themselves are versioned and idempotent: publishes go through explicit strategies (add alongside the original, replace, set featured, alt-text-only), every published asset keeps its version history with rollback, and an event outbox guarantees that a retried job can't double-publish. "Publish safely, roll back instantly" is the promise the whole layer is built to keep.

## Supplier uploads without the chaos

Every merchant with suppliers has the same intake problem: product content arrives by email and shared drives — named wrong, sized wrong, missing SKUs — and someone has to chase it into shape before it can go anywhere near the store.

Studio turns intake into a pipeline. Each supplier gets a scoped upload portal — a link, chunked batch upload, or an SFTP drop. Submissions are validated on arrival against filename patterns, SKU matching, gallery-slot requirements, and image specs. AI autofix repairs what can be repaired automatically. Everything then lands in an approval queue where the reviewer sees the product context, the shot list, and exactly which checks failed before accepting anything; rejected work goes back to the supplier with reasons. The approval boundary is enforced at the database layer — hardened guards make it structurally impossible for supplier content to skip review on its way to a live store.

![Sirv AI Studio review queue with automated checks and AI autofix](/images/studio/studio-review-queue.webp)
*The review queue — the human gate between supplier intake and a live store. Automated checks flag problems, AI autofix repairs them, a reviewer approves.*

## Making it operable by AI agents

Studio ships a production MCP server (published on npm, stdio and hosted HTTP transports) exposing **45 tools** — AI processing, asset search and management, product CRUD, Shopify sync, supplier-portal review — plus an OpenAPI surface for ChatGPT-style integrations.

The design position: agents don't need raw endpoints, they need *operations inside a governed system*. So the agent surface gets the same context, permissions, approvals, budgets, and rollback as the UI. Auth is OAuth 2.0 with PKCE or API keys; every credit-spending or mutating tool re-authorizes server-side and fails closed if the workspace lacks entitlement; org scoping is validated against membership on every call; tools carry MCP safety annotations (read-only, destructive, idempotent) so agent runtimes can reason about blast radius. An agent can run a batch fix or execute a workflow — but it can't skip the review gate a human would hit.

---

Studio also carries the less glamorous machinery a production platform needs: exponential-backoff retries with jitter, per-operation circuit breakers on AI providers, content-based idempotency keys, Redis-backed rate limits, and restore-drilled database backups. That layer has no screenshots, but it's why the rest works.

<a href="https://www.sirv.studio" target="_blank">Try Sirv AI Studio →</a>

<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js?modules=lazyimage"></script>
