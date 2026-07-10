/**
 * Per-item content engine resolution.
 *
 * The WordPress feed decides, PER post/page, which builder produced its body.
 * The headless API contract adds two fields to each item:
 *   - `engine`: 'markdown' | 'gutenberg' | 'divi' | 'html'
 *   - `raw`:    the canonical source (markdown text, Gutenberg block markup,
 *               DIVI shortcodes, or HTML)
 *
 * This module is the single source of truth for turning those (possibly absent)
 * fields into a concrete engine. It is pure — no adapter imports, no heavy deps —
 * so it can be used from the loader without pulling parser code into the graph.
 *
 * Resolution order:
 *   1. An explicit, valid API `engine` wins outright.
 *   2. Otherwise sniff the raw source: `<!-- wp:` → gutenberg, `[et_pb_` → divi.
 *   3. Otherwise fall back to the site's `contentEngine` default hint
 *      (`site.config.ts`), or 'html' when even that is absent.
 *
 * The design deliberately works BOTH before and after the backend lands the
 * contract: when `engine`/`raw` are missing the detection path reproduces the
 * previous global behaviour.
 */

export type ContentEngine = 'markdown' | 'gutenberg' | 'divi' | 'html';

export const CONTENT_ENGINES: readonly ContentEngine[] = [
  'markdown',
  'gutenberg',
  'divi',
  'html',
] as const;

/** Narrow an arbitrary value to a known engine, or undefined. */
export function asContentEngine(value: unknown): ContentEngine | undefined {
  return typeof value === 'string' && (CONTENT_ENGINES as readonly string[]).includes(value)
    ? (value as ContentEngine)
    : undefined;
}

/**
 * Sniff the engine from raw source markers only.
 *   - Gutenberg block markup carries `<!-- wp:` delimiters.
 *   - DIVI shortcodes carry `[et_pb_` tokens.
 * Anything else is left to the caller's fallback (returns undefined here).
 */
export function detectEngine(raw: string | undefined | null): ContentEngine | undefined {
  if (!raw) return undefined;
  if (/<!--\s*wp:/.test(raw)) return 'gutenberg';
  if (/\[et_pb_/i.test(raw)) return 'divi';
  return undefined;
}

/**
 * Resolve the engine for one item.
 *
 * @param apiEngine  the item's `engine` field from the API (may be undefined).
 * @param raw        the item's canonical source, used for marker detection.
 * @param fallback   the site `contentEngine` default hint (may be undefined).
 */
export function resolveEngine(
  apiEngine: unknown,
  raw: string | undefined | null,
  fallback?: ContentEngine,
): ContentEngine {
  return asContentEngine(apiEngine) ?? detectEngine(raw) ?? fallback ?? 'html';
}
