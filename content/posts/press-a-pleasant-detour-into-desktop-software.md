---
title: "Press: a pleasant detour into desktop software"
date: 2026-09-08
lastmod: 2026-09-23
draft: false
content_type: "Build record"
description: "Zed made me want to try GPUI. Press gave me a folder of images to work on. A personal detour into Rust, responsive interfaces and an app still finding its shape."
featuredImage: "/images/posts/press-a-pleasant-detour-into-desktop-software.webp"
image_alt: "A textured field of blue and grey fragments narrows into a compact cluster of shapes with amber accents."
ogImage: "https://www.varyvoda.com/images/posts/press-a-pleasant-detour-into-desktop-software.jpg"
---

I started Press because I wanted to play with GPUI.

I'd always been impressed by how fast [Zed](https://zed.dev/) feels. Trying [Zeron](https://zeron.sh/) for agent work gave me that reaction again: the speed is mind-fucking-blowing. It makes me want to get under the hood and build something with that kind of responsiveness myself.

[GPUI](https://gpui.rs/), the Rust UI framework from Zed's creators, was the reason to start. An image tool gave me something useful to build with it.

That's the origin of [Press](/projects/press/). The product direction is still taking shape. The curiosity was there first.

## A folder of images was a good place to start

Images are familiar territory for me. Between [Sirv Studio](/projects/sirv-studio/) and [ImageGuide](/projects/imageguide/), I already spend plenty of time thinking about how people prepare, inspect and use them. A folder on my own computer gave the GPUI experiment a concrete job.

Open it. See what's in it. Find the heavy files. Try a conversion. Look at the result.

There's enough there to make an actual application: a file list, thumbnails, sorting, selection, settings and a comparison view. There is also a very direct way to judge whether it is useful. I have the input files and the output files in front of me.

The first audit found PNGs hiding behind WebP filenames in my own ImageGuide directory. I've [written about that discovery separately](/posts/59-webp-files-were-pngs/). It gave the experiment a useful first result before conversion even existed.

Press now audits folders and converts images locally to WebP, AVIF, JPEG XL and JPEG. The normal copy workflow writes to an output folder. Auditing, comparing and converting don't require sending those images to a server.

<img src="/images/press/audit-2026-09-08.webp" alt="Press 0.6.6 listing six product-photo exports beside the folder sidebar and conversion settings, captured on September 8, 2026" width="1170" height="768" loading="lazy" decoding="async">

*The audit view in Press 0.6.6, captured on macOS on September 8, 2026. [Capture details and demo photo credits](https://github.com/IgorVaryvoda/press/blob/main/docs/screenshots.md).*

## The appeal of GPUI

What I like about Zed and Zeron is the feeling that the interface keeps up with me. I haven't benchmarked it. The feeling was enough.

GPUI gives me a Rust interface with GPU-accelerated rendering. Zed's team has a [technical explanation of the rendering approach](https://zed.dev/blog/videogame), including how it draws the rectangles, text and images that make up an application window.

The API also has some familiar ideas for someone building web interfaces: nested elements, flex layouts and composable styling. The composition is written in Rust. Press currently uses [`gpui-kit`](https://github.com/IgorVaryvoda/press/blob/main/Cargo.toml) to bring the matching GPUI, platform, component and asset crates together.

I still build web software. Studio is my main project. Press is a chance to work with a different set of tools and a much more contained interaction: a person, a window and their files.

## A fast renderer still needs sensible work behind it

An image tool is a useful reminder that drawing the window is only part of responsiveness.

Press reads image headers first. It doesn't need to fully decode a photograph just to list its dimensions. The list is virtualised, and thumbnails are decoded off the main thread as rows become visible. Opening a folder doesn't mean decoding every image in it before you can start looking around.

Conversion has a different workload. A file being encoded needs its decoded image in memory, so running more conversions at once is not automatically better. Press [bounds concurrency by encoder](https://github.com/IgorVaryvoda/press#converting): WebP and AVIF use different limits, while JPEG XL processes one file at a time because its encoder uses multiple cores internally. GPUI's rendering doesn't make the encoders free.

Even a control as ordinary as the quality slider raises a scheduling question. The savings estimate comes from encoding a sample. Starting that work for every pixel of a drag would be wasteful, so it waits for a short pause before running again.

A fast framework gets you a fast window. The rest of the speed you have to arrange yourself.

## The comparison view gives the app a purpose

A file-size reduction is interesting. Seeing what happened to the image is more useful.

Press puts the original and converted result beside each other. I can change the format, quality and maximum size, then step through the images without setting everything up again. That makes the application a place to make a decision, rather than just a button that produces smaller files.

There are small choices in that workflow that matter. When an output-size limit is set, the original side is resized for comparison too, so I'm comparing compression at the intended dimensions. After a batch finishes, the result view reads the files that were actually written instead of generating another preview.

<img src="/images/press/comparison-2026-09-08.webp" alt="Press 0.6.6 showing a product photo and its WebP preview with a draggable comparison divider" width="1170" height="768" loading="lazy" decoding="async">

*The September 2026 comparison view. The useful question is whether I would use the output, not just how many bytes it saved.*

This is the size of work I like in Press. A folder browser, a comparison, a better place for a control. Each change is something I can try right away, and it usually shows me the next one.

## Built with AI, shaped by using it

Press is AI-assisted, like everything else I build now. I didn't write every line of Rust by hand.

The fun is learning a technology through a real tool. I get help with the implementation and still care a lot about what the app does, how it behaves and whether I like using it.

Sometimes I start a project just to play with a new technology. Building something useful gives the play a direction.

## I haven't decided its final shape

I don't have a clear vision for what Press should become yet. I'm happy to find out by building and using it.

There is an obvious connection to Studio. Press already has [explicit Sirv transfers and hosted Studio image operations](https://github.com/IgorVaryvoda/press#sirv-studio-api). Those are separate from the local audit and conversion workflow: choosing a remote operation is what sends a file out.

I can see Press becoming a way for people to find Studio. Someone starts with files on their own machine, likes the desktop tool and later needs shared review, supplier workflows or more hosted processing. But I want that to happen because Press is useful by itself, not because I built it as a funnel. And I don't need that plan to justify having fun building it.

[Try Press](https://www.imageguide.dev/press/) or [look through the source](https://github.com/IgorVaryvoda/press).
