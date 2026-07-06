import { describe, it, expect } from 'vitest';
import { gutenbergAdapter } from '../src/lib/content/adapters/gutenberg';
import { loadFixture, nodeHistogram, collectWarnings } from './helpers';

const BASE = 'https://waldorf-brno.cz';

const FIXTURES = [
  'comprehensive', // hand-written: columns/buttons/embed/query/media-text/unknown blocks
  'detail-akce', // real converted content: paragraphs
  'kalendar-shortcode', // core/shortcode
  'unknown-dynamic', // unknown dynamic block (complianz)
] as const;

describe('gutenbergAdapter — fixtures (snapshots)', () => {
  for (const name of FIXTURES) {
    it(`maps ${name} to a stable IR tree`, () => {
      const raw = loadFixture('gutenberg', `${name}.gutenberg.html`);
      const { warn } = collectWarnings();
      const tree = gutenbergAdapter(raw, { baseUrl: BASE, warn });
      expect(tree).toMatchSnapshot();
    });
  }
});

describe('gutenbergAdapter — comprehensive block coverage', () => {
  const raw = loadFixture('gutenberg', 'comprehensive.gutenberg.html');

  it('covers heading/paragraph/list/image/columns/buttons/embed/query/blurb', () => {
    const tree = gutenbergAdapter(raw, { baseUrl: BASE });
    const hist = nodeHistogram(tree);
    expect(hist.heading).toBeGreaterThanOrEqual(1);
    expect(hist.paragraph).toBeGreaterThanOrEqual(1);
    expect(hist.list).toBe(1);
    expect(hist.image).toBeGreaterThanOrEqual(1);
    expect(hist.columns).toBe(1);
    expect(hist.column).toBe(2);
    expect(hist.buttongroup).toBe(1);
    expect(hist.button).toBe(2);
    expect(hist.embed).toBe(1);
    expect(hist.postlist).toBe(1);
    expect(hist.blurb).toBe(1);
  });

  it('reads heading level from attrs and keeps inline HTML', () => {
    const tree = gutenbergAdapter(raw, { baseUrl: BASE });
    const heading = tree.find((n) => n.type === 'heading');
    expect(heading).toMatchObject({ type: 'heading', level: 2 });
    expect(heading).toHaveProperty('html', expect.stringContaining('<strong>'));
  });

  it('maps column widths through unchanged', () => {
    const cols = gutenbergAdapter(raw, { baseUrl: BASE }).find((n) => n.type === 'columns');
    expect(cols?.type).toBe('columns');
    if (cols?.type === 'columns') {
      expect(cols.children.map((c) => c.width)).toEqual(['66.66%', '33.33%']);
    }
  });

  it('maps core/query attrs to a PostListNode', () => {
    const list = gutenbergAdapter(raw, { baseUrl: BASE }).find((n) => n.type === 'postlist');
    expect(list).toMatchObject({ type: 'postlist', postType: 'akce', perPage: 6, categories: [3, 5], columns: 3 });
  });

  it('extracts button href/text/target and root-relativises internal href', () => {
    const group = gutenbergAdapter(raw, { baseUrl: BASE }).find((n) => n.type === 'buttongroup');
    expect(group?.type).toBe('buttongroup');
    if (group?.type === 'buttongroup') {
      expect(group.children[0]).toMatchObject({ type: 'button', text: 'Přihláška', href: '/prijimacky/' });
      expect(group.children[1]).toMatchObject({ type: 'button', target: '_blank', href: 'https://example.com' });
    }
  });

  it('maps embed provider + url', () => {
    const embed = gutenbergAdapter(raw, { baseUrl: BASE }).find((n) => n.type === 'embed');
    expect(embed).toMatchObject({ type: 'embed', provider: 'youtube' });
    expect(embed).toHaveProperty('url', expect.stringContaining('youtube.com'));
  });

  it('warns for unknown static, unknown dynamic, reusable and shortcode blocks', () => {
    const { warn, warnings } = collectWarnings();
    gutenbergAdapter(raw, { baseUrl: BASE, warn });
    expect(warnings.some((w) => w.includes('unmapped block acme/fancy-widget'))).toBe(true);
    expect(warnings.some((w) => w.includes('unmapped dynamic block some/dynamic-thing'))).toBe(true);
    expect(warnings.some((w) => w.includes('reusable block ref not resolved'))).toBe(true);
    expect(warnings.some((w) => w.toLowerCase().includes('shortcode'))).toBe(true);
  });

  it('keeps unknown static block HTML but skips unknown dynamic block', () => {
    const tree = gutenbergAdapter(raw, { baseUrl: BASE });
    const json = JSON.stringify(tree);
    expect(json).toContain('Nested unknown static block content');
    expect(json).not.toContain('some/dynamic-thing');
  });
});

describe('gutenbergAdapter — real + edge fixtures', () => {
  it('maps a real paragraph-only page (detail-akce)', () => {
    const raw = loadFixture('gutenberg', 'detail-akce.gutenberg.html');
    const hist = nodeHistogram(gutenbergAdapter(raw, { baseUrl: BASE }));
    expect(hist.paragraph).toBeGreaterThan(0);
  });

  it('passes a core/shortcode through as HtmlNode with a warning', () => {
    const raw = loadFixture('gutenberg', 'kalendar-shortcode.gutenberg.html');
    const { warn, warnings } = collectWarnings();
    const tree = gutenbergAdapter(raw, { warn });
    expect(tree.some((n) => n.type === 'html')).toBe(true);
    expect(warnings.some((w) => w.toLowerCase().includes('shortcode'))).toBe(true);
  });

  it('never throws; falls back to HTML for a non-empty unmapped body', () => {
    const raw = loadFixture('gutenberg', 'unknown-dynamic.gutenberg.html');
    const tree = gutenbergAdapter(raw, { baseUrl: BASE });
    expect(Array.isArray(tree)).toBe(true);
  });

  it('uses fallbackHtml when there are no nodes', () => {
    const tree = gutenbergAdapter('', { fallbackHtml: '<p>rendered</p>' });
    expect(tree).toEqual([{ type: 'html', html: '<p>rendered</p>' }]);
  });
});
