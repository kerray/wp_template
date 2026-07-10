<?php
/**
 * Plugin Name: Brand Palette (block-editor colors)
 * Description: Registers the block-editor color palette from a site-provided
 *              brand palette, and disables the custom color picker so editors
 *              stick to the brand slugs. Generic + template-owned: the actual
 *              colors come from a site extension via the `headless_brand_palette`
 *              filter (see brand-palette-site.php / .example.php).
 * Version:     1.0.0
 * Author:      wp_template / astro-core
 *
 * WHY: the headless design system (astro-core `presetSite()`) renders converted
 * Gutenberg content through brand palette slugs — e.g. `.has-primary-color`,
 * `.has-accent-background-color`. For those slugs to actually be produced by the
 * editor (and for editors to see the brand colors instead of the WP defaults),
 * the SAME slugs must be registered as the editor color palette here. This file
 * is the machine-registration of the palette-slug policy on the WordPress end;
 * `presetSite()` is its counterpart on the Astro end.
 *
 * Install: this is a top-level mu-plugin file (WordPress autoloads it). Copy it
 * verbatim into wp-content/mu-plugins/ next to a site extension that supplies the
 * palette via the filter below. Keep this file byte-identical to the canonical
 * copy in astro-core/wp/mu-plugins/.
 *
 * Site extension contract — return an array of palette entries:
 *   add_filter('headless_brand_palette', function (array $palette): array {
 *       return array(
 *           array('slug' => 'primary', 'name' => 'Primary', 'color' => '#2d2864'),
 *           // ...
 *       );
 *   });
 * Each entry: 'slug' (matches brand.colors keys in site.config.ts), 'name'
 * (editor label), 'color' (hex). A `HEADLESS_BRAND_PALETTE` constant (same array
 * shape) is honored as a fallback when no filter is attached.
 *
 * PHP 7.4 compatible.
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Resolve the site-provided brand palette (filter first, constant fallback).
 *
 * @return array<int,array<string,string>> list of {slug,name,color} entries
 */
function headless_brand_palette() {
    $default = (defined('HEADLESS_BRAND_PALETTE') && is_array(HEADLESS_BRAND_PALETTE))
        ? HEADLESS_BRAND_PALETTE
        : array();

    $palette = apply_filters('headless_brand_palette', $default);

    if (!is_array($palette)) {
        return array();
    }

    // Keep only well-formed entries so add_theme_support never chokes.
    $clean = array();
    foreach ($palette as $entry) {
        if (is_array($entry) && !empty($entry['slug']) && !empty($entry['color'])) {
            $clean[] = array(
                'slug'  => (string) $entry['slug'],
                'name'  => isset($entry['name']) ? (string) $entry['name'] : (string) $entry['slug'],
                'color' => (string) $entry['color'],
            );
        }
    }
    return $clean;
}

/**
 * Register the palette + lock the editor to it. Runs late on after_setup_theme
 * (priority 11) so it wins over any palette the active theme registers at the
 * default priority.
 */
add_action('after_setup_theme', function () {
    $palette = headless_brand_palette();
    if (empty($palette)) {
        return; // No site palette supplied — leave the theme/WP defaults intact.
    }
    add_theme_support('editor-color-palette', $palette);
    // Editors stick to the brand slugs — custom hex picks would never map to a
    // has-*-color class the design system knows about.
    add_theme_support('disable-custom-colors');
}, 11);
