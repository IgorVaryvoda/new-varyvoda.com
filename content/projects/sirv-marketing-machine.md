---
title: "Sirv Marketing Machine"
date: 2025-04-26
lastmod: 2026-09-04
draft: false
description: "Internal Sirv reporting and marketing software. One analytics repair shows why growth work sometimes starts in the revenue calculation."
hero_title: "Marketing Machine"
hero_title_size: "compact"
hero_kicker: "Internal software"
hero_intro: "I build and operate internal tools for Sirv's marketing and reporting. The difficult part is often making the number mean what its label says."
hero_mark: "Internal operations"
hero_scope: "Data to a usable report"
hero_flow:
  - "Collect the data"
  - "Check the definition"
  - "Inspect the report"
  - "Act on the evidence"
image_alt: "Internal Sirv analytics and marketing system"
tech_stack: ["Python", "FastAPI", "Nuxt", "PostgreSQL", "Redis"]
role: "Builder and operator"
stewardship:
  state: "maintained"
  note: "I maintain the reporting, integrations and workflows used for Sirv operations."
last_tended: "2026-08-10"
feedback_url: "/contact/?project=sirv-marketing-machine&type=question"
proof:
  - value: "Cash ≠ MRR"
    label: "Separate calculations and regression cases"
imperfect: "The system is internal. This case study demonstrates a reporting repair, not a measured increase in revenue or campaign performance."
weight: 13
---

## A label that hid the wrong calculation

In August 2026, the analytics page labelled a value Average MRR while calculating it from cash collected over the selected period. An annual payment could look like a recurring monthly spike.

The repair separates cash collected from recurring revenue. Average MRR now averages point-in-time recurring revenue at month ends and the end of the selected period. Long ranges use bounded sampling.

A regression case uses a $1,200 yearly payment. The cash result is $1,200 and the monthly recurring amount is $100. Those are synthetic test values, not Sirv's business figures.

## The rest of the report had to work too

Calendar-period queries could select a lookback the scheduler had not cached. The page then rebuilt the combined user dataset instead of using a warm result. The fix chooses a warmed source range and gives the page a timeout.

The plan breakdown was a pie chart with eleven long labels. It became a ranked horizontal bar chart, with the remaining plans grouped separately. A Revenue card shows cash collected in the selected period.

The change crossed the calculation, API, tests and interface. Correcting only the chart would have preserved the misleading metric.

## Where it fits

Marketing Machine brings together Sirv analytics and marketing workflows, including search, advertising and content work. Its integrations create useful context, but the report still depends on the definitions underneath each number.

This is an example of [what I mean by product and operations work](/posts/the-title-was-fuzzy/). The repository records the repair in `a23fcc74` on 10 August 2026. It does not establish that the change increased revenue, and I do not have a business outcome to attach to it here.
