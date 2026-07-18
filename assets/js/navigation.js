(function () {
  "use strict";

  // Keep the mobile menu state explicit so every close path behaves the same.
  var navigation = document.querySelector("[data-site-navigation]");
  if (!navigation) return;

  var button = navigation.querySelector("[data-menu-button]");
  var label = navigation.querySelector("[data-menu-label]");
  var menu = navigation.querySelector("[data-primary-navigation]");
  if (!button || !label || !menu) return;

  var mobileViewport = window.matchMedia("(max-width: 680px)");

  function setOpen(isOpen, returnFocus) {
    button.setAttribute("aria-expanded", String(isOpen));
    label.textContent = isOpen ? "Close" : "Menu";

    if (!isOpen && returnFocus) button.focus();
  }

  navigation.dataset.navigationReady = "";

  button.addEventListener("click", function () {
    setOpen(button.getAttribute("aria-expanded") !== "true", false);
  });

  menu.addEventListener("click", function (event) {
    if (event.target.closest("a")) setOpen(false, false);
  });

  document.addEventListener("pointerdown", function (event) {
    if (button.getAttribute("aria-expanded") === "true" && !navigation.contains(event.target)) {
      setOpen(false, false);
    }
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && button.getAttribute("aria-expanded") === "true") {
      setOpen(false, true);
    }
  });

  function handleViewportChange(event) {
    if (!event.matches) setOpen(false, false);
  }

  if (mobileViewport.addEventListener) {
    mobileViewport.addEventListener("change", handleViewportChange);
  } else {
    mobileViewport.addListener(handleViewportChange);
  }
})();
