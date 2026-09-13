import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { parseHTML } from "linkedom";

export const SITE_DIR = fileURLToPath(new URL("../site/", import.meta.url));
export const SITE_ORIGIN = "https://empyreus.lt";
// Pages that get the per-page assertions. Later tasks append to this list.
export const PAGES = ["index.html", "privacy.html", "404.html"];

export function readSite(file) {
  return readFileSync(join(SITE_DIR, file), "utf8");
}

export function loadPage(file) {
  const html = readSite(file);
  const { document } = parseHTML(html);
  return { html, document };
}

export function listSiteFiles(dir = SITE_DIR, prefix = "") {
  const out = [];
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    const rel = prefix ? `${prefix}/${name}` : name;
    if (statSync(full).isDirectory()) out.push(...listSiteFiles(full, rel));
    else out.push(rel);
  }
  return out.sort();
}

// Map a link found in `fromFile` to a path under site/. Returns null for
// mailto:, in-page anchors and links to other hosts.
export function resolveLocal(fromFile, href) {
  if (href.startsWith("mailto:") || href.startsWith("#")) return null;
  let path;
  if (href.startsWith(`${SITE_ORIGIN}/`)) path = href.slice(SITE_ORIGIN.length + 1);
  else if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith("//")) return null;
  else if (href.startsWith("/")) path = href.slice(1);
  else path = join(dirname(fromFile), href).split(sep).join("/");
  path = path.split(/[?#]/)[0];
  if (path === "" || path === ".") return "index.html";
  if (path.endsWith("/")) return `${path}index.html`;
  return path;
}

// GitHub Pages serves /privacy from privacy.html, so accept both spellings.
export function localFileExists(path) {
  return existsSync(join(SITE_DIR, path)) || existsSync(join(SITE_DIR, `${path}.html`));
}
