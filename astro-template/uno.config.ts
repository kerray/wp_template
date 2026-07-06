import {
  defineConfig,
  presetWind3,
  presetIcons,
  presetTypography,
  transformerDirectives,
} from 'unocss';
import { presetSite } from '@site/astro-core/uno';
import config from './site.config';

// Brand tokens (colors, fonts, container width) live in site.config.ts and are
// turned into a UnoCSS theme by presetSite() from the shared core. Everything
// site-specific is expressed as data there; this file only wires the preset
// lineup, matching astro-core's expectations.
export default defineConfig({
  presets: [
    // Site brand preset FIRST so its theme/shortcuts are the base layer.
    presetSite(config.brand),
    presetWind3(),
    presetIcons({ scale: 1.1, warn: true }), // tabler icons via @iconify-json/tabler
    presetTypography(),
  ],
  transformers: [transformerDirectives()],
});
