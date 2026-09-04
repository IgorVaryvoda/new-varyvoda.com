---
title: "59 of my WebP files were PNGs"
date: 2026-09-04
draft: false
content_type: "Build record"
description: "The first Press audit found 59 PNGs hiding behind WebP filenames on my own image-optimization site. I checked the historical files again."
---

The first folder I pointed my desktop image auditor at was `imageguide/public`. It contained 169 files named `.webp`. Fifty-nine were PNGs.

This was my image-optimization site.

The finding is in the first [Press commit](https://github.com/IgorVaryvoda/press/commit/19dc00d1389dbc6793a92e4ae045e5dcd0812bc9), dated 19 August 2026. Before writing this, I checked the image headers in ImageGuide's repository at `e8c14e1`, from the same day. The count reproduced: 59 PNGs and 110 WebPs. It describes that historical checkout, not today's site.

## A filename is a claim

A `.webp` suffix does not convert the bytes inside a file. An export step can save one format under another name, and a browser may still display it. The picture looks fine while the file list tells you the wrong thing about its encoding.

Press reads the file signature before reporting a format. If the extension disagrees, that disagreement is a finding. Renaming the file makes its name truthful. Re-encoding it is a separate decision that may change its size and quality.

I had been writing advice about image delivery for years. My own directory was a useful place to discover that the first check needed to be more basic than choosing an encoder.

## Read before decoding

The first version only audited. It read headers and listed the files, heaviest first. Conversion had not been written yet.

A folder can contain thousands of large photographs. Decoding every one just to learn its dimensions does work the interface may never need. The current app reads metadata first and decodes thumbnails for the rows the viewport asks for.

Some formats need a more careful answer. Camera raw containers can expose a small embedded preview instead of the full photograph. Press counts those files as skipped. It also counts unsupported HEIC files rather than presenting a partly unreadable folder as empty.

## The smaller file still has to look right

Press grew a comparison view, then WebP, AVIF and JPEG XL conversion. In the normal copy workflow it writes results under `optimized/`, so comparing settings does not require overwriting the source. The current app also has an explicit replacement path with backups. That is a separate choice.

A projected saving is labelled as an estimate. After conversion, the result comes from the file actually written. If it grew, the app reports that too.

The distinction is familiar from the first audit: an extension, an estimate and a completed output are three different kinds of evidence. The interface should say which one it is showing.

[See Press](/projects/press/) or read about [what the browser auditor can measure](/posts/what-an-image-auditor-can-measure/).
