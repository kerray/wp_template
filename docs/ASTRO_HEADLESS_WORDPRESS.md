# Astro static frontend for headless WordPress

A reusable layer that lets any site in this template replace its PHP frontend
with a static **Astro 7 + TypeScript + UnoCSS** site while keeping WordPress as
the backend/CMS. Content authored in **Gutenberg** or in **DIVI** both render
into one shared design system via adapters. Builds are fully static (shared PHP
hosting, no Node runtime); deploy is an `lftp` mirror of `dist/`.

## Two roots, opposite sync semantics

| Root | Owner | Sync | Contents |
|------|-------|------|----------|
| `astro-core/` | template | overwritten every sync (`TEMPLATE_DIRS`) | data layer, content IR, adapters (gutenberg/divi), base components, UnoCSS preset factory, layouts, deploy script, generic mu-plugin |
| `astro-template/` | template | overwritten every sync (`TEMPLATE_DIRS`) | scaffold copied once by `just astro-init` |
| `astro/` | site | **never touched** (`PROTECTED_FILES`) | the site app: `site.config.ts`, pages, curated content, `.env` |

They link via `"@site/astro-core": "file:../astro-core"`. Sites never edit
`astro-core`; template updates flow in through `sync_to_sites.sh`, then
`just astro-update` re-links.

## Content pipeline

```
WordPress (CMS)
  └─ mu-plugin (headless/v1): /pages /posts /site /collection/{cpt}
        token-gated raw post_content + rendered + cleanContent
        │
  └─ wordpressLoader (Astro Content Layer loader, build time)
        ├─ contentEngine 'gutenberg' → GutenbergAdapter (block parser → IR)
        └─ contentEngine 'divi'      → DiviAdapter (shortcode tokenizer → IR)
        │
  └─ ContentNode[] IR stored in the `wpPages` collection
        │
  └─ src/pages/[...slug].astro  precedence:
        curated Markdown  >  wpPages IR  >  cleanContent HTML  >  placeholder
        │
  └─ <ContentRenderer nodes> → astro-core UnoCSS components
```

Both adapters emit one **ContentNode IR tree**; a single `<ContentRenderer>`
maps it to the styled Astro components. The design system wins — DIVI's inline
styling is intentionally dropped. Degradation rule: never throw/drop — an
unknown block/module becomes an `html` node with a build-log warning, and the
loader falls back to `cleanContent` so a page never fails the build.

## Per-site config: `site.config.ts`

Typed via `defineSiteConfig` (validated by a Zod schema in `astro-core`):

- `siteUrl` — public origin of the static site.
- `wp.{baseUrl,restNamespace,coreFallback}` — headless backend.
- `contentEngine: 'gutenberg' | 'divi'` — selects the adapter.
- `brand.{colors,fonts,containerWidth}` — fed to `presetSite()` to build the
  UnoCSS theme (this is how a site gets its look; no CSS edits in core).
- `nav`, `contact`, `routes.{collections,reserved}`.

Secrets go in `astro/.env`: `WP_BASE_URL`, `PUBLIC_SITE_URL`,
`HEADLESS_API_TOKEN`, `FTP_HOST/USER/PASS/REMOTE_PATH`, `ASTRO_PORT`.

## WordPress side: the headless mu-plugin

A generic mu-plugin (`astro-core/wp/mu-plugins/`, namespace `headless/v1`)
exposes `/pages` (incl. token-gated raw `post_content`, needed by both
adapters), `/posts`, `/site`, and `/collection/{cpt}`. Extension seams:
`do_action('headless_api_register_routes')` and
`apply_filters('headless_api_clean_content')`. Per-site routes (custom post
types, taxonomies) go in `headless-api-site.php` — adapt the shipped
`headless-api-site.example.php`.

Install: `just astro-wp-plugin` (local copy into `src/wp-content/mu-plugins/`,
which keeps `src/` sync-protected) or `just astro-wp-plugin remote` (FTP upload).

> The raw-content endpoint returns edit-level data — keep it token-gated over
> HTTPS. `HEADLESS_API_TOKEN` in `astro/.env` must match the WP side.

## Justfile recipes

| Recipe | Purpose |
|--------|---------|
| `just astro-init` | Scaffold `./astro` from `astro-template/` (one-time) + install mu-plugin locally. |
| `just astro-dev` | Dev server via the Docker `node` service, HMR at `:${ASTRO_PORT:-4321}`. |
| `just astro-build` | Static build → `astro/dist/`. |
| `just astro-check` | `astro check` (types + template diagnostics). |
| `just astro-update` | Re-run `npm install` to relink `@site/astro-core` after a sync. |
| `just astro-wp-plugin [remote]` | Install the headless mu-plugin locally, or upload via FTP. |
| `just astro-deploy` | `astro-build` + `astro-core/scripts/deploy-static.sh` (lftp mirror). |
| `just astro-status` | Show whether the app/deps/build exist. |
| `just astro-help` | List the commands. |

## Deployment & coexistence

Baseline: static files at the apex docroot, WordPress moved to a `wp.<domain>`
subdomain. Fallback: same-domain with an `.htaccess` pass-through for
`/wp-admin`, `/wp-json`, `/wp-login.php`, `/wp-content`.

Media baseline: adapters rewrite upload URLs root-relative and the build mirrors
*referenced* uploads into `public/wp-content/uploads/` (hotlink to WP is the
fallback).

"On-demand regeneration" on static hosting = a **rebuild-on-change** pipeline: a
WordPress `save_post` webhook triggers `just astro-deploy` (or a CI job that
runs `npm run build` + the deploy script). Manual `just astro-deploy` is the
baseline; webhook/CI is a later phase.

## Run it (local)

```bash
just up                 # local WordPress (Docker) as the content source
just astro-init         # scaffold ./astro (first time only)
# edit astro/site.config.ts + astro/.env (WP_BASE_URL=http://localhost:8080)
just astro-dev          # http://localhost:4321
just astro-build        # -> astro/dist (static)
just astro-deploy       # build + lftp mirror to the FTP target
```

## Notes & risks

- Visual parity with the original DIVI/Gutenberg pages is a **non-goal** — the
  design system restyles everything.
- Dynamic content (`et_pb_blog`, `core/query`, forms, custom shortcodes) needs
  dedicated IR nodes or degrades to rendered-HTML passthrough.
- DIVI tokenizer edge cases (inner rows, specialty sections, global modules,
  encoded attrs) warrant snapshot tests against real content.
- Fonts are **site-specific**: install `@fontsource/*` in `astro/` and import in
  `src/layouts/Layout.astro`; core ships no fonts.
