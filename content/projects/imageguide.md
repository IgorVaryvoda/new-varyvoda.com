---
title: "ImageGuide"
date: 2026-01-19
lastmod: 2026-09-04
draft: false
homepage_weight: 6
project_url: "https://www.imageguide.dev/"
github_url: "https://github.com/IgorVaryvoda/imageguide-extension"
image: "/images/imageguide/audit-0.4.0.png"
image_alt: "ImageGuide extension 0.4.0 audit showing response sizes, estimated savings and individual image usages"
description: "Image-delivery guides, conversion tools and a browser auditor that distinguishes measured bytes, estimates and markup findings."
hero_kicker: "Image engineering"
hero_intro: "I put the image-delivery knowledge I kept using into a reference site, then built a browser auditor to check the page in front of me."
hero_mark: "Guides + browser audit"
hero_scope: "Question to evidence"
hero_primary_label: "Open ImageGuide"
hero_frame_label: "ImageGuide / extension 0.4.0"
hero_frame_status: "Repository capture"
hero_flow:
  - "Inspect a page"
  - "Read the evidence"
  - "Choose a correction"
  - "Check the result"
tech_stack: ["Astro", "React", "JavaScript", "Chrome extension"]
role: "Creator and builder"
stewardship:
  state: "evolving"
  note: "I maintain the guides and tools, and check the auditor against browser fixtures as its coverage grows."
last_tended: "2026-08-30"
feedback_url: "https://github.com/IgorVaryvoda/imageguide-extension/issues"
proof:
  - value: "0.4.0"
    label: "Browser auditor release in the repository"
  - value: "Browser fixtures"
    label: "Resource, usage and timing checks"
imperfect: "The auditor cannot see every frame or closed shadow root, and conversion savings remain estimates. The site and desktop app have different capabilities, so their documentation needs regular alignment."
weight: 6
---

## Advice needs somewhere to be tested

I have written about product images since 2018. Questions keep returning: which format, what dimensions, when to lazy-load and how to tell whether a change helped.

ImageGuide collects the reference material, practical guides and conversion tools. The browser extension applies those questions to an open page. [Press](/projects/press/) handles local files.

The site is powered by Sirv. It is part of the same image work, not an independent review of Sirv.

## The extension keeps the uses separate

One file can appear in several places. The auditor groups the shared resource but retains each element's dimensions and markup findings. A hero and a small card do not need the same image size or alt text.

Version 0.4.0 adds a persistent audit view, response-size checks and browser observations for LCP and layout shifts. The screenshot above comes from the repository's captures for that version. Its numbers describe the captured page, not a benchmark for the extension.

The [build note](/posts/what-an-image-auditor-can-measure/) follows the distinction between response bytes, per-element findings and projected savings.

## Permission follows the action

The normal audit starts when the user clicks the extension. It does not automatically transmit the report to ImageGuide. Optional cross-origin response-size checks request the permission they need and make requests without credentials.

A browser audit does not rewrite the site's files. The report can be copied as Markdown or JSON for the person doing that work.

## The files need their own tool

Converting a few images in a web tool and processing a folder of photographs are different jobs. Press provides local comparison and conversion. ImageGuide explains the choices and helps identify what is worth fixing.

[Open the guides](https://www.imageguide.dev/guides/) or [get the Chrome extension](https://chromewebstore.google.com/detail/hinifcidioledficgenmdncpkifnngap).
