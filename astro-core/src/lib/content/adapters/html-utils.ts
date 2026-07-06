/**
 * Shared HTML helpers for both content adapters.
 *
 * Two responsibilities:
 *  1. URL rewriting — absolute WordPress URLs (media + internal links) become
 *     root-relative so a static build works regardless of the WP origin.
 *  2. HTML → IR splitting — turn a chunk of raw inner HTML (a DIVI et_pb_text
 *     body, or Gutenberg classic/freeform content) into the structural IR nodes
 *     the design system knows how to render (headings, paragraphs, lists,
 *     images), keeping everything else as passthrough HtmlNode.
 *
 * Ported from the reference converters:
 *  - site_waldorf_astro/.claude/skills/divi-to-astro-content/scripts/divi_to_markdown.py
 *  - site_waldorf/src/wp-content/mu-plugins/waldorf-headless-api.php
 */

import { parse, renderSync, ELEMENT_NODE, TEXT_NODE, COMMENT_NODE } from 'ultrahtml';
import type { ContentNode, HeadingNode, ImageNode, ListNode, NodeStyle } from '../ir';
import { htmlNode } from '../ir';

/* ------------------------------------------------------------------ */
/* URL rewriting                                                       */
/* ------------------------------------------------------------------ */

/**
 * Rewrite an absolute WordPress URL to a root-relative one.
 *
 * Rules (in order):
 *  - empty / anchor / mailto / tel / protocol-relative-non-http → unchanged
 *  - starts with `baseUrl` → strip host, keep path (`https://site/x` → `/x`)
 *  - any absolute http(s) URL whose path is a WP asset (`/wp-content/…`,
 *    `/wp-includes/…`) → make root-relative regardless of host. This is what
 *    lets the same content parse correctly whether the DB stored the production
 *    host or a `localhost:8090` dev host (the PHP/py ports hard-code a host
 *    list; we generalise to "any host, asset path").
 *  - everything else (external links) → unchanged.
 */
export function rewriteUrl(url: string | undefined | null, baseUrl?: string): string {
  if (!url) return url ?? '';
  const trimmed = url.trim();
  if (trimmed === '' || trimmed.startsWith('#') || /^(mailto:|tel:|data:)/i.test(trimmed)) {
    return trimmed;
  }

  if (baseUrl) {
    const base = baseUrl.replace(/\/+$/, '');
    if (trimmed === base) return '/';
    if (trimmed.startsWith(base + '/')) return trimmed.slice(base.length) || '/';
  }

  // Any host, but only for WP asset paths — safe to root-relativise.
  const asset = /^https?:\/\/[^/]+(\/wp-(?:content|includes)\/[^\s"']*)$/i.exec(trimmed);
  if (asset && asset[1]) return asset[1];

  return trimmed;
}

/**
 * Rewrite every `href="…"` / `src="…"` (and `srcset`) inside an HTML string.
 * Used to normalise inline links/images inside heading/paragraph/list nodes
 * whose HTML is kept verbatim.
 */
export function rewriteHtmlUrls(html: string, baseUrl?: string): string {
  if (!html) return html;
  let out = html.replace(
    /\b(href|src)=("|')(.*?)\2/gi,
    (_m, attr: string, q: string, val: string) => `${attr}=${q}${rewriteUrl(val, baseUrl)}${q}`,
  );
  // srcset: rewrite each candidate URL
  out = out.replace(/\bsrcset=("|')(.*?)\1/gi, (_m, q: string, val: string) => {
    const rewritten = val
      .split(',')
      .map((part) => {
        const m = /^\s*(\S+)(\s+.*)?$/.exec(part);
        if (!m || !m[1]) return part;
        return `${rewriteUrl(m[1], baseUrl)}${m[2] ?? ''}`;
      })
      .join(',');
    return `srcset=${q}${rewritten}${q}`;
  });
  return out;
}

/* ------------------------------------------------------------------ */
/* HTML → IR node splitting                                            */
/* ------------------------------------------------------------------ */

type UNode = {
  type: number;
  name?: string;
  value?: string;
  attributes?: Record<string, string>;
  children?: UNode[];
};

/** Block-level tags we pull out into structural IR nodes. */
const HEADING_RE = /^h([1-6])$/;
const BLOCK_TAGS = new Set([
  'p', 'ul', 'ol', 'figure', 'img', 'table', 'blockquote',
  'div', 'section', 'article', 'iframe', 'hr', 'pre',
  'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
]);

function renderInner(node: UNode, baseUrl?: string): string {
  const inner = (node.children ?? []).map((c) => renderSync(c as never)).join('');
  return rewriteHtmlUrls(inner, baseUrl).trim();
}

function renderWhole(node: UNode, baseUrl?: string): string {
  return rewriteHtmlUrls(renderSync(node as never), baseUrl).trim();
}

function firstDescendant(node: UNode, name: string): UNode | undefined {
  for (const c of node.children ?? []) {
    if (c.type === ELEMENT_NODE && c.name === name) return c;
    const nested = firstDescendant(c, name);
    if (nested) return nested;
  }
  return undefined;
}

/** True if the node's only meaningful child is a single <img>. */
function isImageWrapper(node: UNode): UNode | undefined {
  const els = (node.children ?? []).filter(
    (c) => c.type !== TEXT_NODE || (c.value ?? '').trim() !== '',
  );
  const nonImg = els.filter((c) => !(c.type === ELEMENT_NODE && c.name === 'img'));
  const img = els.find((c) => c.type === ELEMENT_NODE && c.name === 'img');
  return nonImg.length === 0 && img ? img : undefined;
}

function imageFromEl(img: UNode, baseUrl?: string, href?: string, style?: NodeStyle): ImageNode {
  const a = img.attributes ?? {};
  const node: ImageNode = {
    type: 'image',
    src: rewriteUrl(a.src ?? '', baseUrl),
    alt: a.alt ?? '',
  };
  if (href) node.href = rewriteUrl(href, baseUrl);
  const w = a.width ? parseInt(a.width, 10) : NaN;
  const h = a.height ? parseInt(a.height, 10) : NaN;
  if (!Number.isNaN(w)) node.width = w;
  if (!Number.isNaN(h)) node.height = h;
  if (style) node.style = style;
  return node;
}

function figureToNode(fig: UNode, baseUrl?: string): ContentNode {
  const img = firstDescendant(fig, 'img');
  if (!img) return htmlNode(renderWhole(fig, baseUrl));
  const link = firstDescendant(fig, 'a');
  const node = imageFromEl(img, baseUrl, link?.attributes?.href);
  const caption = firstDescendant(fig, 'figcaption');
  if (caption) {
    const text = renderInner(caption, baseUrl);
    if (text) node.caption = text;
  }
  return node;
}

/**
 * Split a chunk of raw inner HTML into IR nodes.
 *
 * Top-level block elements become structural nodes; runs of inline content
 * (text, <a>, <strong>, <br>…) are coalesced into ParagraphNodes; anything we
 * don't structurally understand (tables, divs, iframes, pre, blockquote) is
 * kept verbatim as an HtmlNode so nothing is ever dropped.
 */
export function splitHtmlToNodes(html: string, baseUrl?: string): ContentNode[] {
  const src = (html ?? '').trim();
  if (!src) return [];

  let doc: UNode;
  try {
    doc = parse(src) as unknown as UNode;
  } catch {
    return [htmlNode(rewriteHtmlUrls(src, baseUrl))];
  }

  const out: ContentNode[] = [];
  let inlineBuf: string[] = [];

  const flushInline = () => {
    const joined = inlineBuf.join('').trim();
    inlineBuf = [];
    if (joined) out.push({ type: 'paragraph', html: rewriteHtmlUrls(joined, baseUrl) });
  };

  const top = doc.type === ELEMENT_NODE || doc.type === TEXT_NODE ? [doc] : doc.children ?? [];

  for (const child of top) {
    if (child.type === COMMENT_NODE) continue;

    if (child.type === TEXT_NODE) {
      if ((child.value ?? '').trim()) inlineBuf.push(child.value ?? '');
      continue;
    }

    if (child.type !== ELEMENT_NODE || !child.name) continue;
    const tag = child.name.toLowerCase();

    if (!BLOCK_TAGS.has(tag)) {
      // inline element at top level → part of a paragraph
      inlineBuf.push(renderSync(child as never));
      continue;
    }

    flushInline();
    const headingMatch = HEADING_RE.exec(tag);

    if (headingMatch) {
      const inner = renderInner(child, baseUrl);
      if (!inner) continue; // DIVI emits empty <h3></h3> spacers — drop them
      const level = Number(headingMatch[1]) as HeadingNode['level'];
      out.push({ type: 'heading', level, html: inner });
    } else if (tag === 'p') {
      const wrap = isImageWrapper(child);
      if (wrap) {
        out.push(imageFromEl(wrap, baseUrl));
      } else {
        const inner = renderInner(child, baseUrl);
        if (inner) out.push({ type: 'paragraph', html: inner });
      }
    } else if (tag === 'ul' || tag === 'ol') {
      const items = (child.children ?? [])
        .filter((c) => c.type === ELEMENT_NODE && c.name === 'li')
        .map((li) => renderInner(li, baseUrl))
        .filter((t) => t !== '');
      if (items.length) {
        const node: ListNode = { type: 'list', ordered: tag === 'ol', items };
        out.push(node);
      }
    } else if (tag === 'img') {
      out.push(imageFromEl(child, baseUrl));
    } else if (tag === 'figure') {
      out.push(figureToNode(child, baseUrl));
    } else if (tag === 'a') {
      const wrap = isImageWrapper(child);
      if (wrap) out.push(imageFromEl(wrap, baseUrl, child.attributes?.href));
      else {
        const inner = renderWhole(child, baseUrl);
        if (inner) out.push({ type: 'paragraph', html: inner });
      }
    } else {
      // div / table / blockquote / iframe / pre / hr / section → passthrough
      if (tag === 'hr') continue;
      const whole = renderWhole(child, baseUrl);
      if (whole) out.push(htmlNode(whole));
    }
  }

  flushInline();
  return out;
}
