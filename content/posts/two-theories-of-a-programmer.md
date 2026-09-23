---
title: "The programmer who stopped typing"
date: 2026-07-02
lastmod: 2026-09-23
draft: false
content_type: "Essay"
page_css: ["two-theories"]
description: "One programmer writes the code. Another directs agents that write it. The second job is mostly specification, verification and product judgement. It also leaves juniors without an obvious way in."
ogImage: "https://www.varyvoda.com/images/posts/two-theories-of-a-programmer.jpg"
featuredImage: "/images/posts/two-theories-of-a-programmer.webp"
image_alt: "A single path of spheres meets an amber hub that connects to many parallel paths."
---

<p class="two-theories-meta">2 Jul 2026 · data: 23 Mar to 2 Jul · one repo, three contributors, every commit counted</p>

<p class="two-theories-standfirst">The <a href="/projects/sirv-studio/build-record/">Studio build record</a> has an unusual curve. Autocomplete doesn't make a curve like that. Changing what the programmer does all day does.</p>

## Two versions of the job

In the first version, a programmer thinks of code and types it. In the second, a programmer writes down the intent, hands defined jobs to agents, checks the results and decides what ships.

I now work mostly in the second version. The agents write much of the code. I choose the work, write or approve plans, review failures, use the product and take responsibility for the result.

That explains the Studio numbers better than any commit total.

## Read the curve

The QA lead's weekly output started around twenty commits, moved through forty and ninety, then reached **277, 309, and 188**. Nobody started typing faster. What changed was the QA system around the work: a coverage matrix, executable gates, agent workflows and clearer task boundaries.

<figure class="two-theories-figure">
  <div>
    <div class="two-theories-lab"><span class="two-theories-dot" style="background:#54c98a"></span>One Studio engineer, QA, weekly distinct commits</div>
    <div class="two-theories-bars">
      <b style="background:#54c98a;height:0%"></b><b style="background:#54c98a;height:0%"></b><b style="background:#54c98a;height:6%"></b><b style="background:#54c98a;height:5%"></b><b style="background:#54c98a;height:13%"></b><b style="background:#54c98a;height:13%"></b><b style="background:#54c98a;height:4%"></b><b style="background:#54c98a;height:28%"></b><b style="background:#54c98a;height:12%"></b><b style="background:#54c98a;height:17%"></b><b style="background:#54c98a;height:10%"></b><b style="background:#54c98a;height:21%"></b><b style="background:#54c98a;height:90%"></b><b style="background:#54c98a;height:100%"></b><b style="background:#54c98a;height:61%"></b>
    </div>
  </div>
  <figcaption>One person made 1,179 distinct commits in the quarter, most of them after the QA workflow was in place. Scaled to its own peak.</figcaption>
</figure>

More commits aren't automatically better. But once specification and verification stop being improvised, one person can safely direct a lot more work.

## A commit means something different

A commit used to be a rough proxy for time spent typing. In a repository full of agents, another commit is cheap. The number means little unless someone specified the work, checked it and accepted it.

That's why the Studio counts exclude merge commits, deduplicate rebases and cherry-picks and separate bot authors. It doesn't make commits a measure of value. It just makes the history honest enough to look at.

## Adoption changes the repository

Autocomplete inside the old process gives you the old process, a little faster. Running several agents at once changes what the repository needs:

- Plans clear enough for an executor that has never seen the conversation.
- Tests and gates that catch code which looks right and isn't.
- Written project rules and recent decisions, because agents don't remember.
- Review based on commands, browser behaviour and real data.
- Isolation, so parallel sessions don't trample each other.

All of that takes time to build. It pays off only once the system can run again and again without a human reading every generated line.

## Responsibility stays with people

<figure class="two-theories-figure">
  <div class="two-theories-stat"><div class="n" style="color:#e8b04b">32</div><div class="l">Bot-authored commits in the Studio repository during the quarter. Agents usually commit as the humans directing them.</div></div>
  <figcaption>Distinct non-merge bot-authored commits, 23 Mar to 2 Jul 2026.</figcaption>
</figure>

The agents write the code. The humans sign it. The name on a commit says who accepted responsibility for it.

What's left for the human is product judgement, architecture, trade-offs and knowing when a technically correct result is wrong for the user. When code is cheap, that's most of the job.

## The part I can't solve

Junior developers used to learn by turning small decisions into code and watching where it broke. That's exactly the work agents now take first.

Judgement comes from those small failures. If juniors never make them, where does the next generation of reviewers come from? I don't have a convincing answer yet.

For me, the shift is already done. I type less and spend more time deciding what should exist, defining it well and proving it works.

_Companion piece to the [Sirv Studio case study](/projects/sirv-studio/) and [build record](/projects/sirv-studio/build-record/)._
