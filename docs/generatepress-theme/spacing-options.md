# GeneratePress Spacing Options

All spacing values are in pixels unless otherwise noted.

## Get All Spacing Defaults

```php
$spacing_defaults = generate_spacing_get_defaults();
```

## Top Bar Spacing

```php
generate_get_option('top_bar_top');          // Default: '10'
generate_get_option('top_bar_right');        // Default: '40'
generate_get_option('top_bar_bottom');       // Default: '10'
generate_get_option('top_bar_left');         // Default: '40'

// Mobile
generate_get_option('mobile_top_bar_right'); // Default: '30'
generate_get_option('mobile_top_bar_left');  // Default: '30'
```

## Header Spacing

```php
generate_get_option('header_top');           // Default: '20'
generate_get_option('header_right');         // Default: '40'
generate_get_option('header_bottom');        // Default: '20'
generate_get_option('header_left');          // Default: '40'
```

## Navigation Spacing

### Menu Items
```php
generate_get_option('menu_item');            // Default: '20' (horizontal padding)
generate_get_option('menu_item_height');     // Default: '60' (vertical padding)
```

### Sub-Menu (Dropdowns)
```php
generate_get_option('sub_menu_item_height'); // Default: '10' (vertical padding)
generate_get_option('sub_menu_width');       // Default: '200' (dropdown width)
```

## Content Spacing

### Desktop
```php
generate_get_option('content_top');          // Default: '40'
generate_get_option('content_right');        // Default: '40'
generate_get_option('content_bottom');       // Default: '40'
generate_get_option('content_left');         // Default: '40'
```

### Mobile
```php
generate_get_option('mobile_content_top');    // Default: '30'
generate_get_option('mobile_content_right');  // Default: '30'
generate_get_option('mobile_content_bottom'); // Default: '30'
generate_get_option('mobile_content_left');   // Default: '30'
```

## Sidebar Spacing

### Sidebar Widths (percentage)
```php
generate_get_option('left_sidebar_width');   // Default: '30' (%)
generate_get_option('right_sidebar_width');  // Default: '30' (%)
```

### Separator (gap between content and sidebar)
```php
generate_get_option('separator');            // Default: '20'
```

## Widget Spacing

```php
generate_get_option('widget_top');           // Default: '40'
generate_get_option('widget_right');         // Default: '40'
generate_get_option('widget_bottom');        // Default: '40'
generate_get_option('widget_left');          // Default: '40'
```

## Footer Widget Container Spacing

```php
generate_get_option('footer_widget_container_top');    // Default: '40'
generate_get_option('footer_widget_container_right');  // Default: '40'
generate_get_option('footer_widget_container_bottom'); // Default: '40'
generate_get_option('footer_widget_container_left');   // Default: '40'

// Separator between footer widget columns
generate_get_option('footer_widget_separator');        // Default: '40'
```

## Footer Bar Spacing

### Desktop
```php
generate_get_option('footer_top');           // Default: '20'
generate_get_option('footer_right');         // Default: '40'
generate_get_option('footer_bottom');        // Default: '20'
generate_get_option('footer_left');          // Default: '40'
```

### Mobile
```php
generate_get_option('mobile_footer_right');  // Default: '30'
generate_get_option('mobile_footer_left');   // Default: '30'
```

## Spacing Reference Table

| Area | Top | Right | Bottom | Left |
|------|-----|-------|--------|------|
| Top Bar | 10 | 40 | 10 | 40 |
| Header | 20 | 40 | 20 | 40 |
| Content | 40 | 40 | 40 | 40 |
| Content (mobile) | 30 | 30 | 30 | 30 |
| Widgets | 40 | 40 | 40 | 40 |
| Footer Widgets | 40 | 40 | 40 | 40 |
| Footer Bar | 20 | 40 | 20 | 40 |

## Programmatic Spacing Changes

### Reduce Content Padding
```php
add_filter('generate_get_options', function($settings) {
    $settings['content_top'] = '20';
    $settings['content_right'] = '20';
    $settings['content_bottom'] = '20';
    $settings['content_left'] = '20';
    return $settings;
});
```

### Change Sidebar Width
```php
add_filter('generate_get_options', function($settings) {
    $settings['right_sidebar_width'] = '25';  // 25%
    return $settings;
});
```

### Increase Navigation Height
```php
add_filter('generate_get_options', function($settings) {
    $settings['menu_item_height'] = '80';  // Taller nav items
    return $settings;
});
```
