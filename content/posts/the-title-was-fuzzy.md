---
title: "The title was fuzzy. The responsibility wasn't"
date: 2026-08-28
draft: false
content_type: "Essay"
description: "I spent years coordinating developers, marketers, priorities, and execution across internet businesses without a title that explained the job."
lastmod: 2026-09-04
---

For a few years, I had no useful answer to "what do you do?"

I ran work across several internet businesses. Developers were building, marketers were finding demand, products needed decisions and priorities kept colliding. I coordinated the people and decided what happened next.

## The work did not fit one department

I had started by building my first commercial website, where development and distribution were already one job. Working across several businesses made the dependencies harder to ignore. A product promise created development work. A technical constraint changed the marketing plan.

I spent less time writing code and more time deciding what should be built, by whom and why. Earth Roulette later pulled me back into hands-on engineering. Magic Toolbox and Sirv widened the job again: I joined as a marketer, then took on growth, product and operations.

## A recent example is easier to show

In August 2026, the user-analytics page in [Sirv Marketing Machine](/projects/sirv-marketing-machine/) had a number labelled Average MRR. It divided cash collected by the length of the period. A yearly payment could therefore look like a much larger recurring month.

That was simultaneously a reporting problem, a product problem and a code problem. Making the chart prettier would have left the wrong number underneath it.

The repair separated cash collected from recurring revenue. Average MRR now samples recurring revenue at month ends and the end of the selected period. A test uses a $1,200 annual payment and expects $100 of monthly recurring revenue. Those are test values, not Sirv revenue figures.

The same change made the plan breakdown a ranked bar chart and fixed calendar-period requests that missed the warmed cache. It took six files across the calculation, API, tests and interface. One dashboard question crossed all of them.

## Building and operating

As coding models improved, I could build more of my own ideas directly. I used that approach to build [Sirv Studio](/projects/sirv-studio/). The work still includes checking whether a number means what its label says, whether a promise matches the product and whether a change reached the people using it.

I now use "product builder and operator" because it is the shortest answer that is mostly true. The analytics fix is a better explanation than another list of job titles.
