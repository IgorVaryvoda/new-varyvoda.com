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
    var totalDays = 234;
    hit.addEventListener("pointermove", function (ev) {
      var r = svg.getBoundingClientRect();
      var sx = (ev.clientX - r.left) * (920 / r.width);
      var idx = Math.round((sx - 70) / (824 / (N - 1)));
      idx = Math.max(0, Math.min(N - 1, idx));
      var p = pts[idx];
      var commits = idx === N - 1 ? 8317 : Math.round((300 - p[1]) * 8317 / 256);
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
