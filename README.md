# empyreus.lt

Company website for Empyreus MB, Vilnius. Three static pages, one stylesheet, no JavaScript,
served by GitHub Pages from `site/`.

## Develop

```bash
npm install
npm run dev      # http://localhost:4321
npm test         # structure, legal block, links, no third-party assets
```

## Deploy

Push to `main`. `.github/workflows/deploy.yml` runs the tests and publishes `site/` to GitHub
Pages at https://empyreus.lt. DNS and custom-domain steps live in `docs/go-live.md`.

## Regenerate assets

- Fonts: `python3 scripts/fetch-fonts.py` (writes `site/assets/fonts/` and `site/assets/css/fonts.css`)
- Icons and OG image: `scripts/render-icons.sh` (macOS, uses the Swift toolchain)
