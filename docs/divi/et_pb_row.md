# DIVI Shortcode: et_pb_row

## Overview

The Row shortcode defines a horizontal container within a Section. It establishes the column layout structure and controls how content is distributed across the width of the page. Rows determine spacing between columns (gutter), column heights, and background styling for the row itself.

## Hierarchy

- **Parent:** `et_pb_section`
- **Children:** `et_pb_column` (required - one or more)
- **Usage context:** Required inside sections to organize content in columns

## Parameters

### Structural Parameters

| Parameter           | Type         | Default | Description                   | Example                          |
| ------------------- | ------------ | ------- | ----------------------------- | -------------------------------- |
| `_builder_version`  | string       | "4.16"  | Divi builder version          | `_builder_version="4.16"`        |
| `column_structure`  | string       | "4_4"   | Column layout pattern         | `column_structure="1_3,1_3,1_3"` |
| `use_custom_gutter` | yes/no       | "off"   | Enable custom column spacing  | `use_custom_gutter="on"`         |
| `gutter_width`      | number (1-4) | "3"     | Column spacing width (gutter) | `gutter_width="2"`               |
| `make_equal`        | yes/no       | "off"   | Force equal column heights    | `make_equal="on"`                |

### Background Parameters

| Parameter             | Type   | Default     | Description               | Example                                           |
| --------------------- | ------ | ----------- | ------------------------- | ------------------------------------------------- |
| `background_color`    | color  | empty       | Row background color      | `background_color="#ffffff"`                      |
| `background_image`    | URL    | empty       | Row background image      | `background_image="http://example.com/bg.jpg"`    |
| `background_size`     | string | "cover"     | Background size property  | `background_size="cover"`                         |
| `background_repeat`   | string | "no-repeat" | Background repeat setting | `background_repeat="no-repeat"`                   |
| `background_position` | string | "center"    | Background position       | `background_position="center center"`             |
| `background_video`    | URL    | empty       | Background video URL      | `background_video="http://example.com/video.mp4"` |
| `parallax`            | yes/no | "off"       | Enable parallax effect    | `parallax="on"`                                   |

### Spacing Parameters

| Parameter        | Type      | Default | Description                                           | Example                                         |
| ---------------- | --------- | ------- | ----------------------------------------------------- | ----------------------------------------------- |
| `custom_padding` | dimension | empty   | Custom padding (top\|right\|bottom\|left\|responsive) | `custom_padding="0\|0px\|0\|0px\|false\|false"` |
| `custom_margin`  | dimension | empty   | Custom margin                                         | `custom_margin="\|363px\|\|auto\|\|"`           |

### Alignment Parameters

| Parameter          | Type   | Default  | Description                         | Example                     |
| ------------------ | ------ | -------- | ----------------------------------- | --------------------------- |
| `module_alignment` | string | "center" | Row alignment (left, center, right) | `module_alignment="center"` |

### Advanced Parameters

| Parameter      | Type   | Default | Description               | Example                     |
| -------------- | ------ | ------- | ------------------------- | --------------------------- |
| `module_id`    | string | empty   | CSS ID for custom styling | `module_id="row-features"`  |
| `module_class` | string | empty   | CSS classes               | `module_class="custom-row"` |

## Column Structure Reference

Common `column_structure` patterns used on the site:

| Pattern           | Layout                | Example              |
| ----------------- | --------------------- | -------------------- |
| `4_4`             | Full width (1 column) | Single column layout |
| `1_2,1_2`         | Two equal columns     | 50/50 split          |
| `1_3,1_3,1_3`     | Three equal columns   | 33.33/33.33/33.33    |
| `1_4,1_4,1_4,1_4` | Four equal columns    | 25/25/25/25          |
| `1_3,2_3`         | 1/3 and 2/3 split     | Sidebar + content    |
| `2_3,1_3`         | 2/3 and 1/3 split     | Content + sidebar    |
| `1_4,3_4`         | 1/4 and 3/4 split     | Small + large        |
| `3_4,1_4`         | 3/4 and 1/4 split     | Large + small        |

## Real Usage Examples

### Example 1: Three-Column Layout with Equal Heights

```
[et_pb_row column_structure="1_3,1_3,1_3"
  _builder_version="4.16"
  make_equal="on"
  custom_padding="0|0px|0|0px|false|false"]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_blurb title="Mateřská škola"
      image="/wp-content/uploads/2021/08/p1010409.jpg"
      _builder_version="4.16"][/et_pb_blurb]
  [/et_pb_column]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_blurb title="Základní škola"
      image="/wp-content/uploads/2021/08/school.jpg"
      _builder_version="4.16"][/et_pb_blurb]
  [/et_pb_column]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_blurb title="Gymnázium"
      image="/wp-content/uploads/2021/08/gym.jpg"
      _builder_version="4.16"][/et_pb_blurb]
  [/et_pb_column]

[/et_pb_row]
```

### Example 2: Full-Width Row with Background and Custom Padding

```
[et_pb_row _builder_version="4.16"
  background_image="/wp-content/uploads/2021/content-bg.jpg"
  background_color="#f0f0f0"
  custom_padding="40px|60px|40px|60px|false|false"
  module_alignment="center"]

  [et_pb_column type="4_4" _builder_version="4.16"]
    [et_pb_text _builder_version="4.16"]
      <h2>Featured Content</h2>
      <p>This is a full-width row with custom styling.</p>
    [/et_pb_text]
  [/et_pb_column]

[/et_pb_row]
```

### Example 3: Two-Column Layout with Custom Gutter

```
[et_pb_row column_structure="1_2,1_2"
  _builder_version="4.16"
  use_custom_gutter="on"
  gutter_width="2"
  custom_padding="20px|20px|20px|20px|false|false"]

  [et_pb_column type="1_2" _builder_version="4.16"]
    [et_pb_image src="http://waldorf-brno.cz/uploads/image.jpg"
      _builder_version="4.16"][/et_pb_image]
  [/et_pb_column]

  [et_pb_column type="1_2" _builder_version="4.16"]
    [et_pb_text _builder_version="4.16"]
      <h3>Description</h3>
      <p>Detailed content goes here.</p>
    [/et_pb_text]
  [/et_pb_column]

[/et_pb_row]
```

### Example 4: Sidebar + Content Layout

```
[et_pb_row column_structure="1_3,2_3"
  _builder_version="4.16"
  custom_padding="0|0px|0|0px|false|false"]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_text _builder_version="4.16"]
      <h3>Sidebar</h3>
      <p>Navigation or supplementary content.</p>
    [/et_pb_text]
  [/et_pb_column]

  [et_pb_column type="2_3" _builder_version="4.16"]
    [et_pb_text _builder_version="4.16"]
      <h2>Main Content</h2>
      <p>Primary content area takes up 2/3 of width.</p>
    [/et_pb_text]
  [/et_pb_column]

[/et_pb_row]
```

## Conversion Complexity

**Rating:** MEDIUM

**Reasoning:**

- Maps relatively well to Gutenberg `core/columns` block
- Column structure values (1_3, 2_3, etc.) need conversion to percentage widths
- Gutter width needs CSS custom property mapping
- Background properties require conversion similar to sections
- Make equal heights requires flexbox CSS properties
- Some mobile-specific variants (\_tablet, \_phone) require careful handling
- Overall simpler than sections, but column distribution logic is non-trivial

## Notes

- `column_structure` parameter defines the **entire row layout** - all columns are defined by this single parameter value
- Gutter width uses a scale from 1-4 (typically maps to spacing like 5px, 10px, 15px, 20px)
- Make equal forces flexbox `align-items: stretch` behavior on columns
- Default gutter width is 3 (from `et_get_option( 'gutter_width', '3' )`)
- Rows inherit background properties from sections if not explicitly set
- Row alignment affects centering behavior within the section
- Most used structural element (712 instances) - standardized conversion approach needed
- Padding Mobile parameter has been removed in newer versions but may still be present in legacy content
- Custom padding syntax: `top|right|bottom|left|on_mobile|important_flag`
