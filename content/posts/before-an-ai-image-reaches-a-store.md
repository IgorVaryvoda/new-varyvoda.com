---
title: "Before an AI image reaches a live store"
date: 2026-09-04
draft: false
content_type: "Field note"
description: "Studio's publishing checks have to account for changed permissions, lost responses and the difference between an internal receipt and actual Shopify state."
---

An image can look right, pass review and still be unsafe to publish. The merchant may have changed the product. The app may have been disconnected. An earlier write may have succeeded while its response disappeared.

The September work in [Sirv Studio](/projects/sirv-studio/) makes those situations explicit in the publishing checks and the real-store audit procedure.

## Check permission when the write happens

A job can sit between being accepted and making its external request. Permission at the start does not establish permission at the end.

The publishing worker now rechecks the relevant entitlement close to its mutations, including media creation and reordering. A long-running operation has to account for the app's state changing while it waits.

## Keep the receipt attached to the work

The publishing path records a plan, run, item and receipt. Recent receipt status is exposed to the product interface so the person inspecting a publish can see its recorded progress.

Those identifiers connect a request to its attempts. They do not make the external result self-evident. If Shopify accepts a write but the response is lost, retrying as though nothing happened can create a second effect.

An outbox helps deliver jobs. Idempotency and reconciliation need to handle the meaning of the external operation. Neither the queue nor a reassuring success message can answer what is currently in the merchant's catalogue.

## Observe Shopify too

The real-store audit binds its observations to one committed candidate deployed to the development environment. The checked-out SHA and deployed SHA must match. If the candidate changes, the ledger must start again.

The procedure requires 20 complete installation lifecycle cycles and 50 publish/reconcile cases. It includes drift, lost responses, concurrent replay, partial mutations and uninstalling during a publish.

Each publish case needs a fresh Shopify Admin GraphQL read of the product's media. A Studio receipt or a provider stub does not count as that observation. Failed and blocked cases do not count toward the passing floor.

| Evidence | What it establishes |
|---|---|
| Internal receipt | Studio's record of the operation |
| Matching candidate and deployed SHA | Which code the audit exercised |
| Fresh Shopify observation | What the store reported after the operation |
| Completed case floor | Coverage of this defined audit, not universal safety |

## A procedure is not a result

The audit tooling and checks exist in the repository. I am not claiming here that the complete real-store floor has passed. A completed ledger would still not establish App Store approval or authorize a production cutover.

The supplier workflow already running in production is a separate fact. Its use does not prove every Shopify lifecycle case. The publish claim needs evidence from the store and the exact code that made the change.

*Source: Studio commits `c34534f59f`, `63f838e246` and `1dee4416fd` on 4 September 2026, plus the Shopify beta real-store audit procedure. The repository is private.*
