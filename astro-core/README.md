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
| `@site/astro-core/adapters`          | `gutenbergAdapter`, `diviAdapter` (`ContentAdapter`) |
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
  contentEngine: 'divi',                        // or 'gutenberg'
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
    loader: await wordpressLoaderFor(config),   // picks the adapter by contentEngine
    schema: wpEntrySchema,
  }),
};
```

## Data flow

```
WordPress (CMS)
  └─ headless-api mu-plugin  (/wp-json/headless/v1/*, token-gated raw content)
       └─ wordpressLoader (build time)
            ├─ contentEngine: 'gutenberg' → gutenbergAdapter → ContentNode[]
            └─ contentEngine: 'divi'      → diviAdapter      → ContentNode[]
       └─ content collection → [...slug].astro → <ContentRenderer> → components
```

The loader **never fails the build**: if the token-gated raw feed is
unavailable it falls back to the non-raw pages feed (`html(cleanContent)`), and
if everything is down it keeps the existing store entries and warns.

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
