/**
 * presetSite — UnoCSS preset factory driven by a site's brand tokens.
 *
 * Turns `SiteConfig['brand']` into a reusable UnoCSS preset: semantic color
 * tokens (primary/accent/highlight/… — any key in brand.colors is exposed),
 * heading/body font families, container width, and the generic design-system
 * shortcuts (btn, card, heading, container) + prose typography tweaks.
 *
 * Site-specific concerns (e.g. data-driven category color safelists) stay in the
 * site's own `uno.config.ts`, which composes this preset alongside
 * presetWind3/presetIcons/presetTypography.
 *
 * Usage in a site's uno.config.ts:
 *   import { defineConfig, presetWind3, presetIcons, presetTypography, transformerDirectives } from 'unocss';
 *   import { presetSite } from '@site/astro-core/uno';
 *   import siteConfig from './site.config.ts';
 *   export default defineConfig({
 *     presets: [presetWind3(), presetIcons(), presetTypography(), presetSite(siteConfig.brand)],
 *     transformers: [transformerDirectives()],
 *   });
 */

import type { Preset } from 'unocss';
import type { SiteConfig } from './site.config.schema';

type Brand = SiteConfig['brand'];

/** Loose theme shape — UnoCSS merges this into the resolved theme. */
interface SiteTheme {
  colors: Record<string, string>;
  fontFamily: Record<string, string>;
  breakpoints: Record<string, string>;
}

/**
 * Preflight CSS bridging WordPress palette-slug classes to the brand tokens.
 *
 * For each brand color key `slug` (primary/accent/highlight/gray/…) emit:
 *   .has-{slug}-color            -> color
 *   .has-{slug}-background-color -> background-color + callout padding/radius
 * plus the block-editor text-alignment classes. WordPress produces these exact
 * class names for palette picks and alignment; the headless build has none of
 * WP's default stylesheets, so the design system owns these rules. The editor is
 * locked to the same slugs by the brand-palette.php mu-plugin, keeping both ends
 * of the palette contract machine-registered.
 */
function paletteCss(colors: Record<string, string>): string {
  const colorRules = Object.entries(colors)
    .map(
      ([slug, hex]) => `
          .has-${slug}-color { color: ${hex}; }
          .has-${slug}-background-color { background-color: ${hex}; padding: 1.25rem 1.5rem; border-radius: 8px; }`,
    )
    .join('');
  return `${colorRules}
          .has-text-align-center { text-align: center; }
          .has-text-align-left { text-align: left; }
          .has-text-align-right { text-align: right; }
        `;
}

// Return the widened `Preset` (== Preset<object>) rather than Preset<SiteTheme>:
// UnoCSS's `presets: Preset[]` array is invariant in Theme, so a narrow
// Preset<SiteTheme> is rejected when composed in a site's uno.config.ts.
export function presetSite(brand: Brand): Preset {
  const containerWidth = brand.containerWidth ?? '1080px';
  const headingFont = brand.fonts.heading;
  const bodyFont = brand.fonts.body;

  // Prefer a `primary` token; fall back to the first color for defaults.
  const colorKeys = Object.keys(brand.colors);
  const primary = brand.colors.primary ?? (colorKeys[0] ? brand.colors[colorKeys[0]] : '#000');
  const accent = brand.colors.accent ?? primary;

  return {
    name: '@site/astro-core:presetSite',
    theme: {
      colors: { ...brand.colors },
      fontFamily: {
        heading: headingFont,
        body: bodyFont,
      },
      breakpoints: {
        md: '768px',
        lg: '1024px',
      },
    },
    shortcuts: {
      // Design-system content width from brand.containerWidth.
      container: `max-w-[${containerWidth}] mx-auto px-4`,
      // Neutral card surface.
      card: 'bg-white rounded-[10px] shadow-[0_2px_18px_rgba(0,0,0,0.15)] p-5',
      // Primary button; hover swaps to accent.
      btn: [
        'inline-flex items-center font-heading leading-none no-underline',
        'text-white rounded border-2 px-6 py-2.5 transition-all duration-200',
        `bg-primary border-primary hover:bg-accent hover:border-accent`,
      ].join(' '),
      'btn-secondary': [
        'inline-flex items-center font-heading leading-none no-underline',
        'rounded border-2 px-6 py-2.5 transition-all duration-200',
        'bg-transparent text-primary border-primary hover:bg-primary hover:text-white',
      ].join(' '),
      // Brand heading in the primary color.
      heading: 'font-heading text-primary',
    },
    preflights: [
      {
        // Global base type so imported WP/Gutenberg body content inherits the
        // brand look. Colors/fonts come from the resolved brand tokens.
        getCSS: () => `
          body { font-family: ${bodyFont}; line-height: 1.7; }
          h1, h2, h3, h4, h5, h6 { font-family: ${headingFont}; color: ${primary}; font-weight: 400; line-height: 1.2; }
          a { color: ${accent}; }
          .prose :where(h1,h2,h3,h4,h5,h6) { font-family: ${headingFont}; color: ${primary}; }
          .prose :where(a) { color: ${accent}; text-decoration: underline; }
          .prose :where(img) { border-radius: 8px; }
        `,
      },
      {
        // Palette-slug bridge: converted Gutenberg content references brand
        // colors by slug (WordPress emits `.has-{slug}-color` /
        // `.has-{slug}-background-color` for palette picks — see the
        // brand-palette.php mu-plugin that registers these same slugs in the
        // editor). WP core's own palette stylesheet is absent in the headless
        // build, so we regenerate the rules here for EVERY brand.colors key.
        // Background classes double as callouts (padding + radius). Kept in a
        // dedicated preflight so the base-type block above stays untouched.
        getCSS: () => paletteCss(brand.colors),
      },
    ],
  };
}

export default presetSite;
