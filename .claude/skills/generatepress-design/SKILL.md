---
name: generatepress-design
description: Configures GeneratePress theme settings including colors, typography, layout, and spacing. Use when customizing theme appearance, modifying design options, or programmatically changing GeneratePress settings.
---

# GeneratePress Design Configuration

## Quick Reference

```php
// Get any option
generate_get_option('option_name');

// All settings stored in single database key
get_option('generate_settings');

// All defaults
generate_get_defaults();
generate_get_color_defaults();
generate_get_default_fonts();
generate_spacing_get_defaults();
```

## Documentation

Full documentation: [docs/generatepress-theme/README.md](../../../docs/generatepress-theme/README.md)

| Document | Description |
|----------|-------------|
| [Layout Options](../../../docs/generatepress-theme/layout-options.md) | Container, header, nav, footer |
| [Color Options](../../../docs/generatepress-theme/color-options.md) | All color settings |
| [Typography](../../../docs/generatepress-theme/typography-options.md) | Fonts, sizes, weights |
| [Spacing](../../../docs/generatepress-theme/spacing-options.md) | Padding, margins |
| [Programmatic Access](../../../docs/generatepress-theme/programmatic-access.md) | PHP & WP-CLI |
| [Database Reference](../../../docs/generatepress-theme/database-reference.md) | Storage format |

## Common Settings

### Layout
```php
generate_get_option('container_width');        // '1200'
generate_get_option('layout_setting');         // 'right-sidebar'
generate_get_option('content_layout_setting'); // 'separate-containers'
generate_get_option('header_layout_setting');  // 'fluid-header'
generate_get_option('nav_position_setting');   // 'nav-float-right'
generate_get_option('footer_widget_setting');  // '3'
```

### Global Colors
```php
$colors = generate_get_option('global_colors');
// Returns array:
// contrast:   #222222 → var(--contrast)
// contrast-2: #575760 → var(--contrast-2)
// contrast-3: #b2b2be → var(--contrast-3)
// base:       #f0f0f0 → var(--base)
// base-2:     #f7f8f9 → var(--base-2)
// base-3:     #ffffff → var(--base-3)
// accent:     #1e73be → var(--accent)
```

### Key Color Options
```php
generate_get_option('background_color');    // 'var(--base-2)'
generate_get_option('link_color');          // 'var(--accent)'
generate_get_option('link_color_hover');    // 'var(--contrast)'
generate_get_option('header_background_color');
generate_get_option('navigation_background_color');
generate_get_option('content_background_color');
generate_get_option('footer_background_color');
```

### Typography
```php
generate_get_option('font_body');           // 'System Stack'
generate_get_option('body_font_size');      // '17'
generate_get_option('body_line_height');    // '1.5'
generate_get_option('heading_1_font_size'); // '42'
generate_get_option('heading_2_font_size'); // '35'
```

### Spacing
```php
generate_get_option('content_top');         // '40'
generate_get_option('content_right');       // '40'
generate_get_option('right_sidebar_width'); // '30' (%)
generate_get_option('menu_item_height');    // '60'
```

## Modifying Settings

### Via PHP Filter (Recommended)
```php
add_filter('generate_get_options', function($settings) {
    $settings['container_width'] = '1400';
    $settings['layout_setting'] = 'no-sidebar';
    $settings['link_color'] = '#0073aa';
    return $settings;
});
```

### Via Database
```php
$settings = get_option('generate_settings', array());
$settings['container_width'] = '1400';
update_option('generate_settings', $settings);

// Clear CSS cache
delete_option('generate_dynamic_css_output');
delete_option('generate_dynamic_css_cached_version');
```

### Via WP-CLI
```bash
# Export
just wp "option get generate_settings --format=json" > settings.json

# View specific
just wp "option get generate_settings --format=json" | jq '.container_width'

# After PHP changes, clear cache
just wp "option delete generate_dynamic_css_output"
```

## Per-Page Settings

```php
// Sidebar layout
update_post_meta($id, '_generate-sidebar-layout-meta', 'no-sidebar');

// Content width
update_post_meta($id, '_generate-content-area', 'full-width');

// Disable elements
update_post_meta($id, '_generate-disable-elements', array('header', 'footer'));
```

## Helper Functions

```php
generate_get_layout();              // Current page layout
generate_get_footer_widgets();      // Footer widget count
generate_get_navigation_location(); // Nav position
generate_is_using_flexbox();        // Structure check
generate_is_using_dynamic_typography(); // Typography system
generate_get_global_colors();       // Global color palette
```

## Child Theme Location

```
src/wp-content/themes/generatepress-child/
├── functions.php   # Add filters here
└── style.css       # CSS overrides
```

## Source Code Reference

Theme files in `src/wp-content/themes/generatepress/`:

| Purpose | File |
|---------|------|
| Defaults | `inc/defaults.php` |
| Get option | `inc/theme-functions.php` |
| Customizer | `inc/customizer.php` |
| CSS output | `inc/css-output.php` |
| Typography | `inc/typography.php` |
