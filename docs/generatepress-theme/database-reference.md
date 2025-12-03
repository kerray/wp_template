# GeneratePress Database Reference

## Primary Option Keys

All stored in `wp_options` table:

| Option Name | Purpose | Type |
|-------------|---------|------|
| `generate_settings` | All theme settings | Serialized array |
| `generate_dynamic_css_output` | Cached CSS | String |
| `generate_dynamic_css_cached_version` | CSS cache version | String |

## The generate_settings Option

This is the main option containing all theme customizations.

### Structure
```php
array(
    // Display
    'hide_title' => '',
    'hide_tagline' => true,
    'logo' => '',
    'retina_logo' => '',
    'logo_width' => '',

    // Layout
    'container_width' => '1200',
    'header_layout_setting' => 'fluid-header',
    'nav_layout_setting' => 'fluid-nav',
    'content_layout_setting' => 'separate-containers',
    'layout_setting' => 'right-sidebar',
    'footer_widget_setting' => '3',

    // Navigation
    'nav_position_setting' => 'nav-float-right',
    'nav_dropdown_type' => 'hover',
    'nav_search' => 'disable',

    // Colors
    'background_color' => 'var(--base-2)',
    'link_color' => 'var(--accent)',
    // ... many more color options

    // Typography
    'font_body' => 'System Stack',
    'body_font_size' => '17',
    // ... many more typography options

    // Spacing
    'content_top' => '40',
    'content_right' => '40',
    // ... many more spacing options

    // Global Colors
    'global_colors' => array(
        array('name' => 'Contrast', 'slug' => 'contrast', 'color' => '#222222'),
        array('name' => 'Accent', 'slug' => 'accent', 'color' => '#1e73be'),
        // ... more colors
    ),

    // Technical
    'structure' => 'flexbox',
    'icons' => 'svg',
    'combine_css' => true,
    'dynamic_css_cache' => true,
)
```

## Post Meta Keys

Per-page/post settings:

| Meta Key | Purpose | Values |
|----------|---------|--------|
| `_generate-sidebar-layout-meta` | Page sidebar | `left-sidebar`, `right-sidebar`, `no-sidebar`, `both-sidebars`, etc. |
| `_generate-content-area` | Content width | `default`, `full-width`, `contained` |
| `_generate-disable-elements` | Disabled elements | Array: `['header', 'nav', 'footer']` |
| `_generate-header-element` | Custom header element | Element ID |
| `_generate-footer-element` | Custom footer element | Element ID |

## SQL Queries

### Get All Settings
```sql
SELECT option_value
FROM wp_options
WHERE option_name = 'generate_settings';
```

### Get Settings via WP-CLI
```bash
just wp "option get generate_settings --format=json"
```

### Backup Settings
```bash
just wp "option get generate_settings --format=json" > gp-settings-backup.json
```

## GenerateBlocks Integration

GenerateBlocks stores its settings separately:

| Option Name | Purpose |
|-------------|---------|
| `generateblocks` | Core block settings |
| `generateblocks_admin` | Admin panel settings |
| `generateblocks_svg_shapes` | SVG shapes library |
| `generateblocks_svg_icons` | SVG icons library |
| `generateblocks_global_style_attrs` | Global style attributes |

### GenerateBlocks Pro Options

| Option Name | Purpose |
|-------------|---------|
| `generateblocks_pro_licensing` | License key & status |
| `generateblocks_pattern_libraries` | Template library sources |
| `generateblocks_global_styles` | Global styles data |

## Transients

| Transient Name | Purpose | Duration |
|----------------|---------|----------|
| `generate_google_fonts` | Cached Google Fonts | 1 day |
| `generateblocks_templates` | Template library cache | 1 day |

## Database Modification Examples

### Update Single Setting (PHP)
```php
$settings = get_option('generate_settings', array());
$settings['container_width'] = '1400';
update_option('generate_settings', $settings);

// Clear CSS cache
delete_option('generate_dynamic_css_output');
delete_option('generate_dynamic_css_cached_version');
```

### Update Single Setting (WP-CLI)
```bash
# This is tricky with serialized data
# Recommended: export, modify JSON, re-import

# Export
just wp "option get generate_settings --format=json" > settings.json

# Modify settings.json with your editor

# Import (REPLACES all settings)
just wp "option update generate_settings --format=json" < settings.json
```

### Reset to Defaults
```bash
just wp "option delete generate_settings"
just wp "option delete generate_dynamic_css_output"
just wp "option delete generate_dynamic_css_cached_version"
```

## Serialization Format

WordPress stores the settings as a serialized PHP array:

```
a:50:{s:10:"hide_title";s:0:"";s:11:"hide_tagline";b:1;s:4:"logo";s:0:"";s:15:"container_width";s:4:"1200";...}
```

**Key format:**
- `a:50` - Array with 50 elements
- `s:10:"hide_title"` - String key, 10 characters
- `s:0:""` - Empty string value
- `b:1` - Boolean true
- `s:4:"1200"` - String value "1200"

## Safe Modification Practices

1. **Always backup first:**
   ```bash
   just wp "option get generate_settings --format=json" > backup-$(date +%Y%m%d).json
   ```

2. **Use PHP filters when possible:**
   ```php
   add_filter('generate_get_options', function($settings) {
       $settings['option_name'] = 'value';
       return $settings;
   });
   ```

3. **Clear CSS cache after changes:**
   ```php
   delete_option('generate_dynamic_css_output');
   delete_option('generate_dynamic_css_cached_version');
   ```

4. **Test in staging first** before modifying production database
