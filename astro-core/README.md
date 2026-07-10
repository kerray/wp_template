# @site/astro-core

Reusable **Astro 7 + UnoCSS + TypeScript** layer for turning a WordPress site
into a fully static frontend while keeping WordPress as the headless CMS. Content
authored in **Gutenberg** or **DIVI** both render into one shared design system
via a content **intermediate representation (IR)** and pluggable adapters.

This package is **template-owned**: it is overwrite-synced into every site repo
(`TEMPLATE_DIRS` in `sync_to_sites.sh`) and sites never edit it. Site-owned code
(pages, branding, curated content, `site.config.ts`) lives in the sibling
`astro/` app, which links to this package.

## How sites consume it

`astro-core` ships **raw `.ts` / `.astro` source — no build step**. A site links
it with a `file:` dependency; the site's Astro/Vite compiles the source directly
(standard Astro component-library pattern):

```jsonc
// site's astro/package.json
{
  "dependencies": {
    "@site/astro-core": "file:../astro-core"
  }
}
```

### Exports

| Import specifier                     | What it gives you |
|--------------------------------------|-------------------|
| `@site/astro-core/config`            | `defineSiteConfig`, `resolveConfig`, `SiteConfig`, `NavItem` |
| `@site/astro-core/ir`                | Content IR types + `htmlNode`, `hasChildren` |
| `@site/astro-core/adapters`          | `markdownAdapter`, `gutenbergAdapter`, `diviAdapter`, `htmlAdapter` (`ContentAdapter`) + `getAdapter`, `resolveEngine`, `detectEngine`, `ContentEngine` |
| `@site/astro-core/loader`            | `wordpressLoader`, `wordpressLoaderFor`, `wpEntrySchema` |
| `@site/astro-core/wordpress`         | `fetchPages/Posts/Collection/Site/RawContent` + WP types |
| `@site/astro-core/dates`             | Czech month names, school-year + ICS date helpers |
| `@site/astro-core/uno`               | `presetSite(brand)` UnoCSS preset factory |
| `@site/astro-core/components/*`      | Base + content components |
| `@site/astro-core/layouts/*`         | Base layout(s) |

### Typical wiring

`site.config.ts`:

```ts
import { defineSiteConfig } from '@site/astro-core/config';

export default defineSiteConfig({
  siteUrl: 'https://example.com',
  wp: { baseUrl: 'https://wp.example.com' },   // restNamespace defaults to headless/v1
  contentEngine: 'divi',                        // DEFAULT/fallback hint only (see Per-post engine resolution); 'markdown' | 'gutenberg' | 'divi' | 'html'
  brand: {
    colors: { primary: '#2d2864', accent: '#973528', highlight: '#f0d118' },
    fonts: { heading: "'Francois One', sans-serif", body: "'Open Sans', sans-serif" },
  },
  nav: { primary: [{ label: 'Home', href: '/' }] },
});
```

`uno.config.ts`:

```ts
import { defineConfig, presetWind3, presetIcons, presetTypography, transformerDirectives } from 'unocss';
import { presetSite } from '@site/astro-core/uno';
import site from './site.config';

export default defineConfig({
  presets: [presetWind3(), presetIcons(), presetTypography(), presetSite(site.brand)],
  transformers: [transformerDirectives()],
});
```

`content.config.ts` (Astro Content Layer):

```ts
import { defineCollection } from 'astro:content';
import { wordpressLoaderFor, wpEntrySchema } from '@site/astro-core/loader';
import { resolveConfig } from '@site/astro-core/config';
import site from './site.config';

const config = resolveConfig(site);

export const collections = {
  pages: defineCollection({
    loader: await wordpressLoaderFor(config),   // resolves the adapter PER ITEM
    schema: wpEntrySchema,
  }),
};
```

## Design system & brand palette

`presetSite(brand)` turns `brand.colors` into UnoCSS color tokens **and** into
preflight CSS that bridges WordPress palette-slug classes back to the brand:

- For every `brand.colors` key `slug` it emits `.has-{slug}-color` and
  `.has-{slug}-background-color` (the latter styled as a callout — padding +
  radius), plus `.has-text-align-{center,left,right}`. WordPress writes exactly
  these class names for palette + alignment picks, and the headless build ships
  none of WP's default stylesheets, so the design system owns them.
- The **editor end** of the same contract is the `brand-palette.php` mu-plugin
  (in `wp/mu-plugins/`, template-owned): on `after_setup_theme` it registers
  `editor-color-palette` + `disable-custom-colors` from a site-supplied
  `headless_brand_palette` filter (or `HEADLESS_BRAND_PALETTE` constant). Copy it
  byte-identical into each site's `wp-content/mu-plugins/` alongside a site
  extension (e.g. `brand-palette-site.php`) that returns the `{slug,name,color}`
  entries — slugs MUST match `brand.colors` keys. Editors then only ever produce
  `.has-{slug}-*` classes the preflights cover. Guarded by
  `tests/preset.test.ts`.

## Data flow

```
WordPress (CMS)
  └─ headless-api mu-plugin  (/wp-json/headless/v1/*, token-gated raw content)
       └─ wordpressLoader (build time) — resolveEngine() PER ITEM:
            engine='markdown'  → markdownAdapter  ┐
            engine='gutenberg' → gutenbergAdapter │→ ContentNode[]
            engine='divi'      → diviAdapter       │
            engine='html'      → htmlAdapter       ┘
       └─ content collection → [...slug].astro → <ContentRenderer> → components
```

The loader **never fails the build**: if the token-gated raw feed is
unavailable it falls back to the non-raw pages feed (`html(cleanContent)`), and
if everything is down it keeps the existing store entries and warns.

## Per-post engine resolution

Content is no longer parsed by one global engine. Each page/post/akce is routed
through the adapter matching ITS OWN builder, resolved (in `adapters/engine.ts`)
in this order:

1. **API `engine` field** — the headless feed tags each item with
   `engine: 'markdown' | 'gutenberg' | 'divi' | 'html'` and delivers the
   canonical source in `raw`. A valid value wins outright.
2. **Source sniffing** — when `engine` is absent, the `raw`/content is sniffed:
   `<!-- wp:` → `gutenberg`, `[et_pb_` → `divi`.
3. **Site default hint** — otherwise `site.config.ts` `contentEngine` is used
   (and 'html' if even that is unset).

This works **both before and after** the backend lands the `engine`+`raw`
contract: with the fields absent, steps 2–3 reproduce the previous global
behaviour, so a DIVI site keeps parsing DIVI. `contentEngine` in `SiteConfig`
is therefore now just the default/fallback hint, not a hard global switch.

### Markdown writer (WordPress side)

The canonical **markdown writer plugin** lives here at
`astro-core/wp/plugins/markdown-content/` (`markdown-content.php` + bundled
`Parsedown.php`). It stores the Markdown source of truth in
`post_content_filtered`, renders an HTML cache into `post_content`, and exposes
the one canonical writer `markdown_content_apply($post_id, $markdown)` used by
both the wp-admin editing UI and Phase-2 mass-conversion scripts. That writer
also hardens each write with three guards (empty-body `_headless_engine=markdown`
override, `_et_pb_use_builder` flip-off, and `future`-status preservation) —
see the site's `docs/MARKDOWN_BACKEND.md`.

Unlike `astro-core/wp/mu-plugins/` (the headless API, template-owned), this is a
**regular plugin**, and `sync_to_sites.sh` does **not** sync site `src/` — so the
copy in each site's `src/wp-content/plugins/markdown-content/` is **mirrored
manually** and must be kept byte-identical to this canonical copy.

### Adapters

| Engine       | Adapter            | How it builds IR |
|--------------|--------------------|------------------|
| `markdown`   | `markdownAdapter`  | Markdown → HTML (via `marked`, GFM) → shared `splitHtmlToNodes` splitter → IR. Same IR/renderer/styling as curated local `.md`. Tables/blockquotes/code pass through as sanitised `HtmlNode`. Curated **local** `.md` files keep using Astro's own content-layer renderer — this adapter is only for markdown arriving over the API. |
| `gutenberg`  | `gutenbergAdapter` | `@wordpress/block-serialization-default-parser` → ~20 core blocks → IR. |
| `divi`       | `diviAdapter`      | Recursive shortcode tokenizer → IR. |
| `html`       | `htmlAdapter`      | HTML passthrough through the shared splitter (structural nodes for headings/lists/images, verbatim `HtmlNode` for the rest). |

All adapters implement `ContentAdapter` and **never throw** — any parse failure
degrades to an `HtmlNode` fallback. `getAdapter(engine)` returns the adapter for
a resolved engine.

## Configuration & secrets

`site.config.ts` holds public, typed config (validated by `defineSiteConfig`).
Environment overrides (applied by `resolveConfig`):

- `WP_BASE_URL` → `wp.baseUrl`
- `PUBLIC_SITE_URL` → `siteUrl`
- `HEADLESS_API_TOKEN` → Bearer token for the raw-content feed (read directly by
  the data layer; never baked into the client-visible config).

FTP deploy secrets (used by `scripts/deploy-static.sh`) live only in `.env`:
`FTP_HOST`, `FTP_USER`, `FTP_PASS`, `FTP_REMOTE_PATH`.

## Deployment

`scripts/deploy-static.sh` mirrors the built `dist/` to FTP hosting via `lftp`
(no hardcoded domain — everything from `.env`). `deploy/htaccess.static` is the
apex `.htaccess` for a static site, with a documented single-domain WordPress
coexistence fallback.

## Development

```bash
npm install        # inside astro-core, for standalone typecheck/tests
npm run check      # tsc --noEmit
npm test           # vitest run
```

Adapters and components (`src/lib/content/adapters/*`, `src/components/*`,
`src/layouts/*`) are authored by their respective owners; the data layer, config,
IR consumption, loader, UnoCSS preset and deploy tooling live here.
