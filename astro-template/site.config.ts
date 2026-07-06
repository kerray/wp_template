import { defineSiteConfig } from '@site/astro-core/config';

/**
 * site.config.ts — the single typed contract this site provides to @site/astro-core.
 *
 * Every field below is a PLACEHOLDER. After `just astro-init`, edit these to
 * describe your site: public URL, WordPress backend, which builder the WP
 * content was authored with, brand tokens (feed the UnoCSS theme), navigation
 * and contact details. Secrets (WP origin override, FTP creds, API token) live
 * in `.env`, never here.
 *
 * The shape is validated by the Zod schema in astro-core; `defineSiteConfig`
 * is a thin typed identity helper. Fields with schema defaults may be omitted.
 */
export default defineSiteConfig({
  // Public origin of the built static site (no trailing slash).
  siteUrl: 'https://example.com',

  // WordPress backend / headless API.
  wp: {
    // WP origin serving the REST API (often a `wp.` subdomain of siteUrl).
    // Overridable at build time via the WP_BASE_URL env var (see .env.example).
    baseUrl: 'https://wp.example.com',
    // REST namespace of the headless mu-plugin (default: 'headless/v1').
    restNamespace: 'headless/v1',
    // Fall back to core /wp/v2/* when the custom feed is unavailable.
    coreFallback: true,
  },

  // Which builder authored the WP content — picks the adapter.
  // 'gutenberg' (clean block HTML) or 'divi' (legacy [et_pb_*] shortcodes).
  contentEngine: 'gutenberg',

  // Locale set; single-locale sites can drop this block (defaults to cs).
  locales: {
    default: 'cs',
    supported: ['cs'],
  },

  // Brand tokens — consumed by presetSite() to build the UnoCSS theme.
  brand: {
    // Semantic color tokens. `primary`/`accent`/`highlight` are conventional;
    // extra keys are accepted and exposed as-is (e.g. category colors).
    colors: {
      primary: '#2d2864',
      accent: '#973528',
      highlight: '#f0d118',
    },
    // Font stacks. Install the matching @fontsource packages per-site and
    // import them in src/layouts/Layout.astro (fonts are NOT provided by core).
    fonts: {
      heading: "'Francois One', system-ui, sans-serif",
      body: "'Open Sans', system-ui, sans-serif",
    },
    // Design-system content width (default: '1080px').
    containerWidth: '1080px',
  },

  // Site navigation. `primary` is the top menu; `footer` is optional.
  nav: {
    primary: [
      { label: 'Home', href: '/' },
      // { label: 'About', href: '/about/' },
      // Nested example (dropdown):
      // { label: 'More', href: '/more/', children: [{ label: 'Sub', href: '/more/sub/' }] },
    ],
    // footer: [{ label: 'Contact', href: '/contact/' }],
  },

  // Contact details surfaced in footer/contact components (optional).
  contact: {
    name: 'Example Site',
    email: 'info@example.com',
    phone: '',
    address: '',
  },

  // Routing hints (optional).
  routes: {
    // Custom-post-type collections rendered under their own base path.
    // collections: [{ cpt: 'akce', basePath: '/akce' }],
    // Paths owned by the site's own pages/routes — the catch-all and loaders
    // never claim these (home '' is always reserved).
    reserved: [''],
  },
});
