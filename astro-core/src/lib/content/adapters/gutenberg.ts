/**
 * Gutenberg content adapter: raw block `post_content` → ContentNode[] IR.
 *
 * Uses `@wordpress/block-serialization-default-parser` (WP-core maintained,
 * pure function, runs in Node) to get the block tree, then maps ~20 core blocks
 * to IR. Rich-text leaves (heading/paragraph/list/image) reuse the shared
 * html-utils splitter so inline HTML and URL rewriting are handled in one place.
 *
 * Degradation rules (never throw, never silently drop):
 *  - unknown *static* block (innerHTML non-empty)  -> HtmlNode + warn
 *  - unknown *dynamic* block (innerHTML empty)      -> skip + warn
 *  - core/block (reusable/synced) ref               -> skip + warn
 *  - freeform / null blockName (classic content)    -> html-utils splitter
 *  - catastrophic parse failure                     -> [HtmlNode(fallback)] + warn
 */

import { parse } from '@wordpress/block-serialization-default-parser';
import type {
  AdapterContext,
  ContentAdapter,
  ContentNode,
  BlurbNode,
  ButtonNode,
  ColumnNode,
  EmbedNode,
  HeadingNode,
  ListNode,
  PostListNode,
  SectionNode,
} from '../ir';
import { htmlNode } from '../ir';
import { rewriteHtmlUrls, rewriteUrl, splitHtmlToNodes } from './html-utils';

interface WPBlock {
  blockName: string | null;
  attrs: Record<string, unknown>;
  innerBlocks: WPBlock[];
  innerHTML: string;
  innerContent: Array<string | null>;
}

interface Ctx {
  baseUrl?: string;
  warn: (m: string) => void;
}

function makeWarner(ctx?: AdapterContext) {
  const seen = new Set<string>();
  return (msg: string) => {
    if (seen.has(msg)) return;
    seen.add(msg);
    ctx?.warn?.(msg);
  };
}

function str(v: unknown): string | undefined {
  return typeof v === 'string' && v !== '' ? v : undefined;
}

function num(v: unknown): number | undefined {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim() !== '' && Number.isFinite(Number(v))) return Number(v);
  return undefined;
}

/** Inner HTML of the first element matching /<tag …>(inner)<\/tag>/. */
function innerOfTag(html: string, tag: string): { level?: number; inner: string } | null {
  const m = new RegExp(`<${tag}([1-6])?[^>]*>([\\s\\S]*?)<\\/${tag}\\1?>`, 'i').exec(html);
  if (!m) return null;
  const res: { level?: number; inner: string } = { inner: m[2] ?? '' };
  if (m[1]) res.level = Number(m[1]);
  return res;
}

function mapBlocks(blocks: WPBlock[], ctx: Ctx): ContentNode[] {
  const out: ContentNode[] = [];
  for (const block of blocks) {
    const mapped = mapBlock(block, ctx);
    if (Array.isArray(mapped)) out.push(...mapped);
    else if (mapped) out.push(mapped);
  }
  return out;
}

function mapHeading(block: WPBlock, ctx: Ctx): HeadingNode {
  const found = innerOfTag(block.innerHTML, 'h');
  const level = (num(block.attrs.level) ?? found?.level ?? 2) as HeadingNode['level'];
  const inner = found?.inner ?? block.innerHTML;
  return { type: 'heading', level, html: rewriteHtmlUrls(inner.trim(), ctx.baseUrl) };
}

function mapList(block: WPBlock, ctx: Ctx): ListNode | ContentNode[] {
  const ordered = block.attrs.ordered === true || str(block.attrs.type) === 'ol';
  // Modern Gutenberg: innerBlocks of core/list-item. Legacy: <ul>/<ol> in innerHTML.
  const items = block.innerBlocks
    .filter((b) => b.blockName === 'core/list-item')
    .map((b) => {
      const li = innerOfTag(b.innerHTML, 'li');
      return rewriteHtmlUrls((li?.inner ?? b.innerHTML).trim(), ctx.baseUrl);
    })
    .filter((t) => t !== '');
  if (items.length) return { type: 'list', ordered, items };
  // legacy path: let the splitter build the list from raw HTML
  return splitHtmlToNodes(block.innerHTML, ctx.baseUrl);
}

function mapButton(block: WPBlock, ctx: Ctx): ButtonNode | null {
  const m = /<a\b([^>]*)>([\s\S]*?)<\/a>/i.exec(block.innerHTML);
  const hrefAttr = m ? /\bhref=("|')(.*?)\1/i.exec(m[1]!) : null;
  const href = str(block.attrs.url) ?? hrefAttr?.[2] ?? '#';
  const text = (str(block.attrs.text) ?? (m ? m[2]! : '')).replace(/<[^>]+>/g, '').trim();
  if (!text && href === '#') return null;
  const btn: ButtonNode = {
    type: 'button',
    text: text || 'Odkaz',
    href: rewriteUrl(href, ctx.baseUrl),
    variant: 'primary',
  };
  if (str(block.attrs.linkTarget) === '_blank' || /target=("|')_blank\1/i.test(block.innerHTML)) {
    btn.target = '_blank';
  }
  return btn;
}

function mapMediaText(block: WPBlock, ctx: Ctx): BlurbNode {
  const html = block.innerBlocks.map((b) => b.innerHTML).join('\n');
  const blurb: BlurbNode = { type: 'blurb', html: rewriteHtmlUrls(html, ctx.baseUrl) };
  const media = str(block.attrs.mediaUrl);
  if (media) blurb.image = rewriteUrl(media, ctx.baseUrl);
  const pos = str(block.attrs.mediaPosition);
  if (pos === 'left' || pos === 'right') blurb.mediaPosition = pos;
  else blurb.mediaPosition = 'left';
  return blurb;
}

function mapEmbed(block: WPBlock, ctx: Ctx): EmbedNode | ContentNode | null {
  const url = str(block.attrs.url);
  if (!url) {
    return block.innerHTML.trim() ? htmlNode(rewriteHtmlUrls(block.innerHTML, ctx.baseUrl)) : null;
  }
  const embed: EmbedNode = { type: 'embed', url };
  const provider = str(block.attrs.providerNameSlug);
  if (provider) embed.provider = provider;
  return embed;
}

function mapQuery(block: WPBlock): PostListNode {
  const q = (block.attrs.query as Record<string, unknown> | undefined) ?? {};
  const list: PostListNode = {
    type: 'postlist',
    postType: str(q.postType) ?? 'post',
    perPage: num(q.perPage) ?? 10,
  };
  const tax = q.taxQuery as Record<string, unknown> | undefined;
  const cats = tax?.category;
  if (Array.isArray(cats)) {
    const ids = cats.map((c) => Number(c)).filter((n) => Number.isFinite(n));
    if (ids.length) list.categories = ids;
  }
  const cols = num((block.attrs.displayLayout as Record<string, unknown> | undefined)?.columns);
  if (cols && cols > 0) list.columns = cols;
  return list;
}

function mapBlock(block: WPBlock, ctx: Ctx): ContentNode | ContentNode[] | null {
  const name = block.blockName;

  // freeform / classic content
  if (name === null || name === 'core/freeform') {
    return block.innerHTML.trim() ? splitHtmlToNodes(block.innerHTML, ctx.baseUrl) : null;
  }

  switch (name) {
    case 'core/heading':
      return mapHeading(block, ctx);
    case 'core/paragraph':
      return block.innerHTML.trim() ? splitHtmlToNodes(block.innerHTML, ctx.baseUrl) : null;
    case 'core/list':
      return mapList(block, ctx);
    case 'core/list-item':
      // reached standalone (shouldn't normally): treat as paragraph-ish HTML
      return block.innerHTML.trim() ? splitHtmlToNodes(block.innerHTML, ctx.baseUrl) : null;
    case 'core/image':
      return block.innerHTML.trim()
        ? splitHtmlToNodes(block.innerHTML, ctx.baseUrl)
        : null;
    case 'core/columns':
      return { type: 'columns', children: mapBlocks(block.innerBlocks, ctx).filter((n): n is ColumnNode => n.type === 'column') };
    case 'core/column': {
      const col: ColumnNode = { type: 'column', children: mapBlocks(block.innerBlocks, ctx) };
      const width = str(block.attrs.width);
      if (width) col.width = width;
      return col;
    }
    case 'core/group': {
      const section: SectionNode = { type: 'section', children: mapBlocks(block.innerBlocks, ctx) };
      return section;
    }
    case 'core/cover': {
      const section: SectionNode = { type: 'section', children: mapBlocks(block.innerBlocks, ctx) };
      const bg = str(block.attrs.url) ?? str(block.attrs.customOverlayColor) ?? str(block.attrs.overlayColor);
      if (bg) section.style = { bg: rewriteUrl(bg, ctx.baseUrl) };
      return section;
    }
    case 'core/buttons':
      return {
        type: 'buttongroup',
        children: mapBlocks(block.innerBlocks, ctx).filter((n): n is ButtonNode => n.type === 'button'),
      };
    case 'core/button':
      return mapButton(block, ctx);
    case 'core/media-text':
      return mapMediaText(block, ctx);
    case 'core/embed':
      return mapEmbed(block, ctx);
    case 'core/query':
      return mapQuery(block);
    case 'core/separator':
    case 'core/spacer':
      return null; // decorative-only: skip
    case 'core/html':
    case 'core/quote':
    case 'core/pullquote':
    case 'core/table':
    case 'core/preformatted':
    case 'core/verse':
    case 'core/code':
      return block.innerHTML.trim() ? htmlNode(rewriteHtmlUrls(block.innerHTML, ctx.baseUrl)) : null;
    case 'core/shortcode':
      ctx.warn(`core/shortcode passed through verbatim: ${block.innerHTML.trim().slice(0, 60)}`);
      return block.innerHTML.trim() ? htmlNode(block.innerHTML.trim()) : null;
    case 'core/block':
      ctx.warn('reusable block ref not resolved (core/block) — skipped');
      return null;
    default: {
      if (block.innerHTML.trim()) {
        ctx.warn(`unmapped block ${name} -> HTML fallback`);
        return htmlNode(rewriteHtmlUrls(block.innerHTML, ctx.baseUrl));
      }
      ctx.warn(`unmapped dynamic block ${name} -> skipped (no static HTML)`);
      return null;
    }
  }
}

export const gutenbergAdapter: ContentAdapter = (raw, adapterCtx) => {
  const warn = makeWarner(adapterCtx);
  const ctx: Ctx = { warn };
  if (adapterCtx?.baseUrl) ctx.baseUrl = adapterCtx.baseUrl;

  try {
    const blocks = parse(raw ?? '') as unknown as WPBlock[];
    const nodes = mapBlocks(blocks, ctx);
    if (nodes.length === 0) {
      const fallback = adapterCtx?.fallbackHtml ?? raw ?? '';
      return fallback.trim() ? [htmlNode(fallback)] : [];
    }
    return nodes;
  } catch (err) {
    warn(`Gutenberg adapter failed, using HTML fallback: ${(err as Error).message}`);
    const fallback = adapterCtx?.fallbackHtml ?? raw ?? '';
    return [htmlNode(fallback)];
  }
};
