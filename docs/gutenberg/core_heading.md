# Gutenberg Block: core/heading

## Overview

The Heading block creates **semantic heading elements** (h1, h2, h3, h4, h5, h6) with typography control. It's used for page titles, section headers, and content organization. Unlike paragraphs, headings have semantic meaning for SEO and accessibility.

**DIVI Equivalent:** Part of `et_pb_text` module (heading content within text blocks)

**Use Cases:**
- Page titles (h1)
- Section headings (h2, h3)
- Subsection titles
- Content hierarchy and structure

## Block Attributes

| Attribute | Type | Default | Description | Example |
|-----------|------|---------|-------------|---------|
| `level` | number | 2 | Heading level (1-6, corresponding to h1-h6) | `2` |
| `content` | HTML | empty | Heading text content | `"Section Title"` |
| `fontSize` | string | empty | Font size (small, medium, large, custom) | `"large"` |
| `textColor` | string | empty | Text color (color slug or hex) | `"white"` |
| `backgroundColor` | string | empty | Background color | `"dark-gray"` |
| `align` | string | "left" | Text alignment (left, center, right, justify) | `"center"` |
| `className` | string | empty | Custom CSS classes | `"page-title"` |

## Mapping from DIVI

| DIVI Parameter | Gutenberg Attribute | Conversion Notes |
|---|---|---|
| `<h1>`, `<h2>`, etc. in text | `level=1`, `level=2` | Extract heading level from HTML |
| `header_font_size="38px"` | `fontSize="large"` or CSS | Map to theme sizes |
| `header_text_color="#fff"` | `textColor="white"` | Map to theme colors |
| Header alignment in text | `align="center"` | Direct mapping |
| `custom_padding="20px\|..."` | CSS padding | Use custom class |
| `module_class="custom"` | `className="custom"` | Preserve classes |

## Block Markup Example

### Simple Heading Level 2

```html
<!-- wp:heading {"level":2} -->
<h2>Section Title</h2>
<!-- /wp:heading -->
```

### Heading with Styling

```html
<!-- wp:heading {
  "level":2,
  "fontSize":"large",
  "textColor":"white",
  "align":"center"
} -->
<h2 class="has-large-font-size has-white-color has-text-align-center">
  Centered White Heading
</h2>
<!-- /wp:heading -->
```

### Heading with Custom Class

```html
<!-- wp:heading {
  "level":1,
  "className":"page-title highlight"
} -->
<h1 class="page-title highlight">
  Page Title
</h1>
<!-- /wp:heading -->
```

## Conversion Complexity

**Rating:** LOW

### What's Easy
- HTML heading extraction
- Heading level selection
- Text color mapping
- Text alignment
- Custom classes

### What's Hard
- Font size mapping
- Advanced styling (shadows, effects)
- Spacing control
- Custom font families

## Real-World Conversion Examples

### Example 1: Page Title (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_text _builder_version="4.16"
  header_text_color="#ffffff"
  header_font_size="48px"
  text_text_align="center"]

  <h1>Example Site</h1>

[/et_pb_text]
```

**Gutenberg Conversion:**
```html
<!-- wp:heading {
  "level":1,
  "fontSize":"x-large",
  "textColor":"white",
  "align":"center"
} -->
<h1 class="has-x-large-font-size has-white-color has-text-align-center">
  Example Site
</h1>
<!-- /wp:heading -->
```

### Example 2: Section Heading (DIVI → Gutenberg)

**DIVI Source:**
```
[et_pb_text _builder_version="4.16"
  header_text_color="#2c3e50"
  header_font_size="32px"]

  <h2>About Our School</h2>

[/et_pb_text]
```

**Gutenberg Conversion:**
```html
<!-- wp:heading {
  "level":2,
  "fontSize":"large",
  "textColor":"dark-gray"
} -->
<h2 class="has-large-font-size has-dark-gray-color">
  About Our School
</h2>
<!-- /wp:heading -->
```

## Heading Level Best Practices

### Semantic HTML

Use proper heading hierarchy for accessibility and SEO:

- **h1** - Page main title (only one per page)
- **h2** - Major section headings
- **h3** - Subsection headings
- **h4** - Sub-subsection headings
- **h5+** - Deep nesting (rare)

### Don't Skip Levels

**Bad:** h1 → h3 (skips h2)
**Good:** h1 → h2 → h3 (proper hierarchy)

## Font Size Reference

### Heading Sizes by Level

| Level | Typical Size | Gutenberg Preset | CSS Default |
|-------|-------------|-----------------|-----------|
| h1 | 32-48px | `x-large` | 2em |
| h2 | 24-32px | `large` | 1.5em |
| h3 | 20-24px | `medium` | 1.17em |
| h4 | 18-20px | `small` | 1.1em |
| h5 | 14-18px | `small` | 1em |
| h6 | 12-16px | `x-small` | 0.83em |

## Implementation Guide

### Step 1: Add Heading Block

In Gutenberg:
1. Click "+" to add block
2. Search for "Heading"
3. Insert block

### Step 2: Set Heading Level

1. Click block
2. In toolbar, find level selector (H2, H3, etc.)
3. Choose appropriate level

### Step 3: Enter Heading Text

1. Type heading text
2. Format with bold/italic if needed

### Step 4: Set Text Color (Optional)

1. Select text or click block
2. In right sidebar, find "Text Color"
3. Choose from palette

### Step 5: Set Alignment (Optional)

1. Click block
2. In toolbar, click alignment button
3. Choose Left, Center, Right, or Justify

### Step 6: Apply Custom Classes (Optional)

1. In right sidebar, find "Advanced"
2. Add custom CSS classes
3. Define styling in theme CSS

## Troubleshooting

### Q: Heading not showing
**A:** Ensure text is entered in the block. Verify heading level is set.

### Q: Text color not applying
**A:** Verify color exists in theme palette. Use hex code as fallback.

### Q: Heading too large/small
**A:** Use font size dropdown to adjust. Or use custom CSS for exact size.

### Q: Heading alignment not working
**A:** Click block, use alignment buttons in toolbar. Verify theme supports alignment.

### Q: SEO issues with heading hierarchy
**A:** Follow proper semantic hierarchy (h1 only once per page, h2 before h3, etc.).

## CSS Customization

### Custom Heading Styling
```css
h2.page-section-title {
  font-size: 28px;
  color: #2c3e50;
  margin-bottom: 20px;
  padding-bottom: 10px;
  border-bottom: 2px solid #f0d118;
}
```

### Responsive Heading Sizes
```css
h1 {
  font-size: 48px;
}

@media (max-width: 768px) {
  h1 {
    font-size: 36px;
  }
}

@media (max-width: 480px) {
  h1 {
    font-size: 24px;
  }
}
```

## Comparison Table

| Feature | DIVI | Gutenberg | Notes |
|---------|------|-----------|-------|
| Heading Levels (h1-h6) | Yes (in HTML) | Yes (level attribute) | Direct mapping |
| Text Color | Yes | Yes | Theme colors or hex |
| Font Size | Yes | Limited | Theme presets |
| Text Alignment | Yes | Yes | Left, center, right, justify |
| Custom Classes | Yes | Yes | Preserved |
| Semantic HTML | Yes (if correct) | Yes (enforced) | Better enforcement |

## Recommendations

1. **Use One h1 per Page** - Better for SEO and accessibility
2. **Follow Hierarchy** - Don't skip heading levels
3. **Use Consistent Sizes** - All h2s should be similar size
4. **Apply Color Intentionally** - Use color to highlight importance
5. **Keep Text Concise** - Headings should be brief and descriptive

## Related Blocks

- **[core/paragraph](core_paragraph.md)** - Body text
- **[core/list](core_list.md)** - Bulleted/numbered lists
- **[core/quote](core_quote.md)** - Block quotes
- **[core/group](core_group.md)** - Container for headings and content

## Further Reading

- [WordPress Heading Block Docs](https://developer.wordpress.org/block-editor/reference-guides/core-blocks/heading/)
- [HTML Heading Elements](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/Heading_Elements)
- [SEO Best Practices](https://developer.wordpress.org/plugins/semantic-markup/the-basics/)

---

**Last Updated:** November 20, 2025
**Status:** Comprehensive documentation
**Instances in Current Site:** Part of 891 DIVI text blocks
**Conversion Priority:** CRITICAL - Essential for content structure
