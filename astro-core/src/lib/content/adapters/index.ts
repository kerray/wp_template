/**
 * Content adapters: raw WordPress source → shared ContentNode[] IR.
 *
 * Selection is now PER ITEM, not one global engine. Each page/post/akce carries
 * an `engine` ('markdown' | 'gutenberg' | 'divi' | 'html') and a `raw` canonical
 * source; the loader resolves the engine (honouring the API field, else sniffing
 * the source, else the site's `contentEngine` default hint — see `engine.ts`) and
 * routes each item through the matching adapter here:
 *   - 'markdown'  → markdownAdapter  (Markdown → HTML → shared splitter → IR)
 *   - 'gutenberg' → gutenbergAdapter (block-serialization parser)
 *   - 'divi'      → diviAdapter      (recursive shortcode tokenizer)
 *   - 'html'      → htmlAdapter       (HTML passthrough via the shared splitter)
 *
 * All implement `ContentAdapter` from ../ir and never throw.
 */

import type { ContentAdapter } from '../ir';
import { gutenbergAdapter } from './gutenberg';
import { diviAdapter } from './divi';
import { markdownAdapter } from './markdown';
import { htmlAdapter } from './html';
import type { ContentEngine } from './engine';

export { gutenbergAdapter } from './gutenberg';
export { diviAdapter } from './divi';
export { markdownAdapter } from './markdown';
export { htmlAdapter } from './html';

export type { ContentAdapter } from '../ir';
export {
  type ContentEngine,
  CONTENT_ENGINES,
  asContentEngine,
  detectEngine,
  resolveEngine,
} from './engine';

/** Registry: engine name → adapter. */
const ADAPTERS: Record<ContentEngine, ContentAdapter> = {
  markdown: markdownAdapter,
  gutenberg: gutenbergAdapter,
  divi: diviAdapter,
  html: htmlAdapter,
};

/** Pick the adapter for a resolved engine. Falls back to the HTML passthrough. */
export function getAdapter(engine: ContentEngine): ContentAdapter {
  return ADAPTERS[engine] ?? htmlAdapter;
}
