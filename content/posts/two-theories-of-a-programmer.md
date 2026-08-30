---
title: "Two theories of a programmer"
date: 2026-07-02
draft: false
content_type: "Essay"
page_css: ["two-theories"]
description: "One programmer writes the code. Another directs agents that write it. The second job moves more attention into specification, verification, and product judgement."
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
---

<p class="two-theories-meta">2 Jul 2026 · data: 23 Mar to 2 Jul · one repo, three contributors, every commit counted</p>

<p class="two-theories-standfirst">The <a href="/projects/sirv-studio/build-record/">Studio build record</a> has an unusual curve. It comes from changing what the programmer does, not simply adding autocomplete.</p>

## Two versions of the job

In the first version, a programmer thinks of code and types it. In the second, a programmer writes the intent, gives defined jobs to agents, checks the evidence, and decides what ships.

I now work mostly in the second version. The agents write much of the code. I choose the work, write or approve plans, review failures, use the product, and take responsibility for the result.

That distinction explains the Studio data better than commit totals do.

## Read the curve

The QA lead's weekly output started around twenty commits, moved through forty and ninety, then reached **277, 309, and 188**. Typing speed does not explain that change. The difference was the QA system around the work: a coverage matrix, executable gates, agent workflows, and clearer task boundaries.

<figure class="two-theories-figure">
  <div>
    <div class="two-theories-lab"><span class="two-theories-dot" style="background:#54c98a"></span>One Studio engineer, QA, weekly distinct commits</div>
    <div class="two-theories-bars">
      <b style="background:#54c98a;height:0%"></b><b style="background:#54c98a;height:0%"></b><b style="background:#54c98a;height:6%"></b><b style="background:#54c98a;height:5%"></b><b style="background:#54c98a;height:13%"></b><b style="background:#54c98a;height:13%"></b><b style="background:#54c98a;height:4%"></b><b style="background:#54c98a;height:28%"></b><b style="background:#54c98a;height:12%"></b><b style="background:#54c98a;height:17%"></b><b style="background:#54c98a;height:10%"></b><b style="background:#54c98a;height:21%"></b><b style="background:#54c98a;height:90%"></b><b style="background:#54c98a;height:100%"></b><b style="background:#54c98a;height:61%"></b>
    </div>
  </div>
  <figcaption>One person made 1,179 distinct commits in the quarter, most of them after the QA workflow was in place. Scaled to its own peak.</figcaption>
</figure>

More commits are not automatically better. A person can direct more work safely once specification and verification stop being improvised.

## A commit means something different

A commit used to be a rough proxy for time spent typing. In an agent-heavy repository, producing another commit is cheap. The number means little unless the work was specified, checked, and accepted.

That is why the Studio counts exclude merge commits, deduplicate rebases and cherry-picks, and separate bot authors. The method does not turn commits into value. It only makes the history honest enough to inspect.

## Adoption changes the repository

Autocomplete inside the old process produces the old process a little faster. Running several agents changes what the repository needs.

- Plans must be clear enough for an executor with no missing context.
- Tests and gates must catch plausible but wrong implementations.
- Agents need written project rules and recent decisions.
- Review needs evidence from commands, browser behaviour, and real data.
- Work must be isolated so parallel sessions do not damage each other.

This costs time and attention. The advantage appears only when the system can run repeatedly without asking a human to read every generated line.

## Responsibility stays with people

<figure class="two-theories-figure">
  <div class="two-theories-stat"><div class="n" style="color:#e8b04b">32</div><div class="l">Bot-authored commits in the Studio repository during the quarter. Agents usually commit as the humans directing them.</div></div>
  <figcaption>Distinct non-merge bot-authored commits, 23 Mar to 2 Jul 2026.</figcaption>
</figure>

The agents write code, but the humans sign the work. Authorship identifies who accepted responsibility for the change.

The human work is product judgement, architecture, trade-offs, and knowing when a technically valid result is wrong for the user. Those skills become more important when implementation is cheap.

There is a serious unresolved problem here. Junior developers used to learn by translating small decisions into code and seeing where they failed. If agents take most of that work, teams need another way to build judgement. I do not have a convincing answer yet.

For my own work, the shift is already clear. I type less code and spend more time deciding what should exist, defining it well, and proving that it works.

_Companion piece to the [Sirv Studio case study](/projects/sirv-studio/) and [build record](/projects/sirv-studio/build-record/)._
