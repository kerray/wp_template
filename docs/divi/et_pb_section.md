# DIVI Shortcode: et_pb_section

## Overview

The Section shortcode is the **top-level container** for DIVI page layouts. It wraps rows and defines the full-width layout area with background styling, dividers, padding, and other visual effects. Sections are essential structural elements that organize content into distinct visual zones on a page.

## Hierarchy

- **Parent:** None (root-level element)
- **Children:** `et_pb_row`, `et_pb_row_inner` (specialty layouts)
- **Usage context:** Every DIVI page must start with one or more sections containing rows

## Parameters

### Structural Parameters

| Parameter          | Type   | Default | Description                     | Example                   |
| ------------------ | ------ | ------- | ------------------------------- | ------------------------- |
| `fb_built`         | string | "1"     | Visual builder flag             | `fb_built="1"`            |
| `_builder_version` | string | "4.16"  | Divi builder version            | `_builder_version="4.16"` |
| `specialty`        | yes/no | "off"   | Enable specialty column layouts | `specialty="on"`          |
| `inner_shadow`     | yes/no | "off"   | Show inner shadow effect        | `inner_shadow="on"`       |
| `make_equal`       | yes/no | "off"   | Equalize column heights         | `make_equal="on"`         |

### Background & Visual Parameters

| Parameter             | Type   | Default     | Description                            | Example                                           |
| --------------------- | ------ | ----------- | -------------------------------------- | ------------------------------------------------- |
| `background_color`    | color  | empty       | Background color (hex or rgba)         | `background_color="#ffffff"`                      |
| `background_image`    | URL    | empty       | Background image URL                   | `background_image="http://example.com/image.jpg"` |
| `background_size`     | string | "cover"     | Background size (cover, contain, auto) | `background_size="cover"`                         |
| `background_position` | string | "center"    | Background position                    | `background_position="center center"`             |
| `background_repeat`   | string | "no-repeat" | Background repeat setting              | `background_repeat="no-repeat"`                   |
| `background_video`    | URL    | empty       | Background video URL                   | `background_video="http://example.com/video.mp4"` |
| `parallax`            | yes/no | "off"       | Enable parallax scrolling              | `parallax="on"`                                   |
| `parallax_method`     | string | "on"        | Parallax rendering method              | `parallax_method="on"`                            |

### Divider Parameters

| Parameter               | Type      | Default | Description                                      | Example                          |
| ----------------------- | --------- | ------- | ------------------------------------------------ | -------------------------------- |
| `top_divider_style`     | string    | "none"  | Top divider style (wave, zigzag, triangle, etc.) | `top_divider_style="wave"`       |
| `top_divider_color`     | color     | empty   | Top divider color                                | `top_divider_color="#ffffff"`    |
| `top_divider_height`    | dimension | "18px"  | Top divider height                               | `top_divider_height="18px"`      |
| `bottom_divider_style`  | string    | "none"  | Bottom divider style                             | `bottom_divider_style="wave"`    |
| `bottom_divider_color`  | color     | empty   | Bottom divider color                             | `bottom_divider_color="#ffffff"` |
| `bottom_divider_height` | dimension | "32px"  | Bottom divider height                            | `bottom_divider_height="32px"`   |

### Spacing Parameters

| Parameter        | Type      | Default | Description                                       | Example                                               |
| ---------------- | --------- | ------- | ------------------------------------------------- | ----------------------------------------------------- |
| `custom_padding` | dimension | empty   | Custom padding (top\|right\|bottom\|left\|mobile) | `custom_padding="14px\|0px\|44px\|0px\|false\|false"` |
| `custom_margin`  | dimension | empty   | Custom margin (top\|right\|bottom\|left)          | `custom_margin="\|363px\|\|auto\|\|"`                 |

### Advanced Parameters

| Parameter                | Type   | Default | Description                                    | Example                            |
| ------------------------ | ------ | ------- | ---------------------------------------------- | ---------------------------------- |
| `global_colors_info`     | JSON   | "{}"    | Global color scheme reference                  | `global_colors_info="{}"`          |
| `text_text_color`        | color  | empty   | Default text color for section                 | `text_text_color="#333333"`        |
| `text_text_shadow_style` | string | "none"  | Text shadow preset (preset1, preset2, preset3) | `text_text_shadow_style="preset3"` |
| `text_text_shadow_color` | color  | empty   | Text shadow color                              | `text_text_shadow_color="#000000"` |
| `module_id`              | string | empty   | CSS ID for custom styling                      | `module_id="section-header"`       |
| `module_class`           | string | empty   | CSS classes for styling                        | `module_class="custom-section"`    |

## Real Usage Examples

### Example 1: Homepage Header Section with Background Image and Wave Dividers

```
[et_pb_section fb_built="1" _builder_version="4.16"
  background_image="/wp-content/uploads/2018/04/waldorf-pozadi-web-small-2.jpg"
  custom_padding="14px|0px|44px|0px|false|false"
  top_divider_color="#ffffff"
  top_divider_height="18px"
  bottom_divider_style="wave"
  bottom_divider_color="#ffffff"
  bottom_divider_height="32px"
  global_colors_info="{}"]

  [et_pb_row _builder_version="4.16" custom_padding="0|0px|0|0px|false|false"]
    [et_pb_column type="4_4" _builder_version="4.16"]
      [et_pb_text _builder_version="4.16" text_text_color="#ffffff"]
        <h1>WALDORFSKÁ ŠKOLA BRNO</h1>
      [/et_pb_text]
    [/et_pb_column]
  [/et_pb_row]

[/et_pb_section]
```

### Example 2: Section with Parallax Background

```
[et_pb_section _builder_version="4.16"
  background_image="/wp-content/uploads/2021/08/background.jpg"
  background_size="cover"
  background_position="center center"
  background_repeat="no-repeat"
  parallax="on"
  parallax_method="on"
  custom_padding="60px|0px|60px|0px|false|false"]

  [et_pb_row _builder_version="4.16"]
    [et_pb_column type="4_4" _builder_version="4.16"]
      [et_pb_text _builder_version="4.16"]
        <h2>Featured Section</h2>
      [/et_pb_text]
    [/et_pb_column]
  [/et_pb_row]

[/et_pb_section]
```

### Example 3: Full-Width Section with Custom Colors

```
[et_pb_section _builder_version="4.16"
  background_color="#f5f5f5"
  custom_padding="40px|0px|40px|0px|false|false"
  custom_margin="|0px||0px||"
  inner_shadow="off"
  module_class="section-light-bg"]

  [et_pb_row _builder_version="4.16" make_equal="on"]
    [et_pb_column type="1_3" _builder_version="4.16"]
      [et_pb_blurb title="Column 1" _builder_version="4.16"][/et_pb_blurb]
    [/et_pb_column]
    [et_pb_column type="1_3" _builder_version="4.16"]
      [et_pb_blurb title="Column 2" _builder_version="4.16"][/et_pb_blurb]
    [/et_pb_column]
    [et_pb_column type="1_3" _builder_version="4.16"]
      [et_pb_blurb title="Column 3" _builder_version="4.16"][/et_pb_blurb]
    [/et_pb_column]
  [/et_pb_row]

[/et_pb_section]
```

## Conversion Complexity

**Rating:** HIGH

**Reasoning:**

- Sections handle complex background properties (images, videos, gradients, parallax)
- Divider styling (wave, zigzag) requires CSS generation or custom block implementation
- Parallax effect requires JavaScript implementation
- Multiple responsive padding/margin variants (\_tablet, \_phone suffixes) need careful mapping
- Global color system integration is theme-specific
- Will require custom Gutenberg block to preserve all visual properties

## Notes

- Sections are **always full-width** containers
- Multiple sections can be placed sequentially to create distinct visual zones
- Background videos require browser support and may affect mobile performance
- Parallax scrolling is CPU-intensive; use sparingly
- Inner shadow is purely visual and rarely used in practice on this site
- The `global_colors_info` parameter is always an empty JSON object `"{}"` on this site
- Responsive attributes like `_tablet` and `_phone` suffixes can be appended to most parameters for mobile-specific styling
- Top and bottom dividers are commonly used to create visual breaks between sections
- This is the most frequently used module (485 instances) - careful conversion is critical
