# GeneratePress Layout Options

## Container Settings

### Container Width
```php
generate_get_option('container_width');  // Default: '1200'
```
Main container width in pixels.

### Container Alignment
```php
generate_get_option('container_alignment');  // Default: 'text'
```
Options: `boxes` | `text`

## Header Layout

### Header Width
```php
generate_get_option('header_layout_setting');  // Default: 'fluid-header'
```
Options: `fluid-header` | `contained-header`

### Header Inner Width
```php
generate_get_option('header_inner_width');  // Default: 'contained'
```
Options: `contained` | `full-width`

### Header Alignment
```php
generate_get_option('header_alignment_setting');  // Default: 'left' (RTL: 'right')
```
Options: `left` | `center` | `right`

## Top Bar Settings

### Top Bar Width
```php
generate_get_option('top_bar_width');  // Default: 'full'
```
Options: `full` | `contained`

### Top Bar Inner Width
```php
generate_get_option('top_bar_inner_width');  // Default: 'contained'
```

### Top Bar Alignment
```php
generate_get_option('top_bar_alignment');  // Default: 'right'
```
Options: `left` | `center` | `right`

## Navigation Layout

### Navigation Width
```php
generate_get_option('nav_layout_setting');  // Default: 'fluid-nav'
```
Options: `fluid-nav` | `contained-nav`

### Navigation Inner Width
```php
generate_get_option('nav_inner_width');  // Default: 'contained'
```

### Navigation Alignment
```php
generate_get_option('nav_alignment_setting');  // Default: 'left'
```
Options: `left` | `center` | `right`

### Navigation Position
```php
generate_get_option('nav_position_setting');  // Default: 'nav-float-right'
```
Options:
- `nav-below-header` - Below header
- `nav-above-header` - Above header
- `nav-float-right` - Float right of logo
- `nav-float-left` - Float left of logo
- `nav-left-sidebar` - Left sidebar nav
- `nav-right-sidebar` - Right sidebar nav

### Navigation Drop Point
```php
generate_get_option('nav_drop_point');  // Default: ''
```
Width in pixels when navigation drops below logo on smaller screens.

### Dropdown Type
```php
generate_get_option('nav_dropdown_type');  // Default: 'hover'
```
Options: `hover` | `click` | `click-arrow`

### Dropdown Direction
```php
generate_get_option('nav_dropdown_direction');  // Default: 'right'
```
Options: `left` | `right`

### Navigation Search
```php
generate_get_option('nav_search');  // Default: 'disable'
```
Options: `enable` | `disable`

### Search Modal
```php
generate_get_option('nav_search_modal');  // Default: false
```

## Content Layout

### Content Layout
```php
generate_get_option('content_layout_setting');  // Default: 'separate-containers'
```
Options: `separate-containers` | `one-container`

### Sidebar Layout
```php
generate_get_option('layout_setting');        // Default: 'right-sidebar'
generate_get_option('blog_layout_setting');   // Blog pages
generate_get_option('single_layout_setting'); // Single posts
```
Options:
- `left-sidebar`
- `right-sidebar`
- `no-sidebar`
- `both-sidebars`
- `both-left`
- `both-right`

### Post Content Display
```php
generate_get_option('post_content');  // Default: 'excerpt'
```
Options: `excerpt` | `full`

## Footer Layout

### Footer Width
```php
generate_get_option('footer_layout_setting');  // Default: 'fluid-footer'
```
Options: `fluid-footer` | `contained-footer`

### Footer Inner Width
```php
generate_get_option('footer_inner_width');  // Default: 'contained'
```

### Footer Widgets
```php
generate_get_option('footer_widget_setting');  // Default: '3'
```
Options: `0` | `1` | `2` | `3` | `4` | `5`

### Footer Bar Alignment
```php
generate_get_option('footer_bar_alignment');  // Default: 'right'
```
Options: `left` | `center` | `right`

## Technical Options

### Structure
```php
generate_get_option('structure');  // Default: 'flexbox'
```
Options: `flexbox` | `floats`

### Back to Top Button
```php
generate_get_option('back_to_top');  // Default: ''
```
Options: `enable` | `''` (disabled)

## Programmatic Layout Changes

### Change Default Sidebar Layout
```php
// In functions.php or child theme
add_filter('generate_get_options', function($settings) {
    $settings['layout_setting'] = 'no-sidebar';
    return $settings;
});
```

### Change Specific Page Layout
```php
// Via post meta
update_post_meta($post_id, '_generate-sidebar-layout-meta', 'no-sidebar');
```

### WP-CLI Examples
```bash
# Get current container width
just wp "option get generate_settings --format=json" | jq '.container_width'

# Update container width (be careful with serialized data!)
# It's safer to use the Customizer or programmatic methods
```
