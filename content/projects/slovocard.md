---
title: "SlovoCard"
date: 2025-12-14
draft: false
project_url: "https://www.slovocard.com"
image: "https://cdn.earthroulette.com/varyvoda/slovocard.png"
image_alt: "SlovoCard spaced-repetition review interface for Balkan-language vocabulary"
description: "Learn and retain an 8,000-word Balkan-language deck through spaced repetition."
hero_kicker: "Language tool"
hero_intro: "I wanted one large deck for the languages I hear in Montenegro, so I made it."
hero_title_size: "compact"
hero_mark: "Spaced repetition"
hero_scope: "Study to recall"
hero_primary_label: "Open SlovoCard"
hero_frame_label: "SlovoCard / review"
hero_frame_status: "8,000+ words"
hero_flow:
  - "Choose language"
  - "Study the deck"
  - "Review on time"
  - "Remember"
tech_stack: ["Web", "SRS", "Language Learning"]
role: "Creator and sole builder"
stewardship:
  state: "maintained"
  note: "I fix vocabulary, review bugs, dependencies, and deck quality."
last_tended: "2026-07-02"
feedback_url: "/contact/?project=slovocard&type=correction"
proof:
  - value: "8,000+"
    label: "Words in the deck"
  - value: "4 variants"
    label: "Bosnian, Croatian, Serbian, Montenegrin"
users_changed: "Learners have reported wrong entries, unclear prompts, and missing regional context. I fixed them."
imperfect: "Onboarding is still thin. It needs to explain the four regional variants more clearly."
highlights:
  - "Spaced Repetition"
  - "Balkan Languages"
  - "8000+ words"
weight: 6
---

## Why I wanted it

Living in Montenegro, I did not need one clean textbook standard. I needed the words people around me use, plus enough context to understand where Bosnian, Croatian, Serbian, and Montenegrin differ.

So I built the vocabulary tool I wanted: a large deck and a quiet review loop that brings back the words I forget.

## The 8,000-word deck

SlovoCard contains more than 8,000 words. I started with frequency-ranked vocabulary and phrase material, then moved it into a Supabase dataset. Definitions and IPA come from Wiktionary, images from Wikimedia Commons, and example sentences from Tatoeba. The source stays attached to each entry.

The number is easy to quote. The work is correcting bad translations and making each card teach one clear meaning. The four languages share one Serbo-Croatian core in SlovoCard, with metadata and phrase variants where the regional difference matters.

## How review works

The scheduler is Anki-like and based on SM-2. Cards move through new, learning, review, and relearning states. Your rating changes the interval and ease factor. Easy words wait longer. Missed words return sooner.

I use it myself. A wrong entry teaches me the wrong thing again and again. An awkward prompt wastes my time every time it returns. That makes both problems hard to ignore.

## Corrections are part of the product

Learners can report vocabulary problems and regional mismatches. Those reports have corrected entries and improved review behaviour. Importing a deck is the easy part. Keeping it accurate takes use and corrections.

## Where it is now

The deck and review loop work. Onboarding does not explain the four regional variants well enough yet. That is the next thing to fix.

[Learn Bosnian, Croatian, Serbian, and Montenegrin with SlovoCard](https://www.slovocard.com)
