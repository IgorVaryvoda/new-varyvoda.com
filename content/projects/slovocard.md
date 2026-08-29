---
title: "SlovoCard"
date: 2025-12-14
draft: false
project_url: "https://www.slovocard.com"
image: "https://cdn.earthroulette.com/varyvoda/slovocard.png"
image_alt: "SlovoCard spaced-repetition review interface for Balkan-language vocabulary"
description: "Learn and retain an 8,000-word Balkan-language deck through spaced repetition."
hero_kicker: "Language tool"
hero_intro: "I built a spaced-repetition system for learning the languages around me in the Balkans, with more than 8,000 words in the deck."
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
  note: "Vocabulary corrections, deck quality, dependencies, and review behaviour remain actively supported."
last_tended: "2026-07-02"
feedback_url: "/contact/?project=slovocard&type=correction"
proof:
  - value: "8,000+"
    label: "Words in the deck"
  - value: "4 variants"
    label: "Bosnian, Croatian, Serbian, Montenegrin"
users_changed: "Learner reports have corrected vocabulary entries and exposed places where a regional variant or review prompt needed more context."
imperfect: "The deck is deeper than the onboarding. New learners still need a clearer path into the language and a better explanation of how the regional variants relate."
highlights:
  - "Spaced Repetition"
  - "Balkan Languages"
  - "8000+ words"
weight: 6
---

## Why I wanted it

Living in Montenegro made the usual beginner-language-app problem obvious. I did not need a deck optimized for one clean textbook standard. I needed the words people around me actually use, with enough context to understand where Bosnian, Croatian, Serbian, and Montenegrin overlap and where they do not.

So I built the vocabulary tool I wanted to study with: a large deck, a quiet review loop, and repetition scheduled around what I was actually forgetting.

## The 8,000-word deck

SlovoCard contains more than 8,000 words. The starting corpus came from frequency-ranked vocabulary and imported phrase material, then moved into a curated Supabase dataset. Definitions and IPA are enriched from Wiktionary, images from Wikimedia Commons, and example sentences from Tatoeba, with the source attribution kept alongside the content.

The useful work is not the number by itself; it is keeping entries consistent, correcting bad translations, and making a card specific enough to teach the intended meaning rather than a vague dictionary cloud. Bosnian, Croatian, Serbian, and Montenegrin share one Serbo-Croatian core in the product, with language metadata and explicit phrase variants where a regional distinction matters.

## How review works

The scheduler is Anki-like and derived from SM-2. Cards move through new, learning, review, and relearning states; ratings alter the interval and ease factor, with deck settings for learning steps, graduation, easy bonuses, and maximum intervals. Words you recall cleanly wait longer before returning, while difficult or missed words come back sooner.

I use it myself, which makes the failure mode hard to ignore. A wrong entry becomes something I repeatedly teach myself incorrectly. An awkward prompt wastes time every time it returns. Personal use turns content maintenance into product maintenance.

## Corrections are part of the product

Learners can report vocabulary problems and regional mismatches. Those reports have corrected entries and improved review behaviour. A language deck is never finished merely because the import completed; it gets trustworthy through use, correction, and another review pass.

## Where it is now

The core deck and review loop are useful. The onboarding is thinner. SlovoCard explains less than it knows, especially for someone arriving without context about the four regional variants. That is the honest next product problem.

[Learn Bosnian, Croatian, Serbian, and Montenegrin with SlovoCard](https://www.slovocard.com)
