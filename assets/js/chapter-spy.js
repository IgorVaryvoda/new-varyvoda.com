(function () {
  // Phones: once the chapter list scrolls away, a small fixed link leads back to it.
  var jump = document.querySelector(".chapter-jump");
  var jumpTarget = jump && document.querySelector(jump.getAttribute("href"));
  if (jump && jumpTarget) {
    var syncJump = function () { jump.hidden = jumpTarget.getBoundingClientRect().bottom > 0; };
    window.addEventListener("scroll", syncJump, { passive: true });
    syncJump();
  }

  var links = Array.prototype.slice.call(document.querySelectorAll('nav[aria-label="Project chapters"] a[href^="#"]'));
  var targets = links.map(function (link) { return document.getElementById(decodeURIComponent(link.hash.slice(1))); });
  if (!links.length) return;

  var current = null;
  function mark(index) {
    if (index === current) return;
    current = index;
    links.forEach(function (link, i) {
      if (i === index) link.setAttribute("aria-current", "location");
      else link.removeAttribute("aria-current");
    });
  }

  // The active chapter is the last one whose heading has passed the upper third of the viewport.
  function update() {
    var line = window.innerHeight * 0.33;
    var active = -1;
    targets.forEach(function (target, i) {
      if (target && target.getBoundingClientRect().top <= line) active = i;
    });
    mark(active < 0 ? null : active);
  }

  window.addEventListener("scroll", update, { passive: true });
  update();
})();
