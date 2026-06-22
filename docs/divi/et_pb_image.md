# DIVI Shortcode: et_pb_image

## Overview

The Image module displays **responsive images with optional links and lightbox effects**. It's a simple but essential module for showcasing photographs, graphics, diagrams, and other visual content. Images are automatically responsive and can be linked to URLs or lightbox galleries.

## Hierarchy

- **Parent:** `et_pb_column`
- **Children:** None (image display only)
- **Usage context:** Displaying images, photos, graphics, diagrams

## Parameters

### Image Parameters

| Parameter          | Type   | Default | Description                        | Example                                          |
| ------------------ | ------ | ------- | ---------------------------------- | ------------------------------------------------ |
| `_builder_version` | string | "4.16"  | Divi builder version               | `_builder_version="4.16"`                        |
| `src`              | URL    | empty   | Image URL (required)               | `src="http://example.com/uploads/photo.jpg"` |
| `alt`              | text   | empty   | Alternative text for accessibility | `alt="School building"`                          |
| `title_text`       | text   | empty   | Image title attribute              | `title_text="School exterior"`                   |

### Link Parameters

| Parameter          | Type   | Default | Description                | Example                 |
| ------------------ | ------ | ------- | -------------------------- | ----------------------- |
| `url`              | URL    | empty   | Link destination for image | `url="/about/"`         |
| `url_new_window`   | yes/no | "off"   | Open link in new tab       | `url_new_window="on"`   |
| `show_in_lightbox` | yes/no | "off"   | Open image in lightbox     | `show_in_lightbox="on"` |

### Image Styling Parameters

| Parameter                | Type      | Default | Description         | Example                              |
| ------------------------ | --------- | ------- | ------------------- | ------------------------------------ | --- | --- | ----- |
| `image_max_width`        | dimension | "100%"  | Maximum width       | `image_max_width="500px"`            |
| `image_max_width_tablet` | dimension | empty   | Max width on tablet | `image_max_width_tablet="400px"`     |
| `image_max_width_phone`  | dimension | empty   | Max width on phone  | `image_max_width_phone="100%"`       |
| `image_height`           | dimension | "auto"  | Image height        | `image_height="auto"`                |
| `border_radii`           | dimension | "0px"   | Rounded corners     | `border_radii="5px                   | 5px | 5px | 5px"` |
| `box_shadow_style`       | string    | "none"  | Drop shadow preset  | `box_shadow_style="preset1"`         |
| `box_shadow_color`       | color     | empty   | Shadow color        | `box_shadow_color="rgba(0,0,0,0.2)"` |

### Image Alignment

| Parameter         | Type   | Default  | Description                           | Example                    |
| ----------------- | ------ | -------- | ------------------------------------- | -------------------------- |
| `image_alignment` | string | "center" | Image alignment (left, center, right) | `image_alignment="center"` |

### Spacing Parameters

| Parameter        | Type      | Default | Description    | Example               |
| ---------------- | --------- | ------- | -------------- | --------------------- | ---- | ---- | ---- | ----- | ------- |
| `custom_margin`  | dimension | empty   | Custom margin  | `custom_margin="      |      | 20px |      | "`    |
| `custom_padding` | dimension | empty   | Custom padding | `custom_padding="10px | 10px | 10px | 10px | false | false"` |

### Advanced Parameters

| Parameter      | Type   | Default | Description | Example                         |
| -------------- | ------ | ------- | ----------- | ------------------------------- |
| `module_id`    | string | empty   | CSS ID      | `module_id="hero-image"`        |
| `module_class` | string | empty   | CSS classes | `module_class="featured-image"` |

## Real Usage Examples

### Example 1: Simple Responsive Image

```
[et_pb_image src="/wp-content/uploads/2021/08/school-building.jpg"
  alt="Example Site building"
  _builder_version="4.16"]
[/et_pb_image]
```

### Example 2: Image with Lightbox Gallery

```
[et_pb_image src="/wp-content/uploads/2021/08/classroom.jpg"
  alt="Classroom view"
  title_text="Student classroom"
  show_in_lightbox="on"
  _builder_version="4.16"
  image_alignment="center"]
[/et_pb_image]
```

### Example 3: Linked Image

```
[et_pb_image src="/wp-content/uploads/2021/08/program-banner.jpg"
  alt="Our Programs"
  url="/programs/"
  url_new_window="off"
  _builder_version="4.16"
  image_alignment="center"
  custom_margin="||20px||"]
[/et_pb_image]
```

### Example 4: Image with Styling (Border Radius and Shadow)

```
[et_pb_image src="/wp-content/uploads/2021/08/team-photo.jpg"
  alt="Team photo"
  _builder_version="4.16"
  image_alignment="center"
  image_max_width="300px"
  border_radii="10px|10px|10px|10px"
  box_shadow_style="preset1"
  box_shadow_color="rgba(0,0,0,0.1)"
  custom_margin="||20px||"]
[/et_pb_image]
```

### Example 5: Responsive Image (Different Sizes for Desktop/Mobile)

```
[et_pb_image src="/wp-content/uploads/2021/08/responsive-image.jpg"
  alt="Responsive content image"
  _builder_version="4.16"
  image_alignment="center"
  image_max_width="600px"
  image_max_width_tablet="400px"
  image_max_width_phone="100%"
  border_radii="5px|5px|5px|5px"
  custom_margin="||15px||"]
[/et_pb_image]
```

### Example 6: Image in Two-Column Layout

```
[et_pb_row column_structure="1_2,1_2" _builder_version="4.16"]

  [et_pb_column type="1_2" _builder_version="4.16"]
    [et_pb_image src="/wp-content/uploads/2021/08/image-left.jpg"
      alt="Left image"
      _builder_version="4.16"
      image_max_width="100%"
      custom_padding="10px|10px|10px|10px|false|false"]
    [/et_pb_image]
  [/et_pb_column]

  [et_pb_column type="1_2" _builder_version="4.16"]
    [et_pb_text _builder_version="4.16"]
      <h2>Image Description</h2>
      <p>Text content accompanying the image.</p>
    [/et_pb_text]
  [/et_pb_column]

[/et_pb_row]
```

## Conversion Complexity

**Rating:** LOW

**Reasoning:**

- Maps directly to Gutenberg `core/image` block
- Simple parameter structure with straightforward mapping
- Image URL handling is standard
- Link and lightbox functionality are native to WordPress
- Alt text and title are accessibility features easily preserved
- Responsive sizing converts to CSS or block attributes
- Shadow and border radius convert to CSS
- No complex layout or custom JavaScript required

## Notes

- **Image URL Sources:**
  - WordPress media library uploads
  - External URLs (ensure proper protocols)
  - Relative paths (less common)
- `alt` text is **critical for accessibility** and SEO - should never be empty
- `title_text` is for hover tooltip (optional but recommended)
- `image_max_width` can be specified in:
  - Pixels: `500px`
  - Percentages: `100%`
  - Other units: `em`, `rem`, `vw`
- Border radius syntax: `top-left|top-right|bottom-right|bottom-left`
- Box shadow presets (preset1, preset2, preset3) have predefined blur, spread, and offset values
- Lightbox functionality requires a lightbox library (Divi uses its own)
- Image alignment only works if `image_max_width` is less than 100%
- Fourth most common module (67 instances) - moderate volume
- Often appears in galleries or hero sections
- Responsive variants (\_tablet, \_phone) allow different sizing on different devices
- Consider creating image optimization strategy during conversion
- Links should be validated to ensure no broken references
- Lazy loading should be considered for performance optimization
- Images should have descriptive alt text that explains content, not just filename
