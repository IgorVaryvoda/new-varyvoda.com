---
title: "Stitch Puzzle: I read 3,600 reviews before I wrote a line"
date: 2026-10-07
draft: false
content_type: "Build record"
page_css: ["appshots"]
description: "A cozy thread puzzle built from what players hate about its competitors: solver-checked levels, no forced ads and a real cross-stitch chart for every picture. Store-ready in three and a half days."
featuredImage: "/images/posts/stitch-puzzle-reviews-first.webp"
image_alt: "An embroidery hoop holds a half-unpicked cross-stitch fox, with thread spools and loose amber thread around it."
ogImage: "https://www.varyvoda.com/images/posts/stitch-puzzle-reviews-first.jpg"
---

The first commit of Stitch Puzzle had no game in it.

It had a study of about 1,775 reviews of Yarn Loop and 1,896 reviews of Pixel Flow, two popular thread puzzles. It had a teardown of how they monetise, rough revenue estimates and a pitch deck. The code came after.

Three and a half days later the game had 216 levels, iOS and Android builds and a [support page](/stitch-puzzle/support/) on this site.

## The game

Spools of thread travel round an embroidery hoop. Each spool pulls out the first stitch in its line of sight if that stitch is its colour. A spool with thread left over waits on a shelf. Fill every slot on the shelf and you lose.

It's calm, it's a little bit clever and you can play it with one thumb on the sofa.


<figure class="appshots">
  <div class="appshots-grid">
    <div class="appshots-panel">
      {{< responsive-image src="/images/posts/stitch-puzzle-play.webp" alt="Level 42, an arctic fox in stitches, with numbered thread spools on the shelf and in the hoop below" sizes="(max-width: 680px) calc(100vw - 3.6rem), 300px" fallbackWidth="480" >}}
      <span class="appshots-label">A level</span>
    </div>
    <div class="appshots-panel">
      {{< responsive-image src="/images/posts/stitch-puzzle-hold.webp" alt="Level 17, a watermelon, with a hint that the held spool pulls four stitches and then waits on the shelf" sizes="(max-width: 680px) calc(100vw - 3.6rem), 300px" fallbackWidth="480" >}}
      <span class="appshots-label">Hold to preview</span>
    </div>
    <div class="appshots-panel">
      {{< responsive-image src="/images/posts/stitch-puzzle-daily.webp" alt="The daily picture, a lemon, with a tip that leftover thread waits on the shelf" sizes="(max-width: 680px) calc(100vw - 3.6rem), 300px" fallbackWidth="480" >}}
      <span class="appshots-label">Daily picture</span>
    </div>
  </div>
  <figcaption>Hold a spool to see what it will pull before you commit. The shelf is the only way to lose.</figcaption>
</figure>

## What the reviews said

People like this genre. They hate how it's run. The complaints were loud and consistent: levels that feel unwinnable, ads forced between rounds, a queue you can't see and luck dressed up as skill.

So I wrote eight promises before the first level. Among them:

- Every level is checked by a solver, so every level can be won without paying.
- The queue is visible.
- No forced ads.
- Colourblind symbols.
- It works offline.
- Every finished picture comes with a real chart you can stitch.

The rest followed from those. "Mystery skeins" were an obvious mechanic to steal. I dropped them because hidden colours were the top complaint about luck.

## The real chart

This is the bit no competitor does. Finish a picture, tap "Get the real chart" and you get a proper cross-stitch pattern: symbols, a bold line every 10 stitches, centre arrows, DMC thread numbers with stitch counts and the finished size on 14-count Aida.

It exists because I'd already built the converter. A week before the game I wrote [cross-stitch](https://github.com/IgorVaryvoda/cross-stitch), a Python tool that turns any image into a printable DMC pattern: a PDF with a chart, a colour key and a shopping list of skeins.

It matches every cell to one of about 455 DMC thread colours in CIELAB, a colour space built around how people see differences. If you feed it a photo of existing stitchwork, it finds the stitch grid by autocorrelation and reads it cell by cell instead of resampling. It splits charts across A4 pages and tries to put the cuts away from busy areas, because nobody wants to stitch across a page break in the middle of a face.

I measured it against a designer's hand-made chart called "Нічка". The converter's DMC matching then became part of the game's level pipeline.

The charts were going to be a paid extra. On day two I made them free for everyone. They're the thing that makes the game feel like it belongs to the hobby.

## Lives lasted 19 hours

I ran the game through rounds of AI review. The first round scored it 3.5 out of 10. Ten polish rounds later it had lives, like every other game in the genre.

Nineteen hours after that I deleted them. The "fair play" commit gave you free restarts, a shop that never opens by itself and free charts.

The money comes from rewarded ads you choose to watch for a free continue, and coin packs from $0.99 to $9.99. Coins buy helpers and decorations for your cottage.

## The cottage I said I wouldn't build

The plan said, in writing: no races, no story, no home to decorate.

The game now has a cottage with four rooms, a cat you feed once a day, crafter XP and a button-jar mini-game. So much for the plan.


<figure class="appshots">
  <div class="appshots-grid">
    <div class="appshots-panel">
      {{< responsive-image src="/images/posts/stitch-puzzle-chart.webp" alt="A printable cross-stitch chart of a teapot with a symbol grid and a DMC thread key" sizes="(max-width: 680px) calc(100vw - 3.6rem), 300px" fallbackWidth="480" >}}
      <span class="appshots-label">The real chart</span>
    </div>
    <div class="appshots-panel">
      {{< responsive-image src="/images/posts/stitch-puzzle-cottage.webp" alt="The craft room of the cottage with framed stitched pictures, an armchair and a cat in its bed" sizes="(max-width: 680px) calc(100vw - 3.6rem), 300px" fallbackWidth="480" >}}
      <span class="appshots-label">Craft room</span>
    </div>
    <div class="appshots-panel">
      {{< responsive-image src="/images/posts/stitch-puzzle-kitchen.webp" alt="The cottage kitchen with a dresser, a stove, a table and the cat" sizes="(max-width: 680px) calc(100vw - 3.6rem), 300px" fallbackWidth="480" >}}
      <span class="appshots-label">Kitchen</span>
    </div>
  </div>
  <figcaption>The chart you get for every finished picture, and two of the four cottage rooms.</figcaption>
</figure>

## The hint that walked into a wall

The first hint system was greedy: it suggested the best move right now. On 17 levels that led straight into a dead end, the fox picture among them.

The fix was a real solver in GDScript. The web build has no threads, so it searches for a winning line a little at a time on each frame. If it runs out of budget, it falls back to the solution stored with the level. The hint now follows a line that wins, and the game warns you when a move leads to a dead end.

Every level is tuned by simulation. A script plays each deal with a random player and keeps it only if that player wins inside a target band: 35 to 50% for normal levels, 6 to 12% for super hard ones. Every pair of colours in a level is at least 20 apart on CIEDE2000, a colour difference formula, so you never squint at two blues.

## Built with Godot

It's Godot 4.7 with about 7,000 lines of GDScript. The rules were prototyped in JavaScript first and ported line by line. Art, music and sound effects came from AI tools, and the first 10 levels include two public-domain Hokusai prints.

Progress backs up to my own Supabase with a code you type on the new phone. There are no analytics.

[Stitch Puzzle support](/stitch-puzzle/support/) · [cross-stitch converter](https://github.com/IgorVaryvoda/cross-stitch)
