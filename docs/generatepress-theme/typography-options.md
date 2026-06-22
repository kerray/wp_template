# GeneratePress Typography Options

## Font System

GeneratePress supports two typography systems:

1. **Dynamic Typography** (default) - `use_dynamic_typography: true`
2. **Legacy Fonts** - Individual font settings

Check which system is active:
```php
generate_is_using_dynamic_typography();  // Returns true/false
```

## Body Typography

```php
generate_get_option('font_body');           // Default: 'System Stack'
generate_get_option('font_body_category');  // Font category
generate_get_option('font_body_variants');  // Font variants
generate_get_option('body_font_weight');    // Default: 'normal'
generate_get_option('body_font_transform'); // Default: 'none'
generate_get_option('body_font_size');      // Default: '17' (px)
generate_get_option('body_line_height');    // Default: '1.5' (unitless)
generate_get_option('paragraph_margin');    // Default: '1.5' (em)
```

## Heading Typography (H1-H6)

For each heading level (replace `X` with 1-6):

```php
generate_get_option('font_heading_X');          // Font family
generate_get_option('font_heading_X_category'); // Font category
generate_get_option('font_heading_X_variants'); // Font variants
generate_get_option('heading_X_weight');        // Font weight
generate_get_option('heading_X_transform');     // Text transform
generate_get_option('heading_X_font_size');     // Size in px
generate_get_option('heading_X_line_height');   // Line height
generate_get_option('heading_X_margin_bottom'); // Margin in px
```

### Default Heading Sizes

| Heading | Size (px) | Line Height | Margin Bottom |
|---------|-----------|-------------|---------------|
| H1 | 42 | 1.2 | 20 |
| H2 | 35 | 1.2 | 20 |
| H3 | 24 | 1.2 | 20 |
| H4 | - | - | - |
| H5 | - | - | - |
| H6 | - | - | - |

### Mobile Heading Sizes

```php
generate_get_option('mobile_heading_1_font_size');  // Default: '30'
generate_get_option('mobile_heading_2_font_size');  // Default: '25'
```

## Site Title & Tagline Typography

```php
generate_get_option('font_site_title');           // Font family
generate_get_option('font_site_title_category');
generate_get_option('font_site_title_variants');
generate_get_option('site_title_font_weight');    // Default: 'bold'
generate_get_option('site_title_font_transform'); // Default: 'none'
generate_get_option('site_title_font_size');      // Default: '25' (px)

generate_get_option('font_site_tagline');
generate_get_option('font_site_tagline_category');
generate_get_option('font_site_tagline_variants');
generate_get_option('site_tagline_font_weight');  // Default: 'normal'
generate_get_option('site_tagline_font_transform');
generate_get_option('site_tagline_font_size');    // Default: '15' (px)
```

## Navigation Typography

```php
generate_get_option('font_navigation');           // Font family
generate_get_option('font_navigation_category');
generate_get_option('font_navigation_variants');
generate_get_option('navigation_font_weight');    // Default: 'normal'
generate_get_option('navigation_font_transform'); // Default: 'none'
generate_get_option('navigation_font_size');      // Default: '15' (px)
```

## Widget Title Typography

```php
generate_get_option('font_widget_title');           // Font family
generate_get_option('font_widget_title_category');
generate_get_option('font_widget_title_variants');
generate_get_option('widget_title_font_weight');    // Default: 'normal'
generate_get_option('widget_title_font_transform'); // Default: 'none'
generate_get_option('widget_title_font_size');      // Default: '20' (px)
generate_get_option('widget_content_font_size');    // Default: '' (px)
```

## Button Typography

```php
generate_get_option('font_buttons');           // Font family
generate_get_option('font_buttons_category');
generate_get_option('font_buttons_variants');
generate_get_option('buttons_font_weight');    // Default: 'normal'
generate_get_option('buttons_font_transform'); // Default: 'none'
generate_get_option('buttons_font_size');      // Default: '' (px)
```

## Footer Typography

```php
generate_get_option('font_footer');           // Font family
generate_get_option('font_footer_category');
generate_get_option('font_footer_variants');
generate_get_option('footer_font_weight');    // Default: 'normal'
generate_get_option('footer_font_transform'); // Default: 'none'
generate_get_option('footer_font_size');      // Default: '15' (px)
```

## Dynamic Typography System

The modern typography system uses:

```php
generate_get_option('typography');      // Array of typography settings
generate_get_option('font_manager');    // Array of custom fonts
```

### Typography Array Structure
```php
$typography = array(
    array(
        'selector' => 'body',
        'fontFamily' => 'System Stack',
        'fontWeight' => '400',
        'fontSize' => '17',
        'lineHeight' => '1.5',
        // ... more properties
    ),
    // ... more selectors
);
```

## Google Fonts Settings

```php
generate_get_option('google_font_display');  // Default: 'auto'
// Options: 'auto', 'swap', 'block', 'fallback', 'optional'
```

## Font Transform Options

All `*_font_transform` options accept:
- `none`
- `capitalize`
- `uppercase`
- `lowercase`

## Font Weight Options

All `*_font_weight` options accept:
- `normal` (400)
- `bold` (700)
- `100` through `900`

## System Stack

The default "System Stack" uses native system fonts:

```css
-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif
```

## Get All Font Defaults

```php
$font_defaults = generate_get_default_fonts();
// Returns array of all typography options with defaults
```

## Programmatic Typography Changes

### Change Body Font
```php
add_filter('generate_get_options', function($settings) {
    $settings['font_body'] = 'Open Sans';
    $settings['body_font_weight'] = '400';
    $settings['body_font_size'] = '16';
    return $settings;
});
```

### Add Custom Google Font
```php
add_filter('generate_get_options', function($settings) {
    $settings['font_manager'] = array(
        array(
            'fontFamily' => 'Roboto',
            'googleFont' => true,
            'googleFontVariants' => '400,500,700',
        ),
    );
    return $settings;
});
```

### Using Typography for Block Editor
```php
// Get fonts formatted for block editor
$editor_fonts = generate_get_google_fonts_for_editor();
```
