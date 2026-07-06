import { describe, it, expect } from 'vitest';
import { rewriteUrl, rewriteHtmlUrls, splitHtmlToNodes } from '../src/lib/content/adapters/html-utils';

const BASE = 'https://waldorf-brno.cz';

describe('rewriteUrl', () => {
  it('strips the configured baseUrl to a root-relative path', () => {
    expect(rewriteUrl('https://waldorf-brno.cz/kontakty/', BASE)).toBe('/kontakty/');
    expect(rewriteUrl('https://waldorf-brno.cz', BASE)).toBe('/');
  });

  it('root-relativises WP asset URLs from ANY host (dev localhost:8090 vs prod)', () => {
    expect(rewriteUrl('http://localhost:8090/wp-content/uploads/2021/x.jpg')).toBe(
      '/wp-content/uploads/2021/x.jpg',
    );
    expect(rewriteUrl('https://waldorf-brno.cz/wp-content/uploads/a.png', BASE)).toBe(
      '/wp-content/uploads/a.png',
    );
  });

  it('leaves external links, anchors, mailto and tel untouched', () => {
    expect(rewriteUrl('https://example.com/page', BASE)).toBe('https://example.com/page');
    expect(rewriteUrl('#section', BASE)).toBe('#section');
    expect(rewriteUrl('mailto:info@waldorf-brno.cz', BASE)).toBe('mailto:info@waldorf-brno.cz');
    expect(rewriteUrl('tel:+420541234567', BASE)).toBe('tel:+420541234567');
  });

  it('handles empty / undefined input', () => {
    expect(rewriteUrl('', BASE)).toBe('');
    expect(rewriteUrl(undefined, BASE)).toBe('');
  });
});

describe('rewriteHtmlUrls', () => {
  it('rewrites href and src inside an HTML string', () => {
    const html = '<a href="http://localhost:8090/wp-content/uploads/f.pdf">f</a><img src="https://waldorf-brno.cz/wp-content/uploads/i.jpg">';
    const out = rewriteHtmlUrls(html, BASE);
    expect(out).toContain('href="/wp-content/uploads/f.pdf"');
    expect(out).toContain('src="/wp-content/uploads/i.jpg"');
  });
});

describe('splitHtmlToNodes', () => {
  it('splits headings, paragraphs and lists into structural nodes', () => {
    const html = '<h2>Nadpis</h2><p>Odstavec s <strong>tučným</strong> textem.</p><ul><li>a</li><li>b</li></ul>';
    const nodes = splitHtmlToNodes(html);
    expect(nodes.map((n) => n.type)).toEqual(['heading', 'paragraph', 'list']);
    expect(nodes[0]).toMatchObject({ type: 'heading', level: 2, html: 'Nadpis' });
    expect(nodes[1]).toMatchObject({ type: 'paragraph' });
    expect(nodes[1]).toHaveProperty('html', expect.stringContaining('<strong>'));
    expect(nodes[2]).toMatchObject({ type: 'list', ordered: false, items: ['a', 'b'] });
  });

  it('drops empty <h3></h3> DIVI spacer headings', () => {
    const nodes = splitHtmlToNodes('<h3></h3><p>real</p>');
    expect(nodes.map((n) => n.type)).toEqual(['paragraph']);
  });

  it('extracts a figure with caption + link into an image node', () => {
    const html =
      '<figure><a href="/big.jpg"><img src="/wp-content/uploads/s.jpg" alt="Alt"></a><figcaption>Popisek</figcaption></figure>';
    const nodes = splitHtmlToNodes(html, BASE);
    expect(nodes).toHaveLength(1);
    expect(nodes[0]).toMatchObject({
      type: 'image',
      src: '/wp-content/uploads/s.jpg',
      alt: 'Alt',
      href: '/big.jpg',
      caption: 'Popisek',
    });
  });

  it('coalesces top-level inline content into a paragraph', () => {
    const nodes = splitHtmlToNodes('bare text with <a href="/x">link</a> and <em>emphasis</em>');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.type).toBe('paragraph');
  });

  it('passes through unknown block elements as HtmlNode', () => {
    const nodes = splitHtmlToNodes('<table><tr><td>cell</td></tr></table>');
    expect(nodes).toHaveLength(1);
    expect(nodes[0]!.type).toBe('html');
  });

  it('returns [] for empty/whitespace input', () => {
    expect(splitHtmlToNodes('   ')).toEqual([]);
    expect(splitHtmlToNodes('')).toEqual([]);
  });
});
