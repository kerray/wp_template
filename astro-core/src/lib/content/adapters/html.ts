/**
 * HTML passthrough adapter: raw HTML → ContentNode[] IR.
 *
 * For items whose canonical source is already HTML (`engine: 'html'`), and the
 * safe default when no builder markers are detected. Rather than wrapping the
 * whole body in one opaque HtmlNode, it runs the shared `splitHtmlToNodes`
 * splitter so top-level headings/paragraphs/lists/images still become structural
 * IR nodes (and thus get design-system styling), while anything unstructured
 * (tables, blockquotes, divs, iframes) is preserved verbatim as an HtmlNode and
 * later sanitised by Prose.
 *
 * Never throws: a parse failure degrades to a single HtmlNode of the source.
 */

import type { AdapterContext, ContentAdapter } from '../ir';
import { htmlNode } from '../ir';
import { splitHtmlToNodes, rewriteHtmlUrls, type ScrubOptions } from './html-utils';

function makeWarner(ctx?: AdapterContext) {
  const seen = new Set<string>();
  return (msg: string) => {
    if (seen.has(msg)) return;
    seen.add(msg);
    ctx?.warn?.(msg);
  };
}

export const htmlAdapter: ContentAdapter = (raw, adapterCtx) => {
  const warn = makeWarner(adapterCtx);
  const source = (raw ?? '').trim();
  if (source === '') return [];

  const opts: ScrubOptions = adapterCtx?.keepShortcodes
    ? { warn, keep: adapterCtx.keepShortcodes }
    : { warn };

  try {
    const nodes = splitHtmlToNodes(source, adapterCtx?.baseUrl, opts);
    if (nodes.length > 0) return nodes;
    return [htmlNode(rewriteHtmlUrls(source, adapterCtx?.baseUrl))];
  } catch (err) {
    warn(`HTML adapter failed, using verbatim fallback: ${(err as Error).message}`);
    return [htmlNode(rewriteHtmlUrls(source, adapterCtx?.baseUrl))];
  }
};
