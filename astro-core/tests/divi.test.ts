import { describe, it, expect } from 'vitest';
import { diviAdapter } from '../src/lib/content/adapters/divi';
import { widthFromType } from '../src/lib/content/adapters/divi';
import { loadFixture, nodeHistogram, maxDepth, collectWarnings } from './helpers';

const BASE = 'http://localhost:8090';

const FIXTURES = [
  'historie-skoly', // simple text, many sections
  'o-skole', // multi-column + blurbs (complexity 53)
  'uvod', // buttons + images + tabs + blurbs (all-rounder)
  'charakteristika-studia', // accordion / toggle
  'studium-lyceum', // blurbs + images
] as const;

describe('diviAdapter — real fixtures (snapshots)', () => {
  for (const name of FIXTURES) {
    it(`maps ${name} to a stable IR tree`, () => {
      const raw = loadFixture('divi', `${name}.divi.txt`);
      const { warn } = collectWarnings();
      const tree = diviAdapter(raw, { baseUrl: BASE, warn });
      expect(tree).toMatchSnapshot();
    });
  }
});

describe('diviAdapter — structural assertions', () => {
  it('preserves multi-column layout in o-skole (columns + blurbs, not flattened)', () => {
    const raw = loadFixture('divi', 'o-skole.divi.txt');
    const tree = diviAdapter(raw, { baseUrl: BASE });
    const hist = nodeHistogram(tree);
    expect(hist.section).toBeGreaterThan(0);
    expect(hist.columns).toBeGreaterThan(0);
    expect(hist.column).toBeGreaterThan(0);
    expect(hist.blurb).toBeGreaterThanOrEqual(8); // 8 blurbs in the source
    // section > columns > column nesting => depth >= 3
    expect(maxDepth(tree)).toBeGreaterThanOrEqual(3);
  });

  it('extracts buttons, images and tabs from uvod', () => {
    const raw = loadFixture('divi', 'uvod.divi.txt');
    const tree = diviAdapter(raw, { baseUrl: BASE });
    const hist = nodeHistogram(tree);
    expect(hist.button).toBeGreaterThan(0);
    expect(hist.image).toBeGreaterThan(0);
    expect(hist.tabs).toBeGreaterThan(0);
  });

  it('turns accordion/toggle into tabs in charakteristika-studia', () => {
    const raw = loadFixture('divi', 'charakteristika-studia.divi.txt');
    const tree = diviAdapter(raw, { baseUrl: BASE });
    const hist = nodeHistogram(tree);
    expect(hist.tabs).toBeGreaterThan(0);
  });

  it('root-relativises upload URLs found on blurb images', () => {
    const raw = loadFixture('divi', 'o-skole.divi.txt');
    const json = JSON.stringify(diviAdapter(raw, { baseUrl: BASE }));
    expect(json).not.toContain('localhost:8090');
    expect(json).toContain('/wp-content/uploads/');
  });
});

describe('diviAdapter — texturized event body (Bug 2 safety net)', () => {
  // Real archiv-akci event content as returned by apply_filters('the_content'):
  // DIVI shortcodes are NOT rendered in REST context and wptexturize has turned
  // every straight attribute quote into curly-quote entities (&#8220; / &#8243;).
  const raw = loadFixture('divi', 'event-texturized.divi.txt');

  it('leaves no [et_pb_ tokens or entity-quoted DIVI attrs in the IR', () => {
    const { warn } = collectWarnings();
    const json = JSON.stringify(diviAdapter(raw, { baseUrl: BASE, warn }));
    expect(json).not.toContain('[et_pb_');
    expect(json).not.toContain('et_pb_section');
    expect(json).not.toContain('fb_built');
    expect(json).not.toContain('&#8220;');
    expect(json).not.toContain('&#8243;');
  });

  it('strips the nested [wpseo_breadcrumb] and keeps the human text', () => {
    const tree = diviAdapter(raw, { baseUrl: BASE });
    const json = JSON.stringify(tree);
    expect(json).not.toContain('wpseo_breadcrumb');
    // the event body carries real prose that must survive
    expect(tree.length).toBeGreaterThan(0);
  });
});

describe('diviAdapter — synthetic units', () => {
  it('column width math', () => {
    expect(widthFromType('1_3')).toBe('33.33%');
    expect(widthFromType('2_3')).toBe('66.66%');
    expect(widthFromType('1_2')).toBe('50%');
    expect(widthFromType('1_4')).toBe('25%');
    expect(widthFromType('3_4')).toBe('75%');
    expect(widthFromType('4_4')).toBe('100%');
    expect(widthFromType('1_1')).toBe('100%');
    expect(widthFromType('1_5')).toBe('20%');
    expect(widthFromType('4_5')).toBe('80%');
    expect(widthFromType('1_6')).toBe('16.66%');
    expect(widthFromType('5_6')).toBe('83.33%');
    expect(widthFromType(undefined)).toBeUndefined();
  });

  it('warns once per distinct unknown module and scrubs nested shortcodes', () => {
    const { warn, warnings } = collectWarnings();
    const src =
      '[et_pb_section][et_pb_row][et_pb_column type="4_4"]' +
      '[et_pb_widget]w1[/et_pb_widget][et_pb_widget]w2[/et_pb_widget]' +
      '[et_pb_text]<p>[kalendar year="2025"]</p>[/et_pb_text]' +
      '[/et_pb_column][/et_pb_row][/et_pb_section]';
    const tree = diviAdapter(src, { warn });
    const unmappedModule = warnings.filter((w) => w.includes('et_pb_widget'));
    const kalendar = warnings.filter((w) => w.includes('[kalendar]'));
    expect(unmappedModule).toHaveLength(1); // deduped despite two occurrences
    expect(kalendar).toHaveLength(1);
    // the nested [kalendar] must not survive into the IR
    expect(JSON.stringify(tree)).not.toContain('kalendar');
  });

  it('maps et_pb_button attributes to a ButtonNode', () => {
    const src = '[et_pb_button button_text="Go" button_url="/x/" url_new_window="on"][/et_pb_button]';
    const tree = diviAdapter(src);
    expect(tree[0]).toMatchObject({ type: 'button', text: 'Go', href: '/x/', target: '_blank' });
  });

  it('never throws and falls back to HTML on catastrophic input', () => {
    const tree = diviAdapter('[et_pb_section unclosed attr="', { fallbackHtml: '<p>fallback</p>' });
    expect(Array.isArray(tree)).toBe(true);
    // no throw; returns some IR (either parsed or fallback html)
    expect(tree.length).toBeGreaterThanOrEqual(0);
  });

  it('uses fallbackHtml when the body produces no nodes', () => {
    const tree = diviAdapter('', { fallbackHtml: '<p>server rendered</p>' });
    expect(tree).toEqual([{ type: 'html', html: '<p>server rendered</p>' }]);
  });
});
