---
title: "Press"
date: 2026-08-19
lastmod: 2026-09-04
draft: false
homepage_weight: 5
project_url: "https://www.imageguide.dev/press/"
github_url: "https://github.com/IgorVaryvoda/press"
image: "/images/press/audit-2026-08-26.webp"
image_alt: "Press auditing a folder of twelve images beside its conversion settings, captured in August 2026"
description: "A desktop image auditor and converter. Read what a folder contains, compare the output and convert locally to WebP, AVIF or JPEG XL."
hero_kicker: "Local image work"
hero_intro: "I built Press to audit and convert folders of images on my own machine. Its first audit found PNGs hidden behind WebP filenames on my own site."
hero_mark: "Desktop + CLI"
hero_scope: "Folder to checked output"
hero_primary_label: "Get Press"
hero_frame_label: "Press / August 2026"
hero_frame_status: "Repository capture"
hero_flow:
  - "Open a folder"
  - "Inspect the findings"
  - "Compare the result"
  - "Write the output"
tech_stack: ["Rust", "GPUI", "WebP", "AVIF", "JPEG XL"]
role: "Creator and builder"
stewardship:
  state: "evolving"
  note: "I improve the scanner, comparison, conversion and desktop packaging against real image folders."
last_tended: "2026-09-04"
feedback_url: "https://github.com/IgorVaryvoda/press/issues"
proof:
  - value: "59 / 169"
    label: "Mislabeled files in the first historical audit"
  - value: "Open source"
    label: "Scanner, converters and tests"
imperfect: "Camera raw and unsupported HEIC files are counted but excluded from the audit. Savings projections are samples, and local AI availability depends on the platform."
weight: 5
---

## The first folder was mine

The first audit found 59 PNG files among 169 files named `.webp` in ImageGuide's public directory. Reading the historical Git blobs reproduced the count. A file extension had been telling me the wrong thing about my own images.

Press reads file contents to identify formats, then lists dimensions, weight and findings. The [first-audit story](/posts/59-webp-files-were-pngs/) explains what that changed.

## Compare before writing

The interface puts conversion settings beside the files. Choose the format, quality and maximum size, then compare the original and result. It can write WebP, AVIF and JPEG XL.

The ordinary copy workflow writes under `optimized/` or another selected destination. The current app also has an explicit replacement mode with an originals backup. Choosing replacement is different from making a copy.

<img src="/images/press/comparison-2026-08-26.webp" alt="Press original and converted image comparison from the August 2026 repository screenshots" loading="lazy" decoding="async">

*August 2026 repository capture. The comparison lets you inspect the image rather than judging compression from a percentage alone.*

Projected savings are estimates. Completed output sizes come from the written files, including files that grew.

## Keep the local path local

Audit, comparison and conversion run on the computer. Sirv transfers and hosted Studio tools are explicit remote operations. They are not part of scanning a folder.

The scanner reads headers first. The virtualized list requests thumbnails for visible rows instead of decoding every photograph in a large folder. The CLI provides the same local audit and conversion work, with JSON output for scripts and agents.

## Part of ImageGuide

[ImageGuide](/projects/imageguide/) explains delivery choices and audits images already on a web page. Press works on the files before they reach that page. Both need to distinguish a measured result from an estimate.

The public download page links to packaged builds. The screenshots here record the August interface, while the repository continues to change.
