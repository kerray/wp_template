---
name: gutenberg-block-converter
description: Converts analyzed DIVI shortcodes to Gutenberg block JSON format. Use when you have DIVI shortcode attributes and need to generate equivalent Gutenberg blocks with proper formatting and attributes.
---

# Gutenberg Block Converter

## Instructions

When converting DIVI shortcodes to Gutenberg blocks, follow this systematic approach:

### 1. Reference Documentation

Always reference the comprehensive documentation in:
- `./docs/divi/` - DIVI shortcode parameters
- `./docs/gutenberg/` - Gutenberg block equivalents
- `./docs/gutenberg/CONVERSION_MATRIX.md` - Parameter mapping reference

### 2. Gutenberg Block Structure

All Gutenberg blocks follow this JSON format:
```json
{
  "blockName": "core/column",
  "attrs": {
    "width": "50%",
    "className": "custom-class"
  },
  "innerBlocks": [],
  "innerHTML": "<div>Content</div>",
  "innerContent": ["<div>Content</div>"]
}
```

### 3. Core Conversions

**DIVI Section → Gutenberg Group Block**
```
DIVI: [et_pb_section]...[/et_pb_section]
Gutenberg: <!-- wp:group {...} -->...<!-- /wp:group -->
```

**DIVI Row → Gutenberg Columns**
```
DIVI: [et_pb_row column_structure="1_3,1_3,1_3"]...[/et_pb_row]
Gutenberg: <!-- wp:columns -->...<!-- /wp:columns -->
```

**DIVI Column → Gutenberg Column**
```
DIVI: [et_pb_column type="1_3"]...[/et_pb_column]
Gutenberg: <!-- wp:column {"width":"33.33%"} -->...<!-- /wp:column -->
```

**DIVI Text → Gutenberg Paragraph**
```
DIVI: [et_pb_text]Content[/et_pb_text]
Gutenberg: <!-- wp:paragraph -->Content<!-- /wp:paragraph -->
```

**DIVI Button → Gutenberg Button**
```
DIVI: [et_pb_button button_text="Click" button_url="#"]
Gutenberg: <!-- wp:buttons -->
  <!-- wp:button -->
    <a href="#">Click</a>
  <!-- /wp:button -->
<!-- /wp:buttons -->
```

**DIVI Image → Gutenberg Image**
```
DIVI: [et_pb_image src="image.jpg"]
Gutenberg: <!-- wp:image {"id":123} -->
  <figure class="wp-block-image"><img src="image.jpg" alt=""/></figure>
<!-- /wp:image -->
```

**DIVI Blurb → Gutenberg Media & Text**
```
DIVI: [et_pb_blurb title="Title" image="icon.png"]Content[/et_pb_blurb]
Gutenberg: <!-- wp:media-text {"mediaUrl":"icon.png"} -->
  <div class="wp-block-media-text">
    <h3>Title</h3>
    <p>Content</p>
  </div>
<!-- /wp:media-text -->
```

**DIVI Blog → Gutenberg Query Loop**
```
DIVI: [et_pb_blog posts_number="5" include_categories="4"]
Gutenberg: <!-- wp:query {"queryId":1,"query":{"perPage":5,"categories":["4"]}} -->
  <!-- wp:post-template -->
    <!-- wp:post-title /-->
    <!-- wp:post-excerpt /-->
  <!-- /wp:post-template -->
<!-- /wp:query -->
```

**DIVI Tabs → Plugin Required**
```
DIVI: [et_pb_tabs]...[/et_pb_tabs]
Gutenberg: No native equivalent - use Kadence Blocks or similar plugin
```

### 4. Attribute Mapping Reference

| DIVI Attribute | Gutenberg Equivalent | Notes |
|---|---|---|
| `admin_label` | N/A | DIVI editor metadata, ignore |
| `text_orientation` | `textAlign` | left, center, right, justify |
| `font_size` | `fontSize` | numeric value or named size (small, medium, large) |
| `text_color` | `textColor` | color value or theme color slug |
| `background_color` | `backgroundColor` | color value or theme color slug |
| `custom_padding` | `style.spacing.padding` | Convert to CSS spacing object |
| `custom_margin` | `style.spacing.margin` | Convert to CSS spacing object |
| `module_class` | `className` | CSS classes string |
| `width` | `width` | Column width as percentage |
| `module_id` | `anchor` | Unique ID for linking |
| `background_image` | `style.background.backgroundImage` | URL to image |
| `use_background_color_gradient` | `gradient` | Convert to Gutenberg gradient format |
| `button_url` | `url` | Link URL |
| `button_text` | Inner content | Text inside button block |

### 5. Column Width Mapping

DIVI uses fraction notation, Gutenberg uses percentages:

| DIVI `type` | Gutenberg `width` | Notes |
|---|---|---|
| `4_4` | `100%` | Full width |
| `1_2` | `50%` | Half width |
| `1_3` | `33.33%` | One third |
| `2_3` | `66.66%` | Two thirds |
| `1_4` | `25%` | One quarter |
| `3_4` | `75%` | Three quarters |
| `1_5` | `20%` | One fifth |
| `2_5` | `40%` | Two fifths |
| `3_5` | `60%` | Three fifths |
| `4_5` | `80%` | Four fifths |
| `1_6` | `16.66%` | One sixth |
| `5_6` | `83.33%` | Five sixths |

### 6. Conversion Output Format

When providing conversions, structure as:

**DIVI Source:**
```
[original shortcode with attributes]
```

**Gutenberg Block (HTML Comment Syntax):**
```html
<!-- wp:blocktype {"attrs"} -->
Content
<!-- /wp:blocktype -->
```

**Additional CSS Required:** (if applicable)
```css
.custom-class {
  /* CSS for features not supported by Gutenberg */
}
```

### 7. Nested Block Handling

For complex DIVI structures with multiple nesting levels:
1. Convert parent containers first (sections → groups)
2. Convert rows to columns blocks
3. Place content blocks inside column inner blocks
4. Preserve nesting relationships exactly

Example nested conversion:
```
DIVI:
[et_pb_section]
  [et_pb_row]
    [et_pb_column type="1_2"]
      [et_pb_text]Left content[/et_pb_text]
    [/et_pb_column]
    [et_pb_column type="1_2"]
      [et_pb_text]Right content[/et_pb_text]
    [/et_pb_column]
  [/et_pb_row]
[/et_pb_section]

Gutenberg:
<!-- wp:group -->
  <!-- wp:columns -->
    <!-- wp:column {"width":"50%"} -->
      <!-- wp:paragraph -->
      <p>Left content</p>
      <!-- /wp:paragraph -->
    <!-- /wp:column -->
    <!-- wp:column {"width":"50%"} -->
      <!-- wp:paragraph -->
      <p>Right content</p>
      <!-- /wp:paragraph -->
    <!-- /wp:column -->
  <!-- /wp:columns -->
<!-- /wp:group -->
```

### 8. Custom CSS Migration

When DIVI features aren't available in Gutenberg:
- Extract `module_class` values
- Create corresponding CSS in theme stylesheet
- Document any responsive CSS (tablet/mobile breakpoints)
- Flag CSS that requires JavaScript for functionality

Example:
```css
/* DIVI custom_padding="14px|0px|44px|0px" */
.custom-section-padding {
  padding: 14px 0px 44px 0px;
}

/* DIVI text_text_shadow_style="preset3" */
.custom-text-shadow {
  text-shadow: 0px 0px 10px rgba(0,0,0,0.3);
}
```

### 9. Responsive Handling

DIVI responsive attributes → Gutenberg CSS media queries:

```
DIVI:
font_size="24px"
font_size_tablet="20px"
font_size_phone="16px"

Gutenberg + Custom CSS:
<!-- wp:paragraph {"className":"custom-responsive-text"} -->

.custom-responsive-text {
  font-size: 24px;
}
@media (max-width: 980px) {
  .custom-responsive-text {
    font-size: 20px;
  }
}
@media (max-width: 767px) {
  .custom-responsive-text {
    font-size: 16px;
  }
}
```

### 10. Special Cases

**Custom Shortcodes Inside DIVI Blocks**
```
DIVI:
[et_pb_text]
  <p>[akce category="" pocet="5" wrapper="ol"]</p>
[/et_pb_text]

Gutenberg:
<!-- wp:paragraph -->
<p>[akce category="" pocet="5" wrapper="ol"]</p>
<!-- /wp:paragraph -->

Note: Custom shortcodes like [akce] work in Gutenberg - preserve them exactly
```

**Background Images**
```
DIVI: background_image="http://example.com/image.jpg"

Gutenberg:
<!-- wp:group {"style":{"background":{"backgroundImage":{"url":"http://example.com/image.jpg"}}}} -->
```

**Gradients**
```
DIVI:
use_background_color_gradient="on"
background_color_gradient_start="#2b87da"
background_color_gradient_end="#29c4a9"

Gutenberg:
<!-- wp:group {"gradient":"vivid-cyan-blue-to-vivid-purple"} -->
Or create custom gradient in theme.json
```

## Common Issues

- **Color formats**: Convert DIVI hex colors to Gutenberg theme color slugs when available
- **Responsive widths**: DIVI uses `|` separators; Gutenberg uses responsive attributes or custom CSS
- **Icon libraries**: Check if icons need FontAwesome or built-in block icons - may need plugin
- **Custom JavaScript**: Flag functionality that requires additional JavaScript
- **Tabs**: No native Gutenberg equivalent - recommend Kadence Blocks plugin

## Tools and Resources

- Gutenberg block reference: https://developer.wordpress.org/block-editor/
- Block attributes documentation: https://developer.wordpress.org/block-editor/reference-guides/block-api/block-attributes/
- Project documentation: `./docs/gutenberg/README.md`
- Conversion matrix: `./docs/gutenberg/CONVERSION_MATRIX.md`
- Tabs alternatives: `./docs/gutenberg/TABS_ALTERNATIVES.md`
