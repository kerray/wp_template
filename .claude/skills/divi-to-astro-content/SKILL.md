---
name: divi-to-astro-content
description: >-
  Convert DIVI WordPress page bodies into clean content for the Astro headless
  frontend (the site's ./astro app over @site/astro-core). Use when a page shows
  the "content is being prepared" placeholder, when migrating a WordPress page
  body into astro/src/content/pages/*.md, or when working on the [...slug].astro
  catch-all, the headless/v1 pages feed, or DIVI shortcode stripping for Astro.
  NOT for DIVI→Gutenberg (that is divi-to-gutenberg).
---

# DIVI → Astro content

Turn a DIVI page body (`[et_pb_section]…[et_pb_text]…`) into content the static
Astro site can render. DIVI's CSS is generated dynamically by the theme, so its
shortcodes never render headlessly — the meaningful content (headings,
paragraphs, lists, links, images, buttons) must be **extracted** out of the
layout wrappers and emitted as clean, single-column HTML or Markdown. Fine
DIVI layout (multi-column rows, module styling) is intentionally flattened. This
is a different target than `divi-to-gutenberg` (which rebuilds DIVI as Gutenberg
blocks inside WordPress); here the destination is a static Astro article.

## Where things live

Paths are relative to the site repo root (the directory holding `Justfile`,
`src/` and, after `just astro-init`, `astro/`).

| Thing | Path |
|-------|------|
| Astro project | `./astro/` |
| Page content collection | `astro/src/content/pages/*.md` |
| Collection schema | `astro/src/content.config.ts` |
| Catch-all route | `astro/src/pages/[...slug].astro` |
| WP data layer / loader | `@site/astro-core` (`astro-core/src/lib/`) |
| Headless feed (mu-plugin) | `astro-core/wp/mu-plugins/headless-api*` → installed to `src/wp-content/mu-plugins/` via `just astro-wp-plugin` |
| Converter script | `.claude/skills/divi-to-astro-content/scripts/divi_to_markdown.py` |
| Local WordPress | http://localhost:8080 (`just up` in the site repo) |

## Two target mechanisms (know which to use)

**1. Curated Markdown content collection — PRIMARY, recommended.**
One `.md` file per page under `astro/src/content/pages/`, hand-checked, git-friendly,
diffable. High fidelity: you control headings, links, images, and can drop DIVI
cruft (breadcrumbs, empty spacer headings, nav dumps). Use this for every page
that matters (about pages, admissions, curriculum, etc.). A curated entry
**overrides** the feed for its slug.

**2. Feed-driven clean HTML — fallback, scales to many pages, lower fidelity.**
The mu-plugin endpoint `GET /wp-json/headless/v1/pages` returns each page's body
with DIVI shortcodes stripped to plain HTML (`cleanContent`). `[...slug].astro`
renders it when no curated Markdown exists and the HTML no longer contains
`[et_pb_`. No per-page work, but you inherit whatever the flattening produces
(possible leftover empty headings, duplicated hero titles, inline styles). Use
it as a bulk safety net so no page is a bare placeholder, then upgrade the
important ones to curated Markdown.

**Rule of thumb:** curate the pages people actually read; let the feed cover the
long tail. Both are already wired — adding a `.md` file is all it takes to
promote a page from feed-driven to curated.

## Rendering precedence in `[...slug].astro`

`getStaticPaths` merges both sources; per slug the template renders the first
that applies:

1. **Curated** — a non-draft `pages` collection entry → render its Markdown `<Content />`.
2. **IR** — the `wpPages` entry has a parsed `body` (ContentNode[]) → `<ContentRenderer>`.
3. **Feed HTML** — `cleanContent` is non-empty and has no `[et_pb_` → `set:html`.
4. **Placeholder** — raw DIVI still present (`[et_pb_`) or empty → "content is being prepared".

Reserved slugs come from `site.config.ts` (`routes.reserved`, plus home and any
CPT collection base paths) and are skipped. `RESERVED` must stay **inside**
`getStaticPaths` — Astro runs that function in isolation and module-scope consts
are not visible there.

## Workflow — migrate one page to curated Markdown

Prerequisites: local WordPress up (`just up` in the site repo), Astro deps
installed (`cd astro && npm install`). All WordPress access is read-only.

**1. Identify a page.** List content-bearing pages and their DIVI weight:
```bash
docker compose exec -T wordpress wp post list --post_type=page \
  --post_status=publish --fields=ID,post_title,post_name --format=csv --allow-root
```
Prefer narrative pages (history, about, pedagogy) over layout-heavy landing pages.

**2. Convert to a Markdown draft** with the helper (pulls DIVI via WP-CLI,
flattens wrappers, converts inner HTML → Markdown, rewrites URLs):
```bash
python3 .claude/skills/divi-to-astro-content/scripts/divi_to_markdown.py page <slug>
# preview without writing:
python3 .../divi_to_markdown.py page <slug> --stdout
```
It writes `astro/src/content/pages/<slug>.md` with frontmatter
(`title`, `wpId`, `wpSlug`, `source: divi`, `draft`).

**3. Hand-review — required (flattening is lossy).** Open the `.md` and:
- Delete the redundant leading `# <TITLE>` (the template renders `title` as the
  `<h1>`; the body must not repeat it).
- Fix heading levels so the article has one logical outline (page title = h1,
  sections = h2/h3).
- Remove DIVI leftovers: breadcrumb remnants, empty headings, footer nav-link
  dumps you don't want on a static page.
- Sanity-check links and image paths.

**4. Handle images & links** (the script does the mechanical part):
- **Images** referenced as `…/wp-content/uploads/…` are rewritten so their host
  is `--image-base` (pass the site's WP origin) → the static build loads
  them from the live WP origin. This is the simplest option and needs no file
  copying. **Alternative (vendored):** run with `--image-base ''` to get
  root-relative `/wp-content/uploads/…` paths, then copy the referenced files
  into `astro/public/wp-content/uploads/…` so they ship in `dist/`. *This host
  decision is deliberately left to a human — pick per project policy.*
- **Internal links** to the site's own origin (`http(s)://<domain>/foo`) are made
  root-relative (`/foo`); external links are untouched.

**5. Verify the build:**
```bash
cd astro
npm run check                                   # must be 0 errors
WP_BASE_URL=http://localhost:8080 npm run build # must succeed
grep -o '<h1[^>]*>[^<]*</h1>' dist/<slug>/index.html   # spot-check output
```
After editing a `.md`, `astro check`/`build` re-sync the collection automatically;
run `npm run sync` if types look stale in the editor.

## Shortcode stripping — the critical caveat

`strip_shortcodes()` (PHP) does **NOT** remove `[et_pb_*]` in the REST/headless
context because those shortcodes aren't registered there. The same applies to any
naive text pass. Both the PHP feed (the `headless_api_clean_content` filter in
the mu-plugin) and the Python script therefore use a **regex fallback** in this
order:

1. Rebuild content modules first: `[et_pb_image src=…]` → `<img>`,
   `[et_pb_button button_text=… button_url=…]` → `<a>` (do this BEFORE removing
   wrappers or their attributes are lost).
2. Remove DIVI wrappers: `\[et_pb_\w+\b[^\]]*\]` and `\[/et_pb_\w+\]`.
3. **Fallback — eat any leftover bracket token:** `\[/?[^\]]*\]` (kills
   `[wpseo_breadcrumb]`, `[kalendar]`, etc.). Without this step stray shortcodes
   survive into the output.

Reuse the mu-plugin's existing clean/excerpt helpers — don't reinvent them.

## Pitfalls

- **Duplicate `<h1>`.** DIVI hero + the Astro title both produce an h1; always
  drop the body's leading title heading during review.
- **Empty spacer headings.** DIVI emits `<h3></h3>` for spacing; the converters
  drop empties, but check.
- **Anchor text duplication.** When hand-writing an HTML→MD pass, don't append
  `<a>` inner text to both the running buffer and the link label (the script
  handles this — see `handle_data`).
- **Feed floods the long tail.** Once `/wp-json/headless/v1/pages` is deployed,
  every non-curated page renders flattened HTML instead of a placeholder. That's
  intended; curate the ones that need better quality.
- **Editing the feed?** Change the generic mu-plugin in
  `astro-core/wp/mu-plugins/headless-api*` (site-specific routes go in
  `headless-api-site.php`), then reinstall with `just astro-wp-plugin`. Never
  touch the DIVI theme.
- **Security.** The script and feed only read from the local WordPress and never
  fetch untrusted hosts or read credentials — keep it that way.
