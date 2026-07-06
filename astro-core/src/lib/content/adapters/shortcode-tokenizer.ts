/**
 * Recursive-descent tokenizer for WordPress / DIVI shortcodes.
 *
 * Why not a flat regex: DIVI bodies nest structurally
 * (`[et_pb_section][et_pb_row][et_pb_column][et_pb_text]…`), reuse the same tag
 * name at different depths via `_inner` suffixes, embed HTML (including `]`
 * characters and HTML comments) inside module content, and — on legacy content
 * — occasionally leave tags unbalanced. A regex can't track nesting; this does.
 *
 * Output is a small token tree (`ShortcodeNode` | `TextToken`). It carries the
 * raw inner substring of every enclosing shortcode so a content module
 * (et_pb_text, et_pb_tab, et_pb_blurb) can hand its raw HTML straight to the
 * html-utils splitter, and the full raw slice so an unknown shortcode can be
 * passed through verbatim.
 *
 * Design goals from the spec:
 *  - `[tag attr="v"]…[/tag]`, self-closing `[tag /]`, and unclosed legacy tags.
 *  - same-name nesting via recursion (handles `et_pb_row_inner` etc. naturally).
 *  - attribute values with URL-encoded quotes (`%22`) and HTML entities.
 *  - ignore shortcode-looking text inside HTML comments (`<!-- … -->`).
 *  - never throw; recover from garbage as literal text.
 */

export interface ShortcodeNode {
  type: 'shortcode';
  name: string;
  attrs: Record<string, string>;
  children: TokenNode[];
  /** raw source between the open tag's `]` and the matching `[/name]` (or EOF) */
  rawInner: string;
  /** full raw source of the shortcode including its open/close tags */
  raw: string;
  selfClosing: boolean;
}

export interface TextToken {
  type: 'text';
  value: string;
}

export type TokenNode = ShortcodeNode | TextToken;

/** Decode the HTML entities DIVI stores inside attribute values. */
export function decodeEntities(input: string): string {
  if (!input || input.indexOf('&') === -1) return input;
  return input
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&#x27;|&apos;/gi, "'")
    .replace(/&#0?38;/g, '&')
    .replace(/&#8217;/g, '’')
    .replace(/&#8211;/g, '–')
    .replace(/&#8230;/g, '…')
    .replace(/&nbsp;/g, ' ')
    .replace(/&#(\d+);/g, (_m, d: string) => safeCodePoint(parseInt(d, 10)))
    .replace(/&#x([0-9a-f]+);/gi, (_m, h: string) => safeCodePoint(parseInt(h, 16)));
}

function safeCodePoint(cp: number): string {
  try {
    return Number.isFinite(cp) ? String.fromCodePoint(cp) : '';
  } catch {
    return '';
  }
}

const NAME_RE = /^[a-zA-Z][\w-]*/;
const ATTR_RE = /([\w:-]+)\s*=\s*("([^"]*)"|'([^']*)'|([^\s\]]+))|([\w:-]+)(?=[\s\]])/g;

function parseAttrs(blob: string): Record<string, string> {
  const attrs: Record<string, string> = {};
  ATTR_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  while ((m = ATTR_RE.exec(blob)) !== null) {
    if (m[1]) {
      const raw = m[3] ?? m[4] ?? m[5] ?? '';
      attrs[m[1].toLowerCase()] = decodeEntities(raw);
    } else if (m[6]) {
      // bare attribute, e.g. [et_pb_column type="4_4" disabled] -> "disabled": ""
      attrs[m[6].toLowerCase()] = '';
    }
  }
  return attrs;
}

interface RawTag {
  kind: 'open' | 'close';
  name: string;
  attrsBlob: string;
  selfClosing: boolean;
  /** index just past the closing `]` */
  end: number;
}

export class ShortcodeTokenizer {
  private pos = 0;

  constructor(private readonly src: string) {}

  tokenize(): TokenNode[] {
    return this.parseSequence([]);
  }

  /**
   * Parse a run of nodes. `stack` is the chain of ancestor tag names; the top
   * is the close tag we're waiting for. Returns when it consumes `[/top]`,
   * hits EOF, or sees a close tag for an ancestor higher up the stack (which it
   * leaves un-consumed for that ancestor to handle — graceful unbalance).
   */
  private parseSequence(stack: string[]): TokenNode[] {
    const nodes: TokenNode[] = [];
    const expected = stack.length ? stack[stack.length - 1] : null;
    let textBuf = '';
    const flushText = () => {
      if (textBuf) {
        nodes.push({ type: 'text', value: textBuf });
        textBuf = '';
      }
    };

    while (this.pos < this.src.length) {
      const lb = this.src.indexOf('[', this.pos);
      if (lb === -1) {
        textBuf += this.src.slice(this.pos);
        this.pos = this.src.length;
        break;
      }

      // Shortcode-looking text inside an HTML comment is literal text.
      const commentEnd = this.insideComment(lb);
      if (commentEnd !== -1) {
        textBuf += this.src.slice(this.pos, commentEnd);
        this.pos = commentEnd;
        continue;
      }

      textBuf += this.src.slice(this.pos, lb);

      const tag = this.readTag(lb);
      if (!tag) {
        // not a real tag: keep the '[' as literal text
        textBuf += '[';
        this.pos = lb + 1;
        continue;
      }

      if (tag.kind === 'close') {
        if (tag.name === expected) {
          flushText();
          this.pos = tag.end;
          this.lastCloseStart = lb;
          return nodes;
        }
        if (stack.includes(tag.name)) {
          // belongs to an ancestor: unwind without consuming
          flushText();
          this.pos = lb;
          this.lastCloseStart = lb;
          return nodes;
        }
        // stray close with no matching open: literal text
        textBuf += this.src.slice(lb, tag.end);
        this.pos = tag.end;
        continue;
      }

      // open tag
      flushText();
      const openStart = lb;
      const innerStart = tag.end;

      if (tag.selfClosing) {
        nodes.push({
          type: 'shortcode',
          name: tag.name,
          attrs: parseAttrs(tag.attrsBlob),
          children: [],
          rawInner: '',
          raw: this.src.slice(openStart, tag.end),
          selfClosing: true,
        });
        this.pos = tag.end;
        continue;
      }

      this.pos = innerStart;
      const children = this.parseSequence([...stack, tag.name]);
      // parseSequence set lastCloseStart to the matching `[/name]` bracket
      // (consumed) or to the unwind/EOF position (not consumed).
      const innerEnd = this.lastCloseStart >= innerStart ? this.lastCloseStart : this.pos;
      nodes.push({
        type: 'shortcode',
        name: tag.name,
        attrs: parseAttrs(tag.attrsBlob),
        children,
        rawInner: this.src.slice(innerStart, innerEnd),
        raw: this.src.slice(openStart, this.pos),
        selfClosing: false,
      });
    }

    flushText();
    this.lastCloseStart = this.pos; // EOF: unclosed tag recovered gracefully
    return nodes;
  }

  private lastCloseStart = -1;

  /** If `at` sits inside an unclosed `<!-- … -->`, return the index past `-->`. */
  private insideComment(at: number): number {
    const openC = this.src.lastIndexOf('<!--', at);
    if (openC === -1) return -1;
    const closeC = this.src.indexOf('-->', openC);
    if (closeC !== -1 && closeC < at) return -1; // comment already closed before `at`
    if (closeC === -1) return this.src.length; // unterminated comment: rest is text
    return closeC + 3;
  }

  /** Read a `[tag …]` or `[/tag]` at `lb`, or null if it isn't a shortcode. */
  private readTag(lb: number): RawTag | null {
    let i = lb + 1;
    const isClose = this.src[i] === '/';
    if (isClose) i += 1;

    const nameMatch = NAME_RE.exec(this.src.slice(i));
    if (!nameMatch) return null;
    const name = nameMatch[0].toLowerCase();
    i += nameMatch[0].length;

    // Scan to the closing `]`, respecting quoted attribute values.
    let quote: string | null = null;
    let end = -1;
    for (let j = i; j < this.src.length; j += 1) {
      const ch = this.src[j];
      if (quote) {
        if (ch === quote) quote = null;
      } else if (ch === '"' || ch === "'") {
        quote = ch;
      } else if (ch === ']') {
        end = j;
        break;
      } else if (ch === '[') {
        // a new tag started before this one closed: malformed, bail
        return null;
      }
    }
    if (end === -1) return null;

    const attrsBlob = this.src.slice(i, end);
    const selfClosing = /\/\s*$/.test(attrsBlob);
    return {
      kind: isClose ? 'close' : 'open',
      name,
      attrsBlob: selfClosing ? attrsBlob.replace(/\/\s*$/, '') : attrsBlob,
      selfClosing: !isClose && selfClosing,
      end: end + 1,
    };
  }
}

/** Tokenize a shortcode string into a token tree. Never throws. */
export function tokenizeShortcodes(src: string): TokenNode[] {
  try {
    return new ShortcodeTokenizer(src ?? '').tokenize();
  } catch {
    return src ? [{ type: 'text', value: src }] : [];
  }
}

/** Narrow helper. */
export function isShortcode(node: TokenNode): node is ShortcodeNode {
  return node.type === 'shortcode';
}
