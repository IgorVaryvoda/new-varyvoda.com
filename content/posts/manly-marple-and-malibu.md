---
title: "Manly, Marple and Malibu: Earth Roulette inside ChatGPT"
date: 2026-10-20
draft: true
content_type: "Build record"
description: "Earth Roulette now answers ChatGPT and Claude directly through an MCP server. The first random spin came back in alphabetical order."
---

The first time ChatGPT spun Earth Roulette for three destinations, it got Manly, Marple and Malibu. The second time it got Glastonbury, Galtür and Gramado.

Random, technically. Also alphabetical.

## Why answer agents at all

[Earth Roulette](/projects/earth-roulette/) is a button that picks somewhere to go, with cheap flights attached. People used to find it through search. More and more of them now ask ChatGPT where to go and never open a travel page. Expedia and Booking.com have been answering inside ChatGPT since October 2025.

The first commit puts it in one line:

> AI answers are replacing the visit to a travel page, so Earth Roulette now answers agents directly.

So the site got an MCP server at `earthroulette.com/mcp`. MCP is the protocol ChatGPT, Claude and most coding agents use to call outside tools. No account, no sign-in, no API key. In Claude Code it's one line:

```bash
claude mcp add --transport http earth-roulette https://earthroulette.com/mcp
```

It runs inside the same Nuxt app on Cloudflare Workers as the website. I skipped the official SDK and wrote the protocol myself in about a hundred lines, to keep the Worker small. Each request is one POST with one JSON answer back. There are no sessions and no streams, because nothing here needs them.

## Random, in alphabetical order

Two tools shipped first: spin for destinations, and find cheap flights from an airport. Then came the Manly spin.

The spin reused the code behind shareable `/spin/` links. One seed reads one 200-place stretch of the places table in ID order and shuffles inside it. For a shared link that's right: one seed promises one answer, and anyone who opens the link sees the same place. For a list of three, it means all three come from the same patch of the alphabet.

The fix gives every place in a spin its own seed, drawn in parallel, skipping repeats. At most five draws, each one or two cheap index reads.

Marple and Galtür had a second problem. They came back with no data at all. 2,328 of the 4,962 places, 47%, have no monthly temperatures, and the same rows usually have no tags or cost either. A website can show a photo and let you click around. An agent can only say "I don't have much on this one." Agent spins now draw only from places with climate data.

The fix landed 39 minutes after the first commit. It cost one feature. Agent spins no longer use the same pool as the website, so a share link can't replay them, and I removed it from the output.

## Where should I go, and then what?

The next morning's commit says what was missing:

> The MCP server answered "where should I go" and "where can I fly cheaply", and nothing after it.

So it grew from two tools to seven:

- **spin_destination**: random places, filtered by continent, tags, cost, temperature and month, so "warm in February" works in October.
- **get_destination**: the guide for one place, with what it's good for, current temperature, FAQ and how to get there.
- **cheap_flights**: the cheapest fares from an airport for a month.
- **route_prices**: one route, cheapest fare per month or per day.
- **things_to_do**: tours, with prices and ratings.
- **hotels**: guest ratings, review counts and prices from.
- **find_airport**: city name to airport code, the same search the site's autocomplete uses.

Names are messy. There's a Santa Fe in Argentina and one in New Mexico. When a name matches more than one place, the tool refuses to guess and hands back the IDs so the agent can ask again. Guessing would be easy. Sending someone to the wrong continent isn't worth it.

Fares are cached, and agents should say so. The flight tool's description tells the model these are "not live quotes: say 'from'." It's the same promise the homepage makes to people.

## A shared IP for everybody

ChatGPT calls tools from a few shared OpenAI servers on behalf of every user. Rate limiting by IP, the usual way, would throttle all of ChatGPT as if it were one person. The limit is 600 calls a minute per IP, and the code calls it what it is: "a flood fence, not a per-user quota."

Agents also share the website's fare cache, so a question in ChatGPT warms the same entries the site uses.

## How it pays

Every result includes links to the place page and tagged affiliate links for flights, hotels and tours. Each one is tagged `mcp`, so agent traffic shows up separately from the site.

The directories have rules, and I wrote them into the docs so future changes don't break them. No "best" or "official" in descriptions. Don't tell the model to avoid other apps. Link to search pages, not checkouts. Don't promote the paid Wanderer plan inside tool output. For Claude's directory, the sponsored content answer is yes, with one line I like: "No result is ranked by commission."

## Submitting a plugin

ChatGPT now calls these plugins. The submission is a ZIP with two small JSON files and a logo. The plugin file includes test cases, which is my favourite part of the format. Five things it should handle: a plain spin, a warm affordable diving spin in Asia, cheap flights from Lisbon, the cheapest month from Lisbon to Bangkok, and a Chania guide with tours and hotels. And three it should leave alone: the capital of Australia, a Python sort function and cancelling a hotel booking in Rome.

There's a domain check: a 44-byte token file that has to be served bare, with no extension. And there's a demo video, 75 seconds at 1080p, hosted on the site for the reviewers.

Once a plugin is live, OpenAI rescans the server every day. Changes to existing tools go out after automatic checks, but new tools stay hidden until they're approved. Only one review can be active at a time, so it's worth getting the tool list right before you submit.

From the first commit to the demo video took about 17 hours and 1,740 lines.

[Earth Roulette](/projects/earth-roulette/) · [Use it from ChatGPT or Claude](https://earthroulette.com/guides/chatgpt-claude-travel-planner)
