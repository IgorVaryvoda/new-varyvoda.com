---
title: "My job title was fuzzy for years"
date: 2026-08-28
draft: false
content_type: "Essay"
description: "I spent years coordinating developers, marketers, priorities and execution across internet businesses without a title that explained the job."
lastmod: 2026-09-23
featuredImage: "/images/posts/the-title-was-fuzzy.webp"
image_alt: "Four large textured circular forms connect through fine gold lines to a small amber centre."
ogImage: "https://www.varyvoda.com/images/posts/the-title-was-fuzzy.jpg"
---

For a few years, I had no useful answer to "what do you do?"

I ran work across several internet businesses. Developers were building, marketers were finding demand, products needed decisions and priorities kept colliding. Somebody had to decide what happened next. That somebody was often me.

## The work did not fit one department

Small internet businesses don't split neatly into product, engineering, growth and operations. A product promise creates development work. A technical constraint changes the marketing plan. One unanswered question can block all of it.

I started by building my first commercial website, where development and distribution were already one job. Later I spent less time writing code and more time deciding what should be built, by whom and why. [Earth Roulette](/projects/earth-roulette/) pulled me back into hands-on engineering. Then I joined Magic Toolbox as a marketer, moved to Sirv and took on growth, product and operations.

On a CV that looks unfocused. In practice it means working on whatever is blocking the product. Sometimes that's copy. Sometimes it's architecture. Sometimes it's telling people to stop building and prove the existing thing works.

## A recent example is easier to show

In August 2026, the user-analytics page in [Sirv Marketing Machine](/projects/sirv-marketing-machine/) had a number labelled Average MRR. It divided cash collected by the length of the period. So one yearly payment could look like a huge recurring month.

A prettier chart wouldn't have helped. The number underneath was wrong, and fixing it touched the reporting, the product and the code.

The repair separated cash collected from recurring revenue. Average MRR now samples recurring revenue at the end of each month and at the end of the selected period. A test feeds in a $1,200 annual payment and expects $100 of MRR. (Those are test values, not Sirv's revenue.)

The same change turned the plan breakdown into a ranked bar chart and fixed calendar-period requests that missed the warm cache. Six files: the calculation, the API, the tests and the interface. One dashboard question went through all of them.

## Building and operating

As coding models got better, I could build more of my own ideas directly. They didn't turn a marketer into a developer. They made someone who already did both much faster. That's how I built [Sirv Studio](/projects/sirv-studio/).

I now say "product builder and operator" because it's the shortest answer that's mostly true. I build the thing, then I keep it working. And I still check whether a number means what its label says.
