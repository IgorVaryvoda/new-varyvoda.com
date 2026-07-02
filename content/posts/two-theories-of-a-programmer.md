---
title: "Two theories of a programmer"
date: 2026-07-02
draft: false
description: "The old theory says a programmer types the code they thought of. The new theory says a programmer exercises editorial judgment over a fleet that types."
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
---

<style>
.two-theories-standfirst {
  color: #b9c0cf;
  font-size: 1.95rem;
  line-height: 1.65;
  margin-bottom: 2.2rem;
}

.two-theories-meta {
  color: #7d8392;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.15rem;
  letter-spacing: 0.08em;
  margin-bottom: 1.4rem;
  text-transform: uppercase;
}

.two-theories-figure {
  margin: 3rem 0;
  padding: clamp(1.5rem, 3vw, 2.2rem);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(249, 201, 122, 0.1), transparent 36%),
    linear-gradient(315deg, rgba(102, 217, 239, 0.08), transparent 42%),
    #10131a;
}

.two-theories-figure figcaption {
  margin-top: 1.4rem;
  color: #8d93a2;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.15rem;
  line-height: 1.55;
}

.two-theories-sparkpair,
.two-theories-statpair {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 2rem;
}

.two-theories-lab {
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-bottom: 1rem;
  color: #b9c0cf;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.2rem;
}

.two-theories-dot {
  width: 0.9rem;
  height: 0.9rem;
  border-radius: 999px;
}

.two-theories-bars {
  display: flex;
  align-items: flex-end;
  gap: 0.28rem;
  height: 8rem;
}

.two-theories-bars b {
  flex: 1;
  min-height: 1px;
  border-radius: 3px 3px 0 0;
}

.two-theories-stat .n {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(3.8rem, 7vw, 5.8rem);
  font-weight: 800;
  line-height: 1;
}

.two-theories-stat .l {
  margin-top: 1rem;
  color: #b9c0cf;
  font-size: 1.45rem;
  line-height: 1.55;
}

@media (max-width: 640px) {
  .two-theories-sparkpair,
  .two-theories-statpair {
    grid-template-columns: 1fr;
  }
}
</style>

<p class="two-theories-meta">2 Jul 2026 · data: 23 Mar–2 Jul, two repos, 15 contributors</p>

<p class="two-theories-standfirst">The <a href="/projects/sirv-studio/build-record/">Studio build record</a> shows one product curve. The comparison that made me write this showed two teams. What it really showed is two different answers to a question most of the industry hasn't noticed it's being asked: <strong>what is a programmer for?</strong></p>

## The theories

The old theory says a programmer is a person who types out the code they thought of. The new theory says a programmer is a person who exercises **editorial judgment over a fleet that types**. Every other difference in the data falls out of that one difference — the totals, the shapes, even what a "commit" means.

This isn't a story about talent. Both teams in the chart are made of capable engineers. It's a story about what happens when one side changes its theory of the job while the other side changes its tooling.

## Read the shapes, not the totals

The Sirv.com curve is a metronome: thirty to fifty commits a week, team-wide, for fifteen straight weeks. That is the signature of manual work — output is linear in hours, and hours are constant. It is what nearly every engineering chart in the world has looked like for fifty years, and there is nothing wrong with it except what it can never do: bend.

The most interesting line on the Studio side isn't the founder's 3,529. It's the QA lead's ramp: nothing for two weeks, then twenty, forty, ninety — then **277, 309, 188**. A fifteen-fold personal ramp inside one quarter is biologically impossible for a typist. It isn't a person learning to type faster. It's a harness coming online — the coverage matrix, the gates, the agent workflows — and starting to pay compound interest.

<figure class="two-theories-figure">
  <div class="two-theories-sparkpair">
    <div>
      <div class="two-theories-lab"><span class="two-theories-dot" style="background:#57c7b8"></span>Sirv.com, whole team, weekly</div>
      <div class="two-theories-bars">
        <b style="background:#57c7b8;height:63%"></b><b style="background:#57c7b8;height:60%"></b><b style="background:#57c7b8;height:88%"></b><b style="background:#57c7b8;height:48%"></b><b style="background:#57c7b8;height:46%"></b><b style="background:#57c7b8;height:43%"></b><b style="background:#57c7b8;height:100%"></b><b style="background:#57c7b8;height:49%"></b><b style="background:#57c7b8;height:55%"></b><b style="background:#57c7b8;height:42%"></b><b style="background:#57c7b8;height:49%"></b><b style="background:#57c7b8;height:57%"></b><b style="background:#57c7b8;height:76%"></b><b style="background:#57c7b8;height:42%"></b><b style="background:#57c7b8;height:43%"></b>
      </div>
    </div>
    <div>
      <div class="two-theories-lab"><span class="two-theories-dot" style="background:#54c98a"></span>One Studio engineer, QA, weekly</div>
      <div class="two-theories-bars">
        <b style="background:#54c98a;height:0%"></b><b style="background:#54c98a;height:0%"></b><b style="background:#54c98a;height:6%"></b><b style="background:#54c98a;height:5%"></b><b style="background:#54c98a;height:13%"></b><b style="background:#54c98a;height:13%"></b><b style="background:#54c98a;height:4%"></b><b style="background:#54c98a;height:28%"></b><b style="background:#54c98a;height:12%"></b><b style="background:#54c98a;height:17%"></b><b style="background:#54c98a;height:10%"></b><b style="background:#54c98a;height:21%"></b><b style="background:#54c98a;height:90%"></b><b style="background:#54c98a;height:100%"></b><b style="background:#54c98a;height:61%"></b>
      </div>
    </div>
  </div>
  <figcaption>Left: a metronome — twelve people, effort-linear, 577 distinct commits in 15 weeks. Right: a compounding curve — one person, 1,179, most of it in the last month, after the harness existed. Each panel is scaled to its own peak.</figcaption>
</figure>

**Manual coding scales with effort. Fleet coding scales with the infrastructure you've built for the agents** — and infrastructure compounds. That is the entire economics of the new theory in one sentence.

## What a commit means now

Somewhere in this quarter, a commit quietly changed meaning. It used to be a proxy for an hour of typing. Now it is **a decision someone was willing to stand behind** — specified, reviewed, gated. When the marginal cost of producing code drops toward zero, everything scarce moves upstream: specification, verification, taste.

Which is why something funny happened to the metric itself. The moment commit counts became cheap to inflate, they had to become *more* rigorous to mean anything. The comparison counted distinct non-merge commits, deduped rebase and cherry-pick copies, excluded bot authors on both sides, and disclosed that squash-merge workflows floor the other team's numbers — not because anyone demanded an audit, but because volume without an honesty apparatus is now just noise.

## The pretenders

Then there is the third cohort, the one the chart can't show directly: teams that are AI-assisted the way a gym membership is fitness. The tell was never the tool subscription — it's the **shape of the process**. Autocomplete in the editor at a one-pull-request-a-week cadence is the old workflow wearing a lanyard from an AI conference. Typing was maybe a fifth of the job, so accelerating it is invisible at chart scale.

> That makes the pretense falsifiable: real adoption bends the curve somewhere. If nothing in the graph changed, nothing in the process did.

## What adoption actually costs

Real adoption is expensive, which is exactly why it is rare. You have to restructure the work around the fact that agents are fast, tireless, and **confidently wrong**. Tests before code, because an agent lies with a straight face. Review gates as executable code, because human attention stopped scaling the day the fleet arrived. Documentation and memory as load-bearing infrastructure, because context is the fuel agents run on. An anti-forgery QA machine, because an agent *will* fake a green checkmark if faking is cheaper than passing.

A repository run this way grows organs a hand-coded repository never grows: skills folders, workflow gates, agent memory, deck generators, recount scripts. The organs are the proof. You can pretend to be AI-assisted on a conference panel. You cannot pretend your repo grew organs.

## The inversion

<figure class="two-theories-figure">
  <div class="two-theories-statpair">
    <div class="two-theories-stat"><div class="n" style="color:#57c7b8">229</div><div class="l">Bot-authored commits on the <strong>manual</strong> team's repo this period — github-actions alone would top their human leaderboard.</div></div>
    <div class="two-theories-stat"><div class="n" style="color:#e8b04b">32</div><div class="l">Bot-authored commits on the <strong>fleet</strong> team's repo — because the agents commit as the humans who direct them.</div></div>
  </div>
  <figcaption>Distinct non-merge, bot-authored commits, 23 Mar–2 Jul 2026, both repos.</figcaption>
</figure>

Sit with that inversion for a second. The team that codes by hand has robots signing their own work. The team run by robots has a human signing all of it. The question was never whether machines write code — CI has been committing for a decade. The question is **who takes editorial responsibility for what ships**.

## What survives

To be fair to the old way: volume isn't value, and ten times the commits can be ten times the entropy. The craft virtues — coherence, taste, knowing *why* — did not become obsolete. They got promoted, from the line level to the system level. The old way got coherence for free, because one mind touched every line. The new way recovers it only by writing the mind down: product soul documents, design contracts, workflow rules. That, incidentally, is why tacit, undocumented seniority does not survive contact with a fleet — and why the people who thrive in the new mode are the ones who could always say what they wanted before they typed it.

In five years nobody will pretend to be AI-assisted. They'll pretend they always were. The gap in the velocity chart is not a talent gap — it's that one side changed its theory of the job while the other changed its tooling.

> Tools don't bend curves. Theories do.

_Companion piece to the [Sirv AI Studio case study](/projects/sirv-studio/) and [build record](/projects/sirv-studio/build-record/)._
