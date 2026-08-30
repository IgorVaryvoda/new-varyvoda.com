function readContactContext(search) {
  var params = new URLSearchParams(search);
  var valid = function (name) {
    var value = params.get(name) || "";
    return /^[a-z0-9][a-z0-9-]{0,63}$/.test(value) ? value : "";
  };
  return { project: valid("project"), type: valid("type") };
}

function contactLabel(value) {
  return value.split("-").map(function (part) {
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(" ");
}

function contactTypeLabel(value) {
  return { bug: "Bug report", correction: "Correction", question: "Question", story: "Story" }[value] || contactLabel(value);
}

function buildContactFormURL(base, context) {
  var url = new URL(base);
  var params = new URLSearchParams();
  if (context.project) params.set("project", context.project);
  if (context.type) params.set("type", context.type);
  url.hash = params.toString();
  return url.toString();
}

function buildContactEmailURL(base, context) {
  var url = new URL(base);
  var project = contactLabel(context.project);
  var type = contactTypeLabel(context.type);
  url.searchParams.set("subject", [type || "Project message", project].filter(Boolean).join(" · "));
  url.searchParams.set("body", [project && "Project: " + project, type && "Type: " + type, "", ""].filter(function (line, index) {
    return line || index > 1;
  }).join("\n"));
  return url.toString();
}

if (typeof window !== "undefined" && typeof document !== "undefined") {
  var context = readContactContext(window.location.search);
  if (context.project || context.type) {
    var project = contactLabel(context.project);
    var type = contactTypeLabel(context.type);
    var contextNode = document.querySelector("[data-contact-context]");
    if (contextNode) {
      contextNode.textContent = "Context: " + [project, type].filter(Boolean).join(" · ") + ".";
      contextNode.hidden = false;
    }
    document.querySelectorAll("[data-contact-form]").forEach(function (link) {
      link.href = buildContactFormURL(link.href, context);
    });
    var email = document.querySelector("[data-contact-email]");
    if (email) email.href = buildContactEmailURL(email.href, context);
  }
}

if (typeof module !== "undefined") {
  module.exports = { readContactContext: readContactContext, buildContactFormURL: buildContactFormURL, buildContactEmailURL: buildContactEmailURL };
}
