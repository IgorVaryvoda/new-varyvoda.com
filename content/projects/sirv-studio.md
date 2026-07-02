---
title: "Sirv AI Studio"
date: 2026-07-02
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
  - "45-tool MCP server + API platform for AI agents"
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

.project-description .studio-architecture svg,
.project-description .studio-cumulative svg {
  display: block;
  width: 100%;
  height: auto;
}

.project-description .studio-architecture text,
.project-description .studio-cumulative text {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
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

.project-description .studio-april-grid {
  display: grid;
  grid-template-columns: repeat(8, minmax(54px, 1fr));
  gap: 0.75rem;
  align-items: end;
  min-height: 230px;
}

.project-description .studio-april-day {
  display: grid;
  grid-template-rows: 1fr auto auto;
  gap: 0.45rem;
  align-items: end;
  min-width: 0;
  padding: 0.65rem 0.45rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.035);
  text-align: center;
}

.project-description .studio-april-day.is-window {
  border-color: rgba(102, 217, 239, 0.32);
  background: rgba(102, 217, 239, 0.07);
}

.project-description .studio-april-day.is-peak {
  border-color: rgba(249, 201, 122, 0.72);
  background: rgba(249, 201, 122, 0.1);
}

.project-description .studio-april-bar {
  display: block;
  width: min(100%, 2.4rem);
  margin: 0 auto;
  border-radius: 5px 5px 2px 2px;
  background: linear-gradient(180deg, var(--sv-amber), var(--sv-cyan));
  box-shadow: 0 0 24px rgba(102, 217, 239, 0.14);
}

.project-description .studio-april-day strong {
  color: var(--sv-text);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1.25rem;
}

.project-description .studio-april-day em {
  color: var(--sv-muted);
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: 1rem;
  font-style: normal;
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

  .project-description .studio-april-grid {
    grid-template-columns: repeat(4, minmax(58px, 1fr));
  }

  .project-description .studio-toolwall-grid {
    grid-template-columns: 1fr;
  }
}
</style>

Sirv AI Studio is an AI product-content platform for e-commerce teams. Merchants connect their Shopify store, scan the catalog for weak product content — missing alt text, poor images, thin descriptions — fix it in AI-powered batches, route supplier uploads through review, and publish back safely with versioning and rollback.

I built Studio — from `create-next-app` on a December morning to the production platform it is today: the AI tool layer, the workflow orchestrator, the supplier portal, the Shopify publishing pipeline, the MCP/agent platform, and the infrastructure underneath. Along the way Max Wish and Veniamin Krachun joined and took on some critical parts — the design system and data grid, and the QA harness. This page is the build story. For the raw numbers — seven months of daily commits rendered straight from the git log — see the [build record](/projects/sirv-studio/build-record/).

## It started over a beer

Some coworkers were visiting me in Herceg Novi, Montenegro. Over a beer the conversation drifted to AI — what it could actually build now, not what the keynotes promised — and at some point I told the table: I'm going to build this in a day.

The next morning I was up at six. `Initial commit from Create Next App` landed at 6:35 on December 2, 2025. The first AI tool — background replacement, with model selection — was working by 8:00. Virtual try-on by 8:23. Multi-angle product shots and lighting removal by 8:45. Auth, billing, rate limiting, and Sirv storage went in before noon, and the MVP merge is timestamped 12:05. The afternoon added batch processing with multi-select and a side-by-side compare mode. Thirty commits, day one — every timestamp in the log. The bet stood by lunch; the rest of this page is what happened when I kept going.

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
  <figcaption>Six of the thirty day-one commits, timestamps straight from the repo history. The story sounds like a dare because it was one.</figcaption>
</figure>

That pace turned out to be the project's resting heart rate, not a launch spike. Six days in: the workflow orchestrator canvas — the drag-and-drop pipeline builder that's still the center of the product. Twelve days in: durable background jobs on Inngest. Eighteen days: an MCP server, before most people knew what MCP was. Twenty-five days: the embedded Shopify app. December closed at 602 commits, and the repo already had the skeleton of everything Studio is today.

The quietest month of the whole run — February, spent wiring Stripe billing, entitlements, and the unglamorous plumbing that turns a demo into a business — still averaged eleven commits a day. Seven months in, there have been exactly five days without a commit. Month seven ran at 39 a day, faster than month one.

<figure class="studio-visual studio-cumulative" aria-labelledby="studio-cumulative-title">
  <div class="studio-visual-head">
    <span id="studio-cumulative-title">cumulative commits</span>
    <strong>Dec 2, 2025 → Jul 2, 2026 · per-day data</strong>
  </div>
  <svg viewBox="0 0 920 340" role="img" aria-label="Cumulative commit curve from zero to 5,500 commits with milestones for MVP day, MCP server, Stripe, team joins, supplier portal, and the April migration spike.">
    <defs>
      <linearGradient id="studio-curve" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stop-color="#66d9ef"/>
        <stop offset="55%" stop-color="#a6e3a1"/>
        <stop offset="100%" stop-color="#f9c97a"/>
      </linearGradient>
      <filter id="studio-glow" x="-10%" y="-50%" width="120%" height="200%">
        <feGaussianBlur stdDeviation="3" result="blur"/>
        <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
      </filter>
    </defs>
    <g stroke="rgba(255,255,255,0.12)" stroke-width="1">
      <line x1="58" y1="292" x2="894" y2="292"/>
      <line x1="58" y1="238" x2="894" y2="238"/>
      <line x1="58" y1="184" x2="894" y2="184"/>
      <line x1="58" y1="130" x2="894" y2="130"/>
      <line x1="58" y1="76" x2="894" y2="76"/>
      <line x1="58" y1="24" x2="894" y2="24"/>
    </g>
    <g fill="#94a6b4" font-size="12">
      <text x="14" y="296">0</text>
      <text x="14" y="242">1.1k</text>
      <text x="14" y="188">2.2k</text>
      <text x="14" y="134">3.3k</text>
      <text x="14" y="80">4.4k</text>
      <text x="10" y="28">5.5k</text>
      <text x="58" y="326">Dec</text>
      <text x="176" y="326">Jan</text>
      <text x="298" y="326">Feb</text>
      <text x="416" y="326">Mar</text>
      <text x="535" y="326">Apr</text>
      <text x="653" y="326">May</text>
      <text x="775" y="326">Jun</text>
      <text x="890" y="326" text-anchor="end">Jul</text>
    </g>
    <path d="M 58.0 290.5 L 61.9 289.5 L 65.9 288.0 L 69.8 287.4 L 73.8 286.4 L 77.7 285.4 L 81.7 284.8 L 85.6 283.3 L 89.5 282.6 L 93.5 281.1 L 97.4 279.7 L 101.4 279.2 L 105.3 278.7 L 109.3 278.4 L 113.2 278.0 L 117.2 276.7 L 121.1 274.8 L 125.0 273.0 L 129.0 272.4 L 132.9 271.8 L 136.9 271.3 L 140.8 270.4 L 144.8 269.7 L 148.7 267.9 L 152.6 265.9 L 156.6 265.2 L 160.5 264.6 L 164.5 263.2 L 168.4 262.8 L 172.4 262.7 L 176.3 261.7 L 180.2 260.3 L 184.2 259.5 L 188.1 258.2 L 192.1 257.7 L 196.0 256.8 L 200.0 255.4 L 203.9 253.9 L 207.8 253.2 L 211.8 252.9 L 215.7 252.6 L 219.7 252.5 L 223.6 251.7 L 227.6 250.7 L 231.5 249.9 L 235.5 249.1 L 239.4 248.6 L 247.3 248.1 L 251.2 245.1 L 255.2 244.3 L 259.1 243.5 L 263.1 242.8 L 267.0 242.1 L 270.9 241.0 L 274.9 240.3 L 278.8 239.3 L 282.8 238.3 L 286.7 237.8 L 290.7 237.3 L 294.6 236.8 L 298.5 235.3 L 302.5 234.7 L 306.4 234.6 L 310.4 234.4 L 314.3 234.0 L 318.3 233.3 L 322.2 233.1 L 326.2 233.0 L 330.1 232.7 L 334.0 232.5 L 338.0 232.2 L 341.9 231.7 L 345.9 231.2 L 349.8 230.9 L 353.8 230.7 L 357.7 230.3 L 361.6 229.8 L 365.6 229.5 L 369.5 228.9 L 373.5 228.5 L 377.4 227.9 L 381.4 227.4 L 385.3 227.4 L 389.2 227.1 L 393.2 225.7 L 397.1 224.2 L 401.1 223.1 L 405.0 221.4 L 409.0 221.0 L 412.9 220.8 L 416.8 220.0 L 420.8 219.4 L 424.7 218.1 L 428.7 216.6 L 432.6 215.4 L 436.6 215.2 L 440.5 214.0 L 444.5 213.3 L 448.4 212.7 L 452.3 211.6 L 456.3 211.0 L 460.2 210.9 L 464.2 210.7 L 468.1 210.5 L 472.1 209.9 L 476.0 209.3 L 479.9 208.9 L 483.9 208.1 L 487.8 207.2 L 491.8 206.8 L 495.7 205.7 L 499.7 204.2 L 503.6 203.3 L 507.5 201.7 L 511.5 200.8 L 515.4 199.5 L 519.4 198.6 L 523.3 197.6 L 527.3 196.8 L 531.2 194.8 L 535.2 191.8 L 539.1 190.9 L 547.0 190.2 L 550.9 189.5 L 554.9 189.2 L 558.8 186.8 L 562.8 178.0 L 566.7 174.3 L 570.6 170.2 L 574.6 169.3 L 578.5 166.9 L 582.5 163.7 L 586.4 162.4 L 590.4 160.8 L 594.3 158.6 L 598.2 152.9 L 602.2 151.1 L 606.1 149.1 L 610.1 147.4 L 614.0 145.2 L 618.0 142.9 L 621.9 141.1 L 625.8 140.9 L 629.8 140.9 L 633.7 139.7 L 637.7 136.8 L 641.6 134.1 L 645.6 131.7 L 649.5 130.8 L 653.5 126.5 L 657.4 122.7 L 661.3 121.4 L 665.3 120.1 L 669.2 118.4 L 673.2 116.7 L 677.1 113.3 L 681.1 112.2 L 685.0 112.0 L 688.9 111.4 L 692.9 108.4 L 696.8 105.2 L 700.8 102.7 L 704.7 100.7 L 708.7 100.0 L 712.6 99.4 L 716.5 98.4 L 720.5 97.2 L 724.4 96.4 L 728.4 95.6 L 732.3 94.6 L 736.3 94.1 L 740.2 92.3 L 744.2 88.8 L 748.1 87.5 L 752.0 86.7 L 756.0 86.3 L 759.9 86.0 L 763.9 85.4 L 767.8 83.9 L 771.8 81.1 L 775.7 80.3 L 787.5 79.3 L 791.5 77.3 L 795.4 76.5 L 799.4 75.7 L 807.2 75.5 L 811.2 73.8 L 815.1 72.8 L 819.1 70.6 L 823.0 65.2 L 827.0 63.0 L 830.9 61.9 L 834.8 59.6 L 838.8 56.7 L 842.7 53.5 L 846.7 51.3 L 850.6 48.5 L 854.6 45.4 L 858.5 43.7 L 862.5 41.2 L 866.4 38.3 L 870.3 37.2 L 874.3 33.7 L 878.2 32.2 L 882.2 30.8 L 886.1 26.5 L 890.1 24.1 L 894.0 24.0" fill="none" stroke="url(#studio-curve)" stroke-width="4" stroke-linecap="round" stroke-linejoin="round" filter="url(#studio-glow)"/>
    <g fill="#0a1018" stroke="#66d9ef" stroke-width="2">
      <circle cx="58.0" cy="290.5" r="5"/><circle cx="129.0" cy="272.4" r="5"/><circle cx="330.1" cy="232.7" r="5"/><circle cx="397.1" cy="224.2" r="5"/><circle cx="535.2" cy="191.8" r="5"/><circle cx="562.8" cy="178.0" r="6" stroke="#f9c97a"/><circle cx="894.0" cy="24.0" r="5" stroke="#a6e3a1"/>
    </g>
    <g fill="#edf7fb" font-size="12" font-weight="700">
      <text x="64" y="282">MVP day</text>
      <text x="136" y="264">MCP server</text>
      <text x="336" y="225">Stripe</text>
      <text x="404" y="216">team joins</text>
      <text x="542" y="204">supplier portal</text>
      <text x="578" y="163">182-commit day</text>
      <text x="876" y="56" text-anchor="end">5,500</text>
    </g>
  </svg>
  <figcaption>Generated from the same per-day commit counts as the build-record heatmap. The public number is rounded to 5,500; the embedded dataset sums to 5,501.</figcaption>
</figure>

## What it does

The product is organized around one loop: **ingest → fix → validate → review → publish → track**.

- **30+ AI tools** for product content — background removal and replacement, upscaling, lifestyle-shot generation, ghost mannequin, virtual try-on (image and video), alt text, product descriptions, image translation, image-to-3D, video generation — backed by 57 registered models routed through fal.ai, OpenAI, and OpenRouter.
- **A visual workflow orchestrator**: a drag-and-drop DAG builder with 36 step types, so a merchant can chain "remove background → generate lifestyle shot → write alt text → human review → push to Shopify" and run it across an entire catalog. Workflows execute on durable background jobs with pause/resume, review gates, and live progress, and can be triggered from the UI, the API, webhooks, or an AI agent.
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
      <span>batch · every tool, catalog-scale</span><span>orchestrator · 36 step types</span><span>AI routing</span><span>review gates &amp; autofix loops</span><span>marketplace optimizer</span><span>image review · Amazon/eBay/Walmart</span><span>webhooks · API · Zapier · n8n · MCP</span>
    </div>
    <div class="studio-toolwall-cat studio-toolwall-wide">
      <b>asset intelligence</b>
      <span>search by image</span><span>semantic search</span><span>find similar</span><span>duplicate detection</span><span>auto-tagging</span><span>smart collections</span><span>saved views</span><span>license tracking · publish gates</span><span>license alerts</span><span>watermark templates</span><span>asset &amp; search analytics</span>
    </div>
  </div>
  <figcaption>The toolbox, by category. Every chip is a shipped tool route or orchestrator capability; the models behind them route through fal.ai, OpenAI, and OpenRouter. The interface all of this lives in runs on the internal design system and virtualized data grid built by Max Wish.</figcaption>
</figure>

![Sirv AI Studio products view with per-product readiness scores](/images/studio/studio-products.webp)
*The products view: every product scored for content readiness against its channel's requirements.*

## How it's built

The app is a TanStack Start + React 19 application (migrated off Next.js, running the React Compiler) built with Vite and deployed on Vercel. Data lives in PostgreSQL 17 behind Drizzle ORM — 254 migrations and counting. Background work runs on Inngest — 87 functions across sync, publishing, billing, imports, and workflow execution — self-hosted on Hetzner with a Patroni HA Postgres cluster behind it. Redis handles rate limiting, Sentry/PostHog/Grafana handle observability, and a 768-spec Playwright E2E suite runs against merchant, vendor, and mobile personas. Capacitor shells package it for iOS and Android.

<figure class="studio-visual studio-architecture" aria-labelledby="studio-architecture-title">
  <div class="studio-visual-head">
    <span id="studio-architecture-title">system map</span>
    <strong>product surfaces → governed execution → external systems</strong>
  </div>
  <svg viewBox="0 0 920 540" role="img" aria-label="Sirv AI Studio architecture map showing product surfaces entering a governed core, then flowing to data, jobs, providers, Shopify, storage, and observability.">
    <defs>
      <marker id="studio-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
        <path d="M 0 0 L 10 5 L 0 10 z" fill="#66d9ef"/>
      </marker>
      <linearGradient id="studio-node" x1="0" y1="0" x2="1" y2="1">
        <stop offset="0%" stop-color="#152231"/>
        <stop offset="100%" stop-color="#0d141e"/>
      </linearGradient>
    </defs>
    <rect x="34" y="28" width="852" height="486" rx="18" fill="rgba(0,0,0,0.16)" stroke="rgba(255,255,255,0.1)"/>
    <g fill="#94a6b4" font-size="11" letter-spacing="0.08em">
      <text x="88" y="66">SURFACES</text>
      <text x="406" y="66" text-anchor="middle">GOVERNED CORE</text>
      <text x="700" y="66">SYSTEMS</text>
    </g>
    <g stroke="#66d9ef" stroke-width="2.4" fill="none" marker-end="url(#studio-arrow)" opacity="0.9">
      <path d="M 246 146 C 294 150, 318 190, 346 226"/>
      <path d="M 246 252 C 288 252, 316 252, 344 252"/>
      <path d="M 246 358 C 294 354, 318 314, 346 278"/>
      <path d="M 462 219 C 502 184, 512 130, 548 118"/>
      <path d="M 468 252 C 502 252, 516 252, 548 252"/>
      <path d="M 462 285 C 502 320, 512 374, 548 386"/>
      <path d="M 406 212 C 406 174, 406 154, 406 126"/>
      <path d="M 406 292 C 406 330, 406 350, 406 378"/>
    </g>
    <g stroke="#a6e3a1" stroke-width="2" fill="none" marker-end="url(#studio-arrow)" opacity="0.72">
      <path d="M 662 118 C 700 120, 716 160, 744 218"/>
      <path d="M 662 252 C 702 252, 716 252, 744 252"/>
      <path d="M 662 386 C 700 384, 716 344, 744 286"/>
    </g>
    <g>
      <rect x="74" y="108" width="172" height="76" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.45)"/>
      <text x="98" y="140" fill="#edf7fb" font-size="17" font-weight="700">TanStack app</text>
      <text x="98" y="163" fill="#94a6b4" font-size="12">merchant UI</text>
      <rect x="74" y="214" width="172" height="76" rx="10" fill="url(#studio-node)" stroke="rgba(166,227,161,0.45)"/>
      <text x="98" y="246" fill="#edf7fb" font-size="17" font-weight="700">Supplier portal</text>
      <text x="98" y="269" fill="#94a6b4" font-size="12">intake + review</text>
      <rect x="74" y="320" width="172" height="76" rx="10" fill="url(#studio-node)" stroke="rgba(203,166,247,0.45)"/>
      <text x="98" y="352" fill="#edf7fb" font-size="17" font-weight="700">MCP + API</text>
      <text x="98" y="375" fill="#94a6b4" font-size="12">agent operations</text>
      <rect x="344" y="210" width="124" height="84" rx="12" fill="#07131c" stroke="rgba(249,201,122,0.72)" stroke-width="2"/>
      <text x="406" y="244" fill="#f9c97a" font-size="18" font-weight="800" text-anchor="middle">Studio core</text>
      <text x="406" y="270" fill="#edf7fb" font-size="12" text-anchor="middle">auth · credits</text>
      <text x="406" y="288" fill="#edf7fb" font-size="12" text-anchor="middle">review gates</text>
      <rect x="310" y="56" width="192" height="70" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.38)"/>
      <text x="406" y="87" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Postgres</text>
      <text x="406" y="110" fill="#94a6b4" font-size="12" text-anchor="middle">products · assets · jobs</text>
      <rect x="310" y="378" width="192" height="70" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.38)"/>
      <text x="406" y="409" fill="#edf7fb" font-size="17" font-weight="700" text-anchor="middle">Inngest</text>
      <text x="406" y="432" fill="#94a6b4" font-size="12" text-anchor="middle">durable workflows</text>
      <rect x="548" y="80" width="172" height="76" rx="10" fill="url(#studio-node)" stroke="rgba(166,227,161,0.44)"/>
      <text x="572" y="112" fill="#edf7fb" font-size="17" font-weight="700">AI providers</text>
      <text x="572" y="135" fill="#94a6b4" font-size="12">image + text models</text>
      <rect x="548" y="214" width="172" height="76" rx="10" fill="url(#studio-node)" stroke="rgba(102,217,239,0.44)"/>
      <text x="572" y="246" fill="#edf7fb" font-size="17" font-weight="700">Shopify</text>
      <text x="572" y="269" fill="#94a6b4" font-size="12">drift-safe publishing</text>
      <rect x="548" y="348" width="172" height="76" rx="10" fill="url(#studio-node)" stroke="rgba(249,201,122,0.44)"/>
      <text x="572" y="380" fill="#edf7fb" font-size="17" font-weight="700">Sirv storage</text>
      <text x="572" y="403" fill="#94a6b4" font-size="12">assets + rollback</text>
      <rect x="744" y="222" width="102" height="60" rx="30" fill="rgba(102,217,239,0.08)" stroke="rgba(102,217,239,0.24)"/>
      <text x="795" y="246" fill="#edf7fb" font-size="12" font-weight="700" text-anchor="middle">observe</text>
      <text x="795" y="266" fill="#94a6b4" font-size="10" text-anchor="middle">Sentry · Grafana</text>
    </g>
  </svg>
  <figcaption>The important boundary is in the middle: UI, supplier uploads, API calls, and AI agents all enter the same governed core before jobs, providers, storage, or Shopify writes happen.</figcaption>
</figure>

Two teammates own critical pieces of this: Max Wish built the internal design system and the custom virtualized data grid that powers the asset and product tables, and [Veniamin Krachun](https://www.linkedin.com/in/veniamin-krachun/) built out the E2E/QA harness that keeps the velocity you'll read about below honest.

![Sirv AI Studio asset grid rendering hundreds of assets in a virtualized table](/images/studio/studio-assets-grid.webp)
*The assets table, running on the in-house virtualized data grid (built by Max Wish) — hundreds of rows of live thumbnails, statuses, and tags.*

Three problems were harder than the rest.

## Publishing to someone else's store, safely

The scariest thing Studio does is write to a merchant's live Shopify catalog. The naive version of this feature silently overwrites a product edit the merchant made an hour ago — once, and they never trust the product again.

So publishing is built around **drift detection**: before writing, Studio compares when a product was last synced, when it changed in Shopify, and when it changed in Studio, and classifies every product as `in_sync`, `shopify_newer`, or `studio_newer`. If Shopify is newer — the merchant edited since the last sync — Studio won't blindly overwrite; the conflict is surfaced instead. A second reconciliation layer catches identity drift, like a source image that was deleted or replaced out from under a sync.

Writes themselves are versioned and idempotent: publishes go through explicit strategies (add alongside the original, replace, set featured, alt-text-only), every published asset keeps its version history with rollback, and an event outbox guarantees that a retried job can't double-publish. "Publish safely, roll back instantly" is the promise the whole layer is built to keep.

## Supplier uploads without the chaos

Every merchant with suppliers has the same intake problem: product content arrives by email and shared drives — named wrong, sized wrong, missing SKUs — and someone has to chase it into shape before it can go anywhere near the store.

Studio turns intake into a pipeline. Each supplier gets a scoped upload portal — a link, chunked batch upload, or an SFTP drop. Submissions are validated on arrival against filename patterns, SKU matching, gallery-slot requirements, and image specs. AI autofix repairs what can be repaired automatically. Everything then lands in an approval queue where the reviewer sees the product context, the shot list, and exactly which checks failed before accepting anything; rejected work goes back to the supplier with reasons. The approval boundary is enforced at the database layer — hardened guards make it structurally impossible for supplier content to skip review on its way to a live store.

![Sirv AI Studio review queue with automated checks and AI autofix](/images/studio/studio-review-queue.webp)
*The review queue — the human gate between supplier intake and a live store. Automated checks flag problems, AI autofix repairs them, a reviewer approves.*

## Making it operable by AI agents

Studio ships a production MCP server (published on npm, stdio and hosted HTTP transports) exposing **45 tools** — AI processing, asset search and management, product CRUD, Shopify sync, supplier-portal review — plus an OpenAPI surface for ChatGPT-style integrations.

The design position: agents don't need raw endpoints, they need *operations inside a governed system*. So the agent surface gets the same context, permissions, approvals, budgets, and rollback as the UI. Auth is OAuth 2.0 with PKCE or API keys; every credit-spending or mutating tool re-authorizes server-side and fails closed if the workspace lacks entitlement; org scoping is validated against membership on every call; tools carry MCP safety annotations (read-only, destructive, idempotent) so agent runtimes can reason about blast radius. An agent can run a batch fix or execute a workflow — but it can't skip the review gate a human would hit.

## April, or: changing the wings mid-flight

By spring, Studio had outgrown its framework. The answer wasn't a rewrite branch that ships "next quarter" — it was a live migration of a production app, with users on it.

The log tells it plainly. April 2: the supplier portal ships. April 8: `Add TanStack Start bootstrap slice` — the Next.js → TanStack Start migration begins. April 9: 182 commits in one day, the single biggest day of the project, mid-migration, with a compatibility shim keeping the old framework's imports alive while routes moved over one by one. April 10: `build: remove final next runtime dependencies`. The runtime swap of a billing, multi-tenant, background-job-running platform took about seventy-two hours, and nothing froze — the same month also shipped 1,337 commits from me alone, my heaviest stretch of the whole project (429 in the week of April 6).

<figure class="studio-visual studio-april" aria-labelledby="studio-april-title">
  <div class="studio-visual-head">
    <span id="studio-april-title">April migration close-up</span>
    <strong>Apr 6–13 · commits per day</strong>
  </div>
  <div class="studio-april-grid" role="img" aria-label="Bar chart of commits per day from April 6 through April 13, highlighting April 8 through April 10 as the 72-hour migration window and April 9 as the 182-commit peak.">
    <div class="studio-april-day"><span class="studio-april-bar" style="height:39px"></span><strong>15</strong><em>Apr 06</em></div>
    <div class="studio-april-day"><span class="studio-april-bar" style="height:30px"></span><strong>5</strong><em>Apr 07</em></div>
    <div class="studio-april-day is-window"><span class="studio-april-bar" style="height:67px"></span><strong>49</strong><em>Apr 08</em></div>
    <div class="studio-april-day is-window is-peak"><span class="studio-april-bar" style="height:180px"></span><strong>182</strong><em>Apr 09</em></div>
    <div class="studio-april-day is-window"><span class="studio-april-bar" style="height:90px"></span><strong>76</strong><em>Apr 10</em></div>
    <div class="studio-april-day"><span class="studio-april-bar" style="height:96px"></span><strong>83</strong><em>Apr 11</em></div>
    <div class="studio-april-day"><span class="studio-april-bar" style="height:42px"></span><strong>19</strong><em>Apr 12</em></div>
    <div class="studio-april-day"><span class="studio-april-bar" style="height:68px"></span><strong>50</strong><em>Apr 13</em></div>
  </div>
  <figcaption>The highlighted window is the live Next.js → TanStack Start migration: bootstrap on Apr 8, the 182-commit spike on Apr 9, final Next runtime dependencies removed on Apr 10.</figcaption>
</figure>

A two-day framework migration isn't a typing achievement. It's what happens when the test suite is dense enough to catch every regression an automated refactor introduces, and the review gates are strict enough to trust the throughput. Which brings up the part of this story that's actually about method.

## How three people ship this fast

Last quarter — March 23 to July 2 — the Studio team was three people, and we landed **5,425 distinct commits**: non-merge, rebase and cherry-pick duplicates deduped, bot-authored commits excluded. My own count was 3,529 — thirty-nine a day, every day, in month seven of the project.

Commit volume is not value. But output with that shape needs explaining, and the explanation is the method: **I run a fleet of AI coding agents the way a lead runs a team.** Specs before code, tests before behavior changes, a blocking quality gate on every stop, and adversarial review agents that try to break each change before it lands. My job in that loop is editorial: architecture, judgment, taste, and standing behind every line that ships.

I wrote the broader argument behind that operating model in [Two theories of a programmer](/posts/two-theories-of-a-programmer/). This page keeps the claim grounded in the Studio evidence.

The evidence it's a system and not a slogan is in other people's curves. When Veniamin joined on QA, his weekly output ran near twenty commits while he built the harness — coverage matrix, anti-forgery checks, agent workflows. Two months later his weeks read 277, 309, 188. A fifteen-fold personal ramp inside one quarter isn't a person learning to type faster; it's infrastructure coming online and paying compound interest. Manual coding scales with hours. Fleet coding scales with the infrastructure you've built for the agents — and infrastructure compounds.

My favorite detail in the whole dataset: a repo run by an agent fleet had just 32 bot-authored commits all quarter. The agents' work ships under the name of the human who directed it — reviewed, gated, and signed for. The machines don't stand behind anything here; people do.

---

Studio also carries the less glamorous machinery a production platform needs: exponential-backoff retries with jitter, per-operation circuit breakers on AI providers, content-based idempotency keys, Redis-backed rate limits, and restore-drilled database backups. That layer has no screenshots, but it's why the rest works.

<a href="https://www.sirv.studio" target="_blank">Try Sirv AI Studio →</a> · [Check the build record →](/projects/sirv-studio/build-record/)

<script src="https://scripts.sirv.com/sirvjs/v3/sirv.js?modules=lazyimage"></script>
