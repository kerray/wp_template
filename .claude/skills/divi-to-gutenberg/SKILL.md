---
name: divi-to-gutenberg
description: >-
  THE authoritative workflow for converting a DIVI-built WordPress page into
  clean, NORMALIZED core Gutenberg block markup. Use whenever migrating,
  converting, or normalizing DIVI content ([et_pb_section], [et_pb_row],
  [et_pb_text], [et_pb_image], [et_pb_toggle]/[et_pb_accordion], [et_pb_tabs],
  [et_pb_blurb], [et_pb_button], [et_pb_gallery], sliders, dividers) into
  Gutenberg blocks (core/group, core/columns, core/heading, core/paragraph,
  core/image, core/gallery, core/buttons, core/details, core/separator,
  core/table, core/embed). Trigger on "convert DIVI to Gutenberg", "normalize
  DIVI page", "DIVI to blocks", "strip DIVI shortcodes to core blocks". For the
  headless Astro Markdown target instead, use divi-to-astro-content.
---

# DIVI → normalized Gutenberg

The single entry point for converting **one DIVI page** into clean core
Gutenberg blocks. This skill supersedes the ad-hoc `gutenberg-block-converter`
and `generateblocks-converter` skills for per-page conversion (see
[Relationship to other skills](#relationship-to-other-skills)).

Site-specific data (palette, chrome signatures, functional shortcodes, table
prefix) comes from the site's **`content-conversion.config.json`** — see
`bin/content-tools/README.md`. Never hardcode it in conversion output.

## Core philosophy — content is content; formatting comes from site styles

The site's design system supplies **all** typography and spacing (UnoCSS on the
Astro frontend; theme styles in WordPress). Therefore:

- **PRESERVE real structure** — sections/groups, columns, toggles/accordions,
  tabs, image+text layouts, buttons, galleries, lists, tables, headings.
- **STRIP per-element cosmetic variation** — custom fonts, font sizes,
  letter-spacing, line-height, text colors, per-module margins/paddings, border
  radii, box shadows, animations, DIVI dividers, custom CSS.
- **Keep only semantically meaningful attributes** — alignment, wide/full
  width, heading levels, list type/ordering, and brand-palette colors *only*
  where the color carries meaning (a deliberate callout), mapped to a **named
  palette slug, never a hex value**. The palette slugs come from the site
  config (`palette` in `content-conversion.config.json`, mirroring
  `site.config.ts` `brand.colors` on the Astro side).

If in doubt: drop the styling, keep the content and its structure. A converted
page should look intentionally plain in the bare editor — the theme dresses it.

## Tooling — run the converter, review its output

`bin/content-tools/divi2blocks.py` implements the normalization rules below
mechanically (config-driven; unknown modules emit a `TODO:` marker + non-zero
exit). Prefer running it and reviewing/fixing its output over converting whole
pages by hand; convert by hand when a page needs judgment the tool can't make,
and follow the same rules.

## Workflow (per page)

1. **Read the source** (read-only):
   `docker compose exec -T wordpress wp post get <ID> --field=content --allow-root`
2. **Identify chrome vs. content.** Drop global modules and page furniture
   *before* converting anything — see the DROP list. Typical chrome: hero band
   styling, breadcrumb global modules, wave-divider spacer sections, footer
   nav globals. The site config's `chrome.*` keys hold the site's signatures.
3. **Convert structure top-down**: section → (usually nothing, or core/group
   only if it carries a *meaningful* callout background), row → core/columns,
   column → core/column, then the content modules inside.
4. **Normalize the inner HTML** of each `[et_pb_text]` — unwrap DIVI/legacy
   toggle wrappers, drop inline color spans and empty tags, fix wpautop/texturize
   quirks. See references/normalization-rules.md § "Inner-HTML normalization".
5. **Pass functional shortcodes through verbatim** inside `core/shortcode`
   blocks (events/calendar shortcodes, pdf viewers, contact forms — the site
   config's `functional_shortcode_allowlist`). Never convert or restyle them.
6. **Validate** the output parses with zero invalid blocks (see below). Fix any
   `BAD_freeform_with_content` before considering the page done.

## The rules — read this before converting

The complete, authoritative mapping lives in
**references/normalization-rules.md**:

- Module → core block table (what carries over, what is dropped).
- The explicit **DROP list** (fonts, sizes, colors, spacing, animations, custom
  CSS, dividers, global modules, disabled/spacer/empty modules).
- **Column-structure mapping** (`4_4`→100%, `1_2`→50%, `1_3`→33.33%,
  `2_3`→66.67%, `1_4`→25%, `3_4`→75%, `1_5`→20%, `3_5`/`2_5`, `1_6`).
- **wpautop / texturize quirks** inside `et_pb_text` (encoded quotes,
  `<span>`-wrapped shortcode attribute names, `<div>` used as paragraph, stray
  `<big></big>`/`&nbsp;` filler).
- The **verbatim-shortcode passthrough** rule.
- Brand palette slug mapping (callout colors only).
- **§10 Policy decisions** — palette slugs, image-host policy (keep DB URLs
  verbatim), tabs → all-closed details stack or functional passthrough, blurb
  link-grid handling (list/buttons/drop — never infer links), ALL-CAPS left
  verbatim, body `<h1>` demoted to `<h2>`. Mass conversion applies these
  uniformly; do not re-decide per page.

Raw DIVI attribute meanings (not the normalization policy) are documented in
the site repo's `docs/divi/` (per-module files) and `docs/gutenberg/`
(per-block save markup). Refer to those rather than re-deriving attribute
semantics; this skill defines *what to keep vs. drop*, which is the opposite
of a preserve-everything conversion matrix.

## Worked examples

The waldorf-brno.cz instance of this skill (in the `site_waldorf` repo) keeps
`references/worked-examples.md` — three real pages converted end-to-end,
before → after, each verified with `parse_blocks` (simple / moderate /
complex: chrome dropping, `[et_pb_accordion]` → `core/details`, inline-color
stripping, gallery id-resolution, URL-less blurb grid dropped as chrome). Use
them as the canonical reference for what normalized output looks like.

## Validation (required before a page is "done")

`bin/content-tools/validate-blocks.php` runs `parse_blocks()` over the
converted markup and fails if any content falls outside a block (would cause
the editor's "block recovery" prompt) or if any unexpected/unknown block
appears.

```bash
# from repo root, WordPress container up:
docker compose cp converted.html wordpress:/tmp/converted.html
docker compose cp bin/content-tools/validate-blocks.php wordpress:/tmp/validate-blocks.php
docker compose exec -T wordpress wp eval-file /tmp/validate-blocks.php /tmp/converted.html --allow-root
# RESULT: PASS  (exit 0)  →  0 BAD_freeform_with_content, only allowed core/* blocks
```

Quick inline check without a file:

```bash
docker compose exec -T wordpress wp eval '
$b = parse_blocks(file_get_contents("/tmp/converted.html"));
$bad=0; $f=function($bs)use(&$f,&$bad){foreach($bs as $x){if($x["blockName"]===null&&trim($x["innerHTML"])!=="")$bad++;if(!empty($x["innerBlocks"]))$f($x["innerBlocks"]);}};
$f($b); echo "invalid: $bad\n";' --allow-root
```

A clean page reports `invalid: 0`. Blank lines between blocks parse as empty
freeform blocks with no content — that is normal and **not** a failure.

After a batch, run the independent full-corpus sweep: `just verify-content`
(and `just verify-hallucinations` against the pre-conversion snapshot).

## Relationship to other skills

- **divi-shortcode-analyzer** — still useful *upstream*: run it to inventory a
  page's module mix and complexity before converting. Not superseded.
- **gutenberg-block-converter** — low-level "how does core block X serialize"
  reference. Consult the site repo's `docs/gutenberg/core_*.md` for exact save
  markup, but this skill's normalization rules override its preserve-styling
  guidance.
- **generateblocks-converter / generatepress-design** — **superseded when the
  conversion target is core Gutenberg** (the normalized-content pipeline
  default). Do not emit `generateblocks/*` blocks. Use core blocks per the
  tables here.
- **divi-to-astro-content** — sibling with a different target (headless Astro
  Markdown, layout flattened). Use that when the destination is the site
  repo's `astro/src/content/pages/*.md`; use *this* skill when the destination
  is Gutenberg block markup inside WordPress.

## Guardrails

- **Read-only WordPress.** Never write/update posts from this skill; conversion
  output is produced to files for human review and separate publishing
  (`markdown_content_apply()` / the site's block writer own the DB write).
- **Never deploy converted content onto a production site still rendering via
  the DIVI theme** — `just deploy-guard` enforces this.
- Preserve the site's copy verbatim (language, casing, wording) — rewriting
  copy is a per-page editorial decision, not part of normalization.
