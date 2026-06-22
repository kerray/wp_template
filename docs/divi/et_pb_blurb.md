# DIVI Shortcode: et_pb_blurb

## Overview

The Blurb module combines an **icon or image with a title and description text**. It's commonly used for feature boxes, service highlights, testimonials, and team member cards. Each blurb can display either an icon (from a font library) or an image at the top or side.

## Hierarchy

- **Parent:** `et_pb_column`
- **Children:** None (self-contained module)
- **Usage context:** Creating styled content boxes with icons/images and text

## Parameters

### Content Parameters

| Parameter          | Type   | Default | Description                      | Example                              |
| ------------------ | ------ | ------- | -------------------------------- | ------------------------------------ |
| `_builder_version` | string | "4.16"  | Divi builder version             | `_builder_version="4.16"`            |
| `title`            | text   | empty   | Blurb title text                 | `title="Mateřská škola"`             |
| `body`             | HTML   | empty   | Blurb description text           | `body="<p>Description here</p>"`     |
| `url`              | URL    | empty   | Link URL (standard parameter)    | `url="/materska-skola/"`             |
| `link_option_url`  | URL    | empty   | Link URL (alternative parameter) | `link_option_url="/materska-skola/"` |
| `url_new_window`   | yes/no | "off"   | Open link in new window          | `url_new_window="on"`                |

### Image/Icon Parameters

| Parameter        | Type   | Default   | Description                        | Example                                      |
| ---------------- | ------ | --------- | ---------------------------------- | -------------------------------------------- | --- | ---- | --- | ----- |
| `image`          | URL    | empty     | Image URL to display               | `image="/wp-content/uploads/2021/image.jpg"` |
| `image_alt`      | text   | empty     | Alternative text for image         | `image_alt="Mateřská škola"`                 |
| `use_icon`       | yes/no | "off"     | Use icon instead of image          | `use_icon="on"`                              |
| `font_icon`      | string | empty     | Icon name (from icon library)      | `font_icon="                                 |     | divi |     | 400"` |
| `icon_color`     | color  | "#2c3e50" | Icon color                         | `icon_color="#2c3e50"`                       |
| `icon_placement` | string | "top"     | Position of icon/image (top, left) | `icon_placement="top"`                       |

### Styling Parameters

| Parameter           | Type      | Default | Description                          | Example                       |
| ------------------- | --------- | ------- | ------------------------------------ | ----------------------------- |
| `background_color`  | color     | empty   | Blurb background color               | `background_color="#f5f5f5"`  |
| `background_layout` | string    | "light" | Text contrast (light, dark)          | `background_layout="light"`   |
| `text_orientation`  | string    | "left"  | Text alignment (left, center, right) | `text_orientation="center"`   |
| `text_text_color`   | color     | empty   | Body text color                      | `text_text_color="#333333"`   |
| `text_font_size`    | dimension | "14px"  | Body font size                       | `text_font_size="15px"`       |
| `header_text_color` | color     | empty   | Title text color                     | `header_text_color="#2c3e50"` |
| `header_font_size`  | dimension | "18px"  | Title font size                      | `header_font_size="20px"`     |

### Spacing Parameters

| Parameter        | Type      | Default | Description    | Example               |
| ---------------- | --------- | ------- | -------------- | --------------------- | ---- | ---- | ---- | ----- | ------- |
| `custom_padding` | dimension | empty   | Custom padding | `custom_padding="20px | 20px | 20px | 20px | false | false"` |
| `custom_margin`  | dimension | empty   | Custom margin  | `custom_margin="      |      | 10px |      | "`    |

### Advanced Parameters

| Parameter      | Type   | Default | Description | Example                                |
| -------------- | ------ | ------- | ----------- | -------------------------------------- |
| `module_id`    | string | empty   | CSS ID      | `module_id="blurb-school"`             |
| `module_class` | string | empty   | CSS classes | `module_class="feature-box highlight"` |

## Real Usage Examples

### Example 1: Feature Blurb with Image (Three-Column Layout)

```
[et_pb_blurb title="Mateřská škola"
  image="/wp-content/uploads/2021/08/p1010409.jpg"
  url="/materska-skola/"
  url_new_window="off"
  _builder_version="4.16"
  text_orientation="center"
  background_layout="light"]

  [/et_pb_blurb]
```

### Example 2: Service Box with Icon

```
[et_pb_blurb title="Individuální Přístup"
  use_icon="on"
  font_icon="||divi||400"
  icon_color="#f0d118"
  url="/about/"
  _builder_version="4.16"
  text_orientation="center"
  background_color="#ffffff"
  text_text_color="#333333"
  header_text_color="#2c3e50"
  header_font_size="22px"
  custom_padding="20px|20px|20px|20px|false|false"]

  <p>Každý student dostává péči přizpůsobenou jeho individuálním potřebám.</p>

[/et_pb_blurb]
```

### Example 3: Team Member Card with Image

```
[et_pb_blurb title="Mgr. Jan Novotný"
  body="<p><em>Vedoucí pedagogického týmu</em></p>"
  image="/wp-content/uploads/2021/team/novotny.jpg"
  image_alt="Mgr. Jan Novotný"
  _builder_version="4.16"
  text_orientation="center"
  background_color="#f9f9f9"
  custom_padding="20px|20px|20px|20px|false|false"
  module_class="team-card"]

[/et_pb_blurb]
```

### Example 4: Highlighted Feature Box

```
[et_pb_blurb title="Kvalitní Vzdělání"
  body="<p>Naš program kombinuje tradiční akademickou výuku s praktickými dovednostmi.</p>"
  use_icon="on"
  font_icon="||divi||400"
  icon_color="#2c3e50"
  url="/program/"
  _builder_version="4.16"
  text_orientation="left"
  background_color="#fffef0"
  text_text_color="#444444"
  header_text_color="#2c3e50"
  header_font_size="24px"
  custom_padding="30px|30px|30px|30px|false|false"
  module_class="featured-box highlight"]

[/et_pb_blurb]
```

### Example 5: Left-Aligned Blurb with Image

```
[et_pb_blurb title="Přírodní Prostředí"
  body="<p>Našich studentů se učí v moderních a přátelských prostorách.</p>"
  image="/wp-content/uploads/2021/08/classroom.jpg"
  icon_placement="left"
  _builder_version="4.16"
  text_orientation="left"
  background_layout="light"
  text_text_color="#555555"
  custom_padding="15px|15px|15px|15px|false|false"]

[/et_pb_blurb]
```

## Conversion Complexity

**Rating:** MEDIUM

**Reasoning:**

- Can map to Gutenberg group block with image + heading + paragraph combination
- Or use custom block if icon support is needed
- Icon font libraries may need to be resolved (Divi uses specific icon set)
- Image handling is straightforward
- Link wrapping adds complexity
- Text and background styling require CSS mapping
- Layout options (icon placement) need proper CSS handling
- Common pattern but moderately complex implementation

## Notes

- **Icon Parameter Format:** Font icons use format `||font-name||weight` (e.g., `||divi||400`)
  - Default Divi uses its own icon library
  - Font names include: `divi` (native), `etmodules` (ET modules)
  - Weight typically: `400` (regular), `700` (bold)
- Either `image` **or** `use_icon="on"` is used, not both
- If `url` or `link_option_url` is set, the entire blurb becomes clickable (both parameters work identically)
- `text_orientation` affects alignment of title and body text
- `background_layout` is deprecated but still present - affects text color contrast
- Icon placement (top/left) affects CSS layout:
  - `top`: Icon/image displays above text
  - `left`: Icon/image displays to the left of text
- `image_alt` should always be present for accessibility
- Second most common content module (156 instances) - important for conversion accuracy
- Many blurbs are used in three-column layouts for feature showcases
- Icons may not convert easily - icon font or image replacement may be needed
- Link target (`url_new_window`) should be preserved for user experience
- Can be easily recreated with Gutenberg's native columns + image + text combination
- Consider creating a custom "Feature Box" block for better compatibility
