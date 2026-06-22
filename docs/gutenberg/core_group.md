# Gutenberg Block: core/group

## Overview

The Group block is a flexible **container for grouping and organizing multiple blocks** into a cohesive layout section. It serves as the foundational structural element in Gutenberg, replacing DIVI's Section module. Groups can have their own background colors, images, padding, and alignment properties that apply to all contained blocks.

**DIVI Equivalent:** `et_pb_section`

**Use Cases:**
- Full-width page sections with distinct styling
- Colored background areas
- Content containers with custom padding/margins
- Grouped content with shared background treatment

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `backgroundColor` | string | empty | Background color (color slug or hex) | `"white"` or `"#ffffff"` |
| `backgroundImage` | object | empty | Background image properties | `{"id":123,"url":"...","alt":"..."}` |
| `gradient` | string | empty | CSS gradient (simplified support) | `"linear-gradient(135deg, #000, #fff)"` |
| `width` | string | "full" | Width setting (full, wide, content-width) | `"wide"` |
| `layout` | object | empty | Layout settings (flex, alignment, gap) | `{"type":"flex","direction":"row","gap":"2rem"}` |
| `align` | string | "full" | Block alignment (full, wide, default) | `"full"` |
| `spacing` | object | empty | Padding and margin settings | `{"padding":{"top":"20px",...}}` |
| `className` | string | empty | Custom CSS classes | `"custom-section highlight"` |
| `anchor` | string | empty | HTML anchor/ID | `"section-header"` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `background_color="#fff"` | `backgroundColor="white"` | Use color slugs if theme supports, or hex codes |
| `background_image="url"` | `backgroundImage` object | Attach image via media library, not URL string |
| `parallax="on"` | CSS `background-attachment: fixed;` | No native support; use custom CSS |
| `background_video="url"` | Custom CSS + `<video>` element | No native support; requires HTML override |
| `custom_padding="20px\|...\|..."` | `spacing.padding` object | Parse DIVI format to individual sides |
| `custom_margin="\|20px\|\|..."` | `spacing.margin` object | Parse DIVI format to individual sides |
| `top_divider_style="wave"` | CSS `::before` or `::after` with SVG | Use CSS custom properties or SVG backgrounds |
| `bottom_divider_style="wave"` | CSS `::after` with SVG | Requires custom CSS implementation |
| `text_text_color="#333"` | Use inherited color from child blocks | Apply color to child blocks instead |
| `module_class="custom"` | `className="custom"` | Preserve custom class names |
| `module_id="id-name"` | `anchor="id-name"` | Gutenberg uses anchor for HTML ID |

## Block Markup Example

### Simple Group with Background Color

```html
<!-- wp:group {"backgroundColor":"white"} -->
<div class="wp-block-group has-white-background-color">
  <!-- wp:paragraph -->
  <p>Group content goes here</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

### Group with Custom Spacing

```html
<!-- wp:group {"spacing":{"padding":{"top":"40px","right":"60px","bottom":"40px","left":"60px"}}} -->
<div class="wp-block-group" style="padding: 40px 60px;">
  <!-- wp:paragraph -->
  <p>Content with custom padding</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

### Full-Width Group with Layout

```html
<!-- wp:group {
  "align":"full",
  "backgroundColor":"light-gray",
  "layout":{"type":"flex","direction":"row","wrap":true,"gap":"2rem"}
} -->
<div class="wp-block-group alignfull has-light-gray-background-color">
  <!-- wp:column -->
  <div class="wp-block-column">...</div>
  <!-- /wp:column -->
  <!-- wp:column -->
  <div class="wp-block-column">...</div>
  <!-- /wp:column -->
</div>
<!-- /wp:group -->
```

### Group with Custom CSS Class and Anchor

```html
<!-- wp:group {
  "className":"custom-section highlight",
  "anchor":"section-features"
} -->
<div class="wp-block-group custom-section highlight" id="section-features">
  <!-- Content blocks -->
</div>
<!-- /wp:group -->
```

## Conversion Complexity

**Rating:** MEDIUM

### What's Easy
- Basic container functionality
- Background colors (direct mapping)
- Padding/margin properties
- Custom CSS class preservation
- Anchor IDs for linking

### What's Hard
- Background images (must use media library, not URL strings)
- Parallax effects (no native support; requires custom CSS)
- Video backgrounds (no native support; complex workaround needed)
- Wave/zigzag dividers (requires SVG or plugin)
- Text shadow and effects (apply to child blocks instead)
- Responsive padding variants (_tablet, _phone suffixes)

### What's Missing from DIVI
- **Background Videos** - Would require custom code and HTML override
- **Parallax Scrolling** - Can simulate with `background-attachment: fixed;`
- **Wave/Zigzag Dividers** - Requires SVG-based CSS or divider plugin
- **Global Colors Integration** - Gutenberg uses simpler color system
- **Inner Shadow** - Rarely used; can use box-shadow in custom CSS

## Real-World Conversion Examples

### Example 1: Simple Hero Section (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_section background_image="http://example.com/hero.jpg"
  custom_padding="60px|0px|60px|0px|false|false"
  background_color="#f5f5f5"
  _builder_version="4.16"]

  [et_pb_row _builder_version="4.16"]
    [et_pb_column type="4_4" _builder_version="4.16"]
      [et_pb_text header_text_color="#ffffff" _builder_version="4.16"]
        <h1>Welcome</h1>
      [/et_pb_text]
    [/et_pb_column]
  [/et_pb_row]

[/et_pb_section]
```

**Gutenberg Conversion:**
```html
<!-- wp:group {
  "backgroundColor":"light-gray",
  "spacing":{"padding":{"top":"60px","right":"0","bottom":"60px","left":"0"}}
} -->
<div class="wp-block-group has-light-gray-background-color"
     style="background-image: url('http://example.com/hero.jpg');
             background-size: cover;
             background-position: center;
             padding: 60px 0;">

  <!-- wp:heading {"textColor":"white"} -->
  <h1 class="has-white-color">Welcome</h1>
  <!-- /wp:heading -->

</div>
<!-- /wp:group -->
```

**Conversion Notes:**
- Background image moved to inline style (alternative: use CSS class)
- Padding converted from DIVI pipe-format to object notation
- Text color applied to heading block instead of container
- No div wrapper for row/column (flattened structure)

### Example 2: Section with Divider (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_section background_color="#ffffff"
  bottom_divider_style="wave"
  bottom_divider_color="#f0d118"
  bottom_divider_height="32px"
  _builder_version="4.16"]

  [et_pb_row][et_pb_column type="4_4"]
    [et_pb_text]Content[/et_pb_text]
  [/et_pb_column][/et_pb_row]

[/et_pb_section]
```

**Gutenberg Conversion:**

Option A - Using CSS custom property:
```html
<!-- wp:group {
  "backgroundColor":"white",
  "className":"has-wave-divider-bottom"
} -->
<div class="wp-block-group has-white-background-color has-wave-divider-bottom">
  <!-- wp:paragraph -->
  <p>Content here</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
```

**CSS (in theme style.css):**
```css
.has-wave-divider-bottom::after {
  content: '';
  display: block;
  height: 32px;
  background-image: url('data:image/svg+xml;utf8,...wave-svg...');
  background-repeat: repeat-x;
  background-color: #f0d118;
}
```

Option B - Using plugin block (recommended):
- Install "Wave Divider" plugin or use GenerateBlocks
- Add divider block after group

## Implementation Guide

### Step 1: Identify Section in DIVI

Locate the `[et_pb_section]` shortcode and note all parameters:
```
background_color, background_image, custom_padding, custom_margin,
top_divider_style, bottom_divider_style, module_class, module_id
```

### Step 2: Create Group Block

In Gutenberg editor:
1. Click "+" to add block
2. Search for "Group"
3. Insert the block

### Step 3: Configure Attributes

#### Background Color
- Click block settings (right sidebar)
- Find "Background Color"
- Select or enter color value

#### Padding
- In block settings, click "Spacing"
- Set individual padding values (top, right, bottom, left)
- Use px, em, or rem units

#### Custom Classes
- In block settings, find "Advanced" section
- Add Custom CSS Classes
- Paste original `module_class` value

#### Anchor/ID
- In block settings, find "Advanced" section
- Set HTML Anchor to original `module_id` value

### Step 4: Handle Advanced Features

For parallax or wave dividers:
1. Create custom CSS class
2. Add CSS rules to theme stylesheet
3. Assign class to group block

### Step 5: Test

Verify:
- [ ] Background color displays correctly
- [ ] Padding matches original spacing
- [ ] Content flows properly inside group
- [ ] Custom CSS classes apply
- [ ] Responsive behavior works
- [ ] Mobile padding maintained (use media queries)

## CSS Custom Properties for Advanced Features

### Parallax Background
```css
.has-parallax-bg {
  background-attachment: fixed;
  background-size: cover;
  background-position: center;
}
```

### Wave Divider Bottom
```css
.has-wave-divider {
  position: relative;
  padding-bottom: 40px;
}

.has-wave-divider::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 40px;
  background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 100"><path d="M0,50 Q250,0 500,50 T1000,50 L1000,100 L0,100 Z" fill="%23f0d118"/></svg>');
  background-size: cover;
}
```

### Responsive Padding
```css
.wp-block-group {
  padding: 60px 60px 60px 60px; /* Desktop */
}

@media (max-width: 768px) {
  .wp-block-group {
    padding: 40px 30px 40px 30px; /* Tablet */
  }
}

@media (max-width: 480px) {
  .wp-block-group {
    padding: 20px 20px 20px 20px; /* Mobile */
  }
}
```

## Comparison Table

| Feature | DIVI | Gutenberg | Workaround |
|---------|------|-----------|-----------|
| Background Color | Yes | Yes | Direct mapping |
| Background Image | Yes | Yes (media lib only) | Use CSS background URL |
| Video Background | Yes | No | Custom HTML block |
| Parallax Effect | Yes | No | CSS background-attachment |
| Wave Divider | Yes | No | SVG CSS or plugin |
| Padding Control | Detailed | Good | Use spacing UI |
| Margin Control | Yes | Yes | Use spacing UI |
| Custom Classes | Yes | Yes | Advanced settings |
| HTML Anchor | Yes | Yes | Anchor setting |
| Inner Shadow | Yes | No | Rarely needed |

## Troubleshooting

### Q: Background image not showing
**A:** Ensure image is from WordPress media library, not external URL string. In block settings, use "Media Upload" interface.

### Q: Padding not displaying correctly on mobile
**A:** Use CSS media queries for responsive padding. Gutenberg doesn't have native _tablet/_phone suffixes.

### Q: Wave divider not showing
**A:** Install a divider block plugin or implement custom SVG-based CSS. See CSS Custom Properties section above.

### Q: Group container too wide
**A:** Adjust `align` attribute: `"default"` for content-width, `"wide"` for wider container, `"full"` for full-width.

### Q: Text color showing incorrectly
**A:** Apply color to child blocks (paragraph, heading) instead of group container. Groups don't directly style text.

## Recommendations

1. **Use for Main Layout** - Groups are essential for section structure. Use liberally.
2. **Layer Responsibly** - Don't nest groups unnecessarily; keep markup clean.
3. **Use CSS Classes** - For complex styling, preserve original `module_class` values.
4. **Test Background Images** - Ensure images load correctly from media library.
5. **Plan Dividers** - For wave/zigzag dividers, pre-plan plugin or CSS solution.
6. **Document Custom CSS** - If using custom CSS for effects, document in theme CSS file.

## Related Blocks

- **[core/columns](core_columns.md)** - Multi-column layouts inside groups
- **[core/column](core_column.md)** - Individual columns
- **[core/paragraph](core_paragraph.md)** - Text content inside groups
- **[core/heading](core_heading.md)** - Headings inside groups

## Further Reading

- [WordPress Group Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/group/)
- [CSS Background Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/background)
- [Flexbox Layout Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation with conversion examples
**Instances in Current Site:** 485 DIVI sections
**Conversion Priority:** CRITICAL - Foundation of all layouts
