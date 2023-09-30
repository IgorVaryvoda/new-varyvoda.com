---
title: "Optimizing a Vue/Nuxt project to the max with Sirv"
date: 2023-09-30
url: /experts-nuxt-Sirv/
draft: true
---
# Sirv Experts: Optimizing a Nuxt project to the max with Sirv
My latest project is Sirv Experts, a directory of professionals proficient with Sirv that we can vouch for. 
The project is powered by Nuxt and has some tricky parts about it, like an interactive map of experts closest to you, a portfolio showcase of each expert, and lots of images all over the website.

Basically, it's a perfect project to test Sirv's performance and see how it can be optimized to the max.

## The problem
We've compiled a list of things that we need to optimize for the project, and it's quite a list:
- Optimizing images, serving them in the optimal format and size on the fly
- Lazy loading images
- Hosting static assets
- Showcasing experts' portfolios consisting of various media like images, videos, 360 spins and 3D models

## The solution
I'll start with some boasting, of course

<img class="Sirv" src="https://cdn.earthroulette.com/varyvoda/blog-images/boast1.png?q=10&blur=10" data-src="https://cdn.earthroulette.com/varyvoda/blog-images/boast1.png" alt="haha, so good">
GTmetrix score of 100% for both desktop and mobile, and a 0.5s largest contentful paint.

<img class="Sirv" src="https://cdn.earthroulette.com/varyvoda/blog-images/boast2.png?q=10&blur=10" data-src="https://cdn.earthroulette.com/varyvoda/blog-images/boast2.png" alt="so sick">

And a 99% score on LightHouse. Yeah, we're working on accessibility right now, I know it's important. 😀

## Image optimization and lazy loading
The first two problems might look pretty time-consuming, but Sirv has a solution for them out of the box. [Automatic responsive images](https://sirv.com/help/articles/responsive-images-smv/) basically covers all that we needed. The images are lazy loaded, served in the optimal format and size, on-the-fly. 

Sirv achieves this by grabbing the master image and converting + resizing it based on the users' device, which requires the Sirv.js script. We've tried to just load it in the head section of nuxt.config.js, but later figured out it's more efficient to load it only on pages that need it in the footer section of the page using a simple method call in the mounted hook.
```js
//components/footer.vue
getSirv()
    {
    return new Promise((resolve) => {
        const script = document.createElement('script')
        script.src = 'https://scripts.sirv.com/sirvjs/v3/sirv.js'
        script.type = 'text/javascript'
        script.setAttribute('async', '')
        script.setAttribute('defer', '')
        script.onload = resolve
        script.onerror = () => {
            reject(new Error('Failed to load the Sirv script'));
        };
        document.body.appendChild(script)
    })
}
```
Alternatively, just use the [npm module](https://www.npmjs.com/package/sirv-media-viewer-script). 

We've also used DNS prefetch and preconnect to speed up the loading of the script and other assets.

With the script loading being taken care of, we've changed all of image links to Sirv CDN image links, but one more issue remained — while the images are being fetched, we need some sort of placeholder.

Here's where Sirv's Dynamic Imaging features came in handy, by simply adding a parameter to the image URL, we can get a placeholder image of any size, format, and color. So we dropped the quality to 10% for the placeholder image, which worked perfectly for small images on the [map page](https://experts.sirv.com/360-product-photography/anywhere)
```html
<img
  class="Sirv"
  :src="icon+'?q=10'"
  :data-src="icon"
  :alt="title"
>
```
Adding [blur](https://sirv.com/help/articles/dynamic-imaging/stylize/blur/) works pretty nice for bigger images, but we didn't really have any use-case for this.

## Hosting static assets
We just slapped all of our static assets on the CDN 😀
It's pretty much a single line in the nuxt.config.js file:
```js
//nuxt.config.js
build: {
    publicPath: 'https://experts-content.sirv.com/_nuxt/'
//your other options
}
```
You'd still have to upload your assets to the CDN, which can be done via a [github action](https://github.com/marketplace/actions/sirv-upload) [(docs here)](https://sirv.com/help/articles/upload-images-to-sirv-with-github-actions/) or a [deployment script like this](https://gist.github.com/IgorVaryvoda/40036108fda952d318abf397b53cc6da).

So now we have all of our images optimized, lazy-loaded, and hosted on the CDN, but we still have to deal with the experts' portfolios.

## Showcasing experts' portfolios
Easy-peasy-lemon-squeezy bros and broettes, we just need to use Sirv's [Media Viewer](https://sirv.com/help/articles/media-viewer/) to create a custom gallery for each expert. Basically have a custom component that grabs experts' portfolio items and builds the SMV gallery based on the data. 

The results are pretty cool, check it out [here](https://experts.sirv.com/revo-photo-revo-north-america). Or here's a random nintendo switch gallery for if you're lazy: 
<div class="Sirv">
 <div data-src="https://demo.sirv.com/demo/Switch/switch-front.jpg" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-separate.png" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/nintendo_switch.glb"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-slide.jpg" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch.mp4" data-options="autoplay:true"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-wide.jpg" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-oled.jpg" data-type="zoom"></div>
</div>
The code for this gallery is simple and self-explanatory:

```html
<div class="Sirv">
 <div data-src="https://demo.sirv.com/demo/Switch/switch-front.jpg" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-separate.png" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/nintendo_switch.glb"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-slide.jpg" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch.mp4" data-options="autoplay:true"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-wide.jpg" data-type="zoom"></div>
 <div data-src="https://demo.sirv.com/demo/Switch/switch-oled.jpg" data-type="zoom"></div>
</div>
```
Clean and simple.

<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js"></script>
