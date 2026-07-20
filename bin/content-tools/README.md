# content-tools — shared WP → headless content-normalization toolkit

Reusable, Python-3-stdlib-only tools for normalizing a page-builder (DIVI)
WordPress site to the two canonical content formats consumed by the headless
Astro frontend:

- **Markdown** (GitHub-Flavored) — simple linear content, stored in
  `post_content_filtered`.
- **core Gutenberg blocks** — real layout (columns, accordions, tables,
  galleries), stored in `post_content`.

These tools were distilled from the ~15-agent waldorf-brno.cz conversion run
(2026-07-10) so that future site conversions **run tools and review output**
instead of every agent re-writing a DIVI parser / HTML→MD converter from
scratch. See `../../docs/CONTENT_NORMALIZATION_PLAYBOOK.md` for the full
phase-by-phase process; this directory is upgrades **#1 (shared toolkit)** and
**#2 (site-conversion config)** from that playbook.

Guiding rule: **content is content, formatting comes from site styles.**
Structure survives; per-element cosmetics (fonts, sizes, colors, spacing) are
dropped — the design system supplies all styling.

---

## The pipeline

```
                       content-conversion.config.json   (site-specific data)
                                     │
                                     ▼
  WP DB ──(gen-dump PHP,           ┌─────────────────┐
           wp eval-file)──────────▶│ content_inventory│──▶ conversion-manifest.json
                                   └─────────────────┘        (per-item target:
                                     │  markdown vs gutenberg)
              ┌──────────────────────┴───────────────────────┐
              ▼ target=markdown                               ▼ target=gutenberg
      ┌──────────────┐     ┌──────────┐              ┌──────────────┐
raw ─▶│ divi_extract │ ──▶ │ html2md  │ ──▶ .md      │ divi2blocks  │ ──▶ blocks
body  │ (strip chrome│ HTML│(GFM +    │  (post_       │ (core/* blocks│      │
      │  flatten)    │     │ fixes)   │   content_     │  normalized) │      ▼
      └──────────────┘     └──────────┘   filtered)   └──────────────┘  validate-blocks.php
                                                                         (parse_blocks gate)
              │                                                              │
              └───────────────────► apply to WP DB ◄─────────────────────────┘
                                     │
                                     ▼
                              just verify-content   (independent full-corpus sweep)
```

`inventory → extract → md / blocks → apply → verify`. The **apply** step (DB
writer) is a site-repo concern (`markdown_content_apply()`); the **verify**
step ships here (`verify-content.php`, `content-hallucination-check.php`,
run via `just verify-content` / `just verify-hallucinations`).

---

## Tools

| Tool | One-line description |
|---|---|
| `content_inventory.py` | Regenerate `conversion-manifest.json` from any WP DB: `gen-dump` prints a READ-ONLY PHP dump script; `build` classifies every item (engine + markdown/gutenberg target) into the canonical manifest schema. |
| `divi_extract.py` | Parse a DIVI shortcode tree, strip site chrome + repair corruption (per config), and emit cleaned HTML (front of the markdown path) or the raw shortcode tree as JSON. |
| `html2md.py` | HTML → GitHub-Flavored Markdown, with the batch agents' fixes: emphasis pairing across `<br>`/fragmented `<strong>`, whitespace moved out of `**`/`*`, ordinal escaping for date lines, empty-alt images preserved, tables, blockquotes, `<h1>`→`<h2>`. |
| `divi2blocks.py` | DIVI shortcode tree → normalized **core Gutenberg** block markup per the `divi-to-gutenberg` skill's normalization rules (structure kept, cosmetics dropped, palette-slug mapping for brand colors only, functional shortcodes verbatim, unknown modules → TODO marker + non-zero exit). |
| `validate-blocks.php` | Canonical `parse_blocks()` gate: 0 `BAD_freeform_with_content` and only allowed `core/*` (+ passthrough) blocks, else exit 1. Run via `wp eval-file` in the WP container. |
| `verify-content.php` | Full-corpus post-apply sweep: engine vs manifest target, DIVI residue (canonical + DB-wide), `parse_blocks` validity. Reads `inventory.expected_skips`/`post_types` from the config; exit 1 on any failure. Run via `just verify-content`. |
| `content-hallucination-check.php` | Corpus-wide hallucination check vs a pre-conversion snapshot DB (`verify_pre`): no converted item may contain words absent from its original. Run via `just verify-hallucinations` (see script header for snapshot setup). |
| `ct_common.py` | Shared library (config loader, tolerant DIVI shortcode-tree parser, chrome detection, shortcode-corruption repair, functional-shortcode allowlist, palette hex→slug). Imported by the tools; not a CLI. |

Every `.py` tool supports `--help`. All are Python 3 stdlib only (no pip
installs) and never touch the DB or network — the only DB access is the
READ-ONLY PHP dump you run yourself via `wp eval-file`.

---

## Configuration — `content-conversion.config.json`

Per-site **data** (not prose) consumed by every tool so the tools stay
site-agnostic. Full field docs: `content-conversion.config.schema.json`
(JSON Schema draft-07). Copy `content-conversion.config.example.json` to your
site root and fill in.

| Key | What it holds |
|---|---|
| `chrome.global_modules` | DIVI `global_module` ids that are chrome (breadcrumb band, footer nav). Empty ⇒ any global module is chrome. |
| `chrome.disabled_on_values` | `disabled_on` values meaning hidden-on-all-devices (`"on\|on\|on"`). |
| `chrome.breadcrumb_shortcodes` | Breadcrumb shortcode names dropped with their module. |
| `chrome.footer_text_signatures` | Literal text that uniquely identifies a footer section to drop. |
| `chrome.wave_divider_attrs` / `content_modules` | Wave/spacer detection: a section with only dividers and none of `content_modules` is dropped. |
| `functional_shortcode_allowlist` | Non-DIVI shortcodes that survive verbatim (prefix match: `pdf`→`[pdf-embedder]`, `cmplz`→`[cmplz-document]`). |
| `allowed_block_namespaces` | Extra non-core block namespaces legitimate in already-Gutenberg content. |
| `palette` | Brand color slug → hex. Callout colors map to the **nearest** slug only when a close shade; everything else is dropped. Content never emits hex. |
| `inventory.post_types` / `statuses` | Scope of the inventory (include custom types/statuses). |
| `inventory.curated_slugs` | Hand-authored pages → always markdown. |
| `inventory.expected_skips` | Post ids intentionally left unconverted (verification treats as expected). |
| `inventory.layout_modules` | DIVI modules whose presence forces the gutenberg target. |

The waldorf instance lives at
`/home/kerray/site_waldorf/content-conversion.config.json`. Tools resolve the
config via `--config`, `$CONTENT_CONVERSION_CONFIG`, or the nearest
`content-conversion.config.json` walking up from cwd; with none, built-in
generic defaults apply.

---

## Usage

### 1. Inventory (regenerate the manifest)

```bash
# print the READ-ONLY dump script and run it inside the WP container
python3 content_inventory.py gen-dump --config /path/content-conversion.config.json > /tmp/dump.php
docker compose cp /tmp/dump.php wordpress:/tmp/dump.php
docker compose exec -T wordpress wp eval-file /tmp/dump.php /tmp/ct-raw.json --allow-root
docker compose cp wordpress:/tmp/ct-raw.json /tmp/ct-raw.json

# classify offline → canonical conversion-manifest.json
python3 content_inventory.py build --raw /tmp/ct-raw.json \
    --config /path/content-conversion.config.json --out conversion-manifest.json
```

### 2. Markdown target (simple linear content)

```bash
# raw DIVI/GB/HTML body on stdin → clean GFM markdown for post_content_filtered
cat post-body.html | python3 divi_extract.py --config CFG | python3 html2md.py --config CFG
# divi_extract --list-dropped prints stripped-chrome notes to stderr
```

### 3. Gutenberg target (real layout)

```bash
cat page-body.html | python3 divi2blocks.py --config CFG > converted.html
# resolve gallery ids first if the page has [et_pb_gallery]:
#   --gallery-map map.json   where map.json = {"251": {"url": "...", "alt": "..."}}
# exit code 1 means an unknown module was hit → grep converted.html for "TODO:"
```

### 4. Validate blocks (gate before apply)

```bash
docker compose cp converted.html wordpress:/tmp/converted.html
docker compose cp validate-blocks.php wordpress:/tmp/validate-blocks.php
docker compose exec -T wordpress wp eval-file /tmp/validate-blocks.php /tmp/converted.html --allow-root
# RESULT: PASS (exit 0) → 0 BAD_freeform_with_content, only allowed core/* blocks
```

Agents should **run these tools and review the output**, then apply per the
site's `markdown_content_apply()` / block writer and confirm with
`just verify-content`. Preserve status/title/slug/dates — content only.

---

## Notes / known limits (things not fully portable from the scratch scripts)

- **Gallery id → URL resolution** needs the DB (`wp_get_attachment_image_url`).
  `divi2blocks.py` emits the gallery with `wp-image-<id>` and a `TODO:` marker
  for unresolved ids; pass `--gallery-map` (built from a small `wp eval` dump)
  to fill real URLs. The scratch GB agents hard-coded per-page resolvers — that
  is intentionally out of scope for a generic tool.
- **Palette callout mapping** is deliberately conservative: colors map to a slug
  only when within a tight RGB tolerance of a configured brand hex (applied to
  `et_pb_cta` / callout backgrounds). Inline author color spans are dropped, as
  the normalization rules require. The waldorf batch dropped essentially all
  color; do not expect rich color carry-over.
- **`divi2blocks` covers the common module set** (section/row/column/text/image/
  toggle/accordion/tabs/blurb/button/gallery/divider/cta/code). Anything else is
  salvaged as paragraphs behind a `TODO:` marker with a non-zero exit — review
  and extend `convert_module()` if a new site needs it.
- **`content_inventory` target classification** is meaningful on a *fresh* DIVI
  DB (module analysis reproduces the multi-column/layout-module forcing). On an
  *already-converted* DB it simply confirms the current engine state (that is the
  waldorf regression check: it runs cleanly and detects markdown/gutenberg).
