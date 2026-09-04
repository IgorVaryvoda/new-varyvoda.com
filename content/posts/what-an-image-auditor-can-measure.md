---
title: "What an image auditor can actually measure"
date: 2026-09-04
draft: false
content_type: "Build record"
description: "Building the ImageGuide extension meant separating a downloaded image from its uses, and measured bytes from estimated savings."
---

An image can be the right size for a hero and too large for a thumbnail on the same page. Counting its URL once is useful for the resource list. Judging every use as if it were the hero is wrong.

That distinction became central to version 0.4.0 of the [ImageGuide extension](/projects/imageguide/).

## One resource, several uses

The collector groups a shared image resource while retaining the elements that use it. Each usage has its own slot size and markup findings.

For example, a wide image may be appropriate at the top of the page but wasteful inside a small card. The card can have missing alt text even when the hero's description is correct. The resource and the element need separate records.

The same care applies to responsive images. The auditor tries to match the browser's selected candidate to its `srcset` descriptor. If the candidate cannot be matched confidently, the source dimensions remain unknown. Guessing them could produce an impressive but false resize opportunity.

## A measured input does not make a measured saving

The browser can report encoded response size or transfer size through Resource Timing. Those fields are not interchangeable, and they are not always available for cross-origin resources.

An optional response-size check can ask the server for headers. It requests host permission when needed and omits credentials. An unavailable measurement stays unavailable.

Even when the input size is known, the extension has not converted that image. Its proposed saving uses a model for resize and format changes. The interface labels that as an estimate.

| Statement | What supports it |
|---|---|
| This response had this encoded size | A browser timing entry or validated response header |
| This element is oversized for its slot | Confirmed source dimensions and the current layout |
| A different format may save bytes | A conversion model, not an encoded result |
| This output saved this many bytes | An actual conversion, outside the extension's audit |

For the last question, I built [Press](/projects/press/). It can encode the local file and show the result.

## Visible now does not mean LCP

A lazy image currently inside the viewport is not necessarily the page's Largest Contentful Paint element. The visitor may already have scrolled. The extension keeps the viewport finding separate from the browser's LCP observation.

Layout-shift evidence needs similar restraint. An element that moved is not necessarily the element that caused the movement. The report records attribution without converting it into a diagnosis it cannot support.

## Say what the scan missed

The extension bounds its scan by element, resource, usage and payload limits. It reports when one is reached. Inaccessible frames, closed shadow roots and canvas pixels also leave gaps.

The [source and fixture tests](https://github.com/IgorVaryvoda/imageguide-extension) make those limits inspectable. An unknown size makes a less satisfying dashboard number. It gives the person fixing the page a more useful answer.
