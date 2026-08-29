---
title: "Viddl"
date: 2020-05-01
lastmod: 2026-07-18
draft: false
project_url: "https://viddl.me"
image: "https://cdn.earthroulette.com/varyvoda/viddl.png"
image_alt: "Viddl video downloader with a single URL input and download action"
description: "A free video downloader I built because the alternatives were ad farms with a download button hidden somewhere inside. Paste a YouTube, X, Instagram, Facebook, Reddit, or Threads URL and get the MP4."
hero_kicker: "No-ads utility"
hero_intro: "I got tired of video downloaders that looked like malware, so I built the boring version: paste a link, get the video, leave."
hero_mark: "Media utility"
hero_scope: "URL to file"
hero_primary_label: "Open Viddl"
hero_frame_label: "Viddl / download"
hero_frame_status: "Still online"
hero_flow:
  - "Paste URL"
  - "Resolve media"
  - "Fetch the MP4"
  - "Get out"
tech_stack: ["Web App", "Video", "PWA"]
role: "Creator and sole builder"
stewardship:
  state: "long-running"
  note: "Kept online and repaired when upstream services change; deliberately not expanded into a larger product."
last_tended: "2026-05-11"
feedback_url: "/contact/?project=viddl&type=bug"
proof:
  - value: "6"
    label: "Supported social platforms"
  - value: "2020–present"
    label: "Continuously operated"
users_changed: "Compatibility failures are the roadmap. When somebody reports a link that stopped resolving, the useful work is restoring that path rather than adding another screen."
imperfect: "Viddl depends on upstream sites that change without warning. A supported service can break until the resolver catches up; that dependency is inherent to the product."
highlights:
  - "YouTube, X, Instagram, Facebook, Reddit, and Threads"
  - "Free MP4 downloads without an account"
  - "No fake buttons or ad maze"
  - "Still online, deliberately low-maintenance"
weight: 12
---

## Why it exists

Video downloaders have a special talent for making a basic job feel suspicious. Five fake download buttons, three pop-ups, a browser notification request, and somewhere underneath it all there might be the actual file.

I wanted the opposite. Paste a link, get the MP4, leave. No account. No ceremony. No need to explain to your antivirus why you clicked the large green button.

## What it handles

Viddl accepts links from YouTube, Twitter/X, Instagram, Facebook, Reddit, and Threads. It resolves the media and gives you a normal video file in the best quality it can get. That is the whole product, which is exactly as much product as this problem needs.

## The annoying part

Social platforms constantly change their pages, signatures, endpoints, and rules. Keeping a downloader working becomes an arms race against several companies with more engineers than sense of humour.

Viddl is still online, but it is deliberately low-maintenance. It may occasionally break when a platform changes something, because I have resisted turning “download this video” into my full-time war with YouTube. That is the honest deal.

[Download a video with Viddl](https://viddl.me)
