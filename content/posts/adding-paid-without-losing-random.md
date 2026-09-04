---
title: "Adding a paid product without losing the random button"
date: 2026-09-04
draft: false
content_type: "Build record"
description: "Earth Roulette gained airport-based trip suggestions and a paid membership path. The homepage still had to let people spin for a destination."
---

On 30 August I made Wanderer the product on Earth Roulette's homepage. Another commit that day was called `Preserve random discovery on the homepage`.

That second change restored the reason many people open the site: press a button and get somewhere unexpected.

## The new thing had a different question

[Earth Roulette](/projects/earth-roulette/) begins with "where should I go?" Wanderer adds constraints: where do you fly from, how much can the round trip cost, when can you leave and how long can you stay?

The membership work adds a paid path around airport-specific trip ideas and recurring delivery. The repository contains checkout, activation, preference storage and digest work. Those pieces show that a product is being built. They do not establish willingness to pay or retention.

Making Wanderer prominent was reasonable. Making the visitor complete its form before reaching the original random interaction was a different decision.

## Put the original action back

The correction restored the random-destination heading, Spin button and Filters beside the Wanderer trip form. It also put random discovery back into the homepage's structured description.

This was more than retaining an old link somewhere below the fold. Someone arriving for a random destination could still do that immediately. Someone with an airport and a budget could use the more constrained path beside it.

The cost is a homepage with two related jobs. I need to measure whether people understand the choice, not assume that adding a paid offer improves the whole product.

## A useful trip needs both dates

The implementation also had to become more precise about what it was recommending. A one-way fare is not a round-trip total. A cached observation is not live inventory. A low price without a usable return date is a weak basis for a weekend suggestion.

The digest tests reject missing or reversed return dates and trips outside the requested length. An August follow-up checks every calendar month covered by the travel window. A window crossing September and October must not silently search only September.

The [homepage](https://earthroulette.com/) tells visitors that the suggestions use cached provider observations and asks them to recheck the fare before booking. That sentence limits the promise to what the data supports.

## What remains to prove

The site now exposes both discovery paths. The membership code is not a revenue result, and a working digest is not evidence that people keep reading it.

The next useful evidence is whether the trip suggestions get used, whether members return and whether the original random experience still works for the people who came for it. I have not reported those outcomes here.
