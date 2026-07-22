---
title: "The bay outside my window is a shader now"
date: 2026-07-22
draft: false
description: "I saw a raymarched ocean on earendil.com and wanted one. Now my homepage draws the bay I live on, and Lighthouse taught me who browses without a GPU."
---

A few days ago I opened [earendil.com](https://earendil.com/) and forgot why I came. Behind the landing page there's a live fragment shader: a raymarched ocean rolling under a night sky, stars, waves, the whole thing computed per pixel while you read.

I watched it longer than I'll admit, closed the tab, and did the only reasonable thing. Two days later my homepage had a shader of its own.

But not their scene. If my homepage renders a body of water, it should render the one outside my window. I live in Herceg Novi, at the mouth of the Bay of Kotor. Green Luštica headlands on the right, the rocky Orjen massif behind, town lights strung along both shores at night. That view is one of the reasons I'm here. It deserved the pixels.

## Paint what you can photograph

The rule I set early: match the photographs, not "pretty shader" defaults. Every WebGL demo on the internet converges on the same teal water and purple sky. The actual Adriatic on a July morning is different. The water is a deep azure with a calm swell, the headlands are muted green under haze, and the far ranges are gray crags, not gradients.

So the scene is built from the real thing. The mountain textures are crops of my own Nikon photos of those exact slopes, baked into an atlas. A tiny 512-pixel mask image encodes which ridge is near and which is far. The water is raymarched on afl_ext's ocean technique. Clouds are fbm noise. A ship crosses the bay and leaves smoke. The sun spends its first eight minutes climbing off the ridge line, and the light relaxes as it rises.

There are two scenes, really. The default is night: a deep indigo duotone with a gibbous moon and warm golden light necklaces along both shores, because the real town at night is sodium lamps, not gray noir. Day is that backlit sunrise.

Full disclosure: day mode is the weaker of the two right now. The night scene is where the love went, and I know it. The sunrise gets its pass later.

And here I should be honest about the process, because it's the same one I keep [writing about](/posts/two-theories-of-a-programmer/): I didn't type the GLSL. Codex built the first version, and Claude did the long art-direction grind that followed. The file is about 1,900 lines and my contribution was reference photos and rejection. A lot of rejection.

## The scene fights back

The first moon was a flat gray circle. My feedback, verbatim: "very basic." A moon you'd accept in a browser reads as real only with maria, a soft terminator, and a halo that fades over the disc instead of around it. Meanwhile the night reference photo I was matching had a huge blown-out moon, and it took me a moment to notice that's a long-exposure artifact. The camera lied. We kept the city lights from that photo and threw away its moon.

The sun was worse. My notes from that afternoon record the first visible disc as "too fucking big," and the corrected version an hour later as "a shitty disc." The real problem was tone mapping. Through an ACES curve the bright corner of the sky clips to white, so making the sun brighter does literally nothing. A sunrise only reads if you darken and saturate everything around the core, then let a small disc kiss the ridge line and dissolve it in glare and crepuscular rays. Contrast comes from replacing tone, not adding light.

The town lights started out as a uniform silver string, dull, all the same size. Real towns have a hierarchy: hundreds of dim specks, a layer of streetlamps, a few rare floodlights that bloom, plus red beacons on the summits. Three size tiers and a warm-to-cool mix later, the shoreline looked inhabited.

And one artifact, a pale halo along the far crest, survived five separate fixes because three different causes were stacked on top of each other. Every fix removed one contributor and the halo stayed. If a visual bug survives multiple correct-looking fixes, stop assuming one cause.

## Click the moon

The sun and the moon are the theme toggle. Click the moon and morning comes. Click the sun and night falls again. A small hit test in JavaScript mirrors the shader's own coordinates, so the clickable spot is exactly where the disc is drawn.

This feature taught me an embarrassing lesson in shipping. The toggle worked perfectly in every local test and was dead in production for a day. The click handler had shipped, but the second file it depended on sat uncommitted on my disk, and a defensive `if` made the failure silent. A feature spans files, and it isn't done until every one of them is committed. Check `git status` against the feature, not against your memory.

There's also a small hint now. First-time visitors get one italic line near the moon suggesting they click it. Toggle once and it never appears again.

## Lighthouse doesn't have a GPU

Then I ran Lighthouse.

Performance score: **25**. Total Blocking Time: **152,350 ms**. That unit is milliseconds, so the audit measured two and a half minutes of blocked main thread on a static Hugo site.

Here's what actually happens. Lighthouse and PageSpeed Insights run headless Chrome on servers with no GPU. When a page there asks for WebGL, Chrome doesn't refuse. It quietly falls back to SwiftShader, a software rasterizer that runs your fragment shader on the CPU. Then the mobile audit throttles that CPU four times. A frame that costs two milliseconds on any phone GPU from the last decade costs seconds in the lab. The trace showed 174 seconds of main-thread time. The scene wasn't slow. It was running on the wrong kind of silicon entirely.

My first reaction was to blame the lab. Real visitors have GPUs. The scene even watches its own frame times on real hardware and drops render resolution when things get slow. I briefly considered sniffing the Lighthouse user agent and handing the bot a quiet page.

Then I started listing who else browses without a GPU. Virtual machines. Remote desktop sessions. Corporate laptops with acceleration disabled by policy or by a broken driver. For all of them, WebGL "works" exactly the way it works for Lighthouse: silently, on the CPU, at a geological frame rate.

Lighthouse wasn't lying about my site. It was impersonating my worst-case visitor with perfect accuracy.

That reframes the fix. You don't detect the auditor. You ask WebGL what it's actually rendering on, and believe the answer:

```js
var info = gl.getExtension("WEBGL_debug_renderer_info");
var renderer = String(gl.getParameter(
  info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER
));
if (/swiftshader|llvmpipe|softpipe|software|basic render/i.test(renderer)) {
  canvas.classList.add("ambient-canvas-fallback");
  var lose = gl.getExtension("WEBGL_lose_context");
  if (lose) lose.loseContext();
  return;
}
```

On my desktop the renderer string says `ANGLE (NVIDIA GeForce RTX 3060 Ti ...)` and the scene runs. On Lighthouse's hardware it says SwiftShader, the regex matches, and the page takes the CSS gradient fallback it already had for browsers without WebGL. Twelve lines, and they aren't a cheat. A visitor on a GPU-less VM gets a page that loads instantly instead of a slideshow.

That one change took Total Blocking Time from 152,350 ms to **40 ms**. It also cut the bot's page weight from 1,085 KiB to 363 KiB, because a scene that never starts never downloads its textures.

## The boring points

The shader was the headline, but 25 doesn't become 91 on one fix. The rest was the unglamorous kind of work.

The page pulled normalize.css from one CDN and two font families from Google Fonts, three render-blocking requests to other people's servers before first paint. I self-hosted everything. Google's css2 API hands you per-subset font files, `unicode-range` means a visitor only downloads the subsets their language needs, and a variable font covers weights 400 through 700 in one file. Thirteen woff2 files, 408 KB on disk, of which a typical visitor fetches two or three. All the CSS now concatenates into a single fingerprinted stylesheet, one same-origin request.

The featured screenshot was a 133 KB image in a 600-pixel slot. Hugo generates srcset variants at build time. Now it's 47 KB. I run image optimization tooling for a living and this was wrong on my own homepage, which is a genre of embarrassment worth reporting honestly.

And one real accessibility bug: the home link shows "IV Varyvoda" but its `aria-label` said "Varyvoda home". Voice-control users say what they see, and if the visible text isn't inside the accessible name, "click IV Varyvoda" does nothing.

Final score: 25 to **91** on mobile emulation.

## Testing on the renderer you just banned

One recursion worth admitting. My own screenshot and benchmark tooling runs headless Chromium, which means it runs SwiftShader, the exact renderer I'd just told the site to refuse. The first test run after shipping the bailout produced a beautiful screenshot of the fallback gradient. The detection now has an escape hatch (`?atmosphere=force`) and every test URL in my notes carries it.

SwiftShader had one more lesson in it. Its first frame takes six to ten seconds because linking the shader program blocks the main thread. My click-the-moon tests kept dying mysteriously: the click landed during the stall, queued, and evaporated on navigation. No real user on real hardware will ever hit this, since a GPU links the same program in milliseconds. The tests now wait for the scene's first-frame marker before touching anything.

## What the score was saying

The lesson is not "Lighthouse is unfair to WebGL," and it's definitely not "chase 100 at any cost." The 25 was a proxy for a hardware class I'd forgotten existed, reported by the one visitor honest enough to sit through all 174 seconds and write it down. The right response was to detect the capability, not the auditor, and serve each class of hardware a page it can actually run.

Go [click the moon](/). The sun climbs off the ridge, the headlands turn green under the haze, and Lighthouse never sees any of it. Both of those are correct.
