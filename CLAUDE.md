# empyreus.lt — notes for agents

- Company website for Empyreus MB. Static HTML/CSS, zero JS, served from `site/` by GitHub Pages.
- Local folder is `~/Development/zabukas` (historical name). The repo is `juozapas/empyreus.lt`.
- Release topology: push to `main` → `.github/workflows/deploy.yml` → GitHub Pages → https://empyreus.lt. No staging. DNS is in the owner's personal Cloudflare account (records DNS-only, not proxied).
- `npm test` is the whole check (node --test + linkedom). Run it before every commit.
- Content rules: company voice only. No person's name anywhere under `site/` except inside the LinkedIn profile URL in the Fractional CTO card; a test fails on the string "zabukas" anywhere else. Public contact is info@empyreus.lt only.
- Legal facts (company code 304561927, VAT LT100018560915, address) are sourced in `docs/superpowers/specs/2026-09-11-empyreus-site-design.md`. Change them there first, then in the pages and JSON-LD.
- `404.html` uses absolute `https://empyreus.lt/` URLs because it is served from any path. Other pages use relative links so the github.io preview works.
- Fonts: `python3 scripts/fetch-fonts.py`. Icons: `scripts/render-icons.sh` (macOS only, needs the Swift toolchain).
