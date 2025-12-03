# Programmatic Access to GeneratePress Options

## Core Functions

### Get Single Option
```php
$value = generate_get_option('option_name');
```

Always returns the current value merged with defaults - never returns null for valid option names.

### Get All Defaults
```php
$defaults = generate_get_defaults();           // Main settings
$colors = generate_get_color_defaults();       // Color settings
$fonts = generate_get_default_fonts();         // Typography
$spacing = generate_spacing_get_defaults();    // Spacing
```

### Get Raw Settings from Database
```php
$settings = get_option('generate_settings', array());
// Returns only explicitly saved values (not merged with defaults)
```

## Modifying Options

### Filter Method (Recommended)
```php
add_filter('generate_get_options', function($settings) {
    $settings['container_width'] = '1400';
    $settings['layout_setting'] = 'no-sidebar';
    return $settings;
});
```

### Direct Database Update (Use Carefully)
```php
// Get current settings
$settings = get_option('generate_settings', array());

// Modify
$settings['container_width'] = '1400';

// Save
update_option('generate_settings', $settings);
```

**Warning:** Direct database updates bypass sanitization. Use the Customizer or filter method when possible.

## Layout Functions

### Get Current Page Layout
```php
$layout = generate_get_layout();
// Returns: 'left-sidebar', 'right-sidebar', 'no-sidebar', etc.
```

### Get Footer Widget Count
```php
$count = generate_get_footer_widgets();
// Returns: 0-5
```

### Get Navigation Location
```php
$location = generate_get_navigation_location();
// Returns: 'nav-below-header', 'nav-above-header', etc.
```

### Check Structure Type
```php
if (generate_is_using_flexbox()) {
    // Flexbox layout active
}
```

### Check Typography System
```php
if (generate_is_using_dynamic_typography()) {
    // Dynamic typography active
}
```

## Color Functions

### Get Block Editor Palette
```php
$palette = generate_get_editor_color_palette();
// Returns array for block editor color picker
```

### Get Global Colors
```php
$colors = generate_get_global_colors();
// Returns array of global color definitions
```

## Post Meta (Per-Page Settings)

GeneratePress stores per-page layout settings in post meta:

### Sidebar Layout
```php
// Get
$layout = get_post_meta($post_id, '_generate-sidebar-layout-meta', true);

// Set
update_post_meta($post_id, '_generate-sidebar-layout-meta', 'no-sidebar');
// Options: 'left-sidebar', 'right-sidebar', 'no-sidebar', 'both-sidebars', etc.
```

### Content Container
```php
// Get
$container = get_post_meta($post_id, '_generate-content-area', true);

// Set
update_post_meta($post_id, '_generate-content-area', 'full-width');
// Options: 'default', 'full-width', 'contained'
```

### Disable Elements
```php
$disabled = get_post_meta($post_id, '_generate-disable-elements', true);
// Returns array: ['header', 'nav', 'footer', etc.]

// Disable header on a page
update_post_meta($post_id, '_generate-disable-elements', array('header'));
```

## WP-CLI Access

### View All Settings
```bash
just wp "option get generate_settings --format=json"
```

### View Specific Setting (with jq)
```bash
just wp "option get generate_settings --format=json" | jq '.container_width'
```

### Export Settings
```bash
just wp "option get generate_settings --format=json" > generatepress-settings.json
```

### Import Settings (Careful!)
```bash
# This replaces ALL settings
just wp "option update generate_settings --format=json < generatepress-settings.json"
```

## Hooks and Filters

### Before Settings Retrieved
```php
add_filter('generate_get_options', function($settings) {
    // Modify settings before use
    return $settings;
});
```

### Default Values Filter
```php
add_filter('generate_option_defaults', function($defaults) {
    $defaults['container_width'] = '1400';
    return $defaults;
});
```

### Color Defaults Filter
```php
add_filter('generate_color_option_defaults', function($defaults) {
    $defaults['link_color'] = '#0073aa';
    return $defaults;
});
```

### Typography Defaults Filter
```php
add_filter('generate_font_option_defaults', function($defaults) {
    $defaults['body_font_size'] = '16';
    return $defaults;
});
```

### Spacing Defaults Filter
```php
add_filter('generate_spacing_option_defaults', function($defaults) {
    $defaults['content_top'] = '30';
    return $defaults;
});
```

## Regenerate CSS Cache

After programmatically changing options:

```php
// Clear cached CSS
delete_option('generate_dynamic_css_output');
delete_option('generate_dynamic_css_cached_version');

// Or use WP-CLI
// just wp "option delete generate_dynamic_css_output"
// just wp "option delete generate_dynamic_css_cached_version"
```

## Example: Full Settings Override

```php
/**
 * Override GeneratePress settings programmatically
 */
add_filter('generate_get_options', function($settings) {
    // Layout
    $settings['container_width'] = '1400';
    $settings['layout_setting'] = 'no-sidebar';
    $settings['content_layout_setting'] = 'one-container';

    // Colors
    $settings['link_color'] = '#0073aa';
    $settings['link_color_hover'] = '#005177';

    // Typography
    $settings['body_font_size'] = '16';
    $settings['body_line_height'] = '1.6';

    // Spacing
    $settings['content_top'] = '30';
    $settings['content_bottom'] = '30';

    return $settings;
});
```

## Debug: View Current Settings

```php
// In a template or admin page
echo '<pre>';
print_r(get_option('generate_settings'));
echo '</pre>';

// Or with defaults merged
echo '<pre>';
print_r(wp_parse_args(
    get_option('generate_settings', array()),
    generate_get_defaults()
));
echo '</pre>';
```
