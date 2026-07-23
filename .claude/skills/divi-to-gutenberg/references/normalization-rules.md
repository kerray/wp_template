# Normalization rules — DIVI → core Gutenberg

Authoritative policy for the `divi-to-gutenberg` skill. The guiding rule:
**preserve structure, strip cosmetics.** Where a DIVI attribute is purely
presentational, it is DROPPED — the theme/design system supplies it.

Site-specific values (palette slugs/hexes, chrome global-module ids,
functional shortcodes, curated slugs) live in the site's
`content-conversion.config.json` — this document states the policy; the
config supplies the data. `bin/content-tools/divi2blocks.py` implements both.

This is deliberately the *opposite* of a preserve-everything conversion
matrix, which maps every DIVI style to a CSS/attribute equivalent. Use such
docs only to understand what a DIVI attribute *means*; use the tables below to
decide whether to keep it (mostly: no).

---

## 1. Module → block mapping

| DIVI module | Core block | Attributes that CARRY OVER | Everything else → DROP |
|---|---|---|---|
| `et_pb_section` | *(usually nothing)* — emit its rows directly. Only wrap in `core/group` if the section is a **deliberate callout** (meaningful bg/box). | `anchor` from `module_id` (only if referenced by an in-page link); `align:"full"` if the section is genuinely full-bleed content | background image, dividers, parallax, `custom_padding/margin`, shadows, `_builder_version`, `global_colors_info`, `fb_built` |
| `et_pb_row` | `core/columns` (omit entirely if single `4_4` column — just emit the column's content at top level) | column count is implied by children | `gutter_width`, `make_equal`, `custom_padding/margin`, `border_*`, backgrounds |
| `et_pb_row_inner` | nested `core/columns` | as above | as above |
| `et_pb_column` | `core/column` with `width` (see §3). Omit the wrapper for a lone `4_4`. | `width` (from `type`) | backgrounds, padding, margin, `module_class`, `custom_padding__hover` |
| `et_pb_text` | split inner HTML into `core/heading` + `core/paragraph` + `core/list` + `core/image` (see §5) | heading level, `align`/`textAlign`, list ordering, link `href` | ALL `text_*`, `header_*`, fonts, sizes, colors, shadows, `custom_margin/padding`, `width` |
| `et_pb_image` | `core/image` | `url`(src), `alt`, `id` (from `wp-image-NNN` class), `href` (from `url`), `linkTarget` (from `url_new_window`), `align` | `image_max_width`, `border_radii`, `box_shadow_*`, `custom_margin`, animation, `title_text` |
| `et_pb_gallery` | `core/gallery` with nested `core/image` (resolve `gallery_ids` → URLs, see §6) | image ids/urls/alt; `linkTo` from `show_in_lightbox` | `custom_margin`, `posts_number` (unless it truly limits), `show_title_and_caption` cosmetics |
| `et_pb_button` | `core/buttons` > `core/button` | `text`, `url`, `linkTarget` | ALL button colors, fonts, sizes, borders, padding, hover states |
| `et_pb_blurb` (with url, no image) | in-body card: `core/group` > linked `core/heading` (+ `core/paragraph` if body). **End-of-page link-grids: see §8a** (plain `core/list` of links, or `core/buttons` for 1–3 CTAs, or drop). | title text + `url` → link; body → paragraph. **Never infer/guess a URL** — no `url` in the source means no link in the output. | icon, all styling, shadows, borders, bg, `header_level` cosmetics (keep as h3/h4 by nesting depth) |
| `et_pb_blurb` (with image) | `core/media-text` (image + heading + paragraph) or `core/group` | `mediaId`/`mediaUrl`, `mediaPosition` (left/right/top only if meaningful), title, body | styling as above |
| `et_pb_toggle` | `core/details` (`summary` = title) | title, inner content | `open` state styling; keep `open` only if intentionally expanded |
| `et_pb_accordion` | a **stack** of `core/details` (one per `et_pb_accordion_item`) | each item title → `summary`; `open="on"` → `{"showContent":true}` + `<details open>` | all accordion styling, `_module_preset`, icons |
| `et_pb_accordion_item` | one `core/details` | title, content | styling |
| `et_pb_tabs` / `et_pb_tab` | **no native core block — POLICY:** stack of `core/details`, **all closed** (do NOT open the first tab; leave `showContent` unset on every one, same as the rest). Exception: if tab bodies are purely functional shortcodes (events lists, pdf viewers), pass the shortcodes through as `core/shortcode` blocks and **drop the tab chrome entirely**. | tab titles → summaries; tab content | tab styling, active colors, the tab UI itself when content is functional |
| `et_pb_divider` | `core/separator` **only if** it is a real content rule; if it is DIVI spacer/decoration → DROP | — | color, height, style |
| `et_pb_cta` | `core/group` (heading + paragraph + `core/buttons`) — a callout | heading, body, button | styling |
| `et_pb_slider` / `et_pb_slide` | rare. If encountered: `core/gallery`, or `core/cover` per slide, or flatten to stacked image+text. Flag for human decision. | slide image, heading, text, button | transitions, styling |
| `et_pb_blog` | `core/query` — or, if a functional shortcode on the site already covers the same listing (e.g. an events shortcode), prefer passthrough. | query params | styling |
| `et_pb_code` / raw embed | `core/html` (last resort) or `core/embed` for oEmbed URLs | the code/URL | — |
| Tables in `et_pb_text` | `core/table` | rows/cells, header row | inline cell styles, widths |

**Heading level policy (POLICY):** the frontend template owns the page `<h1>`.
**Demote any body `<h1>` to `<h2>`** during conversion. Shift deeper levels only
if needed to keep the hierarchy sane (no strict no-skipping enforcement beyond
that). Otherwise take the level from the actual HTML tag inside `et_pb_text`
(`<h2>` → level 2); do **not** infer level from DIVI font size.

**Text casing (POLICY):** leave ALL-CAPS titles and any other casing verbatim.
Casing is editorial, not normalization.

---

## 2. The DROP list (never carry these into output)

Drop unconditionally — these are cosmetic or DIVI bookkeeping:

- **Typography:** `*_font`, `*_font_size`, `*_letter_spacing`, `*_line_height`,
  `*_text_align` on the *module* (keep alignment only as a block attr when it is
  a real choice, e.g. a centered hero/heading), `text-transform`.
- **Colors:** `*_text_color`, `background_color`, `*_color`, inline
  `style="color:#…"` / `<span style="color:…">`, `background` gradients — UNLESS
  the color marks a deliberate callout box; then map to a **named palette slug**
  (see §7), never a hex.
- **Spacing:** `custom_padding`, `custom_margin` (+ `_tablet`/`_phone`/`__hover`
  variants), `gutter_width`, `min_height`, negative margins.
- **Borders/effects:** `border_radii`, `border_width_all`, `border_color_all`,
  `box_shadow_*`, `text_text_shadow_*`, `inner_shadow`.
- **Section decoration:** `background_image`, `top_/bottom_divider_*` (waves),
  `parallax*`.
- **Animation/interaction:** `animation*`, `hover_enabled`, `sticky_enabled`,
  `*__hover`, `_module_preset`, `sticky_*`.
- **DIVI bookkeeping:** `_builder_version`, `fb_built`, `global_colors_info`,
  `locked`, `saved_tabs`, `admin_label`, `theme_builder_area`, `disabled_on`,
  `template_type`.
- **Custom CSS / classes:** `module_class`, `module_id` (keep as `anchor` only
  if an in-page link targets it), custom CSS fields — dropped; the design system
  owns all styling.
- **Responsive variants** (`_tablet`, `_phone`, `_last_edited`) — dropped
  entirely; responsiveness is a theme concern.

### DROP whole modules/sections that are chrome, not content

Page-builder sites repeat chrome on **every** page; remove it before
conversion. The site config's `chrome.*` keys hold the signatures
(`global_modules`, `breadcrumb_shortcodes`, `footer_text_signatures`,
`wave_divider_attrs`, `disabled_on_values`):

1. **Global modules** — any element with `global_module="…"` /
   `saved_tabs="all"` matching `chrome.global_modules` (with an empty list, ANY
   global module is chrome). Typical: a breadcrumb band (rendered by the
   frontend instead), a footer nav (theme-owned). *Waldorf example:
   `global_module="302"` breadcrumb, `"376"` footer nav.*
2. **Disabled modules** — `disabled_on="on|on|on"` (hidden on all devices).
   DROP.
3. **Spacer/empty sections** — a `[et_pb_section]…[/et_pb_section]` containing
   only wave dividers and no rows/content. DROP.
4. **Filler content** — empty `<h3></h3>`, `<big></big>`, and runs of
   `<p>&nbsp;</p>` used purely for vertical spacing. DROP.
5. **Hero band styling** — the top hero section's background image, shadows,
   rounded borders, letter-spacing etc. are dropped; keep only the hero's
   heading text (as `core/heading`, centered if it was a centered title).

---

## 3. Column-structure mapping

DIVI `et_pb_column type="N_D"` → `core/column {"width":"X%"}`. A row of columns
becomes one `core/columns` with each child carrying its width.

| DIVI `type` | `core/column` width |
|---|---|
| `4_4` | (single column — omit `core/columns`; emit content directly) |
| `1_2` | `50%` |
| `1_3` | `33.33%` |
| `2_3` | `66.67%` |
| `1_4` | `25%` |
| `3_4` | `75%` |
| `1_5` | `20%` |
| `2_5` | `40%` |
| `3_5` | `60%` |
| `4_5` | `80%` |
| `1_6` | `16.67%` |

`column_structure="1_3,1_3,1_3"` on the row is just the ordered list of child
widths — trust the children's `type`. Equal-width rows (`1_3,1_3,1_3`,
`1_2,1_2`, `1_4,1_4,1_4,1_4`) may omit per-column `width` entirely and let
`core/columns` distribute evenly; keep explicit widths only for uneven splits
(`1_3,2_3`).

---

## 4. Alignment & width — the few attributes worth keeping

- Centered hero title / intentionally-centered heading or paragraph →
  `{"textAlign":"center"}` (heading) / `{"align":"center"}` (paragraph),
  serialized with `has-text-align-center`. Do **not** keep center alignment that
  was only there because DIVI centered a whole module by default — judge intent.
- Full-bleed content (rare, real edge-to-edge media) → `{"align":"full"}`;
  wide → `{"align":"wide"}`. Most sections are neither — leave unset.
- Lists: preserve `<ul>`/`<ol>` and ordered/`start`/`reversed` semantics in
  `core/list`.

---

## 5. Inner-HTML normalization (inside `et_pb_text`, toggles, tabs)

DIVI stores wpautop'd, texturized HTML inside text modules. Normalize it:

1. **Split into blocks.** Each top-level `<h1..6>` → `core/heading`; each `<p>`
   → `core/paragraph`; `<ul>/<ol>` → `core/list`; `<table>` → `core/table`;
   `<img>` → `core/image` (pull it out of any wrapping `<p>`); `<blockquote>` →
   `core/quote`.
2. **`<div>` used as a paragraph** (DIVI/legacy emits `<div>…text…</div>` where a
   `<p>` belongs) → treat as `core/paragraph`. Unwrap nested `<div>` soup so each
   text run becomes its own paragraph.
3. **Legacy toggle wrappers** — strip `<h5 class="et_pb_toggle_title">…</h5>` and
   `<div class="et_pb_toggle_content clearfix">…</div>` leftovers: promote the
   title to the `core/details` summary (or a heading) and unwrap the content div
   into paragraphs.
4. **Drop inline color spans** — `<span style="color:#000080">X</span>` → `X`
   (keep the text). Keep semantic inline tags: `<strong>`, `<em>`, `<a href>`,
   `<br>`, `<sub>`, `<sup>`. Drop `<span style="font-size:…">`, empty `<span> </span>`
   (collapse to a normal space), `style=`/`class=` on any kept tag.
5. **Drop empty/filler** — `<h3></h3>`, `<big></big>`, `<p>&nbsp;</p>`,
   trailing `&nbsp;`.
6. **Texturize / encoding quirks:**
   - Curly quotes/entities inside attribute strings and shortcodes should be
     normalized back to straight quotes so shortcodes parse
     (`&#8221;` / `”` → `"`).
   - **`<span>`-wrapped shortcode attribute names** — the DIVI editor sometimes
     corrupts a shortcode inside a `<p>` (waldorf example:
     `[akce <span>category</span>="" pocet="5"]` → repair to
     `[akce category="" pocet="5"]`) — strip the injected `<span>`/`</span>`
     around attribute names and values before emitting it as a passthrough
     shortcode.
   - A shortcode wrapped in `<p>…</p>` (e.g. `<p>[events …]</p>`) → emit the
     bare shortcode in a `core/shortcode` block, not a paragraph.
7. **Whitespace** — collapse the runs of `<span> </span>` word-separators DIVI
   inserts into single spaces; trim.

---

## 6. Galleries — resolving `gallery_ids`

`[et_pb_gallery gallery_ids="251,252,…"]` carries only attachment IDs. Resolve
each to a URL/alt (read-only) and emit `core/gallery` with nested `core/image`:

```bash
docker compose exec -T wordpress wp eval '
foreach ([251,252,253] as $id) {
  echo $id.": ".wp_get_attachment_image_url($id,"full").
       " | alt=".get_post_meta($id,"_wp_attachment_image_alt",true)."\n";
}' --allow-root
```

Serialize (WP 6.x nested-image gallery, `is-cropped` matches editor default):

```html
<!-- wp:gallery {"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-default is-cropped">
<!-- wp:image {"id":251,"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="…/example.jpg" alt="" class="wp-image-251"/></figure>
<!-- /wp:image -->
…one nested core/image per id…
</figure>
<!-- /wp:gallery -->
```

**Image host (POLICY):** keep image URLs **exactly as stored in the DB today**
— do not rewrite hosts during conversion (production domain, bare host, or
`localhost:8080` alike). The headless frontend's `ImageNode` already handles
WP-URL rewriting at render time. When *resolving* `gallery_ids` locally, the
resolved URL will carry the local host — that is the URL "as stored" for this
environment and is fine to emit as-is.

---

## 7. Callout colors → named palette slugs (the ONLY colors kept) — POLICY

Drop every text/background color unless it marks a **deliberate callout** (an
info box, a warning, a highlighted CTA — not just an author's font-color whim).
When kept, map to a named slug via `backgroundColor`/`textColor` block attrs —
**never** inline hex.

The palette is the site's semantic brand tokens — `palette` in
`content-conversion.config.json`, mirroring `brand.colors` in the Astro
`site.config.ts`. Serialization: `{"backgroundColor":"<slug>"}` →
`has-<slug>-background-color has-background`; `{"textColor":"<slug>"}` →
`has-<slug>-color has-text-color`.

*Waldorf example palette:* `primary` #2d2864 (brand purple), `accent` #973528
(rust — links/event titles), `highlight` #f0d118 (gold — active accents),
`gray` #666666 (body text).

**Mapping rule:** a callout color maps to the *nearest* configured slug ONLY
when the original was clearly one of the brand colors or a close shade of one.
**Anything else is dropped** — including:

- white/contrast hero text (cosmetic, drop),
- inline author emphasis colors like `#000080` / `#800000` (drop, keep the text),
- arbitrary grays/pastels that aren't the brand tokens (drop).

Real callouts are rare; most color is decorative and should simply disappear.

---

## 8. Verbatim shortcode passthrough

Functional shortcodes are **content the plugins render**, not styling. Emit them
unchanged inside a `core/shortcode` block. Never convert, wrap in styling, or
restyle them. The site config's `functional_shortcode_allowlist` names them
(prefix match).

Pass through verbatim (after repairing any texturize corruption per §5.6):

- events/calendar shortcodes (e.g. `[akce …]`, `[kalendar …]` on waldorf),
- breadcrumb shortcodes (`[wpseo_breadcrumb]` / `[yoast-breadcrumb]`) — **but**
  these usually only appear inside the dropped global breadcrumb module; if
  you're dropping that module, they go with it. Keep them only if a page uses a
  breadcrumb as real inline content (rare),
- pdf viewer shortcodes (`[pdfjs-viewer …]`, `[pdf-embedder …]`), contact forms
  (`[contact-form-7 …]`, `[wpforms …]`), `[gallery ids="…"]` (classic gallery
  shortcode), any `[…]` from an installed plugin.

Waldorf example:

```html
<!-- wp:shortcode -->
[akce category="" pocet="5" wrapper="ol" image_size="thumbnail"]
<!-- /wp:shortcode -->
```

Rule of thumb: **if a bracket token is produced by a plugin (not DIVI's
`et_pb_*`), it survives verbatim.** Only `et_pb_*` shortcodes are converted.

---

## 8a. Blurb link-grids at page ends — POLICY

Many pages end with a row of `et_pb_blurb` cards ("related pages"). Uniform
policy:

1. **Blurbs carry real `url`s** → convert to a plain **`core/list` of links**
   (this is content, not layout — no columns, no cards).
2. **Clearly CTAs (1–3 items)** with `url`s → **`core/buttons`**.
3. **No `url`s and empty bodies** → **drop as chrome** and record the drop in
   the page's conversion note.
4. **Never infer or guess link targets.** A title without a `url` never becomes
   a link, even when the target page seems obvious.

---

## 9. Validation

Every converted page must pass `bin/content-tools/validate-blocks.php` (see
SKILL.md § Validation): `parse_blocks()` reports **0**
`BAD_freeform_with_content` and only allowed `core/*` blocks. Blank lines
between blocks produce empty freeform blocks with no content — that is
expected and harmless. Any *content* outside a block, or any
unknown/`generateblocks/*` block, is a failure and would trigger the editor's
block-recovery prompt.

---

## 10. Policy decisions (RESOLVED — apply uniformly in mass conversion)

Decided on the waldorf run and adopted as the default policy; a new site
applies these without per-page re-litigating (and records any deliberate
deviation in its config/docs):

1. **Brand palette slugs** — from the site config's `palette`. Map callout
   colors to the nearest slug only when clearly a brand color or close shade;
   drop everything else. Slugs, never hex. (§7)
2. **Image host** — keep URLs exactly as stored in the DB; no host rewriting.
   The frontend's `ImageNode` handles it. (§6)
3. **Tabs** — stack of `core/details`, all closed; functional-shortcode tabs →
   shortcode passthrough, tab chrome dropped. (§1)
4. **Blurb link-grids** — real URLs → `core/list` of links; 1–3 CTAs →
   `core/buttons`; URL-less/empty → drop as chrome + record in the page's
   conversion note. Never infer links. (§8a)
5. **ALL-CAPS titles** — leave verbatim. (§1 casing note)
6. **Heading levels** — frontend owns the page `<h1>`; demote body `<h1>` →
   `<h2>`; shift deeper levels only if needed for a sane hierarchy. (§1 heading
   policy)
