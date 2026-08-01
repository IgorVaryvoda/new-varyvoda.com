---
title: "Anything an agent fleet can rebuild in a quarter is not a moat"
date: 2026-08-01
draft: false
description: "I built a DAM, a PIM, a supplier portal, and an MCP server in a year — which is exactly why none of them are moats. What compounds when construction is free."
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
---

<style>
.moat-standfirst {
  color: var(--slate);
  font-size: 1.95rem;
  line-height: 1.65;
  margin-bottom: 2.2rem;
}

.moat-meta {
  color: var(--muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.15rem;
  letter-spacing: 0.08em;
  margin-bottom: 1.4rem;
  text-transform: uppercase;
}

.moat-figure {
  margin: 3rem 0;
  padding: clamp(1.5rem, 3vw, 2.2rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(249, 201, 122, 0.1), transparent 36%),
    linear-gradient(315deg, rgba(102, 217, 239, 0.08), transparent 42%),
    #10131a;
}

.moat-figure figcaption {
  margin-top: 1.4rem;
  color: #8d93a2;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.15rem;
  line-height: 1.55;
}

.moat-split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}

.moat-col h4 {
  margin: 0 0 1rem;
  color: #b9c0cf;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.2rem;
  font-weight: 600;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.moat-col ul {
  margin: 0;
  padding: 0;
  list-style: none;
}

.moat-col li {
  padding: 0.55rem 0;
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  font-size: 1.35rem;
  line-height: 1.5;
}

.moat-col li:first-child {
  border-top: 0;
}

.moat-col--decay li {
  color: #8d93a2;
}

.moat-col--compound li {
  color: #d9e2ec;
}

.moat-dash {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(11rem, 1fr));
  gap: 1.6rem;
}

.moat-dash .n {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.15rem;
  font-weight: 700;
  color: #66d9ef;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.moat-dash .l {
  margin-top: 0.5rem;
  color: #b9c0cf;
  font-size: 1.3rem;
  line-height: 1.5;
}

@media (max-width: 640px) {
  .moat-split {
    grid-template-columns: 1fr;
  }
}
</style>

<p class="moat-meta">1 Aug 2026 · doctrine written 2 Jul · sequel to Two theories of a programmer</p>

<p class="moat-standfirst">In <a href="/posts/two-theories-of-a-programmer/">Two theories of a programmer</a> I argued that when a fleet does the typing, the scarce thing moves upstream — to judgment. This post is the same argument applied to companies. If one person with agents can build your product in a year, <strong>what exactly is your product worth?</strong></p>

## The demonstration

Over roughly a year, I built [Sirv AI Studio](/projects/sirv-studio/): a digital asset manager, a PIM layer, a supplier portal, a workflow engine, and a 47-tool MCP server. A fleet did the typing; I did the deciding. This is not a boast — it's the problem statement. Because if I could do that, so can a competitor with the same tools. Whatever I shipped last quarter, someone else can ship next quarter.

That collapses forty years of instinct about defensibility. The instinct says features are assets: every tool, every integration, every screen is a brick in the wall. The instinct was calibrated for a world where bricks were expensive. They aren't anymore. So I wrote a filter into Studio's strategy docs and it has survived every argument since:

> **Anything an agent fleet can rebuild in a quarter is not a moat.**

The corollary matters more than the rule. Agents compress *construction* time. They do not compress **calendar time, other people's adoption decisions, or the accumulation of history**. Whatever needs one of those three to exist is still scarce — and in a fleet economy, it's the only thing that is.

## The non-moats

State them plainly, so nobody mistakes them for strategy. Everything in the left column of my own product is on the clock:

<figure class="moat-figure">
  <div class="moat-split">
    <div class="moat-col moat-col--decay">
      <h4>Decays in quarters</h4>
      <ul>
        <li>AI tool count — every tool wraps a model rented from the same vendors. fal.ai does not care who calls it.</li>
        <li>Workflow step types — 39 today, copyable in a sprint.</li>
        <li>UI polish — necessary for conversion, worthless for defense.</li>
        <li>MCP support itself — a protocol implementation, weeks of work for anyone.</li>
        <li>Model access and prompt quality — rented and leaky, respectively.</li>
      </ul>
    </div>
    <div class="moat-col moat-col--compound">
      <h4>Compounds in years</h4>
      <ul>
        <li>Operational history — every approval, publish, rollback, and supplier submission is a row that exists nowhere else.</li>
        <li>The product graph — but only while it's more truthful than the platform's own data.</li>
        <li>The supplier network — the only entry with true network effects.</li>
        <li>The safety record — compounds slowly, destroyed in one afternoon.</li>
        <li>Owned distribution — rankings and relationships that survive feature parity.</li>
      </ul>
    </div>
  </div>
  <figcaption>Studio's own ledger, sorted by the quarter rule. The left column is most of what a feature-comparison table shows. The right column is most of what a customer actually leaves for.</figcaption>
</figure>

None of this argues against building the left column. You can't convert customers without tools, polish, and protocol support. It argues against *believing the left column protects anything*. A feature is a cost of entry that recently learned to impersonate an asset.

## What actually compounds

The right column deserves more than bullet points, because each entry has a condition attached — a way it stops being a moat if you handle it carelessly.

**Operational history** is the strongest switching cost available to a product like mine, and it accrues automatically — but only from real usage. After a year, a workspace's history answers questions no rival can: what was live during the December sale, who approved the hero image, which supplier's uploads fail validation most often, what the listing looked like before the AI pass. Ten merchants running the loop weekly build more moat than ten new features. That sentence is the entire growth strategy, and it is humbling to type.

**The product graph** — assets linked to products, variants, channels, approval states — is a moat *only while it is more truthful than Shopify's own data*. The moment the graph drifts from the store, it flips from asset to liability. Which reframes a whole category of unglamorous engineering: drift detection and sync integrity aren't plumbing. They're moat maintenance.

**The supplier network** is the only asset on the list with real network effects: a supplier who serves multiple merchants is a carrier. And the loop only spins on supplier-side *experience* — speed, clarity, "this saved me a re-shoot." Portal branding serves vanity. The loop doesn't care about vanity.

**The safety record** has the cruelest asymmetry. "Publish safely, roll back instantly" is a claim any competitor can print on a landing page tomorrow. Years of touching live stores without a destructive incident cannot be printed. It also cannot be repaired quickly: one viral story of a tool overwriting a merchant's catalog undoes the accumulation. This is why I keep a rule that outranks every deadline: **no publish-touching feature ships without idempotency, drift checks, per-product status, and rollback.** Reliability engineering isn't a cost center. It's an insurance premium on the brand, and it's worth paying forever.

**Owned distribution** — search rankings, app-store position, an existing customer base — takes quarters to earn and survives feature parity. It's the moat that buys you time to build the other four.

Notice what all five have in common: **time, other people, or accumulated events**. Exactly the three things a fleet cannot compress.

## The rules that fall out

A doctrine is only useful if it changes decisions. Four rules from mine that do:

**Schema decisions are moat decisions.** Lineage, approval attribution, publish history, supplier provenance — first-class in the data model even when no UI shows them yet. History you don't record in 2026 cannot be sold as a moat in 2028. The fleet can rebuild your screens; nobody can rebuild the rows you never wrote.

**Easy export, sticky value.** Let customers export everything, loudly. Willingness to deposit history into your system depends on believing it isn't hostage. The confidence behind that rule: exported history is dead data, while in-place history powers readiness checks, rollback, and agents. **Lock-in by value, never by lock.**

**Feed the network before the feature list.** A new marketplace integration adds a row to a comparison table. A supplier who recommends the product to a second merchant adds revenue. When the two compete for the same quarter, the supplier wins.

**Count moat, not features.** The quarterly dashboard that replaces the changelog as a scoreboard:

<figure class="moat-figure">
  <div class="moat-dash">
    <div><div class="n">History</div><div class="l">Workspaces with 90-day operational history</div></div>
    <div><div class="n">Graph</div><div class="l">Products under management</div></div>
    <div><div class="n">Network</div><div class="l">Suppliers active across more than one workspace</div></div>
    <div><div class="n">Trust</div><div class="l">Incident-free publish runs</div></div>
    <div><div class="n">Reach</div><div class="l">Organic funnel entries</div></div>
  </div>
  <figcaption>Five numbers. If they're flat, the moat isn't growing — whatever shipped that quarter.</figcaption>
</figure>

That last rule is the uncomfortable one, because a fleet makes shipping feel like winning. Five thousand commits a month is a genuinely new kind of productivity, and it is also a genuinely new kind of temptation: construction as a vanity metric. The dashboard exists to ask the only question that matters at the end of a quarter — *did anything accumulate that a competitor's fleet can't rebuild?*

## Every moat has an attacker

A defensibility claim you haven't red-teamed is a wish. Run the column on the right through the same skepticism as everything else:

Operational history gets attacked by import tools — "bring your Shopify history into CompetitorX." The defense is depth the platform API cannot express: approvals, supplier provenance, AI derivation lineage. The history worth having must only be *recordable* inside your system. The product graph gets attacked by the platform itself exposing richer metadata; the defense is staying multi-source, covering what the platform cannot see. The supplier network gets attacked by a supplier-first competitor inverting the model — the one attack worth genuinely watching for. Distribution gets attacked by algorithm changes and ad budgets; the defense is never letting one channel be load-bearing.

And the safety record gets attacked by exactly one adversary: **your own mistakes.** No competitor required.

## What this is really about

Two theories, again. The old theory of a programmer valued typing; the fleet made typing free, and value moved to judgment. The old theory of a software company valued *construction* — and the fleet just made construction free too. Value is moving to the things construction can't produce: recorded history, earned trust, other people's habits, time.

The pattern generalizes past my product, past commerce, probably past software. Whatever your industry's version of "34 AI tools" is — that's typing. Whatever your version of "four years of incident-free publishes" is — that's the job now.

> Fleets compress construction. They do not compress trust. Plan accordingly.

_Sequel to [Two theories of a programmer](/posts/two-theories-of-a-programmer/). The product whose strategy docs this post is lifted from is [Sirv AI Studio](/projects/sirv-studio/)._
