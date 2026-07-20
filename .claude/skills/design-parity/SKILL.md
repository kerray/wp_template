---
name: design-parity
description: >-
  Checklist-driven workflow for bringing an Astro page or island to brand
  visual parity with the production design reference. Use for any styling,
  design-parity, visual-review, or "make it match production / look right"
  work on the headless Astro frontend — running the visual-review screenshot
  crawl, comparing the local Astro dev server against the production site per
  a fixed checklist (typography, headings, brand colors, spacing, container
  width, tables, badges, buttons, island interactive states), and mapping
  every fix to presetSite tokens / UnoCSS utilities rather than ad-hoc CSS.
  Trigger on "visual review", "design parity", "brand parity", "match
  production styling", "screenshot comparison", "pixel review", "why does
  this page look wrong".
---

# Design Parity (Astro ↔ production)

Content normalization guarantees zero text/structure loss, but pixels are
never verified by it — this skill closes that blind spot. It is the **visual
QA layer**: screenshot the Astro site, compare against the production design
the users already know, and fix by adjusting **design-system tokens**, never
by sprinkling one-off CSS.

**Golden rule:** every fix maps to a `presetSite()` token
(`site.config.ts → brand`) or a UnoCSS utility/shortcut (`uno.config.ts`).
If you find yourself writing a bespoke `style="…"` or a scoped `<style>` rule
in a component, stop — the right home is almost always a brand token or a
shared shortcut, so the fix lands on every page at once.

---

## 0. Know the reference and the tokens

Concrete values (URLs, ports, palette, fonts, container width, key routes)
are **site data** — read them from the site repo, don't assume:

- **Design reference:** the production site (see the site repo's
  `SITE_CONFIG.md` / `.env`). This is the look users recognize — it is the
  target, warts and all.
- **Base under review:** the local Astro dev server (hot-reloads — leave it
  running; edits reflect on the next screenshot).
- **Brand tokens** — the single source of visual truth:
  - `astro/site.config.ts → brand`
    - `colors`: the brand palette slugs (e.g. `primary`, `accent`,
      `highlight`, `gray`). Content references these **slugs only**, never hex.
    - `fonts`: `heading` (display face) and `body`.
    - `containerWidth`: the production content width (DIVI: "Website
      Content Width", typically 1080px).
  - `astro/uno.config.ts → presetSite()` emits the `.has-{slug}-color` /
    `.has-{slug}-background-color` preflights, the `container` / `btn` /
    `card` / `heading` shortcuts, and merges the brand palette (plus any
    data-driven palettes, e.g. category badge colors, if the site has them).

Before reviewing, note any **known scoped-styles debt** — islands or
components that predate the design system and carry their own scoped styles.
Expect those to lag most; migrating them onto brand tokens is usually the
highest-value parity work.

---

## 1. Run visual-review (how)

From the site's Astro worktree:

```bash
just visual-review            # local base only, key routes
just visual-review-prod       # side-by-side vs production (use this for parity)
just visual-review-prod / /some-route        # override the route list
```

Recipes are thin wrappers over `bin/visual-review.mjs` (canonical copy:
`wp_template/bin/visual-review.mjs`; run it from wherever Playwright deps
resolve). The script screenshots each route full-page at **desktop 1440px**
and **mobile 390px**, for base and (with `--compare`) the reference, then
writes PNGs + a self-contained `index.html` contact sheet to
`visual-review/<timestamp>/`.

- **Open the contact sheet** (`index.html`) — labeled thumbnails, base vs
  compare columns per route/viewport, each linking to the full PNG.
- Playwright resolves from one node_modules (do **not** add a duplicate
  Playwright install to the Astro worktree if the WP repo already has one).
- Capture failures are recorded in the sheet as `FAILED`, never skipped — a
  route that 404s on production (e.g. an Astro-only path) shows a failed
  compare cell; that is expected, not a bug.
- Use the site's key-route list (homepage, main sections, one list page, one
  detail page, contact) — keep it in the site repo's Justfile recipe.

---

## 2. Compare per checklist

For each route, put base next to compare and walk this list. Note the gap and
the **token** it maps to — do not fix yet.

| # | Check | Look for | Maps to |
|---|-------|----------|---------|
| 1 | **Typography scale / fonts** | Body and display faces match production; heading sizes step down sensibly | `brand.fonts`, `heading` shortcut / prose scale |
| 2 | **Heading hierarchy** | H1 present and dominant, H2/H3 clearly ranked; page-title band vs plain H1 | `heading` shortcut, prose styles |
| 3 | **Brand colors** | Links, headings, accents and body text carry the correct palette slugs | `.has-{slug}-*`, brand color tokens — never raw hex |
| 4 | **Spacing rhythm** | Vertical rhythm between blocks, section padding, list spacing | preset spacing scale / shortcuts, not ad-hoc margins |
| 5 | **Container width** | Content centered within the configured `containerWidth`, consistent side gutters (not flush-left, not full-bleed) | `containerWidth` → `container` shortcut |
| 6 | **Tables** | Header band, row borders, padding, readable at mobile | shared table styles / prose table |
| 7 | **Badges / pills** | Rounded solid-color pills per palette (not highlighted text) | palette + badge shortcut |
| 8 | **Buttons** | Consistent shape/color/hover; real buttons not bare text links; no missing-glyph (tofu) icons | `btn` shortcut |
| 9 | **Island interactive states** | Filters, toggles, hover/active/focus states, action buttons | migrate island onto tokens (see debt note) |

Record the gaps found on each run as a starting map for the next one —
re-verify each entry every run rather than trusting it.

---

## 3. Map fixes to tokens (NOT ad-hoc CSS)

For every checklist gap, choose the token, not a patch:

- Wrong/absent font → `brand.fonts` (and confirm the face is actually loaded).
- Off-brand color → the palette **slug**, surfaced via `.has-{slug}-*` or a
  shortcut. If content carries WP default-palette leftovers
  (`has-black-color`, `has-pale-pink-…`), that is a content-normalization
  fix, not a styling one — flag it, don't hex-patch.
- Content not centered / wrong measure → the `container` shortcut driven by
  `containerWidth`. Apply at the layout/template, not per page.
- Badge/button/card/heading inconsistency → the corresponding `presetSite`
  shortcut; extend the shortcut once so the fix is global.
- Island-only visual → migrate the island's scoped styles onto the shortcuts
  above; delete the scoped rule as you replace it (retire the debt, don't
  grow it).

Only reach for a component-local style when a look is genuinely one-off and
has no reasonable token home — and note why.

---

## 4. Re-run and iterate

1. Edit tokens/shortcuts (dev server hot-reloads).
2. `just visual-review-prod <the routes you touched>` (scope to the changed
   routes for a fast loop).
3. Re-open the contact sheet; re-walk the checklist for those routes.
4. Repeat until the base column reads as the same design language as compare
   (not a pixel clone — production is builder-rendered; parity means
   brand-consistent typography, color, spacing, container, badges, buttons,
   island states).
5. When done, run the full key-route set once and keep the final contact
   sheet path in the task report.

**Boundaries:** this skill is styling only. Do not touch content
(`post_content*`), astro-core internals, plugins, or the WP DB — those are
separate workflows. Prefer the running dev server over rebuilds.

**Worked example:** the waldorf-brno.cz instance (the design-parity skill in
the `site_waldorf` repo) shows this skill filled in with concrete site data —
palette hexes, fonts, 1080px container, key routes, and the island-debt
starting map from the first run.
