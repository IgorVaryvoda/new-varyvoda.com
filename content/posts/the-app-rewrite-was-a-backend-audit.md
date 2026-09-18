---
title: "The app rewrite turned into a backend audit"
date: 2026-09-18
draft: false
content_type: "Build record"
description: "Earth Roulette's iOS app was a webview wrapper. Rebuilding it in SwiftUI meant calling every API directly, and that is how I found faults the website had been living with for months."
---

Earth Roulette's iOS app used to be a WKWebView pointed at the website. It worked, in the sense that it loaded. It was not an app.

The replacement is SwiftUI, and rebuilding it meant re-implementing every screen against the same APIs the site uses. I expected that work to be tedious. Instead it behaved like an audit, because a second implementation asks the same questions differently and gets different answers.

## Every place page said there were no flights

The destination screen showed "No fares found for the next few weeks." It said that for Marseille, for Rome, for everywhere.

The app was sending `detail.id` — a place slug like `Marseille` — to an endpoint that speaks IATA codes. The API answered `400 Invalid destination; expected IATA`. The call sat behind a `try?`, so the error became an empty array, and an empty array reads as "no fares." Dubrovnik to Marseille had eight fares that month.

The fix was a slug-to-airport lookup before the request. The lesson was the error handling: a failed lookup and a route nobody flies now say different things, because they are different things.

## The home airport saved nothing, successfully

Setting a home airport reported success and changed nothing. Three faults stacked, each hiding the next.

The app seeds a profile row on sign-in with an upsert. An upsert compiles to `ON CONFLICT DO UPDATE`, which needs UPDATE rights on the columns involved. A migration had revoked UPDATE from `authenticated` on everything except two columns, so the seed came back "permission denied" for every signed-in user. That call was wrapped in `try?`, so the failure was invisible. Then the save ran `UPDATE profiles WHERE id = <user>`, matched no row, succeeded, and returned "Saved."

Across 6,777 profiles, two had a home airport. One of them was a test row I had made ten minutes earlier debugging this.

## Hotels quoted rates from 2024

A card in Busan advertised a room at $6 a night under a heading that read "Live prices from Booking.com."

The $6 was real. It was scraped in July 2024. Of 1,684,669 rows in the hotels table, 1,074,662 were last scraped before 2025 and 3,351 in 2026, so "live" described 0.2% of the data. The nightly rate is gone from the card now. A rating ages gracefully; a price does not.

The same links also earned nothing, because Booking.com's affiliate programme had closed for my account and the tracked link resolved to an inactive-merchant page. Those now route through the network that already supplies the flight data.

## Sale, Australia was in England

`airports.place_id` was matched on city name with no country behind it. Of the 2,392 codes that resolve to a real place, 506 pointed somewhere else entirely: DUB at Dublin, Ohio; SXE at Sale in England, 17,000 km from the Australian airport that claims it; AFI, in Colombia, at Amalfi in Italy.

Country names could not arbitrate it, which is the trap. The two tables disagree on real cases — one says "Hong Kong" where the other says "China", one says "Ireland" where the other says "Republic of Ireland" — so an equality test both condemns correct mappings and hides real targets. Distance is the only sound test. 189 were remapped and 317 cleared, because an unmapped airport shows no destination while a wrong one sells a flight to another continent.

Applying that fix failed twice on a trigger, which turned out to be a second bug: the trigger refreshed a materialized view `CONCURRENTLY`, which is illegal inside a function, on a view with no unique index, which `CONCURRENTLY` also requires. Every write to that table had been aborting. Probably for as long as the trigger existed.

## What the rewrite was actually worth

The app is now native, speaks ten languages, and does the things a phone app should do. That was the point of the work.

But the durable value was structural. A webview cannot disagree with its backend; it renders whatever the site renders, including the site's mistakes. A second implementation has to ask for data in its own words, and when the answer is wrong, it is wrong in a way somebody notices.

Four of those five faults were live on the website too. Nobody had reported any of them.

[Earth Roulette](/projects/earth-roulette/) · [iOS app](https://apps.apple.com/us/app/earth-roulette-trip-explorer/id6449232498)
