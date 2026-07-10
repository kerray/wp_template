import { describe, it, expect } from 'vitest';
import { markdownAdapter } from '../src/lib/content/adapters/markdown';
import {
  resolveEngine,
  detectEngine,
  getAdapter,
  markdownAdapter as idxMarkdown,
} from '../src/lib/content/adapters/index';
import { nodeHistogram } from './helpers';

const BASE = 'https://waldorf-brno.cz';

const SAMPLE = `# Nadpis

Úvodní **odstavec** s [odkazem](https://example.com) a *důrazem*.

## Podnadpis

- první
- druhý
- třetí

1. krok jedna
2. krok dva

> Citace v bloku.

![Popisek](${BASE}/wp-content/uploads/2024/01/foto.jpg)

| A | B |
|---|---|
| 1 | 2 |

\`\`\`js
const x = 1;
\`\`\`
`;

describe('markdownAdapter — capabilities', () => {
  const tree = markdownAdapter(SAMPLE, { baseUrl: BASE });
  const hist = nodeHistogram(tree);

  it('maps headings, paragraphs, lists, images to structural IR nodes', () => {
    expect(hist.heading).toBeGreaterThanOrEqual(2);
    expect(hist.paragraph).toBeGreaterThanOrEqual(1);
    expect(hist.list).toBe(2); // ul + ol
    expect(hist.image).toBe(1);
  });

  it('keeps tables, blockquotes and code as sanitised HTML passthrough', () => {
    const htmlNodes = tree.filter((n) => n.type === 'html') as Array<{ html: string }>;
    const joined = htmlNodes.map((n) => n.html).join('\n');
    expect(joined).toMatch(/<table/);
    expect(joined).toMatch(/<blockquote/);
    expect(joined).toMatch(/<pre/);
  });

  it('rewrites WP asset URLs to root-relative', () => {
    const img = tree.find((n) => n.type === 'image') as { src: string } | undefined;
    expect(img?.src).toBe('/wp-content/uploads/2024/01/foto.jpg');
  });

  it('preserves inline emphasis + links inside paragraphs', () => {
    const para = tree.find((n) => n.type === 'paragraph') as { html: string } | undefined;
    expect(para?.html).toMatch(/<strong>/);
    expect(para?.html).toMatch(/<a /);
  });

  it('never throws and returns [] on empty input', () => {
    expect(markdownAdapter('', {})).toEqual([]);
    expect(markdownAdapter(undefined as unknown as string, {})).toEqual([]);
  });
});

describe('engine resolution', () => {
  it('honours an explicit API engine field', () => {
    expect(resolveEngine('markdown', '[et_pb_section]', 'divi')).toBe('markdown');
    expect(resolveEngine('html', '<!-- wp:paragraph -->', 'divi')).toBe('html');
  });

  it('sniffs source markers when engine is absent', () => {
    expect(detectEngine('<!-- wp:paragraph -->x')).toBe('gutenberg');
    expect(detectEngine('[et_pb_section]x[/et_pb_section]')).toBe('divi');
    expect(detectEngine('# plain markdown')).toBeUndefined();
  });

  it('falls back to the site default hint, else html', () => {
    expect(resolveEngine(undefined, '# md', 'markdown')).toBe('markdown');
    expect(resolveEngine(undefined, 'plain text', undefined)).toBe('html');
    expect(resolveEngine('nonsense', 'plain text', 'divi')).toBe('divi');
  });

  it('registry returns the markdown adapter for engine "markdown"', () => {
    expect(getAdapter('markdown')).toBe(idxMarkdown);
  });
});
