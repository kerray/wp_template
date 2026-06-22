# DIVI Shortcode: et_pb_column

## Overview

The Column shortcode is a **vertical container** that holds content modules (text, images, buttons, etc.). Columns are defined by their parent row's `column_structure` parameter and inherit their width from that definition. Each column can contain multiple content modules and has its own background, padding, and styling options.

## Hierarchy

- **Parent:** `et_pb_row`
- **Children:** Any content modules (`et_pb_text`, `et_pb_image`, `et_pb_button`, `et_pb_blurb`, `et_pb_tabs`, `et_pb_blog`, etc.)
- **Usage context:** Container for all content within a row

## Parameters

### Structural Parameters

| Parameter           | Type   | Default | Description                    | Example                   |
| ------------------- | ------ | ------- | ------------------------------ | ------------------------- |
| `type`              | string | "4_4"   | Column width fraction          | `type="1_3"`              |
| `_builder_version`  | string | "4.16"  | Divi builder version           | `_builder_version="4.16"` |
| `specialty_columns` | string | empty   | Specialty column configuration | `specialty_columns="4"`   |

### Background Parameters

| Parameter             | Type   | Default     | Description             | Example                                           |
| --------------------- | ------ | ----------- | ----------------------- | ------------------------------------------------- |
| `background_color`    | color  | empty       | Column background color | `background_color="#ffffff"`                      |
| `background_image`    | URL    | empty       | Column background image | `background_image="http://example.com/bg.jpg"`    |
| `background_size`     | string | "cover"     | Background size         | `background_size="cover"`                         |
| `background_position` | string | "center"    | Background position     | `background_position="center center"`             |
| `background_repeat`   | string | "no-repeat" | Background repeat       | `background_repeat="no-repeat"`                   |
| `background_video`    | URL    | empty       | Background video URL    | `background_video="http://example.com/video.mp4"` |

### Spacing Parameters

| Parameter        | Type      | Default | Description                                       | Example                                       |
| ---------------- | --------- | ------- | ------------------------------------------------- | --------------------------------------------- |
| `custom_padding` | dimension | empty   | Custom padding (top\|right\|bottom\|left\|mobile) | `custom_padding="20px\|20px\|20px\|20px\|on"` |
| `custom_margin`  | dimension | empty   | Custom margin                                     | `custom_margin="\|20px\|\|20px"`              |

### Advanced Parameters

| Parameter      | Type   | Default | Description                           | Example                                  |
| -------------- | ------ | ------- | ------------------------------------- | ---------------------------------------- |
| `module_id`    | string | empty   | CSS ID for custom styling             | `module_id="column-header"`              |
| `module_class` | string | empty   | CSS classes                           | `module_class="custom-column highlight"` |
| `admin_label`  | string | empty   | Label in builder (for identification) | `admin_label="Sidebar Column"`           |

## Column Width Reference

The `type` parameter defines column width as a fraction:

| Type  | Width  | Common Use                        |
| ----- | ------ | --------------------------------- |
| `4_4` | 100%   | Full width (single column row)    |
| `1_2` | 50%    | Half width (two equal columns)    |
| `1_3` | 33.33% | Third width (three column layout) |
| `2_3` | 66.67% | Two-thirds width (sidebar + main) |
| `1_4` | 25%    | Quarter width                     |
| `3_4` | 75%    | Three-quarter width               |
| `1_5` | 20%    | Fifth width                       |
| `2_5` | 40%    | Two-fifth width                   |
| `3_5` | 60%    | Three-fifth width                 |
| `4_5` | 80%    | Four-fifth width                  |
| `1_6` | 16.67% | Sixth width                       |

## Real Usage Examples

### Example 1: Simple Text Column in Three-Column Layout

```
[et_pb_column type="1_3" _builder_version="4.16"]
  [et_pb_text _builder_version="4.16" text_text_color="#333333"]
    <h3>Feature Title</h3>
    <p>Description of the feature goes here.</p>
  [/et_pb_text]
[/et_pb_column]
```

### Example 2: Column with Background Image and Custom Padding

```
[et_pb_column type="1_2" _builder_version="4.16"
  background_image="/wp-content/uploads/2021/bg.jpg"
  background_size="cover"
  background_position="center center"
  custom_padding="40px|30px|40px|30px|on"
  module_class="highlighted-column"]

  [et_pb_text _builder_version="4.16" text_text_color="#ffffff"]
    <h2>Featured Content</h2>
    <p>Content overlaid on background image.</p>
  [/et_pb_text]

[/et_pb_column]
```

### Example 3: Full-Width Column with Multiple Modules

```
[et_pb_column type="4_4" _builder_version="4.16"
  custom_padding="20px|20px|20px|20px|false|false"
  module_id="main-content"
  admin_label="Main Content Area"]

  [et_pb_text _builder_version="4.16"]
    <h1>Page Title</h1>
  [/et_pb_text]

  [et_pb_image src="http://example.com/uploads/header.jpg"
    _builder_version="4.16"][/et_pb_image]

  [et_pb_text _builder_version="4.16"]
    <p>Body content follows the header image.</p>
  [/et_pb_text]

[/et_pb_column]
```

### Example 4: Sidebar Column (1/3 Width) with Custom Styling

```
[et_pb_column type="1_3" _builder_version="4.16"
  background_color="#f5f5f5"
  custom_padding="20px|20px|20px|20px|false|false"
  module_class="sidebar"
  admin_label="Sidebar"]

  [et_pb_text _builder_version="4.16"]
    <h3>Sidebar Menu</h3>
    <ul>
      <li><a href="#">Link 1</a></li>
      <li><a href="#">Link 2</a></li>
    </ul>
  [/et_pb_text]

[/et_pb_column]
```

### Example 5: Two-Column Layout with Images

```
[et_pb_row column_structure="1_2,1_2" _builder_version="4.16"]

  [et_pb_column type="1_2" _builder_version="4.16"
    custom_padding="10px|10px|10px|10px|false|false"]
    [et_pb_image src="http://example.com/uploads/img1.jpg"
      _builder_version="4.16"][/et_pb_image]
  [/et_pb_column]

  [et_pb_column type="1_2" _builder_version="4.16"
    custom_padding="10px|10px|10px|10px|false|false"]
    [et_pb_image src="http://example.com/uploads/img2.jpg"
      _builder_version="4.16"][/et_pb_image]
  [/et_pb_column]

[/et_pb_row]
```

## Conversion Complexity

**Rating:** MEDIUM

**Reasoning:**

- Maps to Gutenberg `core/column` blocks within `core/columns`
- Width fractions need conversion to percentage or flex properties
- Background properties require CSS custom property implementation
- Padding/margin syntax is complex and needs careful parsing
- Specialty column layouts add complexity (rarely used on this site)
- Module IDs and classes need to be preserved for CSS targeting
- Admin labels are builder-only and don't affect output
- Most columns are straightforward; complexity varies with nested modules

## Notes

- The `type` parameter value must match the parent row's `column_structure` definition
- Columns **cannot** contain other rows or sections (unless using specialty layout)
- Background images on columns will be covered by content modules placed inside
- Custom padding on mobile (`on`) means desktop padding is maintained on mobile devices
- All responsive suffixes (\_tablet, \_phone, \_last_edited) can be appended to styling parameters
- The `specialty_columns` parameter is used only for complex nested layouts (not commonly used on this site)
- Column width is **immutable after row structure is set** - to change column widths, the row structure must be modified
- Admin labels are helpful for identifying columns in the builder but don't appear on the frontend
- Module classes are preserved and should be checked for custom CSS styling
- Most used content container (1,203 instances) - highest volume conversion element
- Many columns will be empty or contain only simple text modules - straightforward to convert
- Responsive design breakpoints (\_tablet, \_phone variants) need special handling for mobile layouts
