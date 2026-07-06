# Astro static frontend (scaffold)

This directory is the **template** for a per-site Astro 7 + UnoCSS frontend that
renders a headless WordPress backend as static HTML. `just astro-init` copies it
to `./astro/` in a site repo, where it becomes site-owned (never overwritten by
template syncs). The shared design system, data layer, content adapters and
deploy tooling live in the sibling `astro-core/` package, linked via
`"@site/astro-core": "file:../astro-core"`.

See `docs/ASTRO_HEADLESS_WORDPRESS.md` for the full architecture.

## Init

```bash
just astro-init          # copies astro-template/ -> ./astro/ (+ .env, mu-plugin)
```

Then edit **`astro/site.config.ts`** — every field is a commented placeholder:
`siteUrl`, `wp.baseUrl`, `contentEngine` (`gutenberg` | `divi`), `brand`
(colors/fonts feed the UnoCSS theme), `nav`, `contact`, `routes`. Put secrets
(WP origin override, FTP creds, API token) in `astro/.env` — see `.env.example`.

## Develop

```bash
just astro-dev           # Docker node service, HMR at http://localhost:4321
# or on host node:
cd astro && npm install && npm run dev
```

## Build & deploy

```bash
just astro-build         # static build -> astro/dist/
just astro-check         # astro check (type + template diagnostics)
just astro-deploy        # build + lftp mirror dist/ to FTP target from .env
```

## What to customize

| File | Purpose |
|------|---------|
| `site.config.ts` | Site identity, WP backend, brand tokens, nav, routes. |
| `src/pages/index.astro` | Homepage — replace the placeholder. |
| `src/pages/[...slug].astro` | Catch-all: curated MD > `wpPages` IR > cleanContent HTML > placeholder. |
| `src/content/pages/*.md` | Curated Markdown page overrides (highest priority). |
| `src/layouts/Layout.astro` | Thin wrapper over the core Base layout; add fonts/head extras here. |
| `uno.config.ts` | Preset lineup (brand preset from `site.config.brand` + Wind3/icons/typography). |

## Fonts are site-specific

`astro-core` ships **no** web fonts. Install the `@fontsource/*` packages your
brand needs in this project and import their CSS in `src/layouts/Layout.astro`,
e.g.:

```bash
npm i @fontsource/open-sans @fontsource/francois-one
```

```astro
import '@fontsource/open-sans/400.css';
import '@fontsource/francois-one/400.css';
```

Then reference the families in `site.config.ts` → `brand.fonts`.

## WordPress side

The headless REST endpoints come from a generic mu-plugin in
`astro-core/wp/mu-plugins/`. `just astro-init` copies it into the local
`src/wp-content/mu-plugins/`; `just astro-wp-plugin remote` uploads it to
production. Per-site route extensions go in `headless-api-site.php` (adapt the
`headless-api-site.example.php` template).
