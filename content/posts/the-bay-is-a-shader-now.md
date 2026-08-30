---
title: "The bay outside my window is a shader now"
date: 2026-07-22
lastmod: 2026-08-07
draft: false
content_type: "Build record"
page_css: ["shader"]
description: "I saw a raymarched ocean on earendil.com and wanted one. Now my homepage draws the bay I live on, and Lighthouse taught me who browses without a GPU."
ogImage: "https://www.varyvoda.com/images/posts/the-bay-is-a-shader-now-og.jpg"
---


A few days ago I opened [earendil.com](https://earendil.com/) and forgot why I came. Behind the landing page there's a live fragment shader: a raymarched ocean rolling under a night sky, stars, waves, the whole thing computed per pixel while you read.

I watched it for a while, closed the tab, and decided to build one for my homepage.

Then Lighthouse gave my static Hugo site a performance score of **25** and measured two and a half minutes of blocked main thread. The scene ran smoothly on every device I had tested. In the lab, it moved at a geological frame rate.

The scene ran well on my devices. The slow audit was using software rendering. First, the bay.

I did not want to copy their scene. If my homepage rendered water, it should show the bay outside my window in Herceg Novi. Luštica sits on the right, the Orjen massif behind it, and town lights follow both shores at night.

## Paint the bay, not a demo

The rule I set early: match the photographs, not "pretty shader" defaults. Every WebGL demo on the internet converges on the same teal water and purple sky. The actual Adriatic on a July morning is different. The water is a deep azure with a calm swell, the headlands are muted green under haze, and the far ranges are gray crags, not gradients.

<figure class="shader-evidence">
  <div class="shader-evidence-grid">
    <div class="shader-evidence-panel">
      <img
        src="/images/posts/the-bay-is-a-shader-now-reference-960.webp"
        srcset="/images/posts/the-bay-is-a-shader-now-reference-480.webp 480w, /images/posts/the-bay-is-a-shader-now-reference-960.webp 960w"
        sizes="(max-width: 680px) calc(100vw - 3.6rem), 370px"
        width="960"
        height="540"
        alt="Day photograph of the Bay of Kotor from Herceg Novi"
        loading="lazy"
        decoding="async"
        fetchpriority="low">
      <span class="shader-evidence-label">Reference photograph</span>
    </div>
    <div class="shader-evidence-panel">
      <img
        src="/images/posts/the-bay-is-a-shader-now-live-960.webp"
        srcset="/images/posts/the-bay-is-a-shader-now-live-480.webp 480w, /images/posts/the-bay-is-a-shader-now-live-960.webp 960w, /images/posts/the-bay-is-a-shader-now-live.webp 1170w"
        sizes="(max-width: 680px) calc(100vw - 3.6rem), 370px"
        width="960"
        height="540"
        alt="The live Varyvoda homepage showing the bay shader in dark mode"
        loading="lazy"
        decoding="async"
        fetchpriority="low">
      <span class="shader-evidence-label">Live shader · dark mode</span>
    </div>
  </div>
  <figcaption>The photograph supplies the geography. The shader rebuilds it as water, layered ridges, town lights, weather and time.</figcaption>
</figure>

The mountain textures are crops of my own Nikon photos of those exact slopes, baked into an atlas. A 512-pixel mask says which ridge is near and which is far. The water uses [afl_ext's ocean technique](https://www.shadertoy.com/view/M3fGDl). Procedural noise makes the clouds. A ship crosses the bay and leaves smoke. The sun spends its first eight minutes climbing off the ridge line, and the light relaxes as it rises.

There are two scenes, really. The default is night: a deep indigo duotone with a gibbous moon and warm golden light necklaces along both shores, because the real town at night is sodium lamps, not gray noir. Day is that backlit sunrise.

Day mode is still weaker than night mode. I plan to work on the sunrise again.

## My contribution was reference photos and rejection

I did not type the GLSL. Codex built the first version and Claude handled many later edits. The file is about 1,900 lines. I supplied the reference photos, described what was wrong, and rejected iterations until the scene matched the place.

That sounds like the easy part until the output is technically correct and visually wrong. The models could make a moon, a sun and a string of lights. They could not decide whether any of them belonged over this bay.

<div class="shader-notes" aria-label="Art-direction notes from the shader iterations">
  <div class="shader-note">
    <span>Moon · first pass</span>
    <q>very basic</q>
    <small>Flat disc, no maria, no convincing terminator.</small>
  </div>
  <div class="shader-note">
    <span>Sun · first pass</span>
    <q>too fucking big</q>
    <small>The bright corner clipped before the disc could read as light.</small>
  </div>
  <div class="shader-note">
    <span>Sun · second pass</span>
    <q>a shitty disc</q>
    <small>Smaller was not enough. The surrounding tone had to change.</small>
  </div>
</div>

The first moon was a flat gray circle. A moon you'd accept in a browser reads as real only with maria, a soft terminator, and a halo that fades over the disc instead of around it. Meanwhile the night reference photo had a huge blown-out moon. It took me a moment to notice that was a long-exposure artifact. The camera lied. We kept its city lights and threw away its moon.

The sun was worse. The real problem was tone mapping. Through an ACES curve the bright corner of the sky clips to white, so making the sun brighter does literally nothing. A sunrise reads only when you darken and saturate everything around the core, then let a small disc kiss the ridge line and dissolve into glare and rays. Contrast comes from replacing tone, not adding light.

The town lights started out as a uniform silver string, dull, all the same size. Real towns have a hierarchy: hundreds of dim specks, a layer of streetlamps, a few rare floodlights that bloom, plus red beacons on the summits. Three size tiers and a warm-to-cool mix later, the shoreline looked inhabited.

One pale halo along the far crest survived five fixes because three causes were stacked on top of each other. Every fix removed one contributor and the halo stayed. If a visual bug survives multiple correct-looking fixes, stop assuming one cause.

## Click the moon

The sun and the moon are the theme toggle. Click the moon and morning comes. Click the sun and night falls again. A small hit test in JavaScript mirrors the shader's own coordinates, so the clickable spot is exactly where the disc is drawn.

It worked in local tests and failed in production for a day. The click handler had shipped. A second required file was still uncommitted, and a defensive `if` hid the failure. Check `git status` against the complete feature, not against your memory.

## The benchmark was the user I forgot

The Lighthouse Total Blocking Time metric reported **152,350 ms**. The Chrome trace around the same audit showed 174 seconds of main-thread activity. Different measurements, same catastrophe: a static page had become unusable for minutes.

Chrome reported SwiftShader as the renderer. WebGL had fallen back to software rasterisation and was running the fragment shader on the CPU. The mobile audit then throttled that CPU four times. Frames that took milliseconds on my devices took seconds in the lab.

My first reaction was to blame the lab. Real visitors have GPUs. The scene even watches its own frame times on real hardware and drops render resolution when things get slow. I briefly considered sniffing the Lighthouse user agent and handing the bot a quiet page.

Then I started listing who else browses without a GPU. Virtual machines. Remote desktop sessions. Corporate laptops with acceleration disabled by policy or by a broken driver. For all of them, WebGL "works" exactly the way it works for Lighthouse: silently, on the CPU, at a geological frame rate.

The audit represented a real class of visitor I had missed.

That changed the fix. Don't detect the auditor. Ask WebGL what it is actually rendering on, and believe the answer:

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

That bailout took Total Blocking Time from 152,350 ms to **40 ms**. It also cut the lab download from 1,085 KiB to 363 KiB, because a scene that never starts never downloads its textures.

<figure class="shader-scorecard">
  <div class="shader-metrics">
    <div class="shader-metric">
      <span>Performance score</span>
      <strong><del>25</del> → <b>91</b></strong>
    </div>
    <div class="shader-metric">
      <span>Total Blocking Time</span>
      <strong><del>152,350 ms</del> → <b>40 ms</b></strong>
    </div>
    <div class="shader-metric">
      <span>Lab download</span>
      <strong><del>1,085 KiB</del> → <b>363 KiB</b></strong>
    </div>
  </div>
  <figcaption>Same page. The software-rendered hardware class gets the existing CSS fallback instead of a multi-minute slideshow.</figcaption>
</figure>

### Testing the renderer I had just banned

My screenshot and benchmark tooling also runs headless Chromium, which means it runs SwiftShader, the renderer I'd just told the site to refuse. The first test after shipping the bailout produced a beautiful screenshot of the fallback gradient. The detection now has an escape hatch (`?atmosphere=force`), and every test URL in my notes carries it.

Its first frame takes six to ten seconds because linking the shader program blocks the main thread. My click-the-moon tests kept dying: the click landed during the stall, queued, and evaporated on navigation. A real GPU links the same program in milliseconds. The tests now wait for the scene's first-frame marker before touching anything.

## The other 66 points

The shader bailout did not take the score from 25 to 91 by itself. The rest was less cinematic:

- **Three render-blocking requests disappeared.** I self-hosted normalize.css and both font families, then concatenated the CSS into one fingerprinted, same-origin file.
- **A 133 KB screenshot became 47 KB.** Hugo now generates the right `srcset` size for its 600-pixel slot. I run image optimization tooling for a living, so getting this wrong on my own homepage was a useful genre of embarrassment.
- **The home link became speakable.** It displayed “IV Varyvoda” while its accessible name said “Varyvoda home.” Voice-control users say what they see. The two now match.

## What the score was saying

The score exposed a hardware class I had forgotten. The right fix was to detect software rendering and return the existing static fallback, not to detect Lighthouse.

Go [click the moon](/). The sun climbs off the ridge, the headlands turn green under the haze, and Lighthouse never sees any of it. Both of those are correct.
