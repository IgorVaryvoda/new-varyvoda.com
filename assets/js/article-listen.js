(() => {
  const player = document.querySelector("[data-listen]");
  if (!player) return;
  const audio = player.querySelector("audio");
  const toggle = player.querySelector(".article-listen-toggle");
  const speed = player.querySelector("[data-listen-speed]");
  const seek = player.querySelector("input");
  const time = player.querySelector("[data-listen-time]");
  const hero = player.closest(".article-hero");
  const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  const spoken = (s) => {
    const m = Math.floor(s / 60);
    const r = Math.floor(s % 60);
    return `${m} minute${m === 1 ? "" : "s"} ${r} second${r === 1 ? "" : "s"}`;
  };
  let heroVisible = true;

  const render = () => {
    if (toggle.disabled) return;
    const playing = !audio.paused;
    player.classList.toggle("is-playing", playing);
    player.classList.toggle("is-docked", !heroVisible && (playing || (audio.currentTime > 0 && !audio.ended)));
    toggle.setAttribute("aria-label", playing ? "Pause narration" : "Listen to narration");
    if (audio.duration) {
      seek.max = Math.floor(audio.duration);
      seek.value = Math.floor(audio.currentTime);
      seek.setAttribute("aria-valuetext", `${spoken(audio.currentTime)} of ${spoken(audio.duration)}`);
      time.textContent = audio.currentTime || playing ? `${clock(audio.currentTime)} / ${clock(audio.duration)}` : `Listen · ${clock(audio.duration)}`;
    }
  };

  // A failed play or a missing file must say so instead of leaving a control that silently does nothing.
  const fail = () => {
    player.classList.remove("is-playing");
    time.textContent = "Audio unavailable";
    toggle.setAttribute("aria-label", "Narration audio unavailable");
    toggle.disabled = true;
  };
  audio.addEventListener("error", fail);
  toggle.addEventListener("click", () => {
    if (audio.paused) audio.play().catch((error) => { if (error.name !== "AbortError") fail(); });
    else audio.pause();
  });
  seek.addEventListener("input", () => { audio.currentTime = seek.value; });

  const RATES = [1, 1.25, 1.5, 1.75, 2];
  const setRate = (rate) => {
    audio.playbackRate = audio.defaultPlaybackRate = rate;
    speed.textContent = `${rate}×`;
    speed.setAttribute("aria-label", `Playback speed ${rate}×`);
    try { localStorage.setItem("listen-rate", rate); } catch {}
  };
  speed.addEventListener("click", () => setRate(RATES[(RATES.indexOf(audio.playbackRate) + 1) % RATES.length]));
  let savedRate = 1;
  try { savedRate = Number(localStorage.getItem("listen-rate")); } catch {}
  setRate(RATES.includes(savedRate) ? savedRate : 1);
  ["play", "pause", "timeupdate", "loadedmetadata", "ended"].forEach((e) => audio.addEventListener(e, render));
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; render(); }).observe(hero);
  render();

  // Read-along: match timed narration words to the article text, highlight the spoken word and follow it.
  const wordsUrl = player.dataset.listenWords;
  if (!wordsUrl) return;
  const SKIP = "pre,figure,script,style,.article-end,.see-also";
  const BLOCKS = "p,li,h1,h2,h3,h4,h5,h6,td,th,blockquote,dd,dt";
  const norm = (w) => w.toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
  const highlight = "highlights" in CSS ? new Highlight() : null;
  if (highlight) CSS.highlights.set("listen-word", highlight);
  const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)");
  let timed = null;
  let loading = null;
  let current = -1;
  // A reader who scrolls away keeps their place; following resumes when the spoken word is back on screen or on the next play.
  let following = true;

  // Whitespace-separated words as Ranges; "Zed's" split across a link and a text node stays one word.
  const tokens = () => {
    const out = [];
    for (const root of [hero.querySelector("h1"), document.querySelector(".article-prose")]) {
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
        acceptNode: (n) => (n.parentElement.closest(SKIP) ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT),
      });
      let prev = null;
      let open = false;
      for (let node; (node = walker.nextNode()); ) {
        const block = node.parentElement.closest(BLOCKS);
        for (const m of node.data.matchAll(/\S+/g)) {
          const end = m.index + m[0].length;
          if (m.index === 0 && open && prev.block === block) {
            prev.range.setEnd(node, end);
            prev.word += m[0];
          } else {
            const range = new Range();
            range.setStart(node, m.index);
            range.setEnd(node, end);
            prev = { word: m[0], range, block };
            out.push(prev);
          }
        }
        open = /\S$/.test(node.data);
      }
    }
    return out;
  };

  // ponytail: greedy match with a 40-word lookahead; skipped captions and code just go unhighlighted
  const match = (words, toks) => {
    const keys = toks.map((t) => norm(t.word));
    const out = [];
    let cursor = 0;
    for (const [w, s] of words) {
      const key = norm(w);
      if (!key) continue;
      const j = keys.indexOf(key, cursor);
      if (j !== -1 && j < cursor + 40) {
        out.push({ s, range: toks[j].range });
        cursor = j + 1;
      }
    }
    return out;
  };

  const follow = (range) => {
    if (audio.paused) return;
    const r = range.getBoundingClientRect();
    if (!following) {
      if (r.top >= 0 && r.bottom <= innerHeight) following = true;
      return;
    }
    if (r.top < innerHeight * 0.15 || r.bottom > innerHeight * 0.75) {
      scrollTo({ top: scrollY + r.top - innerHeight * 0.35, behavior: reduceMotion.matches ? "instant" : "smooth" });
    }
  };

  // One pending frame at most: play and seeked both call tick, and two chained loops would double the work.
  let frame = 0;
  const tick = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    if (!timed) return;
    const t = audio.currentTime;
    let lo = 0;
    let hi = timed.length - 1;
    let i = -1;
    while (lo <= hi) {
      const mid = (lo + hi) >> 1;
      if (timed[mid].s <= t) { i = mid; lo = mid + 1; } else hi = mid - 1;
    }
    if (i !== current) {
      current = i;
      highlight?.clear();
      if (i >= 0) { highlight?.add(timed[i].range); follow(timed[i].range); }
    }
    if (!audio.paused) frame = requestAnimationFrame(tick);
  };

  // Timing data is optional: narration plays without read-along if it fails, and the next play retries it.
  const load = () => (loading ??= fetch(wordsUrl)
    .then((r) => { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then((words) => { timed = match(words, tokens()); })
    .catch(() => { loading = null; }));
  audio.addEventListener("play", () => { following = true; load().then(tick); });
  audio.addEventListener("seeked", tick);
  audio.addEventListener("pause", () => { cancelAnimationFrame(frame); frame = 0; });
  audio.addEventListener("ended", () => { cancelAnimationFrame(frame); frame = 0; highlight?.clear(); current = -1; });
  ["wheel", "touchmove", "keydown"].forEach((e) => addEventListener(e, (event) => {
    if (!audio.paused && !player.contains(event.target)) following = false;
  }, { passive: true }));
})();
