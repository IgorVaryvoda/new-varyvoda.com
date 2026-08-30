import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const require = createRequire(import.meta.url);
const { readContactContext, buildContactFormURL, buildContactEmailURL } = require("../assets/js/pages/contact.js");
const middlewareSource = await readFile(new URL("../functions/_middleware.js", import.meta.url), "utf8");
const middleware = await import(`data:text/javascript;base64,${Buffer.from(middlewareSource).toString("base64")}`);

function publicPath(pathname) {
  if (pathname === "/") return new URL("../public/index.html", import.meta.url);
  if (pathname.endsWith("/")) return new URL(`../public${pathname}index.html`, import.meta.url);
  return new URL(`../public${pathname}`, import.meta.url);
}

async function assetFetch(input) {
  const request = input instanceof Request ? input : new Request(input);
  const pathname = new URL(request.url).pathname;
  try {
    const body = await readFile(publicPath(pathname));
    const type = pathname.endsWith(".md") ? "text/markdown" :
      pathname.endsWith(".json") ? "application/json" : "text/html";
    return new Response(request.method === "HEAD" ? null : body, {
      headers: { "Content-Type": `${type}; charset=utf-8`, Vary: "Accept-Encoding" },
    });
  } catch {
    const body = await readFile(new URL("../public/404.html", import.meta.url));
    return new Response(request.method === "HEAD" ? null : body, {
      status: 404,
      headers: { "Content-Type": "text/html; charset=utf-8", Vary: "Accept-Encoding" },
    });
  }
}

async function invoke(path, { accept, method = "GET" } = {}) {
  const request = new Request(`https://www.varyvoda.com${path}`, {
    method,
    headers: accept ? { Accept: accept } : {},
  });
  return middleware.onRequest({
    request,
    env: { ASSETS: { fetch: assetFetch } },
    next: () => assetFetch(request),
  });
}

const vectors = [
  [null, "text/html"],
  ["*/*", "text/html"],
  ["text/markdown", "text/markdown"],
  ["text/markdown, text/html;q=0.8", "text/markdown"],
  ["text/html, text/markdown;q=0.8", "text/html"],
  ["text/markdown;q=0, text/html", "text/html"],
  ["text/*, text/markdown", "text/markdown"],
];
for (const [header, expected] of vectors) {
  assert.equal(middleware.preferredType(header), expected, `Accept: ${header}`);
}

const homeHtml = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
assert.match(homeHtml, /<h1\b[^>]*class=(?:"[^"]*scene-sentence[^"]*"|scene-sentence)(?:\s|>)/);
assert.match(homeHtml, /I build <a\b[^>]*>products<\/a>—and I <a\b[^>]*>keep them alive<\/a>\./);
assert.doesNotMatch(homeHtml, /<h1 class=(?:"visually-hidden"|visually-hidden)>/);
const headingLevels = [...homeHtml.matchAll(/<h([1-6])\b/g)].map((match) => Number(match[1]));
assert.equal(headingLevels.filter((level) => level === 1).length, 1);
for (let index = 1; index < headingLevels.length; index += 1) {
  assert.ok(headingLevels[index] <= headingLevels[index - 1] + 1, `heading level skipped at ${headingLevels[index]}`);
}
const readableHome = homeHtml
  .replace(/<script\b[\s\S]*?<\/script>/gi, " ")
  .replace(/<style\b[\s\S]*?<\/style>/gi, " ")
  .replace(/<[^>]+>/g, " ")
  .replace(/\s+/g, " ")
  .trim();
assert.ok(readableHome.length >= 500, `homepage has only ${readableHome.length} readable characters`);
assert.match(homeHtml, /\/js\/atmosphere(?:\.min)?\.[a-f0-9]+\.js/);

const aboutHtml = await readFile(new URL("../public/about/index.html", import.meta.url), "utf8");
assert.match(aboutHtml, /page-static-scene/);
assert.doesNotMatch(aboutHtml, /\/js\/atmosphere/);

const contactHtml = await readFile(new URL("../public/contact/index.html", import.meta.url), "utf8");
assert.match(contactHtml, /\/js\/pages\/contact(?:\.min)?\.[a-f0-9]+\.js/);
assert.match(contactHtml, /data-contact-context/);
assert.equal(readContactContext("?project=slovocard&type=correction").project, "slovocard");
assert.deepEqual(readContactContext("?project=%3Cscript%3E&type=bug"), { project: "", type: "bug" });
assert.equal(buildContactFormURL("https://form.typeform.com/to/example", { project: "viddl", type: "bug" }), "https://form.typeform.com/to/example#project=viddl&type=bug");
assert.match(buildContactEmailURL("mailto:igor@example.com", { project: "viddl", type: "bug" }), /^mailto:igor@example\.com\?subject=Bug\+report/);

const studioHtml = await readFile(new URL("../public/projects/sirv-studio/index.html", import.meta.url), "utf8");
assert.match(studioHtml, /\/css\/systems\/studio(?:\.min)?\.[a-f0-9]+\.css/);
assert.match(studioHtml, /\/js\/pages\/studio(?:\.min)?\.[a-f0-9]+\.js/);
assert.match(studioHtml, />Ownership</);
assert.doesNotMatch(studioHtml, /\{\{</);

const budjetHtml = await readFile(new URL("../public/projects/budjet/index.html", import.meta.url), "utf8");
assert.match(budjetHtml, /page-static-scene/);
assert.doesNotMatch(budjetHtml, /\/js\/atmosphere/);

const writingHtml = await readFile(new URL("../public/posts/index.html", import.meta.url), "utf8");
for (const heading of ["Start here.", "Essays", "Build records", "Technical guides", "Older archive"]) {
  assert.match(writingHtml, new RegExp(`>${heading}<`));
}

for (const path of ["index.md", "about/index.md", "posts/index.md", "projects/index.md", "projects/sirv-studio/index.md"]) {
  await access(new URL(`../public/${path}`, import.meta.url));
}

const openapi = JSON.parse(await readFile(new URL("../public/openapi.json", import.meta.url), "utf8"));
assert.equal(openapi.openapi, "3.1.1");
assert.deepEqual(openapi.security, []);
assert.equal(openapi.paths["/api"].get.responses["200"].content["application/json"].schema.$ref, "#/components/schemas/SiteIndex");
assert.deepEqual(openapi.components.schemas.Error.properties.error.required, ["code", "message", "resolution"]);

const routes = JSON.parse(await readFile(new URL("../public/_routes.json", import.meta.url), "utf8"));
assert.ok(routes.exclude.includes("/openapi.json"));
assert.ok(!routes.exclude.includes("/*.json"));

const html404 = await readFile(new URL("../public/404.html", import.meta.url), "utf8");
assert.match(html404, /href=(?:"\/sitemap\.xml"|\/sitemap\.xml)/);
assert.match(html404, /href=(?:"\/posts\/"|\/posts\/)/);

const markdown = await invoke("/", { accept: "text/markdown" });
assert.equal(markdown.status, 200);
assert.equal(markdown.headers.get("Content-Type"), "text/markdown; charset=utf-8");
assert.equal(markdown.headers.get("Vary"), "Accept-Encoding, Accept");
assert.match(await markdown.text(), /^# Igor Varyvoda/m);

const html = await invoke("/", { accept: "text/html" });
assert.equal(html.status, 200);
assert.equal(html.headers.get("Vary"), "Accept-Encoding, Accept");
assert.match(await html.text(), /<!doctype html>/i);

const unacceptable = await invoke("/", { accept: "application/pdf" });
assert.equal(unacceptable.status, 406);
assert.equal(unacceptable.headers.get("Vary"), "Accept, Accept-Encoding");

const missing = await invoke("/agent-readiness-missing", { accept: "text/markdown" });
assert.equal(missing.status, 404);
assert.equal(missing.headers.get("Content-Type"), "text/markdown; charset=utf-8");
assert.match(await missing.text(), /\[Sitemap\]\(\/sitemap\.xml\)/);

const missingHtml = await invoke("/agent-readiness-missing", { accept: "text/html" });
assert.equal(missingHtml.status, 404);
assert.match(await missingHtml.text(), /href=(?:"\/sitemap\.xml"|\/sitemap\.xml)/);

const directMarkdown = await invoke("/about/index.md", { accept: "text/markdown" });
assert.equal(directMarkdown.status, 200);
assert.equal(directMarkdown.headers.get("Content-Type"), "text/markdown; charset=utf-8");
assert.match(await directMarkdown.text(), /^# About me/m);

const api = await invoke("/api");
assert.equal(api.status, 200);
assert.equal(api.headers.get("Content-Type"), "application/json; charset=utf-8");
assert.equal((await api.json()).resources.openapi, "https://www.varyvoda.com/openapi.json");

const apiHead = await invoke("/api", { method: "HEAD" });
assert.equal(apiHead.status, 200);
assert.equal(apiHead.headers.get("Content-Type"), "application/json; charset=utf-8");
assert.equal(await apiHead.text(), "");

const apiMissing = await invoke("/api/missing.json");
assert.equal(apiMissing.status, 404);
assert.deepEqual(Object.keys((await apiMissing.json()).error), ["code", "message", "resolution"]);

const apiMethod = await invoke("/api", { method: "POST" });
assert.equal(apiMethod.status, 405);
assert.equal(apiMethod.headers.get("Allow"), "GET, HEAD");
assert.equal((await apiMethod.json()).error.code, "method_not_allowed");

console.log(`AGENT READINESS OK (${root})`);
