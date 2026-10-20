---
title: "The blog reads itself now, in my voice"
date: 2026-10-20
draft: false
content_type: "Build record"
description: "21 posts, 81 minutes of narration in a clone of my voice, and a player that highlights each word as it's spoken. About $2 of ElevenLabs credits."
featuredImage: "/images/posts/the-blog-reads-itself-now.webp"
image_alt: "An open book on a dark rock by still water, with silver ribbons rising from its pages and one small segment glowing amber."
ogImage: "https://www.varyvoda.com/images/posts/the-blog-reads-itself-now.jpg"
---

Most posts here have a Listen button now. Press it and you hear me read the post. Well, a clone of me. As it reads, the word being spoken lights up and the page scrolls along with it.

It took one evening and a bit of the next day. Seven posts went out with audio on 29 September at 22:28. The word highlighting followed twelve minutes later. Fourteen more posts were narrated just after midnight, and playback speed came at lunchtime.

## Markdown in, speech out

The whole generator is a 100-line Node script with no dependencies. Most of it is one function that turns a Markdown post into something you can say out loud.

It removes code blocks, figures, images, shortcodes, HTML, URLs and the link line at the end of a post. Link text stays and the address goes. Headings, list items and table rows each become a sentence, so the voice pauses where your eye would. The title goes first.

Inline code stays in, minus the backticks. So when the backend audit post gets to the database bug, you hear my voice say "ON CONFLICT DO UPDATE" in a perfectly calm tone. I like that more than I expected.

Numbers and symbols go to the model as written: "$6", "1,684,669", "17,000 km". There's no pronunciation dictionary and no voice settings. The model reads them on its defaults and mostly gets them right.

Before any credits get spent, a dry run prints the narration text so I can check for leftover markup. A stray backtick or a `<figure>` tag that slipped through means a fix in the script, not an awkward line in the audio.

## Two calls per post

Speech comes from ElevenLabs' `eleven_v4` model and a voice called "Me - fresh". A request holds up to 10,000 characters, so the script splits long posts on paragraph breaks into 9,000-character chunks and passes each one the 500 characters on either side for context. That keeps the tone steady across the join. Only one post needed two chunks.

The timings come from a separate call. Forced alignment takes the finished MP3 plus the text and returns when each word starts and ends. Keeping it separate means I can re-time a post without paying to generate the speech again. That's exactly what happened with the first seven: they were narrated before the highlighting existed, and twelve minutes later they were re-timed, not re-recorded.

The output is a list of `[word, start, end]` and an MP3 next to it in the site's static folder. No CDN, no player library.

## Finding the word on the page

The timings know words. The page knows HTML. Joining the two is the fiddly part.

The player walks the post's text, skips code, figures and the footer, and splits it into words. A word split across two elements, like a linked "Zed" followed by a plain "'s", is kept as one. Both sides are reduced to lowercase letters and digits, then matched in order, looking up to 40 words ahead. Anything the narration skipped, like a caption or a code block, is passed over.

The highlight uses the CSS Custom Highlight API, so it paints a range of text without wrapping a single word in a `<span>`. The post's HTML stays exactly as it was.

The aligner has one quirk. Sometimes it returns a whole aside in brackets as one word: "(That's the August checkout, not today's site.)" came back as a single entry. The matcher can't pair that with any one word on the page, so it skips the aside and picks up after it. It happens five times across all 21 posts.

## Scrolling without fighting you

Auto-scroll sounds simple and is easy to make annoying.

When the spoken word leaves the middle of the screen, from 15% to 75% of the way down, the page scrolls it back to 35% from the top. If you scroll, swipe or press a key yourself, auto-scroll steps back for four seconds. With reduced motion turned on, it jumps instead of gliding.

One lesson made it into the workflow notes: `scrollBy` adds up while a smooth scroll is still running and overshoots. `scrollTo` with an exact position doesn't.

When the title scrolls out of view, the player docks to a small bar at the bottom with a seek slider. Speed cycles from 1× to 2× and the site remembers your choice.

## What it cost

21 posts, 78,783 characters and 81.5 minutes of audio. At published rates that's about 8,700 credits for speech and 1,500 for alignment, or about a third of a $6 Starter month. Call it two dollars for the lot.

The audio, though, is real weight: 75 MB of MP3 in the repo. Text is cheap. Speech isn't.

## A skill, not a script I'll forget

The whole workflow is saved as a project skill, so the next time an agent narrates a post it follows the same steps. Dry run first. Generate. Then a Playwright check jumps to 60 points in each post and confirms the highlighted word matches the timing file. Anything under 58 out of 60 fails. Then it checks that production serves the audio.

The four posts I published on 7 October don't have audio yet. Now there's no excuse.
