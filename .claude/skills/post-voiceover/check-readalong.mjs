// Read-along check: seek to 60 points per post and compare the highlighted word with the timing file.
// Run from a directory with playwright-core installed (npm i playwright-core), against a running hugo server:
//   node check-readalong.mjs <slug>[=<path>]...   e.g. expets-sirv-optimization=/experts-nuxt-Sirv/
// BASE overrides http://localhost:1313.
import { chromium } from "playwright-core";

const base = process.env.BASE || "http://localhost:1313";
const browser = await chromium.launch({ executablePath: "/usr/bin/chromium", args: ["--autoplay-policy=no-user-gesture-required"] });
let failed = false;
for (const arg of process.argv.slice(2)) {
  const [slug, path = `/posts/${slug}/`] = arg.split("=");
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + path, { waitUntil: "networkidle" });
  await page.click(".article-listen-toggle");
  await page.waitForTimeout(1200);
  const r = await page.evaluate(async (slug) => {
    const audio = document.querySelector("[data-listen] audio");
    audio.pause();
    const words = await (await fetch(`/audio/posts/${slug}.json`)).json();
    const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
    let ok = 0;
    const bad = [];
    for (let k = 0; k < 60; k++) {
      const [w, s, e] = words[Math.floor(((k + 0.5) * words.length) / 60)];
      audio.currentTime = (s + e) / 2;
      await new Promise((res) => audio.addEventListener("seeked", res, { once: true }));
      await new Promise((res) => setTimeout(res, 20));
      const h = [...CSS.highlights.get("listen-word")][0];
      if (h && norm(h.toString()) === norm(w)) ok++;
      else bad.push(`${w}→${h ? h.toString() : "∅"}`);
    }
    return { ok, bad: bad.slice(0, 6) };
  }, slug);
  if (r.ok < 58 || errors.length) failed = true;
  console.log(`${slug} ${r.ok}/60 ${r.bad.join(" | ")} ${errors.join("; ")}`);
  await page.close();
}
await browser.close();
process.exit(failed ? 1 : 0);
