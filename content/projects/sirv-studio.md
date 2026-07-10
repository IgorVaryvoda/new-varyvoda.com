---
title: "Sirv AI Studio"
date: 2026-07-02
lastmod: 2026-07-10
draft: false
featured: true
hero: true
project_url: "https://www.sirv.studio"
image: "/images/studio/studio-create-prompt.webp"
ogImage: "https://www.varyvoda.com/images/studio/sirv-studio-og.png"
description: "An AI product-content platform for e-commerce — I created it and built it end to end. Merchants scan their Shopify catalog, fix product content in AI batches, route supplier uploads through review, and publish safely with versioning and rollback."
hero_note: "30+ AI tools, a workflow orchestrator, a production MCP server and API platform for AI agents, supplier portals, Stripe billing, and the reliability infrastructure underneath."
tech_stack: ["React 19", "TanStack Start", "PostgreSQL", "Drizzle", "Inngest", "Stripe", "fal.ai"]
status: "active"
highlights:
  - "Creator & architect, first commit to production"
  - "30+ AI tools backed by 57 registered models"
  - "47-tool MCP server + API platform for AI agents"
  - "Safe Shopify publishing with drift detection and rollback"
weight: 1
---

<style>
.project-description .studio-visual {
  --sv-bg: #0a1018;
  --sv-panel: #101823;
  --sv-panel-2: #151f2b;
  --sv-line: rgba(255, 255, 255, 0.12);
  --sv-line-strong: rgba(102, 217, 239, 0.42);
  --sv-text: #edf7fb;
  --sv-muted: #94a6b4;
  --sv-cyan: #66d9ef;
  --sv-green: #a6e3a1;
  --sv-amber: #f9c97a;
  --sv-violet: #cba6f7;
  --sv-red: #f38ba8;
  position: relative;
  margin: 3rem 0;
  padding: clamp(1.4rem, 3vw, 2rem);
  border: 1px solid var(--sv-line);
  border-radius: 8px;
  background:
    linear-gradient(135deg, rgba(102, 217, 239, 0.12), transparent 34%),
    linear-gradient(315deg, rgba(166, 227, 161, 0.08), transparent 38%),
    var(--sv-bg);
  color: var(--sv-text);
  overflow: hidden;
  box-shadow: 0 18px 50px rgba(0, 0, 0, 0.34);
}

.project-description .studio-visual::before {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.035) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.035) 1px, transparent 1px);
  background-size: 28px 28px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent 78%);
}

.project-description .studio-visual > * {
  position: relative;
  z-index: 1;
}

.project-description .studio-visual-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  margin-bottom: 1.4rem;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.project-description .studio-visual-head span {
  color: var(--sv-cyan);
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}

.project-description .studio-visual-head strong {
  color: var(--sv-muted);
  font-size: 1.1rem;
  font-weight: 500;
}

.project-description .studio-visual figcaption {
  margin-top: 1.35rem;
  color: var(--sv-muted);
  font-size: 1.25rem;
  line-height: 1.55;
}

.project-description .studio-dayone ol {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.9rem;
  margin: 0;
  padding: 0;
  list-style: none;
}

.project-description .studio-dayone li {
  min-width: 0;
  padding: 0.9rem 1rem 1rem;
  border: 1px solid rgba(102, 217, 239, 0.2);
  border-left: 3px solid var(--sv-cyan);
  border-radius: 7px;
  background: rgba(7, 16, 24, 0.72);
}

.project-description .studio-dayone time {
  display: inline-grid;
  place-items: center;
  min-width: 4.9rem;
  height: 2.4rem;
  margin-bottom: 0.7rem;
  border: 1px solid var(--sv-line-strong);
  border-radius: 999px;
  background: rgba(102, 217, 239, 0.1);
  color: var(--sv-cyan);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.1rem;
  font-weight: 700;
}

.project-description .studio-dayone b,
.project-description .studio-dayone span {
  display: block;
}

.project-description .studio-dayone b {
  margin-bottom: 0.2rem;
  color: var(--sv-text);
  font-size: 1.25rem;
  line-height: 1.25;
}

.project-description .studio-dayone li > span {
  color: var(--sv-muted);
  font-size: 1.1rem;
  line-height: 1.35;
}

.project-description .studio-snapshot-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.8rem;
}

.project-description .studio-snapshot-card {
  min-width: 0;
  padding: 1rem 1.05rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 7px;
  background: rgba(7, 16, 24, 0.74);
}

.project-description .studio-snapshot-card strong,
.project-description .studio-snapshot-card span {
  display: block;
}

.project-description .studio-snapshot-card strong {
  color: var(--sv-cyan);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: clamp(1.8rem, 4vw, 2.8rem);
  line-height: 1;
  letter-spacing: -0.05em;
}

.project-description .studio-snapshot-card span {
  margin-top: 0.55rem;
  color: var(--sv-muted);
  font-size: 1.05rem;
  line-height: 1.35;
}

.project-description .studio-architecture svg,
.project-description .studio-cumulative svg,
.project-description .studio-april svg,
.project-description .studio-scorecard svg {
  display: block;
  width: 100%;
  height: auto;
}

.project-description .studio-architecture text,
.project-description .studio-cumulative text,
.project-description .studio-april text,
.project-description .studio-scorecard text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}

.project-description .studio-visual .studio-tip {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 5;
  display: none;
  max-width: 320px;
  padding: 0.6rem 0.8rem;
  border: 1px solid var(--sv-line-strong);
  border-radius: 7px;
  background: rgba(7, 16, 24, 0.96);
  box-shadow: 0 10px 26px rgba(0, 0, 0, 0.45);
  pointer-events: none;
  text-align: left;
}

.project-description .studio-visual .studio-tip.is-on {
  display: block;
}

.project-description .studio-visual .studio-tip b {
  display: block;
  color: var(--sv-cyan);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.3rem;
  font-weight: 700;
}

.project-description .studio-visual .studio-tip span {
  display: block;
  color: var(--sv-text);
  font-size: 1.15rem;
  line-height: 1.4;
}

.project-description .studio-visual .studio-tip em {
  display: block;
  margin-top: 0.25rem;
  color: var(--sv-muted);
  font-size: 1.1rem;
  font-style: normal;
  line-height: 1.45;
}

.project-description .studio-visual [data-tip-label] {
  cursor: pointer;
  outline: none;
}

.project-description .studio-visual .sc-hot {
  filter: brightness(1.35);
}

.project-description .studio-toolwall-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.9rem;
}

.project-description .studio-toolwall-cat {
  min-width: 0;
  padding: 1rem 1.1rem 1.1rem;
  border: 1px solid rgba(255, 255, 255, 0.09);
  border-radius: 7px;
  background: rgba(7, 16, 24, 0.72);
}

.project-description .studio-toolwall-cat > b {
  display: block;
  margin-bottom: 0.8rem;
  color: var(--sv-cyan);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.project-description .studio-toolwall-cat > b.is-green { color: var(--sv-green); }
.project-description .studio-toolwall-cat > b.is-amber { color: var(--sv-amber); }
.project-description .studio-toolwall-cat > b.is-violet { color: var(--sv-violet); }

.project-description .studio-toolwall-wide {
  grid-column: 1 / -1;
}

.project-description .studio-toolwall-cat span {
  display: inline-block;
  margin: 0 0.35rem 0.45rem 0;
  padding: 0.3rem 0.7rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.04);
  color: #cdd8e0;
  font-size: 1.1rem;
  line-height: 1.35;
  white-space: nowrap;
}


@media (max-width: 760px) {
  .project-description .studio-visual {
    margin-left: -0.4rem;
    margin-right: -0.4rem;
  }

  .project-description .studio-architecture,
  .project-description .studio-cumulative {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .project-description .studio-architecture svg {
    min-width: 660px;
  }

  .project-description .studio-cumulative svg {
    min-width: 560px;
  }

  .project-description .studio-dayone ol {
    grid-template-columns: 1fr;
  }

  .project-description .studio-snapshot-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .project-description .studio-april {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .project-description .studio-april svg {
    min-width: 560px;
  }

  .project-description .studio-scorecard {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  .project-description .studio-scorecard svg {
    min-width: 700px;
  }

  .project-description .studio-toolwall-grid {
    grid-template-columns: 1fr;
  }
}
</style>

Sirv AI Studio is an AI product-content platform for e-commerce teams. Merchants connect their Shopify store, scan the catalog for weak product content — missing alt text, poor images, thin descriptions — fix it in AI-powered batches, route supplier uploads through review, and publish back safely with versioning and rollback.

I built Studio from `create-next-app` on a December morning to the production platform it is today: the AI tool layer, workflow orchestrator, supplier portal, Shopify publishing pipeline, MCP and API platform, and the reliability machinery underneath. Along the way [Max Wish](https://www.linkedin.com/in/max-wish/) and [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) took ownership of critical parts: the design system and data grid, and the QA proof machine. This page is the product story. The separate [build record](/projects/sirv-studio/build-record/) now carries the forensic version, with 48 dated milestones and every large number tied to a counting rule.

## It started over a beer

Some coworkers were visiting me in Herceg Novi, Montenegro. Over a beer the conversation drifted to AI — what it could actually build now, not what the keynotes promised — and at some point I told the table: I'm going to build this in a day.

The next morning I was up at six. `Initial commit from Create Next App` landed at 6:35 on December 2, 2025. The first AI tool — background replacement, with model selection — was working by 8:00. Virtual try-on by 8:23. Multi-angle product shots and lighting removal by 8:45. Auth, billing, rate limiting, and Sirv storage went in before noon, and the MVP merge is timestamped 12:05. The afternoon added batch processing with multi-select and a side-by-side compare mode. Thirty-one commits, day one — every timestamp in the log. The bet stood by lunch; the rest of this page is what happened when I kept going.

<figure class="studio-visual studio-dayone" aria-labelledby="studio-dayone-title">
  <div class="studio-visual-head">
    <span id="studio-dayone-title">day one timeline</span>
    <strong>Dec 2, 2025 · git log timestamps</strong>
  </div>
  <ol>
    <li><time>06:35</time><b>Create Next App</b><span>the empty repo becomes a product bet</span></li>
    <li><time>08:00</time><b>first AI tool</b><span>background replacement and model selection</span></li>
    <li><time>08:23</time><b>virtual try-on</b><span>second tool family is already live</span></li>
    <li><time>08:45</time><b>product-shot tools</b><span>angles, lighting removal, more image work</span></li>
    <li><time>12:05</time><b>MVP merge</b><span>auth, billing, rate limits, Sirv storage</span></li>
    <li><time>17:14</time><b>cleanup pass</b><span>batch mode and compare mode were already in</span></li>
  </ol>
  <figcaption>Six of the 31 day-one commits, timestamps straight from the repo history. The story sounds like a dare because it was one.</figcaption>
</figure>

That pace turned out to be the project's resting heart rate, not a launch spike. Six days in: the workflow orchestrator canvas — the drag-and-drop pipeline builder that's still the center of the product. Twelve days in: durable background jobs on Inngest. Eighteen days: an MCP server, before most people knew what MCP was. Twenty-five days: the embedded Shopify app. December closed at 602 commits, and the repo already had the skeleton of everything Studio is today.

The quietest month of the run — February, spent wiring billing, supplier intake, permissions, and the unglamorous plumbing that turns a demo into a business — still carried 316 of my commits. In the first 220 calendar days there were exactly five blank ones. By the July 10 snapshot the repo had reached 9,452 commits, 6,638 under my primary author identity.

<figure class="studio-visual studio-cumulative" aria-labelledby="studio-cumulative-title">
  <div class="studio-visual-head">
    <span id="studio-cumulative-title">cumulative commits</span>
    <strong>Dec 2, 2025 → Jul 2, 2026 · original seven-month snapshot</strong>
  </div>
  <svg viewBox="0 0 920 344" role="img" aria-label="Historical cumulative commit curve showing the first 5,501 commits by Igor Varyvoda through July 2, 2026, with milestones for MVP day, MCP server, Stripe, team joins, supplier portal, and the April migration.">
    <defs>
      <linearGradient id="studio-area" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#66d9ef" stop-opacity="0.22"/>
        <stop offset="100%" stop-color="#66d9ef" stop-opacity="0"/>
      </linearGradient>
    </defs>
    <g stroke="rgba(255,255,255,0.09)" stroke-width="1"><line x1="70" y1="300.0" x2="894" y2="300.0"/><line x1="70" y1="252.7" x2="894" y2="252.7"/><line x1="70" y1="205.5" x2="894" y2="205.5"/><line x1="70" y1="158.2" x2="894" y2="158.2"/><line x1="70" y1="110.9" x2="894" y2="110.9"/><line x1="70" y1="63.7" x2="894" y2="63.7"/></g>
    <g fill="#94a6b4" font-size="11.5"><text x="60" y="304.0" text-anchor="end">0</text><text x="60" y="256.7" text-anchor="end">1k</text><text x="60" y="209.5" text-anchor="end">2k</text><text x="60" y="162.2" text-anchor="end">3k</text><text x="60" y="114.9" text-anchor="end">4k</text><text x="60" y="67.7" text-anchor="end">5k</text><text x="70.0" y="330" text-anchor="middle">Dec</text><text x="186.6" y="330" text-anchor="middle">Jan</text><text x="307.1" y="330" text-anchor="middle">Feb</text><text x="415.9" y="330" text-anchor="middle">Mar</text><text x="536.4" y="330" text-anchor="middle">Apr</text><text x="653.0" y="330" text-anchor="middle">May</text><text x="773.5" y="330" text-anchor="middle">Jun</text><text x="890.1" y="330" text-anchor="middle">Jul</text></g>
    <path d="M 70.0 298.5 L 73.9 297.5 L 77.8 296.1 L 81.7 295.5 L 85.5 294.6 L 89.4 293.6 L 93.3 293.0 L 97.2 291.5 L 101.1 290.9 L 105.0 289.5 L 108.9 288.1 L 112.8 287.6 L 116.6 287.1 L 120.5 286.8 L 124.4 286.4 L 128.3 285.2 L 132.2 283.3 L 136.1 281.6 L 140.0 281.0 L 143.8 280.4 L 147.7 279.9 L 151.6 279.1 L 155.5 278.4 L 159.4 276.6 L 163.3 274.7 L 167.2 274.1 L 171.1 273.4 L 174.9 272.0 L 178.8 271.7 L 182.7 271.5 L 186.6 270.6 L 190.5 269.3 L 194.4 268.5 L 198.3 267.2 L 202.2 266.8 L 206.0 265.9 L 209.9 264.5 L 213.8 263.1 L 217.7 262.4 L 221.6 262.1 L 225.5 261.8 L 229.4 261.7 L 233.2 260.9 L 237.1 259.9 L 241.0 259.2 L 244.9 258.4 L 248.8 257.9 L 252.7 257.9 L 256.6 257.4 L 260.5 254.5 L 264.3 253.7 L 268.2 252.9 L 272.1 252.3 L 276.0 251.6 L 279.9 250.6 L 283.8 249.8 L 287.7 248.9 L 291.5 247.9 L 295.4 247.4 L 299.3 246.9 L 303.2 246.4 L 307.1 245.0 L 311.0 244.4 L 314.9 244.4 L 318.8 244.1 L 322.6 243.8 L 326.5 243.1 L 330.4 242.9 L 334.3 242.8 L 338.2 242.5 L 342.1 242.2 L 346.0 242.0 L 349.8 241.5 L 353.7 241.1 L 357.6 240.8 L 361.5 240.5 L 365.4 240.1 L 369.3 239.7 L 373.2 239.4 L 377.1 238.8 L 380.9 238.4 L 384.8 237.8 L 388.7 237.4 L 392.6 237.3 L 396.5 237.0 L 400.4 235.7 L 404.3 234.2 L 408.2 233.2 L 412.0 231.5 L 415.9 231.1 L 419.8 230.9 L 423.7 230.1 L 427.6 229.6 L 431.5 228.3 L 435.4 226.8 L 439.2 225.7 L 443.1 225.5 L 447.0 224.3 L 450.9 223.7 L 454.8 223.1 L 458.7 222.1 L 462.6 221.4 L 466.5 221.3 L 470.3 221.1 L 474.2 220.9 L 478.1 220.4 L 482.0 219.7 L 485.9 219.4 L 489.8 218.6 L 493.7 217.7 L 497.5 217.3 L 501.4 216.3 L 505.3 214.8 L 509.2 213.9 L 513.1 212.4 L 517.0 211.5 L 520.9 210.3 L 524.8 209.4 L 528.6 208.4 L 532.5 207.7 L 536.4 205.7 L 540.3 202.8 L 544.2 201.9 L 548.1 201.9 L 552.0 201.3 L 555.8 200.6 L 559.7 200.3 L 563.6 198.0 L 567.5 189.4 L 571.4 185.8 L 575.3 181.9 L 579.2 181.0 L 583.1 178.6 L 586.9 175.5 L 590.8 174.3 L 594.7 172.8 L 598.6 170.6 L 602.5 165.1 L 606.4 163.4 L 610.3 161.4 L 614.2 159.8 L 618.0 157.6 L 621.9 155.4 L 625.8 153.6 L 629.7 153.5 L 633.6 153.4 L 637.5 152.3 L 641.4 149.4 L 645.2 146.9 L 649.1 144.5 L 653.0 143.6 L 656.9 139.4 L 660.8 135.8 L 664.7 134.5 L 668.6 133.3 L 672.5 131.6 L 676.3 130.0 L 680.2 126.7 L 684.1 125.6 L 688.0 125.4 L 691.9 124.8 L 695.8 122.0 L 699.7 118.8 L 703.5 116.4 L 707.4 114.4 L 711.3 113.7 L 715.2 113.2 L 719.1 112.2 L 723.0 111.0 L 726.9 110.2 L 730.8 109.5 L 734.6 108.5 L 738.5 108.1 L 742.4 106.3 L 746.3 102.9 L 750.2 101.7 L 754.1 100.8 L 758.0 100.5 L 761.8 100.2 L 765.7 99.6 L 769.6 98.2 L 773.5 95.4 L 777.4 94.7 L 781.3 94.7 L 785.2 94.7 L 789.1 93.6 L 792.9 91.7 L 796.8 91.0 L 800.7 90.2 L 804.6 90.2 L 808.5 90.0 L 812.4 88.4 L 816.3 87.4 L 820.2 85.2 L 824.0 80.0 L 827.9 77.9 L 831.8 76.8 L 835.7 74.6 L 839.6 71.8 L 843.5 68.7 L 847.4 66.5 L 851.2 63.8 L 855.1 60.8 L 859.0 59.1 L 862.9 56.7 L 866.8 53.9 L 870.7 52.8 L 874.6 49.5 L 878.5 48.0 L 882.3 46.7 L 886.2 42.5 L 890.1 40.2 L 894.0 40.0 L 894.0 300 L 70.0 300 Z" fill="url(#studio-area)"/>
    <path d="M 70.0 298.5 L 73.9 297.5 L 77.8 296.1 L 81.7 295.5 L 85.5 294.6 L 89.4 293.6 L 93.3 293.0 L 97.2 291.5 L 101.1 290.9 L 105.0 289.5 L 108.9 288.1 L 112.8 287.6 L 116.6 287.1 L 120.5 286.8 L 124.4 286.4 L 128.3 285.2 L 132.2 283.3 L 136.1 281.6 L 140.0 281.0 L 143.8 280.4 L 147.7 279.9 L 151.6 279.1 L 155.5 278.4 L 159.4 276.6 L 163.3 274.7 L 167.2 274.1 L 171.1 273.4 L 174.9 272.0 L 178.8 271.7 L 182.7 271.5 L 186.6 270.6 L 190.5 269.3 L 194.4 268.5 L 198.3 267.2 L 202.2 266.8 L 206.0 265.9 L 209.9 264.5 L 213.8 263.1 L 217.7 262.4 L 221.6 262.1 L 225.5 261.8 L 229.4 261.7 L 233.2 260.9 L 237.1 259.9 L 241.0 259.2 L 244.9 258.4 L 248.8 257.9 L 252.7 257.9 L 256.6 257.4 L 260.5 254.5 L 264.3 253.7 L 268.2 252.9 L 272.1 252.3 L 276.0 251.6 L 279.9 250.6 L 283.8 249.8 L 287.7 248.9 L 291.5 247.9 L 295.4 247.4 L 299.3 246.9 L 303.2 246.4 L 307.1 245.0 L 311.0 244.4 L 314.9 244.4 L 318.8 244.1 L 322.6 243.8 L 326.5 243.1 L 330.4 242.9 L 334.3 242.8 L 338.2 242.5 L 342.1 242.2 L 346.0 242.0 L 349.8 241.5 L 353.7 241.1 L 357.6 240.8 L 361.5 240.5 L 365.4 240.1 L 369.3 239.7 L 373.2 239.4 L 377.1 238.8 L 380.9 238.4 L 384.8 237.8 L 388.7 237.4 L 392.6 237.3 L 396.5 237.0 L 400.4 235.7 L 404.3 234.2 L 408.2 233.2 L 412.0 231.5 L 415.9 231.1 L 419.8 230.9 L 423.7 230.1 L 427.6 229.6 L 431.5 228.3 L 435.4 226.8 L 439.2 225.7 L 443.1 225.5 L 447.0 224.3 L 450.9 223.7 L 454.8 223.1 L 458.7 222.1 L 462.6 221.4 L 466.5 221.3 L 470.3 221.1 L 474.2 220.9 L 478.1 220.4 L 482.0 219.7 L 485.9 219.4 L 489.8 218.6 L 493.7 217.7 L 497.5 217.3 L 501.4 216.3 L 505.3 214.8 L 509.2 213.9 L 513.1 212.4 L 517.0 211.5 L 520.9 210.3 L 524.8 209.4 L 528.6 208.4 L 532.5 207.7 L 536.4 205.7 L 540.3 202.8 L 544.2 201.9 L 548.1 201.9 L 552.0 201.3 L 555.8 200.6 L 559.7 200.3 L 563.6 198.0 L 567.5 189.4 L 571.4 185.8 L 575.3 181.9 L 579.2 181.0 L 583.1 178.6 L 586.9 175.5 L 590.8 174.3 L 594.7 172.8 L 598.6 170.6 L 602.5 165.1 L 606.4 163.4 L 610.3 161.4 L 614.2 159.8 L 618.0 157.6 L 621.9 155.4 L 625.8 153.6 L 629.7 153.5 L 633.6 153.4 L 637.5 152.3 L 641.4 149.4 L 645.2 146.9 L 649.1 144.5 L 653.0 143.6 L 656.9 139.4 L 660.8 135.8 L 664.7 134.5 L 668.6 133.3 L 672.5 131.6 L 676.3 130.0 L 680.2 126.7 L 684.1 125.6 L 688.0 125.4 L 691.9 124.8 L 695.8 122.0 L 699.7 118.8 L 703.5 116.4 L 707.4 114.4 L 711.3 113.7 L 715.2 113.2 L 719.1 112.2 L 723.0 111.0 L 726.9 110.2 L 730.8 109.5 L 734.6 108.5 L 738.5 108.1 L 742.4 106.3 L 746.3 102.9 L 750.2 101.7 L 754.1 100.8 L 758.0 100.5 L 761.8 100.2 L 765.7 99.6 L 769.6 98.2 L 773.5 95.4 L 777.4 94.7 L 781.3 94.7 L 785.2 94.7 L 789.1 93.6 L 792.9 91.7 L 796.8 91.0 L 800.7 90.2 L 804.6 90.2 L 808.5 90.0 L 812.4 88.4 L 816.3 87.4 L 820.2 85.2 L 824.0 80.0 L 827.9 77.9 L 831.8 76.8 L 835.7 74.6 L 839.6 71.8 L 843.5 68.7 L 847.4 66.5 L 851.2 63.8 L 855.1 60.8 L 859.0 59.1 L 862.9 56.7 L 866.8 53.9 L 870.7 52.8 L 874.6 49.5 L 878.5 48.0 L 882.3 46.7 L 886.2 42.5 L 890.1 40.2 L 894.0 40.0" fill="none" stroke="#66d9ef" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>
    <g><circle cx="70.0" cy="298.5" r="5" fill="#0a1018" stroke="#66d9ef" stroke-width="2"/><circle cx="140.0" cy="281.0" r="5" fill="#0a1018" stroke="#66d9ef" stroke-width="2"/><circle cx="338.2" cy="242.5" r="5" fill="#0a1018" stroke="#66d9ef" stroke-width="2"/><circle cx="404.3" cy="234.2" r="5" fill="#0a1018" stroke="#66d9ef" stroke-width="2"/><circle cx="540.3" cy="202.8" r="5" fill="#0a1018" stroke="#66d9ef" stroke-width="2"/><circle cx="567.5" cy="189.4" r="5" fill="#0a1018" stroke="#f9c97a" stroke-width="2"/><circle cx="894.0" cy="40.0" r="5.5" fill="#0a1018" stroke="#a6e3a1" stroke-width="2"/></g>
    <g><line x1="70.0" y1="291.5" x2="70.0" y2="282.5" stroke="#66d9ef" stroke-width="1" opacity="0.5"/><text x="72.0" y="276.5" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="start">MVP day</text><line x1="140.0" y1="274.0" x2="140.0" y2="265.0" stroke="#66d9ef" stroke-width="1" opacity="0.5"/><text x="140.0" y="259.0" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="middle">MCP server</text><line x1="338.2" y1="235.5" x2="338.2" y2="226.5" stroke="#66d9ef" stroke-width="1" opacity="0.5"/><text x="338.2" y="220.5" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="middle">Stripe</text><line x1="404.3" y1="241.2" x2="404.3" y2="250.2" stroke="#66d9ef" stroke-width="1" opacity="0.5"/><text x="404.3" y="264.2" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="middle">team joins</text><line x1="540.3" y1="209.8" x2="540.3" y2="218.8" stroke="#66d9ef" stroke-width="1" opacity="0.5"/><text x="540.3" y="232.8" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="middle">supplier portal</text><line x1="567.5" y1="182.4" x2="567.5" y2="173.4" stroke="#f9c97a" stroke-width="1" opacity="0.5"/><text x="557.5" y="163.4" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="end">182-commit day</text><text x="882.0" y="45.0" fill="#a6e3a1" font-size="13" font-weight="800" text-anchor="end">5,500</text></g>
  </svg>
  <figcaption>This is the original seven-month curve: my first 5,501 commits through July 2. The <a href="/projects/sirv-studio/build-record/">live build record</a> continues through the July 10 snapshot and breaks the work into 48 dated milestones.</figcaption>
</figure>

<figure class="studio-visual studio-snapshot" aria-labelledby="studio-snapshot-title">
  <div class="studio-visual-head">
    <span id="studio-snapshot-title">repository snapshot</span>
    <strong>dev @ 20eef964 · Jul 10, 2026</strong>
  </div>
  <div class="studio-snapshot-grid">
    <div class="studio-snapshot-card"><strong>9,452</strong><span>commits in the repo</span></div>
    <div class="studio-snapshot-card"><strong>6,638</strong><span>under my primary author identity</span></div>
    <div class="studio-snapshot-card"><strong>215 / 220</strong><span>calendar days with a commit</span></div>
    <div class="studio-snapshot-card"><strong>4,751</strong><span>tracked test and spec files</span></div>
    <div class="studio-snapshot-card"><strong>263</strong><span>Drizzle migrations</span></div>
    <div class="studio-snapshot-card"><strong>47</strong><span>tools in the MCP server</span></div>
  </div>
  <figcaption>A moving snapshot, not decorative numerology. The build record includes the exact command behind each count.</figcaption>
</figure>

## What it does

The product is organized around one loop: **ingest → fix → validate → review → publish → track**.

- **30+ AI tools** for product content — background removal and replacement, upscaling, lifestyle-shot generation, ghost mannequin, virtual try-on (image and video), alt text, product descriptions, image translation, image-to-3D, video generation — backed by 57 registered models routed through fal.ai, OpenAI, and OpenRouter.
- **A visual workflow orchestrator**: a drag-and-drop DAG builder with 39 registered step types, so a merchant can chain "remove background → generate lifestyle shot → write alt text → human review → push to Shopify" and run it across an entire catalog. Workflows execute on durable background jobs with pause/resume, review gates, and live progress, and can be triggered from the UI, the API, webhooks, or an AI agent.
- **A supplier portal**: brands give their suppliers an upload link or SFTP drop. Incoming files are validated against filename/SKU/spec rules, run through AI autofix, and routed into an approval queue — so supplier content goes through review instead of straight into the catalog.
- **Marketplace compliance built in**: an image-review tool validates against Amazon, eBay, Walmart, and Shopify listing rules — dimensions, backgrounds, watermarks, frame fill — and one-click autofix repairs what fails.
- **Asset and product management** (DAM + PIM) underneath it all — with search-by-image, duplicate detection, auto-tagging, and license tracking that can gate a publish — plus Stripe billing on top and integrations out the sides: Shopify, Zapier, n8n, a REST API, and MCP for AI agents.

<figure class="studio-visual studio-toolwall" aria-labelledby="studio-toolwall-title">
  <div class="studio-visual-head">
    <span id="studio-toolwall-title">the toolbox</span>
    <strong>34 tool routes · 57 models · counted from the code</strong>
  </div>
  <div class="studio-toolwall-grid">
    <div class="studio-toolwall-cat">
      <b>create</b>
      <span>image generation</span><span>SVG generation</span><span>video generation · up to 4K</span><span>image → 3D · GLB/OBJ/FBX/USDZ</span><span>AI fashion model</span><span>fashion video</span>
    </div>
    <div class="studio-toolwall-cat">
      <b class="is-green">edit</b>
      <span>background removal</span><span>background replace</span><span>object removal</span><span>prompt-based editing</span><span>upscaling · up to 8×</span><span>smart crop</span><span>shadows</span><span>ghost mannequin</span><span>color variants</span><span>depth maps</span><span>GLB optimizer</span>
    </div>
    <div class="studio-toolwall-cat">
      <b class="is-amber">product content</b>
      <span>lifestyle scenes · 44 presets</span><span>virtual try-on · image &amp; video</span><span>alt text</span><span>descriptions · 12+ languages</span><span>image translation</span><span>PDF translation</span><span>document summary</span><span>bundle composer</span><span>video captions</span>
    </div>
    <div class="studio-toolwall-cat">
      <b class="is-violet">automate &amp; govern</b>
      <span>batch · every tool, catalog-scale</span><span>orchestrator · 39 step types</span><span>AI routing</span><span>review gates &amp; autofix loops</span><span>marketplace optimizer</span><span>image review · Amazon/eBay/Walmart</span><span>webhooks · API · Zapier · n8n · MCP</span>
    </div>
    <div class="studio-toolwall-cat studio-toolwall-wide">
      <b>asset intelligence</b>
      <span>search by image</span><span>semantic search</span><span>find similar</span><span>duplicate detection</span><span>auto-tagging</span><span>smart collections</span><span>saved views</span><span>license tracking · publish gates</span><span>license alerts</span><span>watermark templates</span><span>asset &amp; search analytics</span>
    </div>
  </div>
  <figcaption>The toolbox, by category. Every chip is a shipped tool route or orchestrator capability; the models behind them route through fal.ai, OpenAI, and OpenRouter. The interface all of this lives in runs on the internal design system and virtualized data grid built by <a href="https://www.linkedin.com/in/max-wish/">Max Wish</a>.</figcaption>
</figure>

<img src="/images/studio/studio-products.webp" alt="Sirv AI Studio products view with per-product readiness scores" width="1345" height="1343" loading="lazy" decoding="async"/>
*The products view: every product scored for content readiness against its channel's requirements.*

## How it's built

The app is a TanStack Start + React 19 application (migrated off Next.js, running the React Compiler) built with Vite and deployed on Vercel. Data lives in PostgreSQL 17 behind Drizzle ORM, with 263 committed migrations in the July 10 snapshot. Background work runs on Inngest across sync, publishing, billing, imports, repair jobs, and workflow execution, self-hosted on Hetzner with a Patroni HA Postgres cluster behind it. Redis handles rate limiting, Sentry/PostHog/Grafana handle observability, and the repo contains 4,751 tracked test and spec files across unit, integration, contract, Storybook, and browser layers. Capacitor shells package it for iOS and Android. The infrastructure bill for all of this, at current capacity, is about $70 a month.

<figure class="studio-visual studio-architecture" aria-labelledby="studio-architecture-title">
  <div class="studio-visual-head">
    <span id="studio-architecture-title">system map</span>
    <strong>product surfaces → governed execution → external systems</strong>
  </div>
  <svg viewBox="0 0 920 552" role="img" aria-label="Sirv AI Studio architecture map: three product surfaces enter one governed core, which drives Postgres, Inngest jobs, AI providers, Shopify publishing, and Sirv storage, with observability across every hop."><defs><marker id="studio-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#66d9ef"/></marker><marker id="studio-arrow-g" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" fill="#a6e3a1"/></marker><linearGradient id="studio-node" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#152231"/><stop offset="100%" stop-color="#0d141e"/></linearGradient></defs><g fill="#94a6b4" font-size="11" letter-spacing="0.14em"><text x="156" y="100" text-anchor="middle">SURFACES</text><text x="460" y="100" text-anchor="middle">CORE &amp; DATA</text><text x="764" y="100" text-anchor="middle">EXTERNAL SYSTEMS</text></g><g stroke="#66d9ef" stroke-width="2.2" fill="none" marker-end="url(#studio-arrow)" opacity="0.85"><path d="M 248 162 L 303.0 162 Q 313.0 162 313.0 172 L 313.0 258 Q 313.0 268 323.0 268 L 378 268"/><path d="M 248 280 L 378 280"/><path d="M 248 398 L 303.0 398 Q 313.0 398 313.0 388 L 313.0 302 Q 313.0 292 323.0 292 L 378 292"/><path d="M 542 268 L 595.0 268 Q 605.0 268 605.0 258 L 605.0 172 Q 605.0 162 615.0 162 L 668 162"/><path d="M 542 280 L 668 280"/><path d="M 542 292 L 595.0 292 Q 605.0 292 605.0 302 L 605.0 388 Q 605.0 398 615.0 398 L 668 398"/></g><g stroke="#66d9ef" stroke-width="2.2" fill="none" opacity="0.85" marker-end="url(#studio-arrow)" marker-start="url(#studio-arrow)"><line x1="460" y1="232" x2="460" y2="188"/><line x1="460" y1="328" x2="460" y2="372"/></g><rect x="64" y="128" width="184" height="68" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.45)"/><text x="156.0" y="156.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">TanStack app</text><text x="156.0" y="178.0" fill="#94a6b4" font-size="12" text-anchor="middle">merchant UI</text><rect x="64" y="246" width="184" height="68" rx="10" fill="url(#studio-node)" stroke="rgba(166,227,161,0.45)"/><text x="156.0" y="274.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Supplier portal</text><text x="156.0" y="296.0" fill="#94a6b4" font-size="12" text-anchor="middle">intake + review</text><rect x="64" y="364" width="184" height="68" rx="10" fill="url(#studio-node)" stroke="rgba(203,166,247,0.45)"/><text x="156.0" y="392.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">MCP + API</text><text x="156.0" y="414.0" fill="#94a6b4" font-size="12" text-anchor="middle">agent operations</text><rect x="372" y="124" width="176" height="64" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.38)"/><text x="460.0" y="150.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Postgres</text><text x="460.0" y="172.0" fill="#94a6b4" font-size="12" text-anchor="middle">products · assets · jobs</text><rect x="372" y="372" width="176" height="64" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.38)"/><text x="460.0" y="398.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Inngest</text><text x="460.0" y="420.0" fill="#94a6b4" font-size="12" text-anchor="middle">durable workflows</text><rect x="672" y="128" width="184" height="68" rx="10" fill="url(#studio-node)" stroke="rgba(166,227,161,0.44)"/><text x="764.0" y="156.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">AI providers</text><text x="764.0" y="178.0" fill="#94a6b4" font-size="12" text-anchor="middle">image + text models</text><rect x="672" y="246" width="184" height="68" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.44)"/><text x="764.0" y="274.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Shopify</text><text x="764.0" y="296.0" fill="#94a6b4" font-size="12" text-anchor="middle">drift-safe publishing</text><rect x="672" y="364" width="184" height="68" rx="10" fill="url(#studio-node)" stroke="rgba(249,201,122,0.44)"/><text x="764.0" y="392.0" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Sirv storage</text><text x="764.0" y="414.0" fill="#94a6b4" font-size="12" text-anchor="middle">assets + rollback</text><rect x="378" y="232" width="164" height="96" rx="12" fill="#07131c" stroke="rgba(249,201,122,0.72)" stroke-width="2"/><text x="460" y="270" fill="#f9c97a" font-size="18" font-weight="800" text-anchor="middle">Studio core</text><text x="460" y="292" fill="#edf7fb" font-size="12" text-anchor="middle">auth · credits</text><text x="460" y="310" fill="#edf7fb" font-size="12" text-anchor="middle">review gates</text><rect x="64" y="478" width="792" height="46" rx="23" fill="rgba(166,227,161,0.05)" stroke="rgba(166,227,161,0.22)"/><circle cx="96" cy="501" r="4" fill="#a6e3a1"/><text x="114" y="506" fill="#c9d6de" font-size="13" font-weight="700">observability across every hop</text><text x="856" y="506" fill="#94a6b4" font-size="13" text-anchor="end">Sentry · PostHog · Grafana</text></svg>
  <figcaption>The important boundary is in the middle: UI, supplier uploads, API calls, and AI agents all enter the same governed core before jobs, providers, storage, or Shopify writes happen.</figcaption>
</figure>

Two teammates own critical pieces of this: [Max Wish](https://www.linkedin.com/in/max-wish/) built the internal design system and the custom virtualized data grid that powers the asset and product tables, and [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) built out the E2E/QA harness that keeps the velocity you'll read about below honest.

<img src="/images/studio/studio-assets-grid.webp" alt="Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table" width="1350" height="1338" loading="lazy" decoding="async"/>
*The assets table, running on the in-house virtualized data grid built by [Max Wish](https://www.linkedin.com/in/max-wish/) — live thumbnails, sortable metadata, virtualized rows. And near the top: `Herceg-Novi-bg.jpg`, the town where the bet was made.*

Three problems were harder than the rest.

## Publishing to someone else's store, safely

The scariest thing Studio does is write to a merchant's live Shopify catalog. The naive version of this feature silently overwrites a product edit the merchant made an hour ago — once, and they never trust the product again.

So publishing is built around **drift detection**: before writing, Studio compares when a product was last synced, when it changed in Shopify, and when it changed in Studio, and classifies every product as `in_sync`, `shopify_newer`, or `studio_newer`. If Shopify is newer — the merchant edited since the last sync — Studio won't blindly overwrite; the conflict is surfaced instead. A second reconciliation layer catches identity drift, like a source image that was deleted or replaced out from under a sync.

Writes themselves are versioned and idempotent: publishes go through explicit strategies (add alongside the original, replace, set featured, alt-text-only), every published asset keeps its version history with rollback, and an event outbox guarantees that a retried job can't double-publish. "Publish safely, roll back instantly" is the promise the whole layer is built to keep.

## Supplier uploads without the chaos

Every merchant with suppliers has the same intake problem: product content arrives by email and shared drives — named wrong, sized wrong, missing SKUs — and someone has to chase it into shape before it can go anywhere near the store.

Studio turns intake into a pipeline. Each supplier gets a scoped upload portal — a link, chunked batch upload, or an SFTP drop. Submissions are validated on arrival against filename patterns, SKU matching, gallery-slot requirements, and image specs. AI autofix repairs what can be repaired automatically. Everything then lands in an approval queue where the reviewer sees the product context, the shot list, and exactly which checks failed before accepting anything; rejected work goes back to the supplier with reasons. The approval boundary is enforced at the database layer — hardened guards make it structurally impossible for supplier content to skip review on its way to a live store.

<img src="/images/studio/studio-review-queue.webp" alt="Sirv AI Studio review queue with automated checks and AI autofix" width="1600" height="945" loading="lazy" decoding="async"/>
*The review queue — the human gate between supplier intake and a live store. Automated checks flag problems, AI autofix repairs them, a reviewer approves.*

## Making it operable by AI agents

Studio ships a production MCP server (published on npm, stdio and hosted HTTP transports) exposing **47 tools** — AI processing, asset search and management, product CRUD, Shopify sync, supplier-portal review — plus a published **64-operation OpenAPI surface** for ChatGPT-style integrations and conventional clients.

The design position: agents don't need raw endpoints, they need *operations inside a governed system*. So the agent surface gets the same context, permissions, approvals, budgets, and rollback as the UI. Auth is OAuth 2.0 with PKCE or API keys; every credit-spending or mutating tool re-authorizes server-side and fails closed if the workspace lacks entitlement; org scoping is validated against membership on every call; tools carry MCP safety annotations (read-only, destructive, idempotent) so agent runtimes can reason about blast radius. An agent can run a batch fix or execute a workflow — but it can't skip the review gate a human would hit.

## April, or: changing the wings mid-flight

By spring, Studio had outgrown its framework. The answer wasn't a rewrite branch that ships "next quarter" — it was a live migration of a production app, with users on it.

The log tells it plainly. April 2: the supplier portal ships. April 8: `Add TanStack Start bootstrap slice` — the Next.js → TanStack Start migration begins. April 9: 182 commits in one day, the largest day of the project at that point, mid-migration, with a compatibility shim keeping the old framework's imports alive while routes moved one by one. April 10: `build: remove final next runtime dependencies`. The runtime swap of a billing, multi-tenant, background-job-running platform took about seventy-two hours, and nothing froze. The same month carried 1,337 commits from me alone.

<figure class="studio-visual studio-april" aria-labelledby="studio-april-title">
  <div class="studio-visual-head">
    <span id="studio-april-title">April migration close-up</span>
    <strong>Apr 6–13 · commits per day</strong>
  </div>
  <svg viewBox="0 0 920 270" role="img" aria-label="Commits per day from April 6 through 13; April 8 to 10 is the Next.js to TanStack Start migration window, with the migration stretch peaking at 182 commits on April 9.">
    <rect x="291.5" y="26" width="288.2" height="216" rx="10" fill="rgba(102,217,239,0.055)" stroke="rgba(102,217,239,0.22)"/>
    <text x="435.6" y="16" fill="#66d9ef" font-size="11" font-weight="700" letter-spacing="0.1em" text-anchor="middle">72-HOUR MIGRATION WINDOW</text>
    <g stroke="rgba(255,255,255,0.09)" stroke-width="1"><line x1="90" y1="180.5" x2="880" y2="180.5"/><line x1="90" y1="131.1" x2="880" y2="131.1"/><line x1="90" y1="81.6" x2="880" y2="81.6"/></g>
    <g><text x="80" y="184.5" fill="#94a6b4" font-size="11" text-anchor="end">50</text><text x="80" y="135.1" fill="#94a6b4" font-size="11" text-anchor="end">100</text><text x="80" y="85.6" fill="#94a6b4" font-size="11" text-anchor="end">150</text></g>
    <line x1="90" y1="230" x2="880" y2="230" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <g><rect id="apr-b1" x="116.4" y="215.2" width="46" height="14.8" rx="5" fill="rgba(102,217,239,0.55)"/><rect id="apr-b2" x="215.1" y="225.1" width="46" height="4.9" rx="5" fill="rgba(102,217,239,0.55)"/><rect id="apr-b3" x="313.9" y="181.5" width="46" height="48.5" rx="5" fill="#66d9ef"/><rect id="apr-b4" x="412.6" y="50.0" width="46" height="180.0" rx="5" fill="#f9c97a"/><rect id="apr-b5" x="511.4" y="154.8" width="46" height="75.2" rx="5" fill="#66d9ef"/><rect id="apr-b6" x="610.1" y="147.9" width="46" height="82.1" rx="5" fill="rgba(102,217,239,0.55)"/><rect id="apr-b7" x="708.9" y="211.2" width="46" height="18.8" rx="5" fill="rgba(102,217,239,0.55)"/><rect id="apr-b8" x="807.6" y="180.5" width="46" height="49.5" rx="5" fill="rgba(102,217,239,0.55)"/></g>
    <g><text x="139.4" y="207.2" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">15</text><text x="238.1" y="217.1" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">5</text><text x="336.9" y="173.5" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">49</text><text x="435.6" y="42.0" fill="#f9c97a" font-size="13" font-weight="700" text-anchor="middle">182</text><text x="534.4" y="146.8" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">76</text><text x="633.1" y="139.9" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">83</text><text x="731.9" y="203.2" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">19</text><text x="830.6" y="172.5" fill="#edf7fb" font-size="13" font-weight="700" text-anchor="middle">50</text></g>
    <g><text x="139.4" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 6</text><text x="238.1" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 7</text><text x="336.9" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 8</text><text x="435.6" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 9</text><text x="534.4" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 10</text><text x="633.1" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 11</text><text x="731.9" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 12</text><text x="830.6" y="254" fill="#94a6b4" font-size="11.5" text-anchor="middle">Apr 13</text></g>
    <g><rect x="90.4" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b1" data-tip-value="15 commits" data-tip-label="Apr 6"/><rect x="189.1" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b2" data-tip-value="5 commits" data-tip-label="Apr 7"/><rect x="287.9" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b3" data-tip-value="49 commits" data-tip-label="Apr 8" data-tip-note="Add TanStack Start bootstrap slice — the migration begins"/><rect x="386.6" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b4" data-tip-value="182 commits" data-tip-label="Apr 9" data-tip-note="The migration's biggest day, and the project peak at that point"/><rect x="485.4" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b5" data-tip-value="76 commits" data-tip-label="Apr 10" data-tip-note="Final Next runtime dependencies removed"/><rect x="584.1" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b6" data-tip-value="83 commits" data-tip-label="Apr 11"/><rect x="682.9" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b7" data-tip-value="19 commits" data-tip-label="Apr 12"/><rect x="781.6" y="26" width="98" height="204" fill="rgba(0,0,0,0)" data-bar="#apr-b8" data-tip-value="50 commits" data-tip-label="Apr 13"/></g>
  </svg>
  <figcaption>The highlighted window is the live Next.js → TanStack Start migration: bootstrap on Apr 8, the 182-commit spike on Apr 9, final Next runtime dependencies removed on Apr 10.</figcaption>
</figure>

A two-day framework migration isn't a typing achievement. It's what happens when the test suite is dense enough to catch every regression an automated refactor introduces, and the review gates are strict enough to trust the throughput. Which brings up the part of this story that's actually about method.

## How three people and a fleet ship this fast

At the July 10 snapshot, the primary identities of the core three account for **9,308 commits**: 6,638 mine, 1,943 from Veniamin, and 727 from Max. Another 144 belong to additional contributors, bots, and alternate identities. Raw commit volume is not value, and agent-heavy histories make the number especially noisy. What matters is the shape: output accelerated as the production system around the agents matured.

Commit volume is not value. But output with that shape needs explaining, and the explanation is the method: **I run a fleet of AI coding agents the way a lead runs a team.** And the fleet has real infrastructure, not vibes:

- **VibeQueue** — a task queue I built as a standalone product, with Veniamin adding its QA lanes — is the fleet's control plane. Agents claim work from it over MCP, check for duplicate tasks before opening new ones, and maintain todo checklists inside each task, the way an engineer works a ticket.
- **The clanker army** turns a reviewed plan into isolated worker worktrees, runs them in supervised batches, and converges the results — with a terminal dashboard, a supervisor for detached workers, and an autopilot that keeps pulling eligible tasks off the queue.
- **The agent roles live in the repo with written charters** — qa-lead, qa-explorer, qa-security-lead, perf-reviewer — the way a real team has job descriptions.
- **Sirvant**, the fleet's Slack-facing work partner, takes a bug report in plain English and dispatches disposable workers to reproduce and fix it. Slack is the cockpit; VibeQueue is the ledger.

<img src="/images/studio/studio-vibeq.webp" alt="VibeQueue dashboard showing who's working on what, the bug pipeline, and the coverage-matrix quality gate" width="1340" height="1314" loading="lazy" decoding="async"/>
*VibeQueue, live: who's working on what (the 164 open tasks are mine), stalled reviews flagged for attention, the bug pipeline by priority, hotspot domains — and the coverage-matrix gate at the bottom deciding whether work is allowed to ship.*

My job in that loop is editorial: specs before code, tests before behavior changes, a blocking quality gate on every stop, and adversarial review agents that try to break each change before it lands. Architecture, judgment, taste — and standing behind every line that ships.

The human layer is deliberately simple. We run daily branch ownership: one person owns the dev branch for the day and pushes to it directly — no pull requests, no review queue, no merge conflicts. A ten-minute morning sync, a handoff, and everyone stays in flow. The coordination ceremony that eats most teams' velocity simply isn't there. The internal team doc ends with the whole philosophy in six words: build fast, trust each other, ship often.

I wrote the broader argument behind this operating model in [Two theories of a programmer](/posts/two-theories-of-a-programmer/). This page keeps the claim grounded in the Studio evidence.

The evidence it's a system and not a slogan is in other people's curves. When Veniamin joined on QA, his weekly output ran near twenty commits while he built the harness — coverage matrix, anti-forgery checks, agent workflows. Two months later his weeks read 277, 309, 188. A fifteen-fold personal ramp inside one quarter isn't a person learning to type faster; it's infrastructure coming online and paying compound interest. Manual coding scales with hours. Fleet coding scales with the infrastructure you've built for the agents — and infrastructure compounds.

## The correction

The repository's own July assessment opens with a line I agree with: **construction has outrun proof**.

Studio has an unusually complete product-content loop, but too much breadth was still rollout-gated and too little was backed by named merchants using the loop every week. The same machine that made code cheap also made adding one more surface almost irresistible. Every new tool, channel, and workflow step then carried a tax in support, documentation, billing, and browser proof.

So the Q3 rule is a surface freeze. No casual new tools, channels, or step types. The fleet is pointed at activation, enforceable plan boundaries, onboarding, App Store quality, rollback proof, and getting real merchants from catalog scan to first approved Shopify publish. The build velocity is still the advantage. The target changed from more surface to more evidence.

## So is it any good?

Commit counts measure motion, not quality — a fair objection, so a week after writing this page I turned the fleet on the codebase itself. Ten reviewer agents in parallel, one per domain, read the code, schema, migrations, tests, and CI configuration — by then roughly 512K lines of hand-written TypeScript across 7,800 files and 162 database tables, with 4,751 tracked test and spec files by the next morning's repository snapshot — and Claude Fable compiled the reviews into a scorecard, then ran four file-level deep-dives to re-verify the heaviest findings. The calibration was explicit: 5 is a typical startup, 7 is solid production quality, 9+ is exceptional.

The verdict: **8.25 out of 10**.

<figure class="studio-visual studio-scorecard" aria-labelledby="studio-scorecard-title">
  <div class="studio-visual-head">
    <span id="studio-scorecard-title">the scorecard</span>
    <strong>Jul 9, 2026 · 10 parallel reviewers</strong>
  </div>
  <svg viewBox="0 0 920 576" role="img" aria-label="Scorecard bar chart on a 0-to-10 scale with calibration lines at 5 (typical startup), 7 (solid production), and 9 (exceptional). Overall 8.25. Domains: testing and quality 8.5, data model 8.5, frontend and design system 8.5, architecture 8, security 8. Features: supplier portal 8.5, integrations and API 8.5, orchestrator 8.5, AI tools 8, DAM 8, billing 8, marketing and SEO 8, PIM 7.">
    <g stroke="rgba(255,255,255,0.14)" stroke-width="1" stroke-dasharray="3 4"><line x1="570" y1="28" x2="570" y2="546"/><line x1="702" y1="28" x2="702" y2="546"/><line x1="834" y1="28" x2="834" y2="546"/></g>
    <g fill="#94a6b4" font-size="10.5" text-anchor="middle"><text x="570" y="18">5 · typical startup</text><text x="702" y="18">7 · solid production</text><text x="834" y="18">9 · exceptional</text></g>
    <rect id="sc-o" x="240" y="44" width="544.5" height="20" rx="5" fill="#66d9ef"/>
    <text x="232" y="58" fill="#edf7fb" font-size="14" font-weight="700" text-anchor="end">Overall</text>
    <text x="792.5" y="59" fill="#f9c97a" font-size="15" font-weight="800">8.25</text>
    <text x="0" y="96" fill="#94a6b4" font-size="11" letter-spacing="0.14em">DOMAINS</text>
    <g fill="rgba(102,217,239,0.72)"><rect id="sc-d1" x="240" y="112" width="561" height="16" rx="5"/><rect id="sc-d2" x="240" y="142" width="561" height="16" rx="5"/><rect id="sc-d3" x="240" y="172" width="561" height="16" rx="5"/><rect id="sc-d4" x="240" y="202" width="528" height="16" rx="5"/><rect id="sc-d5" x="240" y="232" width="528" height="16" rx="5"/></g>
    <g fill="#cdd8e0" font-size="13" text-anchor="end"><text x="232" y="124">Testing &amp; quality</text><text x="232" y="154">Data model</text><text x="232" y="184">Frontend &amp; design system</text><text x="232" y="214">Architecture</text><text x="232" y="244">Security</text></g>
    <g fill="#edf7fb" font-size="13" font-weight="700"><text x="809" y="124">8.5</text><text x="809" y="154">8.5</text><text x="809" y="184">8.5</text><text x="776" y="214">8</text><text x="776" y="244">8</text></g>
    <text x="0" y="288" fill="#94a6b4" font-size="11" letter-spacing="0.14em">FEATURES</text>
    <g fill="rgba(102,217,239,0.72)"><rect id="sc-f1" x="240" y="300" width="561" height="16" rx="5"/><rect id="sc-f2" x="240" y="330" width="561" height="16" rx="5"/><rect id="sc-f3" x="240" y="360" width="561" height="16" rx="5"/><rect id="sc-f4" x="240" y="390" width="528" height="16" rx="5"/><rect id="sc-f5" x="240" y="420" width="528" height="16" rx="5"/><rect id="sc-f6" x="240" y="450" width="528" height="16" rx="5"/><rect id="sc-f7" x="240" y="480" width="528" height="16" rx="5"/></g>
    <rect id="sc-f8" x="240" y="510" width="462" height="16" rx="5" fill="#f9c97a"/>
    <g fill="#cdd8e0" font-size="13" text-anchor="end"><text x="232" y="312">Supplier portal</text><text x="232" y="342">Integrations &amp; API</text><text x="232" y="372">Orchestrator</text><text x="232" y="402">AI tools</text><text x="232" y="432">DAM</text><text x="232" y="462">Billing</text><text x="232" y="492">Marketing &amp; SEO</text><text x="232" y="522">PIM</text></g>
    <g fill="#edf7fb" font-size="13" font-weight="700"><text x="809" y="312">8.5</text><text x="809" y="342">8.5</text><text x="809" y="372">8.5</text><text x="776" y="402">8</text><text x="776" y="432">8</text><text x="776" y="462">8</text><text x="776" y="492">8</text><text x="710" y="522">7</text></g>
    <line x1="240" y1="546" x2="900" y2="546" stroke="rgba(255,255,255,0.2)" stroke-width="1"/>
    <g fill="#94a6b4" font-size="11.5" text-anchor="middle"><text x="240" y="564">0</text><text x="570" y="564">5</text><text x="702" y="564">7</text><text x="834" y="564">9</text><text x="900" y="564">10</text></g>
    <g><rect x="0" y="38" width="920" height="32" fill="rgba(0,0,0,0)" data-bar="#sc-o" data-tip-value="8.25 / 10" data-tip-label="Overall" data-tip-note="Initial pass scored 8; revised to 8.25 after four file-level deep-dives re-verified the heaviest findings."/><rect x="0" y="105" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-d1" data-tip-value="8.5 / 10" data-tip-label="Testing and quality" data-tip-note="Governed e2e coverage matrix with signed evidence receipts and real-worker idempotency proofs; the unit layer leans hard on mocks."/><rect x="0" y="135" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-d2" data-tip-value="8.5 / 10" data-tip-label="Data model" data-tip-note="Composite tenant-parity foreign keys and 385 CHECK constraints make cross-tenant links structurally impossible; some legacy FK and index debt."/><rect x="0" y="165" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-d3" data-tip-value="8.5 / 10" data-tip-label="Frontend and design system" data-tip-note="sid-kit ships 88 contract docs and OKLCH token math with inline WCAG rationale; a few 2,000-line components remain."/><rect x="0" y="195" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-d4" data-tip-value="8 / 10" data-tip-label="Architecture" data-tip-note="Layering is machine-enforced: ~100 import-safety CI assertions, zero route-to-DB imports across 502 API routes; god files tracked but tolerated."/><rect x="0" y="225" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-d5" data-tip-value="8 / 10" data-tip-label="Security" data-tip-note="DNS-pinned SSRF defense, strict OAuth rotation, and a tenant-scoping CI gate; a hardening backlog is planned and queued."/><rect x="0" y="293" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f1" data-tip-value="8.5 / 10" data-tip-label="Supplier portal" data-tip-note="End-to-end intake, validation, review, and delivery with ~430 test files; live with a real enterprise customer."/><rect x="0" y="323" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f2" data-tip-value="8.5 / 10" data-tip-label="Integrations and API" data-tip-note="47-tool MCP server with its own OAuth provider, a ratcheted 64-operation OpenAPI surface, and a deep Shopify app."/><rect x="0" y="353" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f3" data-tip-value="8.5 / 10" data-tip-label="Orchestrator" data-tip-note="Durable DAG execution with review gates, pause/resume, and four refund reconciliation paths. Revised up from 8: the feared legacy path was dead code."/><rect x="0" y="383" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f4" data-tip-value="8 / 10" data-tip-label="AI tools" data-tip-note="One factory gives 34 tool routes retry, circuit breakers, dedupe, and credit handling; deterministic pixel rules replace paid AI calls where they can."/><rect x="0" y="413" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f5" data-tip-value="8 / 10" data-tip-label="DAM" data-tip-note="Wide format support, BM25 plus vector search, versions, licensing, share links; usage analytics still missing."/><rect x="0" y="443" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f6" data-tip-value="8 / 10" data-tip-label="Billing" data-tip-note="Idempotent ledger writes, dispute clawback, dual-provider entitlements; storage quotas still run in warn mode."/><rect x="0" y="473" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f7" data-tip-value="8 / 10" data-tip-label="Marketing and SEO" data-tip-note="A ~400-URL programmatic estate with an in-house SEO CMS and a full lifecycle funnel; the editorial leg barely exists."/><rect x="0" y="503" width="920" height="30" fill="rgba(0,0,0,0)" data-bar="#sc-f8" data-tip-value="7 / 10" data-tip-label="PIM" data-tip-note="Typed attributes, a readiness engine, and industrial import are real; variant editing and non-Shopify channel sync are unfinished. Revised up from 6.5."/></g>
  </svg>
  <figcaption>Every rating from the July 9 scorecard, on its stated calibration scale. Hover or tab across a bar for the one-line verdict behind the number; the amber bar is the honest weak spot.</figcaption>
</figure>

The theme every reviewer independently landed on is the same one that explains the velocity chapter above: the guardrails are executable, not prose. Import-safety tests function as a machine-checked log of architecture decisions. The e2e coverage matrix refuses to count a flow as covered without a signed receipt from a real run. Org scoping is a static-analysis gate that fails pull requests. Tenancy is enforced by the schema itself, so cross-tenant data links are structurally impossible rather than merely discouraged. That apparatus is what lets fleet-scale output land at production quality — and the audit is the measurement of it.

The scorecard is just as plain about what keeps it off a 9: the PIM's back half is unfinished (variant editing, channel sync beyond Shopify), storage quotas still run in warn mode instead of enforce, and the tracked-but-tolerated debt — a few 2,000-line components, circular imports in the lib layer — is ratcheted but not blocked. Every one of those tracks left the audit with an executor-ready implementation plan, because that's the pipeline here: findings become plans, plans become fleet work.

Two findings stuck with me. First, when the deep-dives re-verified the audit's heaviest weaknesses, every re-checked claim turned out equal to or smaller than first reported — the scariest one, a supposedly divergent legacy billing path in the orchestrator, was dead code with zero production callers. The codebase was better than its own audit notes. Second, the economics line: the reviewers put comparable scope at 200+ engineer-months for a conventional team, and this took about ten — with no quality cliff between the domains I built solo and the ones with dedicated owners. That's the fleet claim from the previous section, measured.

---

Studio also carries the less glamorous machinery a production platform needs: exponential-backoff retries with jitter, per-operation circuit breakers on AI providers, content-based idempotency keys, Redis-backed rate limits, and restore-drilled database backups. That layer has no screenshots, but it's why the rest works.

<a href="https://www.sirv.studio" target="_blank">Try Sirv AI Studio →</a> · [Check the build record →](/projects/sirv-studio/build-record/)

<script>
(function () {
  function makeTip(fig) {
    var tip = document.createElement("div");
    tip.className = "studio-tip";
    fig.appendChild(tip);
    return tip;
  }

  function fillTip(tip, value, label, note) {
    tip.textContent = "";
    var b = document.createElement("b");
    b.textContent = value;
    tip.appendChild(b);
    var s = document.createElement("span");
    s.textContent = label;
    tip.appendChild(s);
    if (note) {
      var e = document.createElement("em");
      e.textContent = note;
      tip.appendChild(e);
    }
  }

  function placeTip(tip, fig, clientX, clientY) {
    var r = fig.getBoundingClientRect();
    var x = clientX - r.left + fig.scrollLeft - tip.offsetWidth / 2;
    x = Math.max(8, Math.min(x, r.width + fig.scrollLeft - tip.offsetWidth - 8));
    var y = clientY - r.top - tip.offsetHeight - 16;
    if (y < 6) y = clientY - r.top + 18;
    tip.style.left = x + "px";
    tip.style.top = y + "px";
  }

  function bindMarks(fig) {
    var tip = makeTip(fig);
    fig.querySelectorAll("[data-tip-label]").forEach(function (el) {
      var barSel = el.getAttribute("data-bar");
      var bar = barSel ? fig.querySelector(barSel) : el;
      el.setAttribute("tabindex", "0");
      function show(ev) {
        fillTip(tip, el.getAttribute("data-tip-value"), el.getAttribute("data-tip-label"), el.getAttribute("data-tip-note"));
        tip.classList.add("is-on");
        if (bar) bar.classList.add("sc-hot");
        var cx, cy;
        if (ev && ev.type !== "focus" && typeof ev.clientX === "number") {
          cx = ev.clientX;
          cy = ev.clientY;
        } else {
          var box = (bar || el).getBoundingClientRect();
          cx = box.left + box.width / 2;
          cy = box.top;
        }
        placeTip(tip, fig, cx, cy);
      }
      function hide() {
        tip.classList.remove("is-on");
        if (bar) bar.classList.remove("sc-hot");
      }
      el.addEventListener("pointerenter", show);
      el.addEventListener("pointermove", show);
      el.addEventListener("pointerleave", hide);
      el.addEventListener("focus", show);
      el.addEventListener("blur", hide);
    });
  }

  document.querySelectorAll(".studio-scorecard, .studio-april").forEach(bindMarks);

  var fig = document.querySelector(".studio-cumulative");
  var svg = fig && fig.querySelector("svg");
  var curve = svg && svg.querySelector('path[stroke="#66d9ef"][fill="none"]');
  if (curve) {
    var nums = (curve.getAttribute("d").match(/-?[\d.]+/g) || []).map(Number);
    var pts = [];
    for (var i = 0; i < nums.length; i += 2) pts.push([nums[i], nums[i + 1]]);
    var N = pts.length;
    var NS = "http://www.w3.org/2000/svg";
    var marker = document.createElementNS(NS, "g");
    marker.setAttribute("style", "display:none");
    var vline = document.createElementNS(NS, "line");
    vline.setAttribute("y1", "40");
    vline.setAttribute("y2", "300");
    vline.setAttribute("stroke", "rgba(102,217,239,0.45)");
    vline.setAttribute("stroke-dasharray", "3 4");
    var dot = document.createElementNS(NS, "circle");
    dot.setAttribute("r", "5");
    dot.setAttribute("fill", "#66d9ef");
    dot.setAttribute("stroke", "#0a1018");
    dot.setAttribute("stroke-width", "2");
    marker.appendChild(vline);
    marker.appendChild(dot);
    svg.appendChild(marker);
    var hit = document.createElementNS(NS, "rect");
    hit.setAttribute("x", "70");
    hit.setAttribute("y", "20");
    hit.setAttribute("width", "824");
    hit.setAttribute("height", "290");
    hit.setAttribute("fill", "rgba(0,0,0,0)");
    svg.appendChild(hit);
    var tip = makeTip(fig);
    var start = new Date(2025, 11, 2).getTime();
    var totalDays = 212;
    hit.addEventListener("pointermove", function (ev) {
      var r = svg.getBoundingClientRect();
      var sx = (ev.clientX - r.left) * (920 / r.width);
      var idx = Math.round((sx - 70) / (824 / (N - 1)));
      idx = Math.max(0, Math.min(N - 1, idx));
      var p = pts[idx];
      var commits = idx === N - 1 ? 5501 : Math.round((300 - p[1]) * 5000 / 236.3);
      var day = new Date(start + Math.round(idx * totalDays / (N - 1)) * 86400000);
      vline.setAttribute("x1", p[0]);
      vline.setAttribute("x2", p[0]);
      dot.setAttribute("cx", p[0]);
      dot.setAttribute("cy", p[1]);
      marker.setAttribute("style", "");
      fillTip(tip, commits.toLocaleString("en-US") + " commits", day.toLocaleDateString("en-US", { month: "short", day: "numeric" }));
      tip.classList.add("is-on");
      placeTip(tip, fig, r.left + p[0] * r.width / 920, r.top + p[1] * r.height / 344);
    });
    hit.addEventListener("pointerleave", function () {
      marker.setAttribute("style", "display:none");
      tip.classList.remove("is-on");
    });
  }
})();
</script>
