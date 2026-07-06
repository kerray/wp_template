// @ts-check
import { defineConfig } from 'astro/config';
import UnoCSS from '@unocss/astro';
import config from './site.config';

// Static-HTML build target for shared PHP hosting (no Node runtime).
// `output: 'static'` prerenders every route to plain HTML/CSS/JS at build time.
// Deploy = `astro build` -> upload `dist/` via FTP (`just astro-deploy`, which
// runs astro-core/scripts/deploy-static.sh).
//
// The public origin comes from site.config.ts (`siteUrl`), overridable at build
// time via the PUBLIC_SITE_URL env var (e.g. for a staging deploy).
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || config.siteUrl,
  output: 'static',
  build: {
    // /some-page/index.html -> clean, trailing-slash URLs on static hosting.
    format: 'directory',
  },
  integrations: [
    UnoCSS({
      injectReset: true, // pulls in @unocss/reset (Tailwind-compatible reset)
    }),
  ],
});
