---
title: "Adding a paid product without losing the random button"
date: 2026-09-04
lastmod: 2026-09-23
draft: false
content_type: "Build record"
description: "Earth Roulette gained airport-based trip suggestions and a paid membership path. The homepage still had to let people spin for a destination."
featuredImage: "/images/posts/adding-paid-without-losing-random.webp"
image_alt: "Loose blue and amber swirls flow alongside an ordered grid of rectangles and circles."
ogImage: "https://www.varyvoda.com/images/posts/adding-paid-without-losing-random.jpg"
---

On 30 August at 10:15 I pushed a commit called `Make Wanderer the homepage product`. At 12:03 I pushed another one: `Preserve random discovery on the homepage`.

The second commit fixed the first. In between, Earth Roulette's homepage had stopped doing the thing most people open it for: press a button and get somewhere unexpected.

## The new thing asks a different question

[Earth Roulette](/projects/earth-roulette/) starts with "where should I go?" Wanderer, the new paid product, adds constraints. Where do you fly from? How much can the round trip cost? When can you leave and for how long?

Behind it there's checkout, activation, saved preferences and a recurring digest of trip ideas from your airport. That's a lot of code. None of it tells me yet if anyone will pay or stay.

Putting Wanderer front and centre made sense. But the 10:15 commit went further. It dropped the random-city call from the homepage and swapped the page title from "Random Holiday Generator" to "Cheap Round-Trip Ideas from Your Airport". Wanderer hadn't just moved in. It had pushed the original product out.

## Put the button back

The 12:03 fix brought back the random-destination heading, the Spin button and the filters, right beside the Wanderer trip form. It restored the old page title and put random discovery back at the top of the structured data.

Now someone who came to spin can spin straight away. Someone with an airport and a budget can use the form next to it.

The cost is a homepage with two jobs. I'll have to watch whether people understand the choice.

## A useful trip needs both dates

Wanderer also had to get stricter about what it recommends. A one-way fare isn't a round-trip price. A cached fare isn't a live seat. A cheap flight with no sensible way back is useless for a weekend away.

The digest tests reject missing or reversed return dates and trips outside the requested length. A follow-up the next day checks every calendar month in the travel window, so a window from late September into October doesn't quietly search only September.

The [homepage](https://earthroulette.com/) tells visitors that suggestions come from cached fares and asks them to recheck the price before booking. The promise matches the data.

## What I'm watching

Do people use the trip suggestions? Do members come back? And does the Spin button still work for the people who came for it? I'll know more once real users have had a few weeks with both.
