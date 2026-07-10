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

### 1. Shared conversion toolkit (highest leverage)
Every conversion agent wrote its own DIVI parser / HTML→MD converter from
scratch (10 agents ≈ 10 converters). Extract the best of the batch scripts
into `wp_template/bin/content-tools/`:
- `divi-extract` — shortcode-tree parser, chrome stripping (configurable
  signatures), texturize/corruption repair (span-corrupted shortcode attrs,
  bold-across-`<br>`, split words)
- `html2md` — the emphasis-pairing HTML→GFM converter (POSTS-B/A agents'
  version was best), ordinal-escaping for `1. 2. 3.` date lines
- `block-validate` — the parse_blocks gate (exists:
  `divi-to-gutenberg/references/validate-blocks.php`)
- `content-inventory` — regenerate the manifest from any WP DB (the waldorf
  inventory script lived only in agent scratch — rebuild it as a tool)
Agents should RUN tools and review output, not reinvent them.

### 2. Site-conversion config (generalization)
Chrome signatures are site-specific (waldorf: `global_module="302"`
breadcrumbs, `"376"` footer, wave dividers, `disabled_on="on|on|on"`,
breadcrumb shortcodes). Make them data, not prose: a
`content-conversion.config.json` per site (chrome module IDs, functional
shortcode allowlist, palette slug map, expected skips) consumed by both the
tools and the skill. The skill then becomes site-agnostic.

### 3. Writer hardening (bugs found post-hoc)
- `markdown_content_apply()` should itself: set `_headless_engine=markdown`
  when the markdown body is empty (was handled inconsistently), flip
  `_et_pb_use_builder` off (260 items missed it — fixed manually), and
  guard against `wp_update_post` auto-publishing past-dated `future` posts.
- Batch drivers must use unique per-agent tmp paths inside the container
  (two agents collided on `/tmp/apply.php`).

### 4. Visual QA layer (the current blind spot)
We verified text and structure to zero-loss, but never pixels — hence
`/kalendar` styles lagging. Add:
- `just visual-review [routes...]` — Playwright screenshot crawl of key
  routes on the Astro dev/build, contact-sheet output for human review,
  optionally side-by-side with production URLs.
- A design-parity checklist skill: per-template comparison against
  production (spacing, headings, badges, tables, islands), driven by the
  presetSite tokens.

### 5. Palette slugs end-to-end
Slugs (`primary`/`accent`/`highlight`/`gray`) are policy but not yet
machine-registered: add (a) a WP-side editor palette (theme.json or filter)
so Gutenberg shows the brand colors, (b) `presetSite()` preflights for
`.has-{slug}-color` / `.has-{slug}-background-color` so palette-mapped
callouts actually render in Astro.

### 6. Retire dual sources of truth
Curated local markdown (`astro/src/content/pages/*.md`) is now duplicated in
the DB (applied 1:1). Keep the local-wins precedence only until parity is
eyeballed, then delete the local files — the DB must be the single source or
they WILL drift.

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

### 9. Deployment gate (site-specific, critical)
A normalized DB must never reach production while production still renders
through the old builder theme — heroes/layout vanish. The DB goes live
together with the frontend switch. Encode this as a check in any deploy
recipe (refuse `db push` if the production theme is still the builder).
