---
title: "Press"
date: 2026-08-19
lastmod: 2026-09-08
draft: false
homepage_weight: 5
project_url: "https://www.imageguide.dev/press/"
github_url: "https://github.com/IgorVaryvoda/press"
image: "/images/press/audit-2026-08-26.webp"
image_alt: "Press showing image formats, dimensions and file sizes beside conversion settings in an August 2026 capture"
description: "A native desktop app for inspecting, comparing and batch-converting images locally, with a CLI and optional Sirv Studio tools. Built in Rust."
hero_kicker: "Your images. Your machine."
hero_intro: "Open a folder, see what's taking up space, and compare a smaller version before converting the batch. Press does the image work locally, with optional Sirv and Studio connections when you need them."
hero_mark: "Desktop + CLI"
hero_scope: "macOS · Windows · Linux"
hero_primary_label: "Get Press"
hero_frame_label: "Press / August 2026"
hero_frame_status: "Earlier interface capture"
hero_flow:
  - "Open your images"
  - "Find what needs work"
  - "Compare the result"
  - "Export the batch"
tech_stack: ["Rust", "GPUI", "WebP", "AVIF", "JPEG XL"]
role: "Creator, designer and builder; AI-assisted development"
stewardship:
  state: "evolving"
  note: "An actively developed desktop tool. I enjoy building it and am exploring where it can go, including a closer connection to Studio."
last_tended: "2026-09-08"
feedback_url: "https://github.com/IgorVaryvoda/press/issues"
proof:
  - value: "Local processing"
    label: "Audit, compare and convert without uploading your images"
  - value: "Open source"
    label: "Rust desktop app and command-line tools"
imperfect: "Camera raw and HEIC/HEIF files are counted but skipped. Savings projections are estimates. Local AI needs a supported runtime; hosted Studio tools require an API key and upload the selected images."
weight: 5
---

## A folder, not an upload queue

Press is the desktop image tool I wanted next to my files. A folder of product photos or website exports shouldn't need a round trip through a web converter just to find out what's in it and make smaller versions.

Open a folder or drop in a selection of images. Press shows their actual formats, dimensions and file sizes, with the heaviest files first. Filter the list, inspect an image, choose an output format and size, and compare the result before running the batch.

It is a native application built in Rust with GPUI, with [downloads for macOS, Windows and Linux](https://www.imageguide.dev/press/). The local audit, comparison and conversion workflow needs no account. There is a command-line version of the same work for scripts and agents.

## Find the problem before choosing a format

The first folder I pointed it at was my own. ImageGuide's public directory had 169 files named `.webp`. Fifty-nine were actually PNGs. Press reads the file contents rather than trusting the extension, so the mismatch was immediately visible. I wrote up [the first audit and what it found](/posts/59-webp-files-were-pngs/).

Wrong extensions are only one problem. A photograph might have the right format and still be far larger than the place it will appear. Press puts the dimensions and file size in the same view so you can decide whether to resize, re-encode, or leave it alone.

The list and gallery are virtualized, and thumbnails are decoded as they come into view. Opening a large folder doesn't mean decoding every full-resolution image before you can start looking around.

## Compare, then convert

Choose WebP, AVIF or JPEG XL, set the quality or lossless option, and cap the longest edge when you need a smaller image. Inspect the original and converted result side by side, then move through the images with the keyboard to check the awkward ones.

<img src="/images/press/comparison-2026-08-26.webp" alt="Original and converted image shown side by side in Press, captured in August 2026" loading="lazy" decoding="async">

*An August 2026 view of the comparison. The interface has continued to evolve; this is an actual earlier capture, not a mockup.*

Before a batch runs, Press estimates the output size from a sample. Afterwards, it reports the files it actually wrote, including any that got bigger. A large savings percentage is less interesting than an image that still looks right.

By default, conversion writes copies under `optimized/` or another destination you choose. Replacing originals is a separate, explicit mode with an originals backup. You shouldn't have to overwrite the source just to try an encoder.

## The same work without a window

The CLI makes Press useful in a build script, a repeatable export, or an agent's workflow. Audit is read-only; conversion writes the output. These are ordinary commands, not a separate hosted service:

```bash
# Inspect a folder and get a machine-readable report.
press audit ./images --json

# Preview the conversion plan without writing files.
press convert ./images --format avif --max-edge 1600 --quality 60 --dry-run

# Write converted copies to a separate directory.
press convert ./images --format avif --max-edge 1600 --quality 60 --output ./exports
```

The [command reference](https://github.com/IgorVaryvoda/press#status) covers the options, JSON reports and exit codes. `press skill` prints the bundled instructions for coding agents.

## Connect when the job calls for it

There are two optional connections. Pair a local folder with **Sirv** to push or pull images. Use a **Studio API key** to run hosted image tools such as background removal, upscaling and image-to-image generation, then inspect the downloaded result in Press.

Those are remote operations you choose to run. They are not a hidden part of auditing or converting a local folder. Local background removal and 4× upscaling are also available on supported setups, with the runtime and model requirements described in the [README](https://github.com/IgorVaryvoda/press#optional-sirv-sync).

[ImageGuide](/projects/imageguide/) looks at images on the web. Press works on the files on your machine. [Studio](/projects/sirv-studio/) handles the wider product-content workflow. They can be useful together without making an account a prerequisite for a local conversion.

## Useful now, still taking shape

I don't have Press's entire future mapped out. I enjoy working on it. It's a pleasant detour from Studio, and a chance to build a desktop application I like using.

I expect to explore the Studio connection further. A useful local tool could become a good way for people to discover Studio when they need its AI tools or supplier workflows. That is a direction I'm interested in, not a claim that Press already covers the whole supplier journey or has proved itself as an acquisition channel.

For now, the app has a straightforward job: help you understand your images and produce the versions you need. I want that to feel good in its own right.

[Get Press](https://www.imageguide.dev/press/), browse the [source and releases](https://github.com/IgorVaryvoda/press), or read [why I don't confuse needing variety with being unfocused](/posts/i-get-bored-i-still-ship/).
