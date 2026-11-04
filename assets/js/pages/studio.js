(function () {
  function makeTip(fig) {
    var tip = document.createElement("div");
    tip.className = "studio-tip";
    tip.setAttribute("role", "tooltip");
    tip.addEventListener("pointerenter", function () { clearTimeout(tip.hideTimer); });
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
      el.setAttribute("role", "img");
      el.setAttribute("aria-label", [el.getAttribute("data-tip-value"), el.getAttribute("data-tip-label"), el.getAttribute("data-tip-note")].filter(Boolean).join(". "));
      function show(ev) {
        clearTimeout(tip.hideTimer);
        if (tip.dataset.dismissed && ev && ev.type === "pointermove") return;
        fillTip(tip, el.getAttribute("data-tip-value"), el.getAttribute("data-tip-label"), el.getAttribute("data-tip-note"));
        tip.classList.add("is-on");
        fig.querySelectorAll(".sc-hot").forEach(function (hot) { hot.classList.remove("sc-hot"); });
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
        fig.querySelectorAll(".sc-hot").forEach(function (hot) { hot.classList.remove("sc-hot"); });
      }
      // A short grace period lets the pointer travel onto the note without losing it.
      function leave(ev) {
        // A tap ends with pointerleave; keep the note until the next tap elsewhere.
        if (ev && ev.pointerType === "touch") return;
        delete tip.dataset.dismissed;
        tip.hideTimer = setTimeout(hide, 200);
        tip.onpointerleave = hide;
      }
      el.addEventListener("pointerenter", show);
      el.addEventListener("pointermove", show);
      el.addEventListener("pointerleave", leave);
      el.addEventListener("focus", show);
      el.addEventListener("blur", function () { delete tip.dataset.dismissed; hide(); });
    });
    // One tab stop per chart: arrow keys, Home and End move between marks.
    var marks = Array.prototype.slice.call(fig.querySelectorAll("[data-tip-label]"));
    marks.forEach(function (mark, index) {
      mark.setAttribute("tabindex", index === 0 ? "0" : "-1");
      mark.addEventListener("keydown", function (ev) {
        var next = { ArrowDown: index + 1, ArrowRight: index + 1, ArrowUp: index - 1, ArrowLeft: index - 1, Home: 0, End: marks.length - 1 }[ev.key];
        if (next === undefined || !marks[next]) return;
        ev.preventDefault();
        mark.setAttribute("tabindex", "-1");
        marks[next].setAttribute("tabindex", "0");
        marks[next].focus();
      });
    });
    var svgEl = fig.querySelector("svg");
    if (svgEl) svgEl.setAttribute("aria-description", "Use the arrow keys to move between bars.");
  }

  // Phones get the scorecard as a stacked list built from the chart's own marks, so every score is visible without scrolling.
  document.querySelectorAll(".studio-scorecard").forEach(function (fig) {
    var list = document.createElement("ol");
    list.className = "studio-scorecard-list";
    list.setAttribute("aria-label", "Scores out of 10");
    fig.querySelectorAll("[data-tip-label]").forEach(function (mark) {
      var value = parseFloat(mark.getAttribute("data-tip-value"));
      var item = document.createElement("li");
      var label = document.createElement("span");
      label.textContent = mark.getAttribute("data-tip-label");
      var score = document.createElement("b");
      score.textContent = mark.getAttribute("data-tip-value").replace(" / 10", "");
      var bar = document.createElement("i");
      bar.style.width = (value * 10) + "%";
      var details = document.createElement("details");
      var summary = document.createElement("summary");
      summary.append(label, score, bar);
      var note = document.createElement("p");
      note.textContent = mark.getAttribute("data-tip-note") || "";
      details.append(summary, note);
      item.appendChild(details);
      list.appendChild(item);
    });
    fig.insertBefore(list, fig.querySelector("figcaption"));
  });
  document.querySelectorAll(".studio-scorecard, .studio-april").forEach(bindMarks);
  document.addEventListener("pointerdown", function (ev) {
    if (ev.pointerType !== "touch" || ev.target.closest("[data-tip-label], .studio-tip")) return;
    document.querySelectorAll(".studio-scorecard .studio-tip.is-on, .studio-april .studio-tip.is-on").forEach(function (tip) { tip.classList.remove("is-on"); });
    document.querySelectorAll(".sc-hot").forEach(function (hot) { hot.classList.remove("sc-hot"); });
  });

  var fig = document.querySelector(".studio-cumulative");
  var svg = fig && fig.querySelector("svg");
  var curve = svg && svg.querySelector('path[stroke="#66d9ef"][fill="none"]');
  if (curve) {
    // The production minifier rewrites the polyline with relative and axis commands, so resolve them to absolute points.
    var pts = [];
    var x = 0, y = 0, cmd = "M";
    var tokens = curve.getAttribute("d").match(/[MLHVmlhv]|-?(?:\d+\.?\d*|\.\d+)(?:e-?\d+)?/g) || [];
    for (var i = 0; i < tokens.length;) {
      if (/[A-Za-z]/.test(tokens[i])) { cmd = tokens[i++]; continue; }
      var a = Number(tokens[i++]);
      if (cmd === "H") x = a;
      else if (cmd === "h") x += a;
      else if (cmd === "V") y = a;
      else if (cmd === "v") y += a;
      else {
        var b = Number(tokens[i++]);
        if (cmd === "M" || cmd === "L") { x = a; y = b; } else { x += a; y += b; }
        if (cmd === "M") cmd = "L"; else if (cmd === "m") cmd = "l";
      }
      pts.push([x, y]);
    }
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
    var start = Date.UTC(2025, 11, 2);
    var totalDays = 234;
    var current = N - 1;
    function select(idx) {
      idx = Math.max(0, Math.min(N - 1, idx));
      current = idx;
      var r = svg.getBoundingClientRect();
      var p = pts[idx];
      var commits = idx === N - 1 ? 8317 : Math.round((300 - p[1]) * 8317 / 256);
      var day = new Date(start + Math.round(idx * totalDays / (N - 1)) * 86400000);
      vline.setAttribute("x1", p[0]);
      vline.setAttribute("x2", p[0]);
      dot.setAttribute("cx", p[0]);
      dot.setAttribute("cy", p[1]);
      marker.setAttribute("style", "");
      var dayLabel = day.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
      fillTip(tip, commits.toLocaleString("en-US") + " commits", dayLabel);
      tip.classList.add("is-on");
      placeTip(tip, fig, r.left + p[0] * r.width / 920, r.top + p[1] * r.height / 344);
      hit.setAttribute("aria-valuenow", String(idx));
      hit.setAttribute("aria-valuetext", commits.toLocaleString("en-US") + " commits by " + day.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }));
    }
    function clear() {
      marker.setAttribute("style", "display:none");
      tip.classList.remove("is-on");
    }
    hit.addEventListener("pointermove", function (ev) {
      if (tip.dataset.dismissed) return;
      var r = svg.getBoundingClientRect();
      var sx = (ev.clientX - r.left) * (920 / r.width);
      select(Math.round((sx - 70) / (824 / (N - 1))));
    });
    hit.addEventListener("pointerleave", function () { delete tip.dataset.dismissed; clear(); });
    // Keyboard users move the same cursor with the arrow keys.
    hit.setAttribute("tabindex", "0");
    hit.setAttribute("role", "slider");
    hit.setAttribute("aria-label", "Cumulative commits by date");
    hit.setAttribute("aria-valuemin", "0");
    hit.setAttribute("aria-valuemax", String(N - 1));
    hit.setAttribute("aria-valuenow", String(N - 1));
    hit.setAttribute("aria-valuetext", "8,317 commits by 24 Jul 2026");
    hit.addEventListener("focus", function () { select(current); });
    hit.addEventListener("blur", clear);
    hit.addEventListener("keydown", function (ev) {
      var step = { ArrowRight: 1, ArrowUp: 1, ArrowLeft: -1, ArrowDown: -1, PageUp: 10, PageDown: -10 }[ev.key];
      if (ev.key === "Home") select(0);
      else if (ev.key === "End") select(N - 1);
      else if (step) select(current + step);
      else return;
      ev.preventDefault();
      // On phones the chart scrolls sideways: keep the keyboard cursor in view.
      var region = svg.closest(".studio-scroll");
      if (region && region.scrollWidth > region.clientWidth) {
        var cursorX = pts[current][0] * region.scrollWidth / 920;
        region.addEventListener("scrollend", function () { if (document.activeElement === hit) select(current); }, { once: true });
        region.scrollTo({ left: cursorX - region.clientWidth / 2, behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      }
    });
  }

  // Wide charts scroll on small screens. Only the chart scrolls, so the figure title and caption stay put.
  function markScrollers() {
    document.querySelectorAll(".studio-visual").forEach(function (fig) {
      var svg = fig.querySelector(":scope > svg");
      var scroller = fig.querySelector(".studio-scroll");
      if (svg && !scroller) {
        scroller = document.createElement("div");
        scroller.className = "studio-scroll";
        svg.parentNode.insertBefore(scroller, svg);
        scroller.appendChild(svg);
        scroller.addEventListener("scroll", function () {
          var hint = fig.querySelector(".studio-scroll-hint");
          if (hint) hint.classList.toggle("is-done", scroller.scrollLeft + scroller.clientWidth >= scroller.scrollWidth - 4);
        }, { passive: true });
      }
      var box = scroller || fig;
      var scrolls = box.scrollWidth > box.clientWidth + 1;
      var hint = fig.querySelector(".studio-scroll-hint");
      if (scrolls && !hint) {
        var title = fig.querySelector("[id$='-title']");
        box.setAttribute("tabindex", "0");
        box.setAttribute("role", "region");
        box.setAttribute("aria-label", (title ? title.textContent.trim() + ". " : "") + "Scrolls sideways.");
        hint = document.createElement("p");
        hint.className = "studio-scroll-hint";
        hint.setAttribute("aria-hidden", "true");
        hint.textContent = "Scroll sideways →";
        var head = fig.querySelector(".studio-visual-head");
        fig.insertBefore(hint, head ? head.nextSibling : fig.firstChild);
      } else if (!scrolls && hint) {
        hint.remove();
        box.removeAttribute("tabindex");
        box.removeAttribute("role");
        box.removeAttribute("aria-label");
      }
    });
  }
  markScrollers();
  window.addEventListener("resize", markScrollers);

  // WCAG 1.4.13: a note shown on hover or focus can be dismissed without moving the pointer.
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    document.querySelectorAll(".studio-tip.is-on").forEach(function (tip) {
      tip.classList.remove("is-on");
      tip.dataset.dismissed = "1";
    });
    document.querySelectorAll(".sc-hot").forEach(function (hot) { hot.classList.remove("sc-hot"); });
  });
})();
