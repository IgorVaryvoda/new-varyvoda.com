---
title: "Anything an agent fleet can rebuild in a quarter is not a moat"
date: 2026-08-01
lastmod: 2026-09-23
draft: false
content_type: "Essay"
page_css: ["moat"]
description: "Studio took seven months to build. That made one product question unavoidable: which parts would still be difficult for a competitor to reproduce?"
ogImage: "https://www.varyvoda.com/images/posts/not-a-moat.jpg"
featuredImage: "/images/posts/not-a-moat.webp"
image_alt: "A row of repeated pale panels contrasts with deep irregular layers surrounding an amber core."
---

<p class="moat-meta">1 Aug 2026 · written from Studio strategy notes</p>

<p class="moat-standfirst">Sirv Studio includes a DAM, product data, supplier intake, workflows, an API and an MCP server. I built the first version of that scope in seven months. A competitor can use the same tools.</p>

## The quarterly rule

Fast implementation cuts both ways. A tool, screen or integration that took my agents a month can take another team a month too.

That led to one rule in Studio's strategy notes:

> **Anything an agent fleet can rebuild in a quarter is not a moat.**

Features still matter. Customers need the product to work. A feature list just won't protect the business for long.

What can protect it is anything that takes calendar time or other people's participation. None of what follows is proven yet. It's what Studio has to accumulate, and the rest of this post is how I plan to find out if it does.

## Apply the rule to Studio

<figure class="moat-figure">
  <div class="moat-split">
    <div class="moat-col moat-col--decay">
      <h4><span class="moat-dot" style="background:#e8b04b"></span>Copyable in quarters</h4>
      <ul>
        <li><strong>AI tool count</strong> Most tools call models available to competitors.</li>
        <li><strong>Workflow step types</strong> Useful, but straightforward to reproduce.</li>
        <li><strong>UI polish</strong> Necessary for sales and use, but visible to anyone.</li>
        <li><strong>MCP support</strong> A protocol implementation, not a lasting advantage.</li>
        <li><strong>Model access and prompts</strong> Mostly rented from the same vendors.</li>
      </ul>
    </div>
    <div class="moat-col moat-col--compound">
      <h4><span class="moat-dot" style="background:#54c98a"></span>Takes real time</h4>
      <ul>
        <li><strong>Operational history</strong> Approvals, publishes, rollbacks and supplier submissions.</li>
        <li><strong>Product relationships</strong> Assets, variants, channels and their current state.</li>
        <li><strong>Supplier participation</strong> People who already know and use the workflow.</li>
        <li><strong>Safety record</strong> A history of correct changes to live stores, still to be earned.</li>
        <li><strong>Direct distribution</strong> Customer relationships and channels the business controls.</li>
      </ul>
    </div>
  </div>
  <figcaption>The left side still has to be good. It just won't stop a competitor.</figcaption>
</figure>

## What takes time

**Operational history** answers questions a fresh competitor cannot answer. What was live during a sale? Who approved an image? Which supplier repeatedly fails the same check? That history only appears after people use the system.

**Product relationships** are valuable only when they stay accurate. If Studio's product and asset data drift from Shopify, the same data becomes a liability. That makes sync and drift detection real product work.

**Supplier participation** can create a network effect. A supplier who already serves several merchants through Studio makes the system easier for the next merchant to adopt. This works only if the supplier experience is fast and clear.

**A safety record** cannot be generated on demand. Any competitor can write "safe publishing" on a landing page. A history of correct publishes and tested rollbacks takes time. One destructive incident can damage it quickly.

**Direct distribution** gives the team time to keep building. Search rankings, store listings, customer relationships and referrals take longer to earn than a feature takes to copy.

## The decision it changed

The July action plan put a freeze on new tools, channels and workflow step types unless an exception was explicitly approved. It gave priority to getting ten merchants through a complete loop: connect a catalogue, run a fix, review the result and publish.

The same plan said to measure time to first approved publish and operator hours per merchant. Those two numbers say more about whether Studio is useful than any amount of code.

The cost was real. Features I wanted stayed on the list while the team did boring work: limits, onboarding and verification. And a freeze on paper only works if someone enforces it.

## Rules for product work

**Record history when the event happens.** Approval, lineage, supplier provenance and publish state belong in the data model. Missing history cannot be reconstructed later.

**Make export easy.** Customers should be able to leave with their data. The reason to stay should be the working system around that data, not fear of losing it.

**Prefer repeated use over another feature.** Ten merchants running the complete workflow every week creates more useful evidence than ten new tools nobody uses.

**Measure what is accumulating.** Every quarter, check if usage, history, supplier participation, safety and direct distribution grew.

| What to track | What it would test |
|---|---|
| Workspaces with 90-day history | Whether useful records accumulate through repeat use |
| Products under management | Whether product relationships remain useful at scale |
| Suppliers working across workspaces | Whether participation extends beyond one customer |
| Incident-free publish runs | Whether the safety claim survives repeated operation |
| Organic funnel entries | Whether distribution brings relevant users |

## Challenge each claim

These advantages are not permanent.

- Operational history can be attacked by better import tools.
- Product relationships can be replaced if Shopify exposes richer data.
- Supplier participation can move to a supplier-first competitor.
- Distribution can disappear after an algorithm change.
- The safety record can be damaged by our own mistake.

So I keep asking one question: if a competitor matched every feature tomorrow, why would a customer stay?

Right now, one enterprise supplier workflow runs on Studio in production. That's a start. The network effect, the retention and the safety record are still ahead of us.

_Related: [The programmer who stopped typing](/posts/two-theories-of-a-programmer/) and the [Sirv Studio case study](/projects/sirv-studio/)._
