/**
 * Markdown content adapter: raw Markdown → ContentNode[] IR.
 *
 * For markdown bodies arriving from the WordPress headless feed (`engine:
 * 'markdown'`). Curated local `.md` files under a site's `src/content/pages/`
 * keep using Astro's own content-layer renderer — this adapter is ONLY for
 * markdown that reaches us as a raw string over the API.
 *
 * Strategy: parse Markdown → HTML with `marked` (small, zero-dependency, GFM),
 * then reuse the shared `splitHtmlToNodes` splitter so the output is the exact
 * same IR the DIVI/Gutenberg adapters emit. Everything therefore flows through
 * one ContentRenderer + one Prose sanitiser + the same UnoCSS styling, giving
 * API-markdown the same rendering quality as curated markdown:
 *   - headings   → HeadingNode
 *   - paragraphs → ParagraphNode
 *   - lists      → ListNode
 *   - images     → ImageNode (loose `![]()` unwrapped from marked's <p>)
 *   - links / inline emphasis → inline HTML preserved on their parent node
 *   - tables / blockquotes / code / pre → HtmlNode passthrough (Prose sanitises;
 *     these tags are on Prose's allowlist)
 *
 * Never throws: any parse failure degrades to an HtmlNode of the escaped source.
 *
 * Limitations (by design):
 *   - Raw inline HTML in the markdown is passed through and then SANITISED by
 *     Prose — script/style/iframe are dropped (media embeds must be authored as
 *     blocks/shortcodes, not raw <iframe>).
 *   - No front-matter parsing here; the API is expected to deliver body-only
 *     markdown (title/metadata travel as sibling fields).
 *   - GFM autolinks/tables/strikethrough supported; footnotes are not.
 */

import { marked } from 'marked';
import type { AdapterContext, ContentAdapter, ContentNode } from '../ir';
import { htmlNode } from '../ir';
import { splitHtmlToNodes, type ScrubOptions } from './html-utils';

function makeWarner(ctx?: AdapterContext) {
  const seen = new Set<string>();
  return (msg: string) => {
    if (seen.has(msg)) return;
    seen.add(msg);
    ctx?.warn?.(msg);
  };
}

function scrubOpts(warn: (m: string) => void, keep?: string[]): ScrubOptions {
  return keep ? { warn, keep } : { warn };
}

/** Minimal HTML-escape for the last-resort fallback path. */
function escapeHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export const markdownAdapter: ContentAdapter = (raw, adapterCtx) => {
  const warn = makeWarner(adapterCtx);
  const source = raw ?? '';
  if (source.trim() === '') return [];

  try {
    // `async: false` guarantees a string return (no async marked extensions here).
    const html = marked.parse(source, { async: false, gfm: true }) as string;
    const nodes: ContentNode[] = splitHtmlToNodes(
      html,
      adapterCtx?.baseUrl,
      scrubOpts(warn, adapterCtx?.keepShortcodes),
    );
    if (nodes.length === 0) {
      // marked produced only whitespace/comments — fall back to the source HTML.
      const trimmed = html.trim();
      return trimmed ? [htmlNode(trimmed)] : [];
    }
    return nodes;
  } catch (err) {
    warn(`Markdown adapter failed, using escaped-source fallback: ${(err as Error).message}`);
    return [htmlNode(`<pre>${escapeHtml(source)}</pre>`)];
  }
};
