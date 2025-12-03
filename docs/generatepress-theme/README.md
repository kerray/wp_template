# GeneratePress Theme Options Reference

This document provides comprehensive documentation for GeneratePress theme options, including programmatic access methods and database storage details.

## Overview

GeneratePress stores all theme options in a single WordPress option: **`generate_settings`** (serialized array in `wp_options` table).

## Quick Reference

```php
// Get any option
$value = generate_get_option('container_width');

// Get all defaults
$defaults = generate_get_defaults();

// Check database directly
$settings = get_option('generate_settings', array());
```

## Documentation Index

| Document | Description |
|----------|-------------|
| [Layout Options](layout-options.md) | Container, header, nav, footer settings |
| [Color Options](color-options.md) | All color customization options |
| [Typography Options](typography-options.md) | Font family, sizes, weights |
| [Spacing Options](spacing-options.md) | Padding, margins, widths |
| [Programmatic Access](programmatic-access.md) | PHP functions and WP-CLI |
| [Database Reference](database-reference.md) | Option keys and storage format |

## Core Options Summary

### Layout Settings

| Option | Default | Type | Description |
|--------|---------|------|-------------|
| `container_width` | `1200` | int | Container width in pixels |
| `header_layout_setting` | `fluid-header` | select | `fluid-header` or `contained-header` |
| `nav_layout_setting` | `fluid-nav` | select | Navigation width |
| `content_layout_setting` | `separate-containers` | select | Content layout mode |
| `layout_setting` | `right-sidebar` | select | Default sidebar layout |
| `footer_widget_setting` | `3` | select | Number of footer widgets (0-5) |

### Display Settings

| Option | Default | Type | Description |
|--------|---------|------|-------------|
| `hide_title` | `''` | bool | Hide site title |
| `hide_tagline` | `true` | bool | Hide site tagline |
| `logo` | `''` | url | Logo image URL |
| `retina_logo` | `''` | url | 2x logo for high-DPI |
| `back_to_top` | `''` | select | Back to top button |

### Navigation Settings

| Option | Default | Type | Description |
|--------|---------|------|-------------|
| `nav_position_setting` | `nav-float-right` | select | Navigation position |
| `nav_dropdown_type` | `hover` | select | `hover`, `click`, `click-arrow` |
| `nav_search` | `disable` | select | Navigation search |

### Technical Settings

| Option | Default | Type | Description |
|--------|---------|------|-------------|
| `structure` | `flexbox` | select | `flexbox` or `floats` |
| `icons` | `svg` | select | `svg` or `font` |
| `combine_css` | `true` | bool | Combine CSS files |
| `dynamic_css_cache` | `true` | bool | Cache dynamic CSS |

## Global Colors

GeneratePress uses 7 global colors as CSS variables:

| Name | Variable | Default |
|------|----------|---------|
| Contrast | `--contrast` | `#222222` |
| Contrast 2 | `--contrast-2` | `#575760` |
| Contrast 3 | `--contrast-3` | `#b2b2be` |
| Base | `--base` | `#f0f0f0` |
| Base 2 | `--base-2` | `#f7f8f9` |
| Base 3 | `--base-3` | `#ffffff` |
| Accent | `--accent` | `#1e73be` |

## File Structure

```
src/wp-content/themes/generatepress/
├── functions.php                 # Theme initialization
├── inc/
│   ├── defaults.php              # All default values
│   ├── theme-functions.php       # generate_get_option()
│   ├── customizer.php            # Customizer setup
│   ├── customizer/
│   │   ├── fields/               # Individual customizer fields
│   │   │   ├── body.php
│   │   │   ├── header.php
│   │   │   ├── primary-navigation.php
│   │   │   ├── content.php
│   │   │   ├── forms.php
│   │   │   └── ...
│   │   └── controls/             # Custom control classes
│   ├── css-output.php            # Dynamic CSS generation
│   ├── typography.php            # Typography handling
│   └── general.php               # General functions
```

## See Also

- [GenerateBlocks Documentation](../generateblocks/) - Block editor integration
- [DIVI Migration Guide](../DIVI_MIGRATION_PLAN.md) - Migration from DIVI
