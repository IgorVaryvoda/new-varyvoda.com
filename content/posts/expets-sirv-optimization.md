---
title: "Maximizing Performance in a Vue/Nuxt Project with Sirv"
date: 2023-09-30
url: /experts-nuxt-Sirv/
draft: false
ogImage: "https://cdn.earthroulette.com/varyvoda/blog-images/boast2.png"
---
My latest project is [Sirv Experts](https://experts.sirv.com), a directory of professionals proficient with Sirv that we can vouch for.
<img class="Sirv" src="https://cdn.earthroulette.com/varyvoda/experts.png?q=10&blur=10" data-src="https://cdn.earthroulette.com/varyvoda/experts.png" alt="Sirv Experts">


The project is powered by Nuxt and has some tricky parts about it, like an [interactive map of experts closest to you](https://experts.sirv.com/360-product-photography/near-me), a portfolio showcase of each expert, and lots of images all over the website.

It's a perfect project to test Sirv's performance and see how it can be optimized to the max.

## The problem
We've compiled a list of things that we need to optimize for the project, and it's quite a list:
- Optimizing images, serving them in the optimal format and size on the fly
- Lazy loading images
- Improving first contentful paint & reducing layout shift
- Hosting static assets on a CDN
- Showcasing experts' portfolios consisting of various media like images, videos, 360 spins and 3D models

## The solution
I'll start with some boasting, of course. 😀

<img class="Sirv" src="https://cdn.earthroulette.com/varyvoda/blog-images/boast1.png?q=10&blur=10" data-src="https://cdn.earthroulette.com/varyvoda/blog-images/boast1.png" alt="haha, so good">
GTmetrix score of 100%, and a 0.5s largest contentful paint.

<img class="Sirv" src="https://cdn.earthroulette.com/varyvoda/blog-images/boast2.png?q=10&blur=10" data-src="https://cdn.earthroulette.com/varyvoda/blog-images/boast2.png" alt="so sick">

And a 99% score on LightHouse. Yeah, we're working on accessibility right now, I know it's important. 😀

## Image optimization and lazy loading
The first two problems might look pretty time-consuming, but Sirv has a solution for them out of the box. [Automatic responsive images](https://sirv.com/help/articles/responsive-images-smv/) basically covers all that we needed. The images are lazy loaded, served in the optimal format and size, on-the-fly. 

Sirv achieves this by grabbing the master image and converting + resizing it based on the users' device, which requires the Sirv.js script. We've tried to just load it in the head section of nuxt.config.js, but later figured out it's more efficient to load it only on pages that need it in using a simple method call in the mounted hook.
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

Since our backend already had all images hosted at Sirv
(there's an [integration](https://sirv.com/integration/) for most platforms),
it just worked 😀.
Yet one more issue remained — while the images are being fetched, we need some sort of placeholder.
Which leads us to the next problem to solve.
## Improving first contentful paint & reducing layout shift

This is where Sirv's Dynamic Imaging features came in handy, by simply adding a parameter to the image URL, we can get a placeholder image of any size, format, and color. So we dropped the quality to 10% for the placeholder image, which worked perfectly for small images on the [map page](https://experts.sirv.com/360-product-photography/anywhere)
```html
<img
  class="Sirv"
  :src="icon+'?q=10'"
  :data-src="icon"
  :alt="title"
>
```
Adding [blur](https://sirv.com/help/articles/dynamic-imaging/stylize/blur/) works pretty nice for bigger images, but we didn't really have any use-case for this.

We've also utilized preload for critical (above the fold) images and prefetched the Sirv CDN and Google Fonts domains.
Quite easily done via nuxt.config.js:
```js
//nuxt.config.js -
head: {
    //your meta and other stuff
    link: [
        { rel: 'preconnect', href: 'https://scripts.sirv.com/', crossorigin:true},
        { rel: 'preconnect', href: 'https://experts-content.sirv.com', crossorigin:true},
        { rel: 'preconnect', href: 'https://fonts.googleapis.com', crossorigin:true},
        { rel: 'dns-prefetch', href: 'https://scripts.sirv.com'},
        { rel: 'dns-prefetch', href: 'https://experts-content.sirv.com'},
        { rel: 'preload', as: 'style', href: 'https://fonts.googleapis.com/css?family=Source+Sans+Pro:200,300,400,600&display=swap' }
    ]
}
```
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
You'd still have to upload your assets to the CDN after every build,
which can be done via a [github action](https://github.com/marketplace/actions/sirv-upload) [(docs here)](https://sirv.com/help/articles/upload-images-to-sirv-with-github-actions/) or a [deployment script like this](https://gist.github.com/IgorVaryvoda/40036108fda952d318abf397b53cc6da).

So now we have all of our images optimized, lazy-loaded, and hosted on the CDN, but we still have to deal with the experts' portfolios.

## Showcasing experts' portfolios
Easy-peasy-lemon-squeezy, we just need to use Sirv's [Media Viewer](https://sirv.com/help/articles/media-viewer/) to create a custom gallery for each expert. All achieved via a simple custom component that grabs experts' portfolio items and builds the SMV gallery based on the data. 

The results are pretty cool, check it out [here](https://experts.sirv.com/revo-photo-revo-north-america). Or here's a random nintendo switch gallery if you're lazy: 
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
