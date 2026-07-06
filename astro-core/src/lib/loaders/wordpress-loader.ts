/**
 * wordpressLoader — an Astro 7 Content Layer loader that turns WordPress pages
 * into a content collection of IR trees.
 *
 * Pipeline (build time):
 *   fetchRawContent()  → raw post_content + rendered + cleanContent per page
 *     → adapter(raw, ctx) → ContentNode[]  (the IR body)
 *     → store.set({ id: slug, data: { …, body } })
 *
 * Resilience (never fails the build):
 *   - raw endpoint unavailable → fall back to the non-raw `fetchPages` feed and
 *     synthesize body = [ html(cleanContent || rendered) ].
 *   - everything unavailable  → keep whatever is already in the store and warn.
 *
 * The adapter is *injected* (see `wordpressLoader`) so this module never imports
 * the adapters package directly — keeps the loader tree-shakeable and decoupled
 * from Agent C's adapter implementations. `wordpressLoaderFor(config)` is a
 * convenience that lazily picks the adapter by `config.contentEngine`.
 */

import type { Loader, LoaderContext } from 'astro/loaders';
import { z } from 'zod';
import type { ContentAdapter, ContentNode } from '../content/ir';
import { htmlNode } from '../content/ir';
import { fetchRawContent, fetchPages, type WpClientOptions } from '../wordpress';
import type { ResolvedSiteConfig } from '../config';

/** The config subset the loader actually needs. */
export interface LoaderConfig {
  wp: ResolvedSiteConfig['wp'];
  siteUrl?: string;
}

export interface WordpressLoaderOptions {
  /** Resolved site config (or at least its `wp` block). */
  config: LoaderConfig;
  /** Injected content adapter (gutenbergAdapter | diviAdapter). */
  adapter: ContentAdapter;
  /** Override the collection loader name (defaults to 'wordpress-pages'). */
  name?: string;
}

/** Shape of a stored page entry's `data`. Exported for the site's defineCollection. */
export const wpEntrySchema = z.object({
  title: z.string(),
  wpId: z.number(),
  slug: z.string(),
  /** IR body — ContentNode[]; kept loose here (validated structurally upstream). */
  body: z.array(z.any()),
  excerpt: z.string(),
  cleanContent: z.string(),
  /** Server-rendered HTML — last-resort fallback for [...slug].astro. */
  content: z.string(),
  modified: z.string(),
  parent: z.number(),
  menuOrder: z.number(),
});

export type WpEntry = z.infer<typeof wpEntrySchema>;

function clientOptions(config: LoaderConfig, warn: (m: string) => void): WpClientOptions {
  return {
    baseUrl: config.wp.baseUrl,
    restNamespace: config.wp.restNamespace,
    coreFallback: config.wp.coreFallback,
    warn,
  };
}

export function wordpressLoader(opts: WordpressLoaderOptions): Loader {
  const { config, adapter } = opts;
  return {
    name: opts.name ?? 'wordpress-pages',
    schema: wpEntrySchema,
    async load({ store, logger, generateDigest }: LoaderContext): Promise<void> {
      const warn = (m: string) => logger.warn(m);
      const wpOpts = clientOptions(config, warn);
      const baseUrl = config.wp.baseUrl;

      // 1) Preferred path: token-gated raw feed → adapter → IR.
      const rawPages = await fetchRawContent(wpOpts);
      if (rawPages.length > 0) {
        store.clear();
        for (const page of rawPages) {
          let body: ContentNode[];
          try {
            body = adapter(page.raw, {
              warn,
              baseUrl,
              fallbackHtml: page.rendered,
            });
          } catch (err) {
            // Adapters must never throw, but guard anyway — degrade to HTML.
            warn(`[wp-loader] adapter threw on "${page.slug}" (${(err as Error).message}); using rendered HTML`);
            body = [htmlNode(page.cleanContent || page.rendered)];
          }
          const digest = generateDigest({ modified: page.modified, raw: page.raw });
          store.set({
            id: page.slug,
            digest,
            data: {
              title: page.title,
              wpId: page.id,
              slug: page.slug,
              body,
              excerpt: page.excerpt,
              cleanContent: page.cleanContent,
              content: page.rendered,
              modified: page.modified,
              parent: page.parent,
              menuOrder: page.menuOrder,
            },
          });
        }
        logger.info(`Loaded ${rawPages.length} page(s) from raw feed`);
        return;
      }

      // 2) Fallback: non-raw pages feed → HTML body from cleanContent/rendered.
      warn('[wp-loader] raw feed empty/unavailable; falling back to non-raw pages feed');
      const pages = await fetchPages(wpOpts);
      if (pages.length > 0) {
        store.clear();
        for (const page of pages) {
          const html = page.cleanContent || page.content;
          const digest = generateDigest({ modified: page.modified, html });
          store.set({
            id: page.slug,
            digest,
            data: {
              title: page.title,
              wpId: page.id,
              slug: page.slug,
              body: [htmlNode(html)],
              excerpt: page.excerpt,
              cleanContent: page.cleanContent,
              content: page.content,
              modified: page.modified,
              parent: page.parent,
              menuOrder: page.menuOrder,
            },
          });
        }
        logger.info(`Loaded ${pages.length} page(s) from fallback feed`);
        return;
      }

      // 3) Total failure: keep existing store entries (if any), never wipe.
      warn('[wp-loader] no pages available; keeping existing store entries');
    },
  };
}

/**
 * Convenience factory that picks the adapter by `config.contentEngine`.
 *
 * Returns a `Loader` *synchronously* (Astro's `defineCollection({ loader })`
 * expects a Loader, not a Promise) — the adapters module is imported lazily
 * inside `load()`, so the static loader never carries the adapter code and the
 * (potentially large) parser deps are only pulled in at build time.
 */
export function wordpressLoaderFor(
  config: LoaderConfig & { contentEngine: ResolvedSiteConfig['contentEngine'] },
  name?: string,
): Loader {
  return {
    name: name ?? 'wordpress-pages',
    schema: wpEntrySchema,
    async load(ctx: LoaderContext): Promise<void> {
      const mod = (await import('../content/adapters/index')) as {
        gutenbergAdapter: ContentAdapter;
        diviAdapter: ContentAdapter;
      };
      const adapter =
        config.contentEngine === 'divi' ? mod.diviAdapter : mod.gutenbergAdapter;
      return wordpressLoader({ config, adapter, name }).load(ctx);
    },
  };
}
