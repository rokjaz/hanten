# Hanten (反転)

Public static site of counterintuitive-but-accurate maps and statistics, at **hanten.app**. No monetization yet.

## Stack

Plain HTML/CSS/vanilla JS. One `.html` file per map page in the repo root — no build step, no framework, no bundler. Deployed on Vercel straight from the repo; pushing to `main` ships to production.

**Keep it flat.** All map pages live directly in the repo root (`bowling-spares.html`, `true-size-africa.html`, etc.), not in subdirectories. URLs are shared on Reddit/social as-is, so a page's filename is effectively a permanent public URL — don't move or rename an existing page without a good reason, and never nest pages into category subfolders (it would break every existing link and OG image URL for an organizational win that doesn't matter at this page count). Categorization is handled in data (`CATEGORIES`/`SUBGROUPS` in `index.html`), not the filesystem.

## Repo layout

- `index.html` — homepage. Card grid + two-level category/subgroup filter UI (see below).
- `<page>.html` — one map/stat page per file, self-contained.
- `data/` — shared JS data files loaded by multiple pages (`us-counties-10m.js`, `county-density.js`, `county-area.js`, `countries.js`, etc.) and `data/og/*.png` (social preview images, one per page).
- `data/save-image.js` — `HantenSaveImage.init(...)` helper, adds a "save as image" button to a page (see per-page template below).

## Page template

Every map page follows the same shape:
1. `<head>`: title, description, then a full OG/Twitter meta block (`og:title`, `og:description`, `og:image` pointing at `data/og/<page>.png` at 1200×630, `twitter:card summary_large_image`, etc.) — copy an existing page's block and edit the text/image, don't write it from scratch.
2. `<style>`: `:root` vars for `--ink`, `--paper`, `--accent` (shared site palette) plus page-specific map-fill colors (see Color system below).
3. `<header>`: wordmark linking to `index.html` + a "← All maps" home link, both present on every page.
4. `<main>`: `<h1>`, `.sub` one-liner, `#save-image-slot` div, the map/chart itself, then a `.caption` box with 2-3 short `<p>` explaining the finding, cross-links to related pages, and a `.source` line citing the actual data source.
5. Scripts at the bottom: D3 (`d3.v7.min.js`) + any `data/*.js` files needed, then the page's own inline `<script>` that builds the visualization, then `html2canvas` + `data/save-image.js` + `HantenSaveImage.init({ target, title, filename })`.
6. `<script defer src="/_vercel/insights/script.js">` at the very end.

## Color system

Two separate palettes — don't conflate them:
- **Category accent colors** (site-wide, used for filter buttons/tags): `--cat-population`, `--cat-distances`, `--cat-politics`, `--cat-statistics`, `--cat-sports` — defined in `index.html`.
- **Per-page map fill colors**: each page defines its own `--<name>`/`--<name>-soft` pair for what it's actually shading on the map (e.g. `density-high.html`'s `--dense`/`--dense-soft`). When multiple pages are conceptually related (e.g. the density trilogy: `density-extremes.html`, `density-high.html`, `density-veryhigh.html`), keep their fill colors visually distinct from each other and keep them in sync between the standalone pages and any combined overview page.

Always compute stats (percentages, counts) from the real data files at generation time (e.g. iterate `COUNTY_DENSITY`/`COUNTY_AREA` in the browser) — never hand-write a number into copy.

## index.html filter/navigation system

- `CATEGORIES`: top-level categories. `SUBGROUPS`: `{id, label, parentCat}` entries that nest under a category (e.g. Bowling under Sports).
- Cards get `data-cat="<category>"` and, if they belong to a subgroup, `data-subgroup="<id>"`. Subgroup cards are hidden from the unfiltered home view and only appear once their category or specific subgroup is selected.
- Selecting a category or subgroup behaves like navigating to a dedicated page: the other top-level categories / sibling subgroups are removed from the DOM (not just dimmed), replaced by a "← back" control one level up. State is mirrored into the URL as `?cat=<id>&sub=<id>` via `pushState`/`popstate`, so category and subgroup views are bookmarkable and shareable.
- When adding a new page to a subgroup: add the card with the right `data-cat`/`data-subgroup`, add a `SUBGROUPS` entry if it's a new subgroup, and give the card a small icon SVG consistent with its sibling cards' style.

## Generating OG images

There's no OG-image tooling in the repo — images are a templated card design (wordmark, kanji, category tag, title, a small icon in a circle, footer), not map screenshots, rendered at exactly 1200×630px. The Browser tool's screenshot action downscales and can't hit that exact size, so instead:
1. Create a temporary `_og-gen.html` in the repo root that renders the card template and exposes `window.HantenOG = { render(iconKey, title), capture() }`, where `capture()` returns `html2canvas(document.body, { width: 1200, height: 630, scale: 1 }).toDataURL("image/png")`.
2. Drive it via the Browser tool's `javascript_tool` (use `.then()`, not top-level `await`), pull the resulting base64 PNG out (it's large enough to land in a saved `.txt` file — decode that with a small Python one-liner into `data/og/<page>.png`).
3. Verify size with `sips -g pixelWidth -g pixelHeight`.
4. **Always delete `_og-gen.html` before committing** — it's a disposable generator, never checked in.

## Verify-before-shipping workflow

For every change:
1. Create `.claude/launch.json` with a `python3 -m http.server <port>` config, preview it, exercise the change via the Browser tool (prefer `.click()`/`javascript_exec` over `computer` mouse actions for functional checks — coordinate/ref clicks have been unreliable in this repo; save real `computer` screenshots for final visual confirmation only).
2. Check `read_console_messages(onlyErrors)`, take a screenshot, and resize to 375×812 to confirm no horizontal overflow (`document.documentElement.scrollWidth - window.innerWidth === 0`).
3. `preview_stop`, then delete `.claude/launch.json` — it's local-only, never committed.
4. `git diff` review → commit (no `Co-Authored-By` line in this repo's history) → `push` to `main`.
5. `sleep 20` then `curl -s https://www.hanten.app/<page>` to confirm the change is live.

## Working with the user

The user is a coding beginner building this as a real product. Explain what code/tools are doing as you introduce them, not just what you changed.
