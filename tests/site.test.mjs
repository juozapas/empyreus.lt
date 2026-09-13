import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PAGES, SITE_DIR, SITE_ORIGIN, listSiteFiles, loadPage, readSite } from "./helpers.mjs";

const TEXT_EXT = /\.(html|css|txt|xml|svg|json)$/i;

test("no personal brand: 'zabukas' appears nowhere under site/", () => {
  for (const file of listSiteFiles()) {
    if (!TEXT_EXT.test(file)) continue;
    // The only permitted occurrence is inside the LinkedIn profile URL in the Fractional CTO card.
    const text = readSite(file).replace(/https?:\/\/(www\.)?linkedin\.com\/[^\s"'<>]*/gi, "");
    assert.ok(!/zabukas/i.test(text), `${file} must not mention zabukas outside a LinkedIn URL`);
  }
});

test("CNAME is empyreus.lt", () => {
  assert.equal(readSite("CNAME").trim(), "empyreus.lt");
});

test("robots.txt allows crawling and names the sitemap", () => {
  const robots = readSite("robots.txt");
  assert.match(robots, /^User-agent: \*$/m);
  assert.match(robots, /^Allow: \/$/m);
  assert.match(robots, new RegExp(`^Sitemap: ${SITE_ORIGIN}/sitemap\\.xml$`, "m"));
});

test("sitemap lists exactly the two indexable pages", () => {
  const locs = [...readSite("sitemap.xml").matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
  assert.deepEqual(locs, [`${SITE_ORIGIN}/`, `${SITE_ORIGIN}/privacy`]);
});

test("stylesheets reference only local assets", () => {
  for (const file of listSiteFiles()) {
    if (!file.endsWith(".css")) continue;
    assert.ok(!/url\(\s*["']?https?:/i.test(readSite(file)), `${file} has no remote url()`);
  }
});

test("fonts.css points at woff2 files that exist and are real WOFF2", () => {
  const css = readSite("assets/css/fonts.css");
  const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)].map((m) => m[1]);
  assert.ok(urls.length >= 5, `at least five font faces, got ${urls.length}`);
  for (const u of urls) {
    const buf = readFileSync(join(SITE_DIR, join("assets/css", u)));
    assert.equal(buf.subarray(0, 4).toString("latin1"), "wOF2", `${u} is WOFF2`);
  }
});

test("PNG icons exist with the expected dimensions", () => {
  const expected = { "favicon.png": [32, 32], "apple-touch-icon.png": [180, 180], "assets/og.png": [1200, 630] };
  for (const [file, [w, h]] of Object.entries(expected)) {
    const buf = readFileSync(join(SITE_DIR, file));
    assert.equal(buf.subarray(1, 4).toString("latin1"), "PNG", `${file} is PNG`);
    assert.deepEqual([buf.readUInt32BE(16), buf.readUInt32BE(20)], [w, h], `${file} is ${w}x${h}`);
  }
});

test("index.html carries Organization JSON-LD with the legal identity", () => {
  const { document } = loadPage("index.html");
  const node = document.querySelector('script[type="application/ld+json"]');
  assert.ok(node, "JSON-LD present");
  const data = JSON.parse(node.textContent);
  assert.equal(data["@type"], "Organization");
  assert.equal(data.legalName, "Empyreus MB");
  assert.equal(data.vatID, "LT100018560915");
  assert.equal(data.identifier?.value, "304561927");
  assert.equal(data.email, "info@empyreus.lt");
  assert.equal(data.address?.postalCode, "LT-08237");
  assert.equal(data.url, `${SITE_ORIGIN}/`);
});

test("every page's footer links to the privacy policy", () => {
  for (const page of PAGES) {
    const { document } = loadPage(page);
    const hrefs = [...document.querySelectorAll("footer a[href]")].map((a) => a.getAttribute("href"));
    assert.ok(hrefs.some((h) => h === "privacy" || h === `${SITE_ORIGIN}/privacy`), `${page} footer links to privacy`);
  }
});
