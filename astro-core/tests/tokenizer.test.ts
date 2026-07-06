import { describe, it, expect } from 'vitest';
import {
  tokenizeShortcodes,
  isShortcode,
  decodeEntities,
  type ShortcodeNode,
  type TokenNode,
} from '../src/lib/content/adapters/shortcode-tokenizer';

function shortcodes(tokens: TokenNode[]): ShortcodeNode[] {
  return tokens.filter(isShortcode);
}
function first(tokens: TokenNode[]): ShortcodeNode {
  const sc = shortcodes(tokens);
  expect(sc.length).toBeGreaterThan(0);
  return sc[0]!;
}

describe('shortcode tokenizer', () => {
  it('parses attributes and inner content of a simple module', () => {
    const [node] = shortcodes(tokenizeShortcodes('[et_pb_text foo="bar" n="2"]<p>Hi</p>[/et_pb_text]'));
    expect(node!.name).toBe('et_pb_text');
    expect(node!.attrs).toEqual({ foo: 'bar', n: '2' });
    expect(node!.rawInner).toBe('<p>Hi</p>');
    expect(node!.selfClosing).toBe(false);
  });

  it('recurses nested structural modules (section > row > column > text)', () => {
    const src =
      '[et_pb_section][et_pb_row][et_pb_column type="4_4"][et_pb_text]body[/et_pb_text][/et_pb_column][/et_pb_row][/et_pb_section]';
    const section = first(tokenizeShortcodes(src));
    const row = shortcodes(section.children)[0]!;
    const column = shortcodes(row.children)[0]!;
    const text = shortcodes(column.children)[0]!;
    expect([section.name, row.name, column.name, text.name]).toEqual([
      'et_pb_section',
      'et_pb_row',
      'et_pb_column',
      'et_pb_text',
    ]);
    expect(column.attrs.type).toBe('4_4');
    expect(text.rawInner).toBe('body');
  });

  it('handles _inner same-family nesting (row_inner / column_inner)', () => {
    const src =
      '[et_pb_column][et_pb_row_inner][et_pb_column_inner type="1_2"][et_pb_text]x[/et_pb_text][/et_pb_column_inner][/et_pb_row_inner][/et_pb_column]';
    const col = first(tokenizeShortcodes(src));
    const rowInner = shortcodes(col.children)[0]!;
    expect(rowInner.name).toBe('et_pb_row_inner');
    const colInner = shortcodes(rowInner.children)[0]!;
    expect(colInner.name).toBe('et_pb_column_inner');
    expect(colInner.attrs.type).toBe('1_2');
  });

  it('keeps HTML with URL-encoded quotes (%22) intact and parses following attrs', () => {
    // encoded quotes inside an attribute value must NOT be treated as delimiters
    const src = '[et_pb_button button_url="/x?a=%22b%22" button_text="Go"][/et_pb_button]';
    const node = first(tokenizeShortcodes(src));
    expect(node.attrs.button_url).toBe('/x?a=%22b%22');
    expect(node.attrs.button_text).toBe('Go');
  });

  it('decodes HTML entities in attribute values', () => {
    const node = first(tokenizeShortcodes('[et_pb_image src="/a?x=1&#038;y=2" alt="A &amp; B"][/et_pb_image]'));
    expect(node.attrs.src).toBe('/a?x=1&y=2');
    expect(node.attrs.alt).toBe('A & B');
  });

  it('recovers from an unbalanced / unclosed legacy tag without dropping siblings', () => {
    // et_pb_text never closes; the section close still terminates the section
    const src = '[et_pb_section][et_pb_text]orphan[/et_pb_section][et_pb_section]next[/et_pb_section]';
    const top = shortcodes(tokenizeShortcodes(src));
    expect(top.map((n) => n.name)).toEqual(['et_pb_section', 'et_pb_section']);
    // second section is not swallowed by the first
    expect(top[1]!.rawInner).toBe('next');
  });

  it('ignores shortcode-looking text inside HTML comments', () => {
    const src = '[et_pb_text]a <!-- [et_pb_fake] --> b[/et_pb_text]';
    const node = first(tokenizeShortcodes(src));
    // the fake tag stays as literal text inside rawInner; no child shortcode created
    expect(shortcodes(node.children).length).toBe(0);
    expect(node.rawInner).toContain('[et_pb_fake]');
  });

  it('handles a self-closing shortcode', () => {
    const node = first(tokenizeShortcodes('[et_pb_divider /]'));
    expect(node.selfClosing).toBe(true);
    expect(node.children.length).toBe(0);
  });

  it('treats a stray close tag as literal text, not a boundary', () => {
    const tokens = tokenizeShortcodes('hello [/et_pb_nope] world');
    // no shortcode nodes; the stray close is preserved as text
    expect(shortcodes(tokens).length).toBe(0);
    const text = tokens.map((t) => (t.type === 'text' ? t.value : '')).join('');
    expect(text).toContain('[/et_pb_nope]');
  });

  it('captures the full raw slice of an unknown shortcode for passthrough', () => {
    const node = first(tokenizeShortcodes('[kalendar year="2025"]inner[/kalendar]'));
    expect(node.name).toBe('kalendar');
    expect(node.raw).toBe('[kalendar year="2025"]inner[/kalendar]');
  });
});

describe('decodeEntities', () => {
  it('decodes named, decimal and hex entities', () => {
    expect(decodeEntities('a&amp;b')).toBe('a&b');
    expect(decodeEntities('&#8217;')).toBe('’');
    expect(decodeEntities('&#x2013;')).toBe('–');
    expect(decodeEntities('plain')).toBe('plain');
  });
});
