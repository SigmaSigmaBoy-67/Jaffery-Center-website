# Jaffery Center of Roanoke — independent website

This folder contains the seven-page Jaffery Center website. The original DeadlineOS application is not included. The header, footer, and favicon use the supplied Jaffery Center logo artwork: the extracted monogram is in the header and favicon, and the full lockup is in the footer (`assets/brand/jaffery-center-monogram.png`, `assets/brand/jaffery-center-logo-light.png`). The older exploratory marks remain in `assets/brand/` for reference. This site has **no active online donation destination**: Support Us offers an email inquiry, not a payment link.

## Develop and verify

Requirements: Node.js 20.19+ (or 22.12+) and Python 3 for content regeneration. On Vercel, the checked-in seven HTML pages are used directly, so Python is **not** required in the Vercel build environment.

```sh
npm ci
npm run typecheck
npm test
npm run build             # Python regenerates pages from build.py, then Vite builds dist/
npm run build:vercel      # Vite builds the already-generated pages without Python
npm run preview           # Optional local production preview
```

Edit content in `build.py`, then run `python3 build.py` locally and commit the seven generated HTML files along with the source. Run typecheck, test, and build before publishing. The source of truth is `build.py`; do not edit generated pages alone. Site links are relative `.html` links, so all seven routes work from a dedicated project's root. The lazy React footer has a complete static fallback in `build.py`, even with JavaScript off.

The home page is an editorial “House of Light” threshold: `assets/house-of-light.svg` is original layered vector artwork (architecture, sky, separate Blue Ridge planes, floor, and screen). `src/house-scene-entry.ts` moves those independent layers with measured scroll geometry and controls the Dawn/Day/Dusk lighting; it also turns the Sunday School notebook page. The home page now opens directly into the House of Light scene. The JAFFERY glyph portal, intro entrypoint, and intro stylesheet have been removed from the website and source. The Community route adds an interactive adjustable-glass information dashboard (`components/ui/adjustable-glass-dashboard.tsx`) using only the Center facts already on this site—programs, Sunday School, location, and contact; it contains no fabricated finance data or event schedule. The dashboard uses GSAP for restrained view transitions and the locally authored House of Light scene as its background. This repository already has TypeScript, Tailwind, the `@/` alias, and the shadcn-style `/components/ui/` path, so no CLI or framework setup is needed. The supplied Jaffery Center logo files are used for the masthead, favicon, and footer; the two other homepage room scenes are illustrative artwork, explicitly captioned as illustrations rather than photographs. Framer Motion remains available to the retained optional parallax component; the liquid navigation and its component styles remain in `components/ui/`. Adapted third-party component code and its existing source/license notices are retained in their respective files; the new SVG scene and CSS compositions are original project artwork.

## Separate GitHub repository and Vercel project

1. **Only after the organization approves the repository owner/name and visibility**, create a new empty repository for this directory. Do not import it into the existing DeadlineOS repository's `main` branch. Do not delete or overwrite the current DeadlineOS project or PR.
2. In this exported directory, initialize Git and push this directory's contents to the new repository. This export script intentionally creates no Git history or remote.
3. In Vercel, **create a new project** linked to the new repository; do not attach it to the existing DeadlineOS Vercel project. Framework: Vite; Root Directory: repository root; Install: `npm ci`; Build: `npm run build:vercel`; Output Directory: `dist`. These settings are in `vercel.json` in this exported folder, not in the DeadlineOS root.
4. Review the Vercel-generated preview URL first. **Do not attach the organization's official domain** until the organization approves the content, proposed logo, and deployment. To add confirmed online donations later, obtain written confirmation of the exact destination and implement/test it in a separate change.

A Vercel preview is not an official-domain launch. The contact form opens an email draft on the visitor's device; it does not transmit data from the website. No prayer timetable, event date, public opening hours, or payment account is fabricated.
