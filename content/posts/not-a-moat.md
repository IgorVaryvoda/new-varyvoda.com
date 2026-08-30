---
title: "Anything an agent fleet can rebuild in a quarter is not a moat"
date: 2026-08-01
draft: false
content_type: "Essay"
page_css: ["moat"]
description: "I built a DAM, a PIM, a supplier portal, and an MCP server in seven months — which is exactly why none of them are moats. What compounds when construction is free."
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
---


<p class="moat-meta">1 Aug 2026 · doctrine written 2 Jul · sequel to Two theories of a programmer</p>

<p class="moat-standfirst">In <a href="/posts/two-theories-of-a-programmer/">Two theories of a programmer</a> I argued that when a fleet does the typing, the scarce thing moves upstream — to judgment. This post is the same argument applied to companies. If one person with agents can build your product in seven months, <strong>what exactly is your product worth?</strong></p>

## The demonstration

In seven months, I built [Sirv AI Studio](/projects/sirv-studio/): a digital asset manager, a PIM layer, a supplier portal, a workflow engine, and a 47-tool MCP server. A fleet did the typing; I did the deciding. That's not a boast — it's the problem statement. Because if I could do that, so can a competitor with the same tools. Whatever I shipped last quarter, someone else can ship next quarter.

That collapses forty years of instinct about defensibility. The instinct says features are assets: every tool, every integration, every screen is a brick in the wall. The instinct was calibrated for a world where bricks were expensive. They aren't anymore. So I wrote a filter into Studio's strategy docs, and it's survived every argument since:

> **Anything an agent fleet can rebuild in a quarter is not a moat.**

The corollary matters more than the rule. Agents compress *construction* time. They don't compress **calendar time, other people's adoption decisions, or the accumulation of history**. Whatever needs one of those three to exist is still scarce — and in a fleet economy, it's the only thing that is.

## The non-moats

State them plainly, so nobody mistakes them for strategy. Everything in the left column of my own product is on the clock:

<figure class="moat-figure">
  <div class="moat-split">
    <div class="moat-col moat-col--decay">
      <h4><span class="moat-dot" style="background:#e8b04b"></span>Decays in quarters</h4>
      <ul>
        <li><strong>AI tool count</strong> Every tool wraps a model rented from the same vendors. fal.ai does not care who calls it.</li>
        <li><strong>Workflow step types</strong> 39 today, copyable in a sprint.</li>
        <li><strong>UI polish</strong> Necessary for conversion, worthless for defense.</li>
        <li><strong>MCP support itself</strong> A protocol implementation, weeks of work for anyone.</li>
        <li><strong>Model access, prompt quality</strong> Rented and leaky, respectively.</li>
      </ul>
    </div>
    <div class="moat-col moat-col--compound">
      <h4><span class="moat-dot" style="background:#54c98a"></span>Compounds in years</h4>
      <ul>
        <li><strong>Operational history</strong> Every approval, publish, rollback, and supplier submission is a row that exists nowhere else.</li>
        <li><strong>The product graph</strong> Only while it's more truthful than the platform's own data.</li>
        <li><strong>The supplier network</strong> The only entry with true network effects.</li>
        <li><strong>The safety record</strong> Compounds slowly, destroyed in one afternoon.</li>
        <li><strong>Owned distribution</strong> Rankings and relationships that survive feature parity.</li>
      </ul>
    </div>
  </div>
  <figcaption>Studio's own ledger, sorted by the quarter rule. The left column is most of what a feature-comparison table shows. The right column is most of what a customer actually leaves for.</figcaption>
</figure>

None of this argues against building the left column. You can't convert customers without tools, polish, and protocol support. It argues against *believing the left column protects anything*. A feature is a cost of entry that recently learned to impersonate an asset.

## What actually compounds

Each entry in the right column comes with a condition — a way it stops being a moat if you get careless.

**Operational history** is the strongest switching cost available to a product like mine, and it accrues automatically — but only from real usage. After a year, a workspace's history answers questions no rival can: what was live during the December sale, who approved the hero image, which supplier's uploads fail validation most often, what the listing looked like before the AI pass. Ten merchants running the loop weekly build more moat than ten new features. That sentence is the entire growth strategy, and it's humbling to type.

**The product graph** — assets linked to products, variants, channels, approval states — is a moat *only while it's more truthful than Shopify's own data*. The moment the graph drifts from the store, it flips from asset to liability. Which reframes a whole category of unglamorous engineering: drift detection and sync integrity aren't plumbing. They're moat maintenance.

**The supplier network** is the only asset on the list with real network effects: a supplier who serves multiple merchants is a carrier. And the loop only spins on supplier-side *experience* — speed, clarity, "this saved me a re-shoot." Portal branding serves vanity. The loop doesn't care about vanity.

**The safety record** has the cruelest asymmetry. "Publish safely, roll back instantly" is a claim any competitor can print on a landing page tomorrow. Years of touching live stores without a destructive incident can't be printed. And they can't be rebuilt quickly either: one viral story of a tool overwriting a merchant's catalog undoes years of quiet compounding. That's why I keep a rule that outranks every deadline: **no publish-touching feature ships without idempotency, drift checks, per-product status, and rollback.** Reliability engineering isn't a cost center. It's an insurance premium on the brand, and it's worth paying forever.

**Owned distribution** — search rankings, app-store position, an existing customer base — takes quarters to earn and survives feature parity. It's the moat that buys you time to build the other four.

All five are made of the same raw ingredients: **time, other people, or accumulated events** — the three things a fleet can't compress.

## The rules that fall out

A doctrine is only useful if it changes decisions. Four rules from mine that do:

**Schema decisions are moat decisions.** Lineage, approval attribution, publish history, supplier provenance — first-class in the data model even when no UI shows them yet. History you don't record in 2026 can't be sold as a moat in 2028. The fleet can rebuild your screens; nobody can rebuild the rows you never wrote.

**Easy export, sticky value.** Let customers export everything, loudly. Nobody deposits their history into a system they suspect will hold it hostage. And the bet behind the openness is easy: exported history is dead data; in-place history powers readiness checks, rollback, and agents. **Lock-in by value, never by lock.**

**Feed the network before the feature list.** A new marketplace integration adds a row to a comparison table. A supplier who recommends the product to a second merchant adds revenue. When the two compete for the same quarter, the supplier wins.

**Count moat, not features.** The quarterly dashboard that replaces the changelog as a scoreboard:

{{< moat-dashboard >}}

That last rule is the uncomfortable one, because a fleet makes shipping feel like winning. Five thousand commits a month is a new kind of productivity — and a new kind of temptation: construction as a vanity metric. The dashboard exists to ask the only question that matters at the end of a quarter — *did anything accumulate that a competitor's fleet can't rebuild?*

## Every moat has an attacker

A defensibility claim you haven't red-teamed is a wish. So attack the right column too:

Operational history gets attacked by import tools — "bring your Shopify history into CompetitorX." The defense is depth the platform API can't express: approvals, supplier provenance, AI derivation lineage. The history worth having must only be *recordable* inside your system. The product graph gets attacked by the platform itself exposing richer metadata; the defense is staying multi-source, covering what the platform can't see. The supplier network gets attacked by a supplier-first competitor inverting the model — the one attack genuinely worth watching for. Distribution gets attacked by algorithm changes and ad budgets; the defense is making sure one channel cannot sink the business.

And the safety record gets attacked by exactly one adversary: **your own mistakes.** No competitor required.

## What this is really about

Two theories, again. The old theory of a programmer valued typing; the fleet made typing free, and value moved to judgment. The old theory of a software company valued *construction* — and the fleet just made construction free too. Value is moving to the things construction can't produce: recorded history, earned trust, other people's habits, time.

The pattern generalizes past my product, past commerce, probably past software. Whatever your industry's version of "38 AI tools" is — that's typing. Whatever your version of "four years of incident-free publishes" is — that's the job now.

> Fleets compress construction. They don't compress trust.

_Sequel to [Two theories of a programmer](/posts/two-theories-of-a-programmer/). The strategy docs it's lifted from belong to [Sirv AI Studio](/projects/sirv-studio/)._
