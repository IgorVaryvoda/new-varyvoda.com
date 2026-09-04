---
title: "Viddl"
date: 2020-05-01
lastmod: 2026-09-04
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
  note: "I keep it online and fix it when upstream sites change. I have no plans to make it a bigger product."
last_tended: "2026-05-11"
feedback_url: "/contact/?project=viddl&type=bug"
proof:
  - value: "6"
    label: "Supported social platforms"
  - value: "2020–present"
    label: "Continuously operated"
users_changed: "Broken links are the roadmap. When a supported site changes, I fix the resolver."
imperfect: "Upstream sites change without warning, so a supported service can break until I catch up."
highlights:
  - "YouTube, X, Instagram, Facebook, Reddit, and Threads"
  - "Free MP4 downloads without an account"
  - "No fake buttons or ad maze"
  - "Still online and low-maintenance"
weight: 12
---

## Why it exists

Video downloaders have a special talent for making a basic job feel suspicious. Five fake download buttons, three pop-ups, a browser notification request, and somewhere underneath it all there might be the actual file.

I wanted the opposite. Paste a link, get the MP4, leave. No account. No ceremony. No need to explain to your antivirus why you clicked the large green button.

## What it handles

Viddl accepts links from YouTube, Twitter/X, Instagram, Facebook, Reddit, and Threads. It resolves the media and returns a normal video file in the best quality it can get. Nothing else is required.

## The annoying part

In May 2026, a configured cookie file could break downloads if it was missing or unusable. The fix was to omit the cookie option in that case, allowing the downloader to try without it. I also wrote down the recovery procedure. Cookies can help with an upstream challenge, but they are not a promise that YouTube will accept the next request.

Social platforms constantly change their pages, signatures, endpoints, and rules. Keeping a downloader working becomes an arms race against several companies with more engineers than sense of humour.

Viddl is still online, but it is low-maintenance. It may occasionally break when a platform changes something, because I have resisted turning “download this video” into my full-time war with YouTube. That is the deal.

[Download a video with Viddl](https://viddl.me)
