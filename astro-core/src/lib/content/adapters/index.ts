/**
 * Content adapters: raw WordPress `post_content` → shared ContentNode[] IR.
 *
 * Pick one per site via `site.config.ts` `contentEngine`:
 *   - 'gutenberg' → gutenbergAdapter (block-serialization parser)
 *   - 'divi'      → diviAdapter (recursive shortcode tokenizer)
 *
 * Both implement `ContentAdapter` from ../ir and never throw.
 */

export { gutenbergAdapter } from './gutenberg';
export { diviAdapter } from './divi';

export type { ContentAdapter } from '../ir';
