import { test } from "node:test";
import assert from "node:assert/strict";
import { PAGES, SITE_ORIGIN, loadPage, localFileExists, resolveLocal } from "./helpers.mjs";

const LEGAL = ["Empyreus MB", "304561927", "LT100018560915", "V. Nagevičiaus g. 3", "LT-08237", "info@empyreus.lt"];
const CANONICAL = { "index.html": `${SITE_ORIGIN}/`, "privacy.html": `${SITE_ORIGIN}/privacy` };

assert.ok(PAGES.length > 0, "PAGES must list at least one page");

for (const page of PAGES) {
  test(`${page}: document basics`, () => {
    const { document } = loadPage(page);
    assert.equal(document.documentElement.getAttribute("lang"), "en");
    assert.equal(document.querySelectorAll("h1").length, 1, "exactly one h1");
    const title = document.querySelector("title")?.textContent.trim() ?? "";
    assert.ok(title.includes("Empyreus"), `title mentions Empyreus: "${title}"`);
    const desc = document.querySelector('meta[name="description"]')?.getAttribute("content") ?? "";
    assert.ok(desc.length >= 50 && desc.length <= 160, `description length ${desc.length}`);
    assert.ok(document.querySelector('meta[name="viewport"]'), "viewport meta");
    assert.ok(document.querySelector("main#main"), "main landmark with id=main");
    assert.ok(document.querySelector('a.skip-link[href="#main"]'), "skip link");
    assert.ok(document.querySelector('link[rel="icon"][href$="favicon.svg"]'), "svg favicon");
  });

  test(`${page}: canonical and Open Graph`, () => {
    const { document } = loadPage(page);
    const canonical = document.querySelector('link[rel="canonical"]')?.getAttribute("href") ?? null;
    assert.equal(canonical, CANONICAL[page] ?? null);
    for (const prop of ["og:title", "og:description", "og:url", "og:type", "og:site_name", "og:image"]) {
      assert.ok(document.querySelector(`meta[property="${prop}"]`)?.getAttribute("content"), `${prop} set`);
    }
    if (page === "404.html") {
      assert.equal(document.querySelector('meta[name="robots"]')?.getAttribute("content"), "noindex");
    }
  });

  test(`${page}: legal block in footer`, () => {
    const { document } = loadPage(page);
    const footer = document.querySelector("footer")?.textContent ?? "";
    for (const s of LEGAL) assert.ok(footer.includes(s), `footer contains "${s}"`);
  });

  test(`${page}: no scripts except JSON-LD`, () => {
    const { document } = loadPage(page);
    for (const s of document.querySelectorAll("script")) {
      assert.equal(s.getAttribute("type"), "application/ld+json");
    }
    assert.equal(document.querySelectorAll("form, iframe, input").length, 0, "no forms or embeds");
  });

  test(`${page}: every link and asset resolves`, () => {
    const { document } = loadPage(page);
    const refs = [];
    for (const el of document.querySelectorAll("a[href], link[href]")) refs.push(el.getAttribute("href"));
    for (const el of document.querySelectorAll("img[src]")) refs.push(el.getAttribute("src"));
    for (const el of document.querySelectorAll('meta[property="og:image"], meta[property="og:url"]')) refs.push(el.getAttribute("content"));
    assert.ok(refs.length > 0);
    for (const href of refs) {
      if (/^https?:/i.test(href) && !href.startsWith(SITE_ORIGIN)) {
        assert.ok(href.startsWith("https://"), `external link uses https: ${href}`);
        continue;
      }
      const local = resolveLocal(page, href);
      if (local === null) continue;
      assert.ok(localFileExists(local), `${href} -> site/${local} exists`);
    }
  });
}
