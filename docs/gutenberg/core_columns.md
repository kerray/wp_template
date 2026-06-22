# Gutenberg Block: core/columns

## Overview

The Columns block creates a **flexible multi-column layout system** with equal or custom widths. It replaces DIVI's Row module by providing a responsive, CSS Grid/Flexbox-based layout that automatically adapts to different screen sizes. Each column can contain any block type and maintains its width proportionally.

**DIVI Equivalent:** `et_pb_row`

**Use Cases:**
- Multi-column content layouts (2, 3, 4+ columns)
- Side-by-side image and text arrangements
- Feature boxes in grid layouts
- Responsive layouts that adapt to mobile

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `columns` | number | 2 | Number of columns in layout | `3` |
| `verticalAlignment` | string | "top" | Vertical alignment (top, center, bottom, space-between, stretch) | `"center"` |
| `isStackedOnMobile` | boolean | true | Stack columns on mobile devices | `true` |
| `layout` | object | empty | Advanced layout settings (flex, grid) | `{"type":"flex","gap":"2rem"}` |
| `spacing` | object | empty | Padding and gap between columns | `{"blockGap":"2rem"}` |
| `className` | string | empty | Custom CSS classes | `"feature-row highlight"` |
| `align` | string | "full" | Block alignment (full, wide) | `"full"` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `column_structure="1_3,1_3,1_3"` | Use `core/column` blocks with `width` | Gutenberg uses nested column blocks, not a structure string |
| `gutter_width="2"` | `spacing.blockGap` | Convert DIVI gutter scale to em/rem units |
| `make_equal="on"` | `verticalAlignment="stretch"` | Flex stretch equalizes column heights |
| `module_alignment="center"` | CSS flexbox `justify-content` | Use custom class or inline style |
| `background_color="#fff"` | `backgroundColor` on parent group | Apply to wrapping group instead |
| `custom_padding="20px\|..."` | `spacing.padding` on group wrapper | Apply padding to parent group |
| `module_class="custom"` | `className="custom"` | Preserve custom class names |

## Block Markup Example

### Simple Three-Column Layout

```html
<!-- wp:columns {"columns":3} -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph -->
    <p>Column 1 content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph -->
    <p>Column 2 content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:paragraph -->
    <p>Column 3 content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

### Two-Column with Equal Heights and Gap

```html
<!-- wp:columns {
  "columns":2,
  "verticalAlignment":"stretch",
  "spacing":{"blockGap":"2rem"}
} -->
<div class="wp-block-columns">
  <!-- wp:column -->
  <div class="wp-block-column">
    <p>Left column content</p>
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <p>Right column content</p>
  </div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

### Responsive Columns (Stacking)

```html
<!-- wp:columns {
  "columns":3,
  "isStackedOnMobile":true,
  "spacing":{"blockGap":"1.5rem"}
} -->
<div class="wp-block-columns is-responsive">
  <!-- wp:column -->
  <div class="wp-block-column">Column 1</div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">Column 2</div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">Column 3</div>
  <!-- /wp:column -->
</div>
<!-- /wp:columns -->
```

## Conversion Complexity

**Rating:** MEDIUM

### What's Easy
- Basic column layout structure
- Number of columns
- Vertical alignment (top, center, bottom)
- Gap/spacing between columns
- Mobile stacking behavior
- Custom CSS classes

### What's Hard
- Unequal column widths (requires child `core/column` width attributes)
- DIVI's `column_structure` notation (must convert fractions to percentages)
- Custom gutter width values (DIVI scale 1-4 to em/rem conversion)
- Responsive column counts (_tablet, _phone variants not directly supported)
- Background images on rows (apply to parent group instead)

### What's Missing from DIVI
- **Specialty Layouts** - Complex nested columns would need restructuring
- **Responsive Column Changes** - Can't change number of columns per breakpoint
- **Background on Rows** - Must use parent group instead
- **Inner Spacing Control** - Limited compared to DIVI padding options

## Real-World Conversion Examples

### Example 1: Three-Column Feature Layout (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_row column_structure="1_3,1_3,1_3"
  _builder_version="4.16"
  make_equal="on"
  custom_padding="0|0px|0|0px|false|false"]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_blurb title="Feature 1" _builder_version="4.16"][/et_pb_blurb]
  [/et_pb_column]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_blurb title="Feature 2" _builder_version="4.16"][/et_pb_blurb]
  [/et_pb_column]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_blurb title="Feature 3" _builder_version="4.16"][/et_pb_blurb]
  [/et_pb_column]

[/et_pb_row]
```

**Gutenberg Conversion:**
```html
<!-- wp:columns {
  "columns":3,
  "verticalAlignment":"stretch"
} -->
<div class="wp-block-columns">

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:media-text {"mediaPosition":"top"} -->
    <div class="wp-block-media-text">
      <!-- Feature box content -->
    </div>
    <!-- /wp:media-text -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:media-text {"mediaPosition":"top"} -->
    <div class="wp-block-media-text">
      <!-- Feature box content -->
    </div>
    <!-- /wp:media-text -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column -->
  <div class="wp-block-column">
    <!-- wp:media-text {"mediaPosition":"top"} -->
    <div class="wp-block-media-text">
      <!-- Feature box content -->
    </div>
    <!-- /wp:media-text -->
  </div>
  <!-- /wp:column -->

</div>
<!-- /wp:columns -->
```

**Conversion Notes:**
- `column_structure="1_3,1_3,1_3"` → `columns=3`
- `make_equal="on"` → `verticalAlignment="stretch"`
- Each column automatically gets 33.33% width
- Content blocks move directly into each column
- No separate row/column wrapper markup needed

### Example 2: Two-Column with Sidebar (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_row column_structure="1_3,2_3"
  _builder_version="4.16"
  use_custom_gutter="on"
  gutter_width="2"]

  [et_pb_column type="1_3" _builder_version="4.16"]
    [et_pb_text]Sidebar Content[/et_pb_text]
  [/et_pb_column]

  [et_pb_column type="2_3" _builder_version="4.16"]
    [et_pb_text]Main Content[/et_pb_text]
  [/et_pb_column]

[/et_pb_row]
```

**Gutenberg Conversion:**
```html
<!-- wp:columns {
  "columns":2,
  "spacing":{"blockGap":"1rem"}
} -->
<div class="wp-block-columns">

  <!-- wp:column {"width":"33.33%"} -->
  <div class="wp-block-column" style="flex-basis: 33.33%;">
    <!-- wp:paragraph -->
    <p>Sidebar Content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->

  <!-- wp:column {"width":"66.67%"} -->
  <div class="wp-block-column" style="flex-basis: 66.67%;">
    <!-- wp:paragraph -->
    <p>Main Content</p>
    <!-- /wp:paragraph -->
  </div>
  <!-- /wp:column -->

</div>
<!-- /wp:columns -->
```

**Conversion Notes:**
- `column_structure="1_3,2_3"` → Two columns with width attributes
- First column: 1/3 = 33.33%
- Second column: 2/3 = 66.67%
- `gutter_width="2"` → `blockGap="1rem"` (varies by theme)
- Each column width explicitly set in child column blocks

## Column Width Reference

### DIVI to Gutenberg Width Conversion

| DIVI Format | Fraction | Gutenberg % | CSS flex-basis |
|---|---|---|---|
| `1_2` | 1/2 | 50% | 50% |
| `1_3` | 1/3 | 33.33% | 33.33% |
| `2_3` | 2/3 | 66.67% | 66.67% |
| `1_4` | 1/4 | 25% | 25% |
| `3_4` | 3/4 | 75% | 75% |
| `1_5` | 1/5 | 20% | 20% |
| `2_5` | 2/5 | 40% | 40% |
| `3_5` | 3/5 | 60% | 60% |
| `4_5` | 4/5 | 80% | 80% |
| `1_6` | 1/6 | 16.67% | 16.67% |

## Gutter Width Mapping

**DIVI Scale:**
- 1 = ~5px
- 2 = ~10px (smaller gap)
- 3 = ~15px (default)
- 4 = ~20px (larger gap)

**Gutenberg Equivalent:**
- Small: `0.5rem` (8px)
- Medium: `1rem` (16px)
- Large: `1.5rem` (24px)
- Extra Large: `2rem` (32px)

## Implementation Guide

### Step 1: Identify Row in DIVI
Note the `column_structure` value and gutter settings.

### Step 2: Create Columns Block

In Gutenberg:
1. Click "+" to add block
2. Search for "Columns"
3. Select desired number of columns

### Step 3: Configure Column Widths

For unequal widths:
1. Click on the Columns block
2. In settings, don't use presets
3. Click on each column
4. In column settings, set explicit width percentage

### Step 4: Set Gap/Spacing

1. Click Columns block
2. In settings, find "Spacing"
3. Set "Gap" value (in rem or em)
4. Reference gutter width mapping above

### Step 5: Add Content

1. Add blocks inside each column
2. Arrange content as needed
3. Each column container accepts any block type

### Step 6: Test Responsiveness

Verify:
- [ ] Columns display correctly on desktop
- [ ] Columns stack on mobile (if `isStackedOnMobile=true`)
- [ ] Gap spacing looks right
- [ ] Heights equalize if set to stretch

## CSS Custom Properties for Advanced Layouts

### Centered Columns
```css
.wp-block-columns {
  justify-content: center;
}
```

### Custom Gutter Sizes by Breakpoint
```css
.wp-block-columns {
  gap: 2rem; /* Desktop */
}

@media (max-width: 768px) {
  .wp-block-columns {
    gap: 1rem; /* Tablet */
  }
}

@media (max-width: 480px) {
  .wp-block-columns {
    gap: 0.5rem; /* Mobile */
  }
}
```

### Force Non-Stack Layout on Mobile
```css
.wp-block-columns.no-stack {
  flex-wrap: nowrap !important;
}
```

## Comparison Table

| Feature | DIVI | Gutenberg | Workaround |
|---------|------|-----------|-----------|
| Column Structure | String notation | Number + column widths | Use width attributes |
| Equal Heights | `make_equal="on"` | `verticalAlignment="stretch"` | Direct mapping |
| Gutter Width | Scale 1-4 | rem/em units | Use conversion table |
| Column Widths | Fractional | Percentages | Calculate fractions |
| Custom Classes | Yes | Yes | Preserved |
| Background on Row | Yes | No | Use parent group |
| Responsive Columns | _tablet, _phone | Built-in stacking | Limited control |

## Troubleshooting

### Q: Unequal column widths not working
**A:** Click on individual column blocks and set width percentage in their settings. Use flex-basis CSS property if needed.

### Q: Columns not stacking on mobile
**A:** Ensure `isStackedOnMobile=true` is set. Check theme CSS for `@media` query overrides.

### Q: Gap/gutter too large or small
**A:** Adjust `blockGap` in spacing settings. Reference gutter conversion table for DIVI equivalents.

### Q: Column heights not equal
**A:** Set `verticalAlignment="stretch"` to equalize heights using flexbox.

### Q: Content overflowing columns
**A:** Ensure child blocks are responsive. Images should have `image_max_width="100%"` or equivalent.

## Recommendations

1. **Use for Layouts** - Columns are essential for multi-column layouts. Use liberally.
2. **Preserve Width Ratios** - When converting unequal widths, calculate percentages carefully.
3. **Mind the Gap** - Use consistent gutter widths across similar layouts.
4. **Test Mobile** - Always test column stacking on mobile devices.
5. **Document Structure** - In conversion notes, record original column structure for reference.

## Related Blocks

- **[core/group](core_group.md)** - Wrapper for rows
- **[core/column](core_column.md)** - Individual column settings
- **[core/media-text](core_media_text.md)** - Image + text in columns
- **[core/paragraph](core_paragraph.md)** - Text in columns

## Further Reading

- [WordPress Columns Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/columns/)
- [CSS Grid & Flexbox Guide](https://css-tricks.com/snippets/css/a-guide-to-flexbox/)
- [Responsive Web Design](https://developer.mozilla.org/en-US/docs/Learn/CSS/CSS_layout/Responsive_Design)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation with conversion examples
**Instances in Current Site:** 712 DIVI rows
**Conversion Priority:** CRITICAL - Second most common layout element
