# Content Normalization Playbook (WP → headless Astro)

How to take a page-builder WordPress site (DIVI or similar) and normalize ALL
its content to two canonical formats in the WP database — **Markdown** for
simple linear content, **core Gutenberg blocks** for real layout — served
headlessly to an Astro frontend. Codified from the waldorf-brno.cz run
(2026-07-10, 424 items, ~15 parallel agents; see
`site_waldorf_astro/content/conversion-logs/` for the ground truth).

Philosophy: **content is content, formatting comes from site styles.**
Structure survives (columns, accordions, tables, galleries); per-element
cosmetics (fonts, sizes, colors, spacing) are dropped — the design system
(UnoCSS `presetSite()` brand tokens) supplies all styling.

---

## The process, phase by phase

### Phase 0 — Foundations (once per site)
1. Brand tokens centralized in `astro/site.config.ts` (`brand.colors`,
   `brand.fonts`, `containerWidth`) → `presetSite()` in `uno.config.ts`.
2. Decide the palette slugs content may reference (waldorf:
   `primary`/`accent`/`highlight`/`gray`). Content never uses hex.
3. Working local Docker WP mirroring production, DB snapshot ability.

### Phase 1 — Contracts and tooling (parallelizable, 4 agents)
1. **Inventory** every item (all post types incl. custom, all statuses):
   detect current engine, extract complexity signals, classify target
   (`markdown` vs `gutenberg`), flag stubs/curated/functional shortcodes.
   Output: `conversion-manifest.json` — the single source of truth for
   everything downstream.
2. **Backend**: `markdown-content` plugin (markdown canonical in
   `post_content_filtered`, Parsedown HTML cache in `post_content`,
   `markdown_content_apply()` writer) + headless API `engine`/`raw` fields.
   Detection order: `_headless_engine` meta override → markdown source →
   `<!-- wp:` → builder shortcode marker → `html`.
3. **Conversion skill**: one authoritative skill (waldorf:
   `.claude/skills/divi-to-gutenberg/`) holding ALL policy decisions
   (RESOLVED, never re-decided per page), the DROP list, chrome signatures,
   validation gate.
4. **Frontend**: per-item engine resolution in astro-core
   (`resolveEngine` → `getAdapter(engine)` → ContentNode IR →
   ContentRenderer). `contentEngine` in site config is only a fallback hint.

**Key move: fix the API contract (`engine` + `raw` + detection order) BEFORE
launching the backend and frontend agents — they then work in parallel and
meet in the middle.**

### Phase 2 — Mass conversion (fan-out)
- Deterministic manifest slices per agent (sort by ID, chunk). ~23 complex
  pages or ~65 simple posts per agent worked well.
- Every agent: script-assisted bulk conversion + personal review of every
  output + mandatory per-item QA gate:
  (a) block-validate PASS / markdown applied, (b) engine detection flipped,
  (c) zero builder-shortcode residue, (d) >10% text-loss flagged, never
  silently accepted.
- Per-batch logs in `content/conversion-logs/` (id, slug, result, chrome
  dropped, repairs).
- **DB snapshot immediately before the first write.** Preserve
  status/title/slug/dates — content only.

### Phase 3 — Independent verification (do NOT trust batch self-reports)
- `just verify-content`: full-corpus sweep — engine vs target, residue,
  `parse_blocks` validity (bin/verify-content.php in the site repo).
- **Hallucination check** (bin/content-hallucination-check.php): import the
  pre-conversion snapshot into a sibling DB, verify no converted item
  contains words absent from its original. Benign flag classes: curated
  content, documented transforms, image alt text.
- Frontend build + typecheck + spot-check rendered HTML per engine.
- Site test suite (update stale builder-era selectors deliberately, don't
  fudge them).

---

## Lessons → upgrades needed before the next site

### 1. Shared conversion toolkit (highest leverage) — ✅ DONE
Built at **`wp_template/bin/content-tools/`** (Python 3 stdlib only, each a CLI
with `--help`; see that dir's `README.md` for the pipeline diagram + usage).
Distilled from the best waldorf batch scripts:
- `divi_extract.py` — DIVI shortcode-tree parser (`--format html|json`), chrome
  stripping (configurable signatures), corruption repair (span-corrupted
  shortcode attrs `[akce <span>x</span>=""]`, curly/texturized quotes,
  content_tablet dupes).
- `html2md.py` — the emphasis-pairing HTML→GFM converter (POSTS-A/B version):
  emphasis closed/reopened across `<br>` & fragmented `<strong>`, whitespace
  moved out of `**`/`*`, ordinal-escaping for `2. 4. 2026` date lines, empty-alt
  images preserved, tables/blockquotes, `<h1>`→`<h2>`.
- `divi2blocks.py` — DIVI tree → normalized core Gutenberg per the skill's
  normalization rules (section/row/column/text/image/toggle/accordion/tabs/
  blurb/button/gallery/divider/cta/code; palette-slug mapping for brand colors
  only; functional shortcodes verbatim; unknown modules → TODO marker + non-zero
  exit).
- `validate-blocks.php` — the `parse_blocks()` gate. **Canonical copy now lives
  here**; `divi-to-gutenberg/references/validate-blocks.php` is kept in sync for
  skill self-containment (noted in that skill's SKILL.md).
- `content_inventory.py` — regenerate the manifest from any WP DB (`gen-dump`
  READ-ONLY PHP dump + offline `build` classifier). Rebuilt from the
  scratch-only waldorf inventory script.
- `ct_common.py` — shared lib (config, DIVI parser, chrome detection, shortcode
  repair, palette hex→slug).

Validated on the waldorf batch: 45/45 real DIVI pages → `divi2blocks` PASS the
block validator (0 unknown modules); markdown pipeline reproduces the
ordinal/emphasis/shortcode-repair fixes; `content_inventory` runs cleanly
against the converted DB (425 items, engines markdown/gutenberg, matching
`just verify-content`). Agents should RUN these tools and review output, not
reinvent them.

### 2. Site-conversion config (generalization) — ✅ DONE
Chrome signatures et al. are now **data, not prose**:
`content-conversion.config.json` per site, consumed by every tool (and available
to the skill). Schema + documented example ship in the toolkit
(`content-conversion.config.schema.json`,
`content-conversion.config.example.json`); the real waldorf instance is at
`site_waldorf/content-conversion.config.json` (chrome global_module 302/376,
`disabled_on="on|on|on"`, `[wpseo_breadcrumb]`/`[yoast-breadcrumb]`, allowlist
`[akce]`/`[kalendar]`/`[pdfjs-viewer]`/complianz, palette
primary #2d2864 / accent #973528 / highlight #f0d118 / gray #666666, types
page/post/akce). The tools are now site-agnostic; only the config changes per
site.

### 3. Writer hardening (bugs found post-hoc) — DONE
- ✅ `markdown_content_apply()` now itself: sets `_headless_engine=markdown`
  when the markdown body is empty (and removes that override again once a
  non-empty body is applied and natural detection works), flips
  `_et_pb_use_builder` off when it is 'on' (260 items missed it — fixed
  manually), and preserves `post_status` (captures it before the write and
  restores it via direct `$wpdb` if `wp_update_post` auto-published a
  past-dated `future` post). All three guards are documented inline in the
  plugin and in `site_waldorf/docs/MARKDOWN_BACKEND.md` (§4), and verified on
  the live local WP.
- ✅ The canonical plugin now lives at
  `wp_template/astro-core/wp/plugins/markdown-content/` (byte-identical to the
  site copy; mirrored manually since `sync_to_sites.sh` skips site `src/`).
- ✅ MARKDOWN_BACKEND.md §4 documents unique per-run tmp paths
  (`/tmp/mdapply-$$-$RANDOM` or a caller-supplied dir + `rm -rf` cleanup) so
  parallel agents no longer collide on `/tmp/apply.php`.

### 4. Visual QA layer (the former blind spot) — ✅ DONE (waldorf, 2026-07-10)
We verified text and structure to zero-loss, but never pixels — hence
`/kalendar` styles lagging. Now built:
- **`visual-review.mjs`** — site-agnostic Node+Playwright screenshot crawl.
  Canonical: `wp_template/bin/visual-review.mjs`; byte-identical working copy
  at `site_waldorf/bin/visual-review.mjs` (runs where Playwright deps resolve —
  Playwright is installed once in `site_waldorf/node_modules`, browsers cached
  globally; the Astro worktree adds no duplicate). Takes `--base` (default
  `http://localhost:4325`), optional `--compare` (e.g. `https://waldorf-brno.cz`),
  routes as args or `--routes <file>`, `--out <dir>` (default
  `visual-review/<timestamp>/`). Screenshots each route full-page at desktop
  **1440px** and mobile **390px**; emits PNGs + a self-contained `index.html`
  contact sheet (labeled thumbnails → full images; base-vs-compare columns when
  `--compare` is set). Capture failures are recorded in the sheet, never
  silently skipped (a route that 404s on production shows a FAILED compare cell).
- **Justfile recipes** (`site_waldorf_astro/Justfile`): `visual-review *routes`
  and `visual-review-prod *routes` (adds `--compare` production). Thin wrappers;
  default to the key-route set (`/`, `/kalendar`, `/materska-skola`,
  `/zakladni-skola`, `/skolni-druzina`, `/waldorfska-pedagogika`, `/archiv-akci`,
  one event single, `/kontakty`) via a `key_routes` Justfile var.
- **`design-parity` skill** (`site_waldorf/.claude/skills/design-parity/`) —
  checklist-driven workflow (typography, heading hierarchy, brand colors,
  spacing, container width 1080px, tables, category badges, buttons, island
  interactive states). Every fix maps to a `presetSite` token / UnoCSS shortcut,
  NOT ad-hoc CSS. Documents the Kalendar scoped-styles debt (island predates the
  design system). Auto-triggers on styling/design-parity/visual-review work.
- **First run (2026-07-10)** captured all 9 key routes ×2 viewports ×(base+prod)
  = 36 PNGs, zero failures. Top gaps surfaced for the design pass: (1) Astro
  pages lack production's watercolor hero/title band; (2) content not centered in
  the 1080px container (Kalendar page has no container — flush-left full-bleed);
  (3) Kalendar filters collapsed vs expanded + category filters not rendered as
  colored pills; (4) in-table category badges render like selection-highlighted
  text instead of rounded pills; (5) iCal control shows a tofu/missing glyph
  instead of a styled button. These feed the upcoming (separate) design pass.

### 5. Palette slugs end-to-end — DONE
Slugs (`primary`/`accent`/`highlight`/`gray`) are now machine-registered on
both ends:
- **WP editor palette**: generic `brand-palette.php` mu-plugin (canonical in
  `astro-core/wp/mu-plugins/`, byte-mirrored into each site's
  `wp-content/mu-plugins/`) registers `add_theme_support('editor-color-palette',
  …)` + `disable-custom-colors` on `after_setup_theme` (priority 11, so it wins
  over the active theme). Colors come from a site extension via the
  `headless_brand_palette` filter (or a `HEADLESS_BRAND_PALETTE` constant
  fallback); waldorf supplies the four colors with Czech labels in
  `brand-palette-site.php`. Editors now only pick brand slugs → only
  `.has-{slug}-*` classes are ever produced.
- **Astro preflights**: `presetSite()` emits, for EVERY `brand.colors` key,
  `.has-{slug}-color { color }` and `.has-{slug}-background-color {
  background-color; padding; radius }` (callout), plus `.has-text-align-*`
  helpers (WP core's palette/alignment stylesheets are absent in the headless
  build). Asserted by `astro-core/tests/preset.test.ts`.

Caveat surfaced during the waldorf run: the converted DB does **not** yet use
brand slugs — inline colors are the WP *default*-palette leftovers
(`has-black-color`, `has-pale-pink-color`, `has-vivid-cyan-blue-color`), so they
fall outside the brand-key preflights. Re-normalize those to brand slugs during
content cleanup (out of scope for the registration work). `has-text-align-*`
(both center + left, ~209 each) is covered.

### 6. Retire dual sources of truth — ✅ DONE (waldorf, 2026-07-10)
Curated local markdown (`astro/src/content/pages/*.md`) was duplicated in the
DB (applied 1:1). Keep the local-wins precedence only until parity is eyeballed,
then delete the local files — the DB must be the single source or they WILL
drift.

**Outcome (waldorf):** all 15 curated files retired. Evidence-driven:
- Frontmatter audit — the catch-all `[...slug].astro` consumes only `title`
  (→ `<h1>` + `<title>`) and `wpSlug` (→ route) from frontmatter; `wpId`/`source`
  are traceability, `draft` is curated-only. The template never passes a per-page
  `description`, so meta descriptions come from the global `SITE.description` for
  BOTH paths — there is no per-page SEO in frontmatter. The raw feed supplies a
  matching `title` and `slug` for every one of the 15 wpIds. **Nothing needed
  migrating into WP** (no post_excerpt/meta writes).
- Verified all 15 bodies byte-identical between the `.md` files and the DB raw
  feed (`post_content_filtered`), deleted the files, removed the now-dead `pages`
  collection + curated branch from `content.config.ts` / `[...slug].astro`, and
  rebuilt. Page count unchanged (248), `astro check` 0 errors. Rendered-HTML diff
  of the 15 slugs vs the pre-deletion baseline: title/description/headings/links/
  images/visible-text all preserved. Only differences were acceptable renderer
  nuances — one inline image URL absolute→root-relative (same file, the IR
  adapter's standard rewrite already applied to all WP pages), a SmartyPants
  ellipsis (`…` vs `...`), and the ContentRenderer design system taking over
  `<h2>`/prose wrapping (the intended end state, zero content loss).
- **Gotcha:** deleting the `.md` files alone did NOT flip rendering — Astro's
  content-layer cache still served the deleted `pages` entries, so the build
  looked byte-identical (false pass). Removing the collection from
  `content.config.ts` is what actually retires the local-wins layer. Verify
  retirement by editing the collection wiring, not just by emptying the folder.
- Documented the single-source rule in `astro/README.md`.

### 7. Dynamic module policy
Builder modules with no static equivalent (DIVI `et_pb_blog` latest-posts
feeds) need a documented mapping per site: island component, shortcode, or
drop. Waldorf: homepage feed dropped from content; Astro homepage renders
its own news cards.

### 8. Template plumbing already fixed here (keep)
- Justfile: Make-style `$$` is a bug in `just` (expands to shell PID) — fixed
  in both waldorf and wp_template. Container detection now uses
  `docker compose ps --status running --services`.
- `sync_to_sites.sh` does NOT sync `src/` (WP plugins) — mu-plugin changes
  must be mirrored explicitly; keep the canonical generic copy in
  `astro-core/wp/mu-plugins/` and byte-diff site copies in CI or a
  `just sync-check`.

### 9. Deployment gate (site-specific, critical) — ✅ DONE (waldorf, 2026-07-10)
A normalized DB must never reach production while production still renders
through the old builder theme — heroes/layout vanish. The DB goes live
together with the frontend switch. Encode this as a check in any deploy
recipe (refuse `db push` if the production theme is still the builder).

**Outcome (waldorf):** added a standalone `deploy-guard` recipe to
`site_waldorf/Justfile`. It `curl`s `https://waldorf-brno.cz` and fails loudly
(exit 1) if the HTML still contains DIVI markers (`et_pb_` shortcodes or the
`/themes/Divi/` asset path). No DB-/content-push-to-production recipe exists
today (the `ftp-sync*` recipes only PULL prod→local), so the guard is standalone;
the Justfile header comment now mandates that any future `db-push`/`content-push`/
reverse-`ftp-push` recipe declare `deploy-guard` as its first dependency
(`my-push: deploy-guard`). Verified: with production still on DIVI the guard
aborts as intended.
- **Gotcha:** `echo "$HTML" | grep -q PATTERN` under `set -o pipefail` misreports
  a real match as "no match" — `grep -q` exits on first hit and SIGPIPEs the
  upstream `echo`, and pipefail propagates that as pipeline failure. Use a
  here-string (`grep -Eq PATTERN <<< "$HTML"`) instead of a pipe.
