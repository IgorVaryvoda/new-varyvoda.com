(function () {
  var images = document.querySelectorAll(".article-prose img[data-src]");

  images.forEach(function (image) {
    var source = image.getAttribute("data-src");
    if (!source) return;

    image.loading = "lazy";
    image.decoding = "async";
    image.src = source;
    image.removeAttribute("data-src");
    image.classList.remove("Sirv");
  });
})();
