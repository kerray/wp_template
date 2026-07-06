/**
 * SiteConfig — the single typed contract each site provides in `site.config.ts`.
 *
 * Zod schema + inferred TS types. The schema carries defaults (applied by
 * `resolveConfig` in src/lib/config.ts); `defineSiteConfig` in config.ts is the
 * thin identity/validation helper sites call.
 */

import { z } from 'zod';

/* ------------------------------ navigation ----------------------------- */

/** A single navigation entry; children make it a dropdown/submenu. */
export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

const navItemSchema: z.ZodType<NavItem> = z.lazy(() =>
  z.object({
    label: z.string(),
    href: z.string(),
    children: z.array(navItemSchema).optional(),
  }),
);

/* ------------------------------- schema -------------------------------- */

export const siteConfigSchema = z.object({
  /** Public origin of the static site, e.g. "https://waldorf-brno.cz". */
  siteUrl: z.url(),

  /** WordPress backend / headless API. */
  wp: z.object({
    /** WP origin, e.g. "https://wp.waldorf-brno.cz". */
    baseUrl: z.string(),
    /** REST namespace of the headless mu-plugin. */
    restNamespace: z.string().default('headless/v1'),
    /** Fall back to core /wp/v2/* when the custom feed is unavailable. */
    coreFallback: z.boolean().default(true),
  }),

  /** Which builder the WP content was authored with — picks the adapter. */
  contentEngine: z.enum(['gutenberg', 'divi']),

  /** Locale set; single-locale sites can omit this. */
  locales: z
    .object({
      default: z.string().default('cs'),
      supported: z.array(z.string()).default(['cs']),
    })
    .default({ default: 'cs', supported: ['cs'] }),

  /** Brand tokens — fed to presetSite() to build the UnoCSS theme. */
  brand: z.object({
    /**
     * Semantic color tokens. Conventionally includes `primary`, `accent`,
     * `highlight`, but any additional keys are accepted and exposed as-is.
     */
    colors: z.record(z.string(), z.string()),
    fonts: z.object({
      heading: z.string(),
      body: z.string(),
    }),
    /** Design-system content width. */
    containerWidth: z.string().default('1080px'),
  }),

  /** Site navigation. */
  nav: z.object({
    primary: z.array(navItemSchema),
    footer: z.array(navItemSchema).optional(),
  }),

  /** Contact details surfaced in footer/contact components. */
  contact: z
    .object({
      name: z.string(),
      email: z.string().optional(),
      phone: z.string().optional(),
      address: z.string().optional(),
    })
    .optional(),

  /** Routing hints for custom-post-type collections and reserved paths. */
  routes: z
    .object({
      collections: z
        .array(
          z.object({
            /** Custom post type slug, e.g. "akce". */
            cpt: z.string(),
            /** URL prefix for the collection, e.g. "/akce". */
            basePath: z.string(),
            /** Optional explicit REST endpoint override. */
            endpoint: z.string().optional(),
          }),
        )
        .optional(),
      /** Paths owned by the site's own pages (never claimed by loaders). */
      reserved: z.array(z.string()).default([]),
    })
    .optional(),
});

/** Author-facing config type (defaults optional on input). */
export type SiteConfigInput = z.input<typeof siteConfigSchema>;

/** Fully-resolved config type (defaults applied). */
export type SiteConfig = z.output<typeof siteConfigSchema>;

/** Alias used by consumers (loader, components) that need the resolved shape. */
export type ResolvedSiteConfig = SiteConfig;
