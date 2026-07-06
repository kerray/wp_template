import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { wordpressLoaderFor } from '@site/astro-core/loader';
import { resolveConfig } from '@site/astro-core/config';
import config from '../site.config';

/**
 * `wpPages` — page bodies pulled from headless WordPress at build time.
 *
 * The core `wordpressLoader` fetches every WP page, runs it through the adapter
 * selected by `contentEngine` (gutenberg | divi) and stores each body as a
 * ContentNode IR tree (plus `cleanContent` HTML and raw `content` fallbacks).
 * `src/pages/[...slug].astro` renders these unless a curated Markdown page
 * (below) overrides the slug. Schema is owned by the loader (`wpEntrySchema`).
 */
const wpPages = defineCollection({
  loader: wordpressLoaderFor(resolveConfig(config)),
});

/**
 * `pages` — curated page bodies hand-authored as clean Markdown.
 *
 * One `.md` file per page under `src/content/pages/`. The file's id (filename
 * without extension) is the URL slug unless `wpSlug` overrides it. These are the
 * PRIMARY, high-fidelity source and take precedence over the `wpPages` feed in
 * `src/pages/[...slug].astro`.
 *
 * Draft a starting point with the divi-to-astro-content skill, then hand-review.
 */
const pages = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!**/README.md'], base: './src/content/pages' }),
  schema: z.object({
    /** Page title, rendered as the <h1> (body should not repeat it). */
    title: z.string(),
    /** Originating WordPress post ID, for traceability. */
    wpId: z.number().optional(),
    /** URL slug; defaults to the file id when omitted. */
    wpSlug: z.string().optional(),
    /** Provenance of the body. */
    source: z.enum(['divi', 'gutenberg', 'manual']).default('manual'),
    /** Hide from the build without deleting the file. */
    draft: z.boolean().default(false),
  }),
});

export const collections = { wpPages, pages };
