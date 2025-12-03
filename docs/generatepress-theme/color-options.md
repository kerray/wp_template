# GeneratePress Color Options

All color options use the function `generate_get_option()` and support:
- Hex colors: `#ffffff`
- RGB/RGBA: `rgba(0,0,0,0.5)`
- CSS Variables: `var(--accent)`

## Global Colors

Stored in `generate_settings['global_colors']` array:

| Slug | CSS Variable | Default |
|------|--------------|---------|
| `contrast` | `--contrast` | `#222222` |
| `contrast-2` | `--contrast-2` | `#575760` |
| `contrast-3` | `--contrast-3` | `#b2b2be` |
| `base` | `--base` | `#f0f0f0` |
| `base-2` | `--base-2` | `#f7f8f9` |
| `base-3` | `--base-3` | `#ffffff` |
| `accent` | `--accent` | `#1e73be` |

### Access Global Colors
```php
$global_colors = generate_get_option('global_colors');
// Returns array of color objects with 'name', 'slug', 'color' keys
```

## Body Colors

```php
generate_get_option('background_color');     // Default: 'var(--base-2)'
generate_get_option('text_color');           // Default: 'var(--contrast)'
generate_get_option('link_color');           // Default: 'var(--accent)'
generate_get_option('link_color_hover');     // Default: 'var(--contrast)'
generate_get_option('link_color_visited');   // Default: ''
```

## Top Bar Colors

```php
generate_get_option('top_bar_background_color');    // Default: '#636363'
generate_get_option('top_bar_text_color');          // Default: '#ffffff'
generate_get_option('top_bar_link_color');          // Default: '#ffffff'
generate_get_option('top_bar_link_color_hover');    // Default: '#303030'
```

## Header Colors

```php
generate_get_option('header_background_color');     // Default: 'var(--base-3)'
generate_get_option('header_text_color');           // Default: ''
generate_get_option('header_link_color');           // Default: ''
generate_get_option('header_link_hover_color');     // Default: ''
generate_get_option('site_title_color');            // Default: 'var(--contrast)'
generate_get_option('site_tagline_color');          // Default: 'var(--contrast-2)'
```

## Navigation Colors

### Primary Navigation
```php
generate_get_option('navigation_background_color');        // Default: 'var(--base-3)'
generate_get_option('navigation_text_color');              // Default: 'var(--contrast)'
generate_get_option('navigation_background_hover_color');  // Default: ''
generate_get_option('navigation_text_hover_color');        // Default: 'var(--accent)'
generate_get_option('navigation_background_current_color');// Default: ''
generate_get_option('navigation_text_current_color');      // Default: 'var(--accent)'
```

### Sub-Navigation (Dropdowns)
```php
generate_get_option('subnavigation_background_color');        // Default: 'var(--base)'
generate_get_option('subnavigation_text_color');              // Default: ''
generate_get_option('subnavigation_background_hover_color');  // Default: ''
generate_get_option('subnavigation_text_hover_color');        // Default: ''
generate_get_option('subnavigation_background_current_color');// Default: ''
generate_get_option('subnavigation_text_current_color');      // Default: ''
```

### Navigation Search
```php
generate_get_option('navigation_search_background_color');  // Default: ''
generate_get_option('navigation_search_text_color');        // Default: ''
```

## Content Colors

```php
generate_get_option('content_background_color');     // Default: 'var(--base-3)'
generate_get_option('content_text_color');           // Default: ''
generate_get_option('content_link_color');           // Default: ''
generate_get_option('content_link_hover_color');     // Default: ''
generate_get_option('content_title_color');          // Default: ''
```

### Blog Post Colors
```php
generate_get_option('blog_post_title_color');        // Default: 'var(--contrast)'
generate_get_option('blog_post_title_hover_color');  // Default: 'var(--contrast-2)'
```

### Entry Meta Colors
```php
generate_get_option('entry_meta_text_color');        // Default: 'var(--contrast-2)'
generate_get_option('entry_meta_link_color');        // Default: ''
generate_get_option('entry_meta_link_color_hover');  // Default: ''
```

### Heading Colors
```php
generate_get_option('h1_color');  // Default: ''
generate_get_option('h2_color');  // Default: ''
generate_get_option('h3_color');  // Default: ''
generate_get_option('h4_color');  // Default: ''
generate_get_option('h5_color');  // Default: ''
generate_get_option('h6_color');  // Default: ''
```

## Sidebar Widget Colors

```php
generate_get_option('sidebar_widget_background_color');   // Default: 'var(--base-3)'
generate_get_option('sidebar_widget_text_color');         // Default: ''
generate_get_option('sidebar_widget_link_color');         // Default: ''
generate_get_option('sidebar_widget_link_hover_color');   // Default: ''
generate_get_option('sidebar_widget_title_color');        // Default: ''
```

## Footer Widget Colors

```php
generate_get_option('footer_widget_background_color');    // Default: 'var(--base-3)'
generate_get_option('footer_widget_text_color');          // Default: ''
generate_get_option('footer_widget_link_color');          // Default: ''
generate_get_option('footer_widget_link_hover_color');    // Default: ''
generate_get_option('footer_widget_title_color');         // Default: ''
```

## Footer Bar Colors

```php
generate_get_option('footer_background_color');      // Default: 'var(--base-3)'
generate_get_option('footer_text_color');            // Default: ''
generate_get_option('footer_link_color');            // Default: ''
generate_get_option('footer_link_hover_color');      // Default: ''
```

## Form Colors

```php
generate_get_option('form_background_color');            // Default: 'var(--base-2)'
generate_get_option('form_text_color');                  // Default: 'var(--contrast)'
generate_get_option('form_background_color_focus');      // Default: 'var(--base-2)'
generate_get_option('form_text_color_focus');            // Default: 'var(--contrast)'
generate_get_option('form_border_color');                // Default: 'var(--base)'
generate_get_option('form_border_color_focus');          // Default: 'var(--contrast-3)'
```

### Form Button Colors
```php
generate_get_option('form_button_background_color');        // Default: '#55555e'
generate_get_option('form_button_background_color_hover');  // Default: '#3f4047'
generate_get_option('form_button_text_color');              // Default: '#ffffff'
generate_get_option('form_button_text_color_hover');        // Default: '#ffffff'
```

## Back to Top Colors

```php
generate_get_option('back_to_top_background_color');        // Default: 'rgba(0,0,0,0.4)'
generate_get_option('back_to_top_background_color_hover');  // Default: 'rgba(0,0,0,0.6)'
generate_get_option('back_to_top_text_color');              // Default: '#ffffff'
generate_get_option('back_to_top_text_color_hover');        // Default: '#ffffff'
```

## Search Modal Colors

```php
generate_get_option('search_modal_bg_color');           // Default: 'var(--base-3)'
generate_get_option('search_modal_text_color');         // Default: 'var(--contrast)'
generate_get_option('search_modal_overlay_bg_color');   // Default: 'rgba(0,0,0,0.2)'
```

## Programmatic Color Changes

### Change Global Colors
```php
add_filter('generate_get_options', function($settings) {
    $settings['global_colors'] = array(
        array('name' => 'Contrast', 'slug' => 'contrast', 'color' => '#1a1a1a'),
        array('name' => 'Contrast 2', 'slug' => 'contrast-2', 'color' => '#4a4a4a'),
        array('name' => 'Accent', 'slug' => 'accent', 'color' => '#0073aa'),
        // ... other colors
    );
    return $settings;
});
```

### Change Specific Color
```php
add_filter('generate_get_options', function($settings) {
    $settings['link_color'] = '#ff6600';
    $settings['link_color_hover'] = '#cc5200';
    return $settings;
});
```

## Getting All Color Defaults

```php
$color_defaults = generate_get_color_defaults();
// Returns array of all color options with their default values
```
