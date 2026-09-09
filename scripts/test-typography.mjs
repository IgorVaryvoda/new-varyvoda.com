import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

// Source-contract checks, not a substitute for rendered-page verification.
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8");
const [type, home, posts, template] = await Promise.all([
  read("assets/css/typography.css"),
  read("assets/css/pages/home.css"),
  read("assets/css/pages/posts.css"),
  read("layouts/_default/baseof.html"),
]);

function rule(source, selector) {
  const escaped = selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = source.match(new RegExp(`${escaped}\\s*\\{([^}]+)\\}`));
  assert.ok(match, `Missing rule: ${selector}`);
  return match[1];
}

function hasDeclaration(source, property, value) {
  assert.ok(source.includes(`${property}: ${value};`), `Expected ${property}: ${value}`);
}

test("shared roles load once, after the shell and before page styles", () => {
  assert.equal(template.split('resources.Get "css/typography.css"').length - 1, 1);
  assert.match(template, /slice \$normalize \$styles \$custom \$fonts \$typography/);
  assert.match(template, /href="\{\{ \$typography.RelPermalink \}\}"/);
  assert.doesNotMatch(template, /partial "stylesheet.html" "css\/typography.css"/);
  assert.ok(template.indexOf('$typography.RelPermalink') < template.indexOf('"css/pages/home.css"'));
});

test("shared sizes preserve a readable rem-based floor", () => {
  const root = rule(type, ":root");
  hasDeclaration(root, "--type-compact-label", "1.25rem");
  hasDeclaration(root, "--type-compact-action", "1.4rem");
  hasDeclaration(root, "--type-supporting", "1.3rem");
  hasDeclaration(root, "--type-intro", "clamp(1.7rem, 1.55rem + 0.4vw, 1.9rem)");
  hasDeclaration(root, "--type-prose", "clamp(1.8rem, 1.68rem + 0.32vw, 2rem)");
  assert.doesNotMatch(type, /!important|@font-face|https?:\/\//);
});

test("homepage copy has two voices, not three", () => {
  hasDeclaration(rule(home, ".scene-intro"), "font-family", "var(--reading)");
  for (const selector of [".scene-personality", ".build-role", ".career-strip a > span"]) {
    const declarations = rule(home, selector);
    hasDeclaration(declarations, "font-family", "var(--display)");
    hasDeclaration(declarations, "text-transform", "none");
  }
  // Mobile must not silently reintroduce the old 9–13.5px overrides.
  const mobile = home.slice(home.indexOf("@media (max-width: 680px)"));
  for (const match of mobile.matchAll(/\.scene-(?:intro|personality|corner)\s*\{([^}]+)\}/g)) {
    assert.doesNotMatch(match[1], /font-size:\s*(?:0\.[\d]+|1\.[01]\d*|1\.35)rem/);
  }
});

test("article navigation uses readable UI type and a full control target", () => {
  const nav = rule(posts, ".article-rail a");
  hasDeclaration(nav, "font-family", "var(--display)");
  hasDeclaration(nav, "font-size", "var(--type-compact-action)");
  hasDeclaration(nav, "min-height", "var(--control-min)");
  hasDeclaration(nav, "text-transform", "none");
  hasDeclaration(nav, "overflow-wrap", "anywhere");
});

test("reading measure is scoped to articles, not technical project surfaces", () => {
  hasDeclaration(rule(type, ":root"), "--measure-prose", "64ch");
  hasDeclaration(rule(posts, ".article-page--editorial .article-prose"), "width", "min(100%, var(--measure-prose))");
  assert.doesNotMatch(type, /--measure-reading\s*:|\.project-prose\s*\{/);
});

test("fenced code is not scaled down twice", () => {
  hasDeclaration(rule(type, "body.builder-index .prose pre"), "font-size", "var(--type-compact-action)");
  hasDeclaration(rule(type, "body.builder-index .prose pre code"), "font-size", "inherit");
});
