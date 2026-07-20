(function () {
  var storageKey = "varyvoda-theme";
  var root = document.documentElement;
  var media = window.matchMedia("(prefers-color-scheme: dark)");

  function storedTheme() {
    try {
      var value = window.localStorage.getItem(storageKey);
      return value === "dark" || value === "light" ? value : null;
    } catch (_) {
      return null;
    }
  }

  function setStoredTheme(theme) {
    try {
      window.localStorage.setItem(storageKey, theme);
    } catch (_) {
      // Theme switching still works when storage is unavailable.
    }
  }

  function syncControl(theme) {
    var control = document.querySelector("[data-theme-toggle]");
    if (!control) return;

    var isDark = theme === "dark";
    var label = control.querySelector("[data-theme-label]");
    control.setAttribute("aria-label", "Switch to " + (isDark ? "light" : "dark") + " mode");
    control.setAttribute("aria-pressed", String(isDark));
    if (label) label.textContent = isDark ? "Light" : "Dark";
  }

  function applyTheme(theme) {
    root.dataset.theme = theme;
    root.style.colorScheme = theme;
    var color = theme === "dark" ? "#0f1519" : "#eef2f1";
    var themeColor = document.querySelector("meta[name='theme-color']");
    if (themeColor) themeColor.setAttribute("content", color);
    syncControl(theme);
    window.dispatchEvent(new CustomEvent("varyvoda:themechange", { detail: { theme: theme } }));
  }

  applyTheme(storedTheme() || (media.matches ? "dark" : "light"));

  function toggleTheme() {
    var nextTheme = root.dataset.theme === "dark" ? "light" : "dark";
    setStoredTheme(nextTheme);
    applyTheme(nextTheme);
  }

  // The atmosphere shader lets a click on the sun or moon flip the theme.
  window.varyvodaTheme = { toggle: toggleTheme };

  function bindControl() {
    var control = document.querySelector("[data-theme-toggle]");
    if (!control) return;

    syncControl(root.dataset.theme);
    control.addEventListener("click", toggleTheme);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindControl, { once: true });
  } else {
    bindControl();
  }

  media.addEventListener("change", function (event) {
    if (!storedTheme()) applyTheme(event.matches ? "dark" : "light");
  });
})();
