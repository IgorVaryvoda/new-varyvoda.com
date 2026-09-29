(() => {
  const player = document.querySelector("[data-listen]");
  if (!player) return;
  const audio = player.querySelector("audio");
  const toggle = player.querySelector("button");
  const seek = player.querySelector("input");
  const time = player.querySelector("[data-listen-time]");
  const hero = player.closest(".article-hero");
  const clock = (s) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  let heroVisible = true;

  const render = () => {
    const playing = !audio.paused;
    player.classList.toggle("is-playing", playing);
    player.classList.toggle("is-docked", !heroVisible && (playing || audio.currentTime > 0));
    toggle.setAttribute("aria-label", playing ? "Pause narration" : "Play narration");
    if (audio.duration) {
      seek.max = Math.floor(audio.duration);
      seek.value = Math.floor(audio.currentTime);
      time.textContent = audio.currentTime || playing ? `${clock(audio.currentTime)} / ${clock(audio.duration)}` : `Listen · ${clock(audio.duration)}`;
    }
  };

  toggle.addEventListener("click", () => (audio.paused ? audio.play() : audio.pause()));
  seek.addEventListener("input", () => { audio.currentTime = seek.value; });
  ["play", "pause", "timeupdate", "loadedmetadata", "ended"].forEach((e) => audio.addEventListener(e, render));
  new IntersectionObserver(([entry]) => { heroVisible = entry.isIntersecting; render(); }).observe(hero);
  render();
})();
