# Gutenberg Block: core/column

## Overview

The Column block is an individual **vertical container within a Columns layout**. It holds content blocks and maintains a specific width relative to its parent Columns block. Each column can have its own background, padding, and styling while inheriting layout properties from the parent Columns block.

**DIVI Equivalent:** `et_pb_column`

**Use Cases:**
- Content container within multi-column layouts
- Setting specific column widths (25%, 33%, 50%, 66%, 75%)
- Applying background color to individual columns
- Adding padding/spacing to column content

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `width` | string | "auto" | Column width (%, em, or auto) | `"33.33%"` |
| `backgroundColor` | string | empty | Background color | `"white"` |
| `anchor` | string | empty | HTML ID anchor | `"column-sidebar"` |
| `className` | string | empty | Custom CSS classes | `"highlighted"` |
| `spacing` | object | empty | Padding settings | `{"padding":{"top":"20px",...}}` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `type="1_3"` | `width="33.33%"` | Convert DIVI fractions to percentages |
| `type="2_3"` | `width="66.67%"` | 2/3 of container width |
| `background_color="#fff"` | `backgroundColor="white"` | Direct mapping |
| `background_image="url"` | CSS background via custom class | Apply to block styling |
| `custom_padding="20px\|..."` | `spacing.padding` object | Parse DIVI format |
| `custom_margin="20px\|..."` | CSS margin property | Use custom CSS class |
| `module_class="custom"` | `className="custom"` | Preserve class names |
| `module_id="id-name"` | `anchor="id-name"` | For HTML anchoring |

## Block Markup Example

### Single Column with Width

```html
<!-- wp:column {"width":"33.33%"} -->
<div class="wp-block-column" style="flex-basis: 33.33%;">
  <!-- wp:paragraph -->
  <p>Column content</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
```

### Column with Background and Padding

```html
<!-- wp:column {
  "width":"50%",
  "backgroundColor":"light-gray",
  "spacing":{"padding":{"top":"20px","right":"20px","bottom":"20px","left":"20px"}}
} -->
<div class="wp-block-column has-light-gray-background-color"
     style="flex-basis: 50%; padding: 20px;">
  <!-- Content -->
</div>
<!-- /wp:column -->
```

### Column with Custom Class

```html
<!-- wp:column {
  "width":"66.67%",
  "className":"main-content highlighted"
} -->
<div class="wp-block-column main-content highlighted" style="flex-basis: 66.67%;">
  <!-- Content -->
</div>
<!-- /wp:column -->
```

## Conversion Complexity

**Rating:** MEDIUM (Low independently, Medium in context of layout)

### What's Easy
- Width fractions to percentages
- Background colors
- Padding/margins
- Custom CSS classes
- Anchor IDs

### What's Hard
- Percentage calculations (must do math correctly)
- Responsive width changes (no _tablet/_phone equivalents)
- Complex nested layouts
- Specialty column arrangements

### What's Missing
- **Specialty Columns** - Complex nested layouts aren't supported
- **Width Variants** - Can't change widths per breakpoint
- **Background Videos** - Not supported on columns
- **Equal Height Management** - Handled at parent Columns level

## Column Width Reference

| DIVI Type | Percentage | Flex-basis |
|-----------|-----------|-----------|
| `4_4` | 100% | 100% |
| `1_2` | 50% | 50% |
| `1_3` | 33.33% | 33.33% |
| `2_3` | 66.67% | 66.67% |
| `1_4` | 25% | 25% |
| `3_4` | 75% | 75% |
| `1_5` | 20% | 20% |
| `2_5` | 40% | 40% |
| `3_5` | 60% | 60% |
| `4_5` | 80% | 80% |
| `1_6` | 16.67% | 16.67% |

## Real-World Conversion Examples

### Example 1: Standard Column in Three-Column Row (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_column type="1_3" _builder_version="4.16"]
  [et_pb_text _builder_version="4.16"]
    <h3>Feature Title</h3>
    <p>Feature description goes here.</p>
  [/et_pb_text]
[/et_pb_column]
```

**Gutenberg Conversion:**
```html
<!-- wp:column {"width":"33.33%"} -->
<div class="wp-block-column" style="flex-basis: 33.33%;">
  <!-- wp:heading {"level":3} -->
  <h3>Feature Title</h3>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>Feature description goes here.</p>
  <!-- /wp:paragraph -->
</div>
<!-- /wp:column -->
```

### Example 2: Sidebar Column with Background (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_column type="1_3" _builder_version="4.16"
  background_color="#f5f5f5"
  custom_padding="20px|20px|20px|20px|false|false"
  module_class="sidebar"
  admin_label="Sidebar"]

  [et_pb_text _builder_version="4.16"]
    <h3>Sidebar</h3>
    <p>Navigation or extra content.</p>
  [/et_pb_text]

[/et_pb_column]
```

**Gutenberg Conversion:**
```html
<!-- wp:column {
  "width":"33.33%",
  "backgroundColor":"light-gray",
  "spacing":{"padding":{"top":"20px","right":"20px","bottom":"20px","left":"20px"}},
  "className":"sidebar"
} -->
<div class="wp-block-column has-light-gray-background-color sidebar"
     style="flex-basis: 33.33%; padding: 20px;">

  <!-- wp:heading {"level":3} -->
  <h3>Sidebar</h3>
  <!-- /wp:heading -->

  <!-- wp:paragraph -->
  <p>Navigation or extra content.</p>
  <!-- /wp:paragraph -->

</div>
<!-- /wp:column -->
```

## Implementation Guide

### Step 1: Determine Width

Convert DIVI column type to percentage:
- `1_3` = 33.33%
- `2_3` = 66.67%
- `1_2` = 50%
- etc.

### Step 2: Create Column Structure

Within Gutenberg Columns block:
1. Columns are automatically created based on parent `columns` setting
2. Each column block is created automatically
3. Set individual widths if using unequal layout

### Step 3: Set Column Width

1. Click on column block
2. In settings, look for "Width" or "Column Width"
3. Enter percentage value (e.g., `33.33%`)

### Step 4: Add Background (Optional)

1. In column settings, find "Background Color"
2. Select color matching original `background_color`

### Step 5: Add Padding (Optional)

1. In column settings, find "Spacing"
2. Set padding values (top, right, bottom, left)
3. Match original `custom_padding` values

### Step 6: Apply Custom Classes

1. In column settings, find "Advanced"
2. Add custom classes from original `module_class`

### Step 7: Add Content Blocks

1. Click inside column
2. Add paragraph, image, or other content blocks
3. Maintain same content and order as DIVI

## CSS Customization

### Equal Height Columns (at parent level)
```css
.wp-block-columns {
  align-items: stretch; /* Handled by verticalAlignment="stretch" */
}
```

### Responsive Column Stacking (at parent level)
```css
@media (max-width: 768px) {
  .wp-block-columns {
    flex-direction: column;
  }

  .wp-block-column {
    flex-basis: 100% !important;
    width: 100% !important;
  }
}
```

### Custom Column Margins
```css
.wp-block-column {
  margin: 0 10px; /* Add spacing between columns */
}

.wp-block-column:first-child {
  margin-left: 0;
}

.wp-block-column:last-child {
  margin-right: 0;
}
```

## Troubleshooting

### Q: Column width showing as 100% when it should be 33%
**A:** Ensure parent Columns block has `columns` set correctly and isn't forcing full width. Check parent `align` setting.

### Q: Columns stacking on desktop when shouldn't
**A:** Verify parent Columns block has `isStackedOnMobile=true` (not always true). May need CSS override.

### Q: Background color not displaying
**A:** Ensure you're using color slug (e.g., "light-gray") or valid hex. Check theme color palette.

### Q: Content overflowing column
**A:** Check that content blocks are responsive. Images should not exceed 100% width. Use CSS if needed.

### Q: Padding not applying correctly
**A:** Ensure spacing object is properly formatted: `{"padding":{"top":"20px",...}}`. Use theme spacing unit system.

## Comparison Table

| Feature | DIVI | Gutenberg | Notes |
|---------|------|-----------|-------|
| Column Width | Fraction notation | Percentage | Must convert 1/3 to 33.33% |
| Background Color | Yes | Yes | Direct mapping |
| Padding | Detailed syntax | Object format | Parse pipe format |
| Margin | Yes | Limited | Use custom CSS |
| Custom Classes | Yes | Yes | Preserved |
| Anchor ID | Yes | Yes | Preserved |
| Specialty Layouts | Yes | No | Flatten to standard columns |
| Responsive Widths | _tablet, _phone | Not built-in | Use CSS media queries |

## Recommendations

1. **Use Consistent Widths** - Stick to standard fractions (1/2, 1/3, 2/3, 1/4, 3/4)
2. **Preserve Classes** - Don't lose original custom CSS classes
3. **Test Responsiveness** - Ensure columns stack properly on mobile
4. **Document Conversions** - Note original DIVI types for reference
5. **Use Theme Spacing** - Apply spacing values using theme's unit system (rem, em)

## Related Blocks

- **[core/columns](core_columns.md)** - Parent container for columns
- **[core/group](core_group.md)** - Alternative container for single-column layouts
- **[core/paragraph](core_paragraph.md)** - Text content in columns
- **[core/image](core_image.md)** - Images in columns

## Further Reading

- [WordPress Column Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/column/)
- [CSS Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Width & Sizing in CSS](https://developer.mozilla.org/en-US/docs/Web/CSS/width)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation with conversion reference
**Instances in Current Site:** 1,203 DIVI columns
**Conversion Priority:** CRITICAL - Highest volume element
