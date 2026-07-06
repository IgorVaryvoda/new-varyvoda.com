---
title: "Image SEO in 2026: Everything That Changed Since 2019"
date: 2026-07-06
draft: false
description: "Seven years ago I wrote a guide to image SEO for e-commerce. I re-audited every piece of advice in it. Some aged beautifully, some died, and the biggest shift is one nobody saw coming: the searcher is often not human anymore."
---

In 2019 I wrote a [guide to image SEO for e-commerce](/posts/image-seo/). It did well, it ranked, and by the standards of the time it was good advice.

Seven years is an eternity in search. So I went back through the old article, line by line, and audited every claim against how images actually get discovered in 2026. This post is the result: what held up, what quietly died, and what's genuinely new.

The one-sentence summary: **the fundamentals survived, the tactics changed, and the audience got weird.** In 2019 you optimized images for people using Google Images. In 2026 you optimize them for vision models deciding whether your product deserves to be shown to a human at all.

## What held up

### Alt text — now more important than ever

In 2019 I told you to write descriptive, honest alt text and skip the keyword stuffing. That advice didn't just survive — it got a promotion.

Alt text was always dual-purpose: accessibility first, ranking signal second. It now has a third job, and it's the biggest one: **it's what language models read when they encounter your image.** When a shopping assistant — ChatGPT, Perplexity, Google's AI Mode — evaluates your product page, your alt text is part of the textual evidence it uses to decide what the product is and whether to recommend it. The screen-reader user and the AI agent consume your markup the same way. Writing for one serves the other.

The rules haven't changed: be specific, be honest, describe what's actually in the image. `White Men's Adidas Superstar Shoe, side view` still beats both an empty string and a keyword salad — just for one more reader than before.

What *has* changed is feasibility at scale. In 2019, writing alt text for 10,000 SKUs meant an intern and a spreadsheet. Today vision models generate genuinely accurate product descriptions, and the failure mode has flipped: the risk is no longer missing alt text, it's plausible-sounding wrong alt text nobody reviewed. Generate with AI, sample-check with humans. (I build [tooling in this space](/projects/sirv-studio/), so I'm biased — but I'm biased because I've watched it work.)

### Structured data — the single biggest winner

The 2019 article said structured data was "a must" and predicted it would "generate even more traffic in the future." I'd like to formally claim these points.

Product structured data went from a nice rich-snippet enhancer to **the primary interface between your store and every AI shopping surface.** Google's AI Mode doesn't lovingly parse your hand-crafted product page — it reads your product feed and your [Product markup](https://developers.google.com/search/docs/appearance/structured-data/product): price, availability, GTIN, ratings, variants, and crucially, your image URLs. When an AI answer shows three products for "waterproof trail runners under $150," the products with complete structured data are the candidate pool. Everyone else is invisible.

If you skipped schema markup in 2019 because rich snippets seemed cosmetic, you now have a much better reason. The markup you write today is the storefront the agents see.

### Speed, CDNs, and properly scaled images

Still true, now formalized. In 2019 "loading speed is a ranking factor" was a slightly hand-wavy claim. Since then Google shipped Core Web Vitals, and the metric that matters most — Largest Contentful Paint — is, on most e-commerce pages, *literally your hero product image*. Image optimization stopped being a subcategory of SEO and became the main event of performance work.

The CDN advice stands unchanged, including John Mueller's old tip: serve images from your own (sub)domain so you can switch CDNs without breaking every URL. Some advice is timeless because it's about not painting yourself into corners.

## What died

### The image format wars are over (and nobody won them the way we expected)

The 2019 article spent a lot of words on WebP evangelism — browser support tables, Safari hand-wringing, serving "a dinosaur-era format" as fallback. All of that is obsolete:

- **WebP** is universal. Safari joined in 2020. There is no fallback conversation anymore.
- **AVIF** is the new default recommendation, sitting at [~93% browser support](https://caniuse.com/avif) with meaningfully better compression than WebP, especially at low quality settings where product photos live.
- **JPEG XL** — technically the best format of the three — remains the web's great tragedy, [stuck at ~14% support](https://caniuse.com/jpegxl): Safari ships it, Chrome and Firefox still keep it behind flags. Check back in another seven years.

The practical 2026 answer requires no thought: serve AVIF with a WebP or JPEG fallback via `<picture>` or content negotiation, let your image CDN handle it, move on with your life. The most contested topic of 2019 image SEO is now a solved problem you shouldn't spend an afternoon on.

### JavaScript lazy loading

In 2019, lazy loading meant a script. Today it's an HTML attribute:

```html
<img src="shoe.avif" alt="White Men's Adidas Superstar Shoe" loading="lazy" width="800" height="800">
```

Native `loading="lazy"` is supported everywhere and needs no JavaScript. The interesting part is that the advice **inverted for your most important image**: lazy-loading your LCP hero image is now a well-known performance *anti-pattern*, because it delays the one image Google times you on. The 2026 pattern:

- Hero/LCP image: eager, plus `fetchpriority="high"`
- Everything below the fold: `loading="lazy"`
- Always: explicit `width` and `height` so the page doesn't shift while loading (CLS, the other Web Vital images love to ruin)

### "Google Images is the second-biggest search engine"

The 2019 article opened with JumpShot data showing Google Images' massive search share. JumpShot doesn't even exist anymore, and neither does the world that stat described.

Classic Google Images — type words, get a grid, click through to a website — has been declining as a traffic source for years. What replaced it is bigger but harder to see: **visual search moved into the camera.** Google Lens handles on the order of 20 billion visual searches a month by Google's own numbers, a huge share of them shopping-related, plus Circle to Search on Android. My 2019 self called visual search the future, which was right — but the traffic didn't flow to websites. It flows into Google's shopping graph, from your product feed.

The uncomfortable part for anyone who remembers 2019: image search traffic you can see in Search Console is a shrinking slice. Being *findable by cameras and agents* — clean product-on-white plus lifestyle shots, structured data, feed hygiene — is the growing slice, and it mostly doesn't show up as a session in your analytics.

### Image sitemaps, Screaming Frog audits, EXIF Purge

Still exist, still fine, no longer worth a section. Modern platforms handle image sitemaps automatically, and one line covers the audit advice: make sure your images return 200 and aren't blocked by robots.txt.

One genuine reversal, though: the 2019 advice to **strip all image metadata** now has an important exception. With AI-generated and AI-edited imagery everywhere, provenance metadata — [C2PA Content Credentials](https://c2pa.org/) and IPTC's digital source fields — is how platforms label what's authentic, what's edited, and what's synthetic. Google Images already surfaces this in "About this image." Strip the camera's GPS junk, but think twice before stripping provenance you may soon want to keep.

## What's genuinely new

### The searcher is often not a person

This is the change that reframes everything above. A meaningful and fast-growing share of product discovery now happens inside AI surfaces — Google's AI Mode and AI Overviews, ChatGPT's shopping results, Perplexity — where a model, not a human, performs the "search" and picks a shortlist of products to show.

These systems evaluate your images in two ways at once:

1. **As data** — via structured markup, feeds, alt text, and surrounding content.
2. **As pixels** — vision models actually look at your product photos and judge them: is the product clearly visible, well-lit, uncluttered, high-resolution, without watermarks and promo text baked in?

That second point deserves a pause, because it's new. In 2019, image "quality" mattered indirectly (compression artifacts hurt recognition). In 2026, your product photography is being *aesthetically and semantically graded by the layer that decides your visibility*. Blurry photos, busy backgrounds, tiny product-in-frame, "SALE!!!" overlays — these used to cost you conversions. Now they cost you inclusion.

### One catalog, many angles

The practical consequence: the old minimum of "one decent product photo" became a portfolio requirement. The surfaces picking your images want product-on-clean-background *and* in-context lifestyle shots, multiple angles, and consistency across the catalog. Ironically, generative AI is also what makes this affordable — background replacement and lifestyle-scene generation turned a photoshoot problem into a batch-processing problem. The winning move isn't AI *or* photography; it's a small number of excellent real photos, multiplied responsibly.

That's the split I like in the tooling too: [Sirv](https://sirv.com/) as the image CDN for resizing, format negotiation, and delivery; [Sirv Studio](https://www.sirv.studio/) as the AI image-generation and batch-workflow layer on top.

### The checklist, 2026 edition

If the 2019 article compressed to a checklist, here's its successor:

1. **Write honest, specific alt text for every product image** — humans, screen readers, and shopping agents all read it. Generate at scale with AI, sample-check with humans.
2. **Ship complete Product structured data and a clean product feed** — GTIN, price, availability, variants, multiple image URLs. This is the storefront agents see.
3. **Serve AVIF (WebP fallback), properly sized, from a CDN on your own domain.** Solved problem — automate it and stop thinking about it.
4. **Eager-load and `fetchpriority="high"` your hero image; lazy-load the rest; always set width/height.** LCP is your product photo.
5. **Shoot (or generate) for the machine grader** — product clearly visible, clean background plus lifestyle variants, high resolution, no baked-in text or watermarks.
6. **Keep provenance metadata; strip the rest.**
7. **Still true from 2019:** descriptive filenames are a nice-to-have, keyword stuffing hurts, and none of this rescues a page that ranks poorly overall.

## The scorecard

| 2019 advice | 2026 verdict |
|---|---|
| Write good alt text | ✅ Aged into the single highest-leverage item |
| Structured data "is a must" | ✅ Understatement of the decade |
| Use a CDN, own the domain | ✅ Unchanged |
| Serve WebP with fallbacks | 🪦 Solved — AVIF-first now, zero thought required |
| JS-based lazy loading | 🪦 Native attribute; inverted for the hero image |
| "Google Images is huge" | ⚠️ True, but the traffic moved into Lens, feeds, and AI answers |
| Strip all metadata | ⚠️ Reversed for provenance credentials |
| Image sitemaps, link audits | 😐 Fine, automated, forgettable |

Seven years from now I'll presumably re-audit this one and wince at something. My guess for the wince: this article still assumes your *website* is where the sale happens. If agentic checkout keeps going the way it's going, the 2033 edition might be titled "Image SEO for stores no human visits."

The fundamentals will survive that too. They always do: show the product clearly, describe it honestly, make it fast, and make it machine-readable. Everything else is tactics.
