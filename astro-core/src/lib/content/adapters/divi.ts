/**
 * DIVI content adapter: raw `[et_pb_*]` shortcode body → ContentNode[] IR.
 *
 * Strategy: tokenize the whole body with the recursive-descent shortcode
 * tokenizer, then walk the token tree mapping each DIVI module to an IR node.
 * Content modules (et_pb_text / et_pb_tab / et_pb_blurb bodies) hand their raw
 * inner HTML to the shared html-utils splitter, so their headings / paragraphs
 * / lists / images become first-class IR nodes and inline HTML is preserved.
 *
 * Module coverage targets ~95% of real usage. Everything unmapped degrades to
 * an HtmlNode (never dropped) and warns once. Non-DIVI shortcodes nested in
 * text ([kalendar], [caption], [pdfjs-viewer] …) are left verbatim inside the
 * HTML for the site layer to handle, but each distinct name warns once.
 *
 * Ports URL-rewriting intent from divi_to_markdown.py / waldorf-headless-api.php
 * (uploads + internal links → root-relative), generalised in html-utils.
 */

import type {
  AdapterContext,
  ContentAdapter,
  ContentNode,
  ColumnNode,
  ColumnsNode,
  BlurbNode,
  ButtonNode,
  EmbedNode,
  ImageNode,
  PostListNode,
  SectionNode,
  TabsNode,
} from '../ir';
import { htmlNode } from '../ir';
import { fallbackNodes, rewriteUrl, scrubShortcodes, splitHtmlToNodes } from './html-utils';
import {
  tokenizeShortcodes,
  isShortcode,
  type ShortcodeNode,
  type TokenNode,
} from './shortcode-tokenizer';

/* ------------------------------------------------------------------ */
/* small helpers                                                       */
/* ------------------------------------------------------------------ */

function makeWarner(ctx?: AdapterContext) {
  const seen = new Set<string>();
  return (msg: string) => {
    if (seen.has(msg)) return;
    seen.add(msg);
    ctx?.warn?.(msg);
  };
}

/** Convert a DIVI column fraction ("1_3", "2_3", "4_4") to a CSS width. */
export function widthFromType(type: string | undefined): string | undefined {
  if (!type) return undefined;
  const m = /^(\d+)_(\d+)$/.exec(type.trim());
  if (!m) return undefined;
  const num = Number(m[1]);
  const den = Number(m[2]);
  if (!den || !Number.isFinite(num)) return undefined;
  if (num >= den) return '100%';
  // Truncate to 2 decimals (matches the DIVI/Gutenberg convention: 2_3 -> 66.66%,
  // 1_3 -> 33.33%); drop trailing ".00" for clean integers (1_2 -> 50%).
  const pct = Math.floor((num / den) * 10000) / 100;
  const str = Number.isInteger(pct) ? String(pct) : pct.toFixed(2);
  return `${str}%`;
}

function attr(node: ShortcodeNode, name: string): string | undefined {
  const v = node.attrs[name];
  return v === undefined || v === '' ? undefined : v;
}

function isOn(v: string | undefined): boolean {
  return v === 'on' || v === 'yes' || v === '1' || v === 'true';
}

/** Content-bearing HTML for a module: prefer a `content`/`body` attr, else raw inner. */
function moduleHtml(node: ShortcodeNode): string {
  return node.attrs.content ?? node.attrs.body ?? node.rawInner ?? '';
}

/* ------------------------------------------------------------------ */
/* module mapping                                                      */
/* ------------------------------------------------------------------ */

interface Ctx {
  baseUrl?: string;
  warn: (m: string) => void;
  /** Non-DIVI shortcode names to preserve verbatim (passed to the scrubber). */
  keep?: string[];
}

/** Scrub options for the shared html splitter / scrubber. */
function scrubOpts(ctx: Ctx): { warn: (m: string) => void; keep?: string[] } {
  return ctx.keep ? { warn: ctx.warn, keep: ctx.keep } : { warn: ctx.warn };
}

function shortcodeChildren(node: ShortcodeNode): ShortcodeNode[] {
  return node.children.filter(isShortcode);
}

/** Group any run of loose ColumnNodes (DIVI specialty sections) into a ColumnsNode. */
function groupLooseColumns(nodes: ContentNode[]): ContentNode[] {
  const out: ContentNode[] = [];
  let run: ColumnNode[] = [];
  const flush = () => {
    if (run.length) {
      out.push({ type: 'columns', children: run });
      run = [];
    }
  };
  for (const n of nodes) {
    if (n.type === 'column') run.push(n);
    else {
      flush();
      out.push(n);
    }
  }
  flush();
  return out;
}

function mapChildren(children: TokenNode[], ctx: Ctx): ContentNode[] {
  const out: ContentNode[] = [];
  for (const child of children) {
    if (!isShortcode(child)) {
      // stray HTML/text between modules: split it structurally
      if (child.value.trim()) {
        out.push(...splitHtmlToNodes(child.value, ctx.baseUrl, scrubOpts(ctx)));
      }
      continue;
    }
    const mapped = mapModule(child, ctx);
    if (Array.isArray(mapped)) out.push(...mapped);
    else if (mapped) out.push(mapped);
  }
  return out;
}

function mapSection(node: ShortcodeNode, ctx: Ctx): SectionNode {
  const section: SectionNode = {
    type: 'section',
    children: groupLooseColumns(mapChildren(node.children, ctx)),
  };
  if (isOn(attr(node, 'fullwidth'))) section.fullWidth = true;
  return section;
}

function mapRow(node: ShortcodeNode, ctx: Ctx): ColumnsNode {
  const cols: ColumnNode[] = [];
  for (const child of shortcodeChildren(node)) {
    const n = child.name;
    if (n === 'et_pb_column' || n === 'et_pb_column_inner') {
      cols.push(mapColumn(child, ctx));
    } else {
      // non-column child inside a row (rare): fold into a full-width column
      const mapped = mapModule(child, ctx);
      const kids = Array.isArray(mapped) ? mapped : mapped ? [mapped] : [];
      if (kids.length) cols.push({ type: 'column', width: '100%', children: kids });
    }
  }
  return { type: 'columns', children: cols };
}

function mapColumn(node: ShortcodeNode, ctx: Ctx): ColumnNode {
  const col: ColumnNode = { type: 'column', children: mapChildren(node.children, ctx) };
  const width = widthFromType(attr(node, 'type'));
  if (width) col.width = width;
  return col;
}

function mapImage(node: ShortcodeNode, ctx: Ctx): ImageNode {
  const img: ImageNode = {
    type: 'image',
    src: rewriteUrl(attr(node, 'src'), ctx.baseUrl),
    alt: attr(node, 'alt') ?? attr(node, 'title_text') ?? '',
  };
  const href = attr(node, 'url');
  if (href) img.href = rewriteUrl(href, ctx.baseUrl);
  return img;
}

function mapButton(node: ShortcodeNode, ctx: Ctx): ButtonNode {
  const btn: ButtonNode = {
    type: 'button',
    text: attr(node, 'button_text') ?? 'Odkaz',
    href: rewriteUrl(attr(node, 'button_url') ?? '#', ctx.baseUrl),
    variant: 'primary',
  };
  if (isOn(attr(node, 'url_new_window'))) btn.target = '_blank';
  return btn;
}

function mapBlurb(node: ShortcodeNode, ctx: Ctx): BlurbNode {
  const html = scrubShortcodes(moduleHtml(node), scrubOpts(ctx));
  const blurb: BlurbNode = { type: 'blurb', html };
  const title = attr(node, 'title');
  if (title) blurb.title = title;
  const image = attr(node, 'image');
  if (image) blurb.image = rewriteUrl(image, ctx.baseUrl);
  if (isOn(attr(node, 'use_icon'))) {
    const icon = attr(node, 'font_icon');
    if (icon) blurb.icon = icon;
  }
  const href = attr(node, 'url') ?? attr(node, 'link_option_url');
  if (href) blurb.href = rewriteUrl(href, ctx.baseUrl);
  const placement = attr(node, 'icon_placement');
  if (placement === 'left' || placement === 'right' || placement === 'top') {
    blurb.mediaPosition = placement;
  }
  return blurb;
}

function mapTabs(node: ShortcodeNode, ctx: Ctx): TabsNode {
  const tabs: TabsNode['tabs'] = [];
  for (const child of shortcodeChildren(node)) {
    if (child.name !== 'et_pb_tab') continue;
    const html = moduleHtml(child);
    tabs.push({
      title: attr(child, 'title') ?? '',
      children: splitHtmlToNodes(html, ctx.baseUrl, scrubOpts(ctx)),
    });
  }
  return { type: 'tabs', tabs };
}

/** et_pb_accordion / et_pb_toggle -> TabsNode (each toggle becomes a tab). */
function mapAccordion(node: ShortcodeNode, ctx: Ctx): TabsNode {
  const toggles = node.name === 'et_pb_toggle' ? [node] : shortcodeChildren(node).filter((c) => c.name === 'et_pb_toggle');
  const tabs = toggles.map((t) => {
    const html = moduleHtml(t);
    return { title: attr(t, 'title') ?? '', children: splitHtmlToNodes(html, ctx.baseUrl, scrubOpts(ctx)) };
  });
  return { type: 'tabs', tabs };
}

function mapBlog(node: ShortcodeNode): PostListNode {
  const list: PostListNode = {
    type: 'postlist',
    postType: attr(node, 'post_type') ?? 'post',
    perPage: Number(attr(node, 'posts_number') ?? '10') || 10,
  };
  const cats = attr(node, 'include_categories');
  if (cats) {
    const ids = cats.split(',').map((s) => Number(s.trim())).filter((n) => Number.isFinite(n));
    if (ids.length) list.categories = ids;
  }
  const cols = Number(attr(node, 'columns') ?? '');
  if (Number.isFinite(cols) && cols > 0) list.columns = cols;
  return list;
}

/** et_pb_cta -> a Section carrying the promo heading, body and button.
 *  (Chosen over a Blurb because a CTA is a full-width band, not a media card.) */
function mapCta(node: ShortcodeNode, ctx: Ctx): SectionNode {
  const children: ContentNode[] = [];
  const title = attr(node, 'title');
  if (title) children.push({ type: 'heading', level: 2, html: title });
  const body = moduleHtml(node);
  if (body.trim()) {
    children.push(...splitHtmlToNodes(body, ctx.baseUrl, scrubOpts(ctx)));
  }
  const buttonText = attr(node, 'button_text');
  if (buttonText) {
    const btn: ButtonNode = {
      type: 'button',
      text: buttonText,
      href: rewriteUrl(attr(node, 'button_url') ?? '#', ctx.baseUrl),
      variant: 'primary',
    };
    if (isOn(attr(node, 'url_new_window'))) btn.target = '_blank';
    children.push(btn);
  }
  return { type: 'section', children };
}

function mapVideo(node: ShortcodeNode, ctx: Ctx): EmbedNode | null {
  const url = attr(node, 'src');
  if (!url) return null;
  return { type: 'embed', url: rewriteUrl(url, ctx.baseUrl) };
}

/** Dispatch a single DIVI module to IR. Returns node(s) or null (skip). */
function mapModule(node: ShortcodeNode, ctx: Ctx): ContentNode | ContentNode[] | null {
  const name = node.name;

  switch (name) {
    case 'et_pb_section':
      return mapSection(node, ctx);
    case 'et_pb_row':
    case 'et_pb_row_inner':
      return mapRow(node, ctx);
    case 'et_pb_column':
    case 'et_pb_column_inner':
      return mapColumn(node, ctx);
    case 'et_pb_text': {
      const html = moduleHtml(node);
      return splitHtmlToNodes(html, ctx.baseUrl, scrubOpts(ctx));
    }
    case 'et_pb_image':
    case 'et_pb_fullwidth_image':
      return mapImage(node, ctx);
    case 'et_pb_button':
      return mapButton(node, ctx);
    case 'et_pb_blurb':
      return mapBlurb(node, ctx);
    case 'et_pb_tabs':
      return mapTabs(node, ctx);
    case 'et_pb_accordion':
    case 'et_pb_toggle':
      return mapAccordion(node, ctx);
    case 'et_pb_blog':
    case 'et_pb_fullwidth_post_content':
      return mapBlog(node);
    case 'et_pb_cta':
    case 'et_pb_fullwidth_header':
      return mapCta(node, ctx);
    case 'et_pb_video':
    case 'et_pb_fullwidth_video':
      return mapVideo(node, ctx);
    case 'et_pb_code':
    case 'et_pb_fullwidth_code': {
      const html = moduleHtml(node);
      return html.trim() ? htmlNode(html) : null;
    }
    case 'et_pb_divider':
    case 'et_pb_fullwidth_divider':
      return null; // decorative-only: skip
    default: {
      if (name.startsWith('et_pb_')) {
        ctx.warn(`unmapped DIVI module ${name} -> HTML fallback`);
        const html = moduleHtml(node);
        return html.trim() ? htmlNode(html) : null;
      }
      // A non-DIVI shortcode at module position ([kalendar], [pdfjs-viewer]…):
      // scrub it (self-closing/inline dropped, enclosing unwrapped) unless the
      // site keeps it. Whatever inner content survives is split structurally.
      const scrubbed = scrubShortcodes(node.raw, scrubOpts(ctx)).trim();
      if (!scrubbed) return null;
      if (scrubbed === node.raw.trim()) return htmlNode(node.raw); // kept verbatim
      return splitHtmlToNodes(scrubbed, ctx.baseUrl, scrubOpts(ctx));
    }
  }
}

/* ------------------------------------------------------------------ */
/* adapter entrypoint                                                  */
/* ------------------------------------------------------------------ */

export const diviAdapter: ContentAdapter = (raw, adapterCtx) => {
  const warn = makeWarner(adapterCtx);
  const ctx: Ctx = { warn };
  if (adapterCtx?.baseUrl) ctx.baseUrl = adapterCtx.baseUrl;
  if (adapterCtx?.keepShortcodes) ctx.keep = adapterCtx.keepShortcodes;

  try {
    const tokens = tokenizeShortcodes(raw ?? '');
    const nodes = groupLooseColumns(mapChildren(tokens, ctx));
    if (nodes.length === 0) {
      return fallbackNodes(adapterCtx?.fallbackHtml ?? raw ?? '', scrubOpts(ctx));
    }
    return nodes;
  } catch (err) {
    warn(`DIVI adapter failed, using HTML fallback: ${(err as Error).message}`);
    return fallbackNodes(adapterCtx?.fallbackHtml ?? raw ?? '', scrubOpts(ctx));
  }
};
