---
title: "Anything an agent fleet can rebuild in a quarter is not a moat"
date: 2026-08-01
lastmod: 2026-09-04
draft: false
content_type: "Essay"
page_css: ["moat"]
description: "Studio took seven months to build. That made one product question unavoidable: which parts would still be difficult for a competitor to reproduce?"
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
---

<p class="moat-meta">1 Aug 2026 · written from Studio strategy notes</p>

<p class="moat-standfirst">Sirv Studio includes a DAM, product data, supplier intake, workflows, an API, and an MCP server. I built the first version of that scope in seven months. A competitor can use the same tools.</p>

## The quarterly rule

Fast implementation is useful, but it weakens features as a defence. A tool, screen, or integration that took my agents a month can take another team a month too.

That led to one rule in Studio's strategy notes:

> **Anything an agent fleet can rebuild in a quarter is not a moat.**

The rule does not mean features are unimportant. Customers still need the product to work well. It means a feature list does not protect the business for long.

Some things still take calendar time or participation from other people. Those are candidates for a lasting advantage. The list below describes what Studio could accumulate, not advantages already demonstrated by adoption.

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
        <li><strong>Operational history</strong> Approvals, publishes, rollbacks, and supplier submissions.</li>
        <li><strong>Product relationships</strong> Assets, variants, channels, and their current state.</li>
        <li><strong>Supplier participation</strong> People who already know and use the workflow.</li>
        <li><strong>Safety record</strong> A history of correct changes to live stores, still to be earned.</li>
        <li><strong>Direct distribution</strong> Customer relationships and channels the business controls.</li>
      </ul>
    </div>
  </div>
  <figcaption>The left side still has to be good. It just should not be mistaken for protection from competitors.</figcaption>
</figure>

## What takes time

**Operational history** answers questions a fresh competitor cannot answer. What was live during a sale? Who approved an image? Which supplier repeatedly fails the same check? That history only appears after people use the system.

**Product relationships** are valuable only when they stay accurate. If Studio's product and asset data drift from Shopify, the same data becomes a liability. Sync integrity and drift detection are product work, not background housekeeping.

**Supplier participation** can create a network effect. A supplier who already serves several merchants through Studio makes the system easier for the next merchant to adopt. This works only if the supplier experience is fast and clear.

**A safety record** cannot be generated on demand. Any competitor can write "safe publishing" on a landing page. A history of correct publishes and tested rollbacks takes time. One destructive incident can damage it quickly.

**Direct distribution** gives the team time to keep building. Search rankings, store listings, customer relationships, and referrals take longer to earn than a feature takes to copy.

## The decision it changed

The July action plan put a freeze on new tools, channels and workflow step types unless an exception was explicitly approved. It gave priority to getting ten merchants through a complete loop: connect a catalogue, run a fix, review the result and publish.

Ten merchants was the target, not a result I had already achieved. The same plan called for measuring time to first approved publish and operator hours per merchant. Those numbers could tell us whether the product was useful without using code volume as a substitute.

The cost of that decision was leaving possible features on the list while completing less visible work: limits, onboarding and verification. A written freeze also needs enforcement. It is not evidence that every later change followed it.

## Rules for product work

**Record history when the event happens.** Approval, lineage, supplier provenance, and publish state belong in the data model. Missing history cannot be reconstructed later.

**Make export easy.** Customers should be able to leave with their data. The reason to stay should be the working system around that data, not fear of losing it.

**Prefer repeated use over another feature.** Ten merchants running the complete workflow every week creates more useful evidence than ten new tools nobody uses.

**Measure what is accumulating.** The proposed measures ask whether usage, history, supplier participation, safety and direct distribution improved during the quarter. They describe what to track, not measured results on this page.

| What to track | What it would test |
|---|---|
| Workspaces with 90-day history | Whether useful records accumulate through repeat use |
| Products under management | Whether product relationships remain useful at scale |
| Suppliers working across workspaces | Whether participation extends beyond one customer |
| Incident-free publish runs | Whether the safety claim survives repeated operation |
| Organic funnel entries | Whether distribution brings relevant users |

This dashboard illustrates the measurement plan. It is not a live report of customer adoption.

## Challenge each claim

These advantages are not permanent.

- Operational history can be attacked by better import tools.
- Product relationships can be replaced if Shopify exposes richer data.
- Supplier participation can move to a supplier-first competitor.
- Distribution can disappear after an algorithm change.
- The safety record can be damaged by our own mistake.

The response is not to call everything a moat. It is to keep asking what would make a customer stay after a competitor matches the feature list.

The enterprise supplier workflow is evidence of use. A supplier network effect, durable retention and an established safety record need more evidence than that. Those remain things to prove.

_Related: [Two theories of a programmer](/posts/two-theories-of-a-programmer/) and the [Sirv Studio case study](/projects/sirv-studio/)._
