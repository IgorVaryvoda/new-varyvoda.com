---
title: "Before an AI image reaches a live store"
date: 2026-09-04
lastmod: 2026-09-23
draft: false
content_type: "Field note"
description: "An AI image can look perfect and still be unsafe to publish. Here is what Studio checks before it writes to a merchant's Shopify store, and what I ask Shopify directly."
featuredImage: "/images/posts/before-an-ai-image-reaches-a-store.webp"
image_alt: "An amber sphere passes through a checked panel into a stylized storefront, followed by a second inspection."
ogImage: "https://www.varyvoda.com/images/posts/before-an-ai-image-reaches-a-store.jpg"
---

Here's one way it goes wrong. Studio sends a new product image to Shopify. Shopify saves it. The response gets lost on the way back. Studio thinks the write failed and tries again. Now the product can end up with the same image twice.

The image looked right. Review approved it. The bug isn't in the pixels at all.

The September work in [Sirv Studio](/projects/sirv-studio/) is about that gap between "approved" and "safe to write to a live store".

## Check permission at the last moment

A publish job can wait in a queue for a while. By the time it runs, the merchant may have disconnected the app or changed the product.

So the worker checks the entitlement again right before each write to Shopify, including media creation and reordering. Permission at the start of the job means nothing at the end.

## A receipt only tells you what Studio did

Every publish has a plan, a run, items and a receipt. The interface shows recent receipts, so you can see how far a publish got.

That helps, but it doesn't answer the lost-response problem. Studio's receipt says what Studio sent. Only Shopify knows what the catalogue looks like now. Retries have to be idempotent, and reconciliation has to check the store before it writes again.

## Ask Shopify, every time

I wrote an audit procedure for real stores. It runs against one committed build on the development environment. The checked-out SHA and the deployed SHA must match. If the code changes mid-audit, the ledger starts again.

The procedure has two parts:

- 20 full install-to-uninstall lifecycles
- 50 publish and reconcile cases, including drift, lost responses, concurrent replays, partial writes and an uninstall in the middle of a publish

Every publish case ends with a fresh Shopify Admin GraphQL read of the product's media. A Studio receipt doesn't count. A stubbed provider doesn't count. Failed and blocked cases don't count toward the total.

## Where it stands

The tooling and the checks are in the repository. The full audit hasn't passed yet, so this is the checklist, not the result. Even a clean run wouldn't mean App Store approval. It would mean this exact code survived these 70 cases on a real store, checked against Shopify itself.

*Source: Studio commits `c34534f59f`, `63f838e246` and `1dee4416fd` on 4 September 2026, plus the Shopify beta real-store audit procedure. The repository is private.*
