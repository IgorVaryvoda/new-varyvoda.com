---
title: "59 of my WebP files were PNGs"
date: 2026-09-04
lastmod: 2026-09-23
draft: false
content_type: "Build record"
description: "The first Press audit found 59 PNGs hiding behind WebP filenames on my own image-optimization site. I checked the historical files again."
featuredImage: "/images/posts/59-webp-files-were-pngs.webp"
image_alt: "A slate-blue surface peels back to expose contrasting geometric layers lit with amber."
ogImage: "https://www.varyvoda.com/images/posts/59-webp-files-were-pngs.jpg"
---

The first folder I pointed my desktop image auditor at was `imageguide/public`. It contained 169 files named `.webp`. Fifty-nine were PNGs.

This was my image-optimization site. The one where I tell other people how to serve images.

The finding is in the first [Press commit](https://github.com/IgorVaryvoda/press/commit/19dc00d1389dbc6793a92e4ae045e5dcd0812bc9), dated 19 August 2026. Before writing this, I checked the headers again in ImageGuide's repository at `e8c14e1`, from the same day. Same result: 59 PNGs and 110 WebPs. (That's the August checkout, not today's site.)

## A filename is a claim

Renaming a file to `.webp` doesn't convert anything. An export step can save a PNG under a WebP name, and the browser shows it anyway, because browsers look at the bytes. The picture looks fine. The file list lies.

So Press reads the file signature before it reports a format. If the extension disagrees, that's a finding. Renaming the file makes the name honest. Re-encoding it is a separate decision, because it changes size and quality.

I've written about image delivery for years. It took my own folder to show me that the first check is much more basic than picking an encoder: is this file even what it says it is?

## Read before decoding

The first version only audited. It read headers and listed the files, heaviest first. Conversion didn't exist yet.

A folder can hold thousands of large photos. Decoding every one just to learn its dimensions is wasted work. The current app reads metadata first and decodes thumbnails for the rows the viewport asks for.

Some formats are trickier. A camera raw file can expose a small embedded preview instead of the full photo, so Press counts those as skipped. It counts unsupported HEIC files too. A folder it can only partly read shouldn't look empty.

## The smaller file still has to look right

Press grew a comparison view, then WebP, AVIF and JPEG XL conversion. By default it writes results to `optimized/`, so you can try settings without touching the originals. If you do want to replace them, there's an explicit option, and it keeps backups.

Before conversion, the saving is labelled as an estimate. After conversion, the number comes from the file that was actually written. If the file got bigger, Press says so.

It's the same lesson as the 59 PNGs. A filename, an estimate and a real output are different things, and the app should always tell you which one you're looking at.

[See Press](/projects/press/) or read about [what the browser auditor can measure](/posts/what-an-image-auditor-can-measure/).
