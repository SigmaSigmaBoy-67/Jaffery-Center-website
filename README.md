# Jaffery Center of Roanoke

Website for the Jaffery Center of Roanoke, 3031 Preston Avenue NW, Roanoke, VA. Eight static pages built with Vite and deployed on Vercel.

## Design

A two-ink risograph programme sheet. Cool paper, forest-black ink (from the center's monogram), one vermilion spot ink. The hero mihrab is drawn in code and dithered with the vault dot-dither rules (fixed dot grid, none/small/big dot per cell, one ink per layer, stepped at 8 fps, reduced-motion draws once): `art.js` on the kit in `scripts/dotdither.js`. Type: Big Shoulders Display, Satoshi, Space Mono, Amiri Quran. Design notes are in `PRODUCT.md` and `.planning/`.

## Work on it

Requires Node 20.19+ (or 22.12+) and Python 3.

```sh
npm ci
npm run dev       # regenerates pages from build.py, then Vite dev server
npm test          # page, link and content checks
npm run build     # regenerate pages, then build dist/
```

Edit copy in `build.py`, run `python3 build.py`, and commit the generated HTML with it. Vercel runs `npm run build:vercel` (Vite only), so Python is not needed there.

## Facts and what is not here

- Content comes from this repo's earlier pages and the center's previous site (https://www.jafferycenter.org). Muharram 2026 (June 16 to 28, 2026) is shown as a past program.
- Donation links (PayPal, Venmo) are the ones on the center's previous site. The Zelle code is only a QR image there, so this site links to it and shows no Zelle address.
- There is no photograph of the center on the web. The hero is an original illustration and is captioned as one.
- Contact links are `mailto:` links. Nothing is sent or stored by the site.
