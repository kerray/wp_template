# DIVI to Gutenberg Conversion Matrix

## Complete Parameter Mapping Reference

This document provides detailed side-by-side mapping of all DIVI parameters to their Gutenberg block equivalents.

---

## STRUCTURAL BLOCKS

### et_pb_section → core/group

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `background_color="#fff"` | `backgroundColor="white"` | Color slug or hex | Theme dependent |
| `background_image="url"` | `backgroundImage` object | Media library ID | Requires upload to library |
| `background_size="cover"` | CSS `background-size: cover;` | CSS property | Apply via custom class |
| `background_position="center"` | CSS `background-position: center;` | CSS property | Apply via custom class |
| `background_repeat="no-repeat"` | CSS `background-repeat: no-repeat;` | CSS property | Apply via custom class |
| `background_video="url"` | Custom HTML block | Not native | Complex workaround needed |
| `parallax="on"` | CSS `background-attachment: fixed;` | CSS property | Simulate parallax effect |
| `parallax_method="on"` | CSS `background-attachment: fixed;` | CSS property | Same as parallax |
| `top_divider_style="wave"` | CSS `::before` + SVG | Not native | Use divider plugin or SVG CSS |
| `top_divider_color="#fff"` | SVG fill color | CSS property | Modify SVG path fill |
| `top_divider_height="18px"` | CSS `height: 18px;` | CSS property | Set in custom CSS |
| `bottom_divider_style="wave"` | CSS `::after` + SVG | Not native | Use divider plugin or SVG CSS |
| `bottom_divider_color="#fff"` | SVG fill color | CSS property | Modify SVG path fill |
| `bottom_divider_height="32px"` | CSS `height: 32px;` | CSS property | Set in custom CSS |
| `custom_padding="20\|30\|20\|30"` | `spacing.padding` object | Parse and convert | `{top:"20px", right:"30px", bottom:"20px", left:"30px"}` |
| `custom_padding_tablet="20\|..."` | CSS media query | Responsive | Use `@media (max-width: 768px)` |
| `custom_padding_phone="20\|..."` | CSS media query | Responsive | Use `@media (max-width: 480px)` |
| `custom_margin="\|20\|\|"` | `spacing.margin` object | Parse and convert | Convert from DIVI pipe format |
| `inner_shadow="on"` | CSS `box-shadow: inset` | CSS property | Rarely used |
| `make_equal="on"` | Parent `verticalAlignment="stretch"` | Layout property | On parent columns block |
| `text_text_color="#333"` | Apply to child blocks | Text color on children | Not on group itself |
| `text_text_shadow_style="preset3"` | CSS `text-shadow` | CSS property | Apply to text blocks inside |
| `text_text_shadow_color="#000"` | CSS `text-shadow` color | CSS property | Set shadow color |
| `module_id="section-name"` | `anchor="section-name"` | HTML ID | Gutenberg uses "anchor" |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved for CSS |
| `admin_label="Label"` | Not displayed | Builder only | Doesn't affect frontend |
| `fb_built="1"` | Not used | Metadata | DIVI builder flag, ignore |
| `_builder_version="4.16"` | Not used | Metadata | DIVI version, ignore |
| `global_colors_info="{}"` | Not used | Metadata | DIVI color system, not needed |

---

### et_pb_row → core/columns

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `column_structure="1_3,1_3,1_3"` | `columns=3` + child widths | Count + widths | Must add width to each column |
| `column_structure="1_2,1_2"` | `columns=2` | Count | Two equal columns |
| `column_structure="1_3,2_3"` | `columns=2` + widths | Count + widths | First 33%, second 66% |
| `gutter_width="2"` | `spacing.blockGap="1rem"` | Spacing | Convert scale to em/rem |
| `gutter_width="3"` | `spacing.blockGap="1.5rem"` | Spacing | Default DIVI gutter |
| `gutter_width="4"` | `spacing.blockGap="2rem"` | Spacing | Larger gutter |
| `use_custom_gutter="on"` | `spacing.blockGap` | Spacing | Enable gap control |
| `make_equal="on"` | `verticalAlignment="stretch"` | Layout | Flex stretch for equal heights |
| `module_alignment="center"` | CSS `justify-content: center;` | Flexbox | Use custom class |
| `background_color="#fff"` | Group wrapper background | Container | Apply to parent group |
| `background_image="url"` | Group wrapper background | Container | Apply to parent group |
| `custom_padding="20\|..."` | `spacing.padding` object | Spacing | On group wrapper |
| `custom_margin="20\|..."` | `spacing.margin` object | Spacing | On group wrapper |
| `module_id="row-name"` | `anchor="row-name"` | HTML ID | In group wrapper |
| `module_class="custom"` | `className="custom"` | Custom classes | On columns block |

---

### et_pb_column → core/column

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `type="1_3"` | `width="33.33%"` | Width | Convert fraction to % |
| `type="2_3"` | `width="66.67%"` | Width | Two-thirds |
| `type="1_2"` | `width="50%"` | Width | Half width |
| `type="1_4"` | `width="25%"` | Width | Quarter width |
| `type="3_4"` | `width="75%"` | Width | Three-quarter width |
| `type="1_5"` | `width="20%"` | Width | Fifth width |
| `type="4_4"` | `width="100%"` | Width | Full width (single column) |
| `background_color="#fff"` | `backgroundColor="white"` | Color | Direct mapping |
| `background_image="url"` | CSS background | CSS | Use custom class |
| `background_size="cover"` | CSS `background-size: cover;` | CSS | Use custom class |
| `background_position="center"` | CSS `background-position: center;` | CSS | Use custom class |
| `background_repeat="no-repeat"` | CSS `background-repeat: no-repeat;` | CSS | Use custom class |
| `custom_padding="20\|30\|..."` | `spacing.padding` object | Spacing | Parse DIVI format |
| `custom_margin="20\|30\|..."` | `spacing.margin` object | Spacing | Parse DIVI format |
| `module_id="col-name"` | `anchor="col-name"` | HTML ID | HTML anchor |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved |
| `admin_label="Label"` | Not displayed | Builder only | Ignore |

---

## CONTENT BLOCKS

### et_pb_text → core/paragraph + core/heading

#### Body Text (Paragraph)

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| Body text content | Paragraph block content | Direct copy | Preserve HTML exactly |
| `text_font_size="16px"` | CSS `font-size` | CSS or block attribute | Use theme preset or custom CSS |
| `text_text_color="#333"` | `textColor="dark-gray"` | Color | Theme slug or hex |
| `text_line_height="1.7em"` | CSS `line-height` | CSS | Use custom class |
| `text_text_align="center"` | `align="center"` | Alignment | Left, center, right, justify |
| `text_text_shadow_style="preset3"` | CSS `text-shadow` | CSS | Use custom class |
| `custom_padding="20\|..."` | CSS padding | CSS | Use custom class |
| `custom_margin="20\|..."` | CSS margin | CSS | Use custom class |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved |

#### Heading Text (Heading Block)

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `<h1>`, `<h2>`, etc. | `level=1`, `level=2` | Heading level | Extract from HTML |
| `header_font_size="32px"` | `fontSize="large"` | Block attribute | Use theme presets |
| `header_text_color="#fff"` | `textColor="white"` | Color | Theme slug or hex |
| `header_letter_spacing="1px"` | CSS `letter-spacing` | CSS | Use custom class |
| Heading in text alignment | `align="center"` | Alignment | Direct mapping |

---

### et_pb_image → core/image

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `src="url"` | `url` or `id` | Image URL or media ID | Prefer media library ID |
| `alt="text"` | `alt="text"` | Alt text | Critical for accessibility |
| `title_text="text"` | `title="text"` | Image title | Hover tooltip |
| `url="/link"` | `href="/link"` | Link destination | Direct mapping |
| `url_new_window="on"` | `linkTarget="_blank"` | Link target | Open in new tab |
| `show_in_lightbox="on"` | WordPress lightbox or plugin | Lightbox | Native or plugin required |
| `image_max_width="500px"` | `width=500` | Width | Pixel value |
| `image_max_width_tablet="400px"` | CSS media query | Responsive | Use `@media` |
| `image_max_width_phone="100%"` | CSS media query | Responsive | Use `@media` |
| `image_height="auto"` | Auto or `height` attribute | Height | Usually auto |
| `border_radii="5px\|5px\|5px\|5px"` | CSS `border-radius` | CSS | Use custom class |
| `box_shadow_style="preset1"` | CSS `box-shadow` | CSS | Use custom class |
| `box_shadow_color="rgba(...)"` | CSS `box-shadow` color | CSS | Use custom class |
| `image_alignment="center"` | `align="center"` | Alignment | Direct mapping |
| `custom_margin="20\|..."` | CSS margin | CSS | Use custom class |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved |

---

### et_pb_button → core/buttons + core/button

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `button_text="..."` | Button `text` | Direct copy | Button label |
| `button_url="..."` | Button `url` | Direct copy | Link destination |
| `url_new_window="on"` | `linkTarget="_blank"` | Link target | Open in new tab |
| `button_text_color="#fff"` | `textColor="white"` | Color | Theme slug or hex |
| `button_text_color_hover="#f0d"` | CSS `:hover` state | CSS | Use custom class |
| `button_bg_color="#2c3e50"` | `backgroundColor="dark-gray"` | Color | Theme slug or hex |
| `button_bg_color_hover="#1a"` | CSS `:hover` state | CSS | Use custom class |
| `button_border_color="#..."` | CSS `border-color` | CSS | Use custom class |
| `button_border_color_hover="#..."` | CSS `:hover` state | CSS | Use custom class |
| `button_text_size="18px"` | CSS `font-size` | CSS | Use custom class |
| `button_text_size_tablet="16px"` | CSS media query | Responsive | Use `@media` |
| `button_text_size_phone="14px"` | CSS media query | Responsive | Use `@media` |
| `button_font="Montserrat\|700"` | CSS `font-family` | CSS | Use custom class |
| `button_letter_spacing="1px"` | CSS `letter-spacing` | CSS | Use custom class |
| `button_padding="15\|40\|..."` | CSS `padding` | CSS | Use custom class |
| `button_border_radius="3px"` | CSS `border-radius` | CSS | Use custom class |
| `button_border_width="2px"` | CSS `border-width` | CSS | Use custom class |
| `button_alignment="center"` | Parent `layout` alignment | Container | Align buttons block |
| `custom_margin="20\|..."` | CSS margin | CSS | Use custom class |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved |

---

### et_pb_blurb → core/media-text or core/group

#### With Image (Use media-text)

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `image="url"` | `mediaUrl` or `mediaId` | Media | Use media library ID |
| `image_alt="text"` | Image alt text | Alt text | Critical for accessibility |
| `title="text"` | Heading block inside | Title | Use h3 or h4 |
| `body="<p>..."` | Paragraph block inside | Body text | Direct content |
| `url="/link"` | Link on title or button | Link | Can't wrap entire box |
| `url_new_window="on"` | Link target="_blank"` | Link target | On linked element |
| `icon_placement="top"` | `mediaPosition="top"` | Placement | Top, left, or right |
| `icon_placement="left"` | `mediaPosition="left"` | Placement | Default |
| `background_color="#f5f5f5"` | `backgroundColor="light-gray"` | Color | Theme or hex |
| `text_orientation="center"` | Text block alignment | Alignment | Apply to text blocks |
| `text_text_color="#333"` | Text block color | Color | Apply to paragraphs |
| `header_text_color="#2c3e50"` | Heading block color | Color | Apply to heading |
| `custom_padding="20\|..."` | CSS padding | CSS | Use custom class |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved |

#### With Icon (No Direct Equivalent)

For icon-based blurbs, use alternatives:
- **Image Icon** - Replace with small PNG/SVG
- **Unicode Symbol** - Use Unicode symbol in text
- **Icon Plugin** - Use Advanced Blocks, GenerateBlocks, etc.
- **Group Block** - Create custom layout with group + text

---

### et_pb_blog → core/query

| DIVI Parameter | Gutenberg Equivalent | Mapping Type | Notes |
|---|---|---|---|
| `posts_number="10"` | `query.perPage=10` | Per page limit | Direct mapping |
| `include_categories="1,2,3"` | `query.taxQuery.category=[1,2,3]` | Category filter | Convert to array |
| `exclude_categories="4,5"` | Exclude in query | Category exclude | Use exclude syntax |
| `post_type="post"` | `query.postType="post"` | Post type | Direct mapping |
| `orderby="date"` | `query.orderBy="date"` | Sort field | Date, title, rand, etc. |
| `order="DESC"` | `query.order="desc"` | Sort direction | desc or asc |
| `fullwidth="off"` | `displayLayout.type="grid"` | Layout mode | Grid or list |
| `columns="3"` | `displayLayout.columns=3` | Grid columns | Number of columns |
| `show_pagination="on"` | Query Pagination block | Pagination | Include in template |
| `show_featured_image="on"` | Post Featured Image block | Template | Add to post template |
| `show_title="on"` | Post Title block | Template | Add to post template |
| `show_excerpt="on"` | Post Excerpt block | Template | Add to post template |
| `show_meta="on"` | Post metadata blocks | Template | Add individual blocks |
| `show_author="on"` | Post Author Name block | Template | Add to post template |
| `show_date="on"` | Post Date block | Template | Add to post template |
| `show_comments="off"` | Post Comment Count block | Template | Add if needed |
| `excerpt_length="270"` | Post Excerpt settings | Block attribute | Limited control |
| `background_layout="light"` | CSS text color | Color contrast | Apply to template |
| `text_text_color="#333"` | CSS text color | Color | Use custom class |
| `custom_padding="20\|..."` | CSS padding | CSS | Use custom class |
| `module_class="custom"` | `className="custom"` | Custom classes | Preserved |

---

### et_pb_tabs + et_pb_tab → No Native Equivalent

**Status:** NO GUTENBERG NATIVE BLOCK

**Solutions:**
1. **Plugin Block** - Advanced Blocks, Kadence, CoBlocks
2. **Custom Block** - Develop custom Gutenberg block
3. **Accordion Alternative** - Use accordion pattern instead
4. **Custom HTML** - Write HTML + JavaScript solution

See [TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md) for detailed solutions.

---

## COLOR MAPPING GUIDE

### Standard Color Conversions

| DIVI Color | Theme Slug | Hex Value |
|-----------|-----------|-----------|
| Black | `black` | `#000000` |
| White | `white` | `#ffffff` |
| Dark Gray | `dark-gray` | `#333333` |
| Medium Gray | `medium-gray` | `#666666` |
| Light Gray | `light-gray` | `#f5f5f5` |
| Dark Blue | `dark-blue` or custom | `#2c3e50` |
| Yellow | `yellow` | `#f0d118` |
| Green | `green` | `#27ae60` |

**Method:** Use theme color slugs if available; fall back to hex codes.

---

## RESPONSIVE DESIGN MAPPING

### DIVI Responsive Suffixes → CSS Media Queries

| DIVI Suffix | Screen Size | CSS Media Query | Example |
|---|---|---|---|
| (none) | Desktop | `(min-width: 1025px)` | Base value |
| `_tablet` | Tablet | `(max-width: 1024px)` and `(min-width: 768px)` | Different value |
| `_phone` | Mobile | `(max-width: 767px)` | Different value |

**Mapping Example:**
```
DIVI:
  button_text_size="18px"
  button_text_size_tablet="16px"
  button_text_size_phone="14px"

Gutenberg CSS:
  .wp-block-button__link {
    font-size: 18px; /* Desktop */
  }

  @media (max-width: 1024px) {
    .wp-block-button__link {
      font-size: 16px; /* Tablet */
    }
  }

  @media (max-width: 767px) {
    .wp-block-button__link {
      font-size: 14px; /* Mobile */
    }
  }
```

---

## PADDING/MARGIN FORMAT CONVERSION

### DIVI Pipe-Separated Format

DIVI uses: `"top|right|bottom|left|on_mobile|important"`

Example: `"20px|30px|20px|30px|false|false"`

### Gutenberg Object Format

Gutenberg uses: `{"top":"20px", "right":"30px", "bottom":"20px", "left":"30px"}`

### Conversion Process

1. **Parse DIVI string** - Split by pipes: `[20px, 30px, 20px, 30px, false, false]`
2. **Assign to sides** - Map to: top, right, bottom, left
3. **Create object** - `{"top":"20px", "right":"30px", "bottom":"20px", "left":"30px"}`
4. **Ignore suffixes** - 5th and 6th values (on_mobile, important) not used in Gutenberg

---

## QUICK CONVERSION LOOKUP

### By DIVI Shortcode

Use this table to quickly find Gutenberg equivalent:

| DIVI Shortcode | Gutenberg Block(s) | File | Complexity |
|---|---|---|---|
| `et_pb_section` | `core/group` | [core_group.md](core_group.md) | MEDIUM |
| `et_pb_row` | `core/columns` | [core_columns.md](core_columns.md) | MEDIUM |
| `et_pb_row_inner` | `core/columns` (nested) | [core_columns.md](core_columns.md) | MEDIUM |
| `et_pb_column` | `core/column` | [core_column.md](core_column.md) | MEDIUM |
| `et_pb_text` | `core/paragraph` + `core/heading` | [core_paragraph.md](core_paragraph.md) [core_heading.md](core_heading.md) | LOW |
| `et_pb_image` | `core/image` | [core_image.md](core_image.md) | LOW |
| `et_pb_button` | `core/buttons` + `core/button` | [core_buttons.md](core_buttons.md) | LOW |
| `et_pb_blurb` | `core/media-text` or `core/group` | [core_media_text.md](core_media_text.md) | MEDIUM |
| `et_pb_blog` | `core/query` | [core_query.md](core_query.md) | HIGH |
| `et_pb_tabs` | **(NO EQUIVALENT)** | [TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md) | HIGH |
| `et_pb_tab` | **(NO EQUIVALENT)** | [TABS_ALTERNATIVES.md](TABS_ALTERNATIVES.md) | HIGH |

---

## CONVERSION TIPS & SHORTCUTS

### When Converting Padding

Pattern: `custom_padding="top|right|bottom|left|responsive|important"`

Quick conversion:
- Extract four numbers
- Create object: `{top, right, bottom, left}`
- Ignore 5th and 6th values

### When Converting Colors

Pattern: `color_parameter="#hexcode"` or `color_parameter="color_name"`

Quick conversion:
- Check theme palette for matching color slug
- If not found, use hex code directly
- Ensure contrast for accessibility

### When Converting Responsive Values

Pattern: `parameter="value"` + `parameter_tablet="value2"` + `parameter_phone="value3"`

Quick conversion:
- Base value for desktop (no suffix)
- Write CSS media query for tablet
- Write CSS media query for mobile

### When Converting Widths/Fractions

Pattern: `type="numerator_denominator"` (e.g., `1_3`, `2_3`)

Quick conversion:
- Calculate percentage: numerator ÷ denominator × 100
- 1_3 = 1÷3 × 100 = 33.33%
- 2_3 = 2÷3 × 100 = 66.67%

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive conversion reference
**Coverage:** All major DIVI modules and parameters
