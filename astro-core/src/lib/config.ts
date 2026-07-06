/**
 * Site configuration helpers.
 *
 * - `defineSiteConfig(cfg)` — identity helper sites call in `site.config.ts`;
 *   validates against the zod schema and returns a fully-typed, defaults-applied
 *   config. Throws early (at build/dev start) on a malformed config.
 * - `resolveConfig(cfg)` — layers environment overrides on top of a config
 *   (WP_BASE_URL, PUBLIC_SITE_URL) so the same `site.config.ts` works across
 *   local Docker WP and production without edits.
 */

import {
  siteConfigSchema,
  type SiteConfig,
  type SiteConfigInput,
  type ResolvedSiteConfig,
  type NavItem,
} from '../../site.config.schema';

export type { SiteConfig, SiteConfigInput, ResolvedSiteConfig, NavItem };

/**
 * Read an env var from Astro/Vite's `import.meta.env` first, then Node's
 * `process.env`. Works both inside the Astro build and in plain Node (tests,
 * scripts).
 */
export function readEnv(name: string): string | undefined {
  // import.meta.env is statically available under Vite/Astro; guard for Node.
  const metaEnv =
    typeof import.meta !== 'undefined' && (import.meta as { env?: Record<string, unknown> }).env
      ? (import.meta as { env?: Record<string, unknown> }).env
      : undefined;
  const fromMeta = metaEnv?.[name];
  if (typeof fromMeta === 'string' && fromMeta.length > 0) return fromMeta;

  const proc = typeof process !== 'undefined' ? process.env : undefined;
  const fromProc = proc?.[name];
  if (typeof fromProc === 'string' && fromProc.length > 0) return fromProc;

  return undefined;
}

/**
 * Validate and normalize a site config. Call this in `site.config.ts`:
 *
 *   export default defineSiteConfig({ ... });
 */
export function defineSiteConfig(cfg: SiteConfigInput): SiteConfig {
  const result = siteConfigSchema.safeParse(cfg);
  if (!result.success) {
    const issues = result.error.issues
      .map((i) => `  - ${i.path.join('.') || '(root)'}: ${i.message}`)
      .join('\n');
    throw new Error(`Invalid site.config.ts:\n${issues}`);
  }
  return result.data;
}

/**
 * Apply environment overrides to a (already validated) config. Overrides:
 *   - WP_BASE_URL     → wp.baseUrl
 *   - PUBLIC_SITE_URL → siteUrl
 *
 * `HEADLESS_API_TOKEN` is intentionally *not* baked into the config object — the
 * data layer reads it directly at fetch time (see wordpress.ts) so the token
 * never ends up in client-visible config.
 */
export function resolveConfig(cfg: SiteConfig): ResolvedSiteConfig {
  const wpBaseUrl = readEnv('WP_BASE_URL');
  const siteUrl = readEnv('PUBLIC_SITE_URL');

  return {
    ...cfg,
    siteUrl: siteUrl ?? cfg.siteUrl,
    wp: {
      ...cfg.wp,
      baseUrl: wpBaseUrl ?? cfg.wp.baseUrl,
    },
  };
}
