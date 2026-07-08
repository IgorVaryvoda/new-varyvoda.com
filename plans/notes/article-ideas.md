# Article ideas backlog

Compiled 2026-07-06. Grouped by theme; ⭐ marks the strongest bets. Each entry: working title — the angle in one or two sentences.

## A. Fleet coding / follow-ups to "Two theories of a programmer"

1. ⭐ **The organs of an AI-run repo** — Guided tour of the artifacts the essay claims can't be faked: skills folders, workflow gates, agent memory, recount scripts, deck generators. Real file listings from the Studio repo.
2. ⭐ **How to count commits honestly** — The build-record methodology: deduping rebases and cherry-picks, excluding bots, distinct non-merge counting. For metrics skeptics.
3. **Tests before code, because agents lie** — The anti-forgery QA machine in practice: how you catch an agent faking a green checkmark, with real examples.
4. **Writing the mind down** — Product soul documents, design contracts, workflow rules. Why tacit seniority doesn't survive contact with a fleet.
5. **Two weeks of zero commits** — The QA lead's 15× ramp told from the inside: what harness-building looks like before it pays off.
6. **A day in the life of an editorial programmer** — Hour-by-hour: what you actually do when the fleet types. Concretizes the essay's abstraction.
7. **The review gate is the product** — Why executable review gates beat human review at fleet scale, and what a good gate looks like in code.
8. **Agent memory that actually helps** — What's worth persisting between agent sessions, what rots, and how to keep memory from becoming a landfill.
9. **When the fleet is wrong together** — Failure modes of multi-agent workflows: correlated errors, confident consensus on nonsense, and the checks that catch them.
10. **Onboarding a human onto an AI-built codebase** — What a new engineer needs when no human typed most of the code. Documentation as load-bearing infrastructure.
11. **The cost curve nobody shows** — Token spend vs. engineering salary math for a real quarter of fleet coding. Honest numbers.
12. **Interviewing programmers for the new theory** — If typing is a fifth of the job, what do you screen for? Specification, verification, taste — and how to test them.
13. **Commit messages as decisions** — If a commit is "a decision someone stands behind," the message is the decision record. What changes in practice.
14. **What I stopped doing** — Habits from twenty years of manual coding that actively hurt in fleet mode: premature abstraction, hero debugging, keeping context in your head.

## B. Build-in-public: Sirv AI Studio

15. ⭐ **Shipping an AI product on someone else's model** — Building on fal.ai: versioning, rollback, safety when the model underneath you changes.
16. **Batch AI editing that merchants actually trust** — Review queues, publish-with-rollback, versioning. Product-design piece, not hype.
17. **Inngest in production** — Background jobs for AI pipelines: retries, idempotency, what breaks at volume.
18. **React 19 + TanStack Start, six months in** — Honest field report from a shipped product. Scarce content, can rank.
19. **Scanning a Shopify catalog without melting it** — Rate limits, webhooks, incremental sync — the unglamorous plumbing of a Shopify app.
20. **Stripe billing for an AI product** — Metering AI operations, credits vs. subscriptions, what merchants tolerate.
21. **Drizzle + PostgreSQL patterns from a real product** — Schema evolution, migrations under continuous deployment, the queries that got hairy.
22. **Supplier uploads through review** — Designing a content pipeline where third parties feed your catalog and nothing unvetted ships.
23. **The rollback that saved us** — A war story around versioning and safe publish. (Write when a good incident exists.)
24. **Pricing an AI feature when your COGS is a model call** — Unit economics of image operations; where margin actually comes from.

## C. E-commerce imagery & SEO (the established lane)

25. ⭐ **Image SEO in 2026: what changed since 2019** — Refresh of the 2019 post: AI alt text, AVIF, image search in the LLM era. Proven search demand.
26. **AI-generated product imagery: what merchants get wrong** — Background replacement, lifestyle shots, try-on — from someone shipping the tools.
27. **Alt text at catalog scale** — Generating accurate alt text for 10,000 SKUs: what AI gets right, where humans must stay in the loop.
28. **AVIF vs. WebP vs. JPEG XL for product images** — Practical benchmarks on real product photos, with CDN delivery numbers.
29. **The anatomy of a product page that converts** — Image count, 360 spins, zoom, video — what the data across Sirv customers says.
30. **Virtual try-on: gimmick or conversion lever?** — Honest assessment with implementation notes.
31. **Background removal is a solved problem. Background *replacement* isn't.** — Why context-aware lifestyle backgrounds are the actual hard problem.
32. **Image personalization, revisited** — The 2018 post updated: dynamic imagery in the AI era, what's now trivial and what's still hard.
33. **How LLMs see your product images** — What ChatGPT/Claude shopping assistants extract from product imagery, and how to optimize for machine buyers.
34. **The 360 spin is twenty years old. Why is it still rare?** — Cost, tooling, and whether AI-generated spins from flat photos change the equation.

## D. Web performance & this-website-as-material

35. ⭐ **Over-engineering my Hugo blog on purpose** — The improve-audit → 9 numbered plans → execution pipeline, run by the same fleet workflow as the essay. Meta-angle ties the threads together.
36. **Edge headers for a static site behind Cloudflare** — Straight from plans/008 and the runbook. Practical, searchable.
37. **A quality gate for a blog** — htmltest, verification scripts, build records for a personal site (plans/007). Rigor as comedy or as conviction.
38. **The blur-up lazy-load pattern, revisited** — The `?q=10` placeholder trick this site uses. Short, practical, code included.
39. **Cutting my <head> payload** — What plans/005 found: the accumulated cruft in a decade-old Hugo site's head, and what removing it bought.
40. **Hugo in 2026: still the right call?** — A decade of Hugo vs. the Astro/Next static crowd, argued from a real long-lived site.
41. **CSS consolidation on a theme you didn't write** — Living with hugo-coder overrides (plans/006): when to fork a theme vs. patch it.
42. **Deploy archaeology** — The netlify.toml that wasn't doing anything: auditing a legacy deploy chain (plans/002) and consolidating to one path.

## E. Side projects & retrospectives

43. **The side project graveyard audit** — Which of nine projects survived, which died, and what "active" honestly means. Viddl's YouTube pain as centerpiece.
44. **Spaced repetition for Balkan languages** — SlovoCard's why: learning closely-related Slavic languages when you already speak one — interference is the enemy.
45. **Earth Roulette: what a random-destination generator taught me about choice paralysis** — Product psychology from travel-tool traffic.
46. **BudJet: AI receipt scanning that survives real receipts** — Crumpled paper, three languages, thermal fade — the gap between demo and daily use.
47. **LowTax Guide: building a comparison site in a domain full of spam** — Earning trust in a niche where every competitor is an affiliate farm.

## F. Opinion & personal

48. **Actionable ways to help Ukraine — the 2026 edition** — Refresh of the 2022 post: what still works after four years, what's changed, where money actually goes.
49. **Working from Ukraine through the war** — Infrastructure, blackouts, and building products anyway. (Only if it feels right to write.)
50. **In five years nobody will pretend to be AI-assisted** — Standalone expansion of the essay's closing line: predictions with falsifiable dates, to be graded publicly in 2031.

---

**Top three to write first:** #1 (organs tour — material exists, high shareability), #35 (Hugo over-engineering — unique meta-angle bridging both threads), #25 (Image SEO refresh — proven search demand already owned).

## G. 2026-07-08 shortlist

Fresh pass after re-reading the live site: the strongest pattern is first-person operator essays tied to real artifacts, especially Sirv Studio, image SEO, and the side projects that have more story behind them than the current project pages show.

1. ⭐ **The 72-hour framework migration** — How Studio moved from Next.js to TanStack Start while the product stayed alive. Use the April commit spike as the spine.
2. ⭐ **AI agents need operations, not APIs** — Agents should call safe product operations with permissions, budgets, review gates, and rollback, not raw endpoints.
3. ⭐ **One good product photo is no longer enough** — Clean product shots, lifestyle variants, model-graded images, and why AI turns catalog photography into a batch workflow.
4. **What I learned building an AI app that writes to real Shopify stores** — Drift detection, rollback, publish strategies, idempotency, and why "let AI update products" is terrifying without governance.
5. **The boring infrastructure behind fast AI product teams** — Tests, gates, specs, memory, queues, and review agents: the stuff that makes the velocity real.
6. **How I'd redo image SEO for a Shopify store from scratch in 2026** — Practical implementation follow-up to the broader "what changed" essay.
7. **Building Earth Roulette: why random discovery is still underrated** — The internet got optimized for intent; random travel scratches a different itch.
8. **The apps I built because I needed them** — Earth Roulette, BudJet, SlovoCard, Viddl: a personal builder essay about scratching your own itch without pretending every project is a startup.
9. **BudJet: the personal finance app I actually use** — Receipt scanning, household budgets, recommendations, and where AI is useful versus annoying in money apps.
10. **Learning Balkan languages as a product problem** — SlovoCard angle: why spaced repetition is easy to explain and hard to make pleasant enough to stick with.
11. **Commit counts are a bad metric until the shape changes** — Follow-up to "Two theories": not "more commits good," but what curves reveal about process changes.
12. **The AI coding bottleneck moved upstream** — Spec quality, taste, review, and verification as the new scarce skills.
