/**
 * Shared intermediate representation (IR) for WordPress content.
 *
 * Both content adapters (Gutenberg, DIVI) emit ContentNode trees;
 * ContentRenderer.astro walks the tree and maps nodes to Astro components.
 *
 * Design rules:
 * - Small and structural: node types cover the real module/block inventory,
 *   everything else degrades to HtmlNode (never throw, never drop silently).
 * - Styling is whitelisted/normalized in NodeStyle; the design system wins,
 *   source-builder styling (DIVI attrs, theme.json) is deliberately dropped.
 */

export interface NodeStyle {
  align?: 'left' | 'center' | 'right';
  /** background color/token hint; components decide whether to honor it */
  bg?: string;
  /** id anchor for in-page links */
  anchor?: string;
  /** extra class hint (rare; passthrough for curated content) */
  className?: string;
}

interface BaseNode {
  style?: NodeStyle;
}

/* ------------------------------- layout -------------------------------- */

export interface SectionNode extends BaseNode {
  type: 'section';
  fullWidth?: boolean;
  children: ContentNode[];
}

/** DIVI row / core/columns */
export interface ColumnsNode extends BaseNode {
  type: 'columns';
  children: ColumnNode[];
}

export interface ColumnNode extends BaseNode {
  type: 'column';
  /** CSS width fraction, e.g. "33.33%" (DIVI "1_3") or Gutenberg column width */
  width?: string;
  children: ContentNode[];
}

/* ---------------------------- leaf content ----------------------------- */

export interface HeadingNode extends BaseNode {
  type: 'heading';
  level: 1 | 2 | 3 | 4 | 5 | 6;
  /** inline HTML allowed (links, em/strong) */
  html: string;
}

export interface ParagraphNode extends BaseNode {
  type: 'paragraph';
  html: string;
}

export interface ListNode extends BaseNode {
  type: 'list';
  ordered: boolean;
  /** each item is inline HTML */
  items: string[];
}

export interface ImageNode extends BaseNode {
  type: 'image';
  src: string;
  alt: string;
  href?: string;
  width?: number;
  height?: number;
  caption?: string;
}

export interface ButtonNode extends BaseNode {
  type: 'button';
  text: string;
  href: string;
  target?: string;
  /** design-system variant, e.g. 'primary' | 'secondary' */
  variant?: string;
}

export interface ButtonGroupNode extends BaseNode {
  type: 'buttongroup';
  children: ButtonNode[];
}

/** DIVI et_pb_blurb / core/media-text: media + title + rich body, optional link */
export interface BlurbNode extends BaseNode {
  type: 'blurb';
  image?: string;
  icon?: string;
  title?: string;
  html: string;
  href?: string;
  mediaPosition?: 'top' | 'left' | 'right';
}

export interface TabsNode extends BaseNode {
  type: 'tabs';
  tabs: Array<{ title: string; children: ContentNode[] }>;
}

export interface EmbedNode extends BaseNode {
  type: 'embed';
  provider?: string;
  url: string;
  /** provider oEmbed HTML when available */
  html?: string;
}

/**
 * Dynamic post listing (et_pb_blog / core/query). Rendered at build time by
 * PostList.astro, which runs the corresponding REST query.
 */
export interface PostListNode extends BaseNode {
  type: 'postlist';
  postType: string;
  perPage: number;
  categories?: number[];
  columns?: number;
}

/**
 * Escape hatch / passthrough: unknown blocks/modules carry their source HTML.
 * Rendered via the single sanitized set:html sink (Prose.astro).
 */
export interface HtmlNode extends BaseNode {
  type: 'html';
  html: string;
}

/* -------------------------------- union -------------------------------- */

export type ContentNode =
  | SectionNode
  | ColumnsNode
  | ColumnNode
  | HeadingNode
  | ParagraphNode
  | ListNode
  | ImageNode
  | ButtonNode
  | ButtonGroupNode
  | BlurbNode
  | TabsNode
  | EmbedNode
  | PostListNode
  | HtmlNode;

export type ContentNodeType = ContentNode['type'];

/* ------------------------------ adapters ------------------------------- */

export interface AdapterContext {
  /** surfaced in the build log; adapters call this for every unmapped block/module */
  warn?: (message: string) => void;
  /** WP origin used to rewrite upload/internal URLs to root-relative */
  baseUrl?: string;
  /** server-rendered HTML for the whole post; last-resort fallback material */
  fallbackHtml?: string;
}

/** An adapter turns raw post_content into an IR tree. Must never throw. */
export type ContentAdapter = (raw: string, ctx?: AdapterContext) => ContentNode[];

export function htmlNode(html: string, style?: NodeStyle): HtmlNode {
  return style ? { type: 'html', html, style } : { type: 'html', html };
}

/** Type guard helper for nodes with children of ContentNode[] shape. */
export function hasChildren(
  node: ContentNode,
): node is SectionNode | ColumnsNode | ColumnNode {
  return node.type === 'section' || node.type === 'columns' || node.type === 'column';
}
