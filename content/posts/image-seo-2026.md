---
title: "Image SEO in 2026: what changed since 2019"
date: 2026-07-06
draft: false
content_type: "Guide"
description: "I checked my 2019 image SEO guide again. The basics still hold, while formats, loading, product data, and visual discovery have changed."
---

In 2019 I wrote a [guide to image SEO for e-commerce](/posts/image-seo/). Seven years later, some of it is still useful and some is plainly old.

The short version is simple: make images discoverable, describe them accurately, serve the right size quickly, and keep product data current. The implementation has changed.

## What still matters

### Useful alt text

Alt text still starts with accessibility. It also helps search engines understand an image and gives other software a text description when it cannot use the pixels directly.

The rule has not changed. Describe what is actually in the image. `White men's Adidas Superstar shoe, side view` is useful. An empty attribute or a list of keywords is not.

Vision models now make bulk alt text practical. They also produce confident mistakes. Generate it if that saves time, then review a sample and check unusual products carefully.

### Product data

[Google's current product documentation](https://developers.google.com/search/docs/appearance/structured-data/product) recommends `Product` structured data, a Merchant Center feed, or both. The data can make products eligible for richer results in Search, Google Images, and Google Lens.

Keep the important fields accurate: product name, price, availability, identifiers, variants, and image URLs. Markup that disagrees with the page or feed creates a different problem rather than solving SEO.

### Fast, properly sized images

Images are often the largest files on a product page. Serve them near the size at which they are displayed, set `width` and `height`, and use a CDN when it makes delivery faster and easier to manage.

The 2019 advice to use your own image hostname still holds. It gives you more freedom to change CDN providers without changing every public image URL.

## What changed

### Modern formats are normal

The old guide spent too much time on WebP browser support. WebP and AVIF are both supported by Google Images, and modern browsers can choose between formats through `<picture>` or content negotiation.

There is no need to turn format selection into a project. Let the image service choose a suitable format and keep a normal fallback.

### Lazy loading is built into HTML

Most below-the-fold images now need only one attribute:

```html
<img src="shoe.avif" alt="White men's Adidas Superstar shoe" loading="lazy" width="800" height="800">
```

Do not lazy-load the image responsible for Largest Contentful Paint. Load that image normally and consider `fetchpriority="high"` when it is clearly the page's main image.

### Images now appear in more places

The old guide treated Google Images as a separate destination. Images now appear across normal Search results, product results, Discover, Google Lens, and shopping features.

The practical work is still familiar. Google needs a crawlable `<img>` element, a useful landing page, clear context, and an image it can fetch. [Google's image guidance](https://developers.google.com/search/docs/appearance/google-images) still recommends responsive images, an ordinary `src` fallback, supported formats, and a balance between quality and speed.

### Metadata needs a more careful decision

The old advice said to strip all metadata. That is too broad now.

Removing unnecessary camera data can reduce file size and avoid publishing information you do not want to share. Copyright, creator, and licence metadata can still be useful. Google can display image rights information from IPTC fields or structured data. Keep provenance and rights data when it has a purpose.

## More software reads the page

Product pages are no longer read only by people and a classic search crawler. Shopping systems and AI assistants also use feeds, structured data, page text, and sometimes the image itself.

That does not require a separate "AI SEO" trick. It rewards the same boring work: accurate product data, clear images, honest descriptions, stable URLs, and fast delivery.

A useful product image set usually includes a clean main image, enough angles to understand the product, and an in-context image when scale or use is unclear. Generated images can fill gaps, but they should not invent product details.

## The 2026 checklist

1. Write specific alt text that describes the image.
2. Add accurate `Product` structured data and keep the product feed in sync.
3. Serve responsive images from a stable hostname.
4. Use WebP or AVIF where suitable and keep a fallback.
5. Load the main image eagerly. Lazy-load images below the fold.
6. Set explicit image dimensions.
7. Keep useful rights and provenance metadata. Remove data you do not need to publish.
8. Check that image URLs return `200`, are crawlable, and appear in the rendered HTML.

## The old advice, checked again

| 2019 advice | 2026 status |
|---|---|
| Write useful alt text | Still right |
| Add product structured data | More useful across product results |
| Use a CDN on your own hostname | Still right |
| Serve WebP with fallbacks | Normal now, with AVIF as another option |
| Use JavaScript for lazy loading | Usually replaced by native HTML |
| Treat Google Images as one separate channel | Too narrow |
| Strip all metadata | Keep useful rights data and remove the rest |
| Audit crawlability and broken image URLs | Still right |

The details will change again. The durable part is still to show the product clearly, describe it honestly, and deliver the image without wasting the visitor's time.
