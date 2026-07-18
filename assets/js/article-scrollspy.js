(function () {
  var page = document.querySelector(".article-page--editorial");
  var prose = document.querySelector(".article-prose");
  var railShell = document.querySelector(".article-rail");
  if (!page || !prose || !railShell) return;

  var rail = railShell.querySelector("#TableOfContents");
  if (!rail) {
    rail = document.createElement("nav");
    rail.id = "TableOfContents";
    var railLabel = railShell.querySelector(".article-rail-label");
    railShell.insertBefore(rail, railLabel ? railLabel.nextSibling : railShell.firstChild);
  }

  var allHeadings = Array.prototype.slice.call(prose.querySelectorAll("h2, h3"));
  var preferredTag = allHeadings.some(function (heading) {
    return heading.tagName === "H2";
  }) ? "H2" : "H3";
  var headings = allHeadings.filter(function (heading) {
    return heading.tagName === preferredTag;
  });

  function slugify(value) {
    return value
      .toLowerCase()
      .normalize("NFKD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section";
  }

  var usedIds = {};
  headings.forEach(function (heading) {
    var base = heading.id || slugify(heading.textContent || "");
    var id = base;
    var suffix = 2;
    while (usedIds[id] || (document.getElementById(id) && document.getElementById(id) !== heading)) {
      id = base + "-" + suffix;
      suffix += 1;
    }
    heading.id = id;
    usedIds[id] = true;
  });

  var existingLinks = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'));
  var existingIds = existingLinks.map(function (link) {
    try {
      return decodeURIComponent(link.hash.slice(1));
    } catch (_) {
      return link.hash.slice(1);
    }
  });
  var expectedIds = headings.map(function (heading) { return heading.id; });
  var tocMatches = existingIds.length === expectedIds.length && expectedIds.every(function (id, index) {
    return id === existingIds[index];
  });

  if (headings.length && !tocMatches) {
    var list = document.createElement("ul");
    headings.forEach(function (heading) {
      var item = document.createElement("li");
      var link = document.createElement("a");
      link.href = "#" + heading.id;
      link.textContent = heading.textContent.trim();
      item.appendChild(link);
      list.appendChild(item);
    });
    rail.replaceChildren(list);
    page.classList.add("article-page--runtime-toc");
  }

  if (!headings.length) {
    railShell.classList.add("article-rail--meta-only");
    return;
  }

  var links = Array.prototype.slice.call(rail.querySelectorAll('a[href^="#"]'));
  var entries = links.map(function (link) {
    var id;
    try {
      id = decodeURIComponent(link.hash.slice(1));
    } catch (_) {
      id = link.hash.slice(1);
    }
    return { link: link, heading: document.getElementById(id) };
  }).filter(function (entry) {
    return entry.heading;
  });

  if (!entries.length) return;

  var activeIndex = -1;
  var scheduled = false;

  function setActive(index) {
    if (index === activeIndex) return;
    activeIndex = index;

    entries.forEach(function (entry, entryIndex) {
      var active = entryIndex === index;
      entry.link.classList.toggle("is-active", active);
      if (active) {
        entry.link.setAttribute("aria-current", "location");
      } else {
        entry.link.removeAttribute("aria-current");
      }
    });
  }

  function update() {
    scheduled = false;
    var threshold = Math.min(window.innerHeight * 0.42, 320);
    var index = 0;

    entries.forEach(function (entry, entryIndex) {
      if (entry.heading.getBoundingClientRect().top <= threshold) index = entryIndex;
    });

    if (window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 8) {
      index = entries.length - 1;
    }

    setActive(index);
  }

  function scheduleUpdate() {
    if (scheduled) return;
    scheduled = true;
    window.requestAnimationFrame(update);
  }

  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate);
  window.addEventListener("hashchange", scheduleUpdate);
  update();
})();
