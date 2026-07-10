import { describe, it, expect } from 'vitest';
import { presetSite } from '../uno.preset';
import type { SiteConfig } from '../site.config.schema';

// Waldorf brand tokens — the canonical values from site.config.ts. presetSite is
// site-agnostic, so any brand shape works; we assert the palette bridge emits a
// rule per color key + the block-editor alignment classes.
const brand = {
  colors: {
    primary: '#2d2864',
    accent: '#973528',
    highlight: '#f0d118',
    gray: '#666666',
  },
  fonts: {
    heading: "'Francois One', system-ui, sans-serif",
    body: "'Open Sans', system-ui, sans-serif",
  },
  containerWidth: '1080px',
} satisfies SiteConfig['brand'];

/** Concatenate every preflight's getCSS() output. */
function preflightCss(b: SiteConfig['brand']): string {
  const preset = presetSite(b);
  const preflights = preset.preflights ?? [];
  return preflights
    // getCSS is sync in this preset; the UnoCSS context arg is unused.
    .map((p) => String(p.getCSS?.({} as never) ?? ''))
    .join('\n');
}

describe('presetSite — palette-slug preflights', () => {
  const css = preflightCss(brand);

  for (const [slug, hex] of Object.entries(brand.colors)) {
    it(`emits .has-${slug}-color -> ${hex}`, () => {
      expect(css).toMatch(
        new RegExp(`\\.has-${slug}-color\\s*\\{\\s*color:\\s*${hex}\\b`, 'i'),
      );
    });

    it(`emits .has-${slug}-background-color with color + callout padding`, () => {
      expect(css).toMatch(
        new RegExp(
          `\\.has-${slug}-background-color\\s*\\{[^}]*background-color:\\s*${hex}\\b[^}]*padding:`,
          'i',
        ),
      );
    });
  }

  it('emits block-editor text-alignment helpers', () => {
    expect(css).toContain('.has-text-align-center');
    expect(css).toContain('.has-text-align-left');
    expect(css).toContain('.has-text-align-right');
    expect(css).toMatch(/\.has-text-align-center\s*\{\s*text-align:\s*center/);
  });

  it('covers every brand.colors key (no slug left unbridged)', () => {
    for (const slug of Object.keys(brand.colors)) {
      expect(css.includes(`.has-${slug}-color`)).toBe(true);
      expect(css.includes(`.has-${slug}-background-color`)).toBe(true);
    }
  });
});
